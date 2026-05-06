let audioCtx = null;
let musicPlaying = false;
let musicNodes = [];

export function initAudio() {
  // Ne kreiraj AudioContext ovde — Safari blokira ako nije user gesture
}

export function resumeAudio() {
  // Kreiraj AudioContext TEK na prvi user gesture (klik na KRETANJE)
  if (!audioCtx) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    } catch { return; }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// ─── TRUCK HORN ─────────────────────────────────────────────
export function playTruckHorn() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Dva kratka "beep-beep" sa distorzijom
  [0, 0.25].forEach((offset) => {
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const distortion = audioCtx.createWaveShaper();

    // Distortion curve
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (Math.PI + 10) * x / (Math.PI + 10 * Math.abs(x));
    }
    distortion.curve = curve;
    distortion.oversample = '2x';

    osc.type = 'sawtooth';
    osc.frequency.value = 170;
    osc2.type = 'square';
    osc2.frequency.value = 155;

    osc.connect(distortion);
    osc2.connect(distortion);
    distortion.connect(gain);
    gain.connect(audioCtx.destination);

    const t = now + offset;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.setValueAtTime(0.18, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.start(t);
    osc.stop(t + 0.2);
    osc2.start(t);
    osc2.stop(t + 0.2);
  });
}

// ─── BEOGRADE INSTRUMENTAL (synth-wave 128 BPM) ────────────
const BPM = 128;
const BEAT = 60 / BPM; // ~0.469s

// Melodija: "Beograde, Beograde, moj jedini grade"
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00;
const C3 = 130.81, E3 = 164.81, F3 = 174.61, G3 = 196.00;

// [freq, duzina u beatovima]  (0 = pauza)
const MELODY = [
  // "Beo-gra-de, Be-o-gra-de"
  [C4, 0.5], [D4, 0.5], [E4, 0.75], [E4, 0.25], [D4, 0.5], [C4, 0.5],
  [0, 0.5],
  [C4, 0.5], [D4, 0.5], [E4, 0.75], [E4, 0.25], [D4, 0.5], [C4, 0.5],
  [0, 0.5],
  // "Moj jedini grade"
  [E4, 0.5], [F4, 0.5], [G4, 0.75], [G4, 0.25], [F4, 0.5], [E4, 0.5], [D4, 1.0],
  [0, 1.0],
];

// Bass — 4 na pod
const BASS_PATTERN = [
  [C3, 1], [C3, 1], [E3, 1], [E3, 1],
  [F3, 1], [F3, 1], [G3, 1], [G3, 1],
  [C3, 1], [C3, 1], [E3, 1], [E3, 1],
  [F3, 1], [F3, 1], [G3, 1], [C3, 1],
];

function getTotalBeats(pattern) {
  return pattern.reduce((sum, n) => sum + n[1], 0);
}

function scheduleMelody(startTime) {
  let t = startTime;
  for (const [freq, dur] of MELODY) {
    const noteDur = dur * BEAT;
    if (freq > 0) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.setValueAtTime(0.12, t + noteDur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.95);
      osc.start(t);
      osc.stop(t + noteDur);
      musicNodes.push(osc);
    }
    t += noteDur;
  }
}

function scheduleBass(startTime) {
  let t = startTime;
  for (const [freq, dur] of BASS_PATTERN) {
    const noteDur = dur * BEAT;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.setValueAtTime(0.15, t + noteDur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.9);
    osc.start(t);
    osc.stop(t + noteDur);
    musicNodes.push(osc);
  }
}

function scheduleHiHat(startTime, totalBeats) {
  const eighthNote = BEAT / 2;
  const count = Math.floor(totalBeats * 2);
  for (let i = 0; i < count; i++) {
    const t = startTime + i * eighthNote;
    const bufSize = Math.floor(audioCtx.sampleRate * 0.03);
    const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1);
    const src = audioCtx.createBufferSource();
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 8000;
    const gain = audioCtx.createGain();
    src.buffer = buffer;
    src.connect(hp);
    hp.connect(gain);
    gain.connect(audioCtx.destination);
    const vol = (i % 2 === 0) ? 0.06 : 0.03;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.start(t);
    src.stop(t + 0.04);
    musicNodes.push(src);
  }
}

function scheduleKick(startTime, totalBeats) {
  for (let i = 0; i < totalBeats; i++) {
    const t = startTime + i * BEAT;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.25);
    musicNodes.push(osc);
  }
}

let loopTimeout = null;
let nextLoopTime = 0;

function scheduleLoop() {
  if (!audioCtx || !musicPlaying) return;

  const melodyBeats = getTotalBeats(MELODY);
  const bassBeats = getTotalBeats(BASS_PATTERN);
  const totalBeats = Math.max(melodyBeats, bassBeats);
  const loopDuration = totalBeats * BEAT;

  const now = audioCtx.currentTime;
  const startTime = Math.max(now, nextLoopTime);

  scheduleMelody(startTime);
  scheduleBass(startTime);
  scheduleHiHat(startTime, totalBeats);
  scheduleKick(startTime, totalBeats);

  nextLoopTime = startTime + loopDuration;

  const msUntilNext = (nextLoopTime - audioCtx.currentTime - 0.1) * 1000;
  loopTimeout = setTimeout(() => scheduleLoop(), Math.max(50, msUntilNext));
}

function startMusic() {
  if (musicPlaying) return;
  musicPlaying = true;
  nextLoopTime = audioCtx.currentTime;
  scheduleLoop();
}

function stopMusic() {
  musicPlaying = false;
  if (loopTimeout) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }
  musicNodes.forEach(n => { try { n.stop(); } catch {} });
  musicNodes = [];
}

let wasPlaying = false;

export function updateAudio(dt, isPlaying) {
  if (!audioCtx) return;
  if (isPlaying && !wasPlaying) {
    startMusic();
  } else if (!isPlaying && wasPlaying) {
    stopMusic();
  }
  wasPlaying = isPlaying;
}

// ─── EXISTING SOUNDS ────────────────────────────────────────
export function playCardSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.15);
}

export function playTrashSound() {
  if (!audioCtx) return;
  const bufSize = Math.floor(audioCtx.sampleRate * 0.06);
  const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const src = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  const gain = audioCtx.createGain();
  src.buffer = buffer;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
  src.start();
  src.stop(audioCtx.currentTime + 0.06);
}

export function playGameOverSound() {
  if (!audioCtx) return;
  [440, 330, 220].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}
