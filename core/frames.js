// title
// minWidth_
20
// minHeight_
20
// resizeButtonWidth_
8
// resizeButtonHeight_
8
// titleInputHeight_
24
// borderColor_
var (--theme - brand - color, #2D8CFF)
// appendBlocksToBlocksCanvas
function(){var e= this; Blockly.Events.disable(), this.options.blocks.forEach((function(t) {
    (t = e.workspace.getBlockById(t)) && (e.addBlock(t), t.frame_ = e, t.moveBlockToContainer("frame"))
  })), Blockly.Events.enable()
}
// checkRect_
function() {
  if (this.rect_.right < this.rect_.left) {
    this.rect_.width = Math.abs(this.rect_.width);
    var e = this.rect_.right;
    this.rect_.right = this.rect_.left, this.rect_.left = e
  }
  this.rect_.bottom < this.rect_.top && (this.rect_.height = Math.abs(this.rect_.height), e = this.rect_.top, this.rect_.top = this.rect_.bottom, this.rect_
    .bottom = e)
}
// clearTransformAttributes_
function() {
  Blockly.utils.removeAttribute(this.getSvgRoot(), "transform")
}
// createDom_
function() {
  this.frameGroup_ = Blockly.utils.createSvgElement("g", {
      class: "blocklyFrame" + (this.locked ? " blocklyFrameLocked" : "")
    }, this.workspace.svgBlockCanvas_), this.frameGroup_.style.visibility = "hidden", this.frameGroup_.dataset && (this.frameGroup_.dataset.id = this.id), this
    .blocksGroup_ = Blockly.utils.createSvgElement("g", {
      class: "blocklyFrameBlockCanvas",
      transform: "translate(" + this.resizeButtonWidth_ / 2 + "," + (this.titleInputHeight_ + this.resizeButtonHeight_ / 2) + ")"
    }, this.frameGroup_), this.svgRect_ = Blockly.utils.createSvgElement("rect", {
      class: "blocklyFrameRectangle",
      stroke: "transparent",
      fill: "rgba(" + this.color + ",0.12)",
      x: 0,
      y: 0,
      height: this.rect_.height,
      width: this.rect_.width
    }, this.blocksGroup_), this.svgRect_.tooltip = this, Blockly.bindEvent_(this.svgRect_, "mousedown", this, (function() {
      !this.locked && this.isEmpty_ && this.select()
    })), Blockly.bindEventWithChecks_(this.frameGroup_, "mousedown", null, this.onMouseDown_.bind(this)), this.foreignObject_ = Blockly.utils.createSvgElement(
      "foreignObject", {
        class: "blocklyFrameForeignObject",
        x: this.resizeButtonWidth_ / 2,
        y: 0,
        height: 0,
        width: 0
      }, this.frameGroup_), Blockly.bindEvent_(this.blocksGroup_, "mouseenter", this, (function() {
      this.workspace.draggingBlocks_ || this.locked || this.frameGroup_.classList.add("blocklyFrameHover")
    })), Blockly.bindEvent_(this.blocksGroup_, "mouseleave", this, (function() {
      this.workspace.draggingBlocks_ || this.frameGroup_.classList.remove("blocklyFrameHover")
    })), this.foreignObjectBody_ = document.createElementNS(Blockly.HTML_NS, "body"), this.foreignObjectBody_.setAttribute("xmlns", Blockly.HTML_NS), this
    .foreignObjectBody_.className = "blocklyMinimalBody blocklyFrameForeignObjectBody", this.foreignObject_.appendChild(this.foreignObjectBody_), this
    .createCollapseButton_(), this.createTitleEditor_(), this.createLockButton_(), this.createMenuButton_(), this.createResizeGroup_()
}
// createCollapseButton_
function() {
  this.collapseButton_ = document.createElementNS(Blockly.HTML_NS, "div"), this.collapseButton_.className =
    "blocklyFrameActionButton blocklyFrameCollapseButton", Blockly.bindEventWithChecks_(this.collapseButton_, "mousedown", this, this.triggerChangeCollapsed),
    this.foreignObjectBody_.appendChild(this.collapseButton_)
}
// createCollapsedContent_
function() {
  var e = this;
  this.collapseContentForeignObject_ = Blockly.utils.createSvgElement("foreignObject", {
      class: "blocklyFrameCollapsedContent",
      x: this.resizeButtonWidth_ / 2,
      y: this.titleInputHeight_ + this.resizeButtonHeight_ / 2,
      height: 60,
      width: this.rect_.width
    }, this.frameGroup_), this.collapseContentForeignObjectBody_ = document.createElementNS(Blockly.HTML_NS, "body"), this.collapseContentForeignObjectBody_
    .setAttribute("xmlns", Blockly.HTML_NS), this.collapseContentForeignObjectBody_.className = "blocklyMinimalBody blocklyFrameForeignObjectBody", this
    .collapseContentForeignObject_.appendChild(this.collapseContentForeignObjectBody_), this.collapseContent_ = document.createElementNS(Blockly.HTML_NS,
    "div"), this.collapseContent_.className = "collapsedContent", this.isCollapsed && (this.frameGroup_.classList.add("blocklyFrameCollapsed"), this
      .blocksGroup_.style.display = "none", this.resizeGroup_.style.display = "none", this.updateCollapsedContent_(), this.collapseContentForeignObjectBody_
      .appendChild(this.collapseContent_), setTimeout((function() {
        for (var t in Object.values(e.blockDB_).forEach((function(e) {
            e.getConnections_().forEach((function(e) {
              return e.hideAll()
            }))
          })), e.workspace.commentDB_) {
          var n = e.workspace.commentDB_[t];
          n.block_ && n.block_.isInFrame() === e && n.setDisplay("none")
        }
      }), 1))
}
// updateCollapsedContent_
function() {
  var e = this.getBlocksCount();
  this.collapseContent_.style.backgroundColor = "rgb(" + this.color + ")", this.collapseContent_.innerHTML = Blockly.Msg.COLLAPSED_X_BLOCKS.replace("%1",
    String(e))
}
// createLockButton_
function() {
  this.lockButton_ = document.createElementNS(Blockly.HTML_NS, "div"), this.lockButton_.className = "blocklyFrameActionButton blocklyFrameLockButton", Blockly
    .bindEventWithChecks_(this.lockButton_, "mousedown", this, this.triggerChangeLock), this.foreignObjectBody_.appendChild(this.lockButton_)
}
// createMenuButton_
function() {
  this.menuButton_ = document.createElementNS(Blockly.HTML_NS, "div"), this.menuButton_.className = "blocklyFrameActionButton blocklyFrameMenuButton", Blockly
    .bindEventWithChecks_(this.menuButton_, "mousedown", this, (function(e) {
      Blockly.locked || this.locked || (this.showContextMenu_(e), e.stopPropagation())
    })), this.foreignObjectBody_.appendChild(this.menuButton_)
}
// createTitleEditor_
function() {
  var e = this,
    t = goog.dom.createDom("div", {
      class: "blocklyFrameTitleWrapper"
    }),
    n = goog.dom.createDom("input", {
      class: "blocklyFrameTitleInput",
      dir: this.workspace.RTL ? "RTL" : "LTR",
      maxlength: 200
    }),
    i = goog.dom.createDom("div", {
      class: "blocklyFrameInputWrapper"
    });
  this.titleInput_ = n, this.titleInput_.tooltip = this, i.appendChild(n), t.appendChild(i), n.value = this.title, requestAnimationFrame((function() {
      return e.onInputTitle()
    })), Blockly.bindEvent_(i, "mousedown", this, (function() {
      Blockly.locked || this.locked || this.select()
    })), Blockly.bindEvent_(i, "mouseup", this, (function(e) {
      if (!Blockly.locked && !this.locked) {
        var t = Date.now(),
          n = t - (e.target.getAttribute("last-down") || t);
        e.target.setAttribute("last-down", t), 0 < n && 250 > n && (this.titleInput_.style["pointer-events"] = "auto", this.titleInput_.focus())
      }
    })), Blockly.bindEvent_(t, "mouseenter", this, (function() {
      Blockly.locked || this.workspace.draggingBlocks_ || this.locked || this.frameGroup_.classList.add("blocklyFrameHover")
    })), Blockly.bindEvent_(t, "mouseleave", this, (function() {
      Blockly.locked || this.workspace.draggingBlocks_ || this.frameGroup_.classList.remove("blocklyFrameHover")
    })), this.foreignObjectBody_.appendChild(t), t = this.computeFrameRelativeXY(), this.translate(t.x, t.y), this.frameGroup_.style.visibility = "visible",
    Blockly.bindEventWithChecks_(n, "wheel", this, (function(e) {
      e.stopPropagation()
    })), Blockly.bindEventWithChecks_(n, "change", this, (function(e) {
      var t = e.target.value;
      t.trim() ? this.title != t && this.onTitleChange(t) : e.target.value = this.title
    })), Blockly.bindEventWithChecks_(n, "blur", this, (function(e) {
      e.target.style["pointer-events"] = "none"
    })), Blockly.bindEventWithChecks_(n, "input", this, this.onInputTitle), this.updateTitleBoxSize()
}
// createResizeGroup_
function() {
  return this.resizeGroup_ = Blockly.utils.createSvgElement("g", {
      class: "frameResizeButtons",
      transform: "translate(0," + this.titleInputHeight_ + ")"
    }, this.frameGroup_), this.resizeButtons.tl = Blockly.utils.createSvgElement("rect", {
      class: "blocklyResizeButtonNW",
      stroke: this.borderColor_,
      fill: "#FFFFFF",
      x: "0",
      y: "0",
      height: this.resizeButtonHeight_,
      width: this.resizeButtonWidth_
    }, this.resizeGroup_), Blockly.bindEventWithChecks_(this.resizeButtons.tl, "mousedown", null, this.resizeButtonMouseDown_.bind(this, "tl")), this
    .resizeButtons.tr = Blockly.utils.createSvgElement("rect", {
      class: "blocklyResizeButtonNE",
      stroke: this.borderColor_,
      fill: "#FFFFFF",
      x: this.getWidth(),
      y: "0",
      height: this.resizeButtonHeight_,
      width: this.resizeButtonWidth_
    }, this.resizeGroup_), Blockly.bindEventWithChecks_(this.resizeButtons.tr, "mousedown", null, this.resizeButtonMouseDown_.bind(this, "tr")), this
    .resizeButtons.bl = Blockly.utils.createSvgElement("rect", {
      class: "blocklyResizeButtonSW",
      stroke: this.borderColor_,
      fill: "#FFFFFF",
      x: "0",
      y: this.getHeight(),
      height: this.resizeButtonHeight_,
      width: this.resizeButtonWidth_
    }, this.resizeGroup_), Blockly.bindEventWithChecks_(this.resizeButtons.bl, "mousedown", null, this.resizeButtonMouseDown_.bind(this, "bl")), this
    .resizeButtons.br = Blockly.utils.createSvgElement("rect", {
      class: "blocklyResizeButtonSE",
      stroke: this.borderColor_,
      fill: "#FFFFFF",
      x: this.getWidth(),
      y: this.getHeight(),
      height: this.resizeButtonHeight_,
      width: this.resizeButtonWidth_
    }, this.resizeGroup_), Blockly.bindEventWithChecks_(this.resizeButtons.br, "mousedown", null, this.resizeButtonMouseDown_.bind(this, "br")), this
    .resizeGroup_
}
// cleanUp
function() {
  this.workspace.setResizesEnabled(!1), Blockly.Events.getGroup() || Blockly.Events.setGroup(!0);
  for (var e = 50, t = 0, n = this.getOrderedBlockColumns(), i = n.maxWidths, o = 50, r = (n = $jscomp.makeIterator(n.cols)).next(); !r.done; r = n.next()) {
    for (var s = 50, a = 0, l = (r = $jscomp.makeIterator(r.value.blocks)).next(); !l.done; l = r.next()) {
      var c = (l = l.value).getRelativeToSurfaceXY(!0);
      0 === o - c.x && 0 === s - c.y || l.moveBy(o - c.x, s - c.y), s += (c = l.getHeightWidth()).height + 72, a = Math.max(a, Math.max(c.width + 0, i[l.id] ||
        0))
    }
    t += a + 100, e = Math.max(e, s - 72 + 50), o += a + 96
  }
  this.render({
    x: this.rect_.left,
    y: this.rect_.top,
    height: e,
    width: t
  }), Blockly.Events.setGroup(!1), this.workspace.setFrameToFront(), this.workspace.setResizesEnabled(!0)
}
// getOrderedBlockColumns
function() {
  for (var e = Object.values(this.blockDB_), t = [], n = (e = $jscomp.makeIterator(e)).next(); !n.done; n = e.next())
    if (!(n = n.value).hidden) {
      for (var i = n.getRelativeToSurfaceXY(), o = null, r = 256, s = $jscomp.makeIterator(t), a = s.next(); !a.done; a = s.next()) {
        a = a.value;
        var l = Math.abs(i.x - a.x);
        l < r && (r = l, o = a)
      }
      o ? (o.x = (o.x * o.count + i.x) / ++o.count, o.blocks.push(n)) : t.push({
        x: i.x,
        count: 1,
        blocks: [n]
      })
    } for (t.sort((function(e, t) {
      return e.x - t.x
    })), a = (e = $jscomp.makeIterator(t)).next(); !a.done; a = e.next()) a.value.blocks.sort((function(e, t) {
    return e.getRelativeToSurfaceXY().y - t.getRelativeToSurfaceXY().y
  }));
  return {
    cols: t,
    orphans: {
      x: -999999,
      count: 0,
      blocks: []
    },
    maxWidths: {}
  }
}
// computeFrameRelativeXY
function() {
  return new goog.math.Coordinate((this.rect_.left < this.rect_.right ? this.rect_.left : this.rect_.right) - this.resizeButtonWidth_ / 2, (this.rect_.top <
    this.rect_.bottom ? this.rect_.top : this.rect_.bottom) - this.resizeButtonHeight_ / 2 - this.titleInputHeight_)
}
// duplicateFrameBlocks
function() {
  var e = this;
  this.options.blocks.forEach((function(t) {
    if (t = e.workspace.getBlockById(t)) {
      var n = Blockly.Xml.blockToDom(t);
      e.workspace.setResizesEnabled(!1), n = Blockly.Xml.domToBlock(n, e.workspace), Blockly.scratchBlocksUtils.changeObscuredShadowIds(n), t = t
        .getRelativeToSurfaceXY(), n.moveBy(t.x, t.y), e.addBlock(n), n.frame_ = e, n.moveBlockToContainer("frame")
    }
  }))
}
// fireFrameChange
function(e, t, n) {
  Blockly.Events.fire(new Blockly.Events.FrameChange(this, e, t, n))
}
// fireFrameRectChange
function() {
  Blockly.Events.isEnabled() && (this.fireFrameChange("rect", this.oldBoundingFrameRect_, this.getBoundingFrameRect()), this.fireFrameBlocksCoordinatesChange(!
    0))
}
// fireFrameBlocksCoordinatesChange
function(e) {
  if (this.oldBlocksCoordinate_) {
    for (var t in this.blockDB_)
      if (Object.hasOwnProperty.call(this.blockDB_, t)) {
        var n = this.blockDB_[t],
          i = new Blockly.Events.BlockMove(n, e),
          o = this.oldBlocksCoordinate_[n.id];
        if (o) {
          i.oldCoordinate = o.oldCoordinate, i.recordNew();
          var r = goog.math.Coordinate.difference(i.newCoordinate, i.oldCoordinate);
          n.moveBy(r.x, r.y, !0), Blockly.Events.fire(i), n.fireIconsMoveEvent(o.dragIconData)
        }
      } this.oldBlocksCoordinate_ = null
  }
}
// fireFrameBlocksChange
function() {
  Blockly.Events.isEnabled() && this.fireFrameChange("blocks", {
    blocks: this.oldBlockIdList_
  }, {
    blocks: this.getBlockIds()
  })
}
// getBoundingRectangle
function() {
  var e = this.getFrameGroupRelativeXY(),
    t = this.getWidth() + this.resizeButtonWidth_,
    n = this.getHeight() + this.resizeButtonHeight_ + this.titleInputHeight_;
  if (this.RTL) {
    var i = new goog.math.Coordinate(e.x - t, e.y);
    e = new goog.math.Coordinate(e.x, e.y + n)
  } else i = new goog.math.Coordinate(e.x, e.y), e = new goog.math.Coordinate(e.x + t, e.y + n);
  return {
    topLeft: i,
    bottomRight: e
  }
}
// getFrameGroupRelativeXY
function() {
  return Blockly.utils.getRelativeXY(this.frameGroup_)
}
// getBlockGroupRelativeXY
function() {
  var e = Blockly.utils.getRelativeXY(this.frameGroup_),
    t = Blockly.utils.getRelativeXY(this.blocksGroup_);
  return new goog.math.Coordinate(e.x + t.x, e.y + t.y)
}
// getSvgRoot
function() {
  return this.frameGroup_
}
// getWidth
function() {
  return Math.abs(this.rect_.right - this.rect_.left)
}
// getHeight
function() {
  return Math.abs(this.rect_.bottom - this.rect_.top)
}
// getHeightWidth
function() {
  return {
    height: this.getHeight(),
    width: this.getWidth()
  }
}
// getBoundingFrameRect
function() {
  return {
    x: this.rect_.left,
    y: this.rect_.top,
    width: this.getWidth(),
    height: this.getHeight()
  }
}
// getBlockIds
function() {
  return Object.keys(this.blockDB_)
}
// getBlocksCount
function() {
  for (var e = 0, t = Object.values(this.blockDB_), n = 0; n < t.length; n++) {
    var i = t[n];
    i.isShadow_ || e++, i.childBlocks_ && i.childBlocks_.forEach((function(e) {
      e.isShadow_ || t.push(e)
    }))
  }
  return e
}
// isEditable
function() {
  return this.editable_ && !(this.workspace && this.workspace.options.readOnly)
}
// isDeletable
function() {
  return this.deletable_ && !(this.workspace && this.workspace.options.readOnly)
}
// isMovable
function() {
  return this.movable_ && !(this.workspace && this.workspace.options.readOnly)
}
// setMovable
function(e) {
  this.movable_ = e
}
// moveToDragSurface_
function(e) {
  var t = this.getFrameGroupRelativeXY();
  this.clearTransformAttributes_(), Blockly.ColorSelector.hide(), this.workspace.blockDragSurface_.translateSurface(t.x, t.y), this.workspace.blockDragSurface_
    .setBlocksAndShow(this.getSvgRoot(), this.isBatchElement, e), this.workspace.blockDragSurface_.dragGroup_.setAttribute("filter", "none"), this.svgRect_
    .setAttribute("filter", "url(#" + this.workspace.blockDragSurface_.dragShadowFilterId_ + ")")
}
// moveOffDragSurface_
function(e, t) {
  t ? this.fireFrameBlocksCoordinatesChange(!1) : (this.rect_.left = e.x + this.resizeButtonWidth_ / 2, this.rect_.top = e.y + this.resizeButtonHeight_ / 2 +
      this.titleInputHeight_, this.rect_.right = this.rect_.left + this.rect_.width + this.resizeButtonWidth_ / 2, this.rect_.bottom = this.rect_.top + this
      .rect_.height + this.resizeButtonWidth_ / 2), this.translate(e.x, e.y), this.svgRect_.setAttribute("filter", "none"), this.workspace.blockDragSurface_
    .dragGroup_.setAttribute("filter", "url(#" + this.workspace.blockDragSurface_.dragShadowFilterId_ + ")"), this.workspace.blockDragSurface_.clearAndHide(this
      .workspace.getCanvas())
}
// moveDuringDrag
function(e, t) {
  void 0 === t || t ? this.workspace.blockDragSurface_.translateSurface(e.x, e.y) : (this.rect_.left = e.x + this.resizeButtonWidth_ / 2, this.rect_.top = e.y +
    this.resizeButtonHeight_ / 2 + this.titleInputHeight_, this.rect_.right = this.rect_.left + this.rect_.width + this.resizeButtonWidth_ / 2, this.rect_
    .bottom = this.rect_.top + this.rect_.height + this.resizeButtonWidth_ / 2, t = this.getFrameGroupRelativeXY(), this.translate(t.x + e.x, t.y + e.y))
}
// moveBy
function(e, t) {
  this.oldBoundingFrameRect_ = this.getBoundingFrameRect();
  var n = this.getFrameGroupRelativeXY();
  this.rect_.left += e, this.rect_.top += t, this.rect_.right += e, this.rect_.bottom += t, this.recordBlocksRelativeToSurfaceXY(), this.translate(n.x + e, n
    .y + t), this.fireFrameRectChange(), this.workspace.resizeContents()
}
// addBlock
function(e) {
  this.blockDB_[e.id] || (this.oldBlockIdList_ = this.getBlockIds(), this.blockDB_[e.id] = e, this.rendered && this.fireFrameBlocksChange()), this.setIsEmpty(!
    Object.keys(this.blockDB_).length)
}
// removeBlock
function(e) {
  this.blockDB_[e.id] && (this.oldBlockIdList_ = this.getBlockIds(), delete this.blockDB_[e.id], this.rendered && this.fireFrameBlocksChange()), this
    .setIsEmpty(!Object.keys(this.blockDB_).length)
}
// onStartDrag
function() {
  this.setDragging(!0), this.recordBlocksRelativeToSurfaceXY()
}
// onStopDrag
function() {
  this.fireFrameRectChange(), this.setDragging(!1)
}
// onStartResizeRect_
function() {
  this.foreignObject_.style["pointer-events"] = "none"
}
// onInputTitle
function() {
  this.titleInput_.style.width = "10px", this.titleInput_.style.width = this.titleInput_.scrollWidth + 10 + "px"
}
// onStopResizeRect_
function() {
  this.foreignObject_.style["pointer-events"] = ""
}
// select
function() {
  if (!Blockly.locked && Blockly.selected != this && this.workspace) {
    var e = null;
    if (Blockly.selected) {
      e = Blockly.selected.id, Blockly.Events.disable();
      try {
        Blockly.selected.unselect()
      } finally {
        Blockly.Events.enable()
      }
    }
    this.selected = !0, (e = new Blockly.Events.Ui(null, "selected", e, this.id)).workspaceId = this.workspace.id, Blockly.Events.fire(e), Blockly.selected =
      this, this.addSelect()
  }
}
// unselect
function() {
  if (Blockly.selected == this) {
    this.selected = !1;
    var e = new Blockly.Events.Ui(null, "selected", this.id, null);
    e.workspaceId = this.workspace.id, Blockly.Events.fire(e), Blockly.selected = null, this.removeSelect()
  }
}
// addSelect
function() {
  Blockly.utils.addClass(this.frameGroup_, "frameSelected")
}
// removeSelect
function() {
  Blockly.utils.removeClass(this.frameGroup_, "frameSelected")
}
// onMouseDown_
function(e) {
  if (!(this.locked || e.ctrlKey || e.metaKey))
    if (this.workspace.waitingCreateFrame) e.stopPropagation();
    else if ((Blockly.selected == this || this.selected || 2 === e.button) && (!this.workspace || !this.workspace.hasGesture())) {
    var t = this.workspace && this.workspace.getGesture(e);
    t && t.handleFrameStart(e, this)
  }
}
// onTitleChange
function(e) {
  Blockly.Events.fire(new Blockly.Events.FrameRetitle(this, e)), this.title = e
}
// recordBlocksRelativeToSurfaceXY
function() {
  var e = this;
  this.oldBlocksCoordinate_ = {}, Object.values(this.blockDB_).forEach((function(t) {
    var n = t.getRelativeToSurfaceXY();
    e.oldBlocksCoordinate_[t.id] = {
      oldCoordinate: n,
      dragIconData: t.initIconData()
    }
  }))
}
// resizeButtonMouseDown_
function(e, t, n) {
  if (this.mostRecentEvent_ = t, this.oldBoundingFrameRect_ = this.getBoundingFrameRect(), this.frameGroup_.style.cursor = "pointer", this.workspace
    .setResizesEnabled(!1), this.workspace.setResizingFrame(!0), this.select(), this.setResizing(!0), this.onStartResizeRect_(), n) {
    e = this.workspace.scale, n = Blockly.utils.getRelativeXY(this.workspace.svgBlockCanvas_);
    var i = t.target.getBoundingClientRect(),
      o = Math.round(t.clientY - i.top);
    this.rect_.left = this.rect_.right = (Math.round(t.clientX - i.left) - n.x) / e, this.rect_.top = this.rect_.bottom = (o - n.y) / e, e = this
      .computeFrameRelativeXY(), this.translate(e.x, e.y)
  } else this.resizeButtonMouseMoveBindData_ = Blockly.bindEventWithChecks_(document, "mousemove", null, this.resizeButtonMouseMove_.bind(this, e)), this
    .resizeButtonMouseUpBindData_ = Blockly.bindEventWithChecks_(document, "mouseup", null, this.resizeButtonMouseUp_.bind(this, e));
  t.preventDefault(), t.stopPropagation()
}
// resizeButtonMouseMove_
function(e, t) {
  if (this.workspace.isInWorkspaceSvg(t)) {
    var n = (t.clientX - this.mostRecentEvent_.clientX) / this.workspace.scale,
      i = (t.clientY - this.mostRecentEvent_.clientY) / this.workspace.scale;
    if (this.mostRecentEvent_ = t, this.updateBoundingClientRect(n, i, "tr" === e || "br" === e ? "ltr" : "rtl", "tl" === e || "tr" === e ? "btt" : "ttb"), e =
      this.computeFrameRelativeXY(), (t = Object.values(this.blockDB_)).length) {
      var o = (n = Blockly.utils.getRelativeXY(this.getSvgRoot())).x - e.x,
        r = n.y - e.y;
      (o || r) && t.forEach((function(e) {
        var t = e.getRelativeToSurfaceXY(!0);
        e.translate(t.x + o, t.y + r)
      }))
    }
    this.translate(e.x, e.y), this.updateFrameRectSize(), this.updateTitleBoxSize(), this.updateResizeButtonsPosition()
  }
}
// resizeButtonMouseUp_
function(e, t, n) {
  this.frameGroup_.style.cursor = "", t.target === this.resizeButtons[e] && this.resizeButtonMouseMove_(e, t), this.checkRect_(), this.onStopResizeRect_(), this
    .setResizing(!1), this.workspace.setResizingFrame(!1), n ? this.getHeight() < this.minHeight_ || this.getWidth() < this.minWidth_ ? (Blockly.Events
    .disable(), this.workspace.setWaitingCreateFrameEnabled(!1), this.workspace.cancelCurrentGesture(), this.dispose(), Blockly.Events.enable()) : (this
      .updateOwnedBlocks(), this.rendered = !0, Blockly.Events.fire(new Blockly.Events.FrameCreate(this)), this.workspace.setResizesEnabled(!0)) : (this
      .fireFrameRectChange(), this.updateOwnedBlocks(), Blockly.unbindEvent_(this.resizeButtonMouseMoveBindData_), Blockly.unbindEvent_(this
        .resizeButtonMouseUpBindData_), this.workspace.setResizesEnabled(!0))
}
// render
function(e, t) {
  t = void 0 === t || t;
  var n = {};
  this.oldBoundingFrameRect_ = this.getBoundingFrameRect(), t ? this.recordBlocksRelativeToSurfaceXY() : Object.values(this.blockDB_).forEach((function(e) {
      var t = new Blockly.Events.BlockMove(e);
      n[e.id] = t
    })), this.rect_.left = e.x, this.rect_.top = e.y, this.rect_.bottom = this.rect_.top + e.height, this.rect_.right = this.rect_.left + e.width, this.rect_
    .width = e.width, this.rect_.height = e.height, e = this.computeFrameRelativeXY(), this.translate(e.x, e.y), t || Object.values(n).forEach((function(e) {
      e.recordNew(), Blockly.Events.fire(e)
    })), this.updateFrameRectSize(), this.updateTitleBoxSize(), this.updateResizeButtonsPosition(), this.fireFrameRectChange(), this.workspace.resizeContents()
}
// requestMoveInBlock
function(e) {
  var t = e.getRelativeToSurfaceXY(),
    n = t.x;
  t = t.y;
  var i = this.rect_,
    o = i.left,
    r = i.right,
    s = i.top;
  i = i.bottom;
  var a = !1;
  return e.frame_ && e.frame_ !== this ? a = !1 : n > o && n < r && t > s && t < i && (a = e.frame_ === this || !this.locked && !this.isCollapsed), a && this
    .addBlock(e), a
}
// setDragging
function(e) {
  e ? (this.oldBoundingFrameRect_ = this.getBoundingFrameRect(), this.getSvgRoot().translate_ = "", Blockly.utils.addClass(this.frameGroup_, "blocklyDragging"),
    this.onStartResizeRect_()) : (Blockly.utils.removeClass(this.frameGroup_, "blocklyDragging"), this.onStopResizeRect_())
}
// setIsEmpty
function(e) {
  this.isEmpty_ !== e && (this.isEmpty_ = e)
}
// setResizing
function(e) {
  e ? (this.oldBoundingFrameRect_ = this.getBoundingFrameRect(), this.getSvgRoot().translate_ = "", Blockly.utils.addClass(this.frameGroup_, "frameResizing"),
    this.onStartResizeRect_()) : (Blockly.utils.removeClass(this.frameGroup_, "frameResizing"), this.onStopResizeRect_())
}
// setEditable
function(e) {
  this.editable_ = e
}
// setMouseThroughStyle
function(e) {
  e ? Blockly.utils.addClass(this.frameGroup_, "blocklyDraggingMouseThrough") : Blockly.utils.removeClass(this.frameGroup_, "blocklyDraggingMouseThrough")
}
// setTitle
function(e) {
  this.title != e && (this.title = e, this.titleInput_.value = this.title, Blockly.Events.fire(new Blockly.Events.FrameRetitle(this, e)))
}
// setColor
function(e) {
  this.color !== e && (this.fireFrameChange("color", {
    color: this.color
  }, {
    color: e
  }), this.color = e, this.svgRect_.setAttribute("fill", "rgba(" + e + ",0.12)"), this.collapseContent_.style.backgroundColor = "rgb(" + this.color + ")")
}
// triggerChangeLock
function() {
  this.fireFrameChange("locked", {
    locked: this.locked
  }, {
    locked: !this.locked
  }), (this.locked = !this.locked) ? (this.frameGroup_.classList.add("blocklyFrameLocked"), Object.values(this.blockDB_).forEach((function(e) {
    e.getConnections_().forEach((function(e) {
      return e.hideAll()
    }))
  }))) : (this.frameGroup_.classList.remove("blocklyFrameLocked"), Object.values(this.blockDB_).forEach((function(e) {
    e.getConnections_().forEach((function(e) {
      return e.unhideAll()
    }))
  })))
}
// triggerChangeCollapsed
function(e) {
  if (!Blockly.locked && !this.locked) {
    var t = "boolean" === typeof e ? e : !this.isCollapsed;
    if (t !== this.isCollapsed) {
      if (Blockly.Events.setGroup(!0), this.fireFrameChange("collapsed", {
          collapsed: this.isCollapsed
        }, {
          collapsed: t
        }), this.isCollapsed = t, this.collapseContentForeignObject_.setAttribute("width", Math.abs(this.rect_.width)), this.isCollapsed)
        for (var n in this.frameGroup_.classList.add("blocklyFrameCollapsed"), this.blocksGroup_.style.display = "none", this.resizeGroup_.style.display =
            "none", this.updateCollapsedContent_(), this.collapseContentForeignObjectBody_.appendChild(this.collapseContent_), Object.values(this.blockDB_)
            .forEach((function(e) {
              e.getConnections_().forEach((function(e) {
                return e.hideAll()
              }))
            })), this.workspace.commentDB_) {
          var i = this.workspace.commentDB_[n];
          i.block_ && i.block_.isInFrame() === this && i.setDisplay("none")
        } else
          for (i in this.frameGroup_.classList.remove("blocklyFrameCollapsed"), this.blocksGroup_.style.display = "block", this.resizeGroup_.style.display =
            "block", this.collapseContent_.parentNode && this.collapseContentForeignObjectBody_.removeChild(this.collapseContent_), Object.values(this.blockDB_)
            .forEach((function(e) {
              e.getConnections_().forEach((function(e) {
                return e.unhideAll()
              }))
            })), this.workspace.commentDB_)(n = this.workspace.commentDB_[i]).block_ && n.block_.isInFrame() === this && n.setDisplay("block");
      if ("boolean" === typeof e) Blockly.Events.setGroup(!1);
      else {
        e = this.getFrameGroupRelativeXY(), n = this.getHeightWidth(), i = this.workspace.getTopBlocks(), t = this.workspace.getTopFrames(!0), i = i.concat(t),
          t = 0;
        for (var o; o = i[t]; t++)
          if (o !== this && !o.frame_) {
            var r = o.getFrameGroupRelativeXY ? o.getFrameGroupRelativeXY() : o.getRelativeToSurfaceXY(),
              s = o.getHeightWidth(),
              a = r.y > e.y;
            r.x + s.width < e.x || e.x + n.width < r.x || !a || (s = this.isCollapsed ? -(n.height - 60) : n.height - 60, this.isCollapsed && r.y - e.y < n
              .height && (s = e.y - r.y + 100), o.moveBy(0, s))
          } Blockly.Events.setGroup(!1), this.workspace.queueIntersectionCheck()
      }
    }
  }
}
// showContextMenu_
function(e) {
  if (!this.workspace.options.readOnly) {
    var t = [];
    if (this.isEditable()) {
      var n = !this.isCollapsed && 0 < Object.keys(this.blockDB_).length;
      t.push(Blockly.ContextMenu.frameDuplicateOption(this, e)), t.push(Blockly.ContextMenu.frameCleanupOption(this, n)), t.push(Blockly.ContextMenu
        .frameSetColorOption(this, e)), t.push(Blockly.ContextMenu.frameDeleteOption(this, e))
    }
    Blockly.ContextMenu.show(e, t, this.RTL), Blockly.ContextMenu.currentFrame = this
  }
}
// translate
function(e, t) {
  this.getSvgRoot().setAttribute("transform", "translate(" + e + "," + t + ")")
}
// updateFrameRectSize
function() {
  this.svgRect_.setAttribute("width", Math.abs(this.rect_.width)), this.svgRect_.setAttribute("height", Math.abs(this.rect_.height))
}
// updateTitleBoxSize
function() {
  if (this.foreignObject_) {
    var e = this.titleInputHeight_,
      t = this.getWidth();
    this.foreignObject_.setAttribute("height", e), this.foreignObject_.setAttribute("width", t), 40 > t ? (t = 40, this.foreignObjectBody_.classList.add(
        "blocklyFrameForeignObjectBodyMini")) : this.foreignObjectBody_.classList.remove("blocklyFrameForeignObjectBodyMini"), this.foreignObject_.style
      .setProperty("--frame-title-width", t + "px"), this.foreignObject_.style.setProperty("--frame-title-height", e + "px")
  }
}
// updateOwnedBlocks
function() {
  Object.values(this.blockDB_).forEach((function(e) {
    e.parentBlock_ && e.requestMoveOutFrame()
  }));
  for (var e = this.workspace.getTopBlocks(), t = 0; t < e.length; t++) e[t].requestMoveInFrame() || e[t].requestMoveOutFrame()
}
// updateBoundingClientRect
function(e, t, n, i) {
  "ltr" === n ? (this.rect_.right += e, this.rect_.width += e) : (this.rect_.left += e, this.rect_.width -= e), "ttb" === i ? (this.rect_.bottom += t, this
    .rect_.height += t) : (this.rect_.top += t, this.rect_.height -= t)
}
// updateResizeButtonsPosition
function() {
  this.resizeButtons.tr.setAttribute("x", this.getWidth()), this.resizeButtons.bl.setAttribute("y", this.getHeight()), this.resizeButtons.br.setAttribute("x",
    this.getWidth()), this.resizeButtons.br.setAttribute("y", this.getHeight())
}
// dispose
function(e) {
  if (this.workspace) {
    this.oldBlockIdList_ = this.getBlockIds();
    var t = this.workspace,
      n = Object.assign({}, this.blockDB_);
    Blockly.Events.fire(new Blockly.Events.FrameDelete(this));
    var i, o = {};
    for (i in n) o.block = n[i], e ? o.block.requestMoveOutFrame() : (setTimeout(function(e) {
      return function() {
        e.block.workspace && t.fireDeletionListeners(e.block)
      }
    }(o)), o.block.dispose(!1, !0)), o = {
      block: o.block
    };
    goog.dom.removeNode(this.frameGroup_), this.svgRect_ = this.rect_ = this.frameGroup_ = null, this.blockDB_ = {}, this.workspace = null, t.removeTopFrame(
      this), t.resizeContents(), Blockly.selected === this && (Blockly.selected = null)
  }
}