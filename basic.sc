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

~makeLinSetter = {|mySynth,param,low2,hi2,low=0.0,hi=1.0| 
	{|msg|
		mySynth.set(param,msg[1].linlin(low,hi,low2,hi2))
	}
};
~makeLinMidiSetter = {|mySynth,param,low2,hi2,low=0.0,hi=1.0| 
	{|msg|
		mySynth.set(param,msg[1].linlin(low,hi,low2,hi2).midicps)
	}
};
	
~hydro4 = Synth(\hydro4);
~hydro4.set(\lpf,2000);

OSCFunc.newMatching(~makeLinMidiSetter.(~hydro4,\freq1,40,100), '/hydro4/freq1');
OSCFunc.newMatching(~makeLinMidiSetter.(~hydro4,\freq2,40,100), '/hydro4/freq2');
OSCFunc.newMatching(~makeLinMidiSetter.(~hydro4,\freq3,40,100), '/hydro4/freq3');
OSCFunc.newMatching(~makeLinMidiSetter.(~hydro4,\lpf,1,100), '/hydro4/lpf');
OSCFunc.newMatching(~makeLinSetter.(~hydro4,\rq,0.0,1.0), '/hydro4/rq');
OSCFunc.newMatching(~makeLinSetter.(~hydro4,\amp,0.0,1.0), '/hydro4/amp');


