/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
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

'use strict';

goog.provide('Blockly.Blocks.control');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['control_forever'] = {
  /**
   * Block for repeat n times (external number).
   * https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#5eke39
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_forever",
      "message0": Blockly.Msg.CONTROL_FOREVER,
      "message1": "%1", // Statement
      "message2": "%1", // Icon
      "lastDummyAlign2": "RIGHT",
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args2": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "repeat.svg",
          "width": 24,
          "height": 24,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_end"]
    });
  }
};

Blockly.Blocks['control_repeat'] = {
  /**
   * Block for repeat n times (external number).
   * https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#so57n9
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_repeat",
      "message0": Blockly.Msg.CONTROL_REPEAT,
      "message1": "%1", // Statement
      "message2": "%1", // Icon
      "lastDummyAlign2": "RIGHT",
      "args0": [
        {
          "type": "input_value",
          "name": "TIMES"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args2": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "repeat.svg",
          "width": 24,
          "height": 24,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_if'] = {
  /**
   * Block for if-then.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "control_if",
      "message0": Blockly.Msg.CONTROL_IF,
      "message1": "%1", // Statement
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_if_else'] = {
  /**
   * Block for if-else.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "control_if_else",
      "message0": Blockly.Msg.CONTROL_IF,
      "message1": "%1",
      "message2": Blockly.Msg.CONTROL_ELSE,
      "message3": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args3": [
        {
          "type": "input_statement",
          "name": "SUBSTACK2"
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_if_else_extends'] = {
  /**
   * Block for if-else.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
    this.branchKinds_ = ['if'];
    this.branchStates_ = this.createDefaultBranchStates_();
    this.argumentIds_ = this.flattenBranchStates_(this.branchStates_);
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false,
      'vertical'
    );

    this.appendDummyInput('DUMMY_INPUT')
      .appendField(this.plusminus_, 'PLUS_MINUS')
      .setAlign(Blockly.ALIGN_RIGHT);
    this.rebuildShape_();
  },

  createBranchState_: function(kind, opt_existingState, opt_branchIndex) {
    var existingState = opt_existingState || {};
    var branchIndex = opt_branchIndex || ((this.branchStates_ ? this.branchStates_.length : 0) + 1);
    return {
      kind: kind,
      labelId: existingState.labelId || ('LABEL' + branchIndex),
      conditionId: kind === 'else' ? null : (existingState.conditionId || (branchIndex === 1 ? 'CONDITION' : ('CONDITION' + branchIndex))),
      thenId: kind === 'else' ? null : (existingState.thenId || ('THEN' + branchIndex)),
      substackId: existingState.substackId || (branchIndex === 1 ? 'SUBSTACK' : ('SUBSTACK' + branchIndex))
    };
  },

  createDefaultBranchStates_: function() {
    return [
      this.createBranchState_('if', null, 1)
    ];
  },

  flattenBranchStates_: function(branchStates) {
    var argumentIds = [];
    for (var i = 0; i < branchStates.length; i++) {
      var branchState = branchStates[i];
      argumentIds.push(branchState.labelId);
      if (branchState.kind !== 'else') {
        argumentIds.push(branchState.conditionId);
        argumentIds.push(branchState.thenId);
      }
      argumentIds.push(branchState.substackId);
    }
    return argumentIds;
  },

  flattenAllIds_: function() {
    return this.flattenBranchStates_(this.branchStates_);
  },

  loadBranchStates_: function(branchKinds, argumentIds) {
    var cursor = 0;
    var branchStates = [];

    for (var i = 0; i < branchKinds.length; i++) {
      var kind = branchKinds[i];
      var branchState = this.createBranchState_(kind, {
        labelId: argumentIds[cursor++]
      });

      if (kind !== 'else') {
        branchState.conditionId = argumentIds[cursor++] || branchState.conditionId;
        branchState.thenId = argumentIds[cursor++] || branchState.thenId;
      }

      branchState.substackId = argumentIds[cursor++] || branchState.substackId;
      branchStates.push(branchState);
    }

    if (!branchStates.length) {
      branchStates = this.createDefaultBranchStates_();
    }

    this.branchStates_ = branchStates;
    this.branchKinds_ = branchStates.map(function(branchState) {
      return branchState.kind;
    });
    this.argumentIds_ = this.flattenBranchStates_(this.branchStates_);
  },

  getBranchDefinitions_: function(branchState) {
    var kind = branchState.kind;
    if (kind === 'else') {
      return [
        {id: branchState.labelId, type: Blockly.DUMMY_INPUT, shadow: null, field: 'else', check: null, forceNewRow: true},
        {id: branchState.substackId, type: Blockly.NEXT_STATEMENT, shadow: null, field: null, check: null}
      ];
    }

    return [
      {id: branchState.labelId, type: Blockly.DUMMY_INPUT, shadow: null, field: kind === 'if' ? 'if' : 'else if', check: null, forceNewRow: true},
      {id: branchState.conditionId, type: Blockly.VALUE_INPUT, shadow: null, field: null, check: 'Boolean'},
      {id: branchState.thenId, type: Blockly.DUMMY_INPUT, shadow: null, field: 'then', check: null},
      {id: branchState.substackId, type: Blockly.NEXT_STATEMENT, shadow: null, field: null, check: null}
    ];
  },

  getActiveDefinitions_: function() {
    var definitions = [];
    for (var i = 0; i < this.branchStates_.length; i++) {
      definitions = definitions.concat(this.getBranchDefinitions_(this.branchStates_[i]));
    }
    return definitions;
  },

  canRemove_: function() {
    return this.branchKinds_.length > 1;
  },

  syncBranchKinds_: function() {
    Blockly.ExtenderMutation.syncBranchKinds_.call(this, this.flattenAllIds_);
  },

  updateButtons_: function() {
    Blockly.ExtenderMutation.updateBranchButtons_.call(this);
  },

  rebuildShape_: function() {
    Blockly.ExtenderMutation.rebuildFromDefinitions_.call(this);
  },

  // callback functions
  handlePlus_: function () {
    Blockly.Events.setGroup(true);
    try {
      var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
      var tailState = this.branchStates_[this.branchStates_.length - 1];
      if (this.branchStates_.length === 1) {
        this.branchStates_.push(this.createBranchState_('else', null, this.branchStates_.length + 1));
      } else if (tailState.kind === 'else') {
        this.branchStates_[this.branchStates_.length - 1] = this.createBranchState_('elseif', tailState, this.branchStates_.length);
      } else {
        this.branchStates_.push(this.createBranchState_('else', null, this.branchStates_.length + 1));
      }
      this.syncBranchKinds_();
      this.rebuildShape_();
      var newMutation = Blockly.Xml.domToText(this.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    } finally {
      Blockly.Events.setGroup(false);
    }
  },
  handleMinus_: function () {
    if (!this.canRemove_()) return;
    Blockly.Events.setGroup(true);
    try {
      var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
      var tailState = this.branchStates_[this.branchStates_.length - 1];
      if (tailState.kind === 'else') {
        this.branchStates_.pop();
      } else {
        this.branchStates_[this.branchStates_.length - 1] = this.createBranchState_('else', tailState, this.branchStates_.length);
      }
      this.syncBranchKinds_();
      this.rebuildShape_();
      var newMutation = Blockly.Xml.domToText(this.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    } finally {
      Blockly.Events.setGroup(false);
    }
  },

  mutationToDom: Blockly.ExtenderMutation.branchMutationToDom,
  domToMutation: function(xmlElement) {
    Blockly.ExtenderMutation.branchDomToMutation.call(this, xmlElement, '["if"]');
  },

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['control_switch_case_extends'] = {
  /**
   * Extendable switch/case/default test block.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
    this.switchLabelId_ = 'SWITCH_LABEL';
    this.switchValueId_ = 'SWITCH_VALUE';
    this.branchKinds_ = ['case'];
    this.branchStates_ = this.createDefaultBranchStates_();
    this.argumentIds_ = this.flattenAllIds_();
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false,
      'vertical'
    );
    // Inline flow keeps "case" + first value input on one row.
    this.setInputsInline(true);
    // Keep the branch-level extender in a persistent bottom row so it does
    // not get rebound during dynamic shape rebuilds.
    this.appendDummyInput('DUMMY_INPUT')
      .appendField(this.plusminus_, 'PLUS_MINUS')
      .setAlign(Blockly.ALIGN_RIGHT);
    this.rebuildShape_();
  },

  createBranchState_: function(kind, opt_existingState, opt_branchIndex) {
    var existingState = opt_existingState || {};
    var branchIndex = opt_branchIndex || ((this.branchStates_ ? this.branchStates_.length : 0) + 1);
    var valueIds = [];
    if (kind === 'case') {
      if (existingState.valueIds && existingState.valueIds.length) {
        valueIds = existingState.valueIds.slice();
      } else if (existingState.caseValueId) {
        valueIds = [existingState.caseValueId];
      } else {
        valueIds = [branchIndex === 1 ? 'CASE_VALUE' : ('CASE_VALUE' + branchIndex)];
      }
    }
    return {
      kind: kind,
      labelId: existingState.labelId || ('CASE_LABEL' + branchIndex),
      valueIds: valueIds,
      substackId: existingState.substackId || (branchIndex === 1 ? 'SUBSTACK' : ('SUBSTACK' + branchIndex))
    };
  },

  createDefaultBranchStates_: function() {
    return [
      this.createBranchState_('case', null, 1)
    ];
  },

  flattenBranchStates_: function(branchStates) {
    var argumentIds = [];
    for (var i = 0; i < branchStates.length; i++) {
      var branchState = branchStates[i];
      argumentIds.push(branchState.labelId);
      if (branchState.kind === 'case') {
        for (var j = 0; j < branchState.valueIds.length; j++) {
          argumentIds.push(branchState.valueIds[j]);
        }
      }
      argumentIds.push(branchState.substackId);
    }
    return argumentIds;
  },

  getCaseValueCounts_: function() {
    return this.branchStates_.map(function(branchState) {
      return branchState.kind === 'case' ? branchState.valueIds.length : 0;
    });
  },

  flattenAllIds_: function() {
    return [this.switchLabelId_, this.switchValueId_].concat(this.flattenBranchStates_(this.branchStates_));
  },

  loadBranchStates_: function(branchKinds, argumentIds, caseValueCounts) {
    var cursor = 0;

    this.switchLabelId_ = argumentIds[cursor++] || this.switchLabelId_ || Blockly.utils.genUid();
    this.switchValueId_ = argumentIds[cursor++] || this.switchValueId_ || Blockly.utils.genUid();

    var branchStates = [];
    for (var i = 0; i < branchKinds.length; i++) {
      var kind = branchKinds[i];
      var branchState = this.createBranchState_(kind, {
        labelId: argumentIds[cursor++]
      });

      if (kind === 'case') {
        var caseCount = 1;
        if (caseValueCounts && typeof caseValueCounts[i] === 'number' && caseValueCounts[i] > 0) {
          caseCount = caseValueCounts[i];
        }
        branchState.valueIds = [];
        for (var j = 0; j < caseCount; j++) {
          branchState.valueIds.push(argumentIds[cursor++] || this.generateCaseValueId_(branchState));
        }
      }

      branchState.substackId = argumentIds[cursor++] || branchState.substackId;
      branchStates.push(branchState);
    }

    if (!branchStates.length) {
      branchStates = this.createDefaultBranchStates_();
    }

    this.branchStates_ = branchStates;
    this.syncBranchKinds_();
  },

  findBranchByLabelId_: function(labelId) {
    for (var i = 0; i < this.branchStates_.length; i++) {
      var branchState = this.branchStates_[i];
      if (branchState.labelId === labelId) {
        return branchState;
      }
    }
    return null;
  },

  generateCaseValueId_: function(branchState) {
    var prefix = 'CASE_VALUE_' + branchState.labelId + '_';
    var existing = this.flattenAllIds_();
    var counter = 1;
    var candidate = prefix + counter;
    while (existing.indexOf(candidate) !== -1) {
      counter++;
      candidate = prefix + counter;
    }
    return candidate;
  },

  canRemoveCaseValue_: function(labelId) {
    var branchState = this.findBranchByLabelId_(labelId);
    return !!(branchState && branchState.kind === 'case' && branchState.valueIds.length > 1);
  },

  createCaseValueExtender_: function(labelId) {
    return new Blockly.FieldExtender(
      this.handleCaseValuePlus_.bind(this, labelId),
      this.handleCaseValueMinus_.bind(this, labelId),
      true,
      this.canRemoveCaseValue_(labelId)
    );
  },

  handleCaseValuePlus_: function(labelId) {
    var branchState = this.findBranchByLabelId_(labelId);
    if (!branchState || branchState.kind !== 'case') return;
    Blockly.Events.setGroup(true);
    try {
      var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
      branchState.valueIds.push(this.generateCaseValueId_(branchState));
      this.syncBranchKinds_();
      this.rebuildShape_();
      var newMutation = Blockly.Xml.domToText(this.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    } finally {
      Blockly.Events.setGroup(false);
    }
  },

  handleCaseValueMinus_: function(labelId) {
    var branchState = this.findBranchByLabelId_(labelId);
    if (!branchState || branchState.kind !== 'case' || branchState.valueIds.length <= 1) return;
    Blockly.Events.setGroup(true);
    try {
      var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
      branchState.valueIds.pop();
      this.syncBranchKinds_();
      this.rebuildShape_();
      var newMutation = Blockly.Xml.domToText(this.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    } finally {
      Blockly.Events.setGroup(false);
    }
  },

  getBranchDefinitions_: function(branchState) {
    if (branchState.kind === 'default') {
      return [
        {id: branchState.labelId, type: Blockly.DUMMY_INPUT, shadow: null, field: 'default', check: null, forceNewRow: true},
        {id: branchState.substackId, type: Blockly.NEXT_STATEMENT, shadow: null, field: null, check: null}
      ];
    }

    var definitions = [
      {
        id: branchState.labelId,
        type: Blockly.DUMMY_INPUT,
        shadow: null,
        field: 'case',
        check: null,
        forceNewRow: true
      }
    ];

    for (var i = 0; i < branchState.valueIds.length; i++) {
      var valueDefinition = {
        id: branchState.valueIds[i],
        type: Blockly.VALUE_INPUT,
        shadow: 'text',
        field: 'TEXT',
        check: null,
        forceNewRow: i > 0
      };
      if (i > 0) {
        valueDefinition.fieldLabel = 'or';
      } else {
        // Keep first case value on same row as "case".
        valueDefinition.forceNewRow = false;
      }
      definitions.push(valueDefinition);
    }

    definitions.push({
      id: 'CASE_EXTENDER_ROW_' + branchState.labelId,
      type: Blockly.DUMMY_INPUT,
      shadow: null,
      field: null,
      check: null,
      transient: true,
      extraField: this.createCaseValueExtender_(branchState.labelId),
      extraFieldName: 'CASE_EXTENDER'
    });

    definitions.push({id: branchState.substackId, type: Blockly.NEXT_STATEMENT, shadow: null, field: null, check: null});
    return definitions;
  },

  getActiveDefinitions_: function() {
    var definitions = [
      {id: this.switchLabelId_, type: Blockly.DUMMY_INPUT, shadow: null, field: 'switch', check: null, forceNewRow: true},
      {id: this.switchValueId_, type: Blockly.VALUE_INPUT, shadow: 'text', field: 'TEXT', check: null}
    ];

    for (var i = 0; i < this.branchStates_.length; i++) {
      definitions = definitions.concat(this.getBranchDefinitions_(this.branchStates_[i]));
    }
    return definitions;
  },

  canRemove_: function() {
    return this.branchStates_.length > 1;
  },

  syncBranchKinds_: function() {
    Blockly.ExtenderMutation.syncBranchKinds_.call(this, this.flattenAllIds_);
  },

  updateButtons_: function() {
    Blockly.ExtenderMutation.updateBranchButtons_.call(this);
  },

  rebuildShape_: function() {
    Blockly.ExtenderMutation.rebuildFromDefinitions_.call(this);
  },

  handlePlus_: function () {
    Blockly.Events.setGroup(true);
    try {
      var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
      var tailState = this.branchStates_[this.branchStates_.length - 1];
      if (tailState.kind === 'default') {
        this.branchStates_[this.branchStates_.length - 1] = this.createBranchState_('case', tailState, this.branchStates_.length);
      } else {
        this.branchStates_.push(this.createBranchState_('default', null, this.branchStates_.length + 1));
      }
      this.syncBranchKinds_();
      this.rebuildShape_();
      var newMutation = Blockly.Xml.domToText(this.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    } finally {
      Blockly.Events.setGroup(false);
    }
  },

  handleMinus_: function () {
    if (!this.canRemove_()) return;
    Blockly.Events.setGroup(true);
    try {
      var oldMutation = Blockly.Xml.domToText(this.mutationToDom());
      var tailState = this.branchStates_[this.branchStates_.length - 1];
      if (tailState.kind === 'default') {
        this.branchStates_.pop();
      } else {
        this.branchStates_[this.branchStates_.length - 1] = this.createBranchState_('default', tailState, this.branchStates_.length);
      }
      this.syncBranchKinds_();
      this.rebuildShape_();
      var newMutation = Blockly.Xml.domToText(this.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this, 'mutation', null, oldMutation, newMutation));
    } finally {
      Blockly.Events.setGroup(false);
    }
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
    container.setAttribute('branchkinds', JSON.stringify(this.branchKinds_));
    container.setAttribute('casevaluecounts', JSON.stringify(this.getCaseValueCounts_()));
    return container;
  },

  domToMutation: function(xmlElement) {
    var argumentIds = JSON.parse(xmlElement.getAttribute('argumentids') || '[]');
    var branchKinds = JSON.parse(xmlElement.getAttribute('branchkinds') || '["case"]');
    var caseValueCounts = JSON.parse(xmlElement.getAttribute('casevaluecounts') || '[]');
    this.loadBranchStates_(branchKinds, argumentIds, caseValueCounts);
    this.rebuildShape_();
  },

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_
};

Blockly.Blocks['control_stop'] = {
  /**
   * Block for stop all scripts.
   * @this Blockly.Block
   */
  init: function() {
    var ALL_SCRIPTS = 'all';
    var THIS_SCRIPT = 'this script';
    var OTHER_SCRIPTS = 'other scripts in sprite';
    var stopDropdown = new Blockly.FieldDropdown(function() {
      if (this.sourceBlock_ &&
          this.sourceBlock_.nextConnection &&
          this.sourceBlock_.nextConnection.isConnected()) {
        return [
          [Blockly.Msg.CONTROL_STOP_OTHER, OTHER_SCRIPTS]
        ];
      }
      return [[Blockly.Msg.CONTROL_STOP_ALL, ALL_SCRIPTS],
        [Blockly.Msg.CONTROL_STOP_THIS, THIS_SCRIPT],
        [Blockly.Msg.CONTROL_STOP_OTHER, OTHER_SCRIPTS]
      ];
    }, function(option) {
      // Create an event group to keep field value and mutator in sync
      // Return null at the end because setValue is called here already.
      Blockly.Events.setGroup(true);
      var oldMutation = Blockly.Xml.domToText(this.sourceBlock_.mutationToDom());
      this.sourceBlock_.setNextStatement(option == OTHER_SCRIPTS);
      var newMutation = Blockly.Xml.domToText(this.sourceBlock_.mutationToDom());
      Blockly.Events.fire(new Blockly.Events.BlockChange(this.sourceBlock_,
          'mutation', null, oldMutation, newMutation));
      this.setValue(option);
      Blockly.Events.setGroup(false);
      return null;
    });
    this.appendDummyInput()
        .appendField(Blockly.Msg.CONTROL_STOP)
        .appendField(stopDropdown, 'STOP_OPTION');
    this.setCategory(Blockly.Categories.control);
    this.setColour(Blockly.Colours.control.primary,
        Blockly.Colours.control.secondary,
        Blockly.Colours.control.tertiary,
        Blockly.Colours.control.quaternary
    );
    this.setPreviousStatement(true);
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('hasnext', this.nextConnection != null);
    return container;
  },
  domToMutation: function(xmlElement) {
    var hasNext = (xmlElement.getAttribute('hasnext') == 'true');
    this.setNextStatement(hasNext);
  }
};

Blockly.Blocks['control_break'] = {
  /**
   * Block to break away from a loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_break",
      "message0": Blockly.Msg.CONTROL_BREAK,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "break.svg",
          "width": 24,
          "height": 24,
          "flip_rtl": true
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_end"]
    });
  }
};

Blockly.Blocks['control_continue'] = {
  /**
   * Block to continue a loop onto the next iteration.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_continue",
      "message0": Blockly.Msg.CONTROL_CONTINUE,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "repeat.svg",
          "width": 24,
          "height": 24,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_end"]
    });
  }
};

Blockly.Blocks['control_wait'] = {
  /**
   * Block to wait (pause) stack.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_wait",
      "message0": Blockly.Msg.CONTROL_WAIT,
      "args0": [
        {
          "type": "input_value",
          "name": "DURATION"
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_wait_until'] = {
  /**
   * Block to wait until a condition becomes true.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_WAITUNTIL,
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_repeat_until'] = {
  /**
   * Block to repeat until a condition becomes true.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_REPEATUNTIL,
      "message1": "%1",
      "message2": "%1",
      "lastDummyAlign2": "RIGHT",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args2": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "repeat.svg",
          "width": 24,
          "height": 24,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_while'] = {
  /**
   * Block to repeat until a condition becomes false.
   * (This is an obsolete "hacked" block, for compatibility with 2.0.)
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_WHILE,
      "message1": "%1",
      "message2": "%1",
      "lastDummyAlign2": "RIGHT",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args2": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "repeat.svg",
          "width": 24,
          "height": 24,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_for_each'] = {
  /**
   * Block for for-each. This is an obsolete block that is implemented for
   * compatibility with Scratch 2.0 projects.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "control_for_each",
      "message0": Blockly.Msg.CONTROL_FOREACH,
      "message1": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "VARIABLE"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "category": Blockly.Categories.data,
      "extensions": ["colours_data", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_start_as_clone'] = {
  /**
   * Block for "when I start as a clone" hat.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_start_as_clone",
      "message0": Blockly.Msg.CONTROL_STARTASCLONE,
      "args0": [
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_hat"]
    });
  }
};

Blockly.Blocks['control_create_clone_of_menu'] = {
  /**
   * Create-clone drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CLONE_OPTION",
          "options": [
            [Blockly.Msg.CONTROL_CREATECLONEOF_MYSELF, '_myself_']
          ]
        }
      ],
      "extensions": ["colours_control", "output_string"]
    });
  }
};

Blockly.Blocks['control_create_clone_of'] = {
  /**
   * Block for "create clone of..."
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_start_as_clone",
      "message0": Blockly.Msg.CONTROL_CREATECLONEOF,
      "args0": [
        {
          "type": "input_value",
          "name": "CLONE_OPTION"
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_delete_this_clone'] = {
  /**
   * Block for "delete this clone."
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_DELETETHISCLONE,
      "args0": [
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_end"]
    });
  }
};

Blockly.Blocks['control_get_counter'] = {
  /**
   * Block to get the counter value. This is an obsolete block that is
   * implemented for compatibility with Scratch 2.0 projects.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_COUNTER,
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "output_number"]
    });
  }
};

Blockly.Blocks['control_incr_counter'] = {
  /**
   * Block to add one to the counter value. This is an obsolete block that is
   * implemented for compatibility with Scratch 2.0 projects.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_INCRCOUNTER,
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_clear_counter'] = {
  /**
   * Block to clear the counter value. This is an obsolete block that is
   * implemented for compatibility with Scratch 2.0 projects.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_CLEARCOUNTER,
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

Blockly.Blocks['control_all_at_once'] = {
  /**
   * Block to run the contained script. This is an obsolete block that was
   * implemented for compatibility with Scratch 2.0 projects. The original
   * intended functionality was to run the blocks sequentially in 1 frame,
   * not dissimilar from the "run without screen refresh" option in
   * procedure definitions. In Unsandboxed, this has been reimplemented.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROL_ALLATONCE,
      "message1": "%1", // Statement
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "category": Blockly.Categories.control,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

// Secret transformation group: control_repeat_until <-> control_while
// Guard is needed because blocks_compressed_vertical.js is compiled
// standalone without the full Blockly core.
if (Blockly.SecretTransformations) {
  Blockly.SecretTransformations.addDefaultShadow(
    'control_wait', 'DURATION',
    '<shadow type="math_positive_number"><field name="NUM">1</field></shadow>');
  Blockly.SecretTransformations.addDefaultShadow(
    'control_repeat', 'TIMES',
    '<shadow type="math_whole_number"><field name="NUM">10</field></shadow>');

  Blockly.SecretTransformations.addGroup(
    ['control_repeat', 'control_forever']);
  Blockly.SecretTransformations.addGroup(
      ['control_repeat_until', 'control_while']);
  Blockly.SecretTransformations.addGroup(
      ['control_wait', 'control_wait_until']);
  Blockly.SecretTransformations.addGroup(
      ['control_if', 'control_if_else']);
  Blockly.SecretTransformations.addGroup(
      ['control_break', 'control_continue']);

  Blockly.SecretTransformations.addSpecialTransformation(
      'control_if_else_extends',
      function(block) {
        if (!block || !Array.isArray(block.branchStates_) ||
            typeof block.handlePlus_ !== 'function' ||
            typeof block.handleMinus_ !== 'function') {
          return false;
        }

        var tailState = block.branchStates_[block.branchStates_.length - 1];
        var hasElseTail = !!(tailState && tailState.kind === 'else');

        if (hasElseTail) {
          if (typeof block.canRemove_ === 'function' && !block.canRemove_()) {
            return false;
          }
          block.handleMinus_();
          return true;
        }

        block.handlePlus_();
        return true;
      });
}
