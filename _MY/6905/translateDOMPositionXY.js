/**
 * @providesModule translateDOMPositionXY
 * @typechecks
 */

'use strict';

const BrowserSupportCore = require('BrowserSupportCore');

const getVendorPrefixedName = require('getVendorPrefixedName');

const TRANSFORM = getVendorPrefixedName('transform');
const BACKFACE_VISIBILITY = getVendorPrefixedName('backfaceVisibility');

const translateDOMPositionXY = (function() {
  if (BrowserSupportCore.hasCSSTransforms()) {
    const ua = global.window ? global.window.navigator.userAgent : 'UNKNOWN';
    const isSafari = (/Safari\//).test(ua) && !(/Chrome\//).test(ua);
    // It appears that Safari messes up the composition order
    // of GPU-accelerated layers
    // (see bug https://bugs.webkit.org/show_bug.cgi?id=61824).
    // Use 2D translation instead.
    if (!isSafari && BrowserSupportCore.hasCSS3DTransforms()) {
      return function(/*object*/ style, /*number*/ x, /*number*/ y) {
        style[TRANSFORM] = 'translate3d(' + x + 'px,' + y + 'px,0)';
        style[BACKFACE_VISIBILITY] = 'hidden';
      };
    } else {
      return function(/*object*/ style, /*number*/ x, /*number*/ y) {
        style[TRANSFORM] = 'translate(' + x + 'px,' + y + 'px)';
      };
    }
  } else {
    return function(/*object*/ style, /*number*/ x, /*number*/ y) {
      style.left = x + 'px';
      style.top = y + 'px';
    };
  }
})();

module.exports = translateDOMPositionXY;
