/**
 * @providesModule getElementRect
 * @typechecks
 */

const containsNode = require('containsNode');

/**
 * Gets an element's bounding rect in pixels relative to the viewport.
 *
 * @param {DOMElement} elem
 * @return {object}
 */
function getElementRect(elem) {
  const docElem = elem.ownerDocument.documentElement;

  // FF 2, Safari 3 and Opera 9.5- do not support getBoundingClientRect().
  // IE9- will throw if the element is not in the document.
  if (!('getBoundingClientRect' in elem) || !containsNode(docElem, elem)) {
    return {
      left:   0,
      right:  0,
      top:    0,
      bottom: 0
    };
  }

  // Subtracts clientTop/Left because IE8- added a 2px border to the
  // <html> element (see http://fburl.com/1493213). IE 7 in
  // Quicksmode does not report clientLeft/clientTop so there
  // will be an unaccounted offset of 2px when in quirksmode
  const rect = elem.getBoundingClientRect();

  return {
    left:   Math.round(rect.left) - docElem.clientLeft,
    right:  Math.round(rect.right) - docElem.clientLeft,
    top:    Math.round(rect.top) - docElem.clientTop,
    bottom: Math.round(rect.bottom) - docElem.clientTop
  };
}

module.exports = getElementRect;
