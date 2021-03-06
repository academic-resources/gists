/**
 * This class listens to events on the document and then updates a react
 * component through callbacks.
 * Please note that captureMouseMove must be called in
 * order to initialize listeners on mousemove and mouseup.
 * releaseMouseMove must be called to remove them. It is important to
 * call releaseMouseMoves since mousemove is expensive to listen to.
 *
 * @providesModule DOMMouseMoveTracker
 * @typechecks
 */

'use strict';

const EventListener = require('EventListener');

const cancelAnimationFramePolyfill = require('cancelAnimationFramePolyfill');
const requestAnimationFramePolyfill = require('requestAnimationFramePolyfill');

class DOMMouseMoveTracker {
  /**
   * onMove is the callback that will be called on every mouse move.
   * onMoveEnd is called on mouse up when movement has ended.
   */
  constructor(
    /*function*/ onMove,
    /*function*/ onMoveEnd,
    /*DOMElement*/ domNode) {
    this._isDragging = false;
    this._animationFrameID = null;
    this._domNode = domNode;
    this._onMove = onMove;
    this._onMoveEnd = onMoveEnd;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._didMouseMove = this._didMouseMove.bind(this);
  }

  /**
   * This is to set up the listeners for listening to mouse move
   * and mouse up signaling the movement has ended. Please note that these
   * listeners are added at the document.body level. It takes in an event
   * in order to grab inital state.
   */
  captureMouseMoves(/*object*/ event) {
    if (!this._eventMoveToken && !this._eventUpToken) {
      this._eventMoveToken = EventListener.listen(
        this._domNode,
        'mousemove',
        this._onMouseMove
      );
      this._eventUpToken = EventListener.listen(
        this._domNode,
        'mouseup',
        this._onMouseUp
      );
    }

    if (!this._isDragging) {
      this._deltaX = 0;
      this._deltaY = 0;
      this._isDragging = true;
      this._x = event.clientX;
      this._y = event.clientY;
    }
    event.preventDefault();
  }

  /**
   * These releases all of the listeners on document.body.
   */
  releaseMouseMoves() {
    if (this._eventMoveToken && this._eventUpToken) {
      this._eventMoveToken.remove();
      this._eventMoveToken = null;
      this._eventUpToken.remove();
      this._eventUpToken = null;
    }

    if (this._animationFrameID !== null) {
      cancelAnimationFramePolyfill(this._animationFrameID);
      this._animationFrameID = null;
    }

    if (this._isDragging) {
      this._isDragging = false;
      this._x = null;
      this._y = null;
    }
  }

  /**
   * Returns whether or not if the mouse movement is being tracked.
   */
  isDragging() /*boolean*/{
    return this._isDragging;
  }

  /**
   * Calls onMove passed into constructor and updates internal state.
   */
  _onMouseMove(/*object*/ event) {
    const x = event.clientX;
    const y = event.clientY;

    this._deltaX += (x - this._x);
    this._deltaY += (y - this._y);

    if (this._animationFrameID === null) {
      // The mouse may move faster then the animation frame does.
      // Use `requestAnimationFramePolyfill` to avoid over-updating.
      this._animationFrameID =
        requestAnimationFramePolyfill(this._didMouseMove);
    }

    this._x = x;
    this._y = y;
    event.preventDefault();
  }

  _didMouseMove() {
    this._animationFrameID = null;
    this._onMove(this._deltaX, this._deltaY);
    this._deltaX = 0;
    this._deltaY = 0;
  }

  /**
   * Calls onMoveEnd passed into constructor and updates internal state.
   */
  _onMouseUp() {
    if (this._animationFrameID) {
      this._didMouseMove();
    }
    this._onMoveEnd();
  }
}

module.exports = DOMMouseMoveTracker;
