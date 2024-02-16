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

goog.provide('Blockly.Blocks.camera');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.Blocks['camera_movetoxy'] = {
  /**
   * Block to move the camera to X, Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_MOVETOXY,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "X"
        },
        {
          "type": "input_value",
          "name": "Y"
        }
      ],
      "category": Blockly.Categories.camera,
      "extensions": ["colours_camera", "shape_statement"]
    });
  }
};

Blockly.Blocks['camera_changebyxy'] = {
  /**
   * Block to move change the camera's X, Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_CHANGEBYXY,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "X"
        },
        {
          "type": "input_value",
          "name": "Y"
        }
      ],
      "category": Blockly.Categories.camera,
      "extensions": ["colours_camera", "shape_statement"]
    });
  }
};

Blockly.Blocks['camera_setx'] = {
  /**
   * Block to set the camera's X.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_SETX,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "X"
        }
      ],
      "category": Blockly.Categories.camera,
      "extensions": ["colours_camera", "shape_statement"]
    });
  }
};

Blockly.Blocks['camera_changex'] = {
  /**
   * Block to change the camera's X.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_CHANGEX,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "X"
        }
      ],
      "category": Blockly.Categories.camera,
      "extensions": ["colours_camera", "shape_statement"]
    });
  }
};

Blockly.Blocks['camera_sety'] = {
  /**
   * Block to set the camera's Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_SETY,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "Y"
        }
      ],
      "category": Blockly.Categories.camera,
      "extensions": ["colours_camera", "shape_statement"]
    });
  }
};

Blockly.Blocks['camera_changey'] = {
  /**
   * Block to change the camera's Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_CHANGEY,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "Y"
        }
      ],
      "category": Blockly.Categories.camera,
      "extensions": ["colours_camera", "shape_statement"]
    });
  }
};

Blockly.Blocks['camera_xposition'] = {
  /**
   * Block to report camera's X.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_XPOSITION,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        }
      ],
      "category": Blockly.Categories.camera,
      "checkboxInFlyout": true,
      "extensions": ["colours_camera", "output_number"]
    });
  }
};

Blockly.Blocks['camera_yposition'] = {
  /**
   * Block to report camera's Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CAMERA_YPOSITION,
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "camera.svg",
          "width": 24,
          "height": 24
        }
      ],
      "category": Blockly.Categories.camera,
      "checkboxInFlyout": true,
      "extensions": ["colours_camera", "output_number"]
    });
  }
};
