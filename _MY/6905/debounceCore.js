/**
 * @providesModule debounceCore
 * @typechecks
 */

/**
 * Invokes the given callback after a specified number of milliseconds have
 * elapsed, ignoring subsequent calls.
 *
 * For example, if you wanted to update a preview after the user stops typing
 * you could do the following:
 *
 *   elem.addEventListener('keyup', debounce(this.updatePreview, 250), false);
 *
 * The returned function has a reset method which can be called to cancel a
 * pending invocation.
 *
 *   let debouncedUpdatePreview = debounce(this.updatePreview, 250);
 *   elem.addEventListener('keyup', debouncedUpdatePreview, false);
 *
 *   // later, to cancel pending calls
 *   debouncedUpdatePreview.reset();
 *
 * @param {function} func - the function to debounce
 * @param {number} wait - how long to wait in milliseconds
 * @param {*} context - optional context to invoke the function in
 * @param {?function} setTimeoutFunc - an implementation of setTimeout
 *  if nothing is passed in the default setTimeout function is used
  * @param {?function} clearTimeoutFunc - an implementation of clearTimeout
 *  if nothing is passed in the default clearTimeout function is used
 */
function debounce(func, wait, context, setTimeoutFunc, clearTimeoutFunc) {
  setTimeoutFunc = setTimeoutFunc || setTimeout;
  clearTimeoutFunc = clearTimeoutFunc || clearTimeout;
  let timeout;

  function debouncer(...args) {
    debouncer.reset();

    const callback = function() {
      func.apply(context, args);
    };
    callback.__SMmeta = func.__SMmeta;
    timeout = setTimeoutFunc(callback, wait);
  }

  debouncer.reset = function() {
    clearTimeoutFunc(timeout);
  };

  return debouncer;
}

module.exports = debounce;
