/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2026 The Unsandboxed Project
 */

/**
 * @fileoverview "Secret transformations": shaking an orphaned block mid-drag
 * cycles it to the next block type in a registered group, with a sparkle.
 */
'use strict';

goog.provide('Blockly.SecretTransformations');

goog.require('Blockly.BlockDragger');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.InsertionMarkerManager');
goog.require('Blockly.Xml');


// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Ordered lists of block types.  Shaking a block of any type in a group
 * cycles it forward to the next type (wrapping around).
 * @type {!Array<!Array<string>>}
 * @private
 */
Blockly.SecretTransformations.groups_ = [];

/**
 * Register a transformation group.
 * @param {!Array<string>} blockTypes Ordered array of block type strings.
 */
Blockly.SecretTransformations.addGroup = function(blockTypes) {
  Blockly.SecretTransformations.groups_.push(blockTypes.slice());
};

/**
 * Return the next block type in the group containing `type`, or null.
 * @param {string} type
 * @return {string|null}
 * @private
 */
Blockly.SecretTransformations.getNextType_ = function(type) {
  var groups = Blockly.SecretTransformations.groups_;
  for (var i = 0; i < groups.length; i++) {
    var g = groups[i];
    var idx = g.indexOf(type);
    if (idx !== -1) return g[(idx + 1) % g.length];
  }
  return null;
};

/**
 * True if `block` is "standalone": no parent connection and no non-shadow
 * descendants (only auto-generated shadow inputs are allowed).
 * @param {!Blockly.BlockSvg} block
 * @return {boolean}
 * @private
 */
Blockly.SecretTransformations.isStandalone_ = function(block) {
  if (block.previousConnection && block.previousConnection.isConnected()) {
    return false;
  }
  if (block.outputConnection && block.outputConnection.isConnected()) {
    return false;
  }
  var desc = block.getDescendants(false);
  for (var i = 0; i < desc.length; i++) {
    if (desc[i] !== block && !desc[i].isShadow()) return false;
  }
  return true;
};

// ─── Shake detection ─────────────────────────────────────────────────────────

/** Minimum x-movement (px) to count as a directional step. @const */
Blockly.SecretTransformations.SHAKE_MIN_MOVE_PX = 64;
/** Number of direction-reversals within the window to trigger a shake. @const */
Blockly.SecretTransformations.SHAKE_REVERSALS = 2;
/** Rolling time window (ms) for counting reversals. @const */
Blockly.SecretTransformations.SHAKE_WINDOW_MS = 200;
/** Max x-delta (px) considered "still" for unlocking. @const */
Blockly.SecretTransformations.SHAKE_STOP_MOVE_PX = 3;
/** Required still duration (ms) before unlocking another transform. @const */
Blockly.SecretTransformations.SHAKE_STOP_WINDOW_MS = 120;

/**
 * Create a new shake-detection tracker.
 * @return {{lastX: number, lastDir: number, times: !Array<number>}}
 */
Blockly.SecretTransformations.createShakeTracker = function() {
  return {
    lastX: 0,
    lastDir: 0,
    times: [],
    shakeLocked: false,
    quietStartMs: 0
  };
};

/**
 * Feed the latest drag delta into the tracker.
 * Returns true the moment a shake threshold is reached; the tracker then
 * resets so the NEXT shake can be detected (enabling repeated transforms).
 * @param {{lastX: number, lastDir: number, times: !Array<number>,
 *     shakeLocked: boolean, quietStartMs: number}} tracker
 * @param {{x: number, y: number}} deltaXY  Drag delta in pixels from origin.
 * @return {boolean}
 */
Blockly.SecretTransformations.updateShake = function(tracker, deltaXY) {
  var now = Date.now();
  var dx = deltaXY.x - tracker.lastX;

  // Once a transform fires, require the user to stop shaking before allowing
  // another transform.
  if (tracker.shakeLocked) {
    if (Math.abs(dx) <= Blockly.SecretTransformations.SHAKE_STOP_MOVE_PX) {
      if (!tracker.quietStartMs) {
        tracker.quietStartMs = now;
      }
      if (now - tracker.quietStartMs >=
          Blockly.SecretTransformations.SHAKE_STOP_WINDOW_MS) {
        tracker.shakeLocked = false;
        tracker.times = [];
        tracker.lastDir = 0;
      }
    } else {
      tracker.quietStartMs = 0;
    }

    tracker.lastX = deltaXY.x;
    return false;
  }

  if (Math.abs(dx) < Blockly.SecretTransformations.SHAKE_MIN_MOVE_PX) return false;

  var dir = dx > 0 ? 1 : -1;
  if (tracker.lastDir !== 0 && dir !== tracker.lastDir) {
    var cutoff = now - Blockly.SecretTransformations.SHAKE_WINDOW_MS;
    tracker.times.push(now);
    tracker.times = tracker.times.filter(function(t) { return t >= cutoff; });
    if (tracker.times.length >= Blockly.SecretTransformations.SHAKE_REVERSALS) {
      // Latch until shaking stops.
      tracker.shakeLocked = true;
      tracker.quietStartMs = 0;
      tracker.times = [];
      tracker.lastDir = 0;
      tracker.lastX = deltaXY.x;
      return true;
    }
  }

  tracker.lastDir = dir;
  tracker.lastX = deltaXY.x;
  return false;
};

// ─── Mid-drag block swap ──────────────────────────────────────────────────────

/**
 * Swap the block currently being dragged to the next type in its group,
 * keeping the drag alive on the new block.
 *
 * The dragger's internal state (draggingBlock_, startXY_,
 * draggedConnectionManager_, dragIconData_) is fully updated so subsequent
 * dragBlock / endBlockDrag calls work correctly on the new block.
 *
 * @param {!Blockly.BlockDragger} dragger  The active dragger instance.
 * @param {!goog.math.Coordinate} currentDragDeltaXY  Current pixel delta.
 * @return {Blockly.BlockSvg|null}  The new block, or null if not applicable.
 */
Blockly.SecretTransformations.transformBlockMidDrag_ = function(
    dragger, currentDragDeltaXY) {
  var block = dragger.draggingBlock_;
  if (!block || !block.workspace) return null;

  var nextType = Blockly.SecretTransformations.getNextType_(block.type);
  if (!nextType) return null;
  if (!Blockly.SecretTransformations.isStandalone_(block)) return null;

  var workspace = dragger.workspace_;

  // Current workspace-coordinate position of the dragged block.
  // pixelsToWorkspaceUnits_ is a private method but lives on the prototype.
  var wsUnit = dragger.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var currentWsPos = goog.math.Coordinate.sum(dragger.startXY_, wsUnit);

  // --- Step 1: create the replacement block (old block still alive) ---
  Blockly.Events.disable();
  var newBlock = null;
  try {
    var xml = Blockly.Xml.blockToDom(block);
    xml.setAttribute('type', nextType);
    xml.removeAttribute('x');
    xml.removeAttribute('y');
    newBlock = Blockly.Xml.domToBlock(xml, workspace);
    if (newBlock) {
      newBlock.moveBy(currentWsPos.x, currentWsPos.y);
      Blockly.SecretTransformations.attachDefaultShadows_(newBlock);
    }
  } catch (err) {
    // Creation failed; abort cleanly.
  } finally {
    Blockly.Events.enable();
  }

  if (!newBlock) return null;

  // Sparkle: ring at screen + confetti attached to new block's SVG root.
  Blockly.SecretTransformations.sparkleEffect_(workspace, currentWsPos, newBlock);

  // --- Step 2: swap connection manager (no null window) ---
  dragger.draggedConnectionManager_.dispose();
  dragger.draggedConnectionManager_ =
      new Blockly.InsertionMarkerManager(newBlock);

  // --- Step 3: dispose old block (clears drag surface) ---
  block.dispose(false, false);

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
  }

  // --- Step 4: re-establish drag on the new block ---
  dragger.draggingBlock_ = newBlock;
  // NOTE: startXY_ is intentionally NOT changed.  The cumulative pixel-delta
  // from the original mouse-down is still correct relative to the original
  // start position, so all subsequent moveDuringDrag / moveOffDragSurface_
  // calls produce the right workspace coordinates automatically.
  dragger.dragIconData_ = Blockly.BlockDragger.initIconData_(newBlock);

  newBlock.setDragging(true);
  newBlock.moveToDragSurface_();
  newBlock.select();

  return newBlock;
};

// ─── Sparkle animation ────────────────────────────────────────────────────────

/** @const @private */
Blockly.SecretTransformations.SPARKLE_COLORS_ = [
  '#FFD700', '#FF6B6B', '#4FC3F7', '#AED581', '#CE93D8', '#FFB347'
];

/**
 * Default shadow XML snippets keyed by block type and input name.
 * Category files register entries through addDefaultShadow().
 * @private {!Object<string, !Object<string, string>>}
 */
Blockly.SecretTransformations.defaultShadowXmlByBlock_ = {};

/**
 * Register default shadow XML for one block input.
 * @param {string} blockType
 * @param {string} inputName
 * @param {string} shadowXmlText  e.g. '<shadow type="math_number">...</shadow>'
 */
Blockly.SecretTransformations.addDefaultShadow = function(
    blockType, inputName, shadowXmlText) {
  var byBlock = Blockly.SecretTransformations.defaultShadowXmlByBlock_;
  if (!byBlock[blockType]) {
    byBlock[blockType] = {};
  }
  byBlock[blockType][inputName] = shadowXmlText;
};

/**
 * Attach configured default shadow blocks to empty inputs on a live block.
 * Shadows are created and connected explicitly, so they are guaranteed to be
 * parented/positioned with the dragged block.
 * @param {!Blockly.BlockSvg} block
 * @private
 */
Blockly.SecretTransformations.attachDefaultShadows_ = function(block) {
  var defaults = Blockly.SecretTransformations.defaultShadowXmlByBlock_[block.type];
  if (!defaults) return;

  for (var inputName in defaults) {
    if (!Object.prototype.hasOwnProperty.call(defaults, inputName)) continue;

    var input = block.getInput(inputName);
    var connection = input && input.connection;
    if (!connection || connection.isConnected()) continue;

    var shadowNode = Blockly.SecretTransformations.createShadowNodeFromText_(
        defaults[inputName]);
    if (!shadowNode) continue;

    // Keep shadow template on the connection for later unplug/respawn behavior.
    connection.setShadowDom(shadowNode.cloneNode(true));

    var shadowBlock = Blockly.Xml.domToBlock(shadowNode, block.workspace);
    if (!shadowBlock) continue;

    try {
      if (shadowBlock.outputConnection) {
        connection.connect(shadowBlock.outputConnection);
      } else if (shadowBlock.previousConnection) {
        connection.connect(shadowBlock.previousConnection);
      } else {
        shadowBlock.dispose(false, false);
        continue;
      }

      // Explicitly render the shadow so it snaps into the right input slot.
      if (shadowBlock.rendered) {
        shadowBlock.render(false);
      }
    } catch (e) {
      if (shadowBlock && shadowBlock.workspace) {
        shadowBlock.dispose(false, false);
      }
    }
  }
};

/**
 * Build a shadow XML node from a snippet like
 * '<shadow type="math_positive_number">...</shadow>'.
 * @param {string} shadowXmlText
 * @return {?Element}
 * @private
 */
Blockly.SecretTransformations.createShadowNodeFromText_ = function(shadowXmlText) {
  var xml = Blockly.Xml.textToDom('<xml>' + shadowXmlText + '</xml>');
  var shadow = xml.firstChild;
  return shadow ? /** @type {!Element} */ (shadow.cloneNode(true)) : null;
};

/**
 * Fire the ring burst at the block's current screen position, then attach
 * confetti to the new block's SVG root so they move with the drag.
 * Must be called AFTER the new block has been created and placed.
 * @param {!Blockly.WorkspaceSvg} workspace
 * @param {!goog.math.Coordinate} wsXY  Workspace coords of the swap point.
 * @param {!Blockly.BlockSvg} newBlock  The replacement block (already in DOM).
 * @private
 */
Blockly.SecretTransformations.sparkleEffect_ = function(workspace, wsXY, newBlock) {
  var svgRoot = newBlock.getSvgRoot();
  if (!svgRoot) return;

  // Compute block-local centre once — shared by ring and confetti.
  var bbox;
  try { bbox = svgRoot.getBBox(); } catch (e) {
    bbox = {x: 0, y: 0, width: 80, height: 40};
  }
  var cx = bbox.x + bbox.width / 2;
  var cy = bbox.y + bbox.height / 2;

  // Ring and confetti both parented to svgRoot so they track the block.
  Blockly.SecretTransformations.sparkleRing_(svgRoot, cx, cy, Date.now());
  Blockly.SecretTransformations.sparkleConfetti_(svgRoot, cx, cy);
};

/**
 * Expanding + fading ring animation in block-local SVG space.
 * Parented to svgRoot so it automatically follows the block during drag.
 * @param {!SVGElement} svgRoot
 * @param {number} cx  Block-local x centre.
 * @param {number} cy  Block-local y centre.
 * @param {number} startMs
 * @private
 */
Blockly.SecretTransformations.sparkleRing_ = function(svgRoot, cx, cy, startMs) {
  var progress = (Date.now() - startMs) / 380;

  var ring = svgRoot._stRing;
  if (!ring) {
    ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#FFD700');
    ring.setAttribute('stroke-width', '5');
    ring.setAttribute('pointer-events', 'none');
    svgRoot.appendChild(ring);
    svgRoot._stRing = ring;
  }

  if (progress >= 1) {
    if (ring.parentNode) ring.parentNode.removeChild(ring);
    svgRoot._stRing = null;
    return;
  }

  ring.setAttribute('cx', cx);
  ring.setAttribute('cy', cy);
  ring.setAttribute('r', 8 + 120 * progress);
  ring.setAttribute('opacity', 1 - progress);

  setTimeout(function() {
    Blockly.SecretTransformations.sparkleRing_(svgRoot, cx, cy, startMs);
  }, 16);
};

/**
 * Spawn confetti pieces as children of svgRoot.
 * Because they are children they automatically follow the block as it drags.
 * Each piece has physics: an initial velocity and gravity, producing an arc.
 * @param {!SVGElement} svgRoot
 * @param {number} cx  Block-local x centre.
 * @param {number} cy  Block-local y centre.
 * @private
 */
Blockly.SecretTransformations.sparkleConfetti_ = function(svgRoot, cx, cy) {
  var colors = Blockly.SecretTransformations.SPARKLE_COLORS_;
  var count = 30;
  for (var i = 0; i < count; i++) {
    // Spread evenly around the circle, with randomised speed and upward bias.
    var baseAngle = (i / count) * Math.PI * 2;
    var jitter = (Math.random() - 0.5) * 0.7;
    var angle = baseAngle + jitter;
    var speed = 90 + Math.random() * 120;
    var vx = Math.cos(angle) * speed;
    // vy: upward bias so pieces arc before falling with gravity.
    var vy = Math.sin(angle) * speed - 50;

    var color = colors[i % colors.length];
    // Alternate between circles (dots) and rects (confetti strips).
    var elem;
    if (i % 3 === 0) {
      elem = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      elem.setAttribute('r', 6 + Math.random() * 6);
      elem.setAttribute('fill', color);
    } else {
      elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      var w = 10 + Math.random() * 12;
      var h = 5 + Math.random() * 6;
      elem.setAttribute('width', w);
      elem.setAttribute('height', h);
      elem.setAttribute('fill', color);
    }
    elem.setAttribute('pointer-events', 'none');
    svgRoot.appendChild(elem);

    var initRot = Math.random() * 360;
    var rotSpeed = (Math.random() - 0.5) * 720; // deg/s

    Blockly.SecretTransformations.confettiTick_(
        elem, cx, cy, vx, vy, initRot, rotSpeed, Date.now());
  }
};

/**
 * Animate a single confetti piece using physics in block-local space.
 * Gravity pulls pieces downward; they fade and removed when done.
 * @param {!SVGElement} elem
 * @param {number} cx  Origin x in block-local coords.
 * @param {number} cy  Origin y in block-local coords.
 * @param {number} vx  Initial x velocity (px/s).
 * @param {number} vy  Initial y velocity (px/s, negative = up).
 * @param {number} rot  Initial rotation in degrees.
 * @param {number} rotSpeed  Rotation speed in deg/s.
 * @param {number} startMs
 * @private
 */
Blockly.SecretTransformations.confettiTick_ = function(
    elem, cx, cy, vx, vy, rot, rotSpeed, startMs) {
  var DURATION_MS = 950;
  var GRAVITY = 260; // px/s^2 in block-local space

  var elapsed = Date.now() - startMs;
  if (elapsed >= DURATION_MS || !elem.parentNode) {
    if (elem.parentNode) elem.parentNode.removeChild(elem);
    return;
  }

  var t = elapsed / 1000;
  var x = cx + vx * t;
  var y = cy + vy * t + 0.5 * GRAVITY * t * t;
  var currentRot = rot + rotSpeed * t;
  var opacity = Math.max(0, 1 - elapsed / DURATION_MS);

  elem.setAttribute('transform',
      'translate(' + x + ',' + y + ') rotate(' + currentRot + ')');
  elem.setAttribute('opacity', opacity);

  setTimeout(function() {
    Blockly.SecretTransformations.confettiTick_(
        elem, cx, cy, vx, vy, rot, rotSpeed, startMs);
  }, 16);
};

// ─── BlockDragger integration (monkey-patch) ─────────────────────────────────

(function() {
  var ST = Blockly.SecretTransformations;

  var origDrag = Blockly.BlockDragger.prototype.dragBlock;
  var origEndDrag = Blockly.BlockDragger.prototype.endBlockDrag;
  Blockly.BlockDragger.prototype.dragBlock = function(e, currentDragDeltaXY) {
    // Run normal drag logic first (moves the block to its current position).
    var result = origDrag.call(this, e, currentDragDeltaXY);

    if (!this.stShakeTracker_) {
      this.stShakeTracker_ = ST.createShakeTracker();
    }

    if (ST.updateShake(this.stShakeTracker_, currentDragDeltaXY)) {
      var block = this.draggingBlock_;
      if (block && ST.getNextType_(block.type)) {
        var isStandalone = true;
        var desc = block.getDescendants(false);
        for (var i = 0; i < desc.length; i++) {
          if (desc[i] !== block && !desc[i].isShadow()) {
            isStandalone = false;
            break;
          }
        }
        if (isStandalone) {
          // Swap the block mid-drag. After this call, this.draggingBlock_,
          // this.startXY_, and this.draggedConnectionManager_ all refer to
          // the new block, and the drag continues seamlessly.
          ST.transformBlockMidDrag_(this, currentDragDeltaXY);
        }
      }
    }

    return result;
  };

  Blockly.BlockDragger.prototype.endBlockDrag = function(e, currentDragDeltaXY) {
    // Keep a reference before endBlockDrag clears dragger state.
    var droppedBlock = this.draggingBlock_;
    var result = origEndDrag.call(this, e, currentDragDeltaXY);

    // Force a post-drop render pass so connected shadows snap to final layout.
    if (droppedBlock && droppedBlock.rendered && droppedBlock.workspace) {
      droppedBlock.render(false);
      var descendants = droppedBlock.getDescendants(false);
      for (var i = 0; i < descendants.length; i++) {
        if (descendants[i].isShadow() && descendants[i].rendered) {
          descendants[i].render(true);
        }
      }
    }

    return result;
  };
})();
