/**
 * audio.js — Web Audio system za Akva-Sklop
 * Ceca Čujka | Gari Daily Games
 *
 * Sve generisano proceduralnim Web Audio API-jem.
 * Bez .wav/.mp3 fajlova. Radi na GitHub Pages (HTTP), mobilno i desktop.
 */

import { AUDIO_ENABLED, AMBIENT_FREQ } from './config.js';

// ─── State ────────────────────────────────────────────────────────────────────

let audioCtx = null;
let masterGain = null;

// Ambient state
let ambientRunning = false;
let ambientGain = null;
let ambientBubbleTimeout = null;

// ─── Core ─────────────────────────────────────────────────────────────────────

/**
 * Lazy-init AudioContext. Uvek pozivaj ovo pre audioCtx upotrebe.
 * @returns {AudioContext}
 */
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

/**
 * Resume context radi mobilnog autoplay policy-ja.
 * @returns {Promise<void>}
 */
async function resume() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/**
 * Kreira GainNode i konektuje ga na masterGain.
 * @param {number} initialValue
 * @returns {GainNode}
 */
function createGain(initialValue = 1) {
  const ctx = getCtx();
  const g = ctx.createGain();
  g.gain.value = initialValue;
  g.connect(masterGain);
  return g;
}

/**
 * Kreira OscillatorNode sa zadatim tipom i frekvencom.
 * @param {string} type  - 'sine' | 'triangle' | 'sawtooth' | 'square'
 * @param {number} freq  - Hz
 * @returns {OscillatorNode}
 */
function createOsc(type, freq) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  return osc;
}

/**
 * Svira jednostavnu notu: osc → gainNode → masterGain, pa staje.
 * @param {string} type
 * @param {number} freq
 * @param {number} peakGain
 * @param {number} attackTime  - s
 * @param {number} decayTime   - s
 * @param {number} startTime   - ctx.currentTime offset
 * @param {GainNode} [targetGain] - ako nije navedeno, koristi masterGain direktno
 */
function playNote(type, freq, peakGain, attackTime, decayTime, startTime, targetGain) {
  const ctx = getCtx();
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
  g.gain.linearRampToValueAtTime(0, startTime + attackTime + decayTime);
  g.connect(targetGain || masterGain);

  const osc = createOsc(type, freq);
  osc.connect(g);
  osc.start(startTime);
  osc.stop(startTime + attackTime + decayTime + 0.01);
}

// ─── Brown noise generator ─────────────────────────────────────────────────────

/**
 * Pravi AudioBuffer sa aproksimiranim braon šumom (filterovani bijeli šum).
 * @returns {AudioBufferSourceNode}
 */
function createBrownNoise() {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 4; // 4s loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Integrator filter: braon šum aproksimacija
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5; // pojačanje da bude čujno
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Inicijalizuj audio sistem. Ne starta ambient automatski.
 * Pozovi pri učitavanju stranice (na user gesture ako je moguće).
 */
export function initAudio() {
  if (!AUDIO_ENABLED) return;
  try {
    getCtx(); // eagerly create context
  } catch (e) {
    console.warn('[audio] Web Audio nije dostupan:', e);
  }
}

/**
 * Proceduralni bubbling water ambient.
 * 1. Low sine (AMBIENT_FREQ Hz) — base hum vode
 * 2. Filtered brown noise — šum tečnosti
 * 3. Random "blup" mjehurići svake 0.3–0.8s
 * Loop-uje beskonačno, graceful stop sa stopAmbient().
 */
export async function playWaterAmbient() {
  if (!AUDIO_ENABLED) return;
  if (ambientRunning) return;
  try {
    await resume();
    const ctx = getCtx();

    ambientRunning = true;
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2); // 2s fade in
    ambientGain.connect(masterGain);

    // 1. Low sine base hum
    const baseOsc = createOsc('sine', AMBIENT_FREQ);
    const baseGain = ctx.createGain();
    baseGain.gain.value = 0.08;
    baseOsc.connect(baseGain);
    baseGain.connect(ambientGain);
    baseOsc.start();

    // 2. Filtered brown noise — šum tekuće vode
    const noiseSource = createBrownNoise();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 400;
    noiseFilter.Q.value = 0.8;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.06;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambientGain);
    noiseSource.start();

    // Store refs for cleanup
    ambientGain._baseOsc = baseOsc;
    ambientGain._noiseSource = noiseSource;

    // 3. Random "blup" bubbles
    function scheduleBubble() {
      if (!ambientRunning) return;
      const delay = 300 + Math.random() * 500; // 0.3–0.8s
      ambientBubbleTimeout = setTimeout(() => {
        if (!ambientRunning) return;
        try {
          const now = ctx.currentTime;
          // Kratki frequency sweep: "blup"
          const bOsc = createOsc('sine', 180 + Math.random() * 120);
          const bGain = ctx.createGain();
          bGain.gain.setValueAtTime(0, now);
          bGain.gain.linearRampToValueAtTime(0.07, now + 0.02);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          bOsc.frequency.setValueAtTime(180 + Math.random() * 120, now);
          bOsc.frequency.exponentialRampToValueAtTime(80 + Math.random() * 40, now + 0.12);
          bOsc.connect(bGain);
          bGain.connect(ambientGain);
          bOsc.start(now);
          bOsc.stop(now + 0.15);
        } catch (e) { /* silence */ }
        scheduleBubble();
      }, delay);
    }
    scheduleBubble();

  } catch (e) {
    console.warn('[audio] playWaterAmbient greška:', e);
    ambientRunning = false;
  }
}

/**
 * Graceful fade out i stop ambienta.
 */
export async function stopAmbient() {
  if (!AUDIO_ENABLED) return;
  if (!ambientRunning) return;
  try {
    ambientRunning = false;

    // Zaustavi bubble planer
    if (ambientBubbleTimeout !== null) {
      clearTimeout(ambientBubbleTimeout);
      ambientBubbleTimeout = null;
    }

    if (ambientGain) {
      const ctx = getCtx();
      const now = ctx.currentTime;
      ambientGain.gain.cancelScheduledValues(now);
      ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
      ambientGain.gain.linearRampToValueAtTime(0, now + 1.5); // 1.5s fade out

      // Zaustavi oscillatore nakon fade-a
      setTimeout(() => {
        try {
          if (ambientGain._baseOsc) ambientGain._baseOsc.stop();
        } catch (e) { /* already stopped */ }
        try {
          if (ambientGain._noiseSource) ambientGain._noiseSource.stop();
        } catch (e) { /* already stopped */ }
        try {
          ambientGain.disconnect();
        } catch (e) { /* already disconnected */ }
        ambientGain = null;
      }, 1600);
    }
  } catch (e) {
    console.warn('[audio] stopAmbient greška:', e);
  }
}

/**
 * Kratki "ding" — postavljanje tile-a.
 * Triangle wave, C5 (523Hz), decay 0.15s.
 */
export async function playTilePlaced() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    // 0 → 0.3 → 0 u 150ms
    playNote('triangle', 523, 0.3, 0.005, 0.145, now);
  } catch (e) {
    console.warn('[audio] playTilePlaced greška:', e);
  }
}

/**
 * Kratki "thunk" — uklanjanje tile-a.
 * Sine, 200Hz → 150Hz glide, 100ms.
 */
export async function playTileRemoved() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, now);
    g.gain.linearRampToValueAtTime(0, now + 0.1);
    g.connect(masterGain);

    const osc = createOsc('sine', 200);
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.1);
    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    console.warn('[audio] playTileRemoved greška:', e);
  }
}

/**
 * Zvuk "simulacija počinje" — 2 note arpeggio: E4 (329Hz), G4 (392Hz).
 * Sine wave, svaki 200ms.
 */
export async function playSimStart() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [329, 392]; // E4, G4
    notes.forEach((freq, i) => {
      playNote('sine', freq, 0.28, 0.01, 0.18, now + i * 0.2);
    });
  } catch (e) {
    console.warn('[audio] playSimStart greška:', e);
  }
}

/**
 * Zvuk "nedelja završena" — 3 note arpeggio: C4, E4, G4 (major chord).
 * Sine wave, 150ms spacing.
 */
export async function playSimComplete() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [261, 329, 392]; // C4, E4, G4
    notes.forEach((freq, i) => {
      playNote('sine', freq, 0.3, 0.01, 0.2, now + i * 0.15);
    });
  } catch (e) {
    console.warn('[audio] playSimComplete greška:', e);
  }
}

/**
 * Score > 70: pozitivan chime — F5 (698Hz), A5 (880Hz), 250ms spacing.
 */
export async function playWeekGood() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [698, 880]; // F5, A5
    notes.forEach((freq, i) => {
      playNote('triangle', freq, 0.25, 0.008, 0.22, now + i * 0.25);
    });
  } catch (e) {
    console.warn('[audio] playWeekGood greška:', e);
  }
}

/**
 * Score < 40: nisko "bum" — 120Hz, 300ms fade out, sine.
 */
export async function playWeekBad() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.35, now);
    g.gain.linearRampToValueAtTime(0, now + 0.3);
    g.connect(masterGain);

    const osc = createOsc('sine', 120);
    osc.connect(g);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('[audio] playWeekBad greška:', e);
  }
}

/**
 * pH critical / fish dying — urgentno upozorenje.
 * Pulsing: 3x kratki burst 440Hz sa 0.3s razmakom.
 */
export async function playCriticalAlert() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      playNote('square', 440, 0.22, 0.01, 0.1, now + i * 0.3);
    }
  } catch (e) {
    console.warn('[audio] playCriticalAlert greška:', e);
  }
}

/**
 * Guncati Knows kartica unlock — melodičan arpeggio.
 * G4 (392Hz), B4 (493Hz), D5 (587Hz), 180ms spacing, sine.
 */
export async function playCardUnlock() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [392, 493, 587]; // G4, B4, D5
    notes.forEach((freq, i) => {
      playNote('sine', freq, 0.27, 0.01, 0.2, now + i * 0.18);
    });
  } catch (e) {
    console.warn('[audio] playCardUnlock greška:', e);
  }
}

/**
 * Pobeda — kratka fanfara sa vibratom.
 * C4, E4, G4, C5 arpeggio (200ms spacing, triangle wave, vibrato).
 */
export async function playVictory() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [261, 329, 392, 523]; // C4, E4, G4, C5

    notes.forEach((freq, i) => {
      const startAt = now + i * 0.2;
      const duration = 0.28;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, startAt);
      g.gain.linearRampToValueAtTime(0.3, startAt + 0.01);
      g.gain.linearRampToValueAtTime(0, startAt + duration);
      g.connect(masterGain);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      // Vibrato via LFO
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 5.5; // 5.5Hz vibrato
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 4; // ±4Hz devijacija
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(g);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.01);
      lfo.start(startAt);
      lfo.stop(startAt + duration + 0.01);
    });
  } catch (e) {
    console.warn('[audio] playVictory greška:', e);
  }
}

/**
 * Poraz — descending triad, spori fade.
 * G3 (196Hz), E3 (164Hz), C3 (130Hz), 250ms spacing, sine.
 */
export async function playGameOver() {
  if (!AUDIO_ENABLED) return;
  try {
    await resume();
    const ctx = getCtx();
    const now = ctx.currentTime;
    const notes = [196, 164, 130]; // G3, E3, C3

    notes.forEach((freq, i) => {
      const startAt = now + i * 0.25;
      // Spori fade out za svaku notu
      playNote('sine', freq, 0.28, 0.01, 0.35, startAt);
    });
  } catch (e) {
    console.warn('[audio] playGameOver greška:', e);
  }
}

/**
 * Postavi master volumen.
 * @param {number} v - 0 do 1
 */
export function setMasterVolume(v) {
  if (!AUDIO_ENABLED) return;
  try {
    if (masterGain) {
      masterGain.gain.value = Math.max(0, Math.min(1, v));
    } else {
      // Inicijalizuj i postavi
      getCtx();
      if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
    }
  } catch (e) {
    console.warn('[audio] setMasterVolume greška:', e);
  }
}
