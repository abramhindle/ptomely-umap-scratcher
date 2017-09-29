canvas-mouse
======

Helper object for getting the correct mouse or touch position in 2D canvas efficiently


Features
--------

- Efficient, causes no unneeded DOM reflows (handles scrolling gracefully)
- Handles scaled canvas element (CSS) versus bitmap size
- Handles transformed context
- Handles element padding and borders if any
- Supports the [transformation-matrix-2d](https://github.com/epistemex/transformation-matrix-js) solution for browsers without
native support for [`currentTransform()`](https://devdocs.io/dom/canvasrenderingcontext2d/currenttransform).


Install
-------

**canvas-mouse** can be installed in various ways:

- Git using HTTPS: `git clone https://gitlab.com/epistemex/canvas-mouse.git`
- Git using SSH: `git clone git@gitlab.com:epistemex/canvas-mouse.git`
- Download [zip archive](https://gitlab.com/epistemex/canvas-mouse/repository/archive.zip?ref=master) and extract.
- Download [tar ball](https://gitlab.com/epistemex/canvas-mouse/repository/archive.tar.gz?ref=master) and extract.

	
Usage
-----

Easy to use:

    // pass in a 2D context and level option
    var cm = new CanvasMouse(context, {level: "transforms"});

Then in the handler you're using pass the event to get the correct position:

    function someMouseOrTouchHandler(evt) {
      var pos = cm.getPos(evt);
      // ... use pos.x, pos.y here
    }


Issues
------

- `currentTransform()` is not supported by all browsers at the moment.
A [custom solution](https://github.com/epistemex/transformation-matrix-js)
can be used in place that is compatible will all browsers.

See the [issue tracker](https://gitlab.com/epistemex/canvas-mouse/issues) for details.


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You may use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.


*&copy; Epistemex 2017*
 
![Epistemex](http://i.imgur.com/GP6Q3v8.png)
