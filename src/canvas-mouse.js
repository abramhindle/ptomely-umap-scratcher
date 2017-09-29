/*!
	canvas-mouse ver 0.2.0
	Copyright (c) 2017 Epistemex
	www.epistemex.com
*/

"use strict";

/**
 * A mouse and touch position handler for 2D canvas able to handle scaled
 * and transformed context and element.
 *
 * @param {CanvasRenderingContext2D} context - 2D context to bind to this instance
 * @param {*} [options] - options to pass when you need more than basic point conversion
 * @param {string} [options.level="basic"] - can be one of three values: "basic", "scale", "transforms".
 *  "basic" only converts position directly relative to element's position (incl. padding and borders if any)
 *  "scale" also considers if canvas element is of a different size than its bitmap (context)
 *  "transforms" considers scale and current transforms. Note that this require either currentTransform support on the context,
 *    or the use of a custom Matrix solution (github.com/epistemex/transformation-matrix-js).
 * @param {Matrix} [options.matrix=null] - to support broader range of browser a custom matrix object can be passed already bound
 *  to the current context (same as passed as argument). Using a custom matrix will require the transforms to be called on this
 *  instead of the context itself.
 * @param {boolean} [options.inverseHack=true] - use inverse hack for custom matrix (speeds up mouse point conversion, slows down transforms slightly).
 *  Note: alters the matrix instance if true.
 * @constructor
 */
function CanvasMouse(context, options) {

  if (!(context instanceof CanvasRenderingContext2D))
    throw "Need a 2D canvas context.";

  var me = this, ref;

  options = Object.assign({
    level: "basic",           // basic, scale, transforms
    matrix: null,             // transformation-matrix-2d if no native
    inverseHack: true         // use inverse hack for custom matrix
  }, options);

  var level = Math.max(0, ["basic", "scale", "transforms"].indexOf(options.level));
  var hasMatrix = ("currentTransform" in context || "mozCurrentTransform" in context);

  this.context = context;
  this.canvas = context.canvas;
  this.matrix = options.matrix;

  // optimize inverse matrix extraction
  if (this.matrix && options.inverseHack) {
    this.matrix._xx = this.matrix._x;
    this.matrix._x = function() {
      me.imatrix = this.inverse();
      return this._xx();
    }
  }

  this.deltaX =
  this.deltaY = 0;
  this.scaleX =
  this.scaleY = 1;

  // if currentTransformInverse() is not supported force scaled
  if (level === 2 && (!hasMatrix || this.matrix)) {
    if (this.matrix) level = 3;
    else throw "Warning: browser doesn't support currentTransform().";
  }

  /**
   * Function to convert mouse or touch position to match the context and its element scale and transforms.
   *
   * @param {*} event - event object (mouse, touch) to use for conversion
   * @returns {*} object holding properties x and y with converted position matching context
   * @method
   */
  this.getPos = [this._basic, this._scale, this._transforms, this._transforms2][level];

  // padding offsets
  this.pl = 0;
  this.pt = 0;

  /**
   * Force re-initialization. Use if canvas element has border, padding or size changed.
   *
   * @method
   */
  this.init = init;

  /**
   * Used to manually update relative position if not caught automatically by internals.
   *
   * @method
   */
  this.update = updateOnScroll;

  // Limit reflow so only read trigger values when absolutely needed
  function init() {
    var
      rect = canvas.getBoundingClientRect(),
      cs = getComputedStyle(canvas),
      prop = cs.getPropertyValue.bind(cs),
      _p = "padding-", _b = "border-", _w = "-width",
      pl = parseInt(prop(_p + "left")),
      pr = parseInt(prop(_p + "right")),
      pt = parseInt(prop(_p + "top")),
      pb = parseInt(prop(_p + "bottom")),
      bl = parseInt(prop(_b + "left" + _w)),
      br = parseInt(prop(_b + "right" + _w)),
      bt = parseInt(prop(_b + "top" + _w)),
      bb = parseInt(prop(_b + "bottom" + _w));

    me.pl = pl + bl;
    me.pt = pt + bt;
    me.deltaX = rect.left + me.pl;
    me.deltaY = rect.top + me.pt;
    me.scaleX = canvas.width / (rect.width - me.pl - pr - br);
    me.scaleY = canvas.height / (rect.height - me.pt - pb - bb);
  }

  // Limit reflow so only read trigger values when absolutely needed
  function updateOnScroll() {
    var rect = canvas.getBoundingClientRect();
    me.deltaX = rect.left + me.pl;
    me.deltaY = rect.top + me.pt;
  }

  window.addEventListener("scroll", _handler);
  window.addEventListener("resize", _handler);

  function _handler() {
    cancelAnimationFrame(ref);
    ref = requestAnimationFrame(updateOnScroll)
  }

  init();
}

CanvasMouse.prototype = {

  _basic: function(e) {
    return {
      x: e.clientX - this.deltaX,
      y: e.clientY - this.deltaY
    }
  },

  _scale: function(e) {
    return {
      x: (e.clientX - this.deltaX) * this.scaleX,
      y: (e.clientY - this.deltaY) * this.scaleY
    }
  },

  _transforms: function(e) {
    var pos, matrix, cmatrix, imatrix, ctx = this.context;

    pos = this._scale(e);
    cmatrix = (ctx.currentTransform || ctx.mozCurrentTransform);

    // Convert from SVGMatrix (used by Chrome in experimental mode)
    if (cmatrix instanceof SVGMatrix) cmatrix = DOMMatrix.fromMatrix(cmatrix);

    matrix = typeof cmatrix.a === "undefined" ? new DOMMatrix(cmatrix) : cmatrix;
    imatrix = matrix.invertSelf();

    return {
      x: pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e,
      y: pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f
    }
  },

  _transforms2: function(e) {
    var pos = this._scale(e);
    return this.imatrix.applyToPoint(pos.x, pos.y);
  },

  /**
   * Can take a custom x and y position and convert to a position matching
   * current element scale and context transforms.
   *
   * @param {number} x - x position to convert
   * @param {number} y - y position to convert
   * @returns {*} object holding properties x and y with converted position matching context
   */
  getPosXY: function(x, y) {
    return this.getPos({
      clientX: x / this.scaleX + this.deltaX,
      clientY: y / this.scaleY + this.deltaY
    })
  }
};