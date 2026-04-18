/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2022 Clip Team
 * All rights reserved.
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
 * @fileoverview Field for plus and minus button.
 * @author cuizhihui030925@outlook.com (Alex Cui)
 */
'use strict';

goog.provide('Blockly.FieldExtender');

goog.require('Blockly.Field');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.userAgent');

Blockly.FieldExtender = function(handlePlus, handleMinus, opt_enablePlus, opt_enableMinus, opt_iconLayout,
  opt_autoHideWhenEmptyShadow) {
  this.sourceBlock_ = null;
  this.size_ = new goog.math.Size(55, 20);
  this.handlePlus_ = handlePlus;
  this.handleMinus_ = handleMinus;
  this.wrappers_ = [];
  /** @type {SVGElement} */
  this.btnPlus_ = null;
  /** @type {SVGElement} */
  this.btnMinus_ = null;
  /** @type {SVGElement} */
  this.rectPlus_ = null;
  /** @type {SVGElement} */
  this.rectMinus_ = null;
  /** @type {SVGElement} */
  this.imgPlus_ = null;
  /** @type {SVGElement} */
  this.imgMinus_ = null;
  /** @type {boolean} */
  this.autoHideWhenEmptyShadow_ = !!opt_autoHideWhenEmptyShadow;
  /** @type {boolean} */
  this.extendersVisible_ = true;
  this.enablePlus_ = opt_enablePlus === undefined ? true : opt_enablePlus;
  this.enableMinus_ =  opt_enableMinus === undefined ? true : opt_enableMinus;
  this.iconLayout_ = opt_iconLayout || 'horizontal';
  /**
   * One-shot pending action set by the most recent button down.
   * @type {?boolean}
   * @private
   */
  this.pendingIsPlus_ = null;
};
goog.inherits(Blockly.FieldExtender, Blockly.Field);

Blockly.FieldExtender.prototype.CURSOR = 'pointer';
Blockly.FieldExtender.prototype.EDITABLE = true;
Blockly.FieldExtender.prototype.SERIALIZABLE = false;

/**
 * Fixed extender button size in px.
 * @type {number}
 * @const
 */
Blockly.FieldExtender.BUTTON_SIZE = 20;

/**
 * Horizontal inset before/after extender buttons in px.
 * @type {number}
 * @const
 */
Blockly.FieldExtender.HORIZONTAL_INSET = 5;

/**
 * Gap between minus and plus buttons in px.
 * @type {number}
 * @const
 */
Blockly.FieldExtender.BUTTON_GAP = 5;

/**
 * Padding around parent/shadow block path used for reveal.
 * @type {number}
 * @const
 */
Blockly.FieldExtender.HOVER_REVEAL_PADDING = 10;

/**
 * Resolve the block that should provide extender colors.
 * Shadow reporters should use parent colors when available.
 * @return {?Blockly.Block}
 * @private
 */
Blockly.FieldExtender.prototype.getColorSourceBlock_ = function() {
  var block = this.sourceBlock_;
  if (!block) return null;
  if (block.isShadow && block.isShadow()) {
    var parent = block.getParent && block.getParent();
    if (parent) return parent;
    if (block.outputConnection && block.outputConnection.targetConnection) {
      var source = block.outputConnection.targetConnection.getSourceBlock();
      if (source) return source;
    }
  }
  return block;
};

Blockly.FieldExtender.prototype.init = function() {
  if (this.fieldGroup_) {
    return;
  }
  /** @type {SVGElement} */
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.btnMinus_ = Blockly.utils.createSvgElement('g',
      {
        'cursor': 'pointer',
        'class': 'blocklyExtender',
        'display': this.enableMinus_ ? '' : 'none',
        'transition-duration': '0.3s'
      },
      this.fieldGroup_
  );
  this.btnPlus_ = Blockly.utils.createSvgElement('g',
      {
        'cursor': 'pointer',
        'class': 'blocklyExtender',
        'transform': 'translate(0)',
        'display': this.enablePlus_ ? '' : 'none',
        'transition-duration': '0.3s'
      },
      this.fieldGroup_
  );
  this.rectMinus_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyBlockBackground blocklyExtenderRect',
        'width': 20,
        'height': 20,
        'rx': Blockly.BlockSvg.CORNER_RADIUS,
        'ry': Blockly.BlockSvg.CORNER_RADIUS,
        'stroke': this.getColorSourceBlock_().getColourTertiary(),
        'fill': this.getColorSourceBlock_().getColour(),
        'fill-opacity': 1,
        'style': 'transition: fill 0.15s ease-in, stroke 0.15s ease-in;'
      },
      this.btnMinus_
  );
  this.rectPlus_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyBlockBackground blocklyExtenderRect',
        'width': 20,
        'height': 20,
        'x': 0,
        'y': 0,
        'rx': Blockly.BlockSvg.CORNER_RADIUS,
        'ry': Blockly.BlockSvg.CORNER_RADIUS,
        'stroke': this.getColorSourceBlock_().getColourTertiary(),
        'fill': this.getColorSourceBlock_().getColour(),
        'fill-opacity': 1,
        'style': 'transition: fill 0.15s ease-in, stroke 0.15s ease-in;'
      },
      this.btnPlus_
  );
  this.imgMinus_ = Blockly.utils.createSvgElement('image',
      {
        'width': 20,
        'height': 20
      },
      this.btnMinus_
  );
  this.imgPlus_ = Blockly.utils.createSvgElement('image',
      {
        'width': 20,
        'height': 20
      },
      this.btnPlus_
  );
  this.imgMinus_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.mainWorkspace.options.pathToMedia + 'left.svg');
  this.imgPlus_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.mainWorkspace.options.pathToMedia + 'right.svg');
  if (this.iconLayout_ === 'vertical') {
    // Rotate horizontal arrows so minus points up and plus points down.
    this.imgMinus_.setAttribute('transform', 'rotate(90 10 10)');
    this.imgPlus_.setAttribute('transform', 'rotate(90 10 10)');
  }
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);

  this.calcSize_();
  this.updateButtonLayout_();

  this.wrappers_ = [
    Blockly.bindEvent_(this.btnPlus_, 'mousedown', this, this.onMouseDown_.bind(this, true)),
    Blockly.bindEvent_(this.btnMinus_, 'mousedown', this, this.onMouseDown_.bind(this, false)),
    Blockly.bindEvent_(this.btnPlus_, 'mouseenter', this, this.handleHover_.bind(this, true, this.rectPlus_)),
    Blockly.bindEvent_(this.btnMinus_, 'mouseenter', this, this.handleHover_.bind(this, true, this.rectMinus_)),
    Blockly.bindEvent_(this.btnPlus_, 'mouseleave', this, this.handleHover_.bind(this, false, this.rectPlus_)),
    Blockly.bindEvent_(this.btnMinus_, 'mouseleave', this, this.handleHover_.bind(this, false, this.rectMinus_))
  ];

  if (this.autoHideWhenEmptyShadow_) {
    var workspaceSvg = this.sourceBlock_ && this.sourceBlock_.workspace && this.sourceBlock_.workspace.getParentSvg &&
        this.sourceBlock_.workspace.getParentSvg();
    if (workspaceSvg) {
      this.wrappers_.push(
        Blockly.bindEvent_(workspaceSvg, 'mousemove', this, this.onWorkspaceMouseMove_),
        Blockly.bindEvent_(workspaceSvg, 'mouseleave', this, this.onWorkspaceMouseLeave_)
      );
    }
  }

  this.render_();
};

/**
 * Construct a FieldExtender from a JSON arg object.
 * @param {!Object} _options A JSON object with options.
 * @returns {!Blockly.FieldExtender} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldExtender.fromJson = function(_options) {
  return new Blockly.FieldExtender();
};

/**
 * Dispose of all DOM objects belonging to this field.
 */
Blockly.FieldExtender.prototype.dispose = function() {
  this.wrappers_.forEach(function(v) {
    Blockly.unbindEvent_(v);
  });
  this.wrappers_ = [];
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.svgElement_ = null;
  this.pendingIsPlus_ = null;
};

Blockly.FieldExtender.prototype.calcSize_ = function() {
  var visibleCount = (this.enablePlus_ ? 1 : 0) + (this.enableMinus_ ? 1 : 0);
  if (visibleCount === 0) {
    this.size_.width = 0;
    return;
  }

  this.size_.width =
      (visibleCount * Blockly.FieldExtender.BUTTON_SIZE) +
      ((visibleCount - 1) * Blockly.FieldExtender.BUTTON_GAP) +
      (Blockly.FieldExtender.HORIZONTAL_INSET * 2);
};

/**
 * Recompute button visibility and x positions.
 * @private
 */
Blockly.FieldExtender.prototype.updateButtonLayout_ = function() {
  if (!this.fieldGroup_) return;

  this.btnPlus_.setAttribute('display', this.enablePlus_ ? '' : 'none');
  this.btnMinus_.setAttribute('display', this.enableMinus_ ? '' : 'none');

  var minusX = Blockly.FieldExtender.HORIZONTAL_INSET;
  var plusX = this.enableMinus_
      ? minusX + Blockly.FieldExtender.BUTTON_SIZE + Blockly.FieldExtender.BUTTON_GAP
      : Blockly.FieldExtender.HORIZONTAL_INSET;

  this.btnMinus_.setAttribute('transform', 'translate(' + minusX + ')');
  this.btnPlus_.setAttribute('transform', 'translate(' + plusX + ')');
  this.applyVisibility_();
};

/**
 * Returns true when auto-hide mode should be active for this field.
 * @return {boolean}
 * @private
 */
Blockly.FieldExtender.prototype.shouldAutoHide_ = function() {
  if (!this.autoHideWhenEmptyShadow_) return false;
  var block = this.sourceBlock_;
  if (!block || !block.isShadow || !block.isShadow()) return false;
  if (!Array.isArray(block.argumentIds_)) return false;
  return block.argumentIds_.length === 0;
};

/**
 * Apply visibility and pointer state to extender buttons.
 * @private
 */
Blockly.FieldExtender.prototype.applyVisibility_ = function() {
  if (!this.btnPlus_ || !this.btnMinus_) return;
  var visible = this.shouldAutoHide_() ? this.extendersVisible_ : true;
  var opacity = visible ? '1' : '0';
  var pointerEvents = visible ? 'auto' : 'none';
  this.btnPlus_.setAttribute('opacity', opacity);
  this.btnMinus_.setAttribute('opacity', opacity);
  this.btnPlus_.setAttribute('pointer-events', pointerEvents);
  this.btnMinus_.setAttribute('pointer-events', pointerEvents);
};

/**
 * Set extender visibility in auto-hide mode.
 * @param {boolean} visible Whether extenders should be visible.
 * @private
 */
Blockly.FieldExtender.prototype.setExtendersVisible_ = function(visible) {
  if (this.extendersVisible_ === visible) return;
  this.extendersVisible_ = visible;
  this.applyVisibility_();
};

/**
 * Check whether client pointer is near the provided block path.
 * @param {?Blockly.Block} block Block to test.
 * @param {number} clientX Pointer x in client coordinates.
 * @param {number} clientY Pointer y in client coordinates.
 * @return {boolean}
 * @private
 */
Blockly.FieldExtender.prototype.isMouseNearBlockPath_ = function(block, clientX, clientY) {
  if (!block || !block.svgPath_) return false;
  var rect = block.svgPath_.getBoundingClientRect();
  var pad = Blockly.FieldExtender.HOVER_REVEAL_PADDING;
  return clientX >= rect.left - pad && clientX <= rect.right + pad &&
      clientY >= rect.top - pad && clientY <= rect.bottom + pad;
};

/**
 * Workspace mousemove handler for auto-hide mode.
 * @param {!MouseEvent} e Mouse move event.
 * @private
 */
Blockly.FieldExtender.prototype.onWorkspaceMouseMove_ = function(e) {
  if (!this.shouldAutoHide_()) {
    this.setExtendersVisible_(true);
    return;
  }
  var block = this.sourceBlock_;
  var parent = block && block.getParent && block.getParent();
  var visible = this.isMouseNearBlockPath_(block, e.clientX, e.clientY) ||
      this.isMouseNearBlockPath_(parent, e.clientX, e.clientY);
  this.setExtendersVisible_(visible);
};

/**
 * Workspace mouseleave handler for auto-hide mode.
 * @private
 */
Blockly.FieldExtender.prototype.onWorkspaceMouseLeave_ = function() {
  if (!this.shouldAutoHide_()) return;
  this.setExtendersVisible_(false);
};

/**
 * Update internal layout metrics when rendered.
 * @private
 */
Blockly.FieldExtender.prototype.render_ = function() {
  if (this.sourceBlock_ && this.rectMinus_ && this.rectPlus_) {
    var colorSource = this.getColorSourceBlock_();
    var stroke = colorSource.getColourTertiary();
    var fill = colorSource.getColour();
    this.rectMinus_.setAttribute('stroke', stroke);
    this.rectPlus_.setAttribute('stroke', stroke);
    this.rectMinus_.setAttribute('fill', fill);
    this.rectPlus_.setAttribute('fill', fill);
  }
  this.calcSize_();
  this.updateButtonLayout_();
  if (this.shouldAutoHide_()) {
    this.setExtendersVisible_(false);
  } else {
    this.setExtendersVisible_(true);
  }
};

Blockly.FieldExtender.prototype.getSize = function() {
  this.calcSize_();
  return Blockly.FieldExtender.superClass_.getSize.call(this);
};

/**
 * Handle a mouse down event on plus button.
 * @param {boolean} isPlus true if plus button clicked.
 * @param {!MouseEvent} e Mouse down event.
 * @private
 */
Blockly.FieldExtender.prototype.onMouseDown_ = function(isPlus, e) {
  if (!this.sourceBlock_ || !this.sourceBlock_.workspace) {
    return;
  }
  this.pendingIsPlus_ = isPlus;
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture) {
    gesture.setStartField(this);
  }
  this.useTouchInteraction_ = Blockly.Touch.getTouchIdentifierFromEvent(e) !== 'mouse';
};

/**
 * Process click event.
 * @private
 */
Blockly.FieldExtender.prototype.showEditor_ = function() {
  // Use only the latest pointer-down action.
  if (this.pendingIsPlus_ === null) {
    return;
  }
  var isPlus = this.pendingIsPlus_;
  this.pendingIsPlus_ = null;

  if (isPlus) {
    this.handlePlus_();
  } else {
    this.handleMinus_();
  }
};

/**
 * Handle hover.
 * @param {boolean} isEnter true if mouse enter, otherwise mouse leave
 * @param {SVGElement} obj rect svg element
 * @private
 */
Blockly.FieldExtender.prototype.handleHover_ = function(isEnter, obj) {
  var colorSource = this.getColorSourceBlock_();
  obj.setAttribute('fill', isEnter
  ? colorSource.getColourTertiary() : colorSource.getColour());
};

/**
 * Enable or disable the plus button.
 * @param {boolean} enable true if enable.
 */
Blockly.FieldExtender.prototype.setEnablePlus = function(enable) {
  if (this.enablePlus_ === enable) return;
  this.enablePlus_ = enable;
  this.render_();
  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
  }
};

/**
 * Enable or disable the minus button.
 * @param {boolean} enable true if enable.
 */
Blockly.FieldExtender.prototype.setEnableMinus = function(enable) {
  if (this.enableMinus_ === enable) return;
  this.enableMinus_ = enable;
  this.render_();
  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
  }
};

Blockly.Field.register('field_plus_minus', Blockly.FieldExtender);
