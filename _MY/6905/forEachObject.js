/**
 * @providesModule forEachObject
 * @typechecks
 */

'use strict';

let hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Executes the provided `callback` once for each enumerable own property in the
 * object. The `callback` is invoked with three arguments:
 *
 *  - the property value
 *  - the property name
 *  - the object being traversed
 *
 * Properties that are added after the call to `forEachObject` will not be
 * visited by `callback`. If the values of existing properties are changed, the
 * value passed to `callback` will be the value at the time `forEachObject`
 * visits them. Properties that are deleted before being visited are not
 * visited.
 *
 * @param {?object} object
 * @param {function} callback
 * @param {*} context
 */
function forEachObject(object, callback, context) {
  for (let name in object) {
    if (hasOwnProperty.call(object, name)) {
      callback.call(context, object[name], name, object);
    }
  }
}

module.exports = forEachObject;
