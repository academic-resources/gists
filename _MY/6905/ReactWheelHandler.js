/**
 * This is utility that hanlds onWheel events and calls provided wheel
 * callback with correct frame rate.
 *
 * @providesModule ReactWheelHandler
 * @typechecks
 */

'use strict';

const emptyFunction = require('emptyFunction');
const normalizeWheel = require('normalizeWheel');
const requestAnimationFramePolyfill = require('requestAnimationFramePolyfill');

class ReactWheelHandler {
  /**
   * onWheel is the callback that will be called with right frame rate if
   * any wheel events happened
   * onWheel should is to be called with two arguments: deltaX and deltaY in
   * this order
   */
  constructor(
    /*function*/ onWheel,
    /*boolean|function*/ handleScrollX,
    /*boolean|function*/ handleScrollY,
    /*?boolean|?function*/ stopPropagation
  ) {
    this._animationFrameID = null;
    this._deltaX = 0;
    this._deltaY = 0;
    this._didWheel = this._didWheel.bind(this);
    if (typeof handleScrollX !== 'function') {
      handleScrollX = handleScrollX ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    if (typeof handleScrollY !== 'function') {
      handleScrollY = handleScrollY ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    if (typeof stopPropagation !== 'function') {
      stopPropagation = stopPropagation ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    this._handleScrollX = handleScrollX;
    this._handleScrollY = handleScrollY;
    this._stopPropagation = stopPropagation;
    this._onWheelCallback = onWheel;
    this.onWheel = this.onWheel.bind(this);
  }

  onWheel(/*object*/ event) {
    const normalizedEvent = normalizeWheel(event);
    const deltaX = this._deltaX + normalizedEvent.pixelX;
    const deltaY = this._deltaY + normalizedEvent.pixelY;
    const handleScrollX = this._handleScrollX(deltaX, deltaY);
    const handleScrollY = this._handleScrollY(deltaY, deltaX);
    if (!handleScrollX && !handleScrollY) {
      return;
    }

    this._deltaX += handleScrollX ? normalizedEvent.pixelX : 0;
    this._deltaY += handleScrollY ? normalizedEvent.pixelY : 0;
    event.preventDefault();

    let changed;
    if (this._deltaX !== 0 || this._deltaY !== 0) {
      if (this._stopPropagation()) {
        event.stopPropagation();
      }
      changed = true;
    }

    if (changed === true && this._animationFrameID === null) {
      this._animationFrameID = requestAnimationFramePolyfill(this._didWheel);
    }
  }

  _didWheel() {
    this._animationFrameID = null;
    this._onWheelCallback(this._deltaX, this._deltaY);
    this._deltaX = 0;
    this._deltaY = 0;
  }
}

module.exports = ReactWheelHandler;
