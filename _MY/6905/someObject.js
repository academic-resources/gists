/**
 * @providesModule someObject
 * @flow
 * @typechecks
 */

'use strict';

let hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Executes the provided `callback` once for each enumerable own property in the
 * object until it finds one where callback returns a truthy value. If such a
 * property is found, `someObject` immediately returns true. Otherwise, it
 * returns false.
 *
 * The `callback` is invoked with three arguments:
 *
 *  - the property value
 *  - the property name
 *  - the object being traversed
 *
 * Properties that are added after the call to `someObject` will not be
 * visited by `callback`. If the values of existing properties are changed, the
 * value passed to `callback` will be the value at the time `someObject`
 * visits them. Properties that are deleted before being visited are not
 * visited.
 */
function someObject(
  object: ?Object,
  callback: (value: any, name: string, object: Object) => any,
  context?: any,
): boolean {
  for (let name in object) {
    if (hasOwnProperty.call(object, name)) {
      if (callback.call(context, object[name], name, object)) {
        return true;
      }
    }
  }
  return false;
}

module.exports = someObject;
