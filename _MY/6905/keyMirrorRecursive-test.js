/**
 * @emails oncall+jsinfra
 * @typechecks
 */

'use strict';

jest.unmock('keyMirrorRecursive');

let keyMirrorRecursive = require('keyMirrorRecursive');

describe('keyMirrorRecursive', function() {
  beforeEach(function() {
    jest.resetModuleRegistry();
  });

  it('should create an object with the correct nested keys', function() {
    let mirror = keyMirrorRecursive({
      foo: {bar: {baz: {boz: null }}}
    });
    expect(mirror.foo.bar.baz.boz).toBe('foo.bar.baz.boz');
  });

  it(
    'should create an object with recursive values matching keys provided',
    function() {
      let mirror = keyMirrorRecursive({
        foo: null,
        bar: true,
        baz: { some: 'object', another: { nested1: null, nested2: null } },
        boz: { FOO: null },
        qux: undefined
      });
      expect(mirror.foo).toBe('foo');
      expect(mirror.bar).toBe('bar');

      expect(mirror.baz.some).toBe('baz.some');
      expect(mirror.baz.another.nested1).toBe('baz.another.nested1');
      expect(mirror.baz.another.nested2).toBe('baz.another.nested2');

      expect(mirror.boz.FOO).toBe('boz.FOO');

      expect(mirror.qux).toBe('qux');
    }
  );

  it('should allow specifying a global prefix', () => {
    let mirror = keyMirrorRecursive(
      {foo: {bar: {baz: {boz: null }}}},
      'namespace'
    );
    expect(mirror.foo.bar.baz.boz).toBe('namespace.foo.bar.baz.boz');
  });

// Below tests copied without modification from keyMirror
  it('should not use properties from prototypes', function() {
    function Klass() {
      this.useMeToo = true;
    }
    Klass.prototype.doNotUse = true;
    let instance = new Klass();
    instance.useMe = true;

    let mirror = keyMirrorRecursive(instance);

    expect('doNotUse' in mirror).toBe(false);
    expect('useMe' in mirror).toBe(true);
    expect('useMeToo' in mirror).toBe(true);
  });

  it('should throw when a non-object argument is used', function() {
    [null, undefined, 0, 7, ['uno'], true, "string"].forEach(function(testVal) {
      expect(keyMirrorRecursive.bind(null, testVal)).toThrow();
    });
  });

  it('should work when "constructor" is a key', function() {
    let obj = { constructor: true };
    expect(keyMirrorRecursive.bind(null, obj)).not.toThrow();
    let mirror = keyMirrorRecursive(obj);
    expect('constructor' in mirror).toBe(true);
  });
});
