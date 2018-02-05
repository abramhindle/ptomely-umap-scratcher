function Sequencer(args) {
    this.ticks = args["ticks"];
    this.duration = args["duration"];
    this.delegate = args["delegate"];
    if (! this.delegate) {
        this.delegate = function(path,value) {
            console.log("Unset delegate "+ path + " : "  + value);
        };
    }
    this.uis = [];
    this.tls = [];
    var self = this;
    this.generateTimeLineAndUI = function() {
        var id = this.uis.length;
        var tl = new TimeLine();
        var ui = tl.makeUI();
        tl.name = "/timeline/"+id;
        this.tls[id] = tl;
        this.uis[id] = ui;
        return [tl,ui];
    };
    this.callBack = function() {
        var duration = self.duration;
        var elapsed = new Date() - self.lastTime;
        var times = Math.floor(elapsed / (duration*1000.0));
        var t = elapsed - times * duration * 1000.0;
        var proportion = t / (1000.0*duration);
        for (var i = 0 ; i < self.uis.length; i++) {
            self.uis[i].cursor = proportion;
            self.uis[i].update();
        }
        for (var i = 0 ; i < self.tls.length; i++) {
            var v = self.tls[i].estimate(proportion);
            self.send(self.tls[i].name,v,self.tls[i]);
        }
    };
    this.start = function() {
        console.log("Starting callback");
        this.timerRef = setInterval(this.callBack,1000.0/ticks);
        this.lastTime = new Date();
    };
    this.stop = function() {
        clearInterval(this.timerRef);
    };
    this.send = function(path, value, extra) {
        this.delegate(path, value, self, extra);
    }
    return this;
}
