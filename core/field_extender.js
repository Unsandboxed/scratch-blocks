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

Blockly.FieldExtender = function(handlePlus, handleMinus, opt_enablePlus, opt_enableMinus, opt_iconLayout) {
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
        'stroke': this.sourceBlock_.getColourTertiary(),
        'fill': this.sourceBlock_.getColour(),
        'fill-opacity': 1,
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
        'stroke': this.sourceBlock_.getColourTertiary(),
        'fill': this.sourceBlock_.getColour(),
        'fill-opacity': 1,
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
};

/**
 * Update internal layout metrics when rendered.
 * @private
 */
Blockly.FieldExtender.prototype.render_ = function() {
  this.calcSize_();
  this.updateButtonLayout_();
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
  obj.setAttribute('fill', isEnter
      ? this.sourceBlock_.getColourTertiary() : this.sourceBlock_.getColour());
  this.render_();
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
