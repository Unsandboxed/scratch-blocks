/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2026 MIT
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
 * @fileoverview Vector2 text field.
 */
'use strict';

goog.provide('Blockly.FieldVec2');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils');

/**
 * Class for an editable vec2 field with "x, y" formatting.
 * @param {(string|undefined)=} opt_value Initial value.
 * @param {Function=} opt_validator Optional user validator.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldVec2 = function(opt_value, opt_validator) {
  var initial = Blockly.FieldVec2.normalize_(opt_value || '0, 0');
  Blockly.FieldVec2.superClass_.constructor.call(
      this, initial, opt_validator);
  this.addArgType('vec2');
};
goog.inherits(Blockly.FieldVec2, Blockly.FieldTextInput);

/**
 * Construct a FieldVec2 from a JSON arg object.
 * @param {!Object} options A JSON object with options (value).
 * @returns {!Blockly.FieldVec2} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldVec2.fromJson = function(options) {
  return new Blockly.FieldVec2(options['value']);
};

/**
 * Close the dropdown editor if this field is being deleted.
 */
Blockly.FieldVec2.prototype.dispose = function() {
  Blockly.DropDownDiv.hideIfOwner(this);
  Blockly.FieldVec2.superClass_.dispose.call(this);
};

/**
 * Class-level validator for vec2 text.
 * @param {?string} text Candidate text.
 * @return {?string} Normalized text, or original text when incomplete.
 * @protected
 */
Blockly.FieldVec2.prototype.classValidator = function(text) {
  if (text === null || typeof text === 'undefined') {
    return null;
  }
  return Blockly.FieldVec2.normalize_(text);
};

/**
 * Show a dropdown vec2 editor styled similarly to FieldAngle.
 * @private
 */
Blockly.FieldVec2.prototype.showEditor_ = function() {
  var thisField = this;
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  var parentBlock = this.sourceBlock_.parentBlock_ || this.sourceBlock_;

  var stats = document.createElement('div');
  stats.style.marginBottom = '4px';
  stats.style.textAlign = 'center';
  stats.style.fontSize = '11px';
  stats.style.fontWeight = '600';
  stats.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  stats.style.color = '#ffffff';
  contentDiv.appendChild(stats);

  var inputRow = document.createElement('div');
  inputRow.style.display = 'flex';
  inputRow.style.justifyContent = 'center';
  inputRow.style.gap = '6px';
  inputRow.style.marginBottom = '4px';
  contentDiv.appendChild(inputRow);

  var makeInput = function() {
    var input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.style.width = '58px';
    input.style.height = '20px';
    input.style.border = '1px solid rgba(255,255,255,0.5)';
    input.style.borderRadius = '10px';
    input.style.background = 'rgba(255,255,255,0.15)';
    input.style.color = '#fff';
    input.style.textAlign = 'center';
    input.style.fontSize = '11px';
    input.style.outline = 'none';
    return input;
  };

  var xInput = makeInput();
  var yInput = makeInput();
  inputRow.appendChild(xInput);
  inputRow.appendChild(yInput);

  var floatToggle = document.createElement('button');
  floatToggle.type = 'button';
  floatToggle.textContent = 'f';
  floatToggle.style.width = '20px';
  floatToggle.style.height = '20px';
  floatToggle.style.border = '1px solid rgba(255,255,255,0.5)';
  floatToggle.style.borderRadius = '10px';
  floatToggle.style.background = 'rgba(255,255,255,0.15)';
  floatToggle.style.color = '#fff';
  floatToggle.style.fontSize = '11px';
  floatToggle.style.cursor = 'pointer';
  inputRow.appendChild(floatToggle);

  var svgSize = 140;
  var center = svgSize / 2;
  var radius = 54;
  var valueRange = 100;
  var svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'version': '1.1',
    'height': svgSize + 'px',
    'width': svgSize + 'px'
  }, contentDiv);

  Blockly.utils.createSvgElement('circle', {
    'cx': center,
    'cy': center,
    'r': radius,
    'fill': parentBlock.getColourSecondary(),
    'stroke': parentBlock.getColourTertiary(),
    'stroke-width': 1
  }, svg);

  for (var markAngle = 0; markAngle < 360; markAngle += 15) {
    Blockly.utils.createSvgElement('line', {
      'x1': center + radius - 10,
      'y1': center,
      'x2': center + radius - 5,
      'y2': center,
      'stroke': '#ffffff',
      'stroke-opacity': 0.35,
      'stroke-width': 1,
      'transform': 'rotate(' + markAngle + ',' + center + ',' + center + ')'
    }, svg);
  }

  Blockly.utils.createSvgElement('line', {
    'x1': center - radius,
    'y1': center,
    'x2': center + radius,
    'y2': center,
    'stroke': '#ffffff',
    'stroke-opacity': 0.55,
    'stroke-width': 1
  }, svg);
  Blockly.utils.createSvgElement('line', {
    'x1': center,
    'y1': center - radius,
    'x2': center,
    'y2': center + radius,
    'stroke': '#ffffff',
    'stroke-opacity': 0.55,
    'stroke-width': 1
  }, svg);

  Blockly.utils.createSvgElement('circle', {
    'cx': center,
    'cy': center,
    'r': 3,
    'fill': '#ffffff'
  }, svg);

  var vectorLine = Blockly.utils.createSvgElement('line', {
    'x1': center,
    'y1': center,
    'x2': center,
    'y2': center,
    'stroke': '#ffffff',
    'stroke-width': 2.5
  }, svg);

  var handle = Blockly.utils.createSvgElement('circle', {
    'cx': center,
    'cy': center,
    'r': 7,
    'fill': parentBlock.getColour(),
    'stroke': '#ffffff',
    'stroke-width': 2.5,
    'cursor': 'pointer'
  }, svg);

  var current = Blockly.FieldVec2.parse_(this.getValue());
  var currentVec = {
    x: Math.max(-valueRange, Math.min(valueRange, current.x)),
    y: Math.max(-valueRange, Math.min(valueRange, current.y))
  };
  var allowFloats = Math.round(currentVec.x) !== currentVec.x ||
      Math.round(currentVec.y) !== currentVec.y;
  var updatingInputs = false;
  var angleStep = (Blockly.FieldAngle && Blockly.FieldAngle.ROUND) ? Blockly.FieldAngle.ROUND : 15;

  var quantize = function(value) {
    return allowFloats ? Number(value.toFixed(2)) : Math.round(value);
  };

  var render = function(commit) {
    var px = center + (currentVec.x / valueRange) * radius;
    var py = center - (currentVec.y / valueRange) * radius;
    handle.setAttribute('cx', px);
    handle.setAttribute('cy', py);
    vectorLine.setAttribute('x2', px);
    vectorLine.setAttribute('y2', py);
    var mag = Math.sqrt(currentVec.x * currentVec.x + currentVec.y * currentVec.y);
    stats.textContent = 'm:' + mag.toFixed(1).replace(/\.0$/, '');
    floatToggle.style.background = allowFloats ? '#ffffff' : 'rgba(255,255,255,0.15)';
    floatToggle.style.color = allowFloats ? parentBlock.getColour() : '#fff';
    updatingInputs = true;
    xInput.step = allowFloats ? 'any' : '1';
    yInput.step = allowFloats ? 'any' : '1';
    xInput.value = String(quantize(currentVec.x)).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    yInput.value = String(quantize(currentVec.y)).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    updatingInputs = false;
    if (commit) {
      thisField.setValue(
          String(quantize(currentVec.x)).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1') +
          ', ' +
          String(quantize(currentVec.y)).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1'));
    }
  };

  var dragging = false;
  var updateFromPointer = function(clientX, clientY, snapAngle) {
    var bBox = svg.getBoundingClientRect();
    var dx = clientX - bBox.left - center;
    var dy = clientY - bBox.top - center;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      dx = dx / dist * radius;
      dy = dy / dist * radius;
    }
    var rawX = (dx / radius) * valueRange;
    var rawY = (-dy / radius) * valueRange;
    var angle = Math.atan2(rawY, rawX) * (180 / Math.PI);
    var mag = Math.sqrt(rawX * rawX + rawY * rawY);
    if (snapAngle && mag > 0) {
      angle = Math.round(angle / angleStep) * angleStep;
      var radians = angle * (Math.PI / 180);
      rawX = Math.cos(radians) * mag;
      rawY = Math.sin(radians) * mag;
    }
    currentVec.x = quantize(rawX);
    currentVec.y = quantize(rawY);
    render(true);
  };

  var applyTextInputs = function() {
    if (updatingInputs) {
      return;
    }
    var x = Number(xInput.value);
    var y = Number(yInput.value);
    if (!isFinite(x) || !isFinite(y)) {
      return;
    }
    currentVec.x = quantize(Math.max(-valueRange, Math.min(valueRange, x)));
    currentVec.y = quantize(Math.max(-valueRange, Math.min(valueRange, y)));
    render(true);
  };

  this.dropdownEvents_ = [];
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(svg, 'mousedown', this, function(e) {
    e.preventDefault();
    dragging = true;
    updateFromPointer(e.clientX, e.clientY, !!e.shiftKey);
  }));
  this.dropdownEvents_.push(Blockly.bindEvent_(document.body, 'mousemove', this, function(e) {
    if (!dragging) {
      return;
    }
    e.preventDefault();
    updateFromPointer(e.clientX, e.clientY, !!e.shiftKey);
  }));
  this.dropdownEvents_.push(Blockly.bindEvent_(document.body, 'mouseup', this, function() {
    dragging = false;
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(svg, 'keydown', this, function(e) {
    if (e.keyCode == 27) {
      Blockly.DropDownDiv.hideIfOwner(thisField);
    }
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(xInput, 'change', this, applyTextInputs));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(yInput, 'change', this, applyTextInputs));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(xInput, 'keydown', this, function(e) {
    if (e.keyCode == 13) {
      applyTextInputs();
    }
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(yInput, 'keydown', this, function(e) {
    if (e.keyCode == 13) {
      applyTextInputs();
    }
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(floatToggle, 'mousedown', this, function(e) {
    e.preventDefault();
    allowFloats = !allowFloats;
    currentVec.x = quantize(currentVec.x);
    currentVec.y = quantize(currentVec.y);
    render(true);
  }));

  var colourSource = this.sourceBlock_;
  if (this.sourceBlock_.isShadow && this.sourceBlock_.isShadow() && this.sourceBlock_.parentBlock_) {
    colourSource = this.sourceBlock_.parentBlock_;
  }
  Blockly.DropDownDiv.setColour(parentBlock.getColour(), this.sourceBlock_.getColourTertiary());
  if (colourSource.getCategory) {
    Blockly.DropDownDiv.setCategory(colourSource.getCategory());
  }
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_, this.dropdownDispose_.bind(this));

  render(false);
};

/**
 * Cleanup dropdown event handlers.
 * @private
 */
Blockly.FieldVec2.prototype.dropdownDispose_ = function() {
  if (this.dropdownEvents_) {
    for (var i = 0; i < this.dropdownEvents_.length; i++) {
      Blockly.unbindEvent_(this.dropdownEvents_[i]);
    }
    this.dropdownEvents_ = null;
  }
  Blockly.Events.setGroup(false);
};

/**
 * Normalize vec2 strings to "x, y" when parseable.
 * @param {string} text Input text.
 * @return {string} Normalized vec2 or original text when not parseable.
 * @private
 */
Blockly.FieldVec2.normalize_ = function(text) {
  var source = String(text).trim();
  var match = source.match(/^([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*[, ]\s*([+-]?(?:\d+\.?\d*|\d*\.\d+))$/);
  if (!match) {
    return source;
  }
  var x = Number(match[1]);
  var y = Number(match[2]);
  if (!isFinite(x) || !isFinite(y)) {
    return source;
  }
  return x.toString() + ', ' + y.toString();
};

/**
 * Parse vec2 text with fallback values.
 * @param {string} text Vec2 text.
 * @return {{x:number,y:number}} Parsed values.
 * @private
 */
Blockly.FieldVec2.parse_ = function(text) {
  var match = String(text).trim().match(/^([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*[, ]\s*([+-]?(?:\d+\.?\d*|\d*\.\d+))$/);
  if (!match) {
    return {x: 0, y: 0};
  }
  return {x: Number(match[1]), y: Number(match[2])};
};

Blockly.Field.register('field_vec2', Blockly.FieldVec2);
