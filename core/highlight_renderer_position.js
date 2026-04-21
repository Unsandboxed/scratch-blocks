goog.provide('Blockly.Highlight.RendererPosition');

goog.require('Blockly.Highlight');

Blockly.Highlight.registerRenderer('position', function(value) {
  var pair = Blockly.Highlight.parsePair_(value);
  if (!pair) {
    return null;
  }
  return Blockly.Highlight.makeBubble_(
      'x:' + Blockly.Highlight.formatNumber_(pair.x) +
      ' y:' + Blockly.Highlight.formatNumber_(pair.y),
      '#7b67a8');
});
