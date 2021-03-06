/**
 * @providesModule filterObject
 */

'use strict';

let hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Executes the provided `callback` once for each enumerable own property in the
 * object and constructs a new object of all the values for which `callback`
 * returns a true value. The `callback` is invoked with three arguments:
 *
 *  - the property value
 *  - the property name
 *  - the object being traversed
 *
 * Properties that are added after the call to `filterObject` will not be
 * visited by `callback`. If the values of existing properties are changed, the
 * value passed to `callback` will be the value at the time `filterObject`
 * visits them. Properties that are deleted before being visited are not
 * visited.
 *
 * @grep function objectFilter()
 * @grep function objFilter()
 *
 * @param {?object} object
 * @param {function} callback
 * @param {*} context
 * @return {?object}
 */
function filterObject(object, callback, context) {
  if (!object) {
    return null;
  }
  let result = {};
  for (let name in object) {
    if (hasOwnProperty.call(object, name) &&
        callback.call(context, object[name], name, object)) {
      result[name] = object[name];
    }
  }
  return result;
}

module.exports = filterObject;
