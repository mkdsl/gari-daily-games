// audio.js — Web Audio API, sve generisano u kodu

let ctx_audio = null;
let bass_osc = null;
let bass_gain = null;
let crowd_noise = null;
let crowd_gain = null;
let warning_interval = null;
let warning_active = false;
let slider_last_tick = 0;
let initialized = false;
let audioReady = false;

export function unlockAudioOnGesture() {
  if (audioReady) return;
  audioReady = true;
  if (!ctx_audio) {
    ctx_audio = new (window.AudioContext || window.webkitAudioContext)();
    _buildFestivalAmbient();
    _buildCrowdNoise();
    initialized = true;
  }
  if (ctx_audio.state === 'suspended') {
    ctx_audio.resume();
  }
}

export function initAudio() {
  if (initialized) return;
  try {
    ctx_audio = new (window.AudioContext || window.webkitAudioContext)();
    _buildFestivalAmbient();
    _buildCrowdNoise();
    initialized = true;
    if (ctx_audio.state === 'suspended') {
      ctx_audio.resume();
    }
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

function _buildFestivalAmbient() {
  if (!ctx_audio) return;

  // Bass beat 120 BPM = 0.5s per beat
  bass_osc = ctx_audio.createOscillator();
  bass_osc.type = 'sine';
  bass_osc.frequency.value = 60;

  bass_gain = ctx_audio.createGain();
  bass_gain.gain.value = 0;

  bass_osc.connect(bass_gain);
  bass_gain.connect(ctx_audio.destination);
  bass_osc.start();

  // Pulsiranje basa na 120 BPM
  _scheduleBeat();
}

function _scheduleBeat() {
  if (!ctx_audio || !bass_gain) return;
  const beat_interval = 0.5; // 120 BPM
  const now = ctx_audio.currentTime;

  bass_gain.gain.cancelScheduledValues(now);
  bass_gain.gain.setValueAtTime(0, now);
  bass_gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
  bass_gain.gain.exponentialRampToValueAtTime(0.001, now + beat_interval * 0.8);

  setTimeout(_scheduleBeat, beat_interval * 1000 - 50);
}

function _buildCrowdNoise() {
  if (!ctx_audio) return;

  // White noise source
  const buffer_size = ctx_audio.sampleRate * 2;
  const buffer = ctx_audio.createBuffer(1, buffer_size, ctx_audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < buffer_size; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx_audio.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Bandpass 800Hz
  const bandpass = ctx_audio.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 800;
  bandpass.Q.value = 1.5;

  crowd_gain = ctx_audio.createGain();
  crowd_gain.gain.value = 0;

  source.connect(bandpass);
  bandpass.connect(crowd_gain);
  crowd_gain.connect(ctx_audio.destination);
  source.start();

  crowd_noise = { source, bandpass };
}

export function setHappiness(h) {
  if (!ctx_audio || !crowd_gain) return;
  const target = h * 0.3;
  crowd_gain.gain.setTargetAtTime(target, ctx_audio.currentTime, 0.2);
}

export function setWinState() {
  if (!ctx_audio) return;
  playWinJingle();
  if (crowd_gain) {
    crowd_gain.gain.setTargetAtTime(0.4, ctx_audio.currentTime, 0.3);
  }
}

function playWinJingle() {
  if (!ctx_audio) return;
  // C4-E4-G4-C5 arpeggio
  const notes = [261.63, 329.63, 392.0, 523.25];
  notes.forEach((freq, i) => {
    const osc = ctx_audio.createOscillator();
    const g = ctx_audio.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.value = 0.3;
    osc.connect(g);
    g.connect(ctx_audio.destination);
    const t = ctx_audio.currentTime + i * 0.1;
    osc.start(t);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.stop(t + 0.31);
  });
}

export function playFail(type) {
  if (!ctx_audio) return;
  if (type === 'fail_inspection') {
    // Sirena: sweep 300→600Hz
    const osc = ctx_audio.createOscillator();
    const g = ctx_audio.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 300;
    g.gain.value = 0.3;
    osc.connect(g);
    g.connect(ctx_audio.destination);
    const now = ctx_audio.currentTime;
    osc.frequency.linearRampToValueAtTime(600, now + 1);
    osc.frequency.linearRampToValueAtTime(300, now + 2);
    osc.start(now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 2);
    osc.stop(now + 2.1);
  } else if (type === 'fail_crowd') {
    // Crowd fade + sad trombone
    if (crowd_gain) {
      crowd_gain.gain.setTargetAtTime(0, ctx_audio.currentTime, 0.5);
    }
    // Sad trombone: descending glissando
    const osc = ctx_audio.createOscillator();
    const g = ctx_audio.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 300;
    g.gain.value = 0.2;
    osc.connect(g);
    g.connect(ctx_audio.destination);
    const now = ctx_audio.currentTime;
    osc.start(now);
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 1.5);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    osc.stop(now + 1.9);
  }
}

export function playSliderTick() {
  if (!ctx_audio) return;
  const now_ts = performance.now();
  if (now_ts - slider_last_tick < 100) return; // debounce 100ms
  slider_last_tick = now_ts;

  const osc = ctx_audio.createOscillator();
  const g = ctx_audio.createGain();
  osc.type = 'square';
  osc.frequency.value = 200;
  g.gain.value = 0.05;
  osc.connect(g);
  g.connect(ctx_audio.destination);
  const now = ctx_audio.currentTime;
  osc.start(now);
  osc.stop(now + 0.02);
}

export function playWarning(active) {
  if (active === warning_active) return;
  warning_active = active;

  if (active) {
    warning_interval = setInterval(() => {
      if (!ctx_audio || !warning_active) return;
      const osc = ctx_audio.createOscillator();
      const g = ctx_audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = 400;
      g.gain.value = 0.1;
      osc.connect(g);
      g.connect(ctx_audio.destination);
      const t = ctx_audio.currentTime;
      osc.start(t);
      osc.stop(t + 0.12);
    }, 800);
  } else {
    if (warning_interval) {
      clearInterval(warning_interval);
      warning_interval = null;
    }
  }
}

export function stopAll() {
  warning_active = false;
  if (warning_interval) {
    clearInterval(warning_interval);
    warning_interval = null;
  }
  if (crowd_gain && ctx_audio) {
    crowd_gain.gain.setTargetAtTime(0, ctx_audio.currentTime, 0.1);
  }
}

export function resumeAudio() {
  if (ctx_audio && ctx_audio.state === 'suspended') {
    ctx_audio.resume();
  }
}
