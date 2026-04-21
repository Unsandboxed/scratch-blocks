goog.provide('Blockly.Highlight.RendererVector');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

/**
 * Build a static vector report card inspired by the vec2 field.
 * @param {{x:number, y:number}} pair Parsed vector.
 * @return {!HTMLElement} Vector report node.
 * @private
 */
Blockly.Highlight.makeVectorReport_ = function(pair) {
  var panelBackground = Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF');
  var panelBorder = Blockly.Highlight.getColour_('valueReportBorder', '#AAAAAA');
  var panelText = Blockly.Highlight.getColour_('toolboxText', '#575E75');
  var circleFill = Blockly.Highlight.getColour_('textField', '#FFFFFF');
  var axisColor = Blockly.Highlight.getColour_('blackText', '#575E75');
  var vectorColor = Blockly.Highlight.getColour_('motion', null) ? Blockly.Colours.motion.primary : '#4C97FF';

  var wrapper = goog.dom.createElement('div');
  wrapper.style.display = 'inline-flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '6px';
  wrapper.style.minWidth = '170px';
  wrapper.style.padding = '6px';
  wrapper.style.border = '1px solid ' + panelBorder;
  wrapper.style.borderRadius = '8px';
  wrapper.style.background = panelBackground;
  wrapper.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';

  var magnitude = Math.sqrt((pair.x * pair.x) + (pair.y * pair.y));
  var direction = Math.atan2(pair.y, pair.x) * (180 / Math.PI);
  if (direction < 0) {
    direction += 360;
  }

  var stats = goog.dom.createElement('div');
  stats.style.fontSize = '11px';
  stats.style.fontWeight = '700';
  stats.style.textAlign = 'center';
  stats.style.color = panelText;
  stats.textContent =
      'x:' + Blockly.Highlight.formatNumber_(pair.x) +
      ' y:' + Blockly.Highlight.formatNumber_(pair.y) +
      ' m:' + Blockly.Highlight.formatNumber_(magnitude);
  wrapper.appendChild(stats);

  var svgSize = 90;
  var center = svgSize / 2;
  var radius = 30;
  var svg = goog.dom.createElement('svg');
  svg.setAttribute('width', svgSize);
  svg.setAttribute('height', svgSize);
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  var ring = goog.dom.createElement('circle');
  ring.setAttribute('cx', center);
  ring.setAttribute('cy', center);
  ring.setAttribute('r', radius);
  ring.setAttribute('fill', circleFill);
  ring.setAttribute('stroke', panelBorder);
  ring.setAttribute('stroke-width', '1');
  svg.appendChild(ring);

  var axisH = goog.dom.createElement('line');
  axisH.setAttribute('x1', center - radius);
  axisH.setAttribute('y1', center);
  axisH.setAttribute('x2', center + radius);
  axisH.setAttribute('y2', center);
  axisH.setAttribute('stroke', axisColor);
  axisH.setAttribute('stroke-opacity', '0.45');
  axisH.setAttribute('stroke-width', '1');
  svg.appendChild(axisH);

  var axisV = goog.dom.createElement('line');
  axisV.setAttribute('x1', center);
  axisV.setAttribute('y1', center - radius);
  axisV.setAttribute('x2', center);
  axisV.setAttribute('y2', center + radius);
  axisV.setAttribute('stroke', axisColor);
  axisV.setAttribute('stroke-opacity', '0.45');
  axisV.setAttribute('stroke-width', '1');
  svg.appendChild(axisV);

  var line = goog.dom.createElement('line');
  line.setAttribute('x1', center);
  line.setAttribute('y1', center);
  line.setAttribute('stroke', vectorColor);
  line.setAttribute('stroke-width', '2.5');

  var handle = goog.dom.createElement('circle');
  handle.setAttribute('r', '4.5');
  handle.setAttribute('fill', vectorColor);
  handle.setAttribute('stroke', panelBackground);
  handle.setAttribute('stroke-width', '1.5');

  if (magnitude <= 0) {
    line.setAttribute('x2', center);
    line.setAttribute('y2', center);
    handle.setAttribute('cx', center);
    handle.setAttribute('cy', center);
  } else {
    var ux = pair.x / magnitude;
    var uy = pair.y / magnitude;
    var px = center + (ux * radius);
    var py = center - (uy * radius);
    line.setAttribute('x2', px);
    line.setAttribute('y2', py);
    handle.setAttribute('cx', px);
    handle.setAttribute('cy', py);
  }
  svg.appendChild(line);
  svg.appendChild(handle);
  wrapper.appendChild(svg);

  var dir = goog.dom.createElement('div');
  dir.style.fontSize = '11px';
  dir.style.fontWeight = '700';
  dir.style.textAlign = 'center';
  dir.style.color = panelText;
  dir.textContent = 'dir:' + Blockly.Highlight.formatNumber_(direction) + 'deg';
  wrapper.appendChild(dir);

  return wrapper;
};

Blockly.Highlight.registerRenderer('vector', function(value) {
  var pair = Blockly.Highlight.parsePair_(value);
  if (!pair) {
    return null;
  }
  return Blockly.Highlight.makeVectorReport_(pair);
});
