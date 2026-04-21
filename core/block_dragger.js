/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for dragging a block visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BlockDragger');

goog.require('Blockly.BlockAnimations');
goog.require('Blockly.ExtenderMutation');
goog.require('Blockly.Events.BlockMove');
goog.require('Blockly.Events.DragBlockOutside');
goog.require('Blockly.Events.EndBlockDrag');
goog.require('Blockly.InsertionMarkerManager');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 * @param {!Blockly.BlockSvg} block The block to drag.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
 * @constructor
 */
Blockly.BlockDragger = function(block, workspace) {
  /**
   * The top block in the stack that is being dragged.
   * @type {!Blockly.BlockSvg}
   * @private
   */
  this.draggingBlock_ = block;

  /**
   * The workspace on which the block is being dragged.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * Object that keeps track of connections on dragged blocks.
   * @type {!Blockly.InsertionMarkerManager}
   * @private
   */
  this.draggedConnectionManager_ = new Blockly.InsertionMarkerManager(
      this.draggingBlock_);

  /**
   * Which delete area the mouse pointer is over, if any.
   * One of {@link Blockly.DELETE_AREA_TRASH},
   * {@link Blockly.DELETE_AREA_TOOLBOX}, or {@link Blockly.DELETE_AREA_NONE}.
   * @type {?number}
   * @private
   */
  this.deleteArea_ = null;

  /**
   * Whether the block would be deleted if dropped immediately.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteBlock_ = false;

  /**
   * Whether the currently dragged block is outside of the workspace. Keep
   * track so that we can fire events only when this changes.
   * @type {boolean}
   * @private
   */
  this.wasOutside_ = false;

  /**
   * The location of the top left corner of the dragging block at the beginning
   * of the drag in workspace coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startXY_ = this.draggingBlock_.getRelativeToSurfaceXY();

  /**
   * A list of all of the icons (comment, warning, and mutator) that are
   * on this block and its descendants.  Moving an icon moves the bubble that
   * extends from it if that bubble is open.
   * @type {Array.<!Object>}
   * @private
   */
  this.dragIconData_ = Blockly.BlockDragger.initIconData_(block);

  /**
   * Blocks whose extendable tail state should be managed for this drag.
   * @type {!Array<!Blockly.BlockSvg>}
   * @private
   */
  this.autoExtendCandidates_ = [];
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.BlockDragger.prototype.dispose = function() {
  this.draggingBlock_ = null;
  this.workspace_ = null;
  this.startWorkspace_ = null;
  this.dragIconData_.length = 0;
  this.autoExtendCandidates_.length = 0;

  if (this.draggedConnectionManager_) {
    this.draggedConnectionManager_.dispose();
    this.draggedConnectionManager_ = null;
  }
};

/**
 * Make a list of all of the icons (comment, warning, and mutator) that are
 * on this block and its descendants.  Moving an icon moves the bubble that
 * extends from it if that bubble is open.
 * @param {!Blockly.BlockSvg} block The root block that is being dragged.
 * @return {!Array.<!Object>} The list of all icons and their locations.
 * @private
 */
Blockly.BlockDragger.initIconData_ = function(block) {
  // Build a list of icons that need to be moved and where they started.
  var dragIconData = [];
  var descendants = block.getDescendants(false);
  for (var i = 0, descendant; descendant = descendants[i]; i++) {
    var icons = descendant.getIcons();
    for (var j = 0; j < icons.length; j++) {
      var data = {
        // goog.math.Coordinate with x and y properties (workspace coordinates).
        location: icons[j].getIconLocation(),
        // Blockly.Icon
        icon: icons[j]
      };
      dragIconData.push(data);
    }
  }
  return dragIconData;
};

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.startBlockDrag = function(currentDragDeltaXY) {
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }

  this.workspace_.setResizesEnabled(false);
  Blockly.BlockAnimations.disconnectUiStop();

  this.autoExtendCandidates_ = [];
  this.registerAutoExtendCandidateForDrag_(this.draggingBlock_);

  var parentBeforeUnplug = this.draggingBlock_.getParent();
  if (this.draggingBlock_.getParent()) {
    this.draggingBlock_.unplug();
    var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);

    this.draggingBlock_.translate(newLoc.x, newLoc.y);
  }
  this.registerAutoExtendCandidateForDrag_(parentBeforeUnplug);
  this.draggingBlock_.setDragging(true);

  // For future consideration: we may be able to put moveToDragSurface inside
  // the block dragger, which would also let the block not track the block drag
  // surface.
  this.draggingBlock_.moveToDragSurface_();

  if (parentBeforeUnplug) {
    Blockly.BlockAnimations.disconnectUiEffect(this.draggingBlock_);
  }

  var toolbox = this.workspace_.getToolbox();
  if (toolbox) {
    var style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
        'blocklyToolboxGrab';
    toolbox.addStyle(style);
  }
};

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 * @return {boolean} True if the event should be propagated, false if not.
 */
Blockly.BlockDragger.prototype.dragBlock = function(e, currentDragDeltaXY) {
  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);

  this.draggingBlock_.moveDuringDrag(newLoc);
  this.dragIcons_(delta);

  this.deleteArea_ = this.workspace_.isDeleteArea(e);
  var isOutside = !this.workspace_.isInsideBlocksArea(e);
  this.draggedConnectionManager_.update(delta, this.deleteArea_, isOutside);

  var previewClosestConnection = this.getClosestPreviewConnection_();
  this.maybeRegisterPreviewAutoExtendCandidate_(previewClosestConnection);
  this.maybeAutoExtendTailFromGeneralProximity_(previewClosestConnection);
  this.maybeAutoExtendTailFromPreviewConnection_(previewClosestConnection);

  if (isOutside !== this.wasOutside_) {
    this.fireDragOutsideEvent_(isOutside);
    this.wasOutside_ = isOutside;
  }

  this.updateCursorDuringBlockDrag_(isOutside);
  return isOutside;
};

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.endBlockDrag = function(e, currentDragDeltaXY) {
  // Make sure internal state is fresh.
  this.dragBlock(e, currentDragDeltaXY);
  this.dragIconData_ = [];
  var isOutside = this.wasOutside_;
  this.fireEndDragEvent_(isOutside);
  this.draggingBlock_.setMouseThroughStyle(false);

  Blockly.BlockAnimations.disconnectUiStop();

  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
  // Keep blocks on the drag surface while deleting so the disposal animation
  // renders above the flyout/toolbox layer.
  if (!this.wouldDeleteBlock_) {
    this.draggingBlock_.moveOffDragSurface_(newLoc);
  }

  // Scratch-specific: note possible illegal definition deletion for rollback below.
  var isDeletingProcDef = this.wouldDeleteBlock_ &&
      (this.draggingBlock_.type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE);
  if (isDeletingProcDef) {
    var procCodeBeingDeleted = this.draggingBlock_.getInput('custom_block').connection.targetBlock().getProcCode();
  }

  var deleted = this.maybeDeleteBlock_();
  if (deleted) {
    var blockDragSurface = this.workspace_.getBlockDragSurface();
    if (blockDragSurface) {
      // Allow delete UI animation to complete before clearing drag surface.
      goog.Timer.callOnce(function() {
        blockDragSurface.clearAndHide();
      }, 180);
    }
  }
  if (!deleted) {
    // These are expensive and don't need to be done if we're deleting.
    this.draggingBlock_.moveConnections_(delta.x, delta.y);
    this.draggingBlock_.setDragging(false);
    this.fireMoveEvent_();
    var willConnect = this.draggedConnectionManager_.wouldConnectBlock();
    if (willConnect) {
      // Applying connections also rerenders the relevant blocks.
      this.draggedConnectionManager_.applyConnections();
    } else {
      this.draggingBlock_.render();
    }
    var reconcileBlocks = this.getAutoExtendedBlocksForReconcile_();
    this.maybeRetractUnusedAutoTailAfterDrag_();
    this.scheduleAutoExtendedTailShadowReconcile_(reconcileBlocks);
    this.draggingBlock_.scheduleSnapAndBump();
  }

  this.clearAutoExtendDragState_();
  this.workspace_.setResizesEnabled(true);

  var toolbox = this.workspace_.getToolbox();
  if (toolbox) {
    var style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
        'blocklyToolboxGrab';
    toolbox.removeStyle(style);
  }
  Blockly.Events.setGroup(false);

  if (isOutside) {
    var ws = this.workspace_;
    // Reset a drag to outside of scratch-blocks
    setTimeout(function() {
      ws.undo();
    });
  }

  // Scratch-specific: roll back deletes that create call blocks with defines.
  // Have to wait for connections to be re-established, so put in setTimeout.
  // Only do this if we deleted a proc def.
  if (isDeletingProcDef) {
    var ws = this.workspace_;
    setTimeout(function() {
      var allBlocks = ws.getAllBlocks();
      for (var i = 0; i < allBlocks.length; i++) {
        var block = allBlocks[i];
        if (block.type == Blockly.PROCEDURES_CALL_BLOCK_TYPE) {
          var procCode = block.getProcCode();
          // Check for call blocks with no associated define block.
          if (procCode === procCodeBeingDeleted) {
            alert(Blockly.Msg.PROCEDURE_USED);
            ws.undo();
            return; // There can only be one define deletion at a time.
          }
        }
      }
      if (!Blockly.Procedures.vmCanDeleteDefinitionCallback_(procCodeBeingDeleted, true)) {
        alert(Blockly.Msg.PROCEDURE_USED);
        ws.undo();
        return; // There can only be one define deletion at a time.
      }
      ws.deleteGlobalProcedureMutationByProccode(procCodeBeingDeleted);
      // The proc deletion was valid, update the toolbox.
      ws.refreshToolboxSelection_();
    });
  }
};

/**
 * Whether this block supports modern extendable tail mutation operations.
 * @param {!Blockly.BlockSvg} block The block to test.
 * @return {boolean} True if the block supports auto tail extension.
 * @private
 */
Blockly.BlockDragger.prototype.isAutoExtendCandidate_ = function(block) {
  return !!(block &&
      block.extendDefinitions_ &&
      Array.isArray(block.argumentIds_) &&
      typeof block.insertInputsAtIndex === 'function');
};

/**
 * Whether a block is in the currently dragged stack.
 * @param {?Blockly.BlockSvg} block The block to test.
 * @return {boolean} True if the block is the dragged block or one of its descendants.
 * @private
 */
Blockly.BlockDragger.prototype.isInDraggedStack_ = function(block) {
  if (!block || !this.draggingBlock_) {
    return false;
  }
  return block === this.draggingBlock_ || block.getRootBlock() === this.draggingBlock_;
};

/**
 * Get the real (non-shadow) block connected to the current last dynamic input.
 * @param {!Blockly.BlockSvg} block The block to inspect.
 * @return {?Blockly.BlockSvg} Connected non-shadow block, or null.
 * @private
 */
Blockly.BlockDragger.prototype.getLastRealTailTarget_ = function(block) {
  var argumentIds = block.argumentIds_ || [];
  if (!argumentIds.length) {
    return null;
  }

  var input = block.getInput(argumentIds[argumentIds.length - 1]);
  if (!input || !input.connection) {
    return null;
  }

  var target = input.connection.targetBlock();
  if (!target) {
    return null;
  }

  return (target.isShadow && target.isShadow()) ? null : target;
};

/**
 * Get the currently previewed closest connection from the insertion marker manager.
 * @return {?Blockly.RenderedConnection} Closest preview connection, if any.
 * @private
 */
Blockly.BlockDragger.prototype.getClosestPreviewConnection_ = function() {
  return this.draggedConnectionManager_ ?
      (this.draggedConnectionManager_.closestConnection_ || null) : null;
};

/**
 * If a preview targets an extendable block, ensure it is tracked for this drag.
 * @param {?Blockly.RenderedConnection} previewConnection The preview connection.
 * @private
 */
Blockly.BlockDragger.prototype.maybeRegisterPreviewAutoExtendCandidate_ = function(previewConnection) {
  if (!previewConnection || !previewConnection.sourceBlock_) {
    return;
  }
  if (this.isInDraggedStack_(previewConnection.sourceBlock_)) {
    return;
  }
  this.registerAutoExtendCandidateForDrag_(previewConnection.sourceBlock_);
};

/**
 * Whether a connection maps to the host block's current last dynamic input.
 * @param {!Blockly.BlockSvg} block The host block.
 * @param {!Blockly.RenderedConnection} connection The candidate connection.
 * @return {boolean} True when the connection belongs to the last dynamic socket.
 * @private
 */
Blockly.BlockDragger.prototype.isLastDynamicInputConnection_ = function(block, connection) {
  if (!this.isAutoExtendCandidate_(block) || !connection) {
    return false;
  }
  var argumentIds = block.argumentIds_ || [];
  if (!argumentIds.length) {
    return false;
  }
  var input = block.getInput(argumentIds[argumentIds.length - 1]);
  return !!(input && input.connection && input.connection === connection);
};

/**
 * Whether a host block is eligible for one-shot auto-extension this drag.
 * Must have a non-shadow block in its current last dynamic input.
 * @param {!Blockly.BlockSvg} hostBlock The extendable host block.
 * @return {boolean} True if the host should auto-extend now.
 * @private
 */
Blockly.BlockDragger.prototype.shouldAutoExtendHostBlock_ = function(hostBlock) {
  return !!(this.isAutoExtendCandidate_(hostBlock) &&
  !this.isInDraggedStack_(hostBlock) &&
      !hostBlock.autoExtendDidInsert_ &&
      this.getLastRealTailTarget_(hostBlock));
};

/**
 * Auto-extend as soon as the drag preview targets the last dynamic input.
 * @param {?Blockly.RenderedConnection} previewConnection The preview connection.
 * @private
 */
Blockly.BlockDragger.prototype.maybeAutoExtendTailFromPreviewConnection_ = function(previewConnection) {
  if (!previewConnection || !previewConnection.sourceBlock_) {
    return;
  }

  var hostBlock = previewConnection.sourceBlock_;
  if (!this.shouldAutoExtendHostBlock_(hostBlock)) {
    return;
  }

  if (!this.isLastDynamicInputConnection_(hostBlock, previewConnection)) {
    return;
  }

  var beforeLen = hostBlock.argumentIds_.length;
  hostBlock.insertInputsAtIndex(hostBlock.argumentIds_.length + 1, {});
  var delta = hostBlock.argumentIds_.length - beforeLen;
  if (delta > 0) {
    if (!Array.isArray(hostBlock.autoExtendDragDeltas_)) {
      hostBlock.autoExtendDragDeltas_ = [];
    }
    hostBlock.autoExtendDragDeltas_.push(delta);
    hostBlock.autoExtendDidInsert_ = true;
    this.ensureTailShadowIfNeeded_(hostBlock);
  }
};

/**
 * Check whether the dragged block is near the host block's last dynamic input.
 * Uses a larger radius than snap preview so extension appears before precise hover.
 * @param {!Blockly.BlockSvg} hostBlock The extendable host block.
 * @return {boolean} True if dragged block is within general vicinity.
 * @private
 */
Blockly.BlockDragger.prototype.isNearLastDynamicInput_ = function(hostBlock) {
  if (!hostBlock || !this.draggingBlock_ || !this.draggingBlock_.outputConnection) {
    return false;
  }

  var argumentIds = hostBlock.argumentIds_ || [];
  if (!argumentIds.length) {
    return false;
  }

  var input = hostBlock.getInput(argumentIds[argumentIds.length - 1]);
  if (!input || !input.connection) {
    return false;
  }

  // Dragged block anchor: edge that faces the host extension side.
  var draggedBounds = this.draggingBlock_.getBoundingRectangle && this.draggingBlock_.getBoundingRectangle();
  if (!draggedBounds || !draggedBounds.topLeft || !draggedBounds.bottomRight) {
    return false;
  }

  // Host reference: extending edge center (right in LTR, left in RTL).
  var hostBounds = hostBlock.getBoundingRectangle && hostBlock.getBoundingRectangle();
  if (!hostBounds || !hostBounds.topLeft || !hostBounds.bottomRight) {
    return false;
  }

  var hostEdgeX = this.workspace_.RTL ? hostBounds.topLeft.x : hostBounds.bottomRight.x;
  var hostEdgeY = (hostBounds.topLeft.y + hostBounds.bottomRight.y) / 2;

  var draggedCenterX = (draggedBounds.topLeft.x + draggedBounds.bottomRight.x) / 2;
  var anchorX = hostEdgeX >= draggedCenterX ? draggedBounds.bottomRight.x : draggedBounds.topLeft.x;
  var anchorY = (draggedBounds.topLeft.y + draggedBounds.bottomRight.y) / 2;

  // Padded vicinity box around host extending edge.
  var halfW = Math.max(34, (Blockly.SNAP_RADIUS * 2.4));
  var halfH = Math.max(24, (Blockly.SNAP_RADIUS * 1.6));
  var minX = hostEdgeX - halfW;
  var maxX = hostEdgeX + halfW;
  var minY = hostEdgeY - halfH;
  var maxY = hostEdgeY + halfH;

  return anchorX >= minX && anchorX <= maxX && anchorY >= minY && anchorY <= maxY;
};

/**
 * Auto-extend if the dragged block is generally near the host's last dynamic input.
 * @private
 */
Blockly.BlockDragger.prototype.maybeAutoExtendTailFromGeneralProximity_ = function(previewConnection) {
  this.maybeRetractTailWhenLeavingProximity_(previewConnection);

  var blocks = this.workspace_.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    var hostBlock = blocks[i];
    if (!this.shouldAutoExtendHostBlock_(hostBlock)) {
      continue;
    }
    if (!this.isNearLastDynamicInput_(hostBlock)) {
      continue;
    }

    this.registerAutoExtendCandidateForDrag_(hostBlock);

    var beforeLen = hostBlock.argumentIds_.length;
    hostBlock.insertInputsAtIndex(hostBlock.argumentIds_.length + 1, {});
    var delta = hostBlock.argumentIds_.length - beforeLen;
    if (delta > 0) {
      if (!Array.isArray(hostBlock.autoExtendDragDeltas_)) {
        hostBlock.autoExtendDragDeltas_ = [];
      }
      hostBlock.autoExtendDragDeltas_.push(delta);
      hostBlock.autoExtendDidInsert_ = true;
      this.ensureTailShadowIfNeeded_(hostBlock);
    }
  }
};

/**
 * Retract an auto-added tail while dragging if the dragged block leaves vicinity
 * and the tail remains unused.
 * @param {?Blockly.RenderedConnection} previewConnection The current preview connection.
 * @private
 */
Blockly.BlockDragger.prototype.maybeRetractTailWhenLeavingProximity_ = function(previewConnection) {
  if (typeof Blockly.ExtenderMutation === 'undefined') {
    return;
  }

  for (var i = 0; i < this.autoExtendCandidates_.length; i++) {
    var block = this.autoExtendCandidates_[i];
    if (!this.isAutoExtendCandidate_(block) ||
        !block.autoExtendDidInsert_ ||
        !Array.isArray(block.autoExtendDragDeltas_) ||
        !block.autoExtendDragDeltas_.length) {
      continue;
    }

    var previewTargetsBlock = !!(previewConnection &&
        previewConnection.sourceBlock_ === block &&
        this.isLastDynamicInputConnection_(block, previewConnection));
    var stillNear = this.isNearLastDynamicInput_(block) || previewTargetsBlock;
    if (stillNear || this.getLastRealTailTarget_(block)) {
      continue;
    }

    var removeCount = block.autoExtendDragDeltas_.pop();
    var minInputs = Blockly.ExtenderMutation.getMinInputCount_(block);
    Blockly.ExtenderMutation.removeTailInputs_.call(block, removeCount, minInputs);
    block.autoExtendDidInsert_ = false;
  }
};

/**
 * Retract any trailing auto-added tail slot that is still empty/shadow.
 * @private
 */
Blockly.BlockDragger.prototype.maybeRetractUnusedAutoTailAfterDrag_ = function() {
  if (typeof Blockly.ExtenderMutation === 'undefined') {
    return;
  }

  for (var i = 0; i < this.autoExtendCandidates_.length; i++) {
    var block = this.autoExtendCandidates_[i];
    if (!this.isAutoExtendCandidate_(block) ||
        !Array.isArray(block.autoExtendDragDeltas_) ||
        !block.autoExtendDragDeltas_.length) {
      continue;
    }

    while (block.autoExtendDragDeltas_.length) {
      // Keep auto-added inputs that are actually used.
      if (this.getLastRealTailTarget_(block)) {
        break;
      }

      var removeCount = block.autoExtendDragDeltas_.pop();
      var minInputs = Blockly.ExtenderMutation.getMinInputCount_(block);
      Blockly.ExtenderMutation.removeTailInputs_.call(block, removeCount, minInputs);
    }
  }
};

/**
 * Snapshot blocks that were auto-extended this drag for post-drag reconciliation.
 * @return {!Array<!Blockly.BlockSvg>} Blocks that need tail shadow reconciliation.
 * @private
 */
Blockly.BlockDragger.prototype.getAutoExtendedBlocksForReconcile_ = function() {
  var blocks = [];
  for (var i = 0; i < this.autoExtendCandidates_.length; i++) {
    var block = this.autoExtendCandidates_[i];
    if (block && block.autoExtendDidInsert_) {
      blocks.push(block);
    }
  }
  return blocks;
};

/**
 * Delay shadow reconciliation until drag state has fully settled.
 * @param {!Array<!Blockly.BlockSvg>} candidateBlocks Candidate host blocks snapshot.
 * @private
 */
Blockly.BlockDragger.prototype.scheduleAutoExtendedTailShadowReconcile_ = function(candidateBlocks) {
  var self = this;
  var attemptReconcile = function(triesLeft) {
    if (self.workspace_ && self.workspace_.isDragging && self.workspace_.isDragging() && triesLeft > 0) {
      goog.Timer.callOnce(function() {
        attemptReconcile(triesLeft - 1);
      }, 25);
      return;
    }

    for (var i = 0; i < candidateBlocks.length; i++) {
      var block = candidateBlocks[i];
      if (!block) {
        continue;
      }
      if (typeof block.updateDisplay_ === 'function') {
        block.updateDisplay_();
      }
      self.ensureTailShadowIfNeeded_(block);
    }
  };

  goog.Timer.callOnce(function() {
    attemptReconcile(6);
  }, 0);
};

/**
 * If the last dynamic input should have a shadow but doesn't, create it.
 * @param {!Blockly.BlockSvg} block The extendable host block.
 * @private
 */
Blockly.BlockDragger.prototype.ensureTailShadowIfNeeded_ = function(block) {
  if (!this.isAutoExtendCandidate_(block) || !block.argumentIds_.length) {
    return;
  }

  var lastIndex = block.argumentIds_.length - 1;
  var input = block.getInput(block.argumentIds_[lastIndex]);
  if (!input || !input.connection || input.connection.targetBlock()) {
    return;
  }

  var definition = Blockly.ExtenderMutation.getInputDefinitionFromIndex_(lastIndex, block);
  if (!definition || !definition.shadow) {
    return;
  }

  var prevRecordUndo = Blockly.Events.recordUndo;
  Blockly.Events.recordUndo = false;
  try {
    var shadowBlock = block.workspace.newBlock(definition.shadow);
    if (definition.field) {
      var defaultValue = definition.defaultValue;
      if (defaultValue === null || typeof defaultValue === 'undefined') {
        defaultValue = Blockly.ExtenderMutation.getShadowFieldDefault_(definition.shadow, definition.field);
      }
      shadowBlock.setFieldValue(defaultValue, definition.field);
    }
    shadowBlock.setShadow(true);
    shadowBlock.initSvg();
    shadowBlock.render(false);
    if (shadowBlock.outputConnection) {
      shadowBlock.outputConnection.connect(input.connection);
    }
    if (!input.connection.targetConnection) {
      shadowBlock.dispose();
    } else {
      input.connection.setShadowDom(Blockly.Xml.blockToDom(shadowBlock));
    }
  } finally {
    Blockly.Events.recordUndo = prevRecordUndo;
  }
};

/**
 * Clear temporary per-drag auto-extend bookkeeping state.
 * @private
 */
Blockly.BlockDragger.prototype.clearAutoExtendDragState_ = function() {
  for (var i = 0; i < this.autoExtendCandidates_.length; i++) {
    this.autoExtendCandidates_[i].autoExtendDragDeltas_ = null;
    this.autoExtendCandidates_[i].autoExtendDidInsert_ = null;
  }
  this.autoExtendCandidates_ = [];
};

/**
 * Register a block as a drag-scoped candidate for auto tail extension.
 * @param {?Blockly.BlockSvg} block The block to track.
 * @private
 */
Blockly.BlockDragger.prototype.registerAutoExtendCandidateForDrag_ = function(block) {
  if (!block || !this.isAutoExtendCandidate_(block)) {
    return;
  }
  if (this.autoExtendCandidates_.indexOf(block) !== -1) {
    return;
  }
  block.autoExtendDragDeltas_ = [];
  block.autoExtendDidInsert_ = false;
  this.autoExtendCandidates_.push(block);
};

/**
 * Fire an event when the dragged blocks move outside or back into the blocks workspace
 * @param {?boolean} isOutside True if the drag is going outside the visible area.
 * @private
 */
Blockly.BlockDragger.prototype.fireDragOutsideEvent_ = function(isOutside) {
  var event = new Blockly.Events.DragBlockOutside(this.draggingBlock_);
  event.isOutside = isOutside;
  Blockly.Events.fire(event);
};

/**
 * Fire an end drag event at the end of a block drag.
 * @param {?boolean} isOutside True if the drag is going outside the visible area.
 * @private
 */
Blockly.BlockDragger.prototype.fireEndDragEvent_ = function(isOutside) {
  var event = new Blockly.Events.EndBlockDrag(this.draggingBlock_, isOutside);
  Blockly.Events.fire(event);
};

/**
 * Fire a move event at the end of a block drag.
 * @private
 */
Blockly.BlockDragger.prototype.fireMoveEvent_ = function() {
  var event = new Blockly.Events.BlockMove(this.draggingBlock_);
  event.oldCoordinate = this.startXY_;
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Shut the trash can and, if necessary, delete the dragging block.
 * Should be called at the end of a block drag.
 * @return {boolean} whether the block was deleted.
 * @private
 */
Blockly.BlockDragger.prototype.maybeDeleteBlock_ = function() {
  var trashcan = this.workspace_.trashcan;

  if (this.wouldDeleteBlock_) {
    if (trashcan) {
      goog.Timer.callOnce(trashcan.close, 100, trashcan);
    }
    // Fire a move event, so we know where to go back to for an undo.
    this.fireMoveEvent_();
    this.draggingBlock_.dispose(false, true);
  } else if (trashcan) {
    // Make sure the trash can is closed.
    trashcan.close();
  }
  return this.wouldDeleteBlock_;
};

/**
 * Update the cursor (and possibly the trash can lid) to reflect whether the
 * dragging block would be deleted if released immediately.
 * @param {boolean} isOutside True if the cursor is outside of the blocks workspace
 * @private
 */
Blockly.BlockDragger.prototype.updateCursorDuringBlockDrag_ = function(isOutside) {
  this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
  var trashcan = this.workspace_.trashcan;
  if (this.wouldDeleteBlock_) {
    this.draggingBlock_.setDeleteStyle(true);
    if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
      trashcan.setOpen_(true);
    }
  } else {
    this.draggingBlock_.setDeleteStyle(false);
    if (trashcan) {
      trashcan.setOpen_(false);
    }
  }

  if (isOutside) {
    // Let mouse events through to GUI
    this.draggingBlock_.setMouseThroughStyle(true);
  } else {
    this.draggingBlock_.setMouseThroughStyle(false);
  }
};

/**
 * Convert a coordinate object from pixels to workspace units, including a
 * correction for mutator workspaces.
 * This function does not consider differing origins.  It simply scales the
 * input's x and y values.
 * @param {!goog.math.Coordinate} pixelCoord A coordinate with x and y values
 *     in css pixel units.
 * @return {!goog.math.Coordinate} The input coordinate divided by the workspace
 *     scale.
 * @private
 */
Blockly.BlockDragger.prototype.pixelsToWorkspaceUnits_ = function(pixelCoord) {
  var result = new goog.math.Coordinate(pixelCoord.x / this.workspace_.scale,
      pixelCoord.y / this.workspace_.scale);
  if (this.workspace_.isMutator) {
    // If we're in a mutator, its scale is always 1, purely because of some
    // oddities in our rendering optimizations.  The actual scale is the same as
    // the scale on the parent workspace.
    // Fix that for dragging.
    var mainScale = this.workspace_.options.parentWorkspace.scale;
    result = result.scale(1 / mainScale);
  }
  return result;
};

/**
 * Move all of the icons connected to this drag.
 * @param {!goog.math.Coordinate} dxy How far to move the icons from their
 *     original positions, in workspace units.
 * @private
 */
Blockly.BlockDragger.prototype.dragIcons_ = function(dxy) {
  // Moving icons moves their associated bubbles.
  for (var i = 0; i < this.dragIconData_.length; i++) {
    var data = this.dragIconData_[i];
    data.icon.setIconLocation(goog.math.Coordinate.sum(data.location, dxy));
  }
};
