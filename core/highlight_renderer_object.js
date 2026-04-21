goog.provide('Blockly.Highlight.RendererObject');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

/**
 * Format any value for object monitor cells.
 * @param {*} value Value to format.
 * @return {string} Cell text.
 * @private
 */
Blockly.Highlight.formatObjectCell_ = function(value) {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'undefined') {
    return 'undefined';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[object]';
    }
  }
  return String(value);
};

/**
 * Build an object monitor style visual with key/value columns.
 * @param {!Object} objectValue Object to render.
 * @return {!HTMLElement} Object monitor node.
 * @private
 */
Blockly.Highlight.makeObjectMonitor_ = function(objectValue) {
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
  wrapper.style.minWidth = '260px';
  wrapper.style.maxWidth = '360px';
  wrapper.style.border = '1px solid ' + containerBorder;
  wrapper.style.borderRadius = '6px';
  wrapper.style.background = monitorBackground;
  wrapper.style.color = panelText;
  wrapper.style.overflow = 'hidden';
  wrapper.style.fontFamily = '"Helvetica Neue", Helvetica, sans-serif';
  wrapper.style.fontSize = '0.75rem';

  var title = goog.dom.createElement('div');
  title.textContent = 'object';
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

  var headerRow = goog.dom.createElement('div');
  headerRow.style.display = 'grid';
  headerRow.style.gridTemplateColumns = 'minmax(80px, 1fr) minmax(80px, 1fr)';
  headerRow.style.columnGap = '4px';
  headerRow.style.alignItems = 'center';
  headerRow.style.padding = '3px 6px';
  headerRow.style.borderBottom = '1px solid ' + containerBorder;
  headerRow.style.fontWeight = '700';

  var keyHeading = goog.dom.createElement('span');
  keyHeading.textContent = 'key';
  keyHeading.style.textAlign = 'left';
  headerRow.appendChild(keyHeading);

  var valueHeading = goog.dom.createElement('span');
  valueHeading.textContent = 'value';
  valueHeading.style.textAlign = 'left';
  headerRow.appendChild(valueHeading);

  body.appendChild(headerRow);

  var entries = Object.entries(objectValue);
  var maxRows = 12;
  var shown = Math.min(entries.length, maxRows);
  for (var i = 0; i < shown; i++) {
    var entry = entries[i];
    var row = goog.dom.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = 'minmax(80px, 1fr) minmax(80px, 1fr)';
    row.style.columnGap = '4px';
    row.style.padding = '2px 6px';
    row.style.alignItems = 'center';

    var keyCell = goog.dom.createElement('div');
    keyCell.style.borderRadius = '4px';
    keyCell.style.border = '1px solid ' + listItemBorder;
    keyCell.style.background = listItemBackground;
    keyCell.style.color = listItemText;
    keyCell.style.minHeight = '22px';
    keyCell.style.height = '22px';
    keyCell.style.overflow = 'hidden';
    keyCell.style.textOverflow = 'ellipsis';
    keyCell.style.whiteSpace = 'pre';
    keyCell.style.padding = '3px 5px';
    keyCell.textContent = String(entry[0]);

    var valueCell = goog.dom.createElement('div');
    valueCell.style.borderRadius = '4px';
    valueCell.style.border = '1px solid ' + listItemBorder;
    valueCell.style.background = listItemBackground;
    valueCell.style.color = listItemText;
    valueCell.style.minHeight = '22px';
    valueCell.style.height = '22px';
    valueCell.style.overflow = 'hidden';
    valueCell.style.textOverflow = 'ellipsis';
    valueCell.style.whiteSpace = 'pre';
    valueCell.style.padding = '3px 5px';
    valueCell.textContent = Blockly.Highlight.formatObjectCell_(entry[1]);

    row.appendChild(keyCell);
    row.appendChild(valueCell);
    body.appendChild(row);
  }

  if (entries.length === 0) {
    var empty = goog.dom.createElement('div');
    empty.textContent = '(empty)';
    empty.style.padding = '6px';
    empty.style.textAlign = 'center';
    empty.style.color = panelText;
    body.appendChild(empty);
  } else if (entries.length > maxRows) {
    var more = goog.dom.createElement('div');
    more.textContent = '... +' + (entries.length - maxRows) + ' more';
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

  var left = goog.dom.createElement('span');
  left.textContent = '{ }';
  footer.appendChild(left);

  var size = goog.dom.createElement('span');
  size.textContent = 'entries ' + entries.length;
  footer.appendChild(size);

  var right = goog.dom.createElement('span');
  right.textContent = '=';
  footer.appendChild(right);

  wrapper.appendChild(footer);
  return wrapper;
};

Blockly.Highlight.registerRenderer('object', function(value) {
  // Temporarily disabled until object monitor UX is finalized.
  return null;
});
