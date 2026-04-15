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
 * @fileoverview Extensions for vertical blocks in scratch-blocks.
 * The following extensions can be used to describe a block in Scratch terms.
 * For instance, a block in the operators colour scheme with a number output
 * would have the "colours_operators" and "output_number" extensions.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.ScratchBlocks.VerticalExtensions');

goog.require('Blockly.Colours');
goog.require('Blockly.constants');


/**
 * Helper function that generates an extension based on a category name.
 * The generated function will set primary, secondary, tertiary, and quaternary
 * colours based on the category name.
 * @param {String} category The name of the category to set colours for.
 * @return {function} An extension function that sets colours based on the given
 *     category.
 */
Blockly.ScratchBlocks.VerticalExtensions.colourHelper = function(category) {
  var colours = Blockly.Colours[category];
  if (!(colours && colours.primary && colours.secondary && colours.tertiary &&
    colours.quaternary)) {
    throw new Error('Could not find colours for category "' + category + '"');
  }

  return (
    /**
     * Set the primary, secondary, tertiary, and quaternary colours on this block for
     * the given category.
     * @this {Blockly.Block}
     */
    function() {
      this.setColourFromRawValues_(colours.primary, colours.secondary,
          colours.tertiary, colours.quaternary);
    }
  );
};

/**
 * Extension to set the colours of a text field, which are all the same.
 */
Blockly.ScratchBlocks.VerticalExtensions.COLOUR_TEXTFIELD = function() {
  this.setColourFromRawValues_(Blockly.Colours.textField,
      Blockly.Colours.textField, Blockly.Colours.textField,
      Blockly.Colours.textField);
};

/**
 * Extension to make a block fit into a stack of statements, regardless of its
 * inputs.  That means the block should have a previous connection and a next
 * connection and have inline inputs.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_STATEMENT = function() {
  this.setInputsInline(true);
  this.setPreviousStatement(true, null);
  this.setNextStatement(true, null);
};

/**
 * Extension to make a block be shaped as a hat block, regardless of its
 * inputs.  That means the block should have a next connection and have inline
 * inputs, but have no previous connection.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_HAT = function() {
  this.setInputsInline(true);
  this.setNextStatement(true, null);
};

/**
 * Extension to make a block be shaped as an end block, regardless of its
 * inputs.  That means the block should have a previous connection and have
 * inline inputs, but have no next connection.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_END = function() {
  this.setInputsInline(true);
  this.setPreviousStatement(true, null);
};

/**
 * Extension to make represent a number reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Number'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_NUMBER = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  this.setOutput(true, 'Number');
};

/**
 * Extension to make represent a string reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'String'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_STRING = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  this.setOutput(true, 'String');
};

/**
 * Extension to make represent a boolean reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Boolean'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_BOOLEAN = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
  this.setOutput(true, 'Boolean');
};

/**
 * Extension to make represent a boolean reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Boolean'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_ARRAY = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_SQUARE);
  this.setOutput(true, 'Array');
};

/**
 * Extension to make represent a boolean reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Boolean'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_OBJECT = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_OBJECT);
  this.setOutput(true, 'Object');
};

/**
 * Mixin to add a context menu for a procedure definition block.
 * It adds the "edit" option and removes the "duplicate" option.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_DEF_CONTEXTMENU = {
  /**
   * Add the "edit" option and removes the "duplicate" option from the context
   * menu.
   * @param {!Array.<!Object>} menuOptions List of menu options to edit.
   * @this Blockly.Block
   */
  customContextMenu: function(menuOptions) {
    // Add the edit option at the end.
    menuOptions.push(Blockly.Procedures.makeEditOption(this));

    // Find the delete option and update its callback to be specific to
    // functions.
    for (var i = 0, option; option = menuOptions[i]; i++) {
      if (option.text == Blockly.Msg.DELETE_BLOCK) {
        var input = this.getInput('custom_block');
        // this is the root block, not the shadow block.
        if (input && input.connection && input.connection.targetBlock()) {
          var procCode = input.connection.targetBlock().getProcCode();
        } else {
          return;
        }
        var rootBlock = this;
        option.callback = function() {
          var didDelete = Blockly.Procedures.deleteProcedureDefCallback(
              procCode, rootBlock);
          if (!didDelete) {
            alert(Blockly.Msg.PROCEDURE_USED);
          }
        };
      }
    }
    // Find and remove the duplicate option
    for (var i = 0, option; option = menuOptions[i]; i++) {
      if (option.text == Blockly.Msg.DUPLICATE) {
        menuOptions.splice(i, 1);
        break;
      }
    }
  }
};

/**
 * Mixin to add a context menu for a procedure call block.
 * It adds the "edit" option and the "define" option.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_CALL_CONTEXTMENU = {
  /**
   * Add the "edit" option to the context menu.
   * @todo Add "go to definition" option once implemented.
   * @param {!Array.<!Object>} menuOptions List of menu options to edit.
   * @this Blockly.Block
   */
  customContextMenu: function(menuOptions) {
    menuOptions.push(Blockly.Procedures.makeEditOption(this));

    if (!this.isInFlyout) {
      var returnType = this.getReturn && this.getReturn();
      // Hats can only change their types to statements.
      if (returnType === Blockly.PROCEDURES_CALL_TYPE_HAT) {
        menuOptions.push(Blockly.Procedures.makeChangeHatOption(this));
      } else {
        if (returnType === Blockly.PROCEDURES_CALL_TYPE_STATEMENT) {
          // Statements can be made into hats.
          menuOptions.push(Blockly.Procedures.makeChangeHatOption(this));
          menuOptions.push(Blockly.Procedures.makeChangeTypeOption(
              this,
              Blockly.PROCEDURES_CALL_TYPE_REPORTER,
              Blockly.PROCEDURES_TO_REPORTER
          ));
        } else {
          var messages = [
            [Blockly.PROCEDURES_CALL_TYPE_STATEMENT, Blockly.Msg.PROCEDURES_TO_STATEMENT],
            [Blockly.PROCEDURES_CALL_TYPE_REPORTER,  Blockly.Msg.PROCEDURES_TO_REPORTER],
            [Blockly.PROCEDURES_CALL_TYPE_BOOLEAN,   Blockly.Msg.PROCEDURES_TO_BOOLEAN],
            [Blockly.PROCEDURES_CALL_TYPE_ARRAY,     Blockly.Msg.PROCEDURES_TO_ARRAY],
            [Blockly.PROCEDURES_CALL_TYPE_OBJECT,    Blockly.Msg.PROCEDURES_TO_OBJECT],
          ].filter(function(o) { return o[0] !== returnType; });

          menuOptions.push.apply(menuOptions, messages.map((function(m) {
            return Blockly.Procedures.makeChangeTypeOption(this, m[0], m[1]);
          }).bind(this)));
        }
      }
    }
  }
};

Blockly.ScratchBlocks.VerticalExtensions.FROM_EXTENSION = function() {
  this.isFromExtension = true;
};

Blockly.ScratchBlocks.VerticalExtensions.DEFAULT_EXTENSION_COLORS = function() {
  this.usesDefaultExtensionColors = true;
};

Blockly.ScratchBlocks.VerticalExtensions.SCRATCH_EXTENSION = function() {
  this.isScratchExtension = true;
};

Blockly.ScratchBlocks.VerticalExtensions.EXTENSION_EXTENDER = {
  mutationToDom: function() {
    var container = Blockly.ExtenderMutation.mutationToDom.call(this);
    container.setAttribute('extenddefs', JSON.stringify(this.extendDefinitions_ || {}));
    var minProceedGroups = typeof this.minProceedGroups_ === 'number' ? this.minProceedGroups_ : 1;
    container.setAttribute('minProceedGroups', JSON.stringify(minProceedGroups));
    return container;
  },
  domToMutation: function(xmlElement) {
    var rawDefinitions = xmlElement.getAttribute('extenddefs');
    var minProceedGroupsAttr = xmlElement.getAttribute('minProceedGroups');
    var minProceedGroups = null;
    if (minProceedGroupsAttr !== null) {
      minProceedGroups = JSON.parse(minProceedGroupsAttr);
    }

    var parseType = function(type) {
      if (type === Blockly.DUMMY_INPUT) return Blockly.DUMMY_INPUT;
      if (type === Blockly.NEXT_STATEMENT) return Blockly.NEXT_STATEMENT;
      if (type === Blockly.VALUE_INPUT) return Blockly.VALUE_INPUT;
      var normalized = (type || '').toString().toLowerCase();
      if (normalized === 'input_dummy' || normalized === 'dummy') return Blockly.DUMMY_INPUT;
      if (normalized === 'input_statement' || normalized === 'statement') return Blockly.NEXT_STATEMENT;
      return Blockly.VALUE_INPUT;
    };

    var normalizeDefinitions = function(definitions) {
      if (!Array.isArray(definitions)) {
        return [];
      }
      return definitions.map(function(definition) {
        var parsedType = parseType(definition.type);
        var fieldLabel = definition.fieldLabel || null;
        if (!fieldLabel && parsedType === Blockly.DUMMY_INPUT && definition.field) {
          fieldLabel = definition.field;
        }
        return {
          id: definition.id,
          type: parsedType,
          shadow: definition.shadow || null,
          field: definition.field || null,
          argument: definition.argument || null,
          check: definition.check || null,
          defaultValue: Object.prototype.hasOwnProperty.call(definition, 'defaultValue') ? definition.defaultValue : null,
          menuOptions: definition.menuOptions || null,
          menuArgument: definition.menuArgument || null,
          transient: !!definition.transient,
          forceNewRow: !!definition.forceNewRow,
          fieldLabel: fieldLabel
        };
      });
    };

    var extendDefinitions = {starts: [], proceeds: [], ends: [], collapse: false};
    if (rawDefinitions) {
      try {
        var parsed = JSON.parse(rawDefinitions);
        extendDefinitions = {
          starts: normalizeDefinitions(parsed.starts),
          proceeds: normalizeDefinitions(parsed.proceeds),
          ends: normalizeDefinitions(parsed.ends),
          collapse: !!parsed.collapse
        };
        if (minProceedGroups === null && Number.isInteger(parsed.minProceedGroups) && parsed.minProceedGroups >= 0) {
          minProceedGroups = parsed.minProceedGroups;
        }
      } catch (e) {
        extendDefinitions = {starts: [], proceeds: [], ends: [], collapse: false};
      }
    }
    this.minProceedGroups_ = Number.isInteger(minProceedGroups) && minProceedGroups >= 0 ? minProceedGroups : 1;
    this.extendDefinitions_ = extendDefinitions;

    Blockly.ExtenderMutation.domToMutation.call(this, xmlElement);
  },
  handlePlus_: function () {
    this.insertInputsAtIndex(this.argumentIds_.length + 1, {});
  },
  handleMinus_: function () {
    var minInputs = (this.extendDefinitions_ && this.extendDefinitions_.starts ? this.extendDefinitions_.starts.length : 0) +
      ((this.extendDefinitions_ && this.extendDefinitions_.proceeds ? this.extendDefinitions_.proceeds.length : 0) * this.minProceedGroups_);
    var removeCount = (this.extendDefinitions_ && this.extendDefinitions_.proceeds) ? this.extendDefinitions_.proceeds.length : 1;
    if (this.argumentIds_.length <= minInputs) return;
    Blockly.ExtenderMutation.removeTailInputs_.call(this, removeCount, minInputs);
  },
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,
  customContextMenu: Blockly.ExtenderMutation.customContextMenu,
  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,
  getInputDefinitionsFromIndex_: Blockly.ExtenderMutation.getInputDefinitionsFromIndex_,
  getInputDefinitionFromIndex_: Blockly.ExtenderMutation.getInputDefinitionFromIndex_,
  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  insertInputsAtIndex: Blockly.ExtenderMutation.insertInputsAtIndex,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_
};

Blockly.ScratchBlocks.VerticalExtensions.extensionExtenderInit = function() {
  this.extendCount_ = 0;
  this.argumentIds_ = [];
  this.minProceedGroups_ = 1;
  this.extendDefinitions_ = {starts: [], proceeds: [], ends: [], collapse: false};
  this.plusminus_ = new Blockly.FieldExtender(
    this.handlePlus_.bind(this),
    this.handleMinus_.bind(this),
    true,
    false
  );
  this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
};

/**
 * Register all extensions for scratch-blocks.
 * @package
 */
Blockly.ScratchBlocks.VerticalExtensions.registerAll = function() {
  var categoryNames =
      ['control', 'data', 'data_lists', 'sounds', 'motion', 'looks', 'event',
        'sensing', 'pen', 'operators', 'string', 'more', 'camera'];
  // Register functions for all category colours.
  for (var i = 0; i < categoryNames.length; i++) {
    var name = categoryNames[i];
    Blockly.Extensions.register('colours_' + name,
        Blockly.ScratchBlocks.VerticalExtensions.colourHelper(name));
  }

  // Text fields transcend categories.
  Blockly.Extensions.register('colours_textfield',
      Blockly.ScratchBlocks.VerticalExtensions.COLOUR_TEXTFIELD);

  // Register extensions for common block shapes.
  Blockly.Extensions.register('shape_statement',
      Blockly.ScratchBlocks.VerticalExtensions.SHAPE_STATEMENT);
  Blockly.Extensions.register('shape_hat',
      Blockly.ScratchBlocks.VerticalExtensions.SHAPE_HAT);
  Blockly.Extensions.register('shape_end',
      Blockly.ScratchBlocks.VerticalExtensions.SHAPE_END);

  // Output shapes and types are related.
  Blockly.Extensions.register('output_number',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_NUMBER);
  Blockly.Extensions.register('output_string',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_STRING);
  Blockly.Extensions.register('output_boolean',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_BOOLEAN);
  Blockly.Extensions.register('output_array',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_ARRAY);
  Blockly.Extensions.register('output_object',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_OBJECT);

  // Custom procedures have interesting context menus.
  Blockly.Extensions.registerMixin('procedure_def_contextmenu',
      Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_DEF_CONTEXTMENU);
  Blockly.Extensions.registerMixin('procedure_call_contextmenu',
      Blockly.ScratchBlocks.VerticalExtensions.PROCEDURE_CALL_CONTEXTMENU);

  // Given to all blocks from an extension.
  Blockly.Extensions.register('from_extension',
      Blockly.ScratchBlocks.VerticalExtensions.FROM_EXTENSION);

  // Given to blocks that use the default extension colors ("pen")
  Blockly.Extensions.register('default_extension_colors',
      Blockly.ScratchBlocks.VerticalExtensions.DEFAULT_EXTENSION_COLORS);

  // Misleading name. Given to blocks that have an extension icon.
  Blockly.Extensions.register('scratch_extension',
      Blockly.ScratchBlocks.VerticalExtensions.SCRATCH_EXTENSION);

    Blockly.Extensions.registerMutator(
      'extension_extender',
      Blockly.ScratchBlocks.VerticalExtensions.EXTENSION_EXTENDER,
      Blockly.ScratchBlocks.VerticalExtensions.extensionExtenderInit
    );
};

Blockly.ScratchBlocks.VerticalExtensions.registerAll();
