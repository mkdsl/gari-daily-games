// audio.js — CECA ČUJKA: Web Audio API, no .mp3 files

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function resumeAudio() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

// Sub-bass pulse beat — tempo reflects happiness
export function ambientBeat(bpm = 128, happiness = 50) {
  const c = getCtx();
  const interval = 60 / bpm;
  const now = c.currentTime;

  const osc = c.createOscillator();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(65 + happiness * 0.3, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + interval * 0.2);

  filter.type = 'lowpass';
  filter.frequency.value = 120;
  filter.Q.value = 2;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + interval * 0.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);

  osc.start(now);
  osc.stop(now + interval);
}

// Harsh dissonant chord when neighbor exceeds limit
export function complaintSound() {
  const c = getCtx();
  const now = c.currentTime;
  const freqs = [220, 233.1, 246.9];

  freqs.forEach(f => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 1.3);
  });
}

// Major chord arpeggio when happiness grows
export function happinessChord(level = 1) {
  const c = getCtx();
  const now = c.currentTime;
  const root = 220 * Math.pow(2, level / 12);
  const chord = [root, root * 1.25, root * 1.5, root * 2];

  chord.forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = f;
    const t = now + i * 0.08;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

// Warning bleep for dynamic events
export function warningBleep() {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(660, now + 0.1);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

// Low pad fade-out for game over
export function gameOverDrone() {
  const c = getCtx();
  const now = c.currentTime;
  const freqs = [55, 82.4, 110];

  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = i === 0 ? 'sawtooth' : 'sine';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.3);
    gain.gain.setValueAtTime(0.1, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 4.5);
  });
}

let beatInterval = null;
let lastHappiness = 50;

export function startBeatLoop(getHappiness) {
  stopBeatLoop();
  let tick = 0;
  beatInterval = setInterval(() => {
    const h = getHappiness();
    const bpm = 120 + (h / 100) * 20;
    if (tick % 2 === 0) {
      ambientBeat(bpm, h);
    }
    tick++;
  }, 500);
}

export function stopBeatLoop() {
  if (beatInterval !== null) {
    clearInterval(beatInterval);
    beatInterval = null;
  }
}
