/*
s.boot;
s.scope;
*/


SynthDef("help-In2", { arg out=0;
    Out.ar(out, SoundIn.ar([0,1]))
}).add;

/*
SynthDef("help-In", { arg out=0, in=0;
    var input;
        input = In.ar(in, 2);
        Out.ar(out, input);
}).add;

*/

~b = Bus.audio(s,2);
x = Synth("help-In2", [\out, ~b.index]);
~b.scope;


/*
//read the input and play it out on the left channel
Synth.after(x, "help-In", [\out, 0, \in, ~b.index]);
~b.index
*/

SynthDef(\scanner, {
	arg out=0, start = -1, end = 1, freq=10, amp=0.1;
	var sr = SampleRate.ir;
	Out.ar(out, amp*Phasor.ar(rate: (end - start) * freq / sr, start: start, end: end))
}).add;

SynthDef(\ssaw, {
	arg out=0, freq=10, amp=0.1;
	Out.ar(out, amp*Saw.ar(freq, mul: 1))
}).add;

SynthDef(\stri, {
	arg out=0, freq=10, amp=0.1;
	Out.ar(out, LFTri.ar(freq, iphase:0, mul: amp))
}).add;


/*

~sc1 = Synth(\scanner,[\out,~b.index, \freq, 20]);
~sc2 = Synth(\scanner,[\out,~b.index + 1,\freq, 30]);
~sc1.set(\freq,30);
~sc2.set(\freq,-0.1);
~sc3 = Synth(\scanner,[\out,0,\freq, 30,\amp,0.0]);
~sc3.set(\amp,0.1);
~sc3.set(\freq,0.1);

*/

/* 
{Out.ar(0,LFTri.ar(5, mul: 0.1))}.play;
{Out.ar(1,Saw.ar(80, mul: 0.1))}.play;
{Out.ar(1,Saw.ar(7, mul: 0.1))}.play;
*/

/*

~sc1 = Synth(\scanner,[\out,0, \freq, 20]);
~sc2 = Synth(\scanner,[\out,0,\freq, 30]);
~sc1.set(\freq, -12111);
~sc2.set(\freq, 12);
~sc2.set(\out, 1);
().play;

SynthDefAutogui(\stri)
~scy = Synth(\stri,[\out,1, \freq, 1, \amp, 0.1]).autogui;
~scx = Synth(\ssaw,[\out,0, \freq, 40]);
~scx2 = Synth(\ssaw,[\out,0, \freq, 60]);
~scx2 = Synth(\ssaw,[\out,0, \freq, 80, \amp, 0.05]);

~scy.set(\freq,30)
~scy3 = Synth(\ssaw,[\out,1, \freq, 40]);
~scy4 = Synth(\ssaw,[\out,1, \freq, 60]);
~scy5 = Synth(\ssaw,[\out,1, \freq, 80, \amp, 0.05]);
~scy.autogui


x = ().play;
x.autogui
*/

// 24 is is cminor

// 29 is F1
// F G Ab Bb C Db Eb
// 0 2 3  5  7 8  10
// check

~centerkey = 29; // fminor
~centerkey = 24; // cminor

~ffreqs = Scale.minor.degreeToFreq((0..(8*7)), ~centerkey.midicps, 0);
~fnotes = (0..7).collect {|x| (Scale.minor.degrees) + (x*12)+~centerkey }.flatten;

// need these for F
//    I – G major, G major seventh (Gmaj, Gmaj7)
//    ii – A minor, A minor seventh (Am, Am7)
//    iii – B minor, B minor seventh (Bm, Bm7)
//    IV – C major, C major seventh (C, Cmaj 7)
//    V – D major, D dominant seventh (D, D7)
//    vi – E minor, E minor seventh (Em, Em7)
//    vii – F# diminished, F# minor seventh flat five (F#°, F#m7b5)
// Common chord progressions in G major
// I - IV - V 	    G - C - D
// I - vi - IV - V 	G - Em - C - D
// ii - V - I 	    Am - D7 - GM7
~gmaj   = [0, 2, 4]; //G B D
~gmaj7  = [0, 2, 4, 6]; //G B D F#
~amin   = [1,3,5]; // A C E
~bmin   = [2,4,6];//B D F#
~bmin7  = [2,4,6,8];//B D F# A
~cmaj   = [-4,-2,0]; //C E G
~cmaj7  = [-4,-2,0,2]; //C E G
~dmaj   = [-3,-1,1];//DF#A
~dmaj7  = [-3,-1,1,3];//DF#AC
~emin   = [-2,0,2];//EGB
~emin7  = [-2,0,2,4];//EGBD
~fsdim  = [-1,1,3];//F#AC
~fsdim7 = [-1,1,3,5];//F#ACE

~chords = [~gmaj,~amin,~bmin,~cmaj,~dmaj,~emin,~fsdim];
~chords7 = [~gmaj7,~bmin7,~cmaj7,~dmaj7,~emin7,~fsdim7];
~allchords = [~chords,~chords7].lace(); // zip

// I - vi - IV - V 	G - Em - C - D
// ii - V - I 	    Am - D7 - GM7
//
~progI = [~gmaj,~cmaj,~dmaj];
~progII = [~gmaj,~emin,~cmaj,~dmaj];
~gsmroot = ~fnotes - 60;
~fsmroot = ~fnotes - 60;

SynthDef(\drone, { |out, freq = 440, gate = 0.5, amp = 1.0, attack = 0.04, release=0.1 |
	var sig,nsize,n = (2..20);
	nsize = n.size;
	sig = ((
		n.collect {arg i; 
			SinOsc.ar( (1.0 - (1.0/(i*i))) * freq )
		}).sum / nsize)
	* EnvGen.kr(Env.adsr(attack, 0.2, 0.6, release), gate, doneAction:2)
	* amp;
    Out.ar(out, sig ! 2)
}).add;


SynthDef(\hydro4, {
	|out=0,amp=1.0,freq1=440,freq2=200,freq3=320,lpf=60,rq=0.5|
	var nsize,n = (2..10);
	nsize = n.size;
	Out.ar(0,
		Lag.kr(amp,0.1) * 
		RLPF.ar((
			n.collect {arg i; 
				// SinOsc.ar( (1.0 - (1/(i*i))) * 2*freq1 ) +
				SinOsc.ar( (1.0 - (1/(i*i))) * freq1 ) +
				// SinOsc.ar( (1.0 - (1/(i*i))) * freq2 ) +
				SinOsc.ar( (1.0 - (1/(i*i))) * freq2 ) +
				SinOsc.ar( (1.0 - (1/(i*i))) * freq3 ) 
				// SinOsc.ar( ((1/4) - (1/((i+1)*(i+1)))) * freq3)
			}).sum / (3 * nsize)
			,Lag.kr(lpf,0.1)
			,Lag.kr(rq,0.1))
	)
}).add;


SynthDef(\singrain, { |freq = 440, amp = 0.2, sustain = 1|
    var sig;
    sig = SinOsc.ar(freq, 0, amp) * EnvGen.kr(Env.perc(0.01, sustain), doneAction: 2);
    Out.ar(0, sig ! 2);    // sig ! 2 is the same as [sig, sig]
}).add;

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

	SynthDef(\pinknoiser,{arg out=0,amp=0.0,lpf=0.0,shift=0.0,pitchdisp=0.0,timedisp=0.0;
		Out.ar(out,
			4.0*amp*
			PitchShift.ar(		
				LPF.ar(PinkNoise.ar(),lpf),	// stereo audio input
				0.1, 			// grain size
				LinLin.kr(shift,0,1.0,0.0,16), // mouse x controls pitch shift ratio
				pitchdisp, 				// pitch dispersion
				LinExp.kr(timedisp,0,1,0.001,0.1)	// time dispersion
			)!2
		);
	}).add;


	SynthDef("blipsaw",
		{ 
			arg out=0,freq=60,fadd=0,ffreq=10,ffmul=10,ffadd=0,harmfreq=0.1,hmul=3,amp=0.2,delaytime=0.0,decaytime=0.0;
			Out.ar(out,
				Clip.ar(
					0.8*CombC.ar(
						Blip.ar(freq //LinLin.kr(freq,0,1.0,10,80).midicps
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


SynthDef(\trisynth, {
	|out=0,bufsize=32,amp=0.0,lpfreq=440,lprq=0.5,b1,b2,b3,b1rate,b2rate,b3rate|
	Out.ar(out,
		amp * 
		BLowPass4.ar(
			(PlayBuf.ar(1, bufnum:b1, rate:b1rate, loop: 1) +
				PlayBuf.ar(1, bufnum:b2, rate:b2rate, loop: 1) +
				PlayBuf.ar(1, bufnum:b3, rate:b3rate, loop: 1)) * 0.3,
			freq: lpfreq,
			rq: lprq
		)
	);
}).load(s);


SynthDef(\ringsynth, {
	|out=0,bufsize=32,amp=0.0,lpfreq=440,lprq=0.5,b1,b2,b3,b1rate,b2rate,b3rate|
	Out.ar(out,
		amp * 
		BLowPass4.ar(
			( 0.3 *
				(PlayBuf.ar(1, bufnum:b1, rate:b1rate, loop: 1) +
					PlayBuf.ar(1, bufnum:b2, rate:b2rate, loop: 1)
				) *	PlayBuf.ar(1, bufnum:b3, rate:b3rate, loop: 1)),
			freq: lpfreq,
			rq: lprq
		)
	);
}).load(s);


SynthDef(\quadsynth, {
	|out=0,bufsize=32,amp=0.0,lpfreq=440,lprq=0.5,b1,b2,b3,b4,b1rate,b2rate,b3rate,b4rate|
	Out.ar(out,
		amp * 
		BLowPass4.ar(
			( 0.3 *
				(PlayBuf.ar(1, bufnum:b1, rate:b1rate, loop: 1) +
					PlayBuf.ar(1, bufnum:b2, rate:b2rate, loop: 1)
				) *	PlayBuf.ar(1, bufnum:b3, rate:b3rate, loop: 1)),
			freq: lpfreq,
			rq: lprq
		)
	);
}).load(s);





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
~makeLinFmMidiSetter = {|mySynth,param,low2,hi2,low=0.0,hi=1.0| 
	{|msg|
		mySynth.set(param, ~fnotes.[~fnotes.indexIn( msg[1].linlin(low,hi,low2,hi2) ) ].midicps)
	}
};


~hydro4 = Synth(\hydro4);
~hydro4.set(\lpf,2000);
~hydro4.set(\amp,0);

OSCFunc.newMatching(~makeLinFmMidiSetter.(~hydro4,\freq1,40,100), '/hydro4/freq1');
OSCFunc.newMatching(~makeLinFmMidiSetter.(~hydro4,\freq2,40,100), '/hydro4/freq2');
OSCFunc.newMatching(~makeLinFmMidiSetter.(~hydro4,\freq3,40,100), '/hydro4/freq3');
OSCFunc.newMatching(~makeLinFmMidiSetter.(~hydro4,\lpf,1,100), '/hydro4/lpf');
OSCFunc.newMatching(~makeLinSetter.(~hydro4,\rq,0.0,1.0), '/hydro4/rq');
OSCFunc.newMatching(~makeLinSetter.(~hydro4,\amp,0.0,1.0), '/hydro4/amp');





// Puts into a dictionary instead of settings
~makeLinMidiPutter = {|mySynth,param,low2,hi2,low=0.0,hi=1.0| 
	{|msg|
		mySynth.put(param,msg[1].linlin(low,hi,low2,hi2).midicps)
	}
};
~makeLinFmMidiPutter = {|mySynth,param,low2,hi2,low=0.0,hi=1.0| 
	{|msg|
		mySynth.put(param,~fnotes.[~fnotes.indexIn( msg[1].linlin(low,hi,low2,hi2) ) ].midicps)
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
OSCFunc.newMatching(~makeLinFmMidiPutter.(~singrainprop,\freq,30,100), '/singrain/freq');
OSCFunc.newMatching(~makeLinPutter.(~singrainprop,\amp,0,1.0), '/singrain/amp');
OSCFunc.newMatching(~makeExpPutter.(~singrainprop,\sustain,0.001,5), '/singrain/sustain');

~sinemitter = {
	|msg|
	if( 1.0.rand < msg[1], {
		Synth(\singrain, [\freq,~singrainprop.at(\freq),\amp,~singrainprop.at(\amp),\sustain,~singrainprop.at(\sustain)]);
	});
};
OSCFunc.newMatching(~sinemitter, '/singrain/emit');


~noisegrainprop = ();
~noisegrainprop.put(\freq,0.0);
~noisegrainprop.put(\amp,0.0);
~noisegrainprop.put(\sustain,0.0);
OSCFunc.newMatching(~makeLinFmMidiPutter.(~noisegrainprop,\freq,30,100), '/noisegrain/freq');
OSCFunc.newMatching(~makeLinPutter.(~noisegrainprop,\amp,0,1.0), '/noisegrain/amp');
OSCFunc.newMatching(~makeExpPutter.(~noisegrainprop,\sustain,0.001,5), '/noisegrain/sustain');
~sinemitter = {
	|msg|
	if( 1.0.rand < msg[1], {
		Synth(\noiseGrain, [\freq,~noisegrainprop.at(\freq),\amp,~noisegrainprop.at(\amp),\sustain,~noisegrainprop.at(\sustain)]);
	});
};
OSCFunc.newMatching(~sinemitter, '/noisegrain/emit');



~blipsaw = Synth(\blipsaw);
OSCFunc.newMatching(~makeLinFmMidiSetter.(~blipsaw,\freq,10,80), '/blipsaw/freq');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\harmfreq,0.0,1.0), '/blipsaw/harmfreq');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\delaytime,0.0,1.0), '/blipsaw/delaytime');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\decaytime,0.0,1.0), '/blipsaw/decaytime');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\amp,0.0,1.0), '/blipsaw/amp');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\ffreq,0.0,20.0), '/blipsaw/ffreq');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\ffmul,0.0,20.0), '/blipsaw/ffmul');
OSCFunc.newMatching(~makeLinSetter.(~blipsaw,\hmul,0.0,6.0), '/blipsaw/hmul');
~blipsaw.set(\freq, 0.5);

~pinknoiser = Synth(\pinknoiser,[\amp,0.0,\lpf,0.5]);
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\amp,0.0,1.0),       '/pinknoiser/amp'      );
OSCFunc.newMatching(~makeLinFmMidiSetter.(~pinknoiser,\lpf,10,100),       '/pinknoiser/lpf'      );
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\shift,0.0,1.0),     '/pinknoiser/shift'    );
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\pitchdisp,0.0,1.0), '/pinknoiser/pitchdisp');
OSCFunc.newMatching(~makeLinSetter.(~pinknoiser,\timedisp,0.0,1.0),  '/pinknoiser/timedisp' );

// ~fnotes
// 41.midicps

~makeTriSynth = {
	arg bufsize=32,out=0,synth=\trisynth;
	var b1,b2,b3,syn, outd;
	outd = ();
	outd["b1"] = b1;
	b1 = Buffer.alloc(s, bufsize, 1);
	b2 = Buffer.alloc(s, bufsize, 1);
	b3 = Buffer.alloc(s, bufsize, 1);
	syn = Synth(synth,[
		\out,out,
		\bufsize, bufsize,
		\b1, b1.bufnum,
		\b2, b2.bufnum,
		\b3, b3.bufnum,
		\b1rate, 1.0,
		\b2rate, 1.0,
		\b3rate, 1.0
	]);
	outd[\bufsize] = bufsize;
	outd[\b1] = b1;
	outd[\b2] = b2;
	outd[\b3] = b3;
	outd[\synth] = syn;
	outd;
};

~tri = ~makeTriSynth.();
~trisynth = ~tri[\synth];
// ~tri[\b1].setn(0,(1 .. 200) / 200.0)

~makeArrayBufSetter = { |buf,bufsize|
	{
		|msg|
		buf.setn(0,msg[ 1 .. bufsize ].asFloat);
	}
};
~makeExpSetter = {|mySynth,param,low2=0.0,hi2=1.0,low=0.0,hi=1.0| 
	{|msg|
		mySynth.set(param,msg[1].linexp(low,hi,low2,hi2))
	}
};

OSCFunc.newMatching(~makeLinSetter.(~trisynth,\amp,0.0,1.0),    '/trisynth/amp');
OSCFunc.newMatching(~makeExpSetter.(~trisynth,\b1rate,0.01,2.0),    '/trisynth/b1rate');
OSCFunc.newMatching(~makeExpSetter.(~trisynth,\b2rate,0.01,2.0),    '/trisynth/b2rate');
OSCFunc.newMatching(~makeExpSetter.(~trisynth,\b3rate,0.01,2.0),    '/trisynth/b3rate');
OSCFunc.newMatching(~makeLinMidiSetter.(~trisynth,\lpfreq,20,100),    '/trisynth/lpf');
OSCFunc.newMatching(~makeLinSetter.(~trisynth,\lprq,0.001,1.0),    '/trisynth/lprq');

OSCFunc.newMatching(~makeArrayBufSetter.(~tri[\b1],~tri[\bufsize]), '/trisynth/b1');
OSCFunc.newMatching(~makeArrayBufSetter.(~tri[\b2],~tri[\bufsize]), '/trisynth/b2');
OSCFunc.newMatching(~makeArrayBufSetter.(~tri[\b3],~tri[\bufsize]), '/trisynth/b3');

OSCFunc.newMatching({|msg| msg.postln}, '/trisynth/b1');


~ring = ~makeTriSynth.(synth: \ringsynth);
~ringsynth = ~ring[\synth];

~makeLinFmMidiRateSetter = {|mySynth,param,low2,hi2,low=0.0,hi=1.0,samples=32| 
	{|msg|
		var rate = s.sampleRate/(samples * ~fnotes.[~fnotes.indexIn( msg[1].linlin(low,hi,low2,hi2) ) ].midicps);
		mySynth.set(param, rate)
	}
};



OSCdef(\rsamp,~makeLinSetter.(~ringsynth,\amp,0.0,1.0),    '/ringsynth/amp');
OSCdef(\rsb1r,~makeLinFmMidiRateSetter.(~ringsynth,\b1rate,40,120),    '/ringsynth/b1rate');
OSCdef(\rsb2r,~makeLinFmMidiRateSetter.(~ringsynth,\b2rate,30,100),    '/ringsynth/b2rate');
OSCdef(\rsb3r,~makeLinFmMidiRateSetter.(~ringsynth,\b3rate,0,100),    '/ringsynth/b3rate');
OSCdef(\rslpr,~makeLinMidiSetter.(~ringsynth,\lpfreq,20,100),    '/ringsynth/lpf');
OSCdef(\rsrq,~makeLinSetter.(~ringsynth,\lprq,0.001,1.0),    '/ringsynth/lprq');
OSCdef(\rsb1,~makeArrayBufSetter.(~ring[\b1],~ring[\bufsize]), '/ringsynth/b1');
OSCdef(\rsb2,~makeArrayBufSetter.(~ring[\b2],~ring[\bufsize]), '/ringsynth/b2');
OSCdef(\rsb3,~makeArrayBufSetter.(~ring[\b3],~ring[\bufsize]), '/ringsynth/b3');



~xsaw1 = Synth(\ssaw,[\out,0, \freq, 10, \amp, 0]);
~ysaw1 = Synth(\ssaw,[\out,1, \freq, 10, \amp, 0]);
OSCFunc.newMatching(~makeLinSetter.(~xsaw1,\freq,0,100.0), '/xsaw1/freq');
OSCFunc.newMatching(~makeLinSetter.(~xsaw1,\amp,0,1.0),    '/xsaw1/amp');
OSCFunc.newMatching(~makeLinSetter.(~ysaw1,\freq,0,100.0), '/ysaw1/freq');
OSCFunc.newMatching(~makeLinSetter.(~ysaw1,\amp,0,1.0),    '/ysaw1/amp');
~xsaw2 = Synth(\ssaw,[\out,0, \freq, 10, \amp, 0]);
~ysaw2 = Synth(\ssaw,[\out,1, \freq, 10, \amp, 0]);
OSCFunc.newMatching(~makeLinSetter.(~xsaw2,\freq,0,100.0), '/xsaw2/freq');
OSCFunc.newMatching(~makeLinSetter.(~xsaw2,\amp,0,1.0),    '/xsaw2/amp');
OSCFunc.newMatching(~makeLinSetter.(~ysaw2,\freq,0,100.0), '/ysaw2/freq');
OSCFunc.newMatching(~makeLinSetter.(~ysaw2,\amp,0,1.0),    '/ysaw2/amp');

~xtri1 = Synth(\stri,[\out,0, \freq, 10, \amp, 0]);
~ytri1 = Synth(\stri,[\out,1, \freq, 10, \amp, 0]);
OSCFunc.newMatching(~makeLinSetter.(~xtri1,\freq,0,100.0), '/xtri1/freq');
OSCFunc.newMatching(~makeLinSetter.(~xtri1,\amp,0,1.0),    '/xtri1/amp');
OSCFunc.newMatching(~makeLinSetter.(~ytri1,\freq,0,100.0), '/ytri1/freq');
OSCFunc.newMatching(~makeLinSetter.(~ytri1,\amp,0,1.0),    '/ytri1/amp');
~xtri2 = Synth(\stri,[\out,0, \freq, 10, \amp, 0]);
~ytri2 = Synth(\stri,[\out,1, \freq, 10, \amp, 0]);
OSCFunc.newMatching(~makeLinSetter.(~xtri2,\freq,0,100.0), '/xtri2/freq');
OSCFunc.newMatching(~makeLinSetter.(~xtri2,\amp,0,1.0),    '/xtri2/amp');
OSCFunc.newMatching(~makeLinSetter.(~ytri2,\freq,0,100.0), '/ytri2/freq');
OSCFunc.newMatching(~makeLinSetter.(~ytri2,\amp,0,1.0),    '/ytri2/amp');

~xscan1 = Synth(\scanner,[\out,0, \freq, 10, \amp, 0]);
~yscan1 = Synth(\sscanner,[\out,1, \freq, 10, \amp, 0]);
OSCFunc.newMatching(~makeLinSetter.(~xscan1,\freq,0,100.0), '/xscan1/freq');
OSCFunc.newMatching(~makeLinSetter.(~xscan1,\amp,0,1.0),    '/xscan1/amp');
OSCFunc.newMatching(~makeLinSetter.(~yscan1,\freq,0,100.0), '/yscan1/freq');
OSCFunc.newMatching(~makeLinSetter.(~yscan1,\amp,0,1.0),    '/yscan1/amp');
~xscan2 = Synth(\scanner,[\out,0, \freq, 10, \amp, 0]);
~yscan2 = Synth(\scanner,[\out,1, \freq, 10, \amp, 0]);
OSCFunc.newMatching(~makeLinSetter.(~xscan2,\freq,0,100.0), '/xscan2/freq');
OSCFunc.newMatching(~makeLinSetter.(~xscan2,\amp,0,1.0),    '/xscan2/amp');
OSCFunc.newMatching(~makeLinSetter.(~yscan2,\freq,0,100.0), '/yscan2/freq');
OSCFunc.newMatching(~makeLinSetter.(~yscan2,\amp,0,1.0),    '/yscan2/amp');





/*
~fund = 111.0;
~fund = ~fund * 0.999;
~hydro4.set(\rq,0.9);
~hydro4.set(\lpf,4.5*~fund);
~hydro4.set(\freq2,2*~fund);
~hydro4.set(\freq3,3*~fund);
~hydro4.set(\freq1,4*~fund);
~fund
().play
*/
/*
~trisynth.autogui

~tri[\b1].plot
*/


