/*!
	canvas-mouse ver 0.1.0 beta
	Copyright (c) 2017 Epistemex
	www.epistemex.com
*/

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
 * @constructor
 */
function CanvasMouse(context, options) {

  if (!(context instanceof CanvasRenderingContext2D))
    throw "context must be a 2D canvas context.";

  var me = this, ref;

  options = Object.assign({
    level: "basic",   // basic, scale, transforms
    matrix: null      // transformation-matrix-2d if no native
  }, options);

  var level = Math.max(0, ["basic", "scale", "transforms"].indexOf(options.level));
  var hasMatrix = (context.currentTransform || context.mozCurrentTransform || null);

  this.context = context;
  this.canvas = context.canvas;
  this.matrix = options.matrix;

  this.deltaX = 0;
  this.deltaY = 0;
  this.scaleX = 1;
  this.scaleY = 1;

  // if currentTransformInverse() is not supported force scaled
  if (level === 2 && !hasMatrix) {
    if (this.matrix) level = 3;
    else {
      console.log("Warning: this browser does not support context.currentTransform(). Using \"scale\" instead.");
      level = 1;
    }
  }

  /**
   * Function to convert mouse or touch position to match the context and its element scale and transforms.
   *
   * @param {*} event - event object (mouse, touch) to use for conversion
   * @returns {*} object holding properties x and y with converted position matching context
   * @method
   */
  this.getPos = [this.callbackBasic, this.callbackScale, this.callbackTransforms, this.callbackTransforms2][level];

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

  function init(o) {
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

    o.pl = pl + bl;
    o.pt = pt + bt;
    o.deltaX = rect.left + pl + bl;
    o.deltaY = rect.top + pt + bt;
    o.scaleX = canvas.width / (rect.width - pl - pr - bl - br);
    o.scaleY = canvas.height / (rect.height - pt - pb - bt - bb);
  }

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

  init(this);
}

CanvasMouse.prototype = {

  callbackBasic: function(e) {
    return {
      x: e.clientX - this.deltaX,
      y: e.clientY - this.deltaY
    }
  },

  callbackScale: function(e) {
    return {
      x: (e.clientX - this.deltaX) * this.scaleX,
      y: (e.clientY - this.deltaY) * this.scaleY
    }
  },

  callbackTransforms: function(e) {
    var pos, matrix, cmatrix, imatrix, ctx = this.context;

    pos = this.callbackScale(e);
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

  callbackTransforms2: function(e) {
    var pos = this.callbackScale(e);
    return this.matrix.inverse().applyToPoint(pos.x, pos.y);
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