let shared: AudioContext | null = null;
let mute: GainNode | null = null;

export function audioCtx(): AudioContext {
  if (!shared) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    shared = new C();
  }
  return shared;
}

export function wakeAudio() {
  try {
    const c = audioCtx();
    if (c.state !== 'running') c.resume().catch(() => {});
  } catch {}
}

function silentSink(c: AudioContext) {
  if (!mute) {
    mute = c.createGain();
    mute.gain.value = 0;
    mute.connect(c.destination);
  }
  return mute;
}

function makeAnalyser(c: AudioContext) {
  const a = c.createAnalyser();
  a.fftSize = 2048;
  a.smoothingTimeConstant = 0.5;
  a.minDecibels = -92;
  a.maxDecibels = -22;
  a.connect(silentSink(c));
  return a;
}

export interface Tap {
  analyser: AnalyserNode;
  stop: () => void;
}

export function tapTrack(track: MediaStreamTrack): Tap | null {
  try {
    const c = audioCtx();
    const src = c.createMediaStreamSource(new MediaStream([track]));
    const analyser = makeAnalyser(c);
    src.connect(analyser);
    return {
      analyser,
      stop: () => {
        try { src.disconnect(); analyser.disconnect(); } catch {}
      },
    };
  } catch {
    return null;
  }
}

export interface SynthVoice extends Tap {
  talk: (on: boolean) => void;
  level: () => number;
}

const VOWELS: [number, number][] = [[730, 1090], [530, 1840], [270, 2290], [570, 840], [300, 870], [640, 1190], [440, 1020]];

export function synthVoice(pitch: number): SynthVoice | null {
  let c: AudioContext;
  try { c = audioCtx(); } catch { return null; }
  const analyser = makeAnalyser(c);
  const env = c.createGain();
  env.gain.value = 0;
  env.connect(analyser);

  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = pitch;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.9;
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = pitch * 0.06;
  lfo.connect(lfoDepth).connect(osc.frequency);

  const noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const ch = noiseBuf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.05;

  const f1 = c.createBiquadFilter();
  f1.type = 'bandpass'; f1.frequency.value = 600; f1.Q.value = 5;
  const f2 = c.createBiquadFilter();
  f2.type = 'bandpass'; f2.frequency.value = 1400; f2.Q.value = 7;
  const f3 = c.createBiquadFilter();
  f3.type = 'bandpass'; f3.frequency.value = 2700; f3.Q.value = 9;
  const body = c.createGain();
  body.gain.value = 1.4;
  osc.connect(f1).connect(body);
  osc.connect(f2).connect(body);
  osc.connect(f3).connect(body);
  noise.connect(noiseGain);
  noiseGain.connect(f2);
  noiseGain.connect(f3);
  body.connect(env);

  osc.start();
  lfo.start();
  noise.start();

  let talking = false;
  let next = 0;
  let syllables = 0;
  let jsLevel = 0;
  let jsTarget = 0;
  let jsUntil = 0;

  const tick = () => {
    const now = c.currentTime;
    const wall = performance.now();
    if (wall > jsUntil) jsTarget = 0;
    jsLevel += (jsTarget - jsLevel) * 0.35;
    if (!talking || now < next) return;
    syllables++;
    const pause = syllables % (4 + Math.floor(Math.random() * 4)) === 0;
    const dur = 0.11 + Math.random() * 0.17;
    const gap = pause ? 0.22 + Math.random() * 0.26 : 0.03 + Math.random() * 0.06;
    const peak = 0.35 + Math.random() * 0.55;
    const [a, b] = VOWELS[Math.floor(Math.random() * VOWELS.length)];
    f1.frequency.setTargetAtTime(a, now, 0.03);
    f2.frequency.setTargetAtTime(b, now, 0.03);
    osc.frequency.setTargetAtTime(pitch * (0.88 + Math.random() * 0.28), now, 0.06);
    env.gain.setTargetAtTime(peak, now, 0.018);
    env.gain.setTargetAtTime(0, now + dur, 0.035);
    jsTarget = peak;
    jsUntil = wall + dur * 1000;
    next = now + dur + gap;
  };
  const id = window.setInterval(tick, 25);

  return {
    analyser,
    talk: (on) => {
      talking = on;
      if (!on) env.gain.setTargetAtTime(0, c.currentTime, 0.04);
    },
    level: () => jsLevel,
    stop: () => {
      window.clearInterval(id);
      try {
        osc.stop(); lfo.stop(); noise.stop();
        env.disconnect(); analyser.disconnect();
      } catch {}
    },
  };
}
