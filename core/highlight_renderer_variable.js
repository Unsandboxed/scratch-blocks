goog.provide('Blockly.Highlight.RendererVariable');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

/**
 * Build a variable/list monitor card.
 * @param {*} value Variable payload.
 * @param {string} type Semantic subtype.
 * @return {?HTMLElement} Rendered monitor node.
 * @private
 */
Blockly.Highlight.makeVariableMonitor_ = function(value, type) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  var kind = type === 'list' ? 'list' : 'variable';
  var title = typeof value.name === 'string' && value.name ? value.name : (kind + ' getter');
  var text = typeof value.text === 'string' ? value.text : '';
  if (!text && Object.prototype.hasOwnProperty.call(value, 'value')) {
    try {
      text = typeof value.value === 'string' ? value.value : JSON.stringify(value.value);
    } catch (e) {
      text = String(value.value);
    }
  }

  var cardBackground = Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF');
  var panelBorder = Blockly.Highlight.getColour_('valueReportBorder', '#AAAAAA');
  var panelText = Blockly.Highlight.getColour_(
      'toolboxText',
      Blockly.Highlight.getColour_('blackText', '#575E75'));
  var valueBorder = Blockly.Highlight.withAlpha_(panelText, 0.24, '#d7dce3');
  var valueBackground = Blockly.Highlight.withAlpha_(panelText, 0.08, '#f6f7fb');

  var wrapper = goog.dom.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.minWidth = '220px';
  wrapper.style.maxWidth = '320px';
  wrapper.style.border = '1px solid ' + panelBorder;
  wrapper.style.borderRadius = '8px';
  wrapper.style.background = cardBackground;
  wrapper.style.color = panelText;
  wrapper.style.overflow = 'hidden';
  wrapper.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  wrapper.style.fontSize = '12px';

  var header = goog.dom.createElement('div');
  header.style.padding = '8px';
  header.style.borderBottom = '1px solid ' + panelBorder;
  header.style.fontWeight = '700';
  header.textContent = title;
  wrapper.appendChild(header);

  var valueBubble = goog.dom.createElement('div');
  valueBubble.style.margin = '8px';
  valueBubble.style.padding = '6px 10px';
  valueBubble.style.borderRadius = '999px';
  valueBubble.style.border = '1px solid ' + valueBorder;
  valueBubble.style.background = valueBackground;
  valueBubble.style.color = panelText;
  valueBubble.style.fontFamily = 'monospace';
  valueBubble.style.whiteSpace = 'nowrap';
  valueBubble.style.overflow = 'hidden';
  valueBubble.style.textOverflow = 'ellipsis';
  valueBubble.textContent = text || '(empty)';
  wrapper.appendChild(valueBubble);

  if (kind === 'list') {
    var meta = goog.dom.createElement('div');
    var length = Number(value.length) || 0;
    meta.textContent = 'length ' + length;
    meta.style.padding = '0 10px 8px';
    meta.style.opacity = '0.75';
    wrapper.appendChild(meta);
  }

  return wrapper;
};

Blockly.Highlight.registerRenderer('variable', function(value) {
  return Blockly.Highlight.makeVariableMonitor_(value, 'variable');
});

Blockly.Highlight.registerRenderer('list', function(value) {
  return Blockly.Highlight.makeVariableMonitor_(value, 'list');
});
