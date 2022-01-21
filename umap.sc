s.quit;
s.options.numBuffers = 16000;
s.options.memSize = 1000000;
s.boot;

SynthDef.new(\pb,{
	arg output= 0, bufnum = 0, start=0, loop = 0, rate = 1.0, duration=1.0, amp=1.0;
	var env = Env.sine(dur: duration, level: amp);
	Out.ar(output,
		EnvGen.kr(env, doneAction: Done.freeSelf) * 
		PlayBuf.ar(1, bufnum, rate, BufRateScale.kr(bufnum), startPos: SampleRate.ir*start, loop: loop, doneAction: 2));
}).load(s);

~loadingBuffers = Dictionary();
~buffers = Dictionary();
~duration = 2.0;
~amp = 0.1;
~triggerGrain = {
	arg filename, offset=0;
	var buf;
	if( ~loadingBuffers.at(filename) == nil,
		{
			~loadingBuffers.put(filename,True);
			("Loading "+filename).postln;
			buf = Buffer.read(s,filename,action: {
				|buf|
				~buffers.put(filename,Buffer.read(s,filename));
				("Loaded "+filename).postln;
			}
            );
		},
		{
		}
	);
	buf = ~buffers.at(filename);
	Synth(\pb,[\output,0,\bufnum,buf,\start, (offset / 5.166666666), \duration, ~duration, \amp, ~amp]);
};

		/*
			~triggerGrain.('/opt/hindle1/Music/48kmonos/Kimiko_Ishizaka_-_Bach-_Well-Tempered_Clavier,_Book_1_-_15_Prelude_No._8_in_E-flat_minor,_BWV_853.flac.wav',4.linrand + 30);

		*/

		
OSCFunc.newMatching({
	|msg|
	var filename, offset;
	filename = msg[1];
	offset = msg[2];
	// ("Play " + filename + " " + offset).postln;
	~triggerGrain.( filename, offset );
}, '/grain');
