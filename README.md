canvas-mouse
============

Helper object to efficiently obtain the correct mouse or touch position in 2D canvas
independent of element size versus bitmap size, transforms, borders and padding. 

Useful from simple cases where you need to adjust the position to match canvas
in a web page, to more complex cases such as click-to-zoom, pan, rotate and 
scale scenarios.


Features
--------

- Efficient, causes no unneeded DOM reflows (caches key-values and handles scrolling and resizing gracefully)
- Handles CSS-scaled canvas element versus its bitmap size
- Handles transformed context
- Handles element padding and borders if any
- Handling-methods can be changed in real-time (to optimize handling).
- Supports the [transformation-matrix-2d](https://github.com/epistemex/transformation-matrix-js) solution (included) 
for browsers without native support for [`currentTransform`](https://devdocs.io/dom/canvasrenderingcontext2d/currenttransform).


Install
-------

**canvas-mouse** can be installed in various ways:

- Git using HTTPS: `git clone https://gitlab.com/epistemex/canvas-mouse.git`
- Git using SSH: `git clone git@gitlab.com:epistemex/canvas-mouse.git`
- See [releases](https://github.com/epistemex/canvas-mouse/releases) for other options.

	
Usage
-----

Easy to use:

    // pass in a 2D context and handling options
    var cm = new CanvasMouse(context, {
        handleScale: true,
        handleTransforms: true
      });

Then in the handler you're using pass the event to get the correct position:

    function someMouseOrTouchHandler(evt) {
      var pos = cm.getPos(evt);
      // ... use pos.x, pos.y here
    }


Issues
------

Using mouse/touch positions with a transformed context:

The `currentTransform` is not supported by all browsers at the moment.
Our [custom matrix solution](https://github.com/epistemex/transformation-matrix-js)
can be used in place and is compatible will all browsers.

Firefox is currently the only browser that support the property (but in 
prefixed form) but returns an Array instead of a DOMMatrix. Chrome will 
return a SVGMatrix, and only if experimental canvas features is enabled 
behind flags.

We recommend therefor using the custom matrix solution as this will be 
cross-platform compatible and independent of browser's current status.

The only drawback is that you'll call transform operations on the matrix 
object instead of the context (the matrix will automatically sync the 
context for you though). See included demo (`www/demo_custommatrix.html`)
for an usage example.


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; Epistemex 2017*
 
![Epistemex](http://i.imgur.com/GP6Q3v8.png)
