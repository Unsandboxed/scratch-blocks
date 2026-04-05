/**
 * @fileoverview Object representing a workspace frame.
 * @author Unsandboxed
 */
'use strict';

goog.provide('Blockly.Frame');

goog.require('Blockly.utils');
goog.require('goog.dom');

/**
 * @constructor
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to render in.
 * @param {!Object} data The frame data (x, y, width, height, title, color).
 */
Blockly.Frame = function(workspace, data) {
  /** @type {!Blockly.WorkspaceSvg} */
  this.workspace_ = workspace;

  /** @type {string} */
  this.id = data.id || Blockly.utils.genUid();

  /** @type {boolean} */
  this.isFrame = true; 

  this.x = data.x || 0;
  this.y = data.y || 0;
  this.width = data.width || 200;
  this.height = data.height || 150;
  this.userWidth_ = data.width || 200;
  this.userHeight_ = data.height || 150;

  this.isMinimized_ = false;
  this.oldHeight_ = this.height; 

  this.title = data.title || "New Group";
  this.color = data.color || "#4C97FF";

  /** @type {SVGElement} */
  this.svgGroup_ = null;

  this.createDom();
  
  this.changeWrapper_ = this.onWorkspaceChange_.bind(this);
  this.workspace_.addChangeListener(this.changeWrapper_);
};

/**
 * Create the SVG elements for the frame.
 */
Blockly.Frame.prototype.createDom = function() {
  this.svgGroup_ = Blockly.utils.createSvgElement('g', {
    'class': 'blocklyFrame',
    'transform': 'translate(' + this.x + ',' + this.y + ')'
  }, this.workspace_.svgFrameCanvas_);

  // Identifier for core engine bumping/overlap checks
  this.svgGroup_.isBlocklyFrame = true;

  this.rect_ = Blockly.utils.createSvgElement('rect', {
    'class': 'blocklyFrameBody',
    'width': this.width,
    'height': this.height,
    'fill': this.color,
    'fill-opacity': 0.05,
    'stroke': this.color,
    'stroke-width': 1,
    'stroke-dasharray': '4,4',
    'rx': 4, 'ry': 4,
    'style': 'pointer-events: none;'
  }, this.svgGroup_);

  this.header_ = Blockly.utils.createSvgElement('rect', {
    'class': 'blocklyFrameHeader',
    'width': this.width,
    'height': 28,
    'fill': this.color,
    'fill-opacity': 0.8,
    'rx': 4, 'ry': 4,
    'style': 'cursor: move;'
  }, this.svgGroup_);

  this.resizeHandle_ = Blockly.utils.createSvgElement('path', {
    'class': 'blocklyFrameResizeHandle',
    'd': 'M 15 15 L 15 0 L 0 15 Z',
    'fill': this.color,
    'fill-opacity': 0.8,
    'style': 'cursor: nwse-resize;'
  }, this.svgGroup_);
  
  this.updateHandlePosition_();
  
  Blockly.bindEventWithChecks_(this.resizeHandle_, 'mousedown', this, this.onMouseDownResize_);
  Blockly.bindEventWithChecks_(this.header_, 'mousedown', this, this.onMouseDown_);

  this.minimizeButton_ = Blockly.utils.createSvgElement('text', {
      'class': 'blocklyFrameMinimize',
      'x': this.width - 25,
      'y': 19,
      'style': 'font-size: 14pt; fill: white; cursor: pointer; user-select: none;'
  }, this.svgGroup_);
  this.minimizeButton_.textContent = '−';
  
  Blockly.bindEventWithChecks_(this.minimizeButton_, 'mousedown', this, this.toggleMinimize_);

  Blockly.bindEventWithChecks_(this.header_, 'dblclick', this, function(e) {
      var newTitle = prompt("Rename Group:", this.title);
      if (newTitle) {
          this.title = newTitle;
          this.text_.textContent = newTitle;
      }
  });

  this.text_ = Blockly.utils.createSvgElement('text', {
    'class': 'blocklyFrameText',
    'x': 10,
    'y': 19,
    'style': 'font-size: 12pt; font-weight: bold; fill: white; pointer-events: none; ' +
             'font-family: "Helvetica Neue", Helvetica, sans-serif;'
  }, this.svgGroup_);
  this.text_.textContent = this.title;
};

/**
 * Update the frame's size, position, and color based on its contents and user input.
 * @public
 */
Blockly.Frame.prototype.render = function() {
  this.updateColorFromBlocks_();

  var blocks = this.getBlocksInside_();
  var contentWidth = 0;
  var contentHeight = 0;

  if (!this.isMinimized_ && blocks.length > 0) {
    var minX = Infinity, minY = Infinity;
    var maxX = -Infinity, maxY = -Infinity;
    
    blocks.forEach(function(b) {
      var loc = b.getRelativeToSurfaceXY();
      var size = b.getHeightWidth();
      minX = Math.min(minX, loc.x);
      minY = Math.min(minY, loc.y);
      maxX = Math.max(maxX, loc.x + size.width);
      maxY = Math.max(maxY, loc.y + size.height);
    });

    // Content bounds relative to the frame's top-left corner
    // Includes 24px padding and accounts for the 28px header height
    contentWidth = (maxX - this.x) + 24;
    contentHeight = (maxY - this.y) + 24;
  }

  // Use the larger of the user's manual resize or the actual content size
  this.width = Math.max(this.userWidth_, contentWidth);
  this.height = this.isMinimized_ ? 28 : Math.max(this.userHeight_, contentHeight);

  // Update DOM elements
  this.svgGroup_.setAttribute('transform', 'translate(' + this.x + ',' + this.y + ')');
  this.rect_.setAttribute('width', this.width);
  this.rect_.setAttribute('height', this.height);
  this.header_.setAttribute('width', this.width);
  
  if (this.minimizeButton_) {
    this.minimizeButton_.setAttribute('x', this.width - 25);
  }
  
  this.updateHandlePosition_();
};

/**
 * Update the frame color based on the first block found within its boundaries.
 * @private
 */
Blockly.Frame.prototype.updateColorFromBlocks_ = function() {
  var blocks = this.getBlocksInside_();
  var defaultColor = '#4C97FF'; // Scratch Blue
  var newColor = defaultColor;

  if (blocks.length > 0 && blocks[0]) {
    var topBlock = blocks[0];
    // Scratch/Blockly blocks use getColour to return a hex string.
    if (typeof topBlock.getColour === 'function') {
      newColor = topBlock.getColour();
    }
  }

  // Update DOM only if the color has changed to optimize performance.
  if (this.color !== newColor) {
    this.color = newColor;
    this.applyColorStyles_();
  }
};

/**
 * Apply the current frame color to all SVG sub-elements.
 * @param {Blockly.BlockSvg=} opt_block Optional block to extract secondary colors from.
 * @private
 */
Blockly.Frame.prototype.applyColorStyles_ = function(opt_block) {
  if (!this.svgGroup_) {
    return;
  }

  // Update the main body fill and header
  this.rect_.setAttribute('fill', this.color);
  this.header_.setAttribute('fill', this.color);
  this.resizeHandle_.setAttribute('fill', this.color);

  // Use the block's secondary color for the stroke if available for a "Scratch" look
  var secondaryColor = this.color;
  if (opt_block && typeof opt_block.getColourSecondary === 'function') {
    secondaryColor = opt_block.getColourSecondary();
  }
  this.rect_.setAttribute('stroke', secondaryColor);
};

/**
 * Position the resize handle at the bottom-right corner of the frame.
 * @private
 */
Blockly.Frame.prototype.updateHandlePosition_ = function() {
  var hX = this.width - 15;
  var hY = this.height - 15;
  this.resizeHandle_.setAttribute('transform', 'translate(' + hX + ',' + hY + ')');
};

/**
 * Move the frame and its captured blocks by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Frame.prototype.moveBy = function(dx, dy) {
  if (this.capturedBlocks_) {
    for (var i = 0, block; block = this.capturedBlocks_[i]; i++) {
      // Only move top-level blocks; Blockly automatically moves children.
      if (!block.getParent()) {
        block.moveBy(dx, dy);
      }
    }
  }
  this.x += dx;
  this.y += dy;
  this.svgGroup_.setAttribute('transform', 'translate(' + this.x + ',' + this.y + ')');
};

/**
 * Automatically resize and reposition the frame to tightly fit all contained blocks.
 * @public
 */
Blockly.Frame.prototype.autoResizeToContents = function() {
  var blocks = this.getBlocksInside_();
  if (blocks.length === 0) {
    return;
  }

  var minX = Infinity, minY = Infinity;
  var maxX = -Infinity, maxY = -Infinity;
  var padding = 24;
  var headerHeight = 28;

  blocks.forEach(function(block) {
    var loc = block.getRelativeToSurfaceXY();
    var size = block.getHeightWidth();
    minX = Math.min(minX, loc.x);
    minY = Math.min(minY, loc.y);
    maxX = Math.max(maxX, loc.x + size.width);
    maxY = Math.max(maxY, loc.y + size.height);
  });

  // Calculate new bounds with padding.
  this.x = minX - padding;
  this.y = minY - padding - headerHeight;
  this.width = (maxX - minX) + (padding * 2);
  this.height = (maxY - minY) + (padding * 2) + headerHeight;

  // Apply to DOM.
  this.svgGroup_.setAttribute('transform', 'translate(' + this.x + ',' + this.y + ')');
  this.rect_.setAttribute('width', this.width);
  this.rect_.setAttribute('height', this.height);
  this.header_.setAttribute('width', this.width);
  
  if (this.minimizeButton_) {
    this.minimizeButton_.setAttribute('x', this.width - 25);
  }
  
  this.updateHandlePosition_();
};

/**
 * Check if a coordinate point is within the bounds of the frame.
 * @param {number} x The X coordinate on the workspace.
 * @param {number} y The Y coordinate on the workspace.
 * @return {boolean} True if the point is inside.
 */
Blockly.Frame.prototype.isPointInside = function(x, y) {
  return x >= this.x && 
         x <= (this.x + this.width) &&
         y >= this.y && 
         y <= (this.y + this.height);
};

/**
 * Dispose of the frame, removing its SVG elements and change listeners.
 * @public
 */
Blockly.Frame.prototype.dispose = function() {
  if (this.changeWrapper_ && this.workspace_) {
    this.workspace_.removeChangeListener(this.changeWrapper_);
    this.changeWrapper_ = null;
  }

  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }

  this.workspace_ = null;
  this.rect_ = null;
  this.header_ = null;
  this.resizeHandle_ = null;
};

/**
 * Handle mousedown on the frame header to begin dragging.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Frame.prototype.onMouseDown_ = function(e) {
  if (Blockly.utils.isRightButton(e)) {
    return;
  }
  this.workspace_.markFocused();
  Blockly.hideChaff();
  
  this.isDragging_ = true;
  this.startDragMouseX_ = e.clientX;
  this.startDragMouseY_ = e.clientY;

  // Capture current blocks to move them as a unit
  if (this.isMinimized_ && this.minimizedBlocks_ && this.minimizedBlocks_.length > 0) {
    this.capturedBlocks_ = this.minimizedBlocks_;
  } else {
    this.capturedBlocks_ = this.getBlocksInside_();
  }

  this.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(document, 'mousemove', this, this.onMouseMove_);
  this.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(document, 'mouseup', this, this.onMouseUp_);
  
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Handle mouse move while dragging the frame.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Frame.prototype.onMouseMove_ = function(e) {
  var dx = (e.clientX - this.startDragMouseX_) / this.workspace_.scale;
  var dy = (e.clientY - this.startDragMouseY_) / this.workspace_.scale;

  this.startDragMouseX_ = e.clientX;
  this.startDragMouseY_ = e.clientY;

  this.moveBy(dx, dy);
};

/**
 * Stop dragging the frame.
 * @private
 */
Blockly.Frame.prototype.onMouseUp_ = function() {
  if (this.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }
  
  this.isDragging_ = false;
  this.capturedBlocks_ = [];
  this.render();
};

/**
 * Handle mousedown on the resize handle.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Frame.prototype.onMouseDownResize_ = function(e) {
  if (Blockly.utils.isRightButton(e)) {
    return;
  }
  Blockly.hideChaff();
  
  this.isResizing_ = true;
  this.startResizeX_ = e.clientX;
  this.startResizeY_ = e.clientY;
  
  this.onMouseMoveResizeWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mousemove', this, this.onMouseMoveResize_);
  this.onMouseUpResizeWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mouseup', this, this.onMouseUpResize_);
      
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Handle mouse move while resizing the frame.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Frame.prototype.onMouseMoveResize_ = function(e) {
  var dx = (e.clientX - this.startResizeX_) / this.workspace_.scale;
  var dy = (e.clientY - this.startResizeY_) / this.workspace_.scale;

  this.startResizeX_ = e.clientX;
  this.startResizeY_ = e.clientY;

  this.userWidth_ += dx;
  this.userHeight_ += dy;
  
  // Prevent the frame from becoming too small to interact with.
  this.userWidth_ = Math.max(this.userWidth_, 100);
  this.userHeight_ = Math.max(this.userHeight_, 50);

  this.render();
};

/**
 * Handle mouseup to end resizing.
 * @private
 */
Blockly.Frame.prototype.onMouseUpResize_ = function() {
  this.isResizing_ = false;
  
  if (this.onMouseMoveResizeWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveResizeWrapper_);
    this.onMouseMoveResizeWrapper_ = null;
  }
  if (this.onMouseUpResizeWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpResizeWrapper_);
    this.onMouseUpResizeWrapper_ = null;
  }
};

/**
 * Toggle the minimized state of the frame, hiding or showing contained blocks.
 * @param {Event} e Mouse down event.
 * @private
 */
Blockly.Frame.prototype.toggleMinimize_ = function(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  // Snapshot blocks before they are hidden.
  if (!this.isMinimized_) {
    this.minimizedBlocks_ = this.getBlocksInside_();
  }

  this.isMinimized_ = !this.isMinimized_;
  var visible = !this.isMinimized_;

  if (this.minimizedBlocks_) {
    this.minimizedBlocks_.forEach(function(block) {
      // Safety check: block might have been deleted while minimized.
      if (block && typeof block.setVisible === 'function') {
        block.setVisible(visible);
      }
    });
  }

  if (this.isMinimized_) {
    this.oldHeight_ = this.height;
    this.height = 28;
    this.minimizeButton_.textContent = '+';
    this.resizeHandle_.style.display = 'none';
  } else {
    this.height = this.oldHeight_ || 150;
    this.minimizeButton_.textContent = '−';
    this.resizeHandle_.style.display = 'block';
    // Clear snapshot so the next minimize takes a fresh scan.
    this.minimizedBlocks_ = [];
  }

  this.render();
};

/**
 * Handle workspace changes to update the frame if blocks move nearby.
 * @param {!Blockly.Events.Abstract} e Change event.
 * @private
 */
Blockly.Frame.prototype.onWorkspaceChange_ = function(e) {
  if (this.isDragging_ || this.isResizing_) {
    return;
  }

  if (e.type === Blockly.Events.BLOCK_MOVE) {
    var block = this.workspace_.getBlockById(e.blockId);
    if (block) {
      var xy = block.getRelativeToSurfaceXY();
      // Only render if the block is within 100px of the frame's boundaries.
      if (xy.x > this.x - 100 && xy.x < this.x + this.width + 100 &&
          xy.y > this.y - 100 && xy.y < this.y + this.height + 100) {
        this.render();
      }
    }
  }
};

/**
 * Return a list of all top-level blocks within the frame's boundaries.
 * @return {!Array.<!Blockly.BlockSvg>} List of top-level blocks.
 * @private
 */
Blockly.Frame.prototype.getBlocksInside_ = function() {
  var inside = [];
  var blocks = this.workspace_.getTopBlocks(false);
  
  for (var i = 0, block; block = blocks[i]; i++) {
    var xy = block.getRelativeToSurfaceXY();
    // Check if the block's top-left corner is inside the frame.
    // Adding a small buffer helps capture blocks that are nearly centered.
    if (xy.x >= this.x - 5 && xy.x <= (this.x + this.width) &&
        xy.y >= this.y && xy.y <= (this.y + this.height)) {
      inside.push(block);
    }
  }
  return inside;
};
