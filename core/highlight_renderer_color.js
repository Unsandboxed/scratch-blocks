goog.provide('Blockly.Highlight.RendererColor');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

Blockly.Highlight.registerRenderer('color', function(value) {
  var color = (typeof value === 'string') ? value.trim() : null;
  if (!color) {
    return null;
  }
  var panelBorder = Blockly.Highlight.withAlpha_(
      Blockly.Highlight.getColour_('blackText', '#575E75'),
      0.3,
      'rgba(127,127,127,0.35)');

  var wrapper = goog.dom.createElement('span');
  wrapper.style.display = 'inline-flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';

  var swatch = goog.dom.createElement('span');
  swatch.style.display = 'inline-block';
  swatch.style.width = '12px';
  swatch.style.height = '12px';
  swatch.style.borderRadius = '50%';
  swatch.style.border = '1px solid ' + panelBorder;
  swatch.style.background = color;
  wrapper.appendChild(swatch);
  wrapper.appendChild(Blockly.Highlight.makeBubble_(
      color,
      panelBorder,
      Blockly.Highlight.getColour_(
          'toolboxText',
          Blockly.Highlight.getColour_('blackText', '#575E75')),
      Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF')));
  return wrapper;
});
