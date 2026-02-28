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
 * @fileoverview Image field.  Used for pictures, icons, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldImageButton');

goog.require('Blockly.FieldImage');
goog.require('goog.dom');
goog.require('goog.math.Size');
goog.require('goog.userAgent');


/**
 * Class for an image on a block.
 * @param {string} src The URL of the image.
 * @param {number} width Width of the image.
 * @param {number} height Height of the image.
 * @param {string=} opt_alt Optional alt text for when block is collapsed.
 * @param {boolean} flip_rtl Whether to flip the icon in RTL
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldImageButton = function(src, width, height, callback, opt_alt, flip_rtl, noPadding) {
	Blockly.FieldImageButton.superClass_.constructor.call(src, width, height, opt_alt, flip_rtl);
	this._callback = callback.bind(this);
	this.noPadding = noPadding;
};
goog.inherits(Blockly.FieldImageButton, Blockly.FieldImage);

/**
 * Install this image on a block.
 */
Blockly.FieldImageButton.prototype.init = function() {
	if (this.fieldGroup_) {
		// Image has already been initialized once.
  	return;
	}
  Blockly.FieldImageButton.superClass_.init.call(this);
	this.mouseDownWrapper_ = ScratchBlocks.bindEventWithChecks_(
	this.getSvgRoot(), "mousedown", this, this.onMouseDown_);
	this.getSvgRoot().style.cursor = "pointer";
};

/**
 * Construct a FieldImageButton from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} element A JSON object with options.
 * @returns {!Blockly.FieldTextDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldImageButton.fromJson = Blockly.FieldImage.fromJson;

Blockly.FieldImageButton.prototype.showEditor_ = function() {
	if (this._callback) {
		this._callback();
	}
}

Blockly.FieldImageButton.prototype.getSize = function() {
	if (!this.size_.width) {
		this.render_();
	}
	if (!this.noPadding) return this.size_;
	return new this.size_.constructor(
		Math.max(1, this.size_.width - ScratchBlocks.BlockSvg.SEP_SPACE_X),
		this.size_.height
	);
}

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldImageButton.prototype.EDITABLE = true;

Blockly.Field.register('field_imagebutton', Blockly.FieldImageButton);
