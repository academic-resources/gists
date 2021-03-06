/**
 * @emails oncall+jsinfra
 */

'use strict';

jest.unmock('mapObject');

let mapObject = require('mapObject');

describe('mapObject', () => {
  let mockObject;
  let mockCallback;

  beforeEach(() => {
    mockObject = {
      foo: 1,
      bar: 2,
      baz: 3
    };
    mockCallback = jest.fn();
  });

  it('should accept null', () => {
    expect(mapObject(null, mockCallback)).toBeNull();
    expect(mockCallback).not.toBeCalled();
  });

  it('should return value to create copy', () => {
    let mapped = mapObject(mockObject, mockCallback.mockImplementation(
      value => value
    ));

    expect(mapped).not.toBe(mockObject);
    expect(mapped).toEqual(mockObject);
  });

  it('should always retain keys', () => {
    let mapped = mapObject(mockObject, mockCallback.mockImplementation(
      () => null
    ));

    expect(mapped).toEqual({
      foo: null,
      bar: null,
      baz: null
    });
  });

  it('should map values', () => {
    let mapped = mapObject(mockObject, mockCallback.mockImplementation(
      value => value * value
    ));

    expect(mapped).toEqual({
      foo: 1,
      bar: 4,
      baz: 9
    });
  });

  it('should map keys', () => {
    let mapped = mapObject(mockObject, mockCallback.mockImplementation(
      (value, key) => key
    ));

    expect(mapped).toEqual({
      foo: 'foo',
      bar: 'bar',
      baz: 'baz'
    });
  });
});
