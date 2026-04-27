goog.provide('Blockly.Highlight.RendererScript');

goog.require('Blockly.Css');
goog.require('Blockly.Highlight');
goog.require('Blockly.inject');
goog.require('goog.dom');

/**
 * Resolve Blockly media path for image-backed fields/icons.
 * @return {string} Media path.
 * @private
 */
Blockly.Highlight.getMediaPath_ = function() {
  if (Blockly.mainWorkspace && Blockly.mainWorkspace.options &&
      typeof Blockly.mainWorkspace.options.pathToMedia === 'string') {
    return Blockly.mainWorkspace.options.pathToMedia;
  }
  if (Blockly.Css && typeof Blockly.Css.mediaPath_ === 'string' && Blockly.Css.mediaPath_) {
    return Blockly.Css.mediaPath_;
  }
  if (typeof Blockly.mediaPath_ === 'string') {
    return Blockly.mediaPath_;
  }
  return '';
};

/**
 * Resolve script payload serialized data from multiple compatible shapes.
 * @param {*} value Script visual-report payload.
 * @return {?Object} Normalized serialized stack.
 * @private
 */
Blockly.Highlight.getSerializedScriptData_ = function(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  var candidates = [];
  if (value.serialized && typeof value.serialized === 'object') {
    candidates.push(value.serialized);
  }
  if (value.data && typeof value.data === 'object') {
    if (value.data.serialized && typeof value.data.serialized === 'object') {
      candidates.push(value.data.serialized);
    }
    if (value.data.value && typeof value.data.value === 'object' &&
        value.data.value.serialized && typeof value.data.value.serialized === 'object') {
      candidates.push(value.data.value.serialized);
    }
    if (value.data.type === 'serialized-stack') {
      candidates.push(value.data);
    }
  }

  if (!candidates.length) {
    return null;
  }

  var selected = candidates[0];
  if (!selected || typeof selected !== 'object') {
    return null;
  }

  var normalized = {
    top: typeof selected.top === 'string' ? selected.top : '',
    blocks: []
  };

  if (Array.isArray(selected.blocks)) {
    normalized.blocks = selected.blocks;
  } else if (selected.blocks && typeof selected.blocks === 'object') {
    normalized.blocks = Object.keys(selected.blocks).map(function(id) {
      var block = selected.blocks[id];
      if (!block || typeof block !== 'object') {
        return null;
      }
      if (typeof block.id !== 'string' || !block.id) {
        block.id = id;
      }
      return block;
    }).filter(Boolean);
  }

  if (!normalized.blocks.length) {
    return null;
  }

  if (!normalized.top) {
    for (var i = 0; i < normalized.blocks.length; i++) {
      var block = normalized.blocks[i];
      if (block && typeof block.id === 'string' && block.id) {
        normalized.top = block.id;
        break;
      }
    }
  }

  return normalized.top ? normalized : null;
};

/**
 * Check whether an input name likely represents a statement stack input.
 * @param {string} inputName Input name.
 * @return {boolean} True when the input is a statement slot.
 * @private
 */
Blockly.Highlight.isStatementInputName_ = function(inputName) {
  if (typeof inputName !== 'string' || !inputName) {
    return false;
  }
  return /^SUBSTACK\d*$/.test(inputName) || /^STACK\d*$/.test(inputName) || /^BRANCH\d*$/.test(inputName);
};

/**
 * Resolve an input's connected child block id.
 * @param {*} inputData Serialized input entry.
 * @return {string} Child id or empty string.
 * @private
 */
Blockly.Highlight.getInputChildId_ = function(inputData) {
  if (!inputData || typeof inputData !== 'object') {
    return '';
  }
  if (typeof inputData.block === 'string' && inputData.block) {
    return inputData.block;
  }
  if (typeof inputData.shadow === 'string' && inputData.shadow) {
    return inputData.shadow;
  }
  return '';
};

/**
 * Build a truncated traversal that descends into nested stacks before next.
 * @param {*} serialized Serialized stack payload.
 * @param {number} limit Maximum number of blocks.
 * @return {{order: !Array<string>, byId: !Object<string, Object>}} Traversal result.
 * @private
 */
Blockly.Highlight.extractScriptTraversal_ = function(serialized, limit) {
  var output = {
    order: [],
    byId: Object.create(null),
    renderedStackCount: 0,
    totalStackCount: 0,
    hiddenStackCount: 0
  };
  if (!serialized || typeof serialized !== 'object') {
    return output;
  }

  var blocks = Array.isArray(serialized.blocks) ? serialized.blocks : [];
  if (!blocks.length) {
    return output;
  }

  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (!block || typeof block !== 'object') {
      continue;
    }
    var id = typeof block.id === 'string' ? block.id : '';
    if (id) {
      output.byId[id] = block;
    }
  }

  var stackReachable = Object.create(null);
  var collectStackGraph = function(blockId) {
    if (!blockId || stackReachable[blockId]) {
      return;
    }
    var current = output.byId[blockId];
    if (!current) {
      return;
    }
    stackReachable[blockId] = true;

    var inputs = (current.inputs && typeof current.inputs === 'object') ? current.inputs : null;
    if (inputs) {
      var inputNames = Object.keys(inputs);
      for (var iName = 0; iName < inputNames.length; iName++) {
        var inputName = inputNames[iName];
        if (!Blockly.Highlight.isStatementInputName_(inputName)) {
          continue;
        }
        var stackChild = Blockly.Highlight.getInputChildId_(inputs[inputName]);
        if (stackChild) {
          collectStackGraph(stackChild);
        }
      }
    }

    if (typeof current.next === 'string' && current.next) {
      collectStackGraph(current.next);
    }
  };

  var included = Object.create(null);
  var includeBlock = function(blockId) {
    if (!blockId || included[blockId]) {
      return;
    }
    if (!output.byId[blockId]) {
      return;
    }
    included[blockId] = true;
    output.order.push(blockId);
  };

  var includeValueTree = function(blockId) {
    if (!blockId || included[blockId]) {
      return;
    }
    var current = output.byId[blockId];
    if (!current) {
      return;
    }

    includeBlock(blockId);

    var inputs = (current.inputs && typeof current.inputs === 'object') ? current.inputs : null;
    if (!inputs) {
      return;
    }
    var inputNames = Object.keys(inputs);
    for (var j = 0; j < inputNames.length; j++) {
      var inputName = inputNames[j];
      if (Blockly.Highlight.isStatementInputName_(inputName)) {
        continue;
      }
      var childId = Blockly.Highlight.getInputChildId_(inputs[inputName]);
      if (childId) {
        includeValueTree(childId);
      }
    }
  };

  var walkStackLimited = function(blockId) {
    if (!blockId || output.renderedStackCount >= limit) {
      return;
    }
    if (!stackReachable[blockId]) {
      return;
    }
    var current = output.byId[blockId];
    if (!current || included[blockId]) {
      return;
    }

    includeBlock(blockId);
    output.renderedStackCount++;

    var inputs = (current.inputs && typeof current.inputs === 'object') ? current.inputs : null;
    if (inputs) {
      var inputNames = Object.keys(inputs);
      for (var n = 0; n < inputNames.length; n++) {
        var inputName = inputNames[n];
        var childId = Blockly.Highlight.getInputChildId_(inputs[inputName]);
        if (!childId) {
          continue;
        }
        if (Blockly.Highlight.isStatementInputName_(inputName)) {
          if (output.renderedStackCount < limit) {
            walkStackLimited(childId);
          }
          continue;
        }
        includeValueTree(childId);
      }
    }

    if (output.renderedStackCount < limit && typeof current.next === 'string' && current.next) {
      walkStackLimited(current.next);
    }
  };

  var topId = typeof serialized.top === 'string' ? serialized.top : '';
  if (topId) {
    collectStackGraph(topId);
    walkStackLimited(topId);
  }

  output.totalStackCount = Object.keys(stackReachable).length;
  output.hiddenStackCount = Math.max(0, output.totalStackCount - output.renderedStackCount);

  if (!output.order.length) {
    for (var k = 0; k < blocks.length; k++) {
      var fallback = blocks[k];
      if (!fallback || typeof fallback.id !== 'string' || !fallback.id) {
        continue;
      }
      includeBlock(fallback.id);
      output.renderedStackCount = Math.min(limit, output.order.length);
      output.totalStackCount = Math.max(output.totalStackCount, output.order.length);
      output.hiddenStackCount = Math.max(0, output.totalStackCount - output.renderedStackCount);
      if (output.order.length >= limit) {
        break;
      }
    }
  }
  return output;
};

/**
 * Apply serialized field values when possible.
 * @param {!Blockly.BlockSvg} block Blockly block.
 * @param {!Object} fieldMap Serialized fields map.
 * @return {void}
 * @private
 */
Blockly.Highlight.applySerializedFields_ = function(block, fieldMap) {
  if (!fieldMap || typeof fieldMap !== 'object') {
    return;
  }
  var names = Object.keys(fieldMap);
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var raw = fieldMap[name];
    var value = raw;
    if (raw && typeof raw === 'object' && Object.prototype.hasOwnProperty.call(raw, 'value')) {
      value = raw.value;
    }
    if (typeof value === 'undefined' || value === null) {
      continue;
    }
    try {
      block.setFieldValue(String(value), name);
    } catch (e) {
      // Ignore invalid or read-only field updates.
    }
  }
};

/**
 * Render a tiny read-only Blockly workspace containing a shortened stack.
 * @param {!HTMLElement} host Host element.
 * @param {*} serialized Serialized stack payload.
 * @param {number} maxBlocks Maximum blocks to render.
 * @return {{renderedCount:number,totalCount:number,hiddenCount:number}} Render metadata.
 * @private
 */
Blockly.Highlight.createMiniScriptWorkspace_ = function(host, serialized, maxBlocks) {
  var traversal = Blockly.Highlight.extractScriptTraversal_(serialized, maxBlocks);
  var orderedIds = traversal.order;
  var byId = traversal.byId;
  var result = {
    renderedCount: 0,
    totalCount: traversal.totalStackCount || 0,
    hiddenCount: traversal.hiddenStackCount || 0,
    renderedStackCount: traversal.renderedStackCount || 0,
    totalStackCount: traversal.totalStackCount || 0,
    hiddenStackCount: traversal.hiddenStackCount || 0
  };

  if (!orderedIds.length) {
    return result;
  }

  var workspace = Blockly.inject(host, {
    comments: false,
    disable: false,
    collapse: false,
    media: Blockly.Highlight.getMediaPath_(),
    readOnly: true,
    rtl: false,
    scrollbars: false,
    sounds: false,
    toolbox: null,
    trashcan: false,
    zoom: {
      controls: false,
      wheel: false,
      startScale: 0.52,
      maxScale: 0.52,
      minScale: 0.52,
      pinch: false
    }
  });

  var created = Object.create(null);
  var createdCount = 0;
  for (var i = 0; i < orderedIds.length; i++) {
    var localId = orderedIds[i];
    var model = byId[localId];
    if (!model || typeof model.opcode !== 'string' || !Blockly.Blocks[model.opcode]) {
      continue;
    }

    var block = workspace.newBlock(model.opcode);
    if (model.shadow && typeof block.setShadow === 'function') {
      block.setShadow(true);
    }
    block.setMovable(false);
    block.setDeletable(false);
    block.setEditable(false);
    Blockly.Highlight.applySerializedFields_(block, model.fields || {});
    block.initSvg();
    created[localId] = block;
    createdCount++;
  }

  if (!createdCount) {
    return result;
  }

  result.renderedCount = createdCount;
  result.hiddenCount = traversal.hiddenStackCount || 0;

  var connectChildToInput = function(parent, inputName, child) {
    if (!parent || !child || !inputName) {
      return;
    }
    var input = parent.getInput(inputName);
    if (!input || !input.connection || input.connection.isConnected()) {
      return;
    }

    if (child.previousConnection && input.connection.type === Blockly.NEXT_STATEMENT) {
      input.connection.connect(child.previousConnection);
      return;
    }
    if (child.outputConnection && input.connection.type === Blockly.INPUT_VALUE) {
      input.connection.connect(child.outputConnection);
      return;
    }
    if (child.previousConnection) {
      input.connection.connect(child.previousConnection);
    }
  };

  for (var j = 0; j < orderedIds.length; j++) {
    var id = orderedIds[j];
    var blockModel = byId[id];
    var parentBlock = created[id];
    if (!blockModel || !parentBlock) {
      continue;
    }

    if (typeof blockModel.next === 'string' && created[blockModel.next] &&
        parentBlock.nextConnection && created[blockModel.next].previousConnection &&
        !parentBlock.nextConnection.isConnected()) {
      parentBlock.nextConnection.connect(created[blockModel.next].previousConnection);
    }

    var inputs = (blockModel.inputs && typeof blockModel.inputs === 'object') ? blockModel.inputs : null;
    if (!inputs) {
      continue;
    }
    var inputNames = Object.keys(inputs);
    for (var k = 0; k < inputNames.length; k++) {
      var inputName = inputNames[k];
      var inputModel = inputs[inputName];
      if (!inputModel || typeof inputModel !== 'object') {
        continue;
      }
      var childId = typeof inputModel.block === 'string' ? inputModel.block : '';
      if (!childId && typeof inputModel.shadow === 'string') {
        childId = inputModel.shadow;
      }
      if (!childId || !created[childId]) {
        continue;
      }
      connectChildToInput(parentBlock, inputName, created[childId]);
    }
  }

  var createdIds = Object.keys(created);
  for (var r = 0; r < createdIds.length; r++) {
    var rendered = created[createdIds[r]];
    if (rendered && typeof rendered.render === 'function') {
      rendered.render();
    }
  }

  var topId = typeof serialized.top === 'string' ? serialized.top : '';
  var topBlock = created[topId] || created[orderedIds[0]];
  if (topBlock) {
    topBlock.getRootBlock().moveBy(24, 18);
  }

  if (typeof Blockly.svgResize === 'function') {
    Blockly.svgResize(workspace);
  }

  var previewHeight = 180;
  try {
    var canvas = typeof workspace.getCanvas === 'function' ? workspace.getCanvas() : null;
    if (canvas && typeof canvas.getBBox === 'function') {
      var bounds = canvas.getBBox();
      if (bounds && isFinite(bounds.height) && bounds.height > 0) {
        previewHeight = Math.max(84, Math.ceil(bounds.height + 42));
      }
    }
  } catch (e) {
    // Keep default preview height when bbox metrics are unavailable.
  }
  previewHeight = Math.min(previewHeight, 320);
  host.style.height = previewHeight + 'px';

  // Resize SVG after the host height is finalized so the viewport matches content.
  if (typeof Blockly.svgResize === 'function') {
    Blockly.svgResize(workspace);
  }

  host.__scriptPreviewWorkspace = workspace;
  return result;
};

/**
 * Render a tiny read-only Blockly workspace containing a shortened stack.
 * @param {!HTMLElement} host Host element.
 * @param {*} serialized Serialized stack payload.
 * @param {number} maxBlocks Maximum number of blocks.
 * @param {function({renderedCount:number,totalCount:number,hiddenCount:number}):void} onDone Result callback.
 * @return {boolean} True if workspace rendering started.
 * @private
 */
Blockly.Highlight.renderMiniWorkspace_ = function(host, serialized, maxBlocks, onDone) {
  if (!host || !serialized || typeof serialized !== 'object') {
    return false;
  }
  if (typeof Blockly.inject !== 'function') {
    return false;
  }

  setTimeout(function() {
    if (!host.parentNode) {
      return;
    }

    try {
      if (host.__scriptPreviewWorkspace && typeof host.__scriptPreviewWorkspace.dispose === 'function') {
        host.__scriptPreviewWorkspace.dispose();
        host.__scriptPreviewWorkspace = null;
      }

      var renderInfo = Blockly.Highlight.createMiniScriptWorkspace_(host, serialized, maxBlocks);
      if (!renderInfo.renderedCount) {
        host.textContent = '(preview unavailable)';
        host.style.display = 'flex';
        host.style.alignItems = 'center';
        host.style.justifyContent = 'center';
        host.style.opacity = '0.72';
        if (typeof onDone === 'function') {
          onDone(renderInfo);
        }
        return;
      }
      if (typeof onDone === 'function') {
        onDone(renderInfo);
      }
    } catch (e) {
      host.textContent = '(preview unavailable)';
      host.style.display = 'flex';
      host.style.alignItems = 'center';
      host.style.justifyContent = 'center';
      host.style.opacity = '0.72';
      if (typeof onDone === 'function') {
        onDone({
          renderedCount: 0,
          totalCount: serialized && Array.isArray(serialized.blocks) ? serialized.blocks.length : 0,
          hiddenCount: 0
        });
      }
    }
  }, 0);

  return true;
};

Blockly.Highlight.registerRenderer('script', function(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  var source = typeof value.source === 'string' ? value.source :
      (typeof value.text === 'string' ? value.text : 'script');
  var serialized = Blockly.Highlight.getSerializedScriptData_(value);
  var maxBlocks = 12;

  var cardBackground = Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF');
  var panelBorder = Blockly.Highlight.getColour_('valueReportBorder', '#AAAAAA');
  var panelText = Blockly.Highlight.getColour_(
      'toolboxText',
      Blockly.Highlight.getColour_('blackText', '#575E75'));
  var previewBackground = Blockly.Highlight.withAlpha_(
      panelText,
      0.08,
      '#f4f6fa');

  var wrapper = goog.dom.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.minWidth = '260px';
  wrapper.style.maxWidth = '360px';
  wrapper.style.border = '1px solid ' + panelBorder;
  wrapper.style.borderRadius = '8px';
  wrapper.style.background = cardBackground;
  wrapper.style.color = panelText;
  wrapper.style.overflow = 'hidden';
  wrapper.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  wrapper.style.fontSize = '12px';

  var title = goog.dom.createElement('div');
  title.textContent = source;
  title.style.padding = '8px';
  title.style.fontWeight = '700';
  title.style.borderBottom = '1px solid ' + panelBorder;
  title.style.whiteSpace = 'nowrap';
  title.style.overflow = 'hidden';
  title.style.textOverflow = 'ellipsis';
  wrapper.appendChild(title);

  var preview = goog.dom.createElement('div');
  preview.style.minHeight = '84px';
  preview.style.maxHeight = '320px';
  preview.style.width = '100%';
  preview.style.position = 'relative';
  preview.style.background = previewBackground;
  preview.style.borderBottom = '1px solid ' + panelBorder;
  preview.style.overflow = 'hidden';
  wrapper.appendChild(preview);

  var footer = goog.dom.createElement('div');
  footer.style.padding = '6px 8px';
  footer.style.fontSize = '11px';
  footer.style.opacity = '0.78';
  footer.textContent = 'loading preview...';
  wrapper.appendChild(footer);

  if (!serialized || !Array.isArray(serialized.blocks) || !serialized.blocks.length) {
    var empty = goog.dom.createElement('div');
    empty.textContent = '(empty script)';
    empty.style.height = '100%';
    empty.style.display = 'flex';
    empty.style.alignItems = 'center';
    empty.style.justifyContent = 'center';
    empty.style.opacity = '0.7';
    preview.appendChild(empty);
    footer.textContent = '0 blocks';
    return wrapper;
  }

  if (!Blockly.Highlight.renderMiniWorkspace_(preview, serialized, maxBlocks, function(info) {
    if (!info || !info.renderedCount) {
      footer.textContent = 'preview unavailable';
      return;
    }
    if (info.hiddenStackCount > 0) {
      footer.textContent = 'showing first ' + info.renderedStackCount +
          ' stack blocks (' + info.hiddenStackCount + ' hidden)';
      return;
    }
    footer.textContent = info.totalStackCount + ' stack block' +
        (info.totalStackCount === 1 ? '' : 's');
  })) {
    var fallback = goog.dom.createElement('div');
    fallback.textContent = '(preview unavailable)';
    fallback.style.height = '100%';
    fallback.style.display = 'flex';
    fallback.style.alignItems = 'center';
    fallback.style.justifyContent = 'center';
    fallback.style.opacity = '0.72';
    preview.appendChild(fallback);
    footer.textContent = 'preview unavailable';
  }

  return wrapper;
});
