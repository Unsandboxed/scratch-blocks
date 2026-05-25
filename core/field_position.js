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
 * @fileoverview Position field with optional stage-picker callback.
 */
'use strict';

goog.provide('Blockly.FieldPosition');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');

/**
 * Class for an editable position field with "x, y" formatting.
 * @param {(string|undefined)=} opt_value Initial value.
 * @param {Function=} opt_validator Optional user validator.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldPosition = function(opt_value, opt_validator) {
  var initial = Blockly.FieldPosition.normalize_(opt_value || '0, 0');
  Blockly.FieldPosition.superClass_.constructor.call(this, initial, opt_validator);
  this.addArgType('position');
};
goog.inherits(Blockly.FieldPosition, Blockly.FieldTextInput);

/**
 * Optional host callback used to launch a stage picker.
 * @type {?Function}
 * @private
 */
Blockly.FieldPosition.pickerProvider_ = null;

/**
 * Construct a FieldPosition from a JSON arg object.
 * @param {!Object} options A JSON object with options (value).
 * @returns {!Blockly.FieldPosition} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldPosition.fromJson = function(options) {
  return new Blockly.FieldPosition(options['value']);
};

/**
 * Set the provider used to open a stage position picker.
 * The provider receives a request object:
 * {x, y, field, sourceBlock, onSelect(x, y), onCancel()}.
 * It may call onSelect/onCancel asynchronously, return a sync result,
 * or return a Promise resolving to a result.
 * @param {?Function} provider Picker provider callback.
 */
Blockly.FieldPosition.setPickerProvider = function(provider) {
  Blockly.FieldPosition.pickerProvider_ = provider;
};

/**
 * Backward-compatible alias for setPickerProvider.
 * @param {?Function} provider Picker provider callback.
 */
Blockly.FieldPosition.setStagePickerCallback = function(provider) {
  Blockly.FieldPosition.setPickerProvider(provider);
};

/**
 * Close the dropdown editor if this field is being deleted.
 */
Blockly.FieldPosition.prototype.dispose = function() {
  Blockly.DropDownDiv.hideIfOwner(this);
  Blockly.FieldPosition.superClass_.dispose.call(this);
};

/**
 * Class-level validator for position text.
 * @param {?string} text Candidate text.
 * @return {?string} Normalized text, or original text when incomplete.
 * @protected
 */
Blockly.FieldPosition.prototype.classValidator = function(text) {
  if (text === null || typeof text === 'undefined') {
    return null;
  }
  return Blockly.FieldPosition.normalize_(text);
};

/**
 * Show a dropdown position editor with x/y inputs and stage pick button.
 * @private
 */
Blockly.FieldPosition.prototype.showEditor_ = function() {
  var thisField = this;
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  var parentBlock = this.sourceBlock_.parentBlock_ || this.sourceBlock_;

  var wrap = document.createElement('div');
  wrap.style.width = '220px';
  contentDiv.appendChild(wrap);

  var readout = document.createElement('div');
  readout.style.textAlign = 'center';
  readout.style.fontSize = '12px';
  readout.style.fontWeight = '600';
  readout.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  readout.style.color = '#ffffff';
  readout.style.marginBottom = '6px';
  wrap.appendChild(readout);

  var row = document.createElement('div');
  row.style.display = 'flex';
  row.style.justifyContent = 'center';
  row.style.gap = '6px';
  wrap.appendChild(row);

  var makeInput = function() {
    var input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.style.width = '62px';
    input.style.height = '22px';
    input.style.border = '1px solid rgba(255,255,255,0.5)';
    input.style.borderRadius = '11px';
    input.style.background = 'rgba(255,255,255,0.15)';
    input.style.color = '#fff';
    input.style.textAlign = 'center';
    input.style.fontSize = '11px';
    input.style.outline = 'none';
    return input;
  };

  var xInput = makeInput();
  var yInput = makeInput();
  row.appendChild(xInput);
  row.appendChild(yInput);

  var pickButton = document.createElement('button');
  pickButton.type = 'button';
  pickButton.textContent = 'Pick';
  pickButton.style.height = '22px';
  pickButton.style.padding = '0 10px';
  pickButton.style.border = '1px solid rgba(255,255,255,0.5)';
  pickButton.style.borderRadius = '11px';
  pickButton.style.background = 'rgba(255,255,255,0.15)';
  pickButton.style.color = '#fff';
  pickButton.style.fontSize = '11px';
  pickButton.style.cursor = 'pointer';
  row.appendChild(pickButton);

  var pickerAvailable = !!Blockly.FieldPosition.pickerProvider_;
  if (!pickerAvailable) {
    pickButton.disabled = true;
    pickButton.style.opacity = '0.55';
    pickButton.style.cursor = 'default';
    pickButton.title = 'No stage picker callback registered';
  }

  var current = Blockly.FieldPosition.parse_(this.getValue());
  var currentPos = {x: current.x, y: current.y};
  var updatingInputs = false;

  var render = function(commit) {
    readout.textContent = 'x:' + Blockly.FieldPosition.formatNumber_(currentPos.x) +
        '  y:' + Blockly.FieldPosition.formatNumber_(currentPos.y);
    updatingInputs = true;
    xInput.value = Blockly.FieldPosition.formatNumber_(currentPos.x);
    yInput.value = Blockly.FieldPosition.formatNumber_(currentPos.y);
    updatingInputs = false;
    if (commit) {
      thisField.setValue(Blockly.FieldPosition.compose_(currentPos.x, currentPos.y));
    }
  };

  var setFromValues = function(x, y, commit) {
    var nextX = Number(x);
    var nextY = Number(y);
    if (!isFinite(nextX) || !isFinite(nextY)) {
      return;
    }
    currentPos.x = nextX;
    currentPos.y = nextY;
    render(commit);
  };

  var applyTextInputs = function() {
    if (updatingInputs) {
      return;
    }
    setFromValues(xInput.value, yInput.value, true);
  };

  var handlePickerResult = function(result) {
    var parsed = Blockly.FieldPosition.parsePickerResult_(result);
    if (!parsed) {
      return;
    }
    setFromValues(parsed.x, parsed.y, true);
  };

  var openPicker = function() {
    var provider = Blockly.FieldPosition.pickerProvider_;
    if (!provider) {
      return;
    }
    var settled = false;
    var request = {
      x: currentPos.x,
      y: currentPos.y,
      field: thisField,
      sourceBlock: thisField.sourceBlock_,
      onSelect: function(x, y) {
        if (settled) {
          return;
        }
        settled = true;
        setFromValues(x, y, true);
      },
      onCancel: function() {
        settled = true;
      }
    };

    var result;
    try {
      result = provider(request);
    } catch (e) {
      return;
    }

    if (settled || typeof result === 'undefined' || result === null) {
      return;
    }

    if (typeof result.then === 'function') {
      result.then(function(asyncResult) {
        if (settled) {
          return;
        }
        settled = true;
        handlePickerResult(asyncResult);
      });
      return;
    }

    settled = true;
    handlePickerResult(result);
  };

  this.dropdownEvents_ = [];
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
  this.dropdownEvents_.push(Blockly.bindEventWithChecks_(pickButton, 'mousedown', this, function(e) {
    e.preventDefault();
    openPicker();
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
Blockly.FieldPosition.prototype.dropdownDispose_ = function() {
  if (this.dropdownEvents_) {
    for (var i = 0; i < this.dropdownEvents_.length; i++) {
      Blockly.unbindEvent_(this.dropdownEvents_[i]);
    }
    this.dropdownEvents_ = null;
  }
  Blockly.Events.setGroup(false);
};

/**
 * Normalize position strings to "x, y" when parseable.
 * @param {string} text Input text.
 * @return {string} Normalized position or original text when not parseable.
 * @private
 */
Blockly.FieldPosition.normalize_ = function(text) {
  var parsed = Blockly.FieldPosition.parse_(text);
  return Blockly.FieldPosition.compose_(parsed.x, parsed.y);
};

/**
 * Parse position text with fallback values.
 * @param {string} text Position text.
 * @return {{x:number,y:number}} Parsed values.
 * @private
 */
Blockly.FieldPosition.parse_ = function(text) {
  var match = String(text).trim().match(/^([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*[, ]\s*([+-]?(?:\d+\.?\d*|\d*\.\d+))$/);
  if (!match) {
    return {x: 0, y: 0};
  }
  var x = Number(match[1]);
  var y = Number(match[2]);
  if (!isFinite(x) || !isFinite(y)) {
    return {x: 0, y: 0};
  }
  return {x: x, y: y};
};

/**
 * Parse provider return values.
 * Supports object {x, y}, array [x, y], or "x, y" string.
 * @param {*} result Provider return value.
 * @return {{x:number,y:number}|null} Parsed position or null.
 * @private
 */
Blockly.FieldPosition.parsePickerResult_ = function(result) {
  if (Array.isArray(result) && result.length >= 2) {
    var ax = Number(result[0]);
    var ay = Number(result[1]);
    return (isFinite(ax) && isFinite(ay)) ? {x: ax, y: ay} : null;
  }

  if (typeof result === 'string') {
    return Blockly.FieldPosition.parse_(result);
  }

  if (result && typeof result === 'object') {
    var ox = Number(result.x);
    var oy = Number(result.y);
    return (isFinite(ox) && isFinite(oy)) ? {x: ox, y: oy} : null;
  }

  return null;
};

/**
 * Compose x/y into normalized display value.
 * @param {number} x X value.
 * @param {number} y Y value.
 * @return {string} Display value.
 * @private
 */
Blockly.FieldPosition.compose_ = function(x, y) {
  return Blockly.FieldPosition.formatNumber_(x) + ', ' + Blockly.FieldPosition.formatNumber_(y);
};

/**
 * Format numeric value for display.
 * @param {number} value Value to format.
 * @return {string} Formatted string.
 * @private
 */
Blockly.FieldPosition.formatNumber_ = function(value) {
  return Number(value.toFixed(2)).toString();
};

Blockly.Field.register('field_position', Blockly.FieldPosition);
