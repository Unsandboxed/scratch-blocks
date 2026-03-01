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

'use strict';

goog.provide('Blockly.Blocks.operators');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['operator_add'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_ADD,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_add_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_ADD_EXTENDS,
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = "+";
    this.extendInput_ = {
      type: "math_number",
      name: "NUM"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_subtract'] = {
  /**
   * Block for subtracting two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_SUBTRACT,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_subtract_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_SUBTRACT_EXTENDS,
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = "-";
    this.extendInput_ = {
      type: "math_number",
      name: "NUM"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_multiply'] = {
  /**
   * Block for multiplying two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MULTIPLY,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_multiply_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MULTIPLY_EXTENDS,
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = "*";
    this.extendInput_ = {
      type: "math_number",
      name: "NUM"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_divide'] = {
  /**
   * Block for dividing two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_DIVIDE,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_divide_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_DIVIDE_EXTENDS,
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = "/";
    this.extendInput_ = {
      type: "math_number",
      name: "NUM"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_exponent'] = { // usb
  /**
   * Block for getting a number to the power of another number.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_EXPONENT,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_random'] = {
  /**
   * Block for picking a random number.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_RANDOM,
      "args0": [
        {
          "type": "input_value",
          "name": "FROM"
        },
        {
          "type": "input_value",
          "name": "TO"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_clamp'] = { // usb
  /**
   * Block for constraining a number between 2 values.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_CLAMP,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM"
        },
        {
          "type": "input_value",
          "name": "FROM"
        },
        {
          "type": "input_value",
          "name": "TO"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_lt'] = {
  /**
   * Block for less than comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LT,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_lt_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_LT_EXTENDS;
    this.extendInput_ = {
      type: "text",
      name: "TEXT"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_lt_equals'] = { // usb
  /**
   * Block for less than or equal to comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LT_EQUALS,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_lt_equals_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_LT_EQUALS_EXTENDS;
    this.extendInput_ = {
      type: "text",
      name: "TEXT"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_equals'] = {
  /**
   * Block for equals comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_EQUALS,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_equals_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_EQUALS_EXTENDS;
    this.extendInput_ = {
      type: "text",
      name: "TEXT"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_gt'] = {
  /**
   * Block for greater than comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_GT,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_gt_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_GT_EXTENDS;
    this.extendInput_ = {
      type: "text",
      name: "TEXT"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_gt_equals'] = { // usb
  /**
   * Block for greater than or equal to comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_GT_EQUALS,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1"
        },
        {
          "type": "input_value",
          "name": "OPERAND2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_gt_equals_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_GT_EQUALS_EXTENDS;
    this.extendInput_ = {
      type: "text",
      name: "TEXT"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_and'] = {
  /**
   * Block for "and" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_AND,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "OPERAND2",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_and_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_AND_EXTENDS;
    this.extendInput_ = {
      check: "Boolean"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_or'] = {
  /**
   * Block for "or" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_OR,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "OPERAND2",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_or_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_OR_EXTENDS;
    this.extendInput_ = {
      check: "Boolean"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_xor'] = { // usb
  /**
   * Block for "xor" boolean comparator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_XOR,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND1",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "OPERAND2",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_xor_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_XOR_EXTENDS;
    this.extendInput_ = {
      check: "Boolean"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_not'] = {
  /**
   * Block for "not" unary boolean operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_NOT,
      "args0": [
        {
          "type": "input_value",
          "name": "OPERAND",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_boolean"]
    });
  }
};

Blockly.Blocks['operator_mod'] = {
  /**
   * Block for mod two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MOD,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_min'] = { // usb
  /**
   * Returns the smallest value out of the 2 numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MIN,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_min_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_MIN_EXTENDS;
    this.extendInput_ = {
      type: "math_number",
      name: "NUM"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_max'] = { // usb
  /**
   * Returns the biggest value of the 2 numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MAX,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM1"
        },
        {
          "type": "input_value",
          "name": "NUM2"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_max_extends'] = {
  /**
   * Block for adding two numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "",
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
    this.argumentIds_ = [];
    this.extendLabel_ = Blockly.Msg.OPERATORS_MAX_EXTENDS;
    this.extendInput_ = {
      type: "math_number",
      name: "NUM"
    };
    this.hasFirstLabel_ = false;
    this.plusminus_ = new Blockly.FieldExtender(
      this.handlePlus_.bind(this),
      this.handleMinus_.bind(this),
      true,
      false
    );
    this.appendDummyInput('DUMMY_INPUT').appendField(this.plusminus_, 'PLUS_MINUS');
  },
  // callback functions
  handlePlus_: function () {
    var label = new Blockly.FieldLabel(this.extendLabel_);
    var input = this.insertInputWithIndex_(this.argumentIds_.length);

    if (this.argumentIds_.length > 1) {
      input.appendField(label);
    }
  },
  handleMinus_: function () {
    this.removeInputWithIndex_(this.argumentIds_.length);
  },

  mutationToDom: Blockly.ExtenderMutation.mutationToDom,
  domToMutation: Blockly.ExtenderMutation.domToMutation,
  updateDisplay_: Blockly.ExtenderMutation.updateDisplay_,

  findBlockIndex_: Blockly.ExtenderMutation.findBlockIndex_,

  insertInputWithIndex_: Blockly.ExtenderMutation.insertInputWithIndex_,
  removeInputWithIndex_: Blockly.ExtenderMutation.removeInputWithIndex_,
  disconnectOldBlocks_: Blockly.ExtenderMutation.disconnectOldBlocks_,
  removeAllInputs_: Blockly.ExtenderMutation.removeAllInputs_,
  createAllInputs_: Blockly.ExtenderMutation.createAllInputs_,
  deleteShadows_: Blockly.ExtenderMutation.deleteShadows_,
};

Blockly.Blocks['operator_round'] = {
  /**
   * Block for rounding a numbers.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_ROUND,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};

Blockly.Blocks['operator_mathop'] = {
  /**
   * Block for "advanced" math ops on a number.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_MATHOP,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            [Blockly.Msg.OPERATORS_MATHOP_ABS, 'abs'],
            [Blockly.Msg.OPERATORS_MATHOP_FLOOR, 'floor'],
            [Blockly.Msg.OPERATORS_MATHOP_CEILING, 'ceiling'],
            [Blockly.Msg.OPERATORS_MATHOP_SQRT, 'sqrt'],
            [Blockly.Msg.OPERATORS_MATHOP_SIN, 'sin'],
            [Blockly.Msg.OPERATORS_MATHOP_COS, 'cos'],
            [Blockly.Msg.OPERATORS_MATHOP_TAN, 'tan'],
            [Blockly.Msg.OPERATORS_MATHOP_ASIN, 'asin'],
            [Blockly.Msg.OPERATORS_MATHOP_ACOS, 'acos'],
            [Blockly.Msg.OPERATORS_MATHOP_ATAN, 'atan'],
            [Blockly.Msg.OPERATORS_MATHOP_LN, 'ln'],
            [Blockly.Msg.OPERATORS_MATHOP_LOG, 'log'],
            [Blockly.Msg.OPERATORS_MATHOP_EEXP, 'e ^'],
            [Blockly.Msg.OPERATORS_MATHOP_10EXP, '10 ^']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM"
        }
      ],
      "category": Blockly.Categories.operators,
      "extensions": ["colours_operators", "output_number"]
    });
  }
};
