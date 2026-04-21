goog.provide('Blockly.Highlight.RendererImage');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

Blockly.Highlight.registerRenderer('image', function(value) {
  if (!Blockly.Highlight.isImageDataUri_(value)) {
    return null;
  }

  var panelBackground = Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF');
  var panelBorder = Blockly.Highlight.getColour_('valueReportBorder', '#AAAAAA');

  var wrapper = goog.dom.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.maxWidth = '60vw';
  wrapper.style.background = panelBackground;
  wrapper.style.border = '1px solid ' + panelBorder;
  wrapper.style.borderRadius = '6px';
  wrapper.style.padding = '4px';
  wrapper.style.overflow = 'hidden';

  var img = goog.dom.createElement('img');
  img.src = value;
  img.alt = 'visual report image';
  img.draggable = false;
  img.style.display = 'block';
  img.style.maxWidth = 'min(420px, 60vw)';
  img.style.width = 'auto';
  img.style.height = 'auto';
  img.style.objectFit = 'contain';
  img.style.borderRadius = '4px';
  wrapper.appendChild(img);
  return wrapper;
});
