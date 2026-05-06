// ─── SYNTH ENGINE ASSESSMENT (Ceca Čujka & Mila Melodija) ───
// Q: Da li GDG treba shared synth.js modul?
// A: NE JOŠ. Current inline pristup je OK za 1-2 meseca. Razlozi:
//   - Svaka igra ima različite audio potrebe (runner vs puzzle vs TD)
//   - Shared modul dodaje ~200 linija overhead + API dizajn trošak
//   - Tek kad se pojave 3+ igre sa sličnim audio patternom, refaktorisati
//   - Ako se ipak pravi: sequencer (note scheduling), instrument factory
//     (osc type + envelope + filter), song format (JSON note array),
//     i master bus (compressor + gain). ~300 LOC, 1-2 dana rada.
//   - Za sad: copy-paste audio.js šablona između igara je JEFTINIJE.
// ─────────────────────────────────────────────────────────────

let audioCtx = null;
let musicPlaying = false;
let musicNodes = [];
let muted = false;
let masterGain = null;

export function initAudio() {
  // Ne kreiraj AudioContext ovde — Safari blokira ako nije user gesture
}

export function resumeAudio() {
  if (!audioCtx) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
      masterGain.gain.value = muted ? 0 : 1;
    } catch { return; }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function toggleMute() {
  muted = !muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 1;
  }
  return muted;
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
    gain.connect(masterGain);

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

// ─── BEOGRADE INSTRUMENTAL — Đorđe Marjanović ──────────────
// Muzika: Dušan Jakšić, tekst: Đorđe Marjanović
// Tonalitet: A mol (natural minor) / relativni C-dur
// Tempo: 129 BPM (izvor: ChordU/Chordify AI analiza originala)
// Akordska progresija (iz Ultimate Guitar + Chordify):
//   Intro:  Am - G - Am - D7 - G - Am
//   Strofa: Am - G - Am - D7 - G - Am  (isti kao intro)
//   Refren: C - G - Am - Em - Am - D7 - G - Am
// Struktura: Intro | Strofa×2 | Refren | Strofa | Refren | Outro
//
// NAPOMENA: Tačan notni zapis (MIDI/sheet music) nije pronađen online.
// Melodija je transkribovana po sluhu sa referencom na akordsku strukturu
// iz ChordU (D,G,A,D7), Ultimate Guitar (Am9,Am,Gadd9,G,Am,D7,G,Am),
// i Chordify potvrdu tonaliteta. Frekvencije su equal temperament A4=440Hz.
// ────────────────────────────────────────────────────────────

const BPM = 129;
const BEAT = 60 / BPM; // ~0.465s

// Frekvencije (A4 = 440 Hz, equal temperament)
const C3 = 130.81, D3 = 146.83, E3 = 164.81, G3 = 196.00, A3 = 220.00;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00;
const A4 = 440.00, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25;

// [freq, duzina u beatovima]  (0 = pauza)
// Strofa melodija: "On i-ma ču-de-snu moć, da sve-tlom is-pu-ni noć"
// Melodija se kreće u Am pentatoniku: A4-C5-D5-E5, silazno ka E4-G4-A4
const VERSE_MELODY = [
  // "On i-ma ču-de-snu moć" — uzlazno od A4
  [A4, 0.5], [A4, 0.25], [C5, 0.25], [C5, 0.5], [D5, 0.25], [C5, 0.25],
  [A4, 0.5], [G4, 0.5],
  [0, 0.25],
  // "da sve-tlom is-pu-ni noć" — silazno
  [C5, 0.5], [C5, 0.25], [A4, 0.25], [A4, 0.5], [G4, 0.25], [A4, 0.25],
  [G4, 0.5], [E4, 0.5],
  [0, 0.25],
  // "be-li-nom o-sme-ha svog" — srednji registar
  [E4, 0.5], [G4, 0.5], [A4, 0.5], [A4, 0.25], [G4, 0.25],
  [A4, 0.5], [G4, 0.5],
  [0, 0.25],
  // "raz-go-ni tu-gu" — završetak fraze na E4 (dominanta Am)
  [A4, 0.5], [G4, 0.25], [E4, 0.25], [E4, 0.5], [D4, 0.5],
  [E4, 1.0],
  [0, 0.5],
];

// Refren melodija: "Be-o-gra-de, Be-o-gra-de, na u-šću dve-ju re-ka"
const CHORUS_MELODY = [
  // "Be-o-gra-de" (×1) — skok na C5, silazno
  [C5, 0.5], [C5, 0.25], [A4, 0.25], [G4, 0.75],
  [0, 0.25],
  // "Be-o-gra-de" (×2)
  [C5, 0.5], [C5, 0.25], [A4, 0.25], [G4, 0.75],
  [0, 0.25],
  // "na u-šću dve-ju re-ka" — uzlazno do E5
  [E4, 0.5], [G4, 0.5], [A4, 0.5], [C5, 0.5],
  [D5, 0.75], [C5, 0.25],
  // "is-pod A-va-le" — silazno, zavšava na A4 (tonika)
  [A4, 0.5], [G4, 0.25], [A4, 0.25],
  [A4, 1.5],
  [0, 0.5],
  // Ponavljanje refrena — varijacija
  [C5, 0.5], [D5, 0.5], [E5, 0.5], [D5, 0.5],
  [C5, 0.5], [A4, 0.5], [G4, 0.5], [A4, 0.75],
  [0, 0.25],
  [E4, 0.5], [G4, 0.5], [A4, 0.5], [G4, 0.5],
  [A4, 1.5],
  [0, 0.5],
];

// Kombinovana melodija: strofa + refren za petlju
const MELODY = [...VERSE_MELODY, ...CHORUS_MELODY];

// Bass — Am progresija prema akordskoj analizi
// Am - G - Am - D7 - G - Am | C - G - Am - Em - Am - D7 - G - Am
const BASS_PATTERN = [
  // Strofa: Am - G - Am - D7 - G - Am
  [A3, 1], [A3, 1], [G3, 1], [G3, 1],
  [A3, 1], [A3, 1], [D3, 1], [D3, 1],
  [G3, 1], [G3, 1], [A3, 1], [A3, 1],
  // Refren: C - G - Am - Em - Am - D7 - G - Am
  [C3, 1], [C3, 1], [G3, 1], [G3, 1],
  [A3, 1], [A3, 1], [E3, 1], [E3, 1],
  [A3, 1], [D3, 1], [G3, 1], [A3, 1],
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
      gain.connect(masterGain);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.setValueAtTime(0.12, t + noteDur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.95);
      osc.start(t);
      osc.stop(t + noteDur);
      musicNodes.push(osc);
      osc.onended = () => { const i = musicNodes.indexOf(osc); if (i >= 0) musicNodes.splice(i, 1); };
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
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.setValueAtTime(0.15, t + noteDur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.9);
    osc.start(t);
    osc.stop(t + noteDur);
    musicNodes.push(osc);
    osc.onended = () => { const i = musicNodes.indexOf(osc); if (i >= 0) musicNodes.splice(i, 1); };
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
    gain.connect(masterGain);
    const vol = (i % 2 === 0) ? 0.06 : 0.03;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.start(t);
    src.stop(t + 0.04);
    musicNodes.push(src);
    src.onended = () => { const i = musicNodes.indexOf(src); if (i >= 0) musicNodes.splice(i, 1); };
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
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.25);
    musicNodes.push(osc);
    osc.onended = () => { const i = musicNodes.indexOf(osc); if (i >= 0) musicNodes.splice(i, 1); };
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
  gain.connect(masterGain);
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
  const t = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.connect(masterGain);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

  // Two-tone ascending pling
  const o1 = audioCtx.createOscillator();
  o1.type = 'sine';
  o1.frequency.setValueAtTime(880, t);
  o1.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
  o1.connect(gain);
  o1.start(t);
  o1.stop(t + 0.15);

  // Harmonic shimmer
  const o2 = audioCtx.createOscillator();
  o2.type = 'triangle';
  o2.frequency.setValueAtTime(1760, t + 0.03);
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(0.1, t + 0.03);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o2.connect(g2);
  g2.connect(masterGain);
  o2.start(t + 0.03);
  o2.stop(t + 0.2);
}

export function playLogoSound() {
  if (!audioCtx) return;
  // Triumphant ascending arpeggio — premium power-up feel
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.setValueAtTime(0.18, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

export function playGameOverSound() {
  if (!audioCtx) return;
  [440, 330, 220].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}
