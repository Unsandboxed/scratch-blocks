/**
 * @fileoverview Provides reusable input extension mutation functions.
 */

'use strict';

goog.provide('Blockly.ExtenderMutation');

/** @const {object} Blockly.ExtenderMutation */

/**
 * Whether the extender field should be prepended.
 * @const
 */
Blockly.ExtenderMutation.PREPEND_EXTENDER = false;

/**
 * Most recently focused extendable block.
 * @type {?Blockly.BlockSvg}
 * @private
 */
Blockly.ExtenderMutation.lastFocusedExtendableBlock_ = null;

/**
 * Whether a block supports extender keyboard operations.
 * @param {?Blockly.BlockSvg} block Candidate block.
 * @return {boolean} True if block supports plus/minus extension controls.
 * @private
 */
Blockly.ExtenderMutation.isKeyboardExtendableBlock_ = function(block) {
  return !!(block &&
      !(block.isInsertionMarker && block.isInsertionMarker()) &&
      block.workspace && !block.workspace.isFlyout &&
      typeof block.handlePlus_ === 'function' &&
      typeof block.handleMinus_ === 'function');
};

/**
 * Whether a focused extendable block is branch-style.
 * @param {?Blockly.BlockSvg} block Candidate block.
 * @return {boolean} True when block uses branch states.
 * @private
 */
Blockly.ExtenderMutation.isKeyboardBranchBlock_ = function(block) {
  return !!(Blockly.ExtenderMutation.isKeyboardExtendableBlock_(block) &&
      Array.isArray(block.branchStates_));
};

/**
 * Map key code to extend/retract intent for a specific block type.
 * Branch blocks: Up/Down.
 * Reporter blocks: Left/Right.
 * @param {!Blockly.BlockSvg} block Focused extendable block.
 * @param {number} keyCode Keyboard event key code.
 * @return {?boolean} True extend, false retract, null for unrelated keys.
 * @private
 */
Blockly.ExtenderMutation.getKeyboardIntentForKeyCode_ = function(block, keyCode) {
  if (Blockly.ExtenderMutation.isKeyboardBranchBlock_(block)) {
    if (keyCode == 40) {
      return true;
    }
    if (keyCode == 38) {
      return false;
    }
    return null;
  }

  if (keyCode == 39) {
    return true;
  }
  if (keyCode == 37) {
    return false;
  }
  return null;
};

/**
 * Remember the latest extendable block focus target.
 * @param {?Blockly.BlockSvg} block Block to store.
 */
Blockly.ExtenderMutation.rememberFocusedExtendableBlock = function(block) {
  if (!Blockly.ExtenderMutation.isKeyboardExtendableBlock_(block)) {
    return;
  }
  Blockly.ExtenderMutation.lastFocusedExtendableBlock_ = block;
};

/**
 * Get the most recently focused extendable block.
 * Prefers current Blockly.selected when extendable.
 * @return {?Blockly.BlockSvg} Extendable target block.
 * @private
 */
Blockly.ExtenderMutation.getFocusedExtendableBlock_ = function() {
  if (Blockly.ExtenderMutation.isKeyboardExtendableBlock_(Blockly.selected)) {
    Blockly.ExtenderMutation.lastFocusedExtendableBlock_ = Blockly.selected;
    return Blockly.selected;
  }

  if (Blockly.ExtenderMutation.isKeyboardExtendableBlock_(
      Blockly.ExtenderMutation.lastFocusedExtendableBlock_)) {
    return Blockly.ExtenderMutation.lastFocusedExtendableBlock_;
  }

  Blockly.ExtenderMutation.lastFocusedExtendableBlock_ = null;
  return null;
};

/**
 * Apply keyboard extension/retraction to the focused extendable block.
 * @param {boolean} shouldExtend True to extend, false to retract.
 * @return {boolean} True if an operation was applied.
 */
Blockly.ExtenderMutation.applyKeyboardAdjustToFocusedBlock = function(shouldExtend) {
  var block = Blockly.ExtenderMutation.getFocusedExtendableBlock_();
  if (!block) {
    return false;
  }

  if (block.workspace && block.workspace.isDragging && block.workspace.isDragging()) {
    return false;
  }

  if (!shouldExtend && typeof block.canRemove_ === 'function' && !block.canRemove_()) {
    return false;
  }

  var didApply = false;
  Blockly.Events.setGroup(true);
  try {
    var oldMutation = null;
    if (typeof block.mutationToDom === 'function') {
      oldMutation = Blockly.Xml.domToText(block.mutationToDom());
    }

    if (shouldExtend) {
      block.handlePlus_();
    } else {
      block.handleMinus_();
    }

    if (oldMutation !== null && typeof block.mutationToDom === 'function') {
      var newMutation = Blockly.Xml.domToText(block.mutationToDom());
      didApply = oldMutation !== newMutation;
    } else {
      didApply = true;
    }
  } finally {
    Blockly.Events.setGroup(false);
  }

  return didApply;
};

/**
 * Apply key-based extension/retraction for the focused extendable block.
 * @param {number} keyCode Keyboard event key code.
 * @return {boolean} True if an operation was applied.
 */
Blockly.ExtenderMutation.applyKeyboardAdjustForKeyCode = function(keyCode) {
  var block = Blockly.ExtenderMutation.getFocusedExtendableBlock_();
  if (!block) {
    return false;
  }

  var shouldExtend = Blockly.ExtenderMutation.getKeyboardIntentForKeyCode_(block, keyCode);
  if (shouldExtend === null) {
    return false;
  }

  return Blockly.ExtenderMutation.applyKeyboardAdjustToFocusedBlock(shouldExtend);
};

Blockly.ExtenderMutation.mutationToDom = function() {
  var container = document.createElement('mutation');
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('extendCount', JSON.stringify(this.extendCount_));
  return container;
};

Blockly.ExtenderMutation.getMinInputCount_ = function(block) {
  if (typeof block.minInputCount_ === 'number') {
    return block.minInputCount_;
  }

  if (block.extendDefinitions_) {
    var starts = (block.extendDefinitions_.starts || []).length;
    var proceeds = (block.extendDefinitions_.proceeds || []).length;
    var minProceedGroups = typeof block.minProceedGroups_ === 'number' ? block.minProceedGroups_ : 0;
    return starts + (proceeds * minProceedGroups);
  }

  return 0;
};

Blockly.ExtenderMutation.updateMinusEnabled_ = function(block) {
  if (!block.plusminus_ || typeof block.plusminus_.setEnableMinus !== 'function') return;
  var minInputs = Blockly.ExtenderMutation.getMinInputCount_(block);
  block.plusminus_.setEnableMinus((block.argumentIds_ || []).length > minInputs);
};

Blockly.ExtenderMutation.syncBranchKinds_ = function(flattenIdsFn) {
  this.branchKinds_ = (this.branchStates_ || []).map(function(branchState) {
    return branchState.kind;
  });

  if (typeof flattenIdsFn === 'function') {
    this.argumentIds_ = flattenIdsFn.call(this);
  }
};

Blockly.ExtenderMutation.updateBranchButtons_ = function() {
  if (!this.plusminus_ || typeof this.plusminus_.setEnableMinus !== 'function') return;
  this.plusminus_.setEnableMinus(this.canRemove_());
};

Blockly.ExtenderMutation.rebuildFromDefinitions_ = function() {
  var wasRendered = this.rendered;
  this.rendered = false;

  var connectionMap = this.disconnectOldBlocks_();
  this.removeAllInputs_();

  var definitions = this.getActiveDefinitions_();
  this.argumentIds_ = [];

  for (var i = 0; i < definitions.length; i++) {
    var definition = Object.assign({}, definitions[i]);
    var input = this.insertInputWithIndex_(i + 1, definition);
    var id = definition.id;

    if (input && input.connection && connectionMap && (id in connectionMap)) {
      var saveInfo = connectionMap[id];
      var oldBlock = saveInfo && saveInfo.block;
      var oldShadow = saveInfo && saveInfo.shadow;
      var reconnected = false;

      try {
        if (oldBlock && oldBlock.outputConnection && input.connection.checkType_(oldBlock.outputConnection)) {
          oldBlock.outputConnection.connect(input.connection);
          reconnected = true;
        } else if (oldBlock && oldBlock.previousConnection && input.connection.checkType_(oldBlock.previousConnection)) {
          oldBlock.previousConnection.connect(input.connection);
          reconnected = true;
        }
      } catch (e) {
        reconnected = false;
      }

      if (reconnected) {
        connectionMap[id] = null;
        if (oldBlock && oldBlock.isShadow && oldBlock.isShadow()) {
          input.connection.setShadowDom(Blockly.Xml.blockToDom(oldBlock));
        } else if (oldShadow) {
          input.connection.setShadowDom(oldShadow);
        }
      } else if (oldBlock && oldBlock.isShadow && oldBlock.isShadow()) {
        oldBlock.dispose();
      }
    }
  }

  this.deleteShadows_(connectionMap);
  Blockly.ExtenderMutation.cleanupTopLevelShadows_(this.workspace);
  Blockly.ExtenderMutation.updateBranchButtons_.call(this);

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
};

Blockly.ExtenderMutation.branchMutationToDom = function() {
  var container = document.createElement('mutation');
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('branchkinds', JSON.stringify(this.branchKinds_));
  return container;
};

Blockly.ExtenderMutation.branchDomToMutation = function(xmlElement, defaultBranchKinds) {
  var argumentIds = JSON.parse(xmlElement.getAttribute('argumentids') || '[]');
  var branchKinds = JSON.parse(xmlElement.getAttribute('branchkinds') || defaultBranchKinds || '[]');
  this.loadBranchStates_(branchKinds, argumentIds);
  this.rebuildShape_();
};

Blockly.ExtenderMutation.domToMutation = function(xmlElement) {
  var argumentIds = xmlElement.getAttribute('argumentids');
  var extendCount = xmlElement.getAttribute('extendCount');
  var parsedExtendCount = JSON.parse(extendCount || '0');

  // Even if argument IDs are unchanged, we may still need to refresh shape
  // because extend definitions/minProceed settings can change independently.
  if (JSON.stringify(this.argumentIds_) === argumentIds && this.extendCount_ === parsedExtendCount) {
    Blockly.ExtenderMutation.updateMinusEnabled_(this);
    this.updateDisplay_();
    return;
  }

  // The number of times it's been extended. This is not the same as the number
  // of argument IDs or inputs/fields on the block, as multiple inputs can be
  // applied or removed at will.
  this.extendCount_ = parsedExtendCount;

  this.argumentIds_ = JSON.parse(argumentIds);
  Blockly.ExtenderMutation.updateMinusEnabled_(this);
  this.updateDisplay_();
};

Blockly.ExtenderMutation.defineNewInput = function(type, shadow, field, check) {
  return {type, shadow, field, check};
};

Blockly.ExtenderMutation.getShadowFieldDefault_ = function(shadowType, fieldName) {
  if (fieldName === 'TEXT') {
    return '';
  }
  if (fieldName === 'NUM') {
    return '0';
  }
  if (fieldName === 'ANGLE') {
    return '90';
  }
  if (shadowType === 'math_number' || shadowType === 'math_integer') {
    return '0';
  }
  return '';
};

Blockly.ExtenderMutation.cleanupTopLevelShadows_ = function(workspace) {
  if (!workspace || workspace.isFlyout) return;
  var topBlocks = workspace.getTopBlocks(false);
  for (var i = 0; i < topBlocks.length; i++) {
    var block = topBlocks[i];
    if (block && block.isShadow && block.isShadow() && !block.getParent()) {
      block.dispose();
    }
  }
};

Blockly.ExtenderMutation.shouldDeferShadowCreation_ = function(block) {
  return !!(block &&
      block.workspace && block.workspace.isDragging && block.workspace.isDragging());
};

Blockly.ExtenderMutation.canUseStartExtender_ = function(block) {
  return !!(block && block.plusminus_ && !block.branchStates_);
};

Blockly.ExtenderMutation.useStartExtender_ = function(block) {
  // Branch blocks keep their dedicated static placement behavior.
  return !!(Blockly.ExtenderMutation.PREPEND_EXTENDER && Blockly.ExtenderMutation.canUseStartExtender_(block));
};

Blockly.ExtenderMutation.refreshStartExtenderBlocks_ = function(workspace) {
  if (!workspace || !workspace.getAllBlocks) return;

  var blocks = workspace.getAllBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (!Blockly.ExtenderMutation.canUseStartExtender_(block)) {
      continue;
    }

    if (typeof block.updateDisplay_ === 'function') {
      block.updateDisplay_();
    } else if (typeof block.rebuildShape_ === 'function') {
      block.rebuildShape_();
    }
  }
};

Blockly.ExtenderMutation.getRelatedWorkspaces_ = function(workspace) {
  var workspaces = [];
  if (!workspace) {
    return workspaces;
  }

  workspaces.push(workspace);

  // If this is a main workspace, also refresh its flyout workspace.
  if (workspace.getFlyout && workspace.getFlyout()) {
    var flyoutWorkspace = workspace.getFlyout().getWorkspace();
    if (flyoutWorkspace) {
      workspaces.push(flyoutWorkspace);
    }
  }

  // If this is a flyout workspace, also refresh the target main workspace.
  if (workspace.isFlyout && workspace.targetWorkspace) {
    workspaces.push(workspace.targetWorkspace);
  }

  return workspaces;
};

Blockly.ExtenderMutation.setStartExtenderState = function(enabled, workspace) {
  Blockly.ExtenderMutation.PREPEND_EXTENDER = !!enabled;

  if (!workspace) {
    workspace = Blockly.mainWorkspace;
  }

  // Refresh without polluting undo stack.
  var eventsWereEnabled = Blockly.Events.isEnabled();
  if (eventsWereEnabled) {
    Blockly.Events.disable();
  }
  try {
    var workspaces = Blockly.ExtenderMutation.getRelatedWorkspaces_(workspace);
    for (var i = 0; i < workspaces.length; i++) {
      Blockly.ExtenderMutation.refreshStartExtenderBlocks_(workspaces[i]);
    }
  } finally {
    if (eventsWereEnabled) {
      Blockly.Events.enable();
    }
  }
};

Blockly.ExtenderMutation.getStartExtenderLeadingSlots_ = function(block) {
  if (!block || typeof block.extenderLeadingSlots_ !== 'number') {
    return 0;
  }
  return Math.max(0, block.extenderLeadingSlots_);
};

Blockly.ExtenderMutation.getInputInsertIndex_ = function(argumentIndex, block) {
  if (!Blockly.ExtenderMutation.useStartExtender_(block)) {
    return argumentIndex;
  }

  // Dynamic rows are inserted around the persistent control row.
  var leadingSlots = Blockly.ExtenderMutation.getStartExtenderLeadingSlots_(block);
  return argumentIndex < leadingSlots ? argumentIndex : argumentIndex + 1;
};

// Backward-compatible alias while callers migrate.
Blockly.ExtenderMutation.setPrependExtenderState = Blockly.ExtenderMutation.setStartExtenderState;

Blockly.ExtenderMutation.customContextMenu = function(menuOptions, originalBlock) {
  if (originalBlock) {
    var index = Blockly.ExtenderMutation.findInputIndexForBlock_.call(this, originalBlock);
    if (index < 1) {
      return;
    }

    var insertGroup = Blockly.ExtenderMutation.getMutationGroupForIndex_(index, this);
    var deleteGroup = Blockly.ExtenderMutation.getDeleteMutationGroupForIndex_(index, this);
    var groupStart = deleteGroup.start;
    var groupCount = deleteGroup.count;
    var minInputs = Blockly.ExtenderMutation.getMinInputCount_(this);
    menuOptions.push({
      enabled: true,
      text: Blockly.Msg.INSERT_INPUT,
      callback: function() {
        if (this.insertInputsAtIndex && this.extendDefinitions_) {
          this.insertInputsAtIndex(insertGroup.start, {});
        } else {
          this.insertInputWithIndex_(index);
          Blockly.ExtenderMutation.cleanupTopLevelShadows_(this.workspace);
        }
      }.bind(this)
    });
    menuOptions.push({
      enabled: this.argumentIds_.length - groupCount >= minInputs,
      text: Blockly.Msg.DELETE_INPUT,
      callback: function() {
        if (groupCount > 1) {
          Blockly.ExtenderMutation.removeInputsAtIndex_.call(this, groupStart, groupCount, minInputs);
        } else {
          this.removeInputWithIndex_(index);
        }
      }.bind(this)
    });
  }
};

Blockly.ExtenderMutation.findInputIndexForBlock_ = function(block) {
  if (!block) {
    return 0;
  }

  var directChild = block;
  while (directChild && directChild.getParent && directChild.getParent() && directChild.getParent() !== this) {
    directChild = directChild.getParent();
  }

  for (var i = 0; i < this.argumentIds_.length; ++i) {
    var input = this.getInput(this.argumentIds_[i]);
    if (!input || !input.connection) continue;
    var target = input.connection.targetBlock();
    if (target === directChild) {
      return i + 1;
    }
  }

  // Fallback to legacy ordering for older blocks that still rely on child order.
  for (var j = 0; j < this.childBlocks_.length; ++j) {
    if (this.childBlocks_[j] === block) {
      return j + 1;
    }
  }

  return 0;
};

Blockly.ExtenderMutation.findBlockIndex_ = Blockly.ExtenderMutation.findInputIndexForBlock_;

Blockly.ExtenderMutation.getMutationGroupForIndex_ = function(index, block) {
  var defs = block.extendDefinitions_;
  if (!defs || !(defs.proceeds && defs.proceeds.length)) {
    return {start: index, count: 1};
  }

  var startsLen = (defs.starts || []).length;
  var proceedsLen = (defs.proceeds || []).length;
  var endsLen = (defs.ends || []).length;
  var total = (block.argumentIds_ || []).length;

  if (proceedsLen < 1) {
    return {start: index, count: 1};
  }

  // For grouped modern blocks, inserting from the starts region should append
  // the first proceeds group after starts (not before starts), otherwise
  // operator/label tokens can lead a row with no left operand.
  if (index <= startsLen) {
    return {start: startsLen + 1, count: proceedsLen};
  }

  if (endsLen > 0 && index > (total - endsLen)) {
    var endStart = total - endsLen + 1;
    return {start: endStart, count: endsLen};
  }

  var offset = index - startsLen - 1;
  var groupOffset = Math.floor(offset / proceedsLen) * proceedsLen;
  return {start: startsLen + groupOffset + 1, count: proceedsLen};
};

Blockly.ExtenderMutation.getDeleteMutationGroupForIndex_ = function(index, block) {
  var insertGroup = Blockly.ExtenderMutation.getMutationGroupForIndex_(index, block);
  var defs = block.extendDefinitions_;
  if (!defs || !(defs.proceeds && defs.proceeds.length)) {
    return insertGroup;
  }

  var startsLen = (defs.starts || []).length;
  var proceedsLen = (defs.proceeds || []).length;
  var total = (block.argumentIds_ || []).length;

  // When deleting from the starts region on modern grouped blocks,
  // remove a coherent chunk so operators/labels don't get stranded.
  if (index <= startsLen && total > startsLen) {
    return {
      start: index,
      count: Math.min(proceedsLen, total - index + 1)
    };
  }

  return insertGroup;
};

/**
 * Find a definition of a singular input by working down the definition tree.
 */
Blockly.ExtenderMutation.getInputDefinitionFromIndex_ = function (index, block) {
  if (block.extendDefinitions_) {
    var starts = block.extendDefinitions_.starts || [];
    var proceeds = block.extendDefinitions_.proceeds || [];
    var ends = block.extendDefinitions_.ends || [];

    if (index < starts.length) {
      return starts[index];
    }

    var offset = index - starts.length;
    if (proceeds.length) {
      return proceeds[offset % proceeds.length];
    }

    if (ends.length) {
      return ends[Math.min(offset, ends.length - 1)];
    }
  }

  return null;
};

/**
 * Get the definition of a set of inputs from the index it was called from.
 */
Blockly.ExtenderMutation.getInputDefinitionsFromIndex_ = function (index, block) {
  if (index !== 0) {
    return [...block.extendDefinitions_.proceeds];
  } else {
    return [...block.extendDefinitions_.starts];
  }
};

Blockly.ExtenderMutation.getIdPrefixForDefinition_ = function(definition) {
  if (!definition) return 'INPUT';

  if (typeof definition.menuArgument === 'string' && definition.menuArgument.length > 0) {
    return definition.menuArgument;
  }

  if (definition.type === Blockly.NEXT_STATEMENT) {
    return 'SUBSTACK';
  }

  if (definition.type === Blockly.DUMMY_INPUT) {
    return 'LABEL';
  }

  // VALUE_INPUT naming: prefer semantic names when possible.
  if (definition.field === 'NUM') {
    return 'NUM';
  }
  if (definition.field === 'TEXT') {
    return 'TEXT';
  }
  if (definition.check === 'Boolean') {
    return 'OPERAND';
  }
  if (definition.check === 'Number') {
    return 'NUM';
  }
  if (definition.check === 'String') {
    return 'TEXT';
  }

  return 'INPUT';
};

Blockly.ExtenderMutation.generatePredictableInputId_ = function(definition, argumentIds) {
  var prefix = Blockly.ExtenderMutation.getIdPrefixForDefinition_(definition);
  var existing = argumentIds || [];

  var counter = 1;
  var candidate = prefix;
  while (existing.indexOf(candidate) !== -1) {
    counter++;
    candidate = prefix + counter;
  }
  return candidate;
};

Blockly.ExtenderMutation.isCollapsedEndActive_ = function(block) {
  if (!block.extendDefinitions_ || !block.extendDefinitions_.collapse) {
    return false;
  }

  var startsLen = (block.extendDefinitions_.starts || []).length;
  var proceedsLen = (block.extendDefinitions_.proceeds || []).length;
  var endsLen = (block.extendDefinitions_.ends || []).length;
  var total = (block.argumentIds_ || []).length;

  if (!endsLen || total < startsLen + endsLen) {
    return false;
  }

  // If starts+ends consume all inputs, that's a valid "end active" state.
  if (proceedsLen === 0) {
    return total === (startsLen + endsLen);
  }

  var afterStartsAndEnds = total - startsLen - endsLen;
  return afterStartsAndEnds >= 0 && (afterStartsAndEnds % proceedsLen === 0);
};

Blockly.ExtenderMutation.getInsertionPlan_ = function(index, block) {
  var defs = block.extendDefinitions_ || {};
  var starts = defs.starts || [];
  var proceeds = defs.proceeds || [];
  var ends = defs.ends || [];
  var atStart = index === 0;
  var atEnd = index >= (block.argumentIds_.length + 1);

  if (atStart) {
    return {definitions: [...starts], removeTailCount: 0};
  }

  if (defs.collapse && atEnd && proceeds.length && ends.length) {
    if ((block.argumentIds_ || []).length <= starts.length) {
      return {definitions: [...proceeds], removeTailCount: 0};
    }

    // Toggle tail structure between ... + ends and ... + proceeds
    if (Blockly.ExtenderMutation.isCollapsedEndActive_(block)) {
      return {definitions: [...proceeds], removeTailCount: ends.length};
    }
    // Convert trailing else-if group into else tail.
    return {definitions: [...ends], removeTailCount: proceeds.length};
  }

  if (proceeds.length) {
    return {definitions: [...proceeds], removeTailCount: 0};
  }

  return {definitions: [...ends], removeTailCount: 0};
};

/**
 * Coordinate a set of fields and inputs at a given index.
 */
Blockly.ExtenderMutation.insertInputsAtIndex = function(index) {
  var canRecordMutation = Blockly.Events.isEnabled();
  var wasRendered = this.rendered;
  var plan = Blockly.ExtenderMutation.getInsertionPlan_(index, this);
  var definitions = plan.definitions;
  if (!definitions) {
    return;
  }

  var oldMutation = null;
  if (canRecordMutation) {
    Blockly.Events.setGroup(true);
    oldMutation = Blockly.Xml.domToText(this.mutationToDom());
  }

  try {
    if (plan.removeTailCount > 0) {
      for (var r = 0; r < plan.removeTailCount; r++) {
        if (!this.argumentIds_.length) break;
        // Remove tail entries directly as part of the same insertion operation.
        var tailName = this.argumentIds_[this.argumentIds_.length - 1];
        var tailInput = this.getInput(tailName);
        var prevRecordUndoTail = Blockly.Events.recordUndo;
        Blockly.Events.recordUndo = false;
        try {
          if (tailInput && tailInput.connection) {
            tailInput.connection.setShadowDom(null);
          }
          this.removeInput(tailName, true);
        } finally {
          Blockly.Events.recordUndo = prevRecordUndoTail;
        }
        this.argumentIds_.pop();
      }
    }

    definitions = definitions.reverse();

    for (var definition of definitions) {
      this.insertInputWithIndex_(index, definition);
    }

    this.extendCount_++;
    Blockly.ExtenderMutation.updateMinusEnabled_(this);

    if (wasRendered && !this.isInsertionMarker()) {
      this.initSvg();
      this.render();
    }

    Blockly.ExtenderMutation.cleanupTopLevelShadows_(this.workspace);

    if (canRecordMutation) {
      var newMutation = Blockly.Xml.domToText(this.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    }
  } finally {
    if (canRecordMutation) {
      Blockly.Events.setGroup(false);
    }
  }
};

/**
 * Insert an input inline on a block at a specified index. 
 * @param {Number} index The index to insert the input.
 * @param {Name} name The name of the input to insert.
 */
Blockly.ExtenderMutation.insertInputWithIndex_ = function(index, definition) {
  if (!definition) {
    definition = Blockly.ExtenderMutation.getInputDefinitionFromIndex_(index, this);
    if (!definition) return null;
  }

  definition = Object.assign({}, definition);
  var trackInMutation = !definition.transient;

  if (typeof definition.id == "undefined") {
    if (trackInMutation) {
      definition.id = Blockly.ExtenderMutation.generatePredictableInputId_(definition, this.argumentIds_);
    } else {
      definition.id = Blockly.utils.genUid();
    }
  }
  var argumentInsertAt = index <= 0 ? 0 : index - 1;
  if (trackInMutation) {
    this.argumentIds_.splice(argumentInsertAt, 0, definition.id);
  }
  var insertAt = Blockly.ExtenderMutation.getInputInsertIndex_(argumentInsertAt, this);

  var input;
  if (definition.type === Blockly.DUMMY_INPUT) {
    input = this.insertDummyInput(insertAt, definition.id);
    var labelText = definition.fieldLabel;
    if (typeof labelText !== 'string') {
      labelText = definition.field;
    }
    if (labelText) {
      var label = new Blockly.FieldLabel(labelText);
      input.appendField(label);
    }
    if (definition.extraField) {
      input.appendField(definition.extraField, definition.extraFieldName);
    }
    if (definition.menuOptions) {
      var dropdown = new Blockly.FieldDropdown(definition.menuOptions);
      var dropdownName = definition.id;
      input.appendField(dropdown, dropdownName);
      if (definition.defaultValue !== null && typeof definition.defaultValue !== 'undefined') {
        try {
          dropdown.setValue(String(definition.defaultValue));
        } catch (e) {
          // Ignore invalid defaults not present in current menu options.
        }
      }
    }
  } else if (definition.type === Blockly.NEXT_STATEMENT) {
    input = this.insertStatementInput(
      insertAt,
      definition.id
    );
  } else {
    input = this.insertValueInput(insertAt, definition.id);

    if (definition.fieldLabel) {
      input.appendField(new Blockly.FieldLabel(definition.fieldLabel));
    }
    if (definition.extraField) {
      input.appendField(definition.extraField, definition.extraFieldName);
    }

    if (definition.shadow && input.connection && !this.isInsertionMarker()) {
      if (Blockly.ExtenderMutation.shouldDeferShadowCreation_(this)) {
        input.connection.setShadowDom(null);
      } else {
        // Shadow create/connect events must not land on the undo stack.
        // Only the surrounding mutation BlockChange should be undoable;
        // domToMutation will recreate/dispose shadows on undo/redo.
        var prevRecordUndo = Blockly.Events.recordUndo;
        Blockly.Events.recordUndo = false;
        try {
          var newBlock = this.workspace.newBlock(definition.shadow);
          if (definition.field) {
            var defaultValue = definition.defaultValue;
            if (defaultValue === null || typeof defaultValue === 'undefined') {
              defaultValue = Blockly.ExtenderMutation.getShadowFieldDefault_(definition.shadow, definition.field);
            }
            newBlock.setFieldValue(defaultValue, definition.field);
          }
          newBlock.setShadow(true);

          newBlock.initSvg();

          if (newBlock.outputConnection) {
            newBlock.outputConnection.connect(input.connection);
          }

          // If connection failed for any reason, do not leave orphan top blocks.
          if (!input.connection.targetConnection) {
            newBlock.dispose();
          } else {
            newBlock.render(false);
            // Persist shadow DOM on the connection so Blockly can respawn/dispose correctly.
            input.connection.setShadowDom(Blockly.Xml.blockToDom(newBlock));
          }
        } finally {
          Blockly.Events.recordUndo = prevRecordUndo;
        }
      }
    }
  }

  if (definition.check) {
    input.setCheck(definition.check);
  }

  if (definition.forceNewRow) {
    input.forceNewRow = true;
  }

  return input;
};

Blockly.ExtenderMutation.removeInputWithIndex_ = function(index) {
  var minInputs = Blockly.ExtenderMutation.getMinInputCount_(this);
  if (this.argumentIds_.length <= minInputs) return;
  if (index < 1 || index > this.argumentIds_.length) return;

  var wasRendered = this.rendered;

  Blockly.Events.setGroup(true);

  var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
  var inputName = this.argumentIds_[index - 1];
  var input = this.getInput(inputName);
  var prevRecordUndoRm = Blockly.Events.recordUndo;
  Blockly.Events.recordUndo = false;
  try {
    // Clear serialized shadow DOM before deleting an input.
    if (input && input.connection) {
      input.connection.setShadowDom(null);
    }
    this.removeInput(inputName);
  } finally {
    Blockly.Events.recordUndo = prevRecordUndoRm;
  }
  this.argumentIds_.splice(index - 1, 1);
  Blockly.ExtenderMutation.updateMinusEnabled_(this);

  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }

  Blockly.ExtenderMutation.cleanupTopLevelShadows_(this.workspace);

  var newMutation = Blockly.Xml.domToText(this.mutationToDom());

  Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
  Blockly.Events.setGroup(false);
};

/**
 * Remove a contiguous set of inputs starting at index in one mutation event.
 * Useful for modern grouped proceed definitions.
 * @param {number} index 1-based input index.
 * @param {number} count Number of inputs to remove.
 * @param {number=} optMinInputs Optional minimum input count to preserve.
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.removeInputsAtIndex_ = function(index, count, optMinInputs) {
  if (!count || count < 1) return;

  var minInputs = typeof optMinInputs === 'number' ? optMinInputs : Blockly.ExtenderMutation.getMinInputCount_(this);
  if (index < 1 || index > this.argumentIds_.length) return;

  var maxByBounds = this.argumentIds_.length - index + 1;
  var maxByMin = this.argumentIds_.length - minInputs;
  var removable = Math.min(count, maxByBounds, maxByMin);
  if (removable < 1) return;

  var wasRendered = this.rendered;
  this.rendered = false;
  Blockly.Events.setGroup(true);

  var oldMutation = Blockly.Xml.domToText(this.mutationToDom());

  for (var i = 0; i < removable; i++) {
    var inputName = this.argumentIds_[index - 1];
    var input = this.getInput(inputName);
    var prevRecordUndoRmAt = Blockly.Events.recordUndo;
    Blockly.Events.recordUndo = false;
    try {
      if (input && input.connection) {
        input.connection.setShadowDom(null);
      }
      this.removeInput(inputName);
    } finally {
      Blockly.Events.recordUndo = prevRecordUndoRmAt;
    }
    this.argumentIds_.splice(index - 1, 1);
  }

  Blockly.ExtenderMutation.updateMinusEnabled_(this);

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }

  Blockly.ExtenderMutation.cleanupTopLevelShadows_(this.workspace);

  var newMutation = Blockly.Xml.domToText(this.mutationToDom());
  Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
  Blockly.Events.setGroup(false);
};

/**
 * Remove a number of inputs from the tail in one atomic mutation/update cycle.
 * This avoids transient invalid shapes that can cause reconnection churn.
 * @param {number} count Number of tail inputs to remove.
 * @param {number=} optMinInputs Optional minimum input count to preserve.
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.removeTailInputs_ = function(count, optMinInputs) {
  if (!count || count < 1) return;

  var minInputs = typeof optMinInputs === 'number' ? optMinInputs : Blockly.ExtenderMutation.getMinInputCount_(this);
  var removable = Math.min(count, Math.max(0, this.argumentIds_.length - minInputs));
  if (removable < 1) return;

  var wasRendered = this.rendered;
  this.rendered = false;
  Blockly.Events.setGroup(true);

  var oldMutation = Blockly.Xml.domToText(this.mutationToDom());

  for (var i = 0; i < removable; i++) {
    var inputName = this.argumentIds_[this.argumentIds_.length - 1];
    var input = this.getInput(inputName);
    var prevRecordUndoTl = Blockly.Events.recordUndo;
    Blockly.Events.recordUndo = false;
    try {
      if (input && input.connection) {
        input.connection.setShadowDom(null);
      }
      this.removeInput(inputName);
    } finally {
      Blockly.Events.recordUndo = prevRecordUndoTl;
    }
    this.argumentIds_.pop();
  }

  Blockly.ExtenderMutation.updateMinusEnabled_(this);

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }

  Blockly.ExtenderMutation.cleanupTopLevelShadows_(this.workspace);

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
      var shadowDom = null;
      if (target && target.isShadow && target.isShadow()) {
        // Serialize the live shadow block so edited field values are preserved.
        shadowDom = Blockly.Xml.blockToDom(target);
      } else {
        shadowDom = input.connection.getShadowDom();
      }
      var saveInfo = {
        shadow: shadowDom,
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
  // Preserve the plus/minus control row and only remove dynamic data inputs.
  for (var i = this.inputList.length - 1; i >= 0; --i) {
    if (this.inputList[i].name === 'DUMMY_INPUT') continue;
    this.inputList[i].dispose();
    this.inputList.splice(i, 1);
  }
};

/**
 * Create all inputs specified by the new connectionMap, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.ExtenderMutation.createAllInputs_ = function(connectionMap) {
  // Rebuild each dynamic input using its indexed definition.
  var existingIds = this.argumentIds_.slice();
  this.argumentIds_.length = 0;

  for (var i = 0; i < existingIds.length; ++i) {
    var id = existingIds[i];
    var definition = Blockly.ExtenderMutation.getInputDefinitionFromIndex_(i, this);
    if (!definition) continue;

    // Preserve serialized IDs so connected inputs map back correctly.
    definition = Object.assign({}, definition, {id: id});
    var input = this.insertInputWithIndex_(i + 1, definition);
    if (!input || !input.connection) continue;

    var oldBlock = null;
    var oldShadow = null;
    if (connectionMap && (id in connectionMap)) {
      var saveInfo = connectionMap[id];
      oldBlock = saveInfo['block'];
      oldShadow = saveInfo['shadow'];
    }

    if (oldBlock) {
      var reconnected = false;
      try {
        if (oldBlock.outputConnection && input.connection.checkType_(oldBlock.outputConnection)) {
          oldBlock.outputConnection.connect(input.connection);
          reconnected = true;
        } else if (oldBlock.previousConnection && input.connection.checkType_(oldBlock.previousConnection)) {
          oldBlock.previousConnection.connect(input.connection);
          reconnected = true;
        }
      } catch (e) {
        reconnected = false;
      }

      if (reconnected) {
        connectionMap[id] = null;
        if (oldBlock.isShadow && oldBlock.isShadow()) {
          input.connection.setShadowDom(Blockly.Xml.blockToDom(oldBlock));
        } else if (oldShadow) {
          input.connection.setShadowDom(oldShadow);
        }
      } else if (oldBlock.isShadow && oldBlock.isShadow()) {
        // If reconnect failed, ensure we don't leave a top-level orphan shadow.
        oldBlock.dispose();
      }
    }
  }

  Blockly.ExtenderMutation.cleanupTopLevelShadows_(this.workspace);
};

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

