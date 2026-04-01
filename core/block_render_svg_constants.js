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
 * @fileoverview Constants for graphically rendering a block as SVG.
 */
'use strict';

goog.provide('Blockly.BlockSvg.constants');

goog.require('Blockly.BlockSvg');
goog.require('Blockly.scratchBlocksUtils');
goog.require('Blockly.utils');
goog.require('Blockly.CustomShapes');

// UI constants for rendering blocks.
/**
* Grid unit to pixels conversion
* @const
*/
Blockly.BlockSvg.GRID_UNIT = 4;

/**
 * Horizontal space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_X = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Vertical space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_Y = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X = 16 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a block with output (reporters).
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X_OUTPUT = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a shadow block with output (single fields).
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X_SHADOW_OUTPUT = 10 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum height of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of extra row after a statement input.
 * @const
 */
Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a C- or E-shaped block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X_WITH_STATEMENT = 40 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum height of a shadow block with output and a single field.
 * This is used for shadow blocks that only contain a field - which are smaller than even reporters.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum height of a non-shadow block with output, i.e. a reporter.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER = 10 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum space for a statement input height.
 * @const
 */
Blockly.BlockSvg.MIN_STATEMENT_INPUT_HEIGHT = 6 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Width of vertical notch.
 * @const
 */
Blockly.BlockSvg.NOTCH_WIDTH = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of vertical notch.
 * @const
 */
Blockly.BlockSvg.NOTCH_HEIGHT = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Rounded corner radius.
 * @const
 */
Blockly.BlockSvg.CORNER_RADIUS = 1 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of statement input edge on the left, in px.
 * @const
 */
Blockly.BlockSvg.STATEMENT_INPUT_EDGE_WIDTH = 4 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Inner space between edge of statement input and notch.
 * @const
 */
Blockly.BlockSvg.STATEMENT_INPUT_INNER_SPACE = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of the top hat.
 * @const
 */
Blockly.BlockSvg.START_HAT_HEIGHT = 16;

/**
 * Height of the vertical separator line for icons that appear at the left edge
 * of a block, such as extension icons.
 * @const
 */
Blockly.BlockSvg.ICON_SEPARATOR_HEIGHT = 10 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Path of the top hat's curve.
 * @const
 */
Blockly.BlockSvg.START_HAT_PATH = 'c 25,-22 71,-22 96,0';

/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT = (
  'c 2,0 3,1 4,2 ' +
  'l 4,4 ' +
  'c 1,1 2,2 4,2 ' +
  'h 12 ' +
  'c 2,0 3,-1 4,-2 ' +
  'l 4,-4 ' +
  'c 1,-1 2,-2 4,-2'
);

/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT = (
  'c -2,0 -3,1 -4,2 ' +
  'l -4,4 ' +
  'c -1,1 -2,2 -4,2 ' +
  'h -12 ' +
  'c -2,0 -3,-1 -4,-2 ' +
  'l -4,-4 ' +
  'c -1,-1 -2,-2 -4,-2'
);

/**
 * Amount of padding before the notch.
 * @const
 */
Blockly.BlockSvg.NOTCH_START_PADDING = 3 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG start point for drawing the top-left corner.
 * @param {number} radius The radius of the corner path
 * @return {string} The constructed corner path
 */
Blockly.BlockSvg.prototype.makeTopLeftCornerStart = function(radius) {
  if (!radius) {
    radius = Blockly.BlockSvg.CORNER_RADIUS;
  }

  return 'm 0,' + radius;
};

/**
 * SVG path for drawing the rounded top-left corner.
 * @param {number} radius The radius of the corner path
 * @return {string} The constructed corner path
 */
Blockly.BlockSvg.prototype.makeTopLeftCorner = function(radius) {
  if (!radius) {
    radius = Blockly.BlockSvg.CORNER_RADIUS;
  }

  return 'A ' + radius + ',' +
    radius + ' 0 0,1 ' +
    radius + ',0';
};

/**
 * SVG path for drawing the rounded top-right corner.
 * @param {number} radius The radius of the corner path
 * @return {string} The constructed corner path
 */
Blockly.BlockSvg.prototype.makeTopRightCorner = function(radius) {
  if (!radius) {
    radius = Blockly.BlockSvg.CORNER_RADIUS;
  }

  return 'a ' + radius + ',' +
    radius + ' 0 0,1 ' +
    radius + ',' + radius;
};

/**
 * SVG path for drawing the rounded bottom-right corner.
 * @param {number} radius The radius of the corner path
 * @return {string} The constructed corner path
 */
Blockly.BlockSvg.prototype.makeBottomRightCorner = function(radius) {
  if (!radius) {
    radius = Blockly.BlockSvg.CORNER_RADIUS;
  }

  return ' a ' + radius + ',' +
    radius + ' 0 0,1 -' +
    radius + ',' +
    radius;
};

/**
 * SVG path for drawing the rounded bottom-left corner.
 * @param {number} radius The radius of the corner path
 * @return {string} The constructed corner path
 */
Blockly.BlockSvg.prototype.makeBottomLeftCorner = function(radius) {
  if (!radius) {
    radius = Blockly.BlockSvg.CORNER_RADIUS;
  }

  return 'a ' + radius + ',' +
    radius + ' 0 0,1 -' +
    radius + ',-' +
    radius;
};

/**
 * SVG path for drawing the top-left corner of a statement input.
 * @param {number} radius The radius of the corner path
 * @return {string} The constructed corner path
 */
Blockly.BlockSvg.prototype.makeInnerTopLeftCorner = function(radius) {
  if (!radius) {
    radius = Blockly.BlockSvg.CORNER_RADIUS;
  }

  return ' a ' + radius + ',' +
    radius + ' 0 0,0 -' +
    radius + ',' +
    radius;
};

/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @param {number} radius The radius of the corner path
 * @return {string} The constructed corner path
 */
Blockly.BlockSvg.prototype.makeInnerBottomLeftCorner = function(radius) {
  if (!radius) {
    radius = Blockly.BlockSvg.CORNER_RADIUS;
  }

  return 'a ' + radius + ',' +
    radius + ' 0 0,0 ' +
    radius + ',' +
    radius;
};

/**
 * Minimum width of the edge shape of a reporter.
 * @const
 */
Blockly.BlockSvg.MIN_EDGE_SHAPE_WIDTH = Infinity;

/**
 * Minimum width of the edge shape of an "Inline Block".
 * An Inline block is a reporter with a branch connection.
 * @const
 */
Blockly.BlockSvg.MIN_INLINE_BLOCK_EDGE_SHAPE_WIDTH = 48;

/**
 * SVG path for an empty hexagonal input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_HEXAGONAL =
    'M ' + 4 * Blockly.BlockSvg.GRID_UNIT + ',0 ' +
    ' h ' + 4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + 4 * Blockly.BlockSvg.GRID_UNIT + ',' + 4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + -4 * Blockly.BlockSvg.GRID_UNIT + ',' + 4 * Blockly.BlockSvg.GRID_UNIT +
    ' h ' + -4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + -4 * Blockly.BlockSvg.GRID_UNIT + ',' + -4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + 4 * Blockly.BlockSvg.GRID_UNIT + ',' + -4 * Blockly.BlockSvg.GRID_UNIT +
    ' z';

/**
 * Width of empty boolean input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_HEXAGONAL_WIDTH = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG path for an empty square input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_SQUARE =
    Blockly.BlockSvg.prototype.makeTopLeftCornerStart() +
    Blockly.BlockSvg.prototype.makeTopLeftCorner() +
    ' h ' + (12 * Blockly.BlockSvg.GRID_UNIT - 2 * Blockly.BlockSvg.CORNER_RADIUS) +
    Blockly.BlockSvg.prototype.makeTopRightCorner() +
    ' v ' + (8 * Blockly.BlockSvg.GRID_UNIT - 2 * Blockly.BlockSvg.CORNER_RADIUS) +
    Blockly.BlockSvg.prototype.makeBottomRightCorner() +
    ' h ' + (-12 * Blockly.BlockSvg.GRID_UNIT + 2 * Blockly.BlockSvg.CORNER_RADIUS) +
    Blockly.BlockSvg.prototype.makeBottomLeftCorner() +
    ' z';


/**
 * Width of empty square input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_SQUARE_WIDTH = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG path for an empty round input shape.
 * @const
 */

Blockly.BlockSvg.INPUT_SHAPE_ROUND =
  'M ' + (4 * Blockly.BlockSvg.GRID_UNIT) + ',0' +
  ' h ' + (4 * Blockly.BlockSvg.GRID_UNIT) +
  ' a ' + (4 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4 * Blockly.BlockSvg.GRID_UNIT) + ' 0 0 1 0 ' + (8 * Blockly.BlockSvg.GRID_UNIT) +
  ' h ' + (-4 * Blockly.BlockSvg.GRID_UNIT) +
  ' a ' + (4 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4 * Blockly.BlockSvg.GRID_UNIT) + ' 0 0 1 0 -' + (8 * Blockly.BlockSvg.GRID_UNIT) +
  ' z';

/**
 * Width of empty round input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_ROUND_WIDTH = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG path for an empty object input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_OBJECT =
  'M ' + (4 * Blockly.BlockSvg.GRID_UNIT) + ' 0' +
  ' h ' + (4 * Blockly.BlockSvg.GRID_UNIT) +
  ' C ' + (9.75 * Blockly.BlockSvg.GRID_UNIT) + ' 0 ' +
      (9.75 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (11.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (3.5 * Blockly.BlockSvg.GRID_UNIT) +
  ' c ' + (0.25 * Blockly.BlockSvg.GRID_UNIT) + ' 0 ' +
      (0.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (0.25 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (0.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (0.5 * Blockly.BlockSvg.GRID_UNIT) +
  ' C ' + (12 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4.25 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (11.75 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (11.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4.5 * Blockly.BlockSvg.GRID_UNIT) +
  ' c ' + (-1.75 * Blockly.BlockSvg.GRID_UNIT) + ' 0 ' +
      (-1.75 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (-3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (3.5 * Blockly.BlockSvg.GRID_UNIT) +
  ' h ' + (-4 * Blockly.BlockSvg.GRID_UNIT) +
  ' c ' + (-1.75 * Blockly.BlockSvg.GRID_UNIT) + ' 0 ' +
      (-1.75 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (-3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (-3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (-3.5 * Blockly.BlockSvg.GRID_UNIT) +
  ' C ' + (0.25 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4.5 * Blockly.BlockSvg.GRID_UNIT) + ' 0 ' +
      (4.25 * Blockly.BlockSvg.GRID_UNIT) + ' 0 ' +
      (4 * Blockly.BlockSvg.GRID_UNIT) +
  ' C 0 ' +
      (3.75 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (0.25 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (0.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (3.5 * Blockly.BlockSvg.GRID_UNIT) +
  ' c ' + (1.75 * Blockly.BlockSvg.GRID_UNIT) + ' 0 ' +
      (1.75 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (-3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (3.5 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (-3.5 * Blockly.BlockSvg.GRID_UNIT) +
    ' z';

/**
 * Width of empty object input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_OBJECT_WIDTH = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of empty input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_HEIGHT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of user inputs
 * @const
 */
Blockly.BlockSvg.FIELD_HEIGHT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Width of user inputs
 * @const
 */
Blockly.BlockSvg.FIELD_WIDTH = 6 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Editable field padding (left/right of the text).
 * @const
 */
Blockly.BlockSvg.EDITABLE_FIELD_PADDING = 6;

/**
 * Square box field padding (left/right of the text).
 * @const
 */
Blockly.BlockSvg.BOX_FIELD_PADDING = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Drop-down arrow padding.
 * @const
 */
Blockly.BlockSvg.DROPDOWN_ARROW_PADDING = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of user inputs during editing
 * @const
 */
Blockly.BlockSvg.FIELD_WIDTH_MIN_EDIT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Maximum width of user inputs during editing
 * @const
 */
Blockly.BlockSvg.FIELD_WIDTH_MAX_EDIT = Infinity;

/**
 * Maximum height of user inputs during editing
 * @const
 */
Blockly.BlockSvg.FIELD_HEIGHT_MAX_EDIT = Blockly.BlockSvg.FIELD_HEIGHT;

/**
 * Top padding of user inputs
 * @const
 */
Blockly.BlockSvg.FIELD_TOP_PADDING = 0.5 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Corner radius of number inputs
 * @const
 */
Blockly.BlockSvg.NUMBER_FIELD_CORNER_RADIUS = 4 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Corner radius of text inputs
 * @const
 */
Blockly.BlockSvg.TEXT_FIELD_CORNER_RADIUS = 1 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Default radius for a field, in px.
 * @const
 */
Blockly.BlockSvg.FIELD_DEFAULT_CORNER_RADIUS = 4 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Max text display length for a field (per-horizontal/vertical)
 * @const
 */
Blockly.BlockSvg.MAX_DISPLAY_LENGTH = Infinity;

/**
 * Minimum X of inputs and fields for blocks with a previous connection.
 * Ensures that inputs will not overlap with the top notch of blocks.
 * @const
 */
Blockly.BlockSvg.INPUT_AND_FIELD_MIN_X = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Vertical padding around inline elements.
 * @const
 */
Blockly.BlockSvg.INLINE_PADDING_Y = 1 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Point size of text field before animation. Must match size in CSS.
 * See implementation in field_textinput.
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_INITIAL = 12;

/**
 * Point size of text field after animation.
 * See implementation in field_textinput.
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_FINAL = 12;

/**
 * Whether text fields are allowed to expand past their truncated block size.
 * @const{boolean}
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_EXPAND_PAST_TRUNCATION = false;

/**
 * Whether text fields should animate their positioning.
 * @const{boolean}
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_ANIMATE_POSITIONING = false;

/**
 * Map of output/input shapes and the amount they should cause a block to be padded.
 * Outer key is the outer shape, inner key is the inner shape.
 * When a block with the outer shape contains an input block with the inner shape
 * on its left or right edge, that side is extended by the padding specified.
 * See also: `Blockly.BlockSvg.computeOutputPadding_`.
 */
Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING = {
  1: { // Outer shape: hexagon.
    0: 5 * Blockly.BlockSvg.GRID_UNIT, // Field in hexagon.
    1: 2 * Blockly.BlockSvg.GRID_UNIT, // Hexagon in hexagon.
    2: 5 * Blockly.BlockSvg.GRID_UNIT, // Round in hexagon.
    3: 5 * Blockly.BlockSvg.GRID_UNIT, // Square in hexagon.
    4: 2 * Blockly.BlockSvg.GRID_UNIT // Object in hexagon.
  },
  2: { // Outer shape: round.
    0: 3 * Blockly.BlockSvg.GRID_UNIT, // Field in round.
    1: 3 * Blockly.BlockSvg.GRID_UNIT, // Hexagon in round.
    2: 1 * Blockly.BlockSvg.GRID_UNIT, // Round in round.
    3: 2 * Blockly.BlockSvg.GRID_UNIT, // Square in round.
    4: 3 * Blockly.BlockSvg.GRID_UNIT // Object in hexagon.
  },
  3: { // Outer shape: square.
    0: 2 * Blockly.BlockSvg.GRID_UNIT, // Field in square.
    1: 2 * Blockly.BlockSvg.GRID_UNIT, // Hexagon in square.
    2: 2 * Blockly.BlockSvg.GRID_UNIT, // Round in square.
    3: 2 * Blockly.BlockSvg.GRID_UNIT, // Square in square.
    4: 2 * Blockly.BlockSvg.GRID_UNIT // Object in hexagon.
  },
  4: { // Outer shape: object.
    0: 5 * Blockly.BlockSvg.GRID_UNIT, // Field in square.
    1: 2 * Blockly.BlockSvg.GRID_UNIT, // Hexagon in square.
    2: 5 * Blockly.BlockSvg.GRID_UNIT, // Round in square.
    3: 5 * Blockly.BlockSvg.GRID_UNIT, // Square in square.
    4: 2 * Blockly.BlockSvg.GRID_UNIT // Object in hexagon.
  }
};

/**
 * Corner radius of the hat on the define block.
 * @const
 */
Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS = 5 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_DEFINE_HAT =
    'a ' + Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS + ',' +
    Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS + ',-' +
    Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS;

/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_RIGHT_CORNER_DEFINE_HAT =
    'a ' + Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS + ',' +
    Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS + ',' +
    Blockly.BlockSvg.DEFINE_HAT_CORNER_RADIUS;

/**
 * Padding on the right side of the internal block on the define block.
 * @const
 */
Blockly.BlockSvg.DEFINE_BLOCK_PADDING_RIGHT = 2 * Blockly.BlockSvg.GRID_UNIT;
