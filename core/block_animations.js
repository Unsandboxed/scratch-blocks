/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Methods animating a block on connection and disconnection.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BlockAnimations');

/**
 * Block currently running disconnect wiggle animation.
 * @type {?Blockly.BlockSvg}
 * @private
 */
Blockly.BlockAnimations.disconnectUiBlock_ = null;

/**
 * Original transform to restore when disconnect wiggle ends.
 * @type {?string}
 * @private
 */
Blockly.BlockAnimations.disconnectUiOriginalTransform_ = null;

/**
 * Timeout id for disconnect wiggle loop.
 * @type {?number}
 * @private
 */
Blockly.BlockAnimations.disconnectUiPid_ = null;


/**
 * Play some UI effects (sound, animation) when disposing of a block.
 * @param {!Blockly.BlockSvg} block The block being disposed of.
 * @package
 */
Blockly.BlockAnimations.disposeUiEffect = function(block) {
  var workspace = block.workspace;
  var svgGroup = block.getSvgRoot();
  workspace.getAudioManager().play('delete');

  var blockDragSurface =
      workspace.getBlockDragSurface && workspace.getBlockDragSurface();
  var dragSurfaceGroup =
      blockDragSurface && blockDragSurface.getGroup && blockDragSurface.getGroup();
  var isOnDragSurface = !!dragSurfaceGroup && svgGroup.parentNode == dragSurfaceGroup;

  if (isOnDragSurface) {
    // When deleting while over the flyout/toolbox, animate in the drag surface
    // so the effect stays above flyout layers.
    var dragClone = svgGroup.cloneNode(true);
    dragClone.translateX_ = 0;
    dragClone.translateY_ = 0;
    dragClone.setAttribute('transform', 'translate(0,0)');
    dragSurfaceGroup.appendChild(dragClone);
    dragClone.bBox_ = dragClone.getBBox();
    Blockly.BlockAnimations.disposeUiStepOnDragSurface_(
        dragClone, workspace.RTL, new Date());
    return;
  }

  var xy = workspace.getSvgXY(svgGroup);
  // Deeply clone the current block.
  var clone = svgGroup.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')');
  workspace.getParentSvg().appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  Blockly.BlockAnimations.disposeUiStep_(clone, workspace.RTL, new Date,
      workspace.scale);
};

/**
 * Animate a cloned block on the drag surface and eventually dispose of it.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @private
 */
Blockly.BlockAnimations.disposeUiStepOnDragSurface_ = function(clone, rtl,
    start) {
  var ms = new Date - start;
  var percent = ms / 175;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height / 2 * percent;
    var scale = (1 - percent);
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    setTimeout(Blockly.BlockAnimations.disposeUiStepOnDragSurface_, 10, clone,
        rtl, start);
  }
};

/**
 * Animate a cloned block and eventually dispose of it.
 * This is a class method, not an instance method since the original block has
 * been destroyed and is no longer accessible.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockAnimations.disposeUiStep_ = function(clone, rtl, start,
    workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    var y = clone.translateY_ +
      clone.bBox_.height * workspaceScale / 2 * percent;
    var scale = (1 - percent) * workspaceScale;
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    setTimeout(Blockly.BlockAnimations.disposeUiStep_, 10, clone, rtl, start,
        workspaceScale);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 * @param {!Blockly.BlockSvg} block The block being connected.
 * @package
 */
Blockly.BlockAnimations.connectionUiEffect = function(
    block) {
  if (!block || !block.workspace) {
    return;
  }

  var workspace = block.workspace;
  var scale = workspace.scale;
  workspace.getAudioManager().play('click');

  if (!Blockly.SPORK_FLARES) {
    return;
  }

  // At small scales the visual pulse is noisy, so play audio only.
  if (scale < 1) {
    return;
  }

  var xy = workspace.getSvgXY(block.getSvgRoot());
  if (block.outputConnection) {
    xy.x += (block.RTL ? 3 : -3) * scale;
    xy.y += 13 * scale;
  } else if (block.previousConnection) {
    xy.x += (block.RTL ? -23 : 23) * scale;
    xy.y += 3 * scale;
  }

  var parentSvg = workspace.getParentSvg();
  var ripple = Blockly.utils.createSvgElement('circle', {
    'cx': xy.x,
    'cy': xy.y,
    'r': 0,
    'fill': 'none',
    'stroke': '#888',
    'stroke-width': 10
  }, parentSvg);

  var radiusAnim = Blockly.utils.createSvgElement('animate', {
    'begin': 'indefinite',
    'attributeName': 'r',
    'dur': '150ms',
    'from': 0,
    'to': 25 * scale
  }, ripple);

  var opacityAnim = Blockly.utils.createSvgElement('animate', {
    'begin': 'indefinite',
    'attributeName': 'opacity',
    'dur': '150ms',
    'from': 1,
    'to': 0
  }, ripple);

  radiusAnim.beginElement();
  opacityAnim.beginElement();
  setTimeout(function() {
    goog.dom.removeNode(ripple);
  }, 150);
};

/**
 * Play some UI effects (sound, animation) when disconnecting a block.
 * @param {!Blockly.BlockSvg} block The block being disconnected.
 * @package
 */
Blockly.BlockAnimations.disconnectUiEffect = function(
    block) {
  if (!block || !block.workspace) {
    return;
  }
  Blockly.BlockAnimations.disconnectUiStop();
  block.workspace.getAudioManager().play('disconnect', undefined, true);

  if (!Blockly.SPORK_FLARES) {
    return;
  }

  // Match modern Blockly: at small scales, play sound only.
  if (block.workspace.scale < 1) {
    return;
  }

  var svgRoot = block.getSvgRoot();
  if (!svgRoot) {
    return;
  }

  var originalTransform = svgRoot.getAttribute('transform');

  var blockHeight = Math.max(1, block.getHeightWidth().height);
  var magnitude = Math.atan(10 / blockHeight) / Math.PI * 180;
  if (!block.RTL) {
    magnitude *= -1;
  }

  Blockly.BlockAnimations.disconnectUiBlock_ = block;
  Blockly.BlockAnimations.disconnectUiOriginalTransform_ = originalTransform;
  Blockly.BlockAnimations.disconnectUiStep_(magnitude, new Date(), 0);
};

/**
 * Step disconnect wiggle animation.
 * @param {number} magnitude Wiggle magnitude in degrees.
 * @param {!Date} start Animation start.
 * @param {number} stepIndex Current step index.
 * @private
 */
Blockly.BlockAnimations.disconnectUiStep_ = function(magnitude, start,
    stepIndex) {
  var block = Blockly.BlockAnimations.disconnectUiBlock_;
  if (!block) {
    return;
  }
  var svgRoot = block.getSvgRoot();
  if (!svgRoot) {
    Blockly.BlockAnimations.disconnectUiStop();
    return;
  }

  var wiggle = [0.66, 1, 0.66, 0, -0.66, -1, -0.66, 0];
  var skew = '';
  var isAnimating = start.getTime() + 200 > new Date().getTime();
  if (isAnimating) {
    var angle = Math.round(wiggle[stepIndex % wiggle.length] * magnitude);
    skew = ' skewX(' + angle + ')';
  }

  var baseTransform = Blockly.BlockAnimations.disconnectUiOriginalTransform_ || '';
  if (baseTransform || skew) {
    svgRoot.setAttribute('transform', baseTransform + skew);
  } else {
    svgRoot.removeAttribute('transform');
  }

  if (isAnimating) {
    Blockly.BlockAnimations.disconnectUiPid_ = setTimeout(
        Blockly.BlockAnimations.disconnectUiStep_, 15, magnitude, start,
        stepIndex + 1);
  } else {
    Blockly.BlockAnimations.disconnectUiStop();
  }
};

/**
 * Stop the disconnect UI animation immediately.
 * @package
 */
Blockly.BlockAnimations.disconnectUiStop = function() {
  if (Blockly.BlockAnimations.disconnectUiPid_) {
    clearTimeout(Blockly.BlockAnimations.disconnectUiPid_);
    Blockly.BlockAnimations.disconnectUiPid_ = null;
  }

  if (Blockly.BlockAnimations.disconnectUiBlock_) {
    var svgRoot = Blockly.BlockAnimations.disconnectUiBlock_.getSvgRoot();
    if (svgRoot) {
      if (Blockly.BlockAnimations.disconnectUiOriginalTransform_ !== null) {
        svgRoot.setAttribute('transform',
            Blockly.BlockAnimations.disconnectUiOriginalTransform_);
      } else {
        svgRoot.removeAttribute('transform');
      }
    }
  }
  Blockly.BlockAnimations.disconnectUiBlock_ = null;
  Blockly.BlockAnimations.disconnectUiOriginalTransform_ = null;
};
