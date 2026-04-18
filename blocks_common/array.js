/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2026
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
 * @fileoverview Common array shadow blocks for Blockly.
 */
'use strict';

goog.provide('Blockly.Blocks.array');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');

Blockly.Blocks['array'] = {
  /**
   * Common extendable shadow reporter that builds an Array.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "output": "Array",
      "outputShape": Blockly.OUTPUT_SHAPE_SQUARE,
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "colourQuaternary": Blockly.Colours.textField
    });
    this.setInputsInline(true);
    this.extendCount_ = 0;
    this.argumentIds_ = [];
    this.minProceedGroups_ = 0;
    this.extendDefinitions_ = {
      collapse: false,
      starts: [],
      proceeds: [
        Blockly.ExtenderMutation.defineNewInput(
          Blockly.VALUE_INPUT,
          'text',
          'TEXT',
          null
        )
      ],
      ends: []
    };
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false,
      null,
      true
    );
    // TODO: It'd be fun if the list was vertical like in Scratch,
    // but it looks really awkward. For now, just make it horizontal.
    this.setInputsInline(true);
    this.appendDummyInput('ARRAY_END')
      .appendField(this.plusminus_, 'PLUS_MINUS');

    this.setOnChange(this.onChange_.bind(this));
    this.updateParentShadowStyle_();

    // Creation/connection can happen after init; resync once on next tick
    // so the initial render picks up parent shadow colors.
    setTimeout(function() {
      this.syncParentShadowDom_();
      this.updateParentShadowStyle_();
      if (this.rendered && this.render) this.render();
    }.bind(this), 0);
  },

  syncParentShadowDom_: function () {
    if (!this.isShadow || !this.isShadow() || !this.outputConnection) return;
    var parentConnection = this.outputConnection.targetConnection;
    if (!parentConnection) return;
    var parentBlock = parentConnection.getSourceBlock && parentConnection.getSourceBlock();
    if (parentBlock) {
      this.setShadowColour(parentBlock.getColourSecondary());
      this.setColour(
        parentBlock.getColour(),
        parentBlock.getColourSecondary(),
        parentBlock.getColourTertiary(),
        parentBlock.getColourQuaternary()
      );
    }
    parentConnection.setShadowDom(Blockly.Xml.blockToDom(this));
  },

  updateParentShadowStyle_: function () {
    if (!this.isShadow || !this.isShadow()) return;
    var parent = this.getParent && this.getParent();
    if (!parent && this.outputConnection && this.outputConnection.targetConnection) {
      parent = this.outputConnection.targetConnection.getSourceBlock();
    }
    if (parent) {
      this.setShadowColour(parent.getColourSecondary());
      this.setColour(
        parent.getColour(),
        parent.getColourSecondary(),
        parent.getColourTertiary(),
        parent.getColourQuaternary()
      );
    } else {
      this.clearShadowColour();
    }
    if (this.plusminus_ && this.plusminus_.render_) this.plusminus_.render_();
  },

  onChange_: function(e) {
    this.updateParentShadowStyle_();

    // For an empty array shadow, clicking the block body should add the first slot.
    if (!e || e.type !== 'ui' || e.element !== 'click' || e.blockId !== this.id) return;
    if (!this.isShadow || !this.isShadow()) return;
    if (!Array.isArray(this.argumentIds_) || this.argumentIds_.length !== 0) return;
    this.handlePlus_();
  },

  handlePlus_: function () {
    this.insertInputsAtIndex(this.argumentIds_.length + 1, {});
    this.syncParentShadowDom_();
    this.updateParentShadowStyle_();
  },

  handleMinus_: function () {
    var minInputs = (this.extendDefinitions_ && this.extendDefinitions_.starts ? this.extendDefinitions_.starts.length : 0) +
      ((this.extendDefinitions_ && this.extendDefinitions_.proceeds ? this.extendDefinitions_.proceeds.length : 0) * this.minProceedGroups_);
    var removeCount = (this.extendDefinitions_ && this.extendDefinitions_.proceeds) ? this.extendDefinitions_.proceeds.length : 1;
    if (this.argumentIds_.length <= minInputs) return;
    this.removeTailInputs_(removeCount, minInputs);
    this.syncParentShadowDom_();
    this.updateParentShadowStyle_();
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: function(xmlElement) {
    Blockly.ExtenderMutation.domToMutation.call(this, xmlElement);
    this.syncParentShadowDom_();
    this.updateParentShadowStyle_();
  },
  updateDisplay_: function() {
    Blockly.ExtenderMutation.updateDisplay_.call(this);
    this.syncParentShadowDom_();
    this.updateParentShadowStyle_();
  },

  customContextMenu: Blockly.ExtenderMutation.customContextMenu,
  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,
  getInputDefinitionsFromIndex_: Blockly.ExtenderMutation.getInputDefinitionsFromIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  insertInputsAtIndex: Blockly.ExtenderMutation.insertInputsAtIndex,
  removeTailInputs_: Blockly.ExtenderMutation.removeTailInputs_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: function() {
    for (var i = this.inputList.length - 1; i >= 0; --i) {
      if (this.inputList[i].name === 'ARRAY_END') continue;
      this.inputList[i].dispose();
      this.inputList.splice(i, 1);
    }
  },
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_
};
