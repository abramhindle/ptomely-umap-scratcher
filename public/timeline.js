
// expect canvas-mouse.js

function MouseStartingBehaviour( timeLine, ui ) {
    this.timeLine = timeLine;
    this.ui = ui;
    this.mouseUp = function(self,pos) {
        return this;
    };
    this.mouseDown = function(self,pos) {
        console.log("Mouse Creating Behaviour!");
        console.log(pos);
        return new MouseCreatingBehaviour( timeLine, ui );
    };
    this.mouseMove = function(self,pos) {
        return this;
    };
    this.mouseOut = function(self,pos) {
        return this;
    };
    return this;
}

function MouseCreatingBehaviour( timeLine, ui ) {
    this.timeLine = timeLine;
    this.ui = ui;
    this.mouseUp = function(self,pos) {
        console.log("Actually trying to create point!");
        ui.addPointFromCanvas(pos);
        return new MouseStartingBehaviour( timeLine, ui );
    };
    this.mouseDown = function(self,pos) {
        return this;
    };
    this.mouseMove = function(self,pos) {
        return this;
    };
    this.mouseOut = function(self,pos) {
        console.log("OUT!");
        return new MouseStartingBehaviour( timeLine, ui );
    };
    return this;
}


function TimeLineUI( timeLine ) {
    this.timeLine = timeLine;
    this.dom = null;
    this.start = 0.0;
    this.end = 1.0;
    this.top = 1.0;
    this.bottom = -1.0;
    this.mouseDelegate = new MouseStartingBehaviour( timeLine, this );
    var self = this;
    this.getCM = function() {
        if (this.cm) {
            return this.cm;
        }
        var cm = new CanvasMouse(this.ctx, {
            handleScale: true,
            handleTransforms: true
        });
        this.cm = cm;
        return this.cm;
    }
    this.getPos = function(e) {
        return self.getCM().getPos(e);
    }
    this.getDom = function() {
        if (this.dom !== null) {
            return this.dom;
        }
        var div = document.createElement("div");
        div.classList.add('TimeLine');
        var canvas = document.createElement("canvas");
        canvas.classList.add('TimeLineCanvas');
        canvas.width = 1000;
        canvas.height = 250;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.installCanvasListeners();
        
        div.appendChild( canvas );
        div.paint = function() {
            self.paint();
        }
        this.dom = div;
        return this.dom;
    };
    this.paint = function() {
        const time = timeLine.time;
        const value = timeLine.value;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;
        const range = this.top - this.bottom;
        const start = this.start;
        const end = this.end;
        const bottom = this.bottom;
        const s = timeLine.estimate(start);
        const e = timeLine.estimate(end);
        const trange = end - start;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(0,0,width,height);
        ctx.beginPath();
        ctx.moveTo(0, height - height*(s - bottom)/range);
        for (var i = 0; i < time.length; i++) {
            if (time[i] < start) {
                // nothing
            } else if (time[i] > end) {
                break;
            } else {
                var x = width * (time[i] - start)/trange;
                var y = height*(value[i] - bottom)/range;
                // console.log(i + " " + x + " , " + y + " width: " + width + " trange: "+trange + " time: " + time[i] + " value: " + value[i] );
                ctx.lineTo(x,height - y);
            }
        }
        ctx.lineTo(width, height - height*(e - bottom)/range);
    
        ctx.stroke();
    };

    this.mouseDown = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var pos = self.getPos(e);
        if (self.mouseDelegate) {
            self.mouseDelegate = self.mouseDelegate.mouseDown(self,pos);
        }
    }
    this.mouseUp = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var pos = self.getPos(e);
        if (self.mouseDelegate) {
            self.Delegate = self.mouseDelegate.mouseUp(self,pos);
        }        
    }
    this.mouseMove = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var pos = self.getPos(e);
        if (self.mouseDelegate) {
            self.Delegate = self.mouseDelegate.mouseMove(self,pos);
        }                
    }
    this.mouseOut = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (self.mouseDelegate) {
            self.Delegate = self.mouseDelegate.mouseOut(self,e);
        }                
    }

    this.update = function() {
        this.paint();
    }
    this.addPointFromCanvas = function( pos ) {
        console.log(pos);
        const time = timeLine.time;
        const value = timeLine.value;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const bottom = this.bottom;
        const range = this.top - bottom;
        const start = this.start;
        const end = this.end;
        const trange = end - start;
        const relx = pos.x / (1.0*width);
        const rely = (height - pos.y) / (1.0*height);
        var trueTime = trange * relx + start;
        var trueValue = range*rely + bottom;
        timeLine.addPoints([trueTime, trueValue]);
    };
    this.installCanvasListeners = function() {
        var canvas = this.canvas;
        canvas.addEventListener("mousemove",this.mouseMove);
        canvas.addEventListener("mouseup",this.mouseUp);
        canvas.addEventListener("mousedown", this.mouseDown);
        canvas.addEventListener("mouseout", this.mouseout);
    };

    return this;
}

function TimeLine() {
    this.time = [];
    this.value = [];
    this.listeners = [];
    this.dirty = false;
    this.estimate = function(time) {
        if (time <= 0.0) {
            return this.value[0];
        } else if (time >= 1.0) {
            return this.value[this.value.length - 1];
        }
        for (var i = 1 ; i < this.time.length; i++) {
            if (time <= this.time[i]) {
                var mix = (time - this.time[i - 1])/(this.time[ i ]  - this.time[ i - 1 ]);
                return this.value[ i - 1 ] * (1.0 - mix) + (mix)* time.value[ i ];
            }
        }
        console.log("Why are we here?");
        return 0.0;        
    };
    this.addPoint = function(time,value) {
        this.dirty = true;
        // empty array
        if (this.time.length == 0) {
            this.time.push(time);
            this.value.push(value);
            return;
        }
        // head
        var startTime = this.time[0];
        if (time < startTime) {
            this.time.unshift(time);
            this.value.unshift(value);
            return;
        }
        var endTime = this.time[this.time.length - 1];
        // end
        if (time > endTime) {
            this.time.push(time);
            this.value.push(value);
            return;
        }
        // find the indice that is bigger
        // can replace this with binary search 
        for (var i = 1 ; i < this.time.length; i++) {
            if (time < this.time[i]) {
                this.time.splice( i , 0, time);
                this.value.splice( i , 0, value);
                return;
            }
        }
    };
    this.addPoints = function(points) {
        this.dirty = true;
        for (var i = 0; i < points.length; i+=2) {
            this.addPoint(points[i],points[i+1]);
        }
        this.update(); 
    };
    this.makeUI = function() {
        var tlu = new TimeLineUI( this );
        this.listeners.push( tlu );
        return tlu;
    };
    this.update = function() {
        for (var i = 0 ; i < this.listeners.length; i++) {
            this.listeners[i].update();
        }
    }
    this.conditionalUpdate = function() {
        if (this.dirty) {
            this.dirty = false;
            this.update();            
        }
    };
    return this;
}
