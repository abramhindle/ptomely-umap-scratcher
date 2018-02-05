s.boot;
SynthDef(\hydro4, {
	|out=0,amp=1.0,freq1=440,freq2=200,freq3=320,lpf=60,rq=0.5|
	var nsize,n = (2..10);
	nsize = n.size;
	Out.ar(0,
		Lag.kr(amp,0.1) * 
		RLPF.ar((
			n.collect {arg i; 
				SinOsc.ar( (1.0 - (1/(i*i))) * 2*freq1 ) +
				SinOsc.ar( (1.0 - (1/(i*i))) * freq2 ) +
				SinOsc.ar( ((1/4) - (1/((i+1)*(i+1)))) * freq3)
			}).sum / (3 * nsize)
			,Lag.kr(lpf,0.1)
			,Lag.kr(rq,0.1))
	)
}).add;

~hydro4 = Synth(\hydro4);
~hydro4.set(\lpf,2000);
~handler1 = {|msg|
	var v;
	v = msg[1];
	~hydro4.set(\freq1,msg[1].linlin(0,1,20,100).midicps);
};
~handler2 = {|msg|
	var v;
	v = msg[1];	
	~hydro4.set(\freq2,msg[1].linlin(0,1,30,100).midicps);
};
~handler3 = {|msg|
	var v;
	v = msg[1];	
	~hydro4.set(\freq3,msg[1].linlin(0,1,50,120).midicps);
};
~handler4 = {|msg|
	var v;
	v = msg[1];
	~hydro4.set(\lpf,msg[1].linexp(0,1,200,4000));
};
~handler5 = {|msg|
	var v;
	v = msg[1];	
	~hydro4.set(\rq,msg[1].linlin(0,1,0.01,1.0));
};

OSCFunc.newMatching(~handler1, '/timeline/1');
OSCFunc.newMatching(~handler2, '/timeline/2');
OSCFunc.newMatching(~handler3, '/timeline/3');
OSCFunc.newMatching(~handler4, '/timeline/4');
OSCFunc.newMatching(~handler5, '/timeline/5');

