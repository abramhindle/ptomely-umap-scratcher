
// expect canvas-mouse.js

function TimeLineControls( timeLine, timeLineUI ) {
    // Tasks:
    // - [X] clear edits
    // - [ ] clear edits button
    // - [ ] display/edit path name
    // - [ ] change UI min
    // - [ ] change UI max
    this.timeLine = timeLine;
    this.timeLineUI = timeLineUI;
    var self = this;
    this.clearButton = function() {        
        self.timeLine.clearToMin();
    };
    this.zeroButton = function() {        
        self.timeLine.clearTo(0.0);
    };
    this.addRandomButton = function() {        
        self.timeLine.addPoints([Math.random(),Math.random()*(self.timeLineUI.top  - self.timeLineUI.bottom) + self.timeLineUI.bottom]);
    };
    this.pathChange = function(e) {
        self.timeLine.name = e.target.value;
    };
    this.colorChange = function(e) {
        self.timeLineUI.background = e.target.value;
        self.timeLineUI.update();
    }
    this.getDom = function() {
        var div = document.createElement("div");
        div.classList.add('timelineControl');
        var clearButton = document.createElement("button");
        clearButton.innerHTML = 'clear';
        var zeroButton = document.createElement("button");
        zeroButton.innerHTML = '0';
        var randomButton = document.createElement("button");
        randomButton.innerHTML = '〰️';
        var path = document.createElement("input");
        path.classList.add('tcpath');
        path.value = timeLine.name;
        path.addEventListener("change", this.pathChange );
        clearButton.addEventListener("click", this.clearButton );
        zeroButton.addEventListener("click", this.zeroButton );
        randomButton.addEventListener("click", this.addRandomButton );
        div.appendChild( path );
        div.appendChild( clearButton );
        div.appendChild( zeroButton );
        div.appendChild( randomButton );
        var colorButton = document.createElement("input");
        colorButton.type = "color";
        colorButton.value = self.timeLineUI.background;
        colorButton.addEventListener("change",this.colorChange);
        div.appendChild(colorButton);
        return div;       
    };
    return this;
}

function MouseStartingBehaviour( timeLine, ui ) {
    this.timeLine = timeLine;
    this.ui = ui;
    this.mouseUp = function(self,pos) {
        return this;
    };
    this.mouseDown = function(self,pos) {
        var pt = ui.closestPointFromCanvas(pos,0.01);
        if (pt == null) {
            console.log("Mouse Creating Behaviour!");
            console.log(pos);
            pt = ui.addPointFromCanvas(pos);
            return new MouseMovingBehaviour(pt, timeLine, ui);
            // return new MouseCreatingBehaviour( timeLine, ui );
        } else {
            console.log("Mouse Moving Behaviour!");
            return new MouseDeleteOrMovingBehaviour(pt, timeLine, ui);
        }
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

function MouseMovingBehaviour( pt, timeLine, ui ) {
    this.timeLine = timeLine;
    this.ui = ui;
    this.orig = pt;
    this.pt = [pt[0],pt[1]];
    this.mouseUp = function(self,pos) {
        console.log("We've moved points!");
        return new MouseStartingBehaviour( timeLine, ui );
    };
    this.mouseDown = function(self,pos) {
        return this;
    };
    this.mouseMove = function(self,pos) {
        timeLine.removePoint( this.pt[0] );
        var pt1 = ui.addPointFromCanvas(pos);
        this.pt = pt1;
        return this;
    };
    this.mouseOut = function(self,pos) {
        console.log("OUT!");
        return new MouseStartingBehaviour( timeLine, ui );
    };
    return this;
}


function MouseDeleteOrMovingBehaviour( pt, timeLine, ui ) {
    this.mouseUp = function(self,pos) {
        console.log("We've moved points!");
        timeLine.removePoint( pt[0] );
        timeLine.update();
        return new MouseStartingBehaviour( timeLine, ui );
    };
    this.mouseDown = function(self,pos) {
        return this;
    };
    this.mouseMove = function(self,pos) {
        return new MouseMovingBehaviour(pt, timeLine, ui);
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
    this.background = 'yellow';
    this.controlColor = "#FFAA00";
    this.cursorColor = "#FFFFFF";
    this.lineColor = "#000000";
    this.mouseDelegate = new MouseStartingBehaviour( timeLine, this );
    var self = this;
    this.cursor = -0.1;
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
        ctx.strokeStyle="#000000";     
        ctx.fillStyle = this.background;
        ctx.fillRect(0,0,width,height);

        if (bottom < 0.0) {
            var y = height - height * (0 - bottom)/range;
            ctx.strokeStyle=this.cursorColor;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(width,y);
            ctx.stroke();                        
            ctx.closePath();
        }
        
        // cursor
        var x = width * (this.cursor - start)/trange;
        ctx.strokeStyle="#FFFFFF";
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,height);       
        ctx.stroke();                        
        ctx.closePath();

        // hilight lines
        ctx.strokeStyle=this.controlColor;
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        for (var i = 0; i < time.length; i++ ) {
            if (time[i] < start) {
                // nothing
            } else if (time[i] > end) {
                break;
            } else {
                var x = width * (time[i] - start)/trange;
                ctx.moveTo(x,0);
                ctx.lineTo(x,height);
                ctx.stroke();                
            }
        }
        ctx.stroke();                        
        ctx.closePath();

        
        // lines
        ctx.strokeStyle=this.lineColor;     
        ctx.beginPath();
        ctx.lineWidth = 2.0;
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
        ctx.closePath();


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
            self.mouseDelegate = self.mouseDelegate.mouseUp(self,pos);
        }        
    }
    this.mouseMove = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var pos = self.getPos(e);
        if (self.mouseDelegate) {
            self.mouseDelegate = self.mouseDelegate.mouseMove(self,pos);
        }                
    }
    this.mouseOut = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (self.mouseDelegate) {
            self.mouseDelegate = self.mouseDelegate.mouseOut(self,e);
        }                
    }

    this.update = function() {
        this.paint();
    }
    this.estimatePointFromCanvas = function( pos ) {
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
        var pt = [trueTime, trueValue];
        return pt;
    };
    this.addPointFromCanvas = function(pos) {
        var pt = self.estimatePointFromCanvas( pos );
        timeLine.addPoints( pt );
        return pt;
    };
    this.closestPointFromCanvas = function(pos, tolerance) {
        var pt = self.estimatePointFromCanvas( pos );
        var close = timeLine.getClosestPoint(pt[0]);
        var dist = Math.abs(pt[0] - close[0]);
        if ( dist <= tolerance ) {
            return close;
        }
        return null;
    };

    
    this.installCanvasListeners = function() {
        var canvas = this.canvas;
        canvas.addEventListener("mousemove",this.mouseMove);
        canvas.addEventListener("mouseup",this.mouseUp);
        canvas.addEventListener("mousedown", this.mouseDown);
        canvas.addEventListener("mouseout", this.mouseOut);
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
                return this.value[ i - 1 ] * (1.0 - mix) + (mix)* this.value[ i ];
            }
        }
        return this.value[this.value.length - 1];
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
    
    this.getClosestPoint = function(closeTime) {
        var close = 0
        var cdist = Math.abs(closeTime - this.time[close]);
        for (var i = 0 ; i < this.time.length; i++) {
            var dist = Math.abs(closeTime - this.time[i]);
            if (dist < cdist) {
                close = i;
                cdist = dist;
            }
        }
        var pt = [this.time[close],this.value[close]];
        return pt;
    };

    this.removePoint = function(removeTime) {
        var l = this.time.length;
        for (var i = 0 ; i < l; i++) {
            if (this.time[i] == removeTime) {
                this.time.splice(i, 1);
                this.value.splice(i, 1);
                return;
            }
        }
    }
    this.minValue = function() {
        var minV = this.value[0];
        for (var i = 0 ; i < this.value.length; i++) {
            if (this.value[i] < minV) {
                minV = this.value[i]
            };
        }
        return minV;
    }
    this.clearToMin = function() {
        var minV = this.minValue();
        this.time = [0.5];
        this.value = [minV];
        this.update();
    }
    this.clearTo = function(x) {
        var minV = x;
        this.time = [0.5];
        this.value = [minV];
        this.update();
    }
    return this;
}

function Table(size,defaultValue) {
    this.value = Array(size).fill(defaultValue);
    this.listeners = [];
    this.dirty = false;
    this.estimate = function(index) {
        index = Math.floor(index);
        if (index < 0) {
            return this.value[0];
        } else if (index >= this.value.length) {
            return this.value[this.value.length - 1];
        } else {
            return this.value[index];
        }
    };
    // old timeline interface?
    this.addPoints = function(pts) {
        for (var i = 0 ; i < pts.length; i+=2) {
            var pt = [pts[i],pts[i+1]];
            this.updatePoint(Math.floor(pt[0]*this.value.length),pt[1]);
        }
        this.update();
    }
    this.updatePoint = function(index,value) {
        console.log([index,value]);
        this.dirty = true;
        // empty array
        this.value[Math.floor(index)] = value;
    };
    this.updatePoints = function(points) {
        this.dirty = true;
        for (var i = 0; i < points.length; i++) {
            this.value[i] = points[i];
        }
        this.update(); 
    };
    this.makeUI = function() {
        var tlu = new TableUI( this );
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
    
    this.minValue = function() {
        var minV = this.value[0];
        for (var i = 0 ; i < this.value.length; i++) {
            if (this.value[i] < minV) {
                minV = this.value[i]
            };
        }
        return minV;
    }
    this.clearToMin = function() {
        this.dirty = true;
        var minV = this.minValue();
        for (var i = 0; i < this.value.length; i++) {
            this.value[i] = minV;
        }
        this.update();
    }
    this.clearTo = function(x) {
        this.dirty = true;
        var minV = x;
        for (var i = 0; i < this.value.length; i++) {
            this.value[i] = minV;
        }
        this.update();
    }

    this.getClosestPoint = function(closeTime) {
        var close = 0
        console.log(closeTime);        
        var cdist = Math.abs(closeTime - close);
        for (var i = 0 ; i < this.value.length; i++) {
            var dist = Math.abs(closeTime - (1.0 * i / this.value.length));
            if (dist < cdist) {
                close = i;
                cdist = dist;
            }
        }
        var pt = [close,this.value[close]];
        return pt;
    };
    this.removePoint = function(x) {
        console.log("We don't remove Points");
    };
    this.isDirty = function() {
        return this.dirty;
    }
    this.clean = function() {
        this.dirty = false;
    }
    return this;
}

function TableUI( table ) {
    this.table = table;
    this.dom = null;
    this.start = 0.0;
    this.end = 1.0;
    this.top = 1.0;
    this.bottom = -1.0;
    this.background = 'yellow';
    this.controlColor = "#FFAA00";
    this.cursorColor = "#FFFFFF";
    this.lineColor = "#000000";
    this.mouseDelegate = new MouseStartingBehaviour( table, this );
    var self = this;
    this.cursor = -0.1;
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
        div.classList.add('Table');
        var canvas = document.createElement("canvas");
        canvas.classList.add('TableCanvas');
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
        const value = table.value;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;
        const range = this.top - this.bottom;
        const start = this.start;
        const end = this.end;
        const bottom = this.bottom;
        const s = table.estimate(start);
        const e = table.estimate(end);
        const trange = end - start;        
        ctx.strokeStyle="#000000";     
        ctx.fillStyle = this.background;
        ctx.fillRect(0,0,width,height);

        if (bottom < 0.0) {
            var y = height - height * (0 - bottom)/range;
            ctx.strokeStyle=this.cursorColor;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(width,y);
            ctx.stroke();                        
            ctx.closePath();
        }
        

        ctx.fillStyle = this.controlColor;
        ctx.strokeStyle=this.controlColor;
        ctx.lineWidth = 2.0;
        for (var i = 0; i < value.length; i++) {
            var time = 1.0*i/value.length;
            var x = width * (time - start)/trange;
            var y = height*(value[i] - bottom)/range;
            var y0 = height - height * (0 - bottom)/range;
            ctx.fillRect(x,y0,1.0*width/value.length,y0 - y);
        }
        
        // lines
        ctx.strokeStyle=this.cursorColor;     
        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.moveTo(0, height - height*(s - bottom)/range);
        for (var i = 0; i < value.length; i++) {
            var time = 1.0*i/value.length
            var x = width * (time - start)/trange;
            var y = height*(value[i] - bottom)/range;
            ctx.lineTo(x,height - y);
        }
        ctx.lineTo(width, height - height*(e - bottom)/range);    
        ctx.stroke();
        ctx.closePath();


        
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
            self.mouseDelegate = self.mouseDelegate.mouseUp(self,pos);
        }        
    }
    this.mouseMove = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var pos = self.getPos(e);
        if (self.mouseDelegate) {
            self.mouseDelegate = self.mouseDelegate.mouseMove(self,pos);
        }                
    }
    this.mouseOut = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (self.mouseDelegate) {
            self.mouseDelegate = self.mouseDelegate.mouseOut(self,e);
        }                
    }

    this.update = function() {
        this.paint();
    }
    this.estimatePointFromCanvas = function( pos ) {
        const time = table.time;
        const value = table.value;
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
        var pt = [trueTime, trueValue];
        return pt;
    };
    this.addPointFromCanvas = function(pos) {
        var pt = self.estimatePointFromCanvas( pos );
        var pt1 = [ ];
        table.updatePoint( pt[0]*table.value.length, pt[1] );
        table.update();
        return pt;
    };
    this.closestPointFromCanvas = function(pos, tolerance) {
        var pt = self.estimatePointFromCanvas( pos );
        var close = table.getClosestPoint(pt[0]);
        var dist = Math.abs(pt[0] - close[0]);
        if ( dist <= tolerance ) {
            return close;
        }
        return null;
    };

    
    this.installCanvasListeners = function() {
        var canvas = this.canvas;
        canvas.addEventListener("mousemove",this.mouseMove);
        canvas.addEventListener("mouseup",this.mouseUp);
        canvas.addEventListener("mousedown", this.mouseDown);
        canvas.addEventListener("mouseout", this.mouseOut);
    };
    

    return this;
}
