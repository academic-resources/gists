/**
 * @providesModule flattenArray
 * @typechecks
 * @flow
 */

/**
 * Returns a flattened array that represents the DFS traversal of the supplied
 * input array. For example:
 *
 *   let deep = ["a", ["b", "c"], "d", {"e": [1, 2]}, [["f"], "g"]];
 *   let flat = flattenArray(deep);
 *   console.log(flat);
 *   > ["a", "b", "c", "d", {"e": [1, 2]}, "f", "g"];
 *
 * @see https://github.com/jonschlinkert/arr-flatten
 * @copyright 2014-2015 Jon Schlinkert
 * @license MIT
 */
function flattenArray(array: Array<any>): Array<any> {
  const result = [];
  flatten(array, result);
  return result;
}

function flatten(array: Array<any>, result: Array<any>): void {
  let length = array.length;
  let ii = 0;

  while (length--) {
    const current = array[ii++];
    if (Array.isArray(current)) {
      flatten(current, result);
    } else {
      result.push(current);
    }
  }
}

module.exports = flattenArray;
