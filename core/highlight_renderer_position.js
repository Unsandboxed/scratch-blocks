goog.provide('Blockly.Highlight.RendererPosition');

goog.require('Blockly.Highlight');

Blockly.Highlight.registerRenderer('position', function(value) {
  var pair = Blockly.Highlight.parsePair_(value);
  if (!pair) {
    return null;
  }

  var positionColor = (Blockly.Colours && Blockly.Colours.motion && Blockly.Colours.motion.primary) || '#4C97FF';
  var positionBackground = Blockly.Highlight.withAlpha_(positionColor, 0.2, 'rgba(76,151,255,0.2)');

  return Blockly.Highlight.makeBubble_(
      'x:' + Blockly.Highlight.formatNumber_(pair.x) +
      ' y:' + Blockly.Highlight.formatNumber_(pair.y),
      positionColor,
      Blockly.Highlight.contrastText_(positionColor),
      positionBackground);
});
