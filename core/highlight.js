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
  'not.found': '#ffffff', // todo: needs to be visible in light mode.
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
  var defaultBorder = Blockly.Highlight.withAlpha_(
      Blockly.Highlight.getColour_('blackText', '#575E75'),
      0.3,
      'rgba(127,127,127,0.35)');
  var defaultBackground = Blockly.Highlight.withAlpha_(
      Blockly.Highlight.getColour_('toolboxSelected', '#6f8cff'),
      0.25,
      'rgba(111,140,255,0.15)');
    var defaultText = Blockly.Highlight.getColour_(
      'toolboxText',
      Blockly.Highlight.getColour_('blackText', '#575E75'));

  var bubble = goog.dom.createElement('span');
  bubble.style.display = 'inline-block';
  bubble.style.padding = '2px 8px';
  bubble.style.borderRadius = '999px';
  bubble.style.border = '1px solid ' + (opt_borderColor || defaultBorder);
  bubble.style.background = opt_backgroundColor || defaultBackground;
  bubble.style.color = opt_textColor || defaultText;
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
 * Highlight a single value
 * @param {value} The value to highlight
 * @param {?type} The type of the value
 */
Blockly.Highlight.highlightSingle = function highlightSingle(value, type) {
  // @todo Pick better colours
  var node = goog.dom.createElement('span');
  if (value == 0 && (typeof value == 'number') && (1 / value) < 0) {
    node.textContent = '-0';
  } else {
    node.textContent = value;
  }
  node.style = 'color: ' +
      (this.Colours[type || (typeof value)] || this.Colours['not.found']) + ';';
  return node;
}
/**
 * Highlight a full value (This will generate the structure for objects)
 * @param {value} The value to highlight
 * @param {type} The type of the value
 */
Blockly.Highlight.highlight = function highlight(value, type) {
  // NOTE: No renderSemantic_ calls here — this function is used recursively
  // for nested array items and object properties. Semantic renderers (which can
  // produce large DOM widgets) are only invoked by highlightVisualReport at the
  // top level of a visual report popup.

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
  var node = goog.dom.createElement('span');
  if (type === 'object' && typeof node === 'object') {
    if (Array.isArray(value)) {
      var valueCount = value.length, valueCountComma = valueCount - 1;
      node.appendChild(this.highlightSingle('[', 'object.openBracket'));
      for (var i = 0; i < valueCount; i++) {
        var item = value[i];
        if (typeof item === 'string') item = '"' + item.replaceAll('"', '\\"') + '"';
        node.appendChild(this.highlight(item, typeof item));
        if (i < valueCountComma) node.appendChild(this.highlightSingle(',', 'text'));
      }
      node.appendChild(this.highlightSingle(']', 'object.closeBracket'));
    } else {
      node.appendChild(this.highlightSingle('{', 'object.openParenth'));
      var entrys = Object.entries(value), entryCount = entrys.length, entryCountComma = entryCount - 1;
      for (var i = 0; i < entryCount; i++) {
        var entry = entrys[i];
        if (typeof entry[0] === 'string') entry[0] = '"' + entry[0].replaceAll('"', '\\"') + '"';
        if (typeof entry[1] === 'string') entry[1] = '"' + entry[1].replaceAll('"', '\\"') + '"';
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

/**
 * Highlight a value for a top-level visual report popup.
 * Unlike `highlight`, this entry point enforces display rules for semantic
 * types so they never inject custom renderer DOM inline:
 *   - 'array' type  → rendered as plain JS-array text (not the list monitor).
 *   - Any other registered semantic type → displayed as <typeName>.
 *   - All other types pass through to `highlight` unchanged.
 * @param {*} value The value to display.
 * @param {string} type The visual report type.
 * @return {!Node} The rendered node.
 */
Blockly.Highlight.highlightVisualReport = function highlightVisualReport(value, type) {
  // Image data URIs — render inline as an image, regardless of declared type.
  if ((type === 'string' || typeof type === 'undefined') && Blockly.Highlight.isImageDataUri_(value)) {
    var imageNode = Blockly.Highlight.renderSemantic_(value, 'image');
    if (imageNode) return imageNode;
  }

  // For object-typed arrays, try the array semantic renderer explicitly —
  // typeof [] === 'object' so the type coming from the VM will be 'object'.
  if ((type === 'array' || type === 'object') && Array.isArray(value)) {
    var arrayNode = Blockly.Highlight.renderSemantic_(value, 'array');
    if (arrayNode) return arrayNode;
  }

  // For all other types, try the registered semantic renderer first.
  // This is what makes script, vector, color, etc. show their visual UI.
  var semanticNode = Blockly.Highlight.renderSemantic_(value, type);
  if (semanticNode) return semanticNode;

  // object type may have a non-array semantic renderer too.
  if (type === 'object' && !Array.isArray(value)) {
    var objectNode = Blockly.Highlight.renderSemantic_(value, 'object');
    if (objectNode) return objectNode;
  }

  // Fall through to plain recursive rendering.
  return Blockly.Highlight.highlight(value, type);
};

// Semantic renderers are registered in dedicated files:
// - highlight_renderer_array.js
// - highlight_renderer_vector.js
// - highlight_renderer_position.js
// - highlight_renderer_color.js
// - highlight_renderer_image.js

