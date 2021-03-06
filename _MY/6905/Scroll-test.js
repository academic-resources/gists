/**
 * @emails oncall+ui_infra
 */

jest.unmock('Scroll');

let Scroll = require('Scroll');

describe('Scroll', function() {
  let SET_TEST_VALUE = 150;
  let GET_TEST_VALUE = 200;

  beforeEach(function() {
    jest.resetModuleRegistry();
  });

  describe('Scroll.{get, set}{Top, Left}', function() {
    let setTopSpyFunc;
    let getTopSpyFunc;
    let setLeftSpyFunc;
    let getLeftSpyFunc;
    let scrollTopDescriptor;
    let scrollLeftDescriptor;

    beforeEach(function() {
      scrollTopDescriptor = Object.getOwnPropertyDescriptor(
        Element.prototype,
        'scrollTop'
      );

      Object.defineProperty(Element.prototype, 'scrollTop', {
        configurable: true,
        set: setTopSpyFunc = jasmine.createSpy(),
        get: getTopSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
      });

      scrollLeftDescriptor = Object.getOwnPropertyDescriptor(
        Element.prototype,
        'scrollLeft'
      );

      Object.defineProperty(Element.prototype, 'scrollLeft', {
        configurable: true,
        set: setLeftSpyFunc = jasmine.createSpy(),
        get: getLeftSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
      });
    });

    afterEach(function() {
      if (scrollTopDescriptor) {
        Object.defineProperty(
          Element.prototype,
          'scrollTop',
          scrollTopDescriptor
        );
      }
      if (scrollLeftDescriptor) {
        Object.defineProperty(
          Element.prototype,
          'scrollLeft',
          scrollLeftDescriptor
        );
      }
    });

    let defineObjectScrollProperties = function() {
      Object.defineProperty(Object.prototype, 'scrollTop', {
        configurable: true,
        set: setTopSpyFunc = jasmine.createSpy(),
        get: getTopSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
      });

      Object.defineProperty(Object.prototype, 'scrollLeft', {
        configurable: true,
        set: setLeftSpyFunc = jasmine.createSpy(),
        get: getLeftSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
      });
    };

    let deleteObjectScrollProperties = function() {
      delete Object.scrollTop;
      delete Object.scrollLeft;
    };

    let testSetFunc = function(el) {
      Scroll.setTop(el, SET_TEST_VALUE);

      expect(setTopSpyFunc.calls.count()).toBe(1);
      expect(setTopSpyFunc.calls.first().args[0]).toBe(SET_TEST_VALUE);

      Scroll.setLeft(el, SET_TEST_VALUE);

      expect(setLeftSpyFunc.calls.count()).toBe(1);
      expect(setLeftSpyFunc.calls.first().args[0]).toBe(SET_TEST_VALUE);
    };

    let testGetFunc = function(el) {
      let topValue = Scroll.getTop(el);
      expect(getTopSpyFunc.calls.count()).toBe(1);
      expect(topValue).toBe(GET_TEST_VALUE);

      let leftValue = Scroll.getLeft(el);
      expect(getLeftSpyFunc.calls.count()).toBe(1);
      expect(leftValue).toBe(GET_TEST_VALUE);
    };

    it('sets scroll value for element', function() {
      let el = document.createElement('div');
      testSetFunc(el);
    });

    it('gets scroll value for element', function() {
      let el = document.createElement('div');
      testGetFunc(el);
    });

    it('still gets scrollTop/Left values if non-Element is passed in', () => {
      defineObjectScrollProperties();
      let el = {};
      testGetFunc(el);
      deleteObjectScrollProperties();
    });

    it('still sets scrollTop/Left values if non-Element is passed in', () => {
      defineObjectScrollProperties();
      let el = {};
      testSetFunc(el);
      deleteObjectScrollProperties();
    });
  });

  describe('Scroll.{get, set}{Top, Left}({body})', function() {
    let setTopSpyFunc;
    let getTopSpyFunc;
    let setLeftSpyFunc;
    let getLeftSpyFunc;

    beforeEach(function() {
      Object.defineProperty(document.body, 'scrollTop', {
        set: setTopSpyFunc = jasmine.createSpy(),
        get: getTopSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
        // scrollTop property didn't exist
        // Rather than setting to undefined at the end,
        // delete the property as if it didn't exist.
        // 'configurable' flag lets us delete the property.
        configurable: true,
      });

      Object.defineProperty(document.body, 'scrollLeft', {
        set: setLeftSpyFunc = jasmine.createSpy(),
        get: getLeftSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
        configurable: true,
      });
    });

    afterEach(function() {
      delete document.body.scrollTop;
      delete document.body.scrollLeft;
    });

    it('gets same scroll values ' +
        'when either body/documentElement is provided', function() {
      let bodyValue = Scroll.getTop(document.body);
      let docElValue = Scroll.getTop(document.documentElement);

      expect(getTopSpyFunc.calls.count()).toBe(2);
      expect(bodyValue).toBe(docElValue);
      expect(bodyValue).toBe(GET_TEST_VALUE);

      bodyValue = Scroll.getLeft(document.body);
      docElValue = Scroll.getLeft(document.documentElement);

      expect(getLeftSpyFunc.calls.count()).toBe(2);
      expect(bodyValue).toBe(docElValue);
      expect(bodyValue).toBe(GET_TEST_VALUE);
    });

    it('sets same scrollTop ' +
       'when either body/documentElement is provided', function() {
      let setTopDocElSpyFunc;
      Object.defineProperty(document.documentElement, 'scrollTop', {
        set: setTopDocElSpyFunc = jasmine.createSpy(),
        configurable: true,
      });
      Scroll.setTop(document.body, SET_TEST_VALUE);

      expect(setTopSpyFunc.calls.count())
        .toBe(setTopDocElSpyFunc.calls.count());
      expect(setTopSpyFunc.calls.first().args[0])
        .toBe(setTopDocElSpyFunc.calls.first().args[0]);
      expect(setTopSpyFunc.calls.first().args[0]).toBe(SET_TEST_VALUE);

      delete document.documentElement.scrollTop;
    });

    it('sets same scrollLeft ' +
       'when either body/documentElement is provided', function() {
      let setLeftDocElSpyFunc;
      Object.defineProperty(document.documentElement, 'scrollLeft', {
        set: setLeftDocElSpyFunc = jasmine.createSpy(),
        configurable: true,
      });
      Scroll.setLeft(document.body, SET_TEST_VALUE);

      expect(setLeftSpyFunc.calls.count())
        .toBe(setLeftDocElSpyFunc.calls.count());
      expect(setLeftSpyFunc.calls.first().args[0])
        .toBe(setLeftDocElSpyFunc.calls.first().args[0]);
      expect(setLeftSpyFunc.calls.first().args[0]).toBe(SET_TEST_VALUE);

      delete document.documentElement.scrollLeft;
    });
  });

  describe('Scroll.{get, set}{Top, Left}({documentElement})', function() {
    let setTopSpyFunc;
    let getTopSpyFunc;
    let setLeftSpyFunc;
    let getLeftSpyFunc;

    beforeEach(function() {
      Object.defineProperty(document.documentElement, 'scrollTop', {
        set: setTopSpyFunc = jasmine.createSpy(),
        get: getTopSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
        configurable: true,
      });

      Object.defineProperty(document.documentElement, 'scrollLeft', {
        set: setLeftSpyFunc = jasmine.createSpy(),
        get: getLeftSpyFunc = jasmine.createSpy().and.returnValue(
          GET_TEST_VALUE
        ),
        configurable: true,
      });
    });

    afterEach(function() {
      delete document.documentElement.scrollTop;
      delete document.documentElement.scrollLeft;
    });

    it('gets same scroll values when documentElement is provided', function() {
      const body = document.body;
      Object.defineProperty(document, 'body', {
        configurable: true,
        value: document.documentElement,
      });

      let docElValue = Scroll.getTop(document.documentElement);
      let bodyValue  = Scroll.getTop(document.body);

      expect(getTopSpyFunc.calls.count()).toBe(2);
      expect(bodyValue).toBe(docElValue);
      expect(bodyValue).toBe(GET_TEST_VALUE);

      docElValue = Scroll.getLeft(document.documentElement);
      bodyValue  = Scroll.getLeft(document.body);

      expect(getLeftSpyFunc.calls.count()).toBe(2);
      expect(bodyValue).toBe(docElValue);
      expect(bodyValue).toBe(GET_TEST_VALUE);

      Object.defineProperty(document, 'body', {
        configurable: true,
        value: body,
      });
    });

    it('sets same scrollTop when documentElement is provided', function() {
      let setTopBodySpyFunc;
      Object.defineProperty(document.body, 'scrollTop', {
        set: setTopBodySpyFunc = jasmine.createSpy(),
        configurable: true,
      });
      Scroll.setTop(document.documentElement, SET_TEST_VALUE);

      expect(setTopSpyFunc.calls.count()).toBe(setTopBodySpyFunc.calls.count());
      expect(setTopSpyFunc.calls.first().args[0])
        .toBe(setTopBodySpyFunc.calls.first().args[0]);
      expect(setTopSpyFunc.calls.first().args[0]).toBe(SET_TEST_VALUE);

      delete document.body.scrollTop;
    });

    it('sets same scrollLeft ' +
       'when documentElement is provided', function() {
      let setLeftBodySpyFunc;
      Object.defineProperty(document.body, 'scrollLeft', {
        set: setLeftBodySpyFunc = jasmine.createSpy(),
        configurable: true,
      });
      Scroll.setLeft(document.documentElement, SET_TEST_VALUE);

      expect(setLeftSpyFunc.calls.count()).toBe(setLeftBodySpyFunc.calls.count());
      expect(setLeftSpyFunc.calls.first().args[0])
        .toBe(setLeftBodySpyFunc.calls.first().args[0]);
      expect(setLeftSpyFunc.calls.first().args[0]).toBe(SET_TEST_VALUE);

      delete document.body.scrollLeft;
    });
  });
});
