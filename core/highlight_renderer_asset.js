goog.provide('Blockly.Highlight.RendererAsset');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

Blockly.Highlight.registerRenderer('asset', function(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  var kind = value.kind === 'sound' ? 'sound' : 'costume';
  var name = typeof value.name === 'string' && value.name ? value.name : '(' + kind + ')';
  var image = typeof value.image === 'string' ? value.image : '';
  var index = Number(value.index);
  var width = Number(value.width) || 0;
  var height = Number(value.height) || 0;
  var duration = Number(value.duration) || 0;

  var cardBackground = Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF');
  var panelBorder = Blockly.Highlight.getColour_('valueReportBorder', '#AAAAAA');
  var panelText = Blockly.Highlight.getColour_(
      'toolboxText',
      Blockly.Highlight.getColour_('blackText', '#575E75'));
  var mediaBackground = Blockly.Highlight.withAlpha_(
      Blockly.Highlight.getColour_('blackText', '#575E75'),
      0.08,
      '#eceef2');

  var wrapper = goog.dom.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.minWidth = '180px';
  wrapper.style.maxWidth = '230px';
  wrapper.style.border = '1px solid ' + panelBorder;
  wrapper.style.borderRadius = '8px';
  wrapper.style.background = cardBackground;
  wrapper.style.color = panelText;
  wrapper.style.overflow = 'hidden';
  wrapper.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  wrapper.style.fontSize = '12px';

  var media = goog.dom.createElement('div');
  media.style.height = '92px';
  media.style.background = mediaBackground;
  media.style.display = 'flex';
  media.style.alignItems = 'center';
  media.style.justifyContent = 'center';
  media.style.borderBottom = '1px solid ' + panelBorder;
  wrapper.appendChild(media);

  if (kind === 'costume' && Blockly.Highlight.isImageDataUri_(image)) {
    var img = goog.dom.createElement('img');
    img.src = image;
    img.alt = 'asset preview';
    img.draggable = false;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    media.appendChild(img);
  } else if (kind === 'sound') {
    var note = goog.dom.createElement('span');
    note.textContent = '\u266B';
    note.style.fontSize = '36px';
    note.style.opacity = '0.7';
    media.appendChild(note);
  } else {
    var noImage = goog.dom.createElement('span');
    noImage.textContent = 'no image';
    noImage.style.opacity = '0.7';
    media.appendChild(noImage);
  }

  var body = goog.dom.createElement('div');
  body.style.padding = '7px 8px';
  body.style.textAlign = 'center';
  wrapper.appendChild(body);

  var title = goog.dom.createElement('div');
  title.textContent = name;
  title.style.fontWeight = '700';
  title.style.fontSize = '13px';
  title.style.marginBottom = '2px';
  title.style.whiteSpace = 'nowrap';
  title.style.overflow = 'hidden';
  title.style.textOverflow = 'ellipsis';
  body.appendChild(title);

  var detail = goog.dom.createElement('div');
  detail.style.opacity = '0.82';
  detail.style.fontSize = '11px';
  detail.style.marginBottom = '1px';
  if (isFinite(index) && index >= 0) {
    detail.textContent = (kind === 'sound' ? 'sound ' : 'costume ') +
        (Math.round(index) + 1);
  } else {
    detail.textContent = kind;
  }
  body.appendChild(detail);

  var subtitle = goog.dom.createElement('div');
  subtitle.style.opacity = '0.8';
  subtitle.style.fontSize = '11px';
  if (kind === 'costume') {
    subtitle.textContent = (width > 0 && height > 0) ?
        (Math.round(width) + ' x ' + Math.round(height)) : 'costume asset';
  } else {
    subtitle.textContent = duration > 0 ? (duration.toFixed(2) + ' s') : 'sound asset';
  }
  body.appendChild(subtitle);

  return wrapper;
});
