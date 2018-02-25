//s.boot;
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

~makeLinSetter = {|mySynth,param,low2=0.0,hi2=1.0,low=0.0,hi=1.0| 
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



SynthDef(\singrain, { |freq = 440, amp = 0.2, sustain = 1|
    var sig;
    sig = SinOsc.ar(freq, 0, amp) * EnvGen.kr(Env.perc(0.01, sustain), doneAction: 2);
    Out.ar(0, sig ! 2);    // sig ! 2 is the same as [sig, sig]
}).add;


// Puts into a dictionary instead of settings
~makeLinMidiPutter = {|mySynth,param,low2,hi2,low=0.0,hi=1.0| 
	{|msg|
		mySynth.put(param,msg[1].linlin(low,hi,low2,hi2).midicps)
	}
};
~makeLinPutter = {|mySynth,param,low2=0.0,hi2=1.0,low=0.0,hi=1.0| 
	{|msg|
		mySynth.put(param,msg[1].linlin(low,hi,low2,hi2))
	}
};
~makeExpPutter = {|mySynth,param,low2=0.0001,hi2=1.0,low=0.0,hi=1.0| 
	{|msg|
		mySynth.put(param,msg[1].linexp(low,hi,low2,hi2))
	}
};


~singrainprop = ();
~singrainprop.put(\freq,0.0);
~singrainprop.put(\amp,0.0);
~singrainprop.put(\sustain,0.0);
OSCFunc.newMatching(~makeLinMidiPutter.(~singrainprop,\freq,40,100), '/singrain/freq');
OSCFunc.newMatching(~makeLinPutter.(~singrainprop,\amp,0,1.0), '/singrain/amp');
OSCFunc.newMatching(~makeExpPutter.(~singrainprop,\sustain,0.001,5), '/singrain/sustain');
~sinemitter = {
	|msg|
	if( 1.0.rand < msg[1], {
		Synth(\singrain, [\freq,~singrainprop.at(\freq),\amp,~singrainprop.at(\amp),\sustain,~singrainprop.at(\sustain)]);
	});
};
OSCFunc.newMatching(~sinemitter, '/singrain/emit');

SynthDef(\noiseGrain, 
	{ arg out = 0, freq=800, sustain=0.001, amp=0.5, pan = 0; // this are the arguments of the synth function
		var window;
		window = Env.perc(0.002, sustain, amp); // exponential decay envelope
		Out.ar(out, // write to output bus
			Pan2.ar( // panning
				Ringz.ar(PinkNoise.ar(0.1), freq, 2.6), // filtered noise
				pan
			) * EnvGen.ar(window, doneAction:2) // multiplied by envelope
		)
	}
).store;

~noisegrainprop = ();
~noisegrainprop.put(\freq,0.0);
~noisegrainprop.put(\amp,0.0);
~noisegrainprop.put(\sustain,0.0);
OSCFunc.newMatching(~makeLinMidiPutter.(~noisegrainprop,\freq,30,100), '/noisegrain/freq');
OSCFunc.newMatching(~makeLinPutter.(~noisegrainprop,\amp,0,1.0), '/noisegrain/amp');
OSCFunc.newMatching(~makeExpPutter.(~noisegrainprop,\sustain,0.001,5), '/noisegrain/sustain');
~sinemitter = {
	|msg|
	if( 1.0.rand < msg[1], {
		Synth(\noiseGrain, [\freq,~noisegrainprop.at(\freq),\amp,~noisegrainprop.at(\amp),\sustain,~noisegrainprop.at(\sustain)]);
	});
};
OSCFunc.newMatching(~sinemitter, '/noisegrain/emit');



	SynthDef("blipsaw",
		{ 
			arg out=0,freq=60,fadd=0,ffreq=10,ffmul=10,ffadd=0,harmfreq=0.1,hmul=3,amp=0.2,delaytime=0.0,decaytime=0.0;
			Out.ar(out,
				Clip.ar(
					0.8*CombC.ar(
						Blip.ar(LinLin.kr(freq,0,1.0,10,80).midicps
							+LinLin.kr(fadd,0,1.0,-30.0,30.0)+
							LFSaw.kr(LinLin.kr(ffreq,0,1.0,0.1,30),mul:LinLin.kr(ffmul,0,1.0,0.1,2))!2,
							LFSaw.kr(LinLin.kr(harmfreq,0,1.0,0.01,1.0),mul:
								LinLin.kr(hmul,0,1.0,0.01,0.3)),
							LinLin.kr(amp,0,1.0,0.0,0.9)),
						2.1,
						LinLin.kr(delaytime,0,1.0,0.01,1.5),//0.2,
						LinLin.kr(decaytime,0,1.0,0.01,2.0)//1.0
					)
					, -0.5, 0.5
				)
			)
		}
	).load(s);
~blipsaw = Synth(\blipsaw);
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\freq,0.0,1.0), '/blipsaw/freq');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\harmfreq,0.0,1.0), '/blipsaw/harmfreq');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\delaytime,0.0,1.0), '/blipsaw/delaytime');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\decaytime,0.0,1.0), '/blipsaw/decaytime');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\amp,0.0,1.0), '/blipsaw/amp');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\ffreq,0.0,20.0), '/blipsaw/ffreq');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\ffmul,0.0,20.0), '/blipsaw/ffmul');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\hmul,0.0,6.0), '/blipsaw/hmul');
~blipsaw.set(\freq, 0.5);

	SynthDef(\pinknoiser,{arg out=0,amp=0.0,lpf=0.0,shift=0.0,pitchdisp=0.0,timedisp=0.0;
		Out.ar(out,
			4.0*amp*
			PitchShift.ar(		
				LPF.ar(PinkNoise.ar(),LinLin.kr(lpf,0,1.0,30,200)),	// stereo audio input
				0.1, 			// grain size
				LinLin.kr(shift,0,1.0,0.5,16), // mouse x controls pitch shift ratio
				pitchdisp, 				// pitch dispersion
				LinExp.kr(timedisp,0,1,0.001,0.1)	// time dispersion
			)!2
		);
	}).add;
~pinknoiser = Synth(\pinknoiser,[\amp,0.0,\lpf,0.5]);
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\amp,0.0,1.0),       '/pinknoiser/amp'      );
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\lpf,0.0,1.0),       '/pinknoiser/lpf'      );
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\shift,0.0,1.0),     '/pinknoiser/shift'    );
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\pitchdisp,0.0,1.0), '/pinknoiser/pitchdisp');
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\timedisp,0.0,1.0),  '/pinknoiser/timedisp' );

SynthDef(\noiser,{arg out=0,lpf=0.0,shift=0.0,pitchdisp=0.0,timedisp=0.0,pink=0.0,white=0.0,brown=0.0,rq=0.5;
		Out.ar(out,
			Clip.ar(
			4.0*
			PitchShift.ar(		
				RLPF.ar(
					(pink*PinkNoise.ar() + white*WhiteNoise.ar()+ brown*BrownNoise.ar())/3.0
					,LinLin.kr(lpf,0,1.0,30,200)
					,Lag.kr(rq,0.1)
				),	// stereo audio input
				0.1, 			// grain size
				LinLin.kr(shift,0,1.0,0.5,16), // mouse x controls pitch shift ratio
				pitchdisp, 				// pitch dispersion
				LinExp.kr(timedisp,0,1,0.001,0.1)	// time dispersion
			)!2
			,-0.9,0.9)
		);
	}).add
;


(
	Ndef(\x,	{
		var output;
		var delayTime;
		var delayMax = 0.22;
		var delayAdd = 0.07;
		var pulseFreq = 0.5;
		var proxyMul = 10;
		var pulseMin = 30;
		var pulseMax = 150;
		var numOfEchos = 6;
		var mainPulse = LFPulse.ar(pulseFreq, 0, 0.5).range(pulseMin, pulseMax);
		var proxy = Ndef(\x).ar * proxyMul;
		var ampModFreq = SinOsc.ar(0.01, 0).range(0.3, 30);
		var ampMod = LFNoise2.ar(ampModFreq, 6);
		output = SinOsc.ar(mainPulse + proxy, 0, ampMod).tanh;
		numOfEchos.do{
			delayTime = {delayMax.rand + delayAdd}!2;
			output = AllpassL.ar(output, 0.1, delayTime, 5);
		};
	output.tanh;
	}).play
)

(
	Ndef(\z,	{
		var output;
		var delayTime;
		var delayMax = 0.22;
		var delayAdd = 0.07;
		var pulseFreq = 0.5;
		var proxyMul = 10;
		var pulseMin = 30;
		var pulseMax = 2000;
		var numOfEchos = 6;
		var mainPulse = LFPulse.ar(pulseFreq, 0, 0.5).range(pulseMin, pulseMax);
		var proxy = Ndef(\z).ar * proxyMul;
		var ampModFreq = SinOsc.ar(0.01, 0).range(0.3, 30);
		var ampMod = LFNoise2.ar(ampModFreq, 6);
		output = SinOsc.ar(mainPulse + proxy, 0, ampMod).tanh;
		numOfEchos.do{
			delayTime = {delayMax.rand + delayAdd}!2;
			output = AllpassL.ar(output, 0.1, delayTime, 5);
		};
	output.tanh * 0.5;
	}).play
)



(
	Ndef(\y,	{
		var output;
		var delayTime;
		var delayMax = 0.2;
		var delayAdd = 0.07;
		var pulseFreq = 0.5;
		var proxyMul = 2;
		var pulseMin = 40;
		var pulseMax = 130;
		var numOfEchos = 1;

		var mainPulse = LFPulse.ar(pulseFreq, 0, 0.5).range(pulseMin, pulseMax);
		var proxy = Ndef(\y).ar * proxyMul;
		var ampModFreq = SinOsc.ar(0.01, 0).range(0.3, 30);
		var ampMod = LFNoise2.ar(ampModFreq, 1+proxy);
		output = SinOsc.ar(mainPulse, 0, ampMod).tanh;
		output = AllpassL.ar(output, 0.1, 0.1, 5);		
		output.tanh
	}).play
)


(
Ndef(\y,	{
	arg pulseFreq = 0.5;
	var output;
	var mainPulse = LFNoise2.ar(freq:pulseFreq, mul: 1.0, add:0.1).range(80,160);
	output = SinOsc.ar(mainPulse + (Ndef(\y).ar * 4), 0, 1.0).tanh;
	output = AllpassL.ar(output, 0.1, 0.1, 5);		
	output.tanh
}).play
)


n=LFNoise1;Ndef(\x,{a=SinOsc.ar(65,Ndef(\x).ar*n.ar(0.1,3),n.ar(3,6)).tanh;9.do{a=AllpassL.ar(a,0.3,{0.2.rand+0.1}!2,5)};a.tanh}).play


n=LFNoise0;
Ndef(\x,
	{
		var output;
		output=SinOsc.ar(65,Ndef(\x).ar*n.ar(0.1,3).tanh + 1.4,n.ar(3,6)+0.1).tanh;
		32.do{ output=AllpassL.ar(output + (0.5.rand * Ndef(\x).ar),0.3,{0.42.rand+0.01},5) };
		output.tanh
	}
).play


