/**
 * @fileoverview Provides reusable input extension mutation functions.
 */

'use strict';

goog.provide('Blockly.ExtenderMutation');

/** @const {object} Blockly.ExtenderMutation */

Blockly.ExtenderMutation.mutationToDom = function() {
  var container = document.createElement('mutation');
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('extendCount', JSON.stringify(this.extendCount_));
  return container;
};

Blockly.ExtenderMutation.domToMutation = function(xmlElement) {
  var argumentIds = xmlElement.getAttribute('argumentids');
  var extendCount = xmlElement.getAttribute('extendCount');

  // don't update if args are not changed
  if (JSON.stringify(this.argumentIds_) === argumentIds) {
    return;
  }

  // The number of times it's been extended. This is not the same as the number
  // of argument IDs or inputs/fields on the block, as multiple inputs can be
  // applied or removed at will.
  this.extendCount_ = JSON.parse(extendCount);

  this.argumentIds_ = JSON.parse(argumentIds);
  if (this.argumentIds_.length >= 3) {
    this.plusminus_.setEnableMinus(true);
  } else {
    this.plusminus_.setEnableMinus(false);
  }
  this.updateDisplay_();
};

Blockly.ExtenderMutation.defineNewInput = function(type, shadow, field, check) {
  return {type, shadow, field, check};
};

Blockly.ExtenderMutation.customContextMenu = function(menuOptions, originalBlock) {
  if (originalBlock) {
    var index = this.findBlockIndex_(originalBlock);
    menuOptions.push({
      enabled: true,
      text: Blockly.Msg.INSERT_INPUT,
      callback: this.insertInputWithIndex_.bind(this, index)
    });
    menuOptions.push({
      enabled: this.argumentIds_.length >= 3,
      text: Blockly.Msg.DELETE_INPUT,
      callback: this.removeInputWithIndex_.bind(this, index)
    });
  }
};

Blockly.ExtenderMutation.findBlockIndex_ = function(block) {
  for (var i = 0; i < this.childBlocks_.length; ++i) {
    if (this.childBlocks_[i] === block) {
      return i + 1;
    }
  }
  return 0;
};

Blockly.ExtenderMutation.handlePlus_ = function() {
  Blockly.Events.setGroup(true);
  var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
  if (this.extendCount_ === 2) {
    this.plusminus_.setEnableMinus(true);
  }

  var definitions = this.extendDefinitions.starts;
  for (var i = 0; i < definitions.length; ++i) {
    var input;
  }

  var newMutation = Blockly.Xml.domToText(this.mutationToDom());
  Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
  Blockly.Events.setGroup(false);
};

/**
 * Find a definition of a singular input by working down the definition tree.
 */
Blockly.ExtenderMutation.getInputDefinitionFromIndex_ = function (index, block) {

}

/**
 * Get the definition of a set of inputs from the index it was called from.
 */
Blockly.ExtenderMutation.getInputDefinitionsFromIndex_ = function (index, block) {
  if (index !== 0) {
    console.log(block.extendDefinitions_);
    return block.extendDefinitions_.proceeds;
  } else {
    return block.extendDefinitions_.starts;
  }
}

/**
 * Coordinate a set of fields and inputs at a given index.
 */
Blockly.ExtenderMutation.insertInputsAtIndex = function(index) {
  var definitions = Blockly.ExtenderMutation.getInputDefinitionsFromIndex_(index, this);
  if (!definitions) {
    return;
  }

  definitions = definitions.reverse();

  console.log(definitions);

  for (var definition of definitions) {
    this.insertInputWithIndex_(index, definition);    
  }
}

/**
 * Insert an input inline on a block at a specified index. 
 * @param {Number} index The index to insert the input.
 * @param {Name} name The name of the input to insert.
 */
Blockly.ExtenderMutation.insertInputWithIndex_ = function(index, definition) {
  if (typeof definition.id == "undefined") definition.id = Blockly.utils.genUid();
  this.argumentIds_.splice(index - 1, 0, definition.id);

  var input;
  if (definition.type === Blockly.DUMMY_INPUT) {
    var label = new Blockly.FieldLabel(definition.field);
    input = this.insertDummyInput(index, Blockly.utils.genUid());
    input.appendField(label);
  } else if (definition.type === Blockly.NEXT_STATEMENT) {
    input = this.insertStatementInput(
      index,
      definition.id
    );

    if (!this.isInsertionMarker()) {
      this.render(false);
    }
  } else {
    input = this.insertValueInput(index, definition.id);

    if (definition.shadow) {
      Blockly.Events.disable();
      var newBlock = this.workspace.newBlock(definition.shadow);
      newBlock.setFieldValue('', definition.field);
      newBlock.setShadow(true);

      if (!this.isInsertionMarker()) {
        newBlock.initSvg();
        newBlock.render(false);
      }

      Blockly.Events.enable();
      if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
      }
      newBlock.outputConnection.connect(input.connection);
    }
  }

  if (definition.check) {
    input.setCheck(definition.check);
  }

  return input;
};

Blockly.ExtenderMutation.removeInputWithIndex_ = function(index) {
  // not allowed to remove input when there are less than 2 inputs
  if (this.argumentIds_.length <= 2) return;
  Blockly.Events.setGroup(true);

  var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
  if (this.argumentIds_.length === 3) {
    this.plusminus_.setEnableMinus(false);
  }

  this.removeInput(this.argumentIds_[index - 1]);
  this.argumentIds_.splice(index - 1, 1);

  var newMutation = Blockly.Xml.domToText(this.mutationToDom());

  Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
  Blockly.Events.setGroup(false);
};

/**
 * Update the block's structure and appearance to match the internally stored
 * mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.updateDisplay_ = function() {
  var wasRendered = this.rendered;
  this.rendered = false;

  var connectionMap = this.disconnectOldBlocks_();
  this.removeAllInputs_();

  this.createAllInputs_(connectionMap);
  this.deleteShadows_(connectionMap);

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
};

/**
 * Disconnect old blocks from all value inputs on this block, excluding the first
 * and last, and hold onto them in case they can be reattached later.  Also save 
 * the shadow DOM if it exists.
 * The result is a map from argument ID to information that was associated with
 * that argument at the beginning of the mutation.
 * @return {!Object.<string, {shadow: Element, block: Blockly.Block}>} An object
 *     mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.disconnectOldBlocks_ = function() {
  // Remove old stuff
  var connectionMap = {};

  var indexStart = (this.hasFirstLabel_) ? 1 : 0;
  var inputCount = (this.hasFirstLabel_) ? this.inputList.length - 1 : this.inputList.length;

  // Disconnect old blocks, except the first and last ones.
  for (var i = indexStart; i < inputCount; ++i) {
    var input = this.inputList[i];
    if (input.connection) {
      var target = input.connection.targetBlock();
      var saveInfo = {
        shadow: input.connection.getShadowDom(),
        block: target
      };
      connectionMap[input.name] = saveInfo;
      
      // Remove the shadow DOM, then disconnect the block.  Otherwise a shadow
      // block will respawn instantly, and we'd have to remove it when we remove
      // the input.
      input.connection.setShadowDom(null);
      if (target) {
        input.connection.disconnect();
      }
    }
  }
  return connectionMap;
}

/**
 * Remove all inputs on the block, including dummy inputs, with
 * the exception of the first and last in the list.
 * Assumes no input has shadow DOM set.
 * @private
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.removeAllInputs_ = function() {
  // Delete inputs directly instead of with block.removeInput to avoid splicing
  // out of the input list at every index.
  var indexStart = (this.hasFirstLabel_) ? 1 : 0;
  var inputCount = (this.hasFirstLabel_) ? this.inputList.length - 1 : this.inputList.length;

  for (var i = indexStart; i < inputCount; ++i) {
    this.inputList[i].dispose();
  }
  this.inputList.splice(indexStart, inputCount - 2);
}

/**
 * Create all inputs specified by the new connectionMap, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.createAllInputs_ = function(connectionMap) {
  // create inputs
  for (var i = 0; i < this.argumentIds_.length; ++i) {
    var id = this.argumentIds_[i];
    var input = this.insertValueInput(i, id);

    if (this.extendLabel_ && i == 0) {
      var label = new Blockly.FieldLabel(this.extendLabel_);
      input.appendField(label);
    }

    if (this.extendInput_.check) {
      input.setCheck(this.extendInput_.check);
    }

    // populate args
    var oldBlock = null;
    var oldShadow = null;
    if (connectionMap && (id in connectionMap)) {
      var saveInfo = connectionMap[id];
      oldBlock = saveInfo['block'];
      oldShadow = saveInfo['shadow'];
    }

    if (oldBlock) {
      // reattach the old block and shadow dom
      connectionMap[input.name] = null;
      oldBlock.outputConnection.connect(input.connection);
      if (!oldShadow) {
        // create shadow dom
        oldShadow = goog.dom.createDom('shadow');
        oldShadow.setAttribute('type', this.extendInput_.type);
        var fieldDom = goog.dom.createDom('field', null, '');
        fieldDom.setAttribute('name', this.extendInput_.name);
        oldShadow.appendChild(fieldDom);
      }
      input.connection.setShadowDom(oldShadow);
    } else if (this.extendInput_.type) {
      // attach shadow
      Blockly.Events.disable();
      var newBlock = this.workspace.newBlock(this.extendInput_.type);
      newBlock.setFieldValue('', this.extendInput_.name);
      newBlock.setShadow(true);
      if (!this.isInsertionMarker()) {
        newBlock.initSvg();
        newBlock.render(false);
      }
      Blockly.Events.enable();
      if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
      }
      newBlock.outputConnection.connect(input.connection);
    }
  }
}

/**
 * Delete all shadow blocks in the given map.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     argument IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.deleteShadows_ = function(connectionMap) {
  // Get rid of all of the old shadow blocks if they aren't connected.
  if (connectionMap) {
    for (var id in connectionMap) {
      var saveInfo = connectionMap[id];
      if (saveInfo) {
        var block = saveInfo['block'];
        if (block && block.isShadow()) {
          block.dispose();
          connectionMap[id] = null;
          // At this point we know which shadow DOMs are about to be orphaned in
          // the VM.  What do we do with that information?
        }
      }
    }
  }
};