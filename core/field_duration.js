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
 * @fileoverview Duration field with unit normalization.
 */
'use strict';

goog.provide('Blockly.FieldDuration');

goog.require('Blockly.Colours');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');

/**
 * Class for an editable duration field.
 * @param {(string|undefined)=} opt_value Initial value.
 * @param {Function=} opt_validator Optional user validator.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldDuration = function(opt_value, opt_validator) {
  var initial = Blockly.FieldDuration.normalize_(opt_value || '1 s');
  Blockly.FieldDuration.superClass_.constructor.call(
      this, initial, opt_validator);
  this.addArgType('duration');
};
goog.inherits(Blockly.FieldDuration, Blockly.FieldTextInput);

/**
 * Construct a FieldDuration from a JSON arg object.
 * @param {!Object} options A JSON object with options (value).
 * @returns {!Blockly.FieldDuration} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDuration.fromJson = function(options) {
  return new Blockly.FieldDuration(options['value']);
};

/**
 * Default frames-per-second for converting the "frames" duration unit.
 * @type {number}
 * @private
 */
Blockly.FieldDuration.framesPerSecond_ = 60;

/**
 * Optional external provider used to resolve FPS at runtime.
 * GUI can supply a callback here without exposing FPS UI in Blockly.
 * @type {?Function}
 * @private
 */
Blockly.FieldDuration.getFramesPerSecond_ = null;

/**
 * Set a static FPS value for frame conversion.
 * @param {number} fps Frames per second.
 */
Blockly.FieldDuration.setFramesPerSecond = function(fps) {
  var parsed = Number(fps);
  if (!isFinite(parsed)) {
    return;
  }
  Blockly.FieldDuration.framesPerSecond_ = Math.max(1, Math.min(1000, parsed));
};

/**
 * Set an external FPS provider callback.
 * The callback should return a numeric FPS value.
 * @param {?Function} provider Provider callback or null.
 */
Blockly.FieldDuration.setFramesPerSecondProvider = function(provider) {
  Blockly.FieldDuration.getFramesPerSecond_ = provider;
};

/**
 * Resolve the current FPS used for frame conversion.
 * @return {number} Frames per second.
 * @private
 */
Blockly.FieldDuration.resolveFramesPerSecond_ = function() {
  var fps = Blockly.FieldDuration.framesPerSecond_;
  if (Blockly.FieldDuration.getFramesPerSecond_) {
    var provided = Number(Blockly.FieldDuration.getFramesPerSecond_());
    if (isFinite(provided)) {
      fps = provided;
    }
  }
  return Math.max(1, Math.min(1000, fps));
};

/**
 * Close the dropdown editor if this field is being deleted.
 */
Blockly.FieldDuration.prototype.dispose = function() {
  Blockly.DropDownDiv.hideIfOwner(this);
  Blockly.FieldDuration.superClass_.dispose.call(this);
};

/**
 * Class-level validator for duration text.
 * @param {?string} text Candidate text.
 * @return {?string} Normalized text, or original text when incomplete.
 * @protected
 */
Blockly.FieldDuration.prototype.classValidator = function(text) {
  if (text === null || typeof text === 'undefined') {
    return null;
  }
  return Blockly.FieldDuration.normalize_(text);
};

/**
 * Show a dropdown duration editor with numeric value and unit select.
 * @private
 */
Blockly.FieldDuration.prototype.showEditor_ = function() {
  var thisField = this;
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  contentDiv.style.overflow = 'hidden';
  var wrap = document.createElement('div');
  wrap.style.width = '214px';
  contentDiv.appendChild(wrap);

  var readout = document.createElement('div');
  readout.style.textAlign = 'center';
  readout.style.fontSize = '14px';
  readout.style.fontWeight = '600';
  readout.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  readout.style.color = '#575e75';
  readout.style.marginBottom = '8px';
  wrap.appendChild(readout);

  var infoRow = document.createElement('div');
  infoRow.style.display = 'flex';
  infoRow.style.justifyContent = 'center';
  infoRow.style.marginBottom = '6px';
  wrap.appendChild(infoRow);

  var valueInput = document.createElement('input');
  valueInput.type = 'number';
  valueInput.step = 'any';
  valueInput.style.width = '84px';
  valueInput.style.height = '20px';
  valueInput.style.fontSize = '11px';
  valueInput.style.textAlign = 'center';
  valueInput.style.border = '1px solid rgba(0,0,0,0.25)';
  valueInput.style.borderRadius = '10px';
  infoRow.appendChild(valueInput);

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
  active.style.left = '8px';
  active.style.top = '10px';
  active.style.height = '4px';
  active.style.borderRadius = '999px';
  active.style.background = '#4c97ff';
  bar.appendChild(active);

  var handle = document.createElement('div');
  handle.style.position = 'absolute';
  handle.style.top = '4px';
  handle.style.width = '14px';
  handle.style.height = '14px';
  handle.style.borderRadius = '50%';
  handle.style.background = '#fff';
  handle.style.border = '2px solid #4c97ff';
  handle.style.boxSizing = 'border-box';
  bar.appendChild(handle);

  var marks = document.createElement('div');
  marks.style.display = 'flex';
  marks.style.justifyContent = 'space-between';
  marks.style.marginTop = '-10px';
  marks.style.fontSize = '10px';
  marks.style.color = '#8b92a8';
  marks.textContent = '';
  var marksLeft = document.createElement('span');
  marksLeft.textContent = '0';
  marksLeft.style.cursor = 'pointer';
  var marksMid = document.createElement('span');
  marksMid.textContent = '1s';
  marksMid.style.cursor = 'pointer';
  var marksRight = document.createElement('span');
  marksRight.textContent = '5s';
  marksRight.style.cursor = 'pointer';
  marks.appendChild(marksLeft);
  marks.appendChild(marksMid);
  marks.appendChild(marksRight);
  wrap.appendChild(marks);

  var unitRow = document.createElement('div');
  unitRow.style.display = 'flex';
  unitRow.style.justifyContent = 'center';
  unitRow.style.gap = '6px';
  unitRow.style.marginTop = '8px';
  wrap.appendChild(unitRow);

  var makeUnitChip = function(label, unit) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = label;
    chip.setAttribute('data-unit', unit);
    chip.style.minWidth = '34px';
    chip.style.border = '1px solid rgba(0,0,0,0.25)';
    chip.style.borderRadius = '10px';
    chip.style.background = '#fff';
    chip.style.cursor = 'pointer';
    chip.style.fontSize = '11px';
    return chip;
  };

  var msChip = makeUnitChip('ms', 'ms');
  var sChip = makeUnitChip('s', 's');
  var fChip = makeUnitChip('fr', 'frames');
  unitRow.appendChild(msChip);
  unitRow.appendChild(sChip);
  unitRow.appendChild(fChip);

  var parsed = Blockly.FieldDuration.parse_(this.getValue());
  var activeUnit = parsed.unit;
  var fps = Blockly.FieldDuration.resolveFramesPerSecond_();

  var domainMin = 0;
  var domainMax = 5000;
  var precisionCurve = 2.2;
  var toPx = function(value) {
    var width = bar.clientWidth - 16;
    var linear = (value - domainMin) / (domainMax - domainMin);
    var t = Math.pow(Math.max(0, Math.min(1, linear)), 1 / precisionCurve);
    return 8 + t * width;
  };
  var toValue = function(px) {
    var width = bar.clientWidth - 16;
    var t = (px - 8) / width;
    t = Math.max(0, Math.min(1, t));
    return domainMin + Math.pow(t, precisionCurve) * (domainMax - domainMin);
  };

  var toMs = function(value, unit) {
    if (unit === 'ms') {
      return value;
    }
    if (unit === 's') {
      return value * 1000;
    }
    return value * (1000 / fps);
  };
  var fromMs = function(ms, unit) {
    if (unit === 'ms') {
      return ms;
    }
    if (unit === 's') {
      return ms / 1000;
    }
    return ms / (1000 / fps);
  };

  var msValue = toMs(parsed.value, parsed.unit);
  msValue = Math.max(0, Math.min(5000, msValue));

  var formatNumber = function(value) {
    return value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  };

  var updatingInputs = false;

  var dragging = false;
  var updateFromPointer = function(clientX) {
    var b = bar.getBoundingClientRect();
    msValue = toValue(clientX - b.left);
    render(true);
  };

  var render = function(commit) {
    msValue = Math.max(domainMin, Math.min(domainMax, msValue));
    var px = toPx(msValue);
    handle.style.left = (px - 7) + 'px';
    active.style.width = (px - 8) + 'px';
    var converted = fromMs(msValue, activeUnit);
    readout.textContent = formatNumber(converted) + ' ' + activeUnit;
    updatingInputs = true;
    valueInput.value = formatNumber(converted);
    updatingInputs = false;
    var chips = [msChip, sChip, fChip];
    for (var i = 0; i < chips.length; i++) {
      var chip = chips[i];
      var selected = chip.getAttribute('data-unit') === activeUnit;
      chip.style.background = selected ? '#4c97ff' : '#fff';
      chip.style.color = selected ? '#fff' : '#222';
      chip.style.borderColor = selected ? '#2e5da8' : 'rgba(0,0,0,0.25)';
    }
    if (commit) {
      thisField.setValue(formatNumber(converted) + ' ' + activeUnit);
    }
  };

  this.dropdownEvents_ = [];
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(bar, 'mousedown', this, function(e) {
    e.preventDefault();
    dragging = true;
    updateFromPointer(e.clientX);
  }));
  this.dropdownEvents_.push(Blockly.bindEvent_(document.body, 'mousemove', this, function(e) {
    if (!dragging) {
      return;
    }
    e.preventDefault();
    updateFromPointer(e.clientX);
  }));
  this.dropdownEvents_.push(Blockly.bindEvent_(document.body, 'mouseup', this, function() {
    dragging = false;
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(msChip, 'mousedown', this, function(e) {
    e.preventDefault();
    activeUnit = 'ms';
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(sChip, 'mousedown', this, function(e) {
    e.preventDefault();
    activeUnit = 's';
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(fChip, 'mousedown', this, function(e) {
    e.preventDefault();
    activeUnit = 'frames';
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(valueInput, 'change', this, function() {
    if (updatingInputs) {
      return;
    }
    var value = Number(valueInput.value);
    if (!isFinite(value)) {
      return;
    }
    msValue = toMs(value, activeUnit);
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(valueInput, 'keydown', this, function(e) {
    if (e.keyCode == 13) {
      var value = Number(valueInput.value);
      if (isFinite(value)) {
        msValue = toMs(value, activeUnit);
        render(true);
      }
    }
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(bar, 'keydown', this, function(e) {
    if (e.keyCode == 27) {
      Blockly.DropDownDiv.hideIfOwner(thisField);
    }
  }));

  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(marksLeft, 'mousedown', this, function(e) {
    e.preventDefault();
    msValue = 0;
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(marksMid, 'mousedown', this, function(e) {
    e.preventDefault();
    msValue = 100;
    render(true);
  }));
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(marksRight, 'mousedown', this, function(e) {
    e.preventDefault();
    msValue = 5000;
    render(true);
  }));

  marksMid.textContent = '100ms';

  var colourSource = this.sourceBlock_;
  if (this.sourceBlock_.isShadow && this.sourceBlock_.isShadow() && this.sourceBlock_.parentBlock_) {
    colourSource = this.sourceBlock_.parentBlock_;
  }
  Blockly.DropDownDiv.setColour(Blockly.Colours.valueReportBackground, Blockly.Colours.valueReportBorder);
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
Blockly.FieldDuration.prototype.dropdownDispose_ = function() {
  if (this.dropdownEvents_) {
    for (var i = 0; i < this.dropdownEvents_.length; i++) {
      Blockly.unbindEvent_(this.dropdownEvents_[i]);
    }
    this.dropdownEvents_ = null;
  }
  Blockly.DropDownDiv.getContentDiv().style.overflow = '';
  Blockly.Events.setGroup(false);
};

/**
 * Normalize duration strings to "value unit".
 * Accepted units: ms, s, frames.
 * @param {string} text Input text.
 * @return {string} Normalized duration or original text when not parseable.
 * @private
 */
Blockly.FieldDuration.normalize_ = function(text) {
  var source = String(text).trim();
  var match = source.match(/^([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*([a-zA-Z]+)$/);
  if (!match) {
    return source;
  }
  var value = Number(match[1]);
  if (!isFinite(value)) {
    return source;
  }

  var unit = match[2].toLowerCase();
  if (unit === 'ms' || unit === 'millisecond' || unit === 'milliseconds') {
    unit = 'ms';
  } else if (unit === 's' || unit === 'sec' || unit === 'secs' ||
      unit === 'second' || unit === 'seconds') {
    unit = 's';
  } else if (unit === 'f' || unit === 'frame' || unit === 'frames') {
    unit = 'frames';
  } else {
    return source;
  }

  return value.toString() + ' ' + unit;
};

/**
 * Parse duration text with fallback values.
 * @param {string} text Duration text.
 * @return {{value:number,unit:string}} Parsed value.
 * @private
 */
Blockly.FieldDuration.parse_ = function(text) {
  var match = String(text).trim().match(/^([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*([a-zA-Z]+)$/);
  if (!match) {
    return {value: 1, unit: 's'};
  }
  var normalized = Blockly.FieldDuration.normalize_(match[1] + ' ' + match[2]);
  var parts = normalized.split(' ');
  if (parts.length !== 2) {
    return {value: 1, unit: 's'};
  }
  return {value: Number(parts[0]), unit: parts[1]};
};

Blockly.Field.register('field_duration', Blockly.FieldDuration);
