/*!
	canvas-mouse v. 0.5.0 alpha
	Copyright (c) 2017 Epistemex.com
	MIT license.
*/

;"use strict";

/**
 * Valid properties for the option object passed to CanvasMouse constructor.
 * The object is intended to be an literal object.
 *
 * The default settings handle padding and borders.
 *
 * @name CanvasMouseOptions
 * @prop {boolean} [handleScale=false] - handles situations where element size is different than the bitmap size.
 * @prop {boolean} [handleTransforms=false] - consider transforms applied to the context when calculating position.
 *  Note that this require either `currentTransform` support on the context,
 *  or the use of a custom Matrix solution (github.com/epistemex/transformation-matrix-js).
 * @prop {Matrix} [matrix=null] - to support broader range of browser a custom matrix object can be passed already bound
 *  to the current context (same as passed as argument). Using a custom matrix will require the transforms to be called on this
 *  instead of the context itself.
 */

/**
 * Point object
 * @name Point
 * @prop {number} x - floating point number for x position
 * @prop {number} y - floating point number for y position
 */

/**
 * A mouse and touch position handler for 2D canvas able to handle scaled
 * and transformed context and element.
 *
 * @param {CanvasRenderingContext2D} context - 2D context to bind to this instance
 * @param {CanvasMouseOptions} [options] - optional options object to allow for scale and transforms to be considered.
 * @constructor
 */
function CanvasMouse(context, options) {

  if (!(context instanceof CanvasRenderingContext2D))
    throw "Need a 2D canvas context.";

  options = Object.assign({
    handleScale: false,
    handleTransforms: false,
    matrix: null
  }, options);

  var
    me = this,
    ref,
    hasCurrentTransform = ("currentTransform" in context || "mozCurrentTransform" in context),
    deltaX,
    deltaY,
    scaleX,
    scaleY,
    paddingBorderLeft,
    paddingBorderTop,
    canvas = context.canvas,
    matrix = options.matrix,
    imatrix = matrix ? matrix.inverse() : null,
    doScale = options.handleScale,
    doTransforms = options.handleTransforms,
    transform = matrix ? _transforms2 : _transforms;

  if (doTransforms && !hasCurrentTransform && !matrix) {
    console.log("Browser doesn't support currentTransform.");
    doTransforms = false;
  }

  // optimize inverse matrix extraction
  if (doTransforms && matrix) {
    matrix._xx = matrix._x;
    matrix._x = function() {
      imatrix = this.inverse();
      return this._xx();
    }
  }

  // Limit reflow so only read trigger values when absolutely needed
  function init() {
    var
      rect = canvas.getBoundingClientRect(),
      cs = getComputedStyle(canvas),
      prop = cs.getPropertyValue.bind(cs),
      pInt = parseInt,
      _p = "padding-",
      _b = "border-",
      _w = "-width",
      _pl = pInt(prop(_p + "left")),
      _pr = pInt(prop(_p + "right")),
      _pt = pInt(prop(_p + "top")),
      _pb = pInt(prop(_p + "bottom")),
      _bl = pInt(prop(_b + "left" + _w)),
      _br = pInt(prop(_b + "right" + _w)),
      _bt = pInt(prop(_b + "top" + _w)),
      _bb = pInt(prop(_b + "bottom" + _w));

    paddingBorderLeft = _pl + _bl;
    paddingBorderTop = _pt + _bt;
    deltaX = rect.left + paddingBorderLeft;
    deltaY = rect.top + paddingBorderTop;
    scaleX = (canvas.width / (rect.width - paddingBorderLeft - _pr - _br)) || 1;
    scaleY = (canvas.height / (rect.height - paddingBorderTop - _pb - _bb)) || 1;
  }

  // debounce updates
  function _handler() {
    cancelAnimationFrame(ref);
    ref = requestAnimationFrame(_updateOnScroll)
  }

  function _updateOnScroll() {
    var rect = canvas.getBoundingClientRect();
    deltaX = rect.left + paddingBorderLeft;
    deltaY = rect.top + paddingBorderTop;
  }

  function _basic(e) {
    return {
      x: e.clientX - deltaX,
      y: e.clientY - deltaY
    }
  }

  function _scale(pos) {
    pos.x *= scaleX;
    pos.y *= scaleY;
    return pos
  }

  function _transforms(pos) {
    var matrix, cmatrix, imatrix, ctx = context;

    cmatrix = (ctx.currentTransform || ctx.mozCurrentTransform);

    // Convert from SVGMatrix (used by Chrome in experimental mode)
    if (cmatrix instanceof SVGMatrix) cmatrix = DOMMatrix.fromMatrix(cmatrix);

    matrix = typeof cmatrix.a === "undefined" ? new DOMMatrix(cmatrix) : cmatrix;
    imatrix = matrix.invertSelf();

    return {
      x: pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e,
      y: pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f
    }
  }

  function _transforms2(pos) {
    return imatrix.applyToPoint(pos.x, pos.y);
  }

  /**
   * Function to convert mouse or touch position to match the context
   * and its element scale and transforms.
   *
   * @param {*} e - event object (mouse, touch) to use for conversion
   * @returns {Point}
   */
  this.getPos = function(e) {
    var pos = _basic(e);
    if (doScale) pos = _scale(pos);
    if (doTransforms) pos = transform(pos);
    return pos
  };

  /**
   * Pass in custom x and y point to convert to new position relative to
   * bound context.
   *
   * @param {number} x - x position to convert
   * @param {number} y - y position to convert
   * @returns {Point}
   */
  this.getPosXY = function(x, y) {
    return me.getPos({
      clientX: x / scaleX + deltaX,
      clientY: y / scaleY + deltaY
    })
  };

  /**
   * Force re-initialization. Use if canvas element has border, padding
   * or size changed.
   */
  this.init = init;

  /**
   * Used to manually update relative position in client if not caught
   * automatically by internals.
   */
  this.update = _updateOnScroll;

  init();

  window.addEventListener("scroll", _handler);
  window.addEventListener("resize", _handler);
}
