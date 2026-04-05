/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2026 Google Inc.
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
 * @fileoverview Classes for frame events.
 */
'use strict';

goog.provide('Blockly.Events.FrameBase');
goog.provide('Blockly.Events.FrameChange');
goog.provide('Blockly.Events.FrameCreate');
goog.provide('Blockly.Events.FrameDelete');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.Frame');
goog.require('Blockly.Xml');

goog.require('goog.dom');

/**
 * Abstract class for a frame event.
 * @param {Blockly.Frame} frame The frame this event corresponds to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.FrameBase = function(frame) {
  Blockly.Events.FrameBase.superClass_.constructor.call(this);

  /**
   * The frame id this event pertains to.
   * @type {string}
   */
  this.frameId = frame.id;

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = frame.workspace_.id;
};
goog.inherits(Blockly.Events.FrameBase, Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.FrameBase.prototype.toJson = function() {
  var json = Blockly.Events.FrameBase.superClass_.toJson.call(this);
  json['frameId'] = this.frameId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.FrameBase.prototype.fromJson = function(json) {
  Blockly.Events.FrameBase.superClass_.fromJson.call(this, json);
  this.frameId = json['frameId'];
};

/**
 * Helper function for finding the frame this event pertains to.
 * @return {?Blockly.Frame} The frame this event pertains to.
 * @private
 */
Blockly.Events.FrameBase.prototype.getFrame_ = function() {
  var workspace = this.getEventWorkspace_();
  if (typeof workspace.getFrameById !== 'function') {
    return null;
  }
  return workspace.getFrameById(this.frameId);
};

/**
 * Class for a frame creation event.
 * @param {Blockly.Frame} frame The created frame. Null for blank event.
 * @extends {Blockly.Events.FrameBase}
 * @constructor
 */
Blockly.Events.FrameCreate = function(frame) {
  if (!frame) {
    return;
  }
  Blockly.Events.FrameCreate.superClass_.constructor.call(this, frame);
  this.xml = frame.toXmlWithXY();
};
goog.inherits(Blockly.Events.FrameCreate, Blockly.Events.FrameBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.FrameCreate.prototype.type = Blockly.Events.FRAME_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.FrameCreate.prototype.toJson = function() {
  var json = Blockly.Events.FrameCreate.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.FrameCreate.prototype.fromJson = function(json) {
  Blockly.Events.FrameCreate.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom('<xml>' + json['xml'] + '</xml>').firstChild;
};

/**
 * Run a frame creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.FrameCreate.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    if (workspace.getFrameById(this.frameId)) {
      return;
    }
    Blockly.Frame.fromXml(this.xml, /** @type {!Blockly.WorkspaceSvg} */ (workspace));
  } else {
    var frame = this.getFrame_();
    if (frame) {
      frame.dispose();
    }
  }
};

/**
 * Class for a frame deletion event.
 * @param {Blockly.Frame} frame The deleted frame. Null for blank event.
 * @extends {Blockly.Events.FrameBase}
 * @constructor
 */
Blockly.Events.FrameDelete = function(frame) {
  if (!frame) {
    return;
  }
  Blockly.Events.FrameDelete.superClass_.constructor.call(this, frame);
  this.xml = frame.toXmlWithXY();
};
goog.inherits(Blockly.Events.FrameDelete, Blockly.Events.FrameBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.FrameDelete.prototype.type = Blockly.Events.FRAME_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.FrameDelete.prototype.toJson = function() {
  var json = Blockly.Events.FrameDelete.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.FrameDelete.prototype.fromJson = function(json) {
  Blockly.Events.FrameDelete.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom('<xml>' + json['xml'] + '</xml>').firstChild;
};

/**
 * Run a frame deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.FrameDelete.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    var frame = this.getFrame_();
    if (frame) {
      frame.dispose();
    }
  } else {
    if (!workspace.getFrameById(this.frameId)) {
      Blockly.Frame.fromXml(this.xml, /** @type {!Blockly.WorkspaceSvg} */ (workspace));
    }
  }
};

/**
 * Class for a frame change event.
 * @param {Blockly.Frame} frame The changed frame. Null for blank event.
 * @param {string} element One of 'state', 'title', 'minimized', or 'locked'.
 * @param {*} oldValue Previous value.
 * @param {*} newValue New value.
 * @extends {Blockly.Events.FrameBase}
 * @constructor
 */
Blockly.Events.FrameChange = function(frame, element, oldValue, newValue) {
  if (!frame) {
    return;
  }
  Blockly.Events.FrameChange.superClass_.constructor.call(this, frame);
  this.element = element;
  this.oldValue = oldValue;
  this.newValue = newValue;
};
goog.inherits(Blockly.Events.FrameChange, Blockly.Events.FrameBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.FrameChange.prototype.type = Blockly.Events.FRAME_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.FrameChange.prototype.toJson = function() {
  var json = Blockly.Events.FrameChange.superClass_.toJson.call(this);
  json['element'] = this.element;
  json['newValue'] = this.newValue;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.FrameChange.prototype.fromJson = function(json) {
  Blockly.Events.FrameChange.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.newValue = json['newValue'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
Blockly.Events.FrameChange.prototype.isNull = function() {
  if (this.element == 'state') {
    return this.oldValue && this.newValue &&
        this.oldValue.x == this.newValue.x &&
        this.oldValue.y == this.newValue.y &&
        this.oldValue.userRight == this.newValue.userRight &&
        this.oldValue.userBottom == this.newValue.userBottom;
  }
  return this.oldValue == this.newValue;
};

/**
 * Run a frame change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.FrameChange.prototype.run = function(forward) {
  var frame = this.getFrame_();
  if (!frame) {
    return;
  }
  var value = forward ? this.newValue : this.oldValue;
  switch (this.element) {
    case 'state':
      frame.applyStateFromUndo_(value);
      break;
    case 'title':
      frame.setTitleFromUndo_(value);
      break;
    case 'minimized':
      frame.setMinimizedFromUndo_(value);
      break;
    case 'locked':
      frame.setLockedFromUndo_(value);
      break;
    default:
      console.warn('Unknown frame change type: ' + this.element);
  }
};
