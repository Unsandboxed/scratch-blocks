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
 * Highlight a single value
 * @param {value} The value to highlight
 * @param {?type} The type of the value
 */
Blockly.Highlight.highlightSingle = function highlightSingle(value, type) {
  // @todo Pick better colours
  const node = goog.dom.createElement('span');
  node.textContent = value;
  node.style = `color: ${this.Colours[type || (typeof value)] || this.Colours['not.found']};`;
  return node;
}
/**
 * Highlight a full value (This will generate the structure for objects)
 * @param {value} The value to highlight
 * @param {type} The type of the value
 */
Blockly.Highlight.highlight = function highlight(value, type) {
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

