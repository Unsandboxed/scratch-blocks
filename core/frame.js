/**
 * @fileoverview Object representing a workspace frame.
 * @author Unsandboxed
 */
'use strict';

goog.provide('Blockly.Frame');

goog.require('Blockly.ContextMenu');
goog.require('Blockly.Events');
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
  this.userRight_ = this.x + this.userWidth_;
  this.userBottom_ = this.y + this.userHeight_;

  this.isMinimized_ = false;
  this.oldHeight_ = this.height; 
  this.isLocked_ = !!data.locked;

  this.title = data.title || "New Group";
  this.color = data.color || "#4C97FF";

  /** @type {SVGElement} */
  this.svgGroup_ = null;

  this.createDom();
  
  this.changeWrapper_ = this.onWorkspaceChange_.bind(this);
  this.workspace_.addChangeListener(this.changeWrapper_);

  /** @private {boolean} */
  this.useDragSurface_ =
      Blockly.utils.is3dSupported() && !!workspace.getBlockDragSurface();

  /** @private {?Blockly.BlockDragSurfaceSvg} */
  this.dragSurface_ = this.useDragSurface_ ? workspace.getBlockDragSurface() : null;

  /** @private {?number} */
  this.deleteArea_ = Blockly.DELETE_AREA_NONE;

  /** @private {boolean} */
  this.wouldDeleteFrame_ = false;

  /** @private {?SVGGElement} */
  this.dragContainerGroup_ = null;

  /** @private {number} */
  this.dragDeltaX_ = 0;

  /** @private {number} */
  this.dragDeltaY_ = 0;

  /** @private {boolean} */
  this.isOnDragSurface_ = false;
};

/**
 * Header height used by frame UI.
 * @type {number}
 * @const
 */
Blockly.Frame.HEADER_HEIGHT = 32;

/**
 * Header icon inset from the edge.
 * @type {number}
 * @const
 */
Blockly.Frame.HEADER_ICON_INSET = 0;

/**
 * Header minimize icon size.
 * @type {number}
 * @const
 */
Blockly.Frame.MINIMIZE_ICON_SIZE = 32;

/**
 * Header delete icon size.
 * @type {number}
 * @const
 */
Blockly.Frame.DELETE_ICON_SIZE = 32;

/**
 * Opacity used for the temporary drag ghost group.
 * @type {number}
 * @const
 */
Blockly.Frame.DRAG_GHOST_OPACITY = 0.92;

/**
 * Create the SVG elements for the frame.
 */
Blockly.Frame.prototype.createDom = function() {
  var iconMiddleY = (Blockly.Frame.HEADER_HEIGHT / 2);

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
    'style': 'pointer-events: all;'
  }, this.svgGroup_);

  this.header_ = Blockly.utils.createSvgElement('rect', {
    'class': 'blocklyFrameHeader',
    'width': this.width,
    'height': Blockly.Frame.HEADER_HEIGHT,
    'fill': this.color,
    'fill-opacity': 0.8,
    'rx': 4, 'ry': 4,
    'style': 'cursor: move;'
  }, this.svgGroup_);

  // Create a resize handle that visually matches Scratch comment resize gripper.
  // Use the same structure: a grab triangle (invisible) plus two diagonal lines.
  var resizeClass = this.workspace_.RTL ? 'scratchCommentResizeSW' : 'scratchCommentResizeSE';
  this.resizeHandle_ = Blockly.utils.createSvgElement('g', {
    'class': resizeClass
  }, this.svgGroup_);
  var resizeSize = (Blockly.ScratchBubble && Blockly.ScratchBubble.RESIZE_SIZE) || 16;
  var outerPad = (Blockly.ScratchBubble && Blockly.ScratchBubble.RESIZE_OUTER_PAD) || 8;
  var cornerPad = (Blockly.ScratchBubble && Blockly.ScratchBubble.RESIZE_CORNER_PAD) || 4;
  // Invisible padded triangle to expand touch target.
  Blockly.utils.createSvgElement('polygon', {
    'points': [
      -outerPad, resizeSize + cornerPad,
      resizeSize + cornerPad, resizeSize + cornerPad,
      resizeSize + cornerPad, -outerPad
    ].join(' ')
  }, this.resizeHandle_);
  // Two diagonal grip lines to match Scratch style.
  Blockly.utils.createSvgElement('line', {
    'class': 'blocklyResizeLine',
    'x1': resizeSize / 3, 'y1': resizeSize - 1,
    'x2': resizeSize - 1, 'y2': resizeSize / 3
  }, this.resizeHandle_);
  Blockly.utils.createSvgElement('line', {
    'class': 'blocklyResizeLine',
    'x1': resizeSize * 2 / 3, 'y1': resizeSize - 1,
    'x2': resizeSize - 1, 'y2': resizeSize * 2 / 3
  }, this.resizeHandle_);
  
  this.updateHandlePosition_();
  
  Blockly.bindEventWithChecks_(this.resizeHandle_, 'mousedown', this, this.onMouseDownResize_);
  Blockly.bindEventWithChecks_(this.header_, 'mousedown', this, this.onMouseDown_);
  Blockly.bindEventWithChecks_(this.rect_, 'mousedown', this, this.onBodyMouseDown_);

  this.minimizeButton_ = Blockly.utils.createSvgElement('image', {
    'class': 'blocklyFrameMinimize',
    'x': Blockly.Frame.HEADER_ICON_INSET,
    'y': iconMiddleY - Blockly.Frame.MINIMIZE_ICON_SIZE / 2,
    'width': Blockly.Frame.MINIMIZE_ICON_SIZE,
    'height': Blockly.Frame.MINIMIZE_ICON_SIZE,
    'style': 'cursor: pointer;'
  }, this.svgGroup_);
  this.updateMinimizeIcon_();
  
  Blockly.bindEventWithChecks_(this.minimizeButton_, 'mousedown', this, this.toggleMinimize_);

  this.deleteButton_ = Blockly.utils.createSvgElement('image', {
    'class': 'blocklyFrameDelete',
    'y': iconMiddleY - Blockly.Frame.DELETE_ICON_SIZE / 2,
    'width': Blockly.Frame.DELETE_ICON_SIZE,
    'height': Blockly.Frame.DELETE_ICON_SIZE,
    'style': 'cursor: pointer;'
  }, this.svgGroup_);
  this.deleteButton_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      this.workspace_.options.pathToMedia + 'delete-x.svg');
  Blockly.bindEventWithChecks_(this.deleteButton_, 'mousedown', this, this.onDeleteMouseDown_);

  Blockly.bindEventWithChecks_(this.header_, 'dblclick', this, function() {
      this.promptRename_();
  });

  this.text_ = Blockly.utils.createSvgElement('text', {
    'class': 'blocklyFrameText',
    'x': Blockly.Frame.HEADER_ICON_INSET + Blockly.Frame.MINIMIZE_ICON_SIZE + 8,
    'y': (Blockly.Frame.HEADER_HEIGHT / 2),
    'dominant-baseline': 'middle',
    'alignment-baseline': 'middle',
    'style': 'font-size: 12pt; font-weight: bold; fill: white; pointer-events: none; ' +
             'font-family: "Helvetica Neue", Helvetica, sans-serif;'
  }, this.svgGroup_);
  this.text_.textContent = this.title;

  this.updateHeaderControls_();
};

/**
 * Update the frame's size, position, and color based on its contents and user input.
 * @public
 */
Blockly.Frame.prototype.render = function() {
  this.updateColorFromBlocks_();

  var blocks = this.getBlocksInside_();
  var headerHeight = Blockly.Frame.HEADER_HEIGHT;
  var minLeft = this.x;
  var minTop = this.y;
  var rightEdge = this.userRight_;
  var bottomEdge = this.userBottom_;

  if (!this.isMinimized_ && blocks.length > 0) {
    var contentBounds = this.getContentBounds_(blocks);
    minLeft = contentBounds.x;
    minTop = contentBounds.y;
    rightEdge = Math.max(rightEdge, contentBounds.x + contentBounds.width);
    bottomEdge = Math.max(bottomEdge, contentBounds.y + contentBounds.height);
  }

  this.x = minLeft;
  this.y = minTop;
  this.width = Math.max(100, rightEdge - this.x);
  this.height = this.isMinimized_ ? headerHeight : Math.max(50, bottomEdge - this.y);
  this.userWidth_ = this.userRight_ - this.x;
  this.userHeight_ = this.userBottom_ - this.y;

  // Update DOM elements
  this.svgGroup_.setAttribute('transform', 'translate(' + this.x + ',' + this.y + ')');
  this.rect_.setAttribute('width', this.width);
  this.rect_.setAttribute('height', this.height);
  this.header_.setAttribute('width', this.width);

  this.updateHeaderControls_();
  
  this.updateHandlePosition_();
};

/**
 * Request the workspace to recompute its visible content extents after a
 * frame changes size or position.
 * @private
 */
Blockly.Frame.prototype.resizeWorkspaceContents_ = function() {
  if (this.workspace_ && typeof this.workspace_.resizeContents === 'function') {
    this.workspace_.resizeContents();
  }
};

/**
 * Update frame header control positions for the current width/state.
 * @private
 */
Blockly.Frame.prototype.updateHeaderControls_ = function() {
  if (this.deleteButton_) {
    this.deleteButton_.setAttribute('x', this.width - Blockly.Frame.HEADER_ICON_INSET -
        Blockly.Frame.DELETE_ICON_SIZE);
  }
  this.updateMinimizeIcon_();
};

/**
 * Update the minimize icon to match the current frame state.
 * @private
 */
Blockly.Frame.prototype.updateMinimizeIcon_ = function() {
  if (!this.minimizeButton_) {
    return;
  }
  this.minimizeButton_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      this.workspace_.options.pathToMedia +
      (this.isMinimized_ ? 'comment-arrow-up.svg' : 'comment-arrow-down.svg'));
};

/**
 * Update the frame color based on the first block found within its boundaries.
 * @private
 */
Blockly.Frame.prototype.updateColorFromBlocks_ = function() {
  // Keep the current frame color while minimized. Collapsing shrinks bounds to
  // the header, which can temporarily exclude contained stacks from ownership
  // checks and incorrectly reset color to the default.
  if (this.isMinimized_) {
    return;
  }

  var blocks = this.getBlocksInside_();
  var defaultColor = '#4C97FF'; // Scratch Blue
  var newColor = defaultColor;
  var topBlock = null;

  if (blocks.length > 0 && blocks[0]) {
    topBlock = blocks[0];
    // Scratch/Blockly blocks use getColour to return a hex string.
    if (typeof topBlock.getColour === 'function') {
      newColor = topBlock.getColour();
    }
  }

  // Update DOM only if the color has changed to optimize performance.
  if (this.color !== newColor) {
    var oldColor = this.color;
    this.color = newColor;
    this.applyColorStyles_(topBlock);
    Blockly.Events.fire(new Blockly.Events.FrameChange(
        this, 'color', oldColor, newColor));
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
  var resizeSize = (Blockly.ScratchBubble && Blockly.ScratchBubble.RESIZE_SIZE) || 16;
  var cornerPad = (Blockly.ScratchBubble && Blockly.ScratchBubble.RESIZE_CORNER_PAD) || 4;
  var hX = this.width - (resizeSize + cornerPad);
  var hY = this.height - (resizeSize + cornerPad);
  this.resizeHandle_.setAttribute('transform', 'translate(' + hX + ',' + hY + ')');
};

/**
 * Move the frame and its captured blocks by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Frame.prototype.moveBy = function(dx, dy) {
  var blocksToMove = this.capturedBlocks_ || this.getBlocksInside_();
  for (var i = 0, block; block = blocksToMove[i]; i++) {
    // Only move top-level blocks; Blockly automatically moves children.
    if (!block.getParent()) {
      block.moveBy(dx, dy);
    }
  }
  this.x += dx;
  this.y += dy;
  this.userRight_ += dx;
  this.userBottom_ += dy;
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

  var contentBounds = this.getContentBounds_(blocks);
  this.x = contentBounds.x;
  this.y = contentBounds.y;
  // Enforce minimums to remain consistent with render() constraints.
  this.width = Math.max(100, contentBounds.width);
  this.height = Math.max(50, contentBounds.height);
  this.userRight_ = this.x + this.width;
  this.userBottom_ = this.y + this.height;
  this.userWidth_ = this.width;
  this.userHeight_ = this.height;

  // Apply to DOM.
  this.svgGroup_.setAttribute('transform', 'translate(' + this.x + ',' + this.y + ')');
  this.rect_.setAttribute('width', this.width);
  this.rect_.setAttribute('height', this.height);
  this.header_.setAttribute('width', this.width);

  this.updateHeaderControls_();
  
  this.updateHandlePosition_();
};

/**
 * Encode a frame as XML, excluding positional attributes.
 * @param {boolean=} opt_noId True if the encoder should skip the frame ID.
 * @return {!Element} XML element.
 * @public
 */
Blockly.Frame.prototype.toXml = function(opt_noId) {
  var element = goog.dom.createDom('frame');
  if (!opt_noId) {
    element.setAttribute('id', this.id);
  }
  element.setAttribute('title', this.title || '');
  element.setAttribute('color', this.color || '#4C97FF');
  if (this.isMinimized_) {
    element.setAttribute('minimized', true);
  }
  if (this.isLocked_) {
    element.setAttribute('locked', true);
  }
  return element;
};

/**
 * Encode a frame as XML with XY coordinates.
 * @param {boolean=} opt_noId True if the encoder should skip the frame ID.
 * @return {!Element} XML element.
 * @public
 */
Blockly.Frame.prototype.toXmlWithXY = function(opt_noId) {
  var element = this.toXml(opt_noId);
  element.setAttribute('x', Math.round(this.x));
  element.setAttribute('y', Math.round(this.y));
  element.setAttribute('w', Math.round(this.userWidth_));
  element.setAttribute('h', Math.round(this.userHeight_));
  return element;
};

/**
 * Decode an XML frame tag and return the parsed attributes.
 * @param {!Element} xml XML frame element.
 * @return {!Object} Parsed frame attributes.
 * @public
 */
Blockly.Frame.parseAttributes = function(xml) {
  var x = parseInt(xml.getAttribute('x'), 10);
  var y = parseInt(xml.getAttribute('y'), 10);
  var w = parseInt(xml.getAttribute('w'), 10);
  var h = parseInt(xml.getAttribute('h'), 10);
  return {
    id: xml.getAttribute('id') || undefined,
    x: isNaN(x) ? 0 : x,
    y: isNaN(y) ? 0 : y,
    width: isNaN(w) ? 200 : w,
    height: isNaN(h) ? 150 : h,
    title: xml.getAttribute('title') || 'New Group',
    color: xml.getAttribute('color') || '#4C97FF',
    minimized: xml.getAttribute('minimized') === 'true',
    locked: xml.getAttribute('locked') === 'true'
  };
};

/**
 * Decode an XML frame tag and create a frame on a rendered workspace.
 * @param {!Element} xmlFrame XML frame element.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @return {?Blockly.Frame} The created frame, or null if not created.
 * @public
 */
Blockly.Frame.fromXml = function(xmlFrame, workspace) {
  if (!workspace.rendered || !workspace.svgFrameCanvas_) {
    return null;
  }

  var info = Blockly.Frame.parseAttributes(xmlFrame);

  var frame = new Blockly.Frame(workspace, {
    id: info.id,
    x: info.x,
    y: info.y,
    width: info.width,
    height: info.height,
    title: info.title,
    color: info.color,
    locked: info.locked
  });
  if (!workspace.frames_) {
    workspace.frames_ = [];
  }
  workspace.frames_.push(frame);

  if (info.minimized) {
    frame.toggleMinimize_(null, true);
  } else {
    frame.render();
  }
  // Re-run once after hydration to stabilize ownership/color when switching
  // targets or tabs, where block/frame event ordering can vary.
  setTimeout(function() {
    if (!frame.workspace_ || !frame.svgGroup_) {
      return;
    }
    frame.render();
  }, 0);
  frame.resizeWorkspaceContents_();
  return frame;
};

/**
 * Capture frame state used for undo/redo.
 * @return {!Object} Frame state.
 * @private
 */
Blockly.Frame.prototype.getStateForUndo_ = function() {
  return {
    x: this.x,
    y: this.y,
    userRight: this.userRight_,
    userBottom: this.userBottom_,
    minimized: this.isMinimized_
  };
};

/**
 * Apply undo/redo state to this frame.
 * @param {!Object} state State captured by getStateForUndo_.
 * @private
 */
Blockly.Frame.prototype.applyStateFromUndo_ = function(state) {
  if (!state) {
    return;
  }
  this.x = state.x;
  this.y = state.y;
  this.userRight_ = state.userRight;
  this.userBottom_ = state.userBottom;
  this.userWidth_ = this.userRight_ - this.x;
  this.userHeight_ = this.userBottom_ - this.y;
  this.render();
};

/**
 * Apply an undo/redo title change.
 * @param {string} title Frame title.
 * @private
 */
Blockly.Frame.prototype.setTitleFromUndo_ = function(title) {
  this.title = title;
  if (this.text_) {
    this.text_.textContent = title;
  }
};

/**
 * Apply an undo/redo minimized state.
 * @param {boolean} minimized Whether the frame should be minimized.
 * @private
 */
Blockly.Frame.prototype.setMinimizedFromUndo_ = function(minimized) {
  if (this.isMinimized_ !== minimized) {
    this.toggleMinimize_(null, true);
  }
};

/**
 * Apply an undo/redo lock state.
 * @param {boolean} locked Whether the frame should be locked.
 * @private
 */
Blockly.Frame.prototype.setLockedFromUndo_ = function(locked) {
  this.isLocked_ = !!locked;
};

/**
 * Apply an undo/redo color change.
 * @param {string} color Frame color.
 * @private
 */
Blockly.Frame.prototype.setColorFromUndo_ = function(color) {
  this.color = color || '#4C97FF';
  this.applyColorStyles_();
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
  this.setDragVisual_(false);
  if (this.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }
  if (this.onMouseMoveResizeWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveResizeWrapper_);
    this.onMouseMoveResizeWrapper_ = null;
  }
  if (this.onMouseUpResizeWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpResizeWrapper_);
    this.onMouseUpResizeWrapper_ = null;
  }

  if (this.changeWrapper_ && this.workspace_) {
    this.workspace_.removeChangeListener(this.changeWrapper_);
    this.changeWrapper_ = null;
  }

  var currentDragNode = (this.dragSurface_ && this.dragSurface_.getCurrentBlock) ?
      this.dragSurface_.getCurrentBlock() : null;
  if (currentDragNode && this.dragContainerGroup_ &&
      currentDragNode === this.dragContainerGroup_) {
    this.dragSurface_.clearAndHide();
  }

  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }

  if (this.workspace_ && this.workspace_.frames_) {
    var index = this.workspace_.frames_.indexOf(this);
    if (index !== -1) {
      this.workspace_.frames_.splice(index, 1);
    }
  }

  if (this.workspace_ && this.workspace_.blockFrameOwnership_) {
    for (var blockId in this.workspace_.blockFrameOwnership_) {
      if (this.workspace_.blockFrameOwnership_[blockId] == this.id) {
        delete this.workspace_.blockFrameOwnership_[blockId];
      }
    }
  }

  this.workspace_ = null;
  this.dragSurface_ = null;
  this.dragContainerGroup_ = null;
  this.isOnDragSurface_ = false;
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
  if (this.isDragging_) {
    return;
  }
  if (Blockly.utils.isRightButton(e)) {
    this.showContextMenu_(e);
    e.stopPropagation();
    e.preventDefault();
    return;
  }
  this.workspace_.markFocused();
  Blockly.hideChaff();
  this.setDragVisual_(true);
  
  this.isDragging_ = true;
  this.preDragState_ = this.getStateForUndo_();
  this.startDragMouseX_ = e.clientX;
  this.startDragMouseY_ = e.clientY;
  this.dragDeltaX_ = 0;
  this.dragDeltaY_ = 0;
  if (typeof this.workspace_.recordCachedAreas === 'function') {
    this.workspace_.recordCachedAreas();
  }

  // Capture current blocks to move them as a unit
  if (this.isMinimized_ && this.minimizedBlocks_ && this.minimizedBlocks_.length > 0) {
    this.capturedBlocks_ = this.minimizedBlocks_;
  } else {
    this.capturedBlocks_ = this.getBlocksInside_();
  }

  if (this.dragSurface_) {
    this.isOnDragSurface_ = this.moveToDragSurface_();
  }

  this.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(document, 'mousemove', this, this.onMouseMove_);
  this.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(document, 'mouseup', this, this.onMouseUp_);
  
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Handle mousedown on the frame body.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Frame.prototype.onBodyMouseDown_ = function(e) {
  if (!Blockly.utils.isRightButton(e)) {
    return;
  }
  this.showContextMenu_(e);
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

  this.dragDeltaX_ += dx;
  this.dragDeltaY_ += dy;

  if (this.dragSurface_ && this.isOnDragSurface_) {
    this.dragSurface_.translateSurface(this.dragDeltaX_, this.dragDeltaY_);
  } else {
    this.moveBy(dx, dy);
  }
  this.updateDeleteDragState_(e);
};

/**
 * Stop dragging the frame.
 * @private
 */
Blockly.Frame.prototype.onMouseUp_ = function(e) {
  if (this.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }

  this.isDragging_ = false;
  this.setDragVisual_(false);

  // Refresh delete state once at drop position.
  if (e) {
    this.updateDeleteDragState_(e);
  }
  var shouldDelete = this.wouldDeleteFrame_;

  // Clear drag deletion affordance and trashcan state.
  this.setDeleteStyle_(false);
  this.deleteArea_ = Blockly.DELETE_AREA_NONE;
  this.wouldDeleteFrame_ = false;
  if (this.workspace_.trashcan) {
    this.workspace_.trashcan.setOpen_(false);
  }

  if (this.dragSurface_ && this.isOnDragSurface_) {
    this.moveOffDragSurface_(shouldDelete ? null : {x: this.x, y: this.y});
  }

  if (shouldDelete) {
    this.preDragState_ = null;
    this.capturedBlocks_ = [];
    this.dragDeltaX_ = 0;
    this.dragDeltaY_ = 0;
    this.deleteFrame_();
    return;
  }

  if (this.dragDeltaX_ || this.dragDeltaY_) {
    this.moveBy(this.dragDeltaX_, this.dragDeltaY_);
  }

  this.render();
  this.resizeWorkspaceContents_();

  if (this.preDragState_) {
    var newState = this.getStateForUndo_();
    Blockly.Events.fire(new Blockly.Events.FrameChange(
        this, 'state', this.preDragState_, newState));
    this.preDragState_ = null;
  }

  this.dragDeltaX_ = 0;
  this.dragDeltaY_ = 0;
  this.capturedBlocks_ = [];
  this.isOnDragSurface_ = false;
};

/**
 * Update delete affordance while dragging this frame.
 * @param {!Event} e The most recent move/up event.
 * @private
 */
Blockly.Frame.prototype.updateDeleteDragState_ = function(e) {
  if (!this.workspace_ || typeof this.workspace_.isDeleteArea !== 'function') {
    return;
  }
  this.deleteArea_ = this.workspace_.isDeleteArea(e);
  this.wouldDeleteFrame_ = this.deleteArea_ != Blockly.DELETE_AREA_NONE;
  this.setDeleteStyle_(this.wouldDeleteFrame_);

  if (this.workspace_.trashcan) {
    this.workspace_.trashcan.setOpen_(
        this.wouldDeleteFrame_ && this.deleteArea_ == Blockly.DELETE_AREA_TRASH);
  }
};

/**
 * Toggle delete cursor styling while dragging.
 * @param {boolean} enable True if frame would be deleted on drop.
 * @private
 */
Blockly.Frame.prototype.setDeleteStyle_ = function(enable) {
  if (!this.svgGroup_) {
    return;
  }
  if (enable) {
    Blockly.utils.addClass(this.svgGroup_, 'blocklyDraggingDelete');
  } else {
    Blockly.utils.removeClass(this.svgGroup_, 'blocklyDraggingDelete');
  }
};

/**
 * Toggle a stronger visual treatment while dragging this frame.
 * @param {boolean} enable True if drag visuals should be enabled.
 * @private
 */
Blockly.Frame.prototype.setDragVisual_ = function(enable) {
  if (!this.svgGroup_) {
    return;
  }
  // Mark this frame as being dragged
  if (enable) {
    Blockly.utils.addClass(this.svgGroup_, 'blocklyFrameDragging');
  } else {
    Blockly.utils.removeClass(this.svgGroup_, 'blocklyFrameDragging');
  }
};

/**
 * Move this frame to the drag surface for smooth dragging above overlays.
 * @private
 */
Blockly.Frame.prototype.moveToDragSurface_ = function() {
  if (!this.dragSurface_ || !this.svgGroup_) {
    return false;
  }

  // Drag surface is global; if occupied, fall back to normal dragging.
  if (this.dragSurface_.getCurrentBlock && this.dragSurface_.getCurrentBlock()) {
    return false;
  }
  this.dragContainerGroup_ = /** @type {!SVGGElement} */ (
      Blockly.utils.createSvgElement('g', {'class': 'blocklyFrameDragGroup'}, null));
  this.dragContainerGroup_.setAttribute('opacity', Blockly.Frame.DRAG_GHOST_OPACITY);

  // Move frame and captured top-level stacks under a single drag group.
  this.dragContainerGroup_.appendChild(this.svgGroup_);
  for (var i = 0, block; block = this.capturedBlocks_[i]; i++) {
    if (block && block.getSvgRoot) {
      var root = block.getSvgRoot();
      if (root && root.parentNode) {
        this.dragContainerGroup_.appendChild(root);
      }
    }
  }

  this.dragSurface_.translateSurface(0, 0);
  this.dragSurface_.setBlocksAndShow(this.dragContainerGroup_);
  return true;
};

/**
 * Move this frame back from the drag surface to the frame canvas.
 * @param {{x:number,y:number}?} newXY Workspace coordinates to restore to.
 *     If null, remove from drag surface without reparenting.
 * @private
 */
Blockly.Frame.prototype.moveOffDragSurface_ = function(newXY) {
  if (!this.dragSurface_) {
    return;
  }
  var current = this.dragSurface_.getCurrentBlock ?
      this.dragSurface_.getCurrentBlock() : null;
  if (!current || current !== this.dragContainerGroup_) {
    this.dragContainerGroup_ = null;
    this.isOnDragSurface_ = false;
    return;
  }
  var blockCanvas = this.workspace_.getCanvas();
  if (newXY) {
    this.dragSurface_.clearAndHide(blockCanvas);

    // Move frame back to frame canvas and blocks back to block canvas.
    this.workspace_.svgFrameCanvas_.appendChild(this.svgGroup_);
    this.svgGroup_.setAttribute('transform',
        'translate(' + newXY.x + ',' + newXY.y + ')');

    if (this.dragContainerGroup_) {
      while (this.dragContainerGroup_.firstChild) {
        blockCanvas.appendChild(this.dragContainerGroup_.firstChild);
      }
      goog.dom.removeNode(this.dragContainerGroup_);
      this.dragContainerGroup_ = null;
    }
  } else {
    // Drop-to-delete path.
    this.dragSurface_.clearAndHide();
    this.dragContainerGroup_ = null;
  }
  this.isOnDragSurface_ = false;
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
  if (this.isLocked_) {
    return;
  }
  Blockly.hideChaff();
  
  this.isResizing_ = true;
  this.preResizeState_ = this.getStateForUndo_();
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

  this.userRight_ += dx;
  this.userBottom_ += dy;
  this.userWidth_ = this.userRight_ - this.x;
  this.userHeight_ = this.userBottom_ - this.y;
  
  // Prevent the frame from becoming too small to interact with.
  this.userWidth_ = Math.max(this.userWidth_, 100);
  this.userHeight_ = Math.max(this.userHeight_, 50);
  this.userRight_ = this.x + this.userWidth_;
  this.userBottom_ = this.y + this.userHeight_;

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

  if (this.preResizeState_) {
    var newState = this.getStateForUndo_();
    Blockly.Events.fire(new Blockly.Events.FrameChange(
        this, 'state', this.preResizeState_, newState));
    this.preResizeState_ = null;
  }

  this.resizeWorkspaceContents_();
};

/**
 * Toggle the minimized state of the frame, hiding or showing contained blocks.
 * @param {Event} e Mouse down event.
 * @private
 */
Blockly.Frame.prototype.toggleMinimize_ = function(e, opt_skipEvent) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  var oldMinimized = this.isMinimized_;

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
    this.height = Blockly.Frame.HEADER_HEIGHT;
    this.resizeHandle_.style.display = 'none';
  } else {
    this.height = this.oldHeight_ || 150;
    this.resizeHandle_.style.display = 'block';
    // Clear snapshot so the next minimize takes a fresh scan.
    this.minimizedBlocks_ = [];
  }

  this.render();
  this.resizeWorkspaceContents_();

  if (!opt_skipEvent && oldMinimized !== this.isMinimized_) {
    Blockly.Events.fire(new Blockly.Events.FrameChange(
        this, 'minimized', oldMinimized, this.isMinimized_));
  }
};

/**
 * Show a prompt to rename this frame.
 * @private
 */
Blockly.Frame.prototype.promptRename_ = function() {
  if (this.isLocked_) {
    return;
  }
  var oldTitle = this.title;
  Blockly.prompt('Rename Group:', this.title, function(newTitle) {
    if (newTitle !== null) {
      this.title = newTitle;
      this.text_.textContent = newTitle;
      Blockly.Events.fire(new Blockly.Events.FrameChange(
          this, 'title', oldTitle, newTitle));
    }
  }.bind(this));
};

/**
 * Auto-fit the frame to contained blocks and record an undoable state change.
 * @private
 */
Blockly.Frame.prototype.autoFitAndRecord_ = function() {
  if (this.isLocked_) {
    return;
  }
  var oldState = this.getStateForUndo_();
  this.autoResizeToContents();
  this.resizeWorkspaceContents_();
  var newState = this.getStateForUndo_();
  Blockly.Events.fire(new Blockly.Events.FrameChange(
      this, 'state', oldState, newState));
};

/**
 * Show the frame context menu.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Frame.prototype.showContextMenu_ = function(e) {
  if (this.workspace_.options.readOnly) {
    return;
  }

  var hasBlocks = this.getBlocksInside_().length > 0;
  var menuOptions = [
    {
      text: this.isLocked_ ? 'Unlock Group' : 'Lock Group',
      enabled: true,
      callback: this.toggleLock_.bind(this)
    },
    {
      text: 'Rename Group',
      enabled: !this.isLocked_,
      callback: this.promptRename_.bind(this)
    },
    {
      text: this.isMinimized_ ? 'Expand Group' : 'Collapse Group',
      enabled: true,
      callback: this.toggleMinimize_.bind(this, null)
    },
    {
      text: 'Auto-Fit Group',
      enabled: hasBlocks && !this.isLocked_,
      callback: this.autoFitAndRecord_.bind(this)
    },
    {
      text: 'Delete Group',
      enabled: !this.isLocked_,
      callback: this.deleteFrame_.bind(this)
    }
  ];

  Blockly.ContextMenu.show(e, menuOptions, this.workspace_.RTL);
};

/**
 * Delete this frame and contained blocks as one grouped operation.
 * @private
 */
Blockly.Frame.prototype.deleteFrame_ = function() {
  var workspace = this.workspace_;
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }

  try {
    Blockly.Events.fire(new Blockly.Events.FrameDelete(this));

    var blocks = this.getBlocksInside_().slice();
    for (var i = 0, block; block = blocks[i]; i++) {
      if (block && block.workspace) {
        block.dispose();
      }
    }

    this.dispose();
    if (workspace && typeof workspace.resizeContents === 'function') {
      workspace.resizeContents();
    }
  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};

/**
 * Handle mousedown on the delete icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Frame.prototype.onDeleteMouseDown_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  if (this.isLocked_) {
    return;
  }
  this.deleteFrame_();
};

/**
 * Toggle locked state and record an undoable state change.
 * @private
 */
Blockly.Frame.prototype.toggleLock_ = function() {
  var oldLocked = this.isLocked_;
  this.isLocked_ = !this.isLocked_;
  Blockly.Events.fire(new Blockly.Events.FrameChange(
      this, 'locked', oldLocked, this.isLocked_));
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

  if (!e || !e.type) {
    return;
  }

  var isBlockMutationEvent = e.type === Blockly.Events.BLOCK_MOVE ||
      e.type === Blockly.Events.BLOCK_CHANGE ||
      e.type === Blockly.Events.BLOCK_CREATE ||
      e.type === Blockly.Events.BLOCK_DELETE;
  if (!isBlockMutationEvent) {
    return;
  }

  var ownership = this.workspace_.blockFrameOwnership_;
  var wasOwnedByThisFrame = !!(ownership && e.blockId &&
      ownership[e.blockId] === this.id);

  var shouldRender = wasOwnedByThisFrame;
  var block = e.blockId ? this.workspace_.getBlockById(e.blockId) : null;
  if (block) {
    var rootBlock = block.getRootBlock ? block.getRootBlock() : block;
    var ownerId = ownership && ownership[rootBlock.id];
    shouldRender = shouldRender || ownerId === this.id ||
        this.blockIntersectsFrame_(rootBlock, 100);
  }

  if (shouldRender) {
    var oldState = this.getStateForUndo_();
    this.render();
    var newState = this.getStateForUndo_();
    if ((oldState.x !== newState.x || oldState.y !== newState.y ||
        oldState.userRight !== newState.userRight ||
        oldState.userBottom !== newState.userBottom)) {
      Blockly.Events.fire(new Blockly.Events.FrameChange(
          this, 'state', oldState, newState));
    }
  }
};

/**
 * Return the workspace bounds of a top-level block.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {{left: number, top: number, right: number, bottom: number}}
 *     The block bounds in workspace coordinates.
 * @private
 */
Blockly.Frame.prototype.getBlockBounds_ = function(block) {
  var xy = block.getRelativeToSurfaceXY();
  var size = block.getHeightWidth();
  return {
    left: xy.x,
    top: xy.y,
    right: xy.x + size.width,
    bottom: xy.y + size.height
  };
};

/**
 * Compute frame bounds that tightly wrap the provided blocks.
 * @param {!Array.<!Blockly.BlockSvg>} blocks Top-level blocks in the frame.
 * @return {{x: number, y: number, width: number, height: number}} Wrapped
 *     bounds in workspace coordinates.
 * @private
 */
Blockly.Frame.prototype.getContentBounds_ = function(blocks) {
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var padding = 24;
  var headerHeight = Blockly.Frame.HEADER_HEIGHT;

  blocks.forEach(function(block) {
    var bounds = this.getBlockBounds_(block);
    minX = Math.min(minX, bounds.left);
    minY = Math.min(minY, bounds.top);
    maxX = Math.max(maxX, bounds.right);
    maxY = Math.max(maxY, bounds.bottom);
  }, this);

  return {
    x: minX - padding,
    y: minY - padding - headerHeight,
    width: (maxX - minX) + (padding * 2),
    height: (maxY - minY) + (padding * 2) + headerHeight
  };
};

/**
 * Check whether a block overlaps the frame bounds.
 * @param {!Blockly.BlockSvg} block The block to test.
 * @param {number=} opt_margin Extra margin around the frame bounds.
 * @return {boolean} True if the block overlaps the frame.
 * @private
 */
Blockly.Frame.prototype.blockIntersectsFrame_ = function(block, opt_margin) {
  var margin = opt_margin || 0;
  var bounds = this.getBlockBounds_(block);
  return bounds.right >= this.x - margin &&
      bounds.left <= this.x + this.width + margin &&
      bounds.bottom >= this.y - margin &&
      bounds.top <= this.y + this.height + margin;
};

/**
 * Determine whether this frame is the single owner for a top-level block.
 * If multiple frames overlap the same block, ownership is given to the
 * smallest frame area; ties go to the most recently created frame.
 * @param {!Blockly.BlockSvg} block The block to test.
 * @return {boolean} True if this frame owns the block.
 * @private
 */
Blockly.Frame.prototype.ownsBlock_ = function(block) {
  if (!this.workspace_) {
    return false;
  }

  if (!this.workspace_.blockFrameOwnership_) {
    this.workspace_.blockFrameOwnership_ = Object.create(null);
  }
  var ownership = this.workspace_.blockFrameOwnership_;
  var ownerId = ownership[block.id];

  if (ownerId) {
    var ownerFrame = null;
    if (typeof this.workspace_.getFrameById === 'function') {
      ownerFrame = this.workspace_.getFrameById(ownerId);
    } else if (this.workspace_.frames_) {
      for (var fi = 0; fi < this.workspace_.frames_.length; fi++) {
        if (this.workspace_.frames_[fi].id === ownerId) {
          ownerFrame = this.workspace_.frames_[fi];
          break;
        }
      }
    }

    if (ownerFrame && ownerFrame.svgGroup_ && ownerFrame.blockIntersectsFrame_(block, 5)) {
      // Prefer the frame with the smaller area (tighter fit). If areas are equal,
      // prefer the more recently created frame (higher index in workspace.frames_ when available).
      var ownerArea = (ownerFrame.userWidth_ || ownerFrame.width) * (ownerFrame.userHeight_ || ownerFrame.height);
      var myArea = (this.userWidth_ || this.width) * (this.userHeight_ || this.height);
      if (ownerArea < myArea) {
        return ownerId === this.id;
      } else if (ownerArea === myArea) {
        if (this.workspace_.frames_) {
          var ownerIdx = this.workspace_.frames_.indexOf(ownerFrame);
          var myIdx = this.workspace_.frames_.indexOf(this);
          if (myIdx > ownerIdx) {
            // Current frame is more recent -> claim ownership.
          } else {
            return ownerId === this.id;
          }
        } else {
          // No frame ordering information; keep existing owner.
          return ownerId === this.id;
        }
      } else {
        // Current frame is a tighter fit — fall through to claim ownership.
      }
    } else {
      delete ownership[block.id];
    }
  }

  if (this.blockIntersectsFrame_(block, 5)) {
    if (this.isLocked_) {
      return false;
    }
    ownership[block.id] = this.id;
    return true;
  }

  return false;
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
    if (this.ownsBlock_(block)) {
      inside.push(block);
    }
  }
  return inside;
};
