# 3D UMap with Supercollider

Here's a bad demo to illustrate what it looks like:

https://www.youtube.com/watch?v=hJstOFwQW-E

Make a CSV File with the following format

```
filename,timeindex,128+numbers+from+an+embedding
```

For example:

```
"/opt/hindle1/Music/48kmonos/ZOOM0029.wav",99,24,116,146,0,78,162,17,169,255,90,65,218,211,179,92,209,161,94,116,188,255,0,97,202,139,114,241,94,255,29,2,0,177,139,116,133,170,123,255,26,118,0,0,213,172,70,112,0,54,255,197,255,14,144,24,0,120,225,54,254,0,140,157,48,235,6,74,136,246,0,137,173,0,162,60,189,255,95,173,236,0,255,115,0,255,105,0,0,0,255,143,75,255,111,35,189,71,153,77,255,0,0,56,255,211,58,0,115,255,255,188,169,203,0,147,59,255,255,0,88,255,52,255,10,0,39,0,106
```

Then run `_reduce.py -i yourcsv.csv`. It produces `_reduction/reduce.json` .
Link/mv/copy that to `./docs/plots/reduce.json` 

Then run go-oscer

`make runserver`

It'll use go to run the webserver 

Then go to:

`http://localhost:8000/src/interactive_scatter.html`

(Make sure that the src dir is linked in `public`).

# Go-oscer

A websocket to OSC webservice for Go. Used to ferry over messages from a time-line based UI

* cd src ; go run main.go
* go to http://localhost:8000/tracker.html

# Formerly from Go Chat

I assume it is under the 2 clause BSD License of Gorilla/websockets

    Copyright (c) 2016 Ed Zynda https://scotch.io/bar-talk/build-a-realtime-chat-server-with-go-and-websockets
    Copyright (c) 2013 The Gorilla WebSocket Authors. All rights reserved.
    
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
    
      Redistributions of source code must retain the above copyright notice, this
      list of conditions and the following disclaimer.
    
      Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Go Chat

This is a simple chat web app written in Go

Just run the following

```
cd ./src
go get github.com/gorilla/websocket
go run main.go
```

Then point your browser to http://localhost:8000

# From canvas-mouse

    The MIT License (MIT)
    
    Copyright (c) 2017 Epistemex
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Ptolemy

Map and find things in your data with openGL to help make it pretty.

Mostly a personal weekend interest in looking at making a functional, fast map of some audio descriptor data + machine learning outputs.

It requires a Python 3.6+ environment and node package manager to run the web server and dependencies for drawing with three.js.

It makes use of the FluCoMa tools for audio analysis and statistics. Big thanks to the team at Huddersfield University for these tools!

www.flucoma.org
