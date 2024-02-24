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
 * IMPORTANT NOTE:
 *
 * Unsandboxed splits the standard Scratch/TurboWarp "operators" category
 * into Strings and Operators. Some of these blocks still have the "operator"
 * prefix to remain compatible with versions of TurboWarp and legacy versions
 * of Unsandboxed. This is not a mistake.
 */
'use strict';

goog.provide('Blockly.Blocks.string');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['operator_length'] = {
  /**
   * Block for string length operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LENGTH,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['operator_join'] = {
  /**
   * Block for string join operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_JOIN,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING1"
        },
        {
          "type": "input_value",
          "name": "STRING2"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['string_reverse'] = { // usb
  /**
   * Block for string reverse operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_REVERSE,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['string_repeat'] = { // usb
  /**
   * Block for string repeat operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_REPEAT,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING"
        },
        {
          "type": "input_value",
          "name": "NUMBER"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['string_replace'] = { // usb
  /**
   * Block for string replace operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_REPLACE,
      "args0": [
        {
          "type": "input_value",
          "name": "REPLACE"
        },
        {
          "type": "input_value",
          "name": "WITH"
        },
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['operator_letter_of'] = {
  /**
   * Block for "letter _ of _" operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LETTEROF,
      "args0": [
        {
          "type": "input_value",
          "name": "LETTER"
        },
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['operator_letters_of'] = {
  /**
   * Block for "letter _ to _ of _" operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_LETTERSOF,
      "args0": [
        {
          "type": "input_value",
          "name": "LETTER1"
        },
        {
          "type": "input_value",
          "name": "LETTER2"
        },
        {
          "type": "input_value",
          "name": "STRING"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['string_item_split'] = { // usb
  /**
   * Block for string split operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_ITEMSPLIT,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "STRING"
        },
        {
          "type": "input_value",
          "name": "SPLIT"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['string_ternary'] = { // usb
  /**
   * Block for string ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_TERNARY,
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION"
        },
        {
          "type": "input_value",
          "name": "STRING1"
        },
        {
          "type": "input_value",
          "name": "STRING2"
        }
      ],
      "output": null,
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings"],
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['string_convert'] = { // usb
  /**
   * Block for making a string upper or lowercase.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_CONVERT,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING"
        },
        {
          "type": "field_dropdown",
          "name": "CONVERT",
          "options": [
            [Blockly.Msg.STRING_CONVERT_UPPERCASE, 'uppercase'],
            [Blockly.Msg.STRING_CONVERT_LOWERCASE, 'lowercase']
          ]
        },
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['string_index_of'] = { // usb
  /**
   * Block for getting the index of a value in a string.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_INDEXOF,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "STRING1"
        },
        {
          "type": "input_value",
          "name": "STRING2"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_string"]
    });
  }
};

Blockly.Blocks['operator_contains'] = {
  /**
   * Block for _ contains _ operator
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_CONTAINS,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING1"
        },
        {
          "type": "input_value",
          "name": "STRING2"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_boolean"]
    });
  }
};

Blockly.Blocks['string_exactly'] = {
  /**
   * Block for _ === _ operator
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_EXACTLY,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING1"
        },
        {
          "type": "input_value",
          "name": "STRING2"
        }
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_boolean"]
    });
  }
};

Blockly.Blocks['string_is'] = {
  /**
   * Block to get whether a string is uppercase or lowercase.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.STRING_IS,
      "args0": [
        {
          "type": "input_value",
          "name": "STRING"
        },
        {
          "type": "field_dropdown",
          "name": "CONVERT",
          "options": [
            [Blockly.Msg.STRING_CONVERT_UPPERCASE, 'uppercase'],
            [Blockly.Msg.STRING_CONVERT_LOWERCASE, 'lowercase']
          ]
        },
      ],
      "category": Blockly.Categories.string,
      "extensions": ["colours_strings", "output_boolean"]
    });
  }
};
