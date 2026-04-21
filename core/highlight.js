/**
 * @fileoverview Highlighting methods.
 * These methods are specific to highlighting
 */

/**
 * @name Blockly.Highlight
 * @namespace
 **/
goog.provide('Blockly.Highlight');

goog.require('goog.dom');

/**
 * A object for all the colours used by the highlighter
 */
Blockly.Highlight.Colours = {
  'not.found': '#ffffff',
  // Text part definitions
  'text': '#ffffff',
  'Infinity': '#9966ff',
  'null': '#898196',
  'object.openParenth': '#cf63cf',
  'object.closeParenth': '#cf63cf',
  'object.openBracket': '#cf63cf',
  'object.closeBracket': '#cf63cf',
  // typeof definitions
  // Objects + Arrays can be skipped as they have custom definitions
  'number': '#9966ff',
  'string': '#5cb1d6',
  'boolean': '#ff8c1a',
  // @todo Check if this is even needed smh
  'undefined': '#898196',
};

/**
 * Renderers keyed by semantic visual report type.
 * @type {!Object<string, function(*):?Node>}
 */
Blockly.Highlight.Renderers = Object.create(null);

/**
 * Register a semantic renderer for visual reports.
 * @param {string} type Semantic type.
 * @param {function(*):?Node} renderer Renderer callback.
 */
Blockly.Highlight.registerRenderer = function(type, renderer) {
  if (!type || typeof renderer !== 'function') {
    return;
  }
  Blockly.Highlight.Renderers[type] = renderer;
};

/**
 * Try to render a semantic visual report type.
 * @param {*} value Value to render.
 * @param {string} type Semantic type.
 * @return {?Node} Rendered node or null.
 * @private
 */
Blockly.Highlight.renderSemantic_ = function(value, type) {
  if (!type) {
    return null;
  }
  var renderer = Blockly.Highlight.Renderers[type];
  if (!renderer) {
    return null;
  }
  try {
    return renderer(value) || null;
  } catch (e) {
    return null;
  }
};

/**
 * Build a compact field-like report bubble.
 * @param {string} text Bubble text.
 * @param {string=} opt_borderColor Border color.
 * @param {string=} opt_textColor Text color.
 * @param {string=} opt_backgroundColor Background color.
 * @return {!HTMLElement} Bubble node.
 * @private
 */
Blockly.Highlight.makeBubble_ = function(text, opt_borderColor, opt_textColor, opt_backgroundColor) {
  var bubble = goog.dom.createElement('span');
  bubble.style.display = 'inline-block';
  bubble.style.padding = '2px 8px';
  bubble.style.borderRadius = '999px';
  bubble.style.border = '1px solid ' + (opt_borderColor || 'rgba(255, 255, 255, 0.45)');
  bubble.style.background = opt_backgroundColor || 'rgba(111, 140, 255, 0.15)';
  bubble.style.color = opt_textColor || '#1f2330';
  bubble.style.fontWeight = '600';
  bubble.style.fontSize = '11px';
  bubble.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  bubble.textContent = text;
  return bubble;
};

/**
 * Format a number for compact display.
 * @param {number} value Numeric value.
 * @return {string} Formatted value.
 * @private
 */
Blockly.Highlight.formatNumber_ = function(value) {
  if (!isFinite(value)) {
    return String(value);
  }
  return Number(value.toFixed(2)).toString();
};

/**
 * Parse a pair value from array/object/string forms.
 * @param {*} value Candidate value.
 * @return {{x:number, y:number}|null} Parsed pair.
 * @private
 */
Blockly.Highlight.parsePair_ = function(value) {
  if (Array.isArray(value) && value.length >= 2) {
    var ax = Number(value[0]);
    var ay = Number(value[1]);
    if (isFinite(ax) && isFinite(ay)) {
      return {x: ax, y: ay};
    }
  }
  if (value && typeof value === 'object') {
    var ox = Number(value.x);
    var oy = Number(value.y);
    if (isFinite(ox) && isFinite(oy)) {
      return {x: ox, y: oy};
    }
  }
  if (typeof value === 'string') {
    var match = value.trim().match(/^\[?\s*([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*[, ]\s*([+-]?(?:\d+\.?\d*|\d*\.\d+))\s*\]?$/);
    if (match) {
      var sx = Number(match[1]);
      var sy = Number(match[2]);
      if (isFinite(sx) && isFinite(sy)) {
        return {x: sx, y: sy};
      }
    }
  }
  return null;
};

/**
 * Return true when the string is an image Data URI.
 * @param {*} value Candidate value.
 * @return {boolean} True when image data URI.
 * @private
 */
Blockly.Highlight.isImageDataUri_ = function(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return /^data:image\/[a-zA-Z0-9.+-]+(?:;[a-zA-Z0-9=._:+-]+)*,/.test(value.trim());
};

/**
 * Read a Blockly colour token with fallback.
 * @param {string} name Colour token name.
 * @param {string} fallback Fallback colour.
 * @return {string} Colour value.
 * @private
 */
Blockly.Highlight.getColour_ = function(name, fallback) {
  return (Blockly.Colours && Blockly.Colours[name]) || fallback;
};

/**
 * Convert a hex colour into RGB channels.
 * @param {string} hex Hex colour.
 * @return {{r:number,g:number,b:number}|null} RGB values.
 * @private
 */
Blockly.Highlight.hexToRgb_ = function(hex) {
  if (typeof hex !== 'string') {
    return null;
  }
  var normalized = hex.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return null;
  }
  if (normalized.length === 4) {
    normalized = '#' +
        normalized[1] + normalized[1] +
        normalized[2] + normalized[2] +
        normalized[3] + normalized[3];
  }
  var n = parseInt(normalized.slice(1), 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  };
};

/**
 * Choose white or dark text based on background luminance.
 * @param {string} background Background colour.
 * @return {string} Text colour.
 * @private
 */
Blockly.Highlight.contrastText_ = function(background) {
  var rgb = Blockly.Highlight.hexToRgb_(background);
  if (!rgb) {
    return Blockly.Highlight.getColour_('blackText', '#575E75');
  }
  var luminance = ((0.299 * rgb.r) + (0.587 * rgb.g) + (0.114 * rgb.b)) / 255;
  return luminance > 0.6 ? '#2f3b52' : '#ffffff';
};

/**
 * Make an rgba color from a hex token with fallback.
 * @param {string} color Source color.
 * @param {number} alpha Alpha channel 0..1.
 * @param {string} fallback Fallback rgba string.
 * @return {string} rgba color.
 * @private
 */
Blockly.Highlight.withAlpha_ = function(color, alpha, fallback) {
  var rgb = Blockly.Highlight.hexToRgb_(color);
  if (!rgb) {
    return fallback;
  }
  return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
};

/**
 * Build a compact list-monitor style visual for arrays.
 * @param {!Array<*>} items Array items.
 * @return {!HTMLElement} List monitor node.
 * @private
 */
Blockly.Highlight.makeListMonitor_ = function(items) {
  var headerFooterBackground = Blockly.Highlight.getColour_('valueReportBackground', '#FFFFFF');
  var monitorBackground = Blockly.Highlight.getColour_('toolboxSelected', '#E9EEF2');
  var panelBorder = Blockly.Highlight.getColour_('valueReportBorder', '#AAAAAA');
  var panelText = Blockly.Highlight.getColour_('blackText', '#575E75');
  var listBackground = monitorBackground;
  var listItemBackground = (Blockly.Colours && Blockly.Colours.data_lists && Blockly.Colours.data_lists.primary) || '#FF661A';
  var listItemBorder = Blockly.Highlight.withAlpha_(
      Blockly.Highlight.getColour_('blackText', '#575E75'), 0.22, 'rgba(0,0,0,0.2)');
  var listItemText = Blockly.Highlight.getColour_('text', '#FFFFFF');
  var containerBorder = Blockly.Highlight.withAlpha_(
      Blockly.Highlight.getColour_('blackText', '#575E75'), 0.25, panelBorder);

  var wrapper = goog.dom.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.minWidth = '220px';
  wrapper.style.maxWidth = '320px';
  wrapper.style.border = '1px solid ' + containerBorder;
  wrapper.style.borderRadius = '6px';
  wrapper.style.background = monitorBackground;
  wrapper.style.color = panelText;
  wrapper.style.overflow = 'hidden';
  wrapper.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  wrapper.style.fontSize = '0.75rem';

  var title = goog.dom.createElement('div');
  title.textContent = 'list';
  title.style.padding = '3px';
  title.style.textAlign = 'center';
  title.style.fontWeight = '700';
  title.style.background = headerFooterBackground;
  title.style.borderBottom = '1px solid ' + containerBorder;
  title.style.color = panelText;
  wrapper.appendChild(title);

  var body = goog.dom.createElement('div');
  body.style.background = listBackground;
  body.style.maxHeight = '150px';
  body.style.overflowY = 'auto';
  body.style.padding = '0';
  wrapper.appendChild(body);

  var maxRows = 12;
  var shown = Math.min(items.length, maxRows);
  for (var i = 0; i < shown; i++) {
    var row = goog.dom.createElement('div');
    row.style.display = 'flex';
    row.style.flexDirection = 'row';
    row.style.justifyContent = 'space-around';
    row.style.alignItems = 'center';
    row.style.padding = '2px';
    row.style.flexShrink = '0';

    var index = goog.dom.createElement('span');
    index.textContent = String(i + 1);
    index.style.minWidth = '14px';
    index.style.textAlign = 'right';
    index.style.color = panelText;
    index.style.fontWeight = '700';
    index.style.margin = '0 3px';
    row.appendChild(index);

    var cell = goog.dom.createElement('div');
    cell.style.minWidth = '40px';
    cell.style.textAlign = 'left';
    cell.style.margin = '0 3px';
    cell.style.flex = '1';
    cell.style.borderRadius = '4px';
    cell.style.border = '1px solid ' + listItemBorder;
    cell.style.background = listItemBackground;
    cell.style.padding = '0';
    cell.style.color = listItemText;
    cell.style.minHeight = '22px';
    cell.style.height = '22px';

    var valueInner = goog.dom.createElement('div');
    valueInner.style.padding = '3px 5px';
    valueInner.style.minHeight = '22px';
    valueInner.style.overflow = 'hidden';
    valueInner.style.textOverflow = 'ellipsis';
    valueInner.style.whiteSpace = 'pre';

    var item = items[i];
    if (item === null) {
      valueInner.textContent = 'null';
    } else if (typeof item === 'undefined') {
      valueInner.textContent = 'undefined';
    } else if (typeof item === 'object') {
      try {
        valueInner.textContent = JSON.stringify(item);
      } catch (e) {
        valueInner.textContent = '[object]';
      }
    } else {
      valueInner.textContent = String(item);
    }
    cell.appendChild(valueInner);
    row.appendChild(cell);
    body.appendChild(row);
  }

  if (items.length === 0) {
    var empty = goog.dom.createElement('div');
    empty.textContent = '(empty)';
    empty.style.padding = '6px';
    empty.style.textAlign = 'center';
    empty.style.color = panelText;
    body.appendChild(empty);
  } else if (items.length > maxRows) {
    var more = goog.dom.createElement('div');
    more.textContent = '... +' + (items.length - maxRows) + ' more';
    more.style.padding = '2px 8px 6px';
    more.style.textAlign = 'center';
    more.style.color = panelText;
    body.appendChild(more);
  }

  var footer = goog.dom.createElement('div');
  footer.style.background = headerFooterBackground;
  footer.style.display = 'flex';
  footer.style.flexDirection = 'row';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.padding = '3px';
  footer.style.borderTop = '1px solid ' + containerBorder;
  footer.style.color = panelText;
  footer.style.fontWeight = '700';

  var add = goog.dom.createElement('span');
  add.textContent = '+';
  footer.appendChild(add);

  var length = goog.dom.createElement('span');
  length.textContent = 'length ' + items.length;
  footer.appendChild(length);

  var resize = goog.dom.createElement('span');
  resize.textContent = '=';
  footer.appendChild(resize);
  wrapper.appendChild(footer);

  return wrapper;
};

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

/**
 * Highlight a single value
 * @param {value} The value to highlight
 * @param {?type} The type of the value
 */
Blockly.Highlight.highlightSingle = function highlightSingle(value, type) {
  // @todo Pick better colours
  const node = goog.dom.createElement('span');
  if (value == 0 && (typeof value == 'number') && (1 / value) < 0) {
    node.textContent = '-0';
  } else {
    node.textContent = value;
  }
  node.style = `color: ${this.Colours[type || (typeof value)] || this.Colours['not.found']};`;
  return node;
}
/**
 * Highlight a full value (This will generate the structure for objects)
 * @param {value} The value to highlight
 * @param {type} The type of the value
 */
Blockly.Highlight.highlight = function highlight(value, type) {
  if ((type === 'string' || typeof type === 'undefined') && Blockly.Highlight.isImageDataUri_(value)) {
    var imageNode = Blockly.Highlight.renderSemantic_(value, 'image');
    if (imageNode) {
      return imageNode;
    }
  }

  var semanticNode = Blockly.Highlight.renderSemantic_(value, type);
  if (semanticNode) {
    return semanticNode;
  }

  if (type === 'object') {
    if (Array.isArray(value)) {
      var pairArray = Blockly.Highlight.parsePair_(value);
      if (pairArray) {
        var vectorNode = Blockly.Highlight.renderSemantic_(value, 'vector');
        if (vectorNode) {
          return vectorNode;
        }
      }
      var arrayNode = Blockly.Highlight.renderSemantic_(value, 'array');
      if (arrayNode) {
        return arrayNode;
      }
    }
    var inferredPair = Blockly.Highlight.parsePair_(value);
    if (inferredPair) {
      return Blockly.Highlight.makeBubble_(
          Blockly.Highlight.formatNumber_(inferredPair.x) + ', ' +
          Blockly.Highlight.formatNumber_(inferredPair.y),
          '#6f8cff');
    }
  }

  // @todo Should we do what JSON.parse does and just delete these values?
  if (value === undefined) {
    value = 'null';
    type = 'undefined';
  } else if (value === null) {
    value = 'null';
    type = 'null';
  } else if (value === Infinity) {
    value = 'Infinity';
    type = 'Infinity';
  }
  if (type === 'object' && typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch(err) {
      // @todo Maybe dont do this?
      value = 'undefined';
    }
  }
  let node = goog.dom.createElement('span');
  if (type === 'object' && typeof node === 'object') {
    if (Array.isArray(value)) {
      const valueCount = value.length, valueCountComma = valueCount - 1;
      node.appendChild(this.highlightSingle('[', 'object.openBracket'));
      for (let i = 0; i < valueCount; i++) {
        let item = value[i];
        if (typeof item === 'string') item = `"${item.replaceAll('"', '\\"')}"`;
        node.appendChild(this.highlight(item, typeof item));
        if (i < valueCountComma) node.appendChild(this.highlightSingle(',', 'text'));
      }
      node.appendChild(this.highlightSingle(']', 'object.closeBracket'));
    } else {
      node.appendChild(this.highlightSingle('{', 'object.openParenth'));
      const entrys = Object.entries(value), entryCount = entrys.length, entryCountComma = entryCount - 1;
      for (let i = 0; i < entryCount; i++) {
        const entry = entrys[i];
        if (typeof entry[0] === 'string') entry[0] = `"${entry[0].replaceAll('"', '\\"')}"`;
        if (typeof entry[1] === 'string') entry[1] = `"${entry[1].replaceAll('"', '\\"')}"`;
        node.appendChild(this.highlight(entry[0], typeof entry[0]));
        node.appendChild(this.highlightSingle(': ', 'text'));
        node.appendChild(this.highlight(entry[1], typeof entry[1]));
        if (i < entryCountComma) node.appendChild(this.highlightSingle(',', 'text'));
      }
      node.appendChild(this.highlightSingle('}', 'object.closeParenth'));
    }
  } else node.appendChild(this.highlightSingle(value, type));
  return node;
};

Blockly.Highlight.registerRenderer('vector', function(value) {
  var pair = Blockly.Highlight.parsePair_(value);
  if (!pair) {
    return null;
  }
  return Blockly.Highlight.makeVectorReport_(pair);
});

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

Blockly.Highlight.registerRenderer('color', function(value) {
  var color = (typeof value === 'string') ? value.trim() : null;
  if (!color) {
    return null;
  }
  var wrapper = goog.dom.createElement('span');
  wrapper.style.display = 'inline-flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';

  var swatch = goog.dom.createElement('span');
  swatch.style.display = 'inline-block';
  swatch.style.width = '12px';
  swatch.style.height = '12px';
  swatch.style.borderRadius = '50%';
  swatch.style.border = '1px solid rgba(255,255,255,0.55)';
  swatch.style.background = color;
  wrapper.appendChild(swatch);
  wrapper.appendChild(Blockly.Highlight.makeBubble_(color, '#bbbbbb', '#1f2330', '#ffffff'));
  return wrapper;
});

Blockly.Highlight.registerRenderer('array', function(value) {
  if (!Array.isArray(value)) {
    return null;
  }
  return Blockly.Highlight.makeListMonitor_(value);
});

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

