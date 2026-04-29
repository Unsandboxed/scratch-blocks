/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Text blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.texts');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

goog.require('Blockly.constants');

Blockly.Blocks['text'] = {
  /**
   * Block for text value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT"
        }
      ],
      "output": "String",
      "outputShape": Blockly.OUTPUT_SHAPE_SQUARE,
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "colourQuaternary": Blockly.Colours.textField
    });
  }
};

Blockly.Blocks['shadow_label'] = {
  /**
   * Block for non-editable label shadow text.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "TEXT",
          "text": ""
        }
      ],
      "output": null,
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "colourQuaternary": Blockly.Colours.textField
    });

    this.setOnChange(this.onChange_.bind(this));
    this.syncParentStyle_();
  },

  syncParentStyle_: function() {
    if (!this.isShadow || !this.isShadow() || !this.outputConnection) return;
    var parentConnection = this.outputConnection.targetConnection;
    if (!parentConnection) return;

    var parentBlock = parentConnection.getSourceBlock && parentConnection.getSourceBlock();
    if (!parentBlock) return;

    // Keep this shadow's silhouette aligned with the socket shape it occupies.
    this.setOutputShape(parentConnection.getOutputShape());

    // Use only the parent tertiary colour for shadow fill/stroke.
    this.setShadowColour(parentBlock.getColourTertiary());

    if (this.rendered && this.render) this.render();
  },

  onChange_: function() {
    this.syncParentStyle_();
  }
};
