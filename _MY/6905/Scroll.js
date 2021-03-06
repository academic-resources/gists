/**
 * @providesModule Scroll
 */

/**
 * @param {DOMElement} element
 * @param {DOMDocument} doc
 * @return {boolean}
 */
function _isViewportScrollElement(element, doc) {
  return !!doc &&
    (element === doc.documentElement || element === doc.body);
}

/**
 * Scroll Module. This class contains 4 simple static functions
 * to be used to access Element.scrollTop/scrollLeft properties.
 * To solve the inconsistencies between browsers when either
 * document.body or document.documentElement is supplied,
 * below logic will be used to alleviate the issue:
 *
 * 1. If 'element' is either 'document.body' or 'document.documentElement,
 *    get whichever element's 'scroll{Top,Left}' is larger.
 * 2. If 'element' is either 'document.body' or 'document.documentElement',
 *    set the 'scroll{Top,Left}' on both elements.
 */

const Scroll = {
  /**
   * @param {DOMElement} element
   * @return {number}
   */
  getTop: function(element) {
    const doc = element.ownerDocument;
    return _isViewportScrollElement(element, doc) ?
      // In practice, they will either both have the same value,
      // or one will be zero and the other will be the scroll position
      // of the viewport. So we can use `X || Y` instead of `Math.max(X, Y)`
      (doc.body.scrollTop || doc.documentElement.scrollTop) :
      element.scrollTop;
  },

  /**
   * @param {DOMElement} element
   * @param {number} newTop
   */
  setTop: function(element, newTop) {
    const doc = element.ownerDocument;
    if (_isViewportScrollElement(element, doc)) {
      doc.body.scrollTop = doc.documentElement.scrollTop = newTop;
    } else {
      element.scrollTop = newTop;
    }
  },

  /**
   * @param {DOMElement} element
   * @return {number}
   */
  getLeft: function(element) {
    const doc = element.ownerDocument;
    return _isViewportScrollElement(element, doc) ?
      (doc.body.scrollLeft || doc.documentElement.scrollLeft) :
      element.scrollLeft;
  },

  /**
   * @param {DOMElement} element
   * @param {number} newLeft
   */
  setLeft: function(element, newLeft) {
    const doc = element.ownerDocument;
    if (_isViewportScrollElement(element, doc)) {
      doc.body.scrollLeft = doc.documentElement.scrollLeft = newLeft;
    } else {
      element.scrollLeft = newLeft;
    }
  },
};

module.exports = Scroll;
