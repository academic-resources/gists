/**
 * @providesModule getDocumentScrollElement
 * @typechecks
 */

'use strict';

const isWebkit =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.indexOf('AppleWebKit') > -1;

/**
 * Gets the element with the document scroll properties such as `scrollLeft` and
 * `scrollHeight`. This may differ across different browsers.
 *
 * NOTE: The return value can be null if the DOM is not yet ready.
 *
 * @param {?DOMDocument} doc Defaults to current document.
 * @return {?DOMElement}
 */
function getDocumentScrollElement(doc) {
  doc = doc || document;
  if (doc.scrollingElement) {
    return doc.scrollingElement;
  }
  return !isWebkit && doc.compatMode === 'CSS1Compat' ?
    doc.documentElement :
    doc.body;
}

module.exports = getDocumentScrollElement;
