goog.provide('Blockly.Highlight.RendererArray');

goog.require('Blockly.Highlight');
goog.require('goog.dom');

/**
 * Build a compact list-monitor style visual for arrays.
 * @param {!Array<*>} items Array items.
 * @return {!HTMLElement} List monitor node.
 * @private
 */
Blockly.Highlight.makeListMonitor_ = function(items) {
  var headerFooterBackground = '#FFFFFF';
  var monitorBackground = '#E9EEF2';
  var panelBorder = '#AAAAAA';
  var panelText = '#575E75';
  var listBackground = monitorBackground;
  var listItemBackground = (Blockly.Colours && Blockly.Colours.data_lists &&
      Blockly.Colours.data_lists.primary) || '#FF661A';
  var listItemBorder = Blockly.Highlight.withAlpha_(
      '#575E75', 0.22, 'rgba(0,0,0,0.2)');
  var listItemText = '#FFFFFF';
  var containerBorder = Blockly.Highlight.withAlpha_(
      '#575E75', 0.25, panelBorder);

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

Blockly.Highlight.registerRenderer('array', function(value) {
  if (!Array.isArray(value)) {
    return null;
  }
  return Blockly.Highlight.makeListMonitor_(value);
});
