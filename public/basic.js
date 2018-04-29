
var main = document.getElementById("main");
var globalDuration = 60.0;
var ticks = 15.0;
var osctarget = "localhost:57120";
var ws = new WebSocket('ws://' + window.location.host + '/ws');
var ready = false;
ws.onopen = function() {
    ready = true;
}
ws.addEventListener('message', function(e) {
    var msg = JSON.parse(e.data);
    console.log(msg);
});

var sender = function(path, value, sequencer, timeline) {
    if (ready) {
        // this is dumb :/
        if (Array.isArray(value)) {
            var args = value.map(function(x){ return "f" });
            var params = value.map(function(x) { return ""+x});
            
        } else {
            var args = ["f"];
            var params = [""+value]; 
        }
        ws.send(
            JSON.stringify({
                target: osctarget,
                path: path,
                args: args,
                params: params
            }));
    }
    return ready;
};



var seq = new Sequencer({ticks: ticks, duration: globalDuration, delegate: sender});
function addDef(def) {
    if (def.table) {
        if (def.size) {
            var tlu = seq.generateTableAndUI(def.size);
        } else {
            var ts = document.getElementById("tableSize");
            var size = parseInt(ts.options[ts.selectedIndex].text);
            console.log(size);
            var tlu = seq.generateTableAndUI(size);
        }
    } else {
        var tlu = seq.generateTimeLineAndUI();
    }
    var timeLine = tlu[0];
    timeLine.name = def.path;
    var timeLineUI = tlu[1];
    if (def.background) {
        timeLineUI.background = def.background;
    }
    if (!def.table) {
        timeLineUI.bottom = 0.0;
    }
    // main.appendChild( );
    var tc = new TimeLineControls( timeLine, timeLineUI );
    var container = document.createElement("div");
    container.classList.add('tccontainer');
    container.appendChild(
        tc.getDom()
    );
    container.appendChild(
        timeLineUI.getDom()
    );
    main.appendChild(container);
    if (!def.table) {
        timeLine.addPoints([0.5,0.0]);
    }
}

function startSeq(defs) {
    
    for (var i = 0; i < defs.length; i++) {
        addDef(defs[i]);
    }
    seq.start();
    var addTimeLine = document.getElementById("addTimeLine");
    var addTable = document.getElementById("addTable");
    
    function generateNewDef() {
        var def = {
            "path":"/timeline/"+(defs.length+1)
        };    
        addDef(def);
        defs.push(def);
    }
    function generateNewTableDef() {
        var def = {
            "path":"/table/"+(defs.length+1),
            "table":true
        };    
        addDef(def);
        defs.push(def);
    }
    
    
    addTimeLine.addEventListener("click",function() {
        generateNewDef();
    });
    addTable.addEventListener("click",function() {
        generateNewTableDef();
    });
}



