goog.provide('Blockly.Highlight.RendererSprite');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

Blockly.Highlight.registerRenderer('sprite', function(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  var name = typeof value.name === 'string' && value.name ? value.name : '(sprite)';
  var deleted = Boolean(value.deleted);
  var isClone = Boolean(value.isClone);
  var image = typeof value.image === 'string' ? value.image : '';

  var cardBackground = Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF');
  var panelBorder = Blockly.Highlight.getColour_('valueReportBorder', '#AAAAAA');
  var panelText = Blockly.Highlight.getColour_(
      'toolboxText',
      Blockly.Highlight.getColour_('blackText', '#575E75'));
  var mediaBackground = Blockly.Highlight.withAlpha_(
      Blockly.Highlight.getColour_('blackText', '#575E75'),
      0.06,
      '#f4f6fa');

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

  var media = goog.dom.createElement('div');
  media.style.height = '120px';
  media.style.background = mediaBackground;
  media.style.display = 'flex';
  media.style.alignItems = 'center';
  media.style.justifyContent = 'center';
  media.style.borderBottom = '1px solid ' + panelBorder;
  wrapper.appendChild(media);

  if (Blockly.Highlight.isImageDataUri_(image)) {
    var img = goog.dom.createElement('img');
    img.src = image;
    img.alt = 'sprite preview';
    img.draggable = false;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    media.appendChild(img);
  } else {
    var noImage = goog.dom.createElement('span');
    noImage.textContent = 'no image';
    noImage.style.opacity = '0.7';
    media.appendChild(noImage);
  }

  var body = goog.dom.createElement('div');
  body.style.padding = '8px';
  wrapper.appendChild(body);

  var title = goog.dom.createElement('div');
  title.textContent = name;
  title.style.fontWeight = '700';
  title.style.marginBottom = '6px';
  body.appendChild(title);

  var badges = goog.dom.createElement('div');
  badges.style.display = 'flex';
  badges.style.flexDirection = 'row';
  badges.style.flexWrap = 'wrap';
  badges.style.gap = '6px';
  body.appendChild(badges);

  var cloneColor = '#6f8cff';
  var cloneBackground = Blockly.Highlight.withAlpha_(cloneColor, 0.2, 'rgba(111, 140, 255, 0.15)');
  var cloneBadge = Blockly.Highlight.makeBubble_(
      isClone ? 'clone' : 'original',
      cloneColor,
      Blockly.Highlight.contrastText_(cloneColor),
      cloneBackground);
  badges.appendChild(cloneBadge);

  var lifeColor = deleted ? '#cf4747' : '#4da24d';
  var lifeBackground = Blockly.Highlight.withAlpha_(
      lifeColor,
      0.16,
      deleted ? 'rgba(207, 71, 71, 0.16)' : 'rgba(77, 162, 77, 0.16)');
  var deletedBadge = Blockly.Highlight.makeBubble_(
      deleted ? 'deleted' : 'alive',
      lifeColor,
      Blockly.Highlight.contrastText_(lifeColor),
      lifeBackground);
  badges.appendChild(deletedBadge);

  return wrapper;
});
