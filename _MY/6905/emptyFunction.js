/**
 * @providesModule emptyFunction
 * @flow
 */

export type FunctionReturning<+T> = (...args: $ReadOnlyArray<mixed>) => T;

export type EmptyFunctionType = {
  (...args: $ReadOnlyArray<mixed>): void,
  thatReturns: <T>(x: T) => FunctionReturning<T>,
  thatReturnsFalse: FunctionReturning<false>,
  thatReturnsTrue: FunctionReturning<true>,
  thatReturnsNull: FunctionReturning<null>,
  thatReturnsThis: FunctionReturning<mixed>,
  thatReturnsArgument: <T>(x: T) => T,
};

function makeEmptyFunction<T>(arg: T): (...args: Array<any>) => T {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
const emptyFunction = function() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() { return this; };
emptyFunction.thatReturnsArgument = function(arg) { return arg; };

module.exports = (emptyFunction: EmptyFunctionType);
