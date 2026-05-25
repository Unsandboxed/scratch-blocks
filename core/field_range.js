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
 * @fileoverview Numeric range field.
 */
'use strict';

goog.provide('Blockly.FieldRange');

goog.require('Blockly.Colours');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');

/**
 * Class for an editable range field with "min..max" formatting.
 * @param {(string|undefined)=} opt_value Initial value.
 * @param {Function=} opt_validator Optional user validator.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldRange = function(opt_value, opt_validator) {
  var initial = Blockly.FieldRange.normalize_(opt_value || '0..1');
  Blockly.FieldRange.superClass_.constructor.call(
      this, initial, opt_validator);
  this.addArgType('range');
};
goog.inherits(Blockly.FieldRange, Blockly.FieldTextInput);

/**
 * Construct a FieldRange from a JSON arg object.
 * @param {!Object} options A JSON object with options (value).
 * @returns {!Blockly.FieldRange} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldRange.fromJson = function(options) {
  return new Blockly.FieldRange(options['value']);
};

/**
 * Close the dropdown editor if this field is being deleted.
 */
Blockly.FieldRange.prototype.dispose = function() {
  Blockly.DropDownDiv.hideIfOwner(this);
  Blockly.FieldRange.superClass_.dispose.call(this);
};

/**
 * Class-level validator for range text.
 * @param {?string} text Candidate text.
 * @return {?string} Normalized text, or original text when incomplete.
 * @protected
 */
Blockly.FieldRange.prototype.classValidator = function(text) {
  if (text === null || typeof text === 'undefined') {
    return null;
  }
  return Blockly.FieldRange.normalize_(text);
};

/**
 * Show a dropdown range editor with min and max numeric inputs.
 * @private
 */
Blockly.FieldRange.prototype.showEditor_ = function() {
  var thisField = this;
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  var wrap = document.createElement('div');
  wrap.style.width = '218px';
  contentDiv.appendChild(wrap);

  var readout = document.createElement('div');
  readout.style.textAlign = 'center';
  readout.style.fontSize = '13px';
  readout.style.fontWeight = '600';
  readout.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  readout.style.color = '#575e75';
  readout.style.marginBottom = '8px';
  wrap.appendChild(readout);

  var bar = document.createElement('div');
  bar.style.position = 'relative';
  bar.style.height = '24px';
  bar.style.cursor = 'pointer';
  wrap.appendChild(bar);

  var track = document.createElement('div');
  track.style.position = 'absolute';
  track.style.left = '8px';
  track.style.right = '8px';
  track.style.top = '10px';
  track.style.height = '4px';
  track.style.borderRadius = '999px';
  track.style.background = '#d2d7e3';
  bar.appendChild(track);

  var active = document.createElement('div');
  active.style.position = 'absolute';
  active.style.top = '10px';
  active.style.height = '4px';
  active.style.borderRadius = '999px';
  active.style.background = '#4c97ff';
  bar.appendChild(active);

  var minHandle = document.createElement('div');
  minHandle.style.position = 'absolute';
  minHandle.style.top = '4px';
  minHandle.style.width = '14px';
  minHandle.style.height = '14px';
  minHandle.style.borderRadius = '50%';
  minHandle.style.background = '#fff';
  minHandle.style.border = '2px solid #4c97ff';
  minHandle.style.boxSizing = 'border-box';
  bar.appendChild(minHandle);

  var maxHandle = document.createElement('div');
  maxHandle.style.position = 'absolute';
  maxHandle.style.top = '4px';
  maxHandle.style.width = '14px';
  maxHandle.style.height = '14px';
  maxHandle.style.borderRadius = '50%';
  maxHandle.style.background = '#fff';
  maxHandle.style.border = '2px solid #4c97ff';
  maxHandle.style.boxSizing = 'border-box';
  bar.appendChild(maxHandle);

  var controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.justifyContent = 'space-between';
  controls.style.alignItems = 'center';
  controls.style.marginTop = '8px';
  wrap.appendChild(controls);

  var sampleText = document.createElement('div');
  sampleText.style.fontSize = '11px';
  sampleText.style.opacity = '0.8';
  sampleText.style.color = '#575e75';
  controls.appendChild(sampleText);

  var sampleBtn = document.createElement('button');
  sampleBtn.type = 'button';
  sampleBtn.textContent = '\u25C9';
  sampleBtn.title = 'Sample';
  sampleBtn.style.border = '1px solid rgba(0,0,0,0.2)';
  sampleBtn.style.borderRadius = '10px';
  sampleBtn.style.background = '#fff';
  sampleBtn.style.fontSize = '11px';
  sampleBtn.style.width = '24px';
  sampleBtn.style.height = '20px';
  sampleBtn.style.lineHeight = '18px';
  sampleBtn.style.cursor = 'pointer';
  controls.appendChild(sampleBtn);

  var editRow = document.createElement('div');
  editRow.style.display = 'flex';
  editRow.style.alignItems = 'center';
  editRow.style.gap = '6px';
  editRow.style.marginTop = '7px';
  wrap.appendChild(editRow);

  var minInput = document.createElement('input');
  minInput.type = 'number';
  minInput.step = 'any';
  minInput.style.width = '68px';
  minInput.style.height = '20px';
  minInput.style.fontSize = '11px';
  minInput.style.textAlign = 'center';
  minInput.style.border = '1px solid rgba(0,0,0,0.25)';
  minInput.style.borderRadius = '10px';
  editRow.appendChild(minInput);

  var dots = document.createElement('span');
  dots.textContent = '..';
  dots.style.fontSize = '11px';
  dots.style.color = '#7d8398';
  editRow.appendChild(dots);

  var maxInput = document.createElement('input');
  maxInput.type = 'number';
  maxInput.step = 'any';
  maxInput.style.width = '68px';
  maxInput.style.height = '20px';
  maxInput.style.fontSize = '11px';
  maxInput.style.textAlign = 'center';
  maxInput.style.border = '1px solid rgba(0,0,0,0.25)';
  maxInput.style.borderRadius = '10px';
  editRow.appendChild(maxInput);

  var intBtn = document.createElement('button');
  intBtn.type = 'button';
  intBtn.textContent = 'int';
  intBtn.style.width = '32px';
  intBtn.style.height = '20px';
  intBtn.style.fontSize = '10px';
  intBtn.style.border = '1px solid rgba(0,0,0,0.25)';
  intBtn.style.borderRadius = '10px';
  intBtn.style.background = '#fff';
  intBtn.style.cursor = 'pointer';
  editRow.appendChild(intBtn);

  var parsed = Blockly.FieldRange.parse_(this.getValue());
  var low = Math.min(parsed.min, parsed.max);
  var high = Math.max(parsed.min, parsed.max);
  var intMode = (Math.round(low) === low && Math.round(high) === high);
  var updatingInputs = false;
  var domainMin = Math.floor((Math.min(0, low) - 10) / 5) * 5;
  var domainMax = Math.ceil((Math.max(0, high) + 10) / 5) * 5;
  if (domainMax <= domainMin) {
    domainMax = domainMin + 10;
  }

  var toPx = function(v) {
    var width = bar.clientWidth - 16;
    var t = (v - domainMin) / (domainMax - domainMin);
    return 8 + t * width;
  };
  var toValue = function(px) {
    var width = bar.clientWidth - 16;
    var t = (px - 8) / width;
    t = Math.max(0, Math.min(1, t));
    return domainMin + t * (domainMax - domainMin);
  };

  var quantize = function(n) {
    if (intMode) {
      return Math.round(n);
    }
    return n;
  };

  var format = function(n) {
    if (intMode) {
      return String(Math.round(n));
    }
    return n.toFixed(2).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  };

  var commit = function() {
    thisField.setValue(format(low) + '..' + format(high));
  };

  var render = function(commitValue) {
    low = quantize(low);
    high = quantize(high);
    var lowPx = toPx(low);
    var highPx = toPx(high);
    minHandle.style.left = (lowPx - 7) + 'px';
    maxHandle.style.left = (highPx - 7) + 'px';
    active.style.left = lowPx + 'px';
    active.style.width = (highPx - lowPx) + 'px';
    readout.textContent = format(low) + ' .. ' + format(high);
    intBtn.style.background = intMode ? '#4c97ff' : '#fff';
    intBtn.style.color = intMode ? '#fff' : '#222';
    intBtn.style.borderColor = intMode ? '#2e5da8' : 'rgba(0,0,0,0.25)';
    updatingInputs = true;
    minInput.value = format(low);
    maxInput.value = format(high);
    minInput.step = intMode ? '1' : 'any';
    maxInput.step = intMode ? '1' : 'any';
    updatingInputs = false;
    if (commitValue) {
      commit();
    }
  };

  var sample = function() {
    var n = low + Math.random() * (high - low);
    sampleText.textContent = 'sample: ' + format(n);
  };

  var dragging = null;
  var updateDrag = function(clientX) {
    var b = bar.getBoundingClientRect();
    var v = toValue(clientX - b.left);
    if (dragging === 'low') {
      low = Math.min(quantize(v), high);
    } else if (dragging === 'high') {
      high = Math.max(quantize(v), low);
    }
    render(true);
  };

  this.dropdownEvents_ = [];
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(minHandle, 'mousedown', this, function(e) {
    e.preventDefault();
    dragging = 'low';
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(maxHandle, 'mousedown', this, function(e) {
    e.preventDefault();
    dragging = 'high';
  }));
  this.dropdownEvents_.push(Blockly.bindEvent_(document.body, 'mousemove', this, function(e) {
    if (!dragging) {
      return;
    }
    e.preventDefault();
    updateDrag(e.clientX);
  }));
  this.dropdownEvents_.push(Blockly.bindEvent_(document.body, 'mouseup', this, function() {
    dragging = null;
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(bar, 'mousedown', this, function(e) {
    var b = bar.getBoundingClientRect();
    var x = e.clientX - b.left;
    var lowPx = toPx(low);
    var highPx = toPx(high);
    dragging = Math.abs(x - lowPx) < Math.abs(x - highPx) ? 'low' : 'high';
    updateDrag(e.clientX);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(sampleBtn, 'mousedown', this, function(e) {
    e.preventDefault();
    sample();
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(intBtn, 'mousedown', this, function(e) {
    e.preventDefault();
    intMode = !intMode;
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(minInput, 'change', this, function() {
    if (updatingInputs) {
      return;
    }
    var nextMin = Number(minInput.value);
    if (!isFinite(nextMin)) {
      return;
    }
    low = quantize(Math.min(nextMin, high));
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(maxInput, 'change', this, function() {
    if (updatingInputs) {
      return;
    }
    var nextMax = Number(maxInput.value);
    if (!isFinite(nextMax)) {
      return;
    }
    high = quantize(Math.max(nextMax, low));
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(minInput, 'keydown', this, function(e) {
    if (e.keyCode == 13) {
      var nextMin = Number(minInput.value);
      if (isFinite(nextMin)) {
        low = quantize(Math.min(nextMin, high));
        render(true);
      }
    }
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(maxInput, 'keydown', this, function(e) {
    if (e.keyCode == 13) {
      var nextMax = Number(maxInput.value);
      if (isFinite(nextMax)) {
        high = quantize(Math.max(nextMax, low));
        render(true);
      }
    }
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(bar, 'keydown', this, function(e) {
    if (e.keyCode == 27) {
      Blockly.DropDownDiv.hideIfOwner(thisField);
    }
  }));

  var colourSource = this.sourceBlock_;
  if (this.sourceBlock_.isShadow && this.sourceBlock_.isShadow() && this.sourceBlock_.parentBlock_) {
    colourSource = this.sourceBlock_.parentBlock_;
  }
  Blockly.DropDownDiv.setColour(Blockly.Colours.valueReportBackground, Blockly.Colours.valueReportBorder);
  if (colourSource.getCategory) {
    Blockly.DropDownDiv.setCategory(colourSource.getCategory());
  }
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_, this.dropdownDispose_.bind(this));

  render(true);
  sample();
};

/**
 * Cleanup dropdown event handlers.
 * @private
 */
Blockly.FieldRange.prototype.dropdownDispose_ = function() {
  if (this.dropdownEvents_) {
    for (var i = 0; i < this.dropdownEvents_.length; i++) {
      Blockly.unbindEvent_(this.dropdownEvents_[i]);
    }
    this.dropdownEvents_ = null;
  }
  Blockly.Events.setGroup(false);
};

/**
 * Normalize range strings to "min..max".
 * Accepts separators: "..", "-", "to".
 * @param {string} text Input text.
 * @return {string} Normalized range or original text when not parseable.
 * @private
 */
Blockly.FieldRange.normalize_ = function(text) {
  var source = String(text).trim();
  var match = source.match(/^([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*(?:\.\.|-|to)\s*([+-]?(?:\d+\.?\d*|\d*\.\d+))$/i);
  if (!match) {
    return source;
  }
  var min = Number(match[1]);
  var max = Number(match[2]);
  if (!isFinite(min) || !isFinite(max)) {
    return source;
  }
  return min.toString() + '..' + max.toString();
};

/**
 * Parse range text with fallback values.
 * @param {string} text Range text.
 * @return {{min:number,max:number}} Parsed range.
 * @private
 */
Blockly.FieldRange.parse_ = function(text) {
  var match = String(text).trim().match(/^([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*(?:\.\.|-|to)\s*([+-]?(?:\d+\.?\d*|\d*\.\d+))$/i);
  if (!match) {
    return {min: 0, max: 1};
  }
  return {min: Number(match[1]), max: Number(match[2])};
};

Blockly.Field.register('field_range', Blockly.FieldRange);
