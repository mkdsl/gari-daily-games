// src/audio.js — Web Audio API, bez fajlova
// Ceca Čujka — sve generisano programski, nema .mp3/.wav
// Fermenter — Varenički Bunt

/** @type {AudioContext|null} */
let audioCtx = null;

/** @type {OscillatorNode|null} */
let humOsc = null;

/** @type {OscillatorNode|null} */
let lfoOsc = null;

/** @type {GainNode|null} */
let humGain = null;

/** @type {GainNode|null} */
let masterGain = null;

/** @type {boolean} */
let muted = false;

/** @type {boolean} */
let humRunning = false;

// Bazna frekvencija ambient huma (laptop-safe: 80-100Hz)
const HUM_BASE_FREQ = 88;
// LFO dubina: ±3 Hz pulsiranje u ritmu fermentacije
const LFO_DEPTH = 3;
// LFO period ~2s
const LFO_RATE = 0.5;
// Gain raspon za hum (tiho ali prisutno)
const HUM_GAIN_MIN = 0.025;
const HUM_GAIN_MAX = 0.055;

/**
 * Inicijalizuje AudioContext. Idempotent — može se pozvati više puta.
 * Mora se zvati na prvi user interaction (browser politika).
 * @returns {boolean} true ako je AudioContext uspešno inicijalizovan
 */
export function initAudio() {
  if (audioCtx !== null) {
    // Već inicijalizovano — samo resume ako je suspended
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return true;
  }

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('[Audio] Web Audio API nije podržan u ovom browseru.');
      return false;
    }
    audioCtx = new AudioContextClass();

    // Chrome može odmah suspendovati context — resume na user gesture
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    // Master gain — kontrola mute-a
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    return true;
  } catch (err) {
    console.warn('[Audio] Ne mogu kreirati AudioContext:', err);
    audioCtx = null;
    return false;
  }
}

/**
 * Proveri da li je audio spreman za upotrebu.
 * @returns {boolean}
 */
function isReady() {
  return audioCtx !== null && masterGain !== null;
}

/**
 * Pokreće ili ažurira ambient hum (sinusoid oscilator, 80-100 Hz).
 * Frekvencija blago pulsira putem LFO-a u ritmu fermentacije.
 * @param {number} fermentRate - trenutna stopa fermentacije [0..∞], skalira gain
 */
export function startAmbientHum(fermentRate) {
  if (!isReady()) return;
  if (muted) return;

  const now = audioCtx.currentTime;

  // Izračunaj target gain na osnovu fermentRate (capped, lagano raste)
  const normalizedRate = Math.min(fermentRate / 50, 1.0); // 0..1
  const targetGain =
    HUM_GAIN_MIN + normalizedRate * (HUM_GAIN_MAX - HUM_GAIN_MIN);

  if (humRunning && humOsc && humGain) {
    // Već radi — samo ažuriraj gain, ne kreiraj novi
    humGain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
    return;
  }

  try {
    // Glavni oscilator — duboki sinusoid
    humOsc = audioCtx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(HUM_BASE_FREQ, now);

    // LFO za pulsiranje frekvencije (±3 Hz, ~2s period)
    lfoOsc = audioCtx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(LFO_RATE, now);

    // LFO gain koji kontroliše dubinu modulacije
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(LFO_DEPTH, now);

    // LFO → lfoGain → humOsc.frequency (FM modulacija)
    lfoOsc.connect(lfoGain);
    lfoGain.connect(humOsc.frequency);

    // Gain za hum
    humGain = audioCtx.createGain();
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(targetGain, now + 1.5); // lagano fade in

    humOsc.connect(humGain);
    humGain.connect(masterGain);

    humOsc.start(now);
    lfoOsc.start(now);

    humRunning = true;
  } catch (err) {
    console.warn('[Audio] startAmbientHum greška:', err);
  }
}

/**
 * Gracefully zaustavi ambient hum (fade out, disconnect).
 */
export function stopAmbientHum() {
  if (!humRunning || !humGain || !humOsc || !audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    humGain.gain.linearRampToValueAtTime(0, now + 1.0);

    const oscRef = humOsc;
    const lfoRef = lfoOsc;
    setTimeout(() => {
      try {
        oscRef.stop();
        oscRef.disconnect();
        lfoRef?.stop();
        lfoRef?.disconnect();
        humGain?.disconnect();
      } catch (_) {}
    }, 1200);

    humOsc = null;
    lfoOsc = null;
    humGain = null;
    humRunning = false;
  } catch (err) {
    console.warn('[Audio] stopAmbientHum greška:', err);
  }
}

/**
 * Kratki "plop" zvuk pri kliku.
 * Sinusoid 200 Hz, gain 0.15 → 0 za 0.08s.
 */
export function playClickSound() {
  if (!isReady() || muted) return;

  try {
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    // Blaga frekvencijska opadajuća krivulja za "plop" karakter
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (err) {
    console.warn('[Audio] playClickSound greška:', err);
  }
}

/**
 * Uzlazni frequency sweep za prestiže: 100 Hz → 800 Hz za 1.2s.
 * Fade in 0.1s, fade out od 1.0s, ukupno 1.3s.
 */
export function playPrestigeSound() {
  if (!isReady() || muted) return;

  try {
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 1.2);

    const gain = audioCtx.createGain();
    // Fade in
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    // Drži
    gain.gain.setValueAtTime(0.12, now + 1.0);
    // Fade out
    gain.gain.linearRampToValueAtTime(0.001, now + 1.3);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 1.35);
  } catch (err) {
    console.warn('[Audio] playPrestigeSound greška:', err);
  }
}

/**
 * Kratki diskretni "hiss" upozorenja za degradaciju.
 * White noise BufferSource, 128 samples, gain 0.05, trajanje 0.3s.
 * Poziva se jednom kad degradacija počne — ne u loop-u.
 */
export function playDegradationWarning() {
  if (!isReady() || muted) return;

  try {
    const now = audioCtx.currentTime;

    // Generiši kratki white noise buffer (mono, 128 samples)
    const bufferSize = audioCtx.sampleRate * 0.3; // 0.3s
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    // High-pass filter da dobijemo "hiss" karakter (ne bas-bump)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(0.5, now);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    source.start(now);
    source.stop(now + 0.32);
  } catch (err) {
    console.warn('[Audio] playDegradationWarning greška:', err);
  }
}

/**
 * Toggle mute state.
 * @returns {boolean} novi mute status (true = muted)
 */
export function toggleMute() {
  if (!isReady()) {
    muted = !muted;
    return muted;
  }

  muted = !muted;

  try {
    const now = audioCtx.currentTime;
    if (muted) {
      masterGain.gain.linearRampToValueAtTime(0, now + 0.05);
    } else {
      masterGain.gain.linearRampToValueAtTime(1.0, now + 0.05);
    }
  } catch (err) {
    console.warn('[Audio] toggleMute greška:', err);
  }

  return muted;
}

/**
 * Vrati trenutni mute status.
 * @returns {boolean}
 */
export function isMuted() {
  return muted;
}

/**
 * Ažuriraj ambient hum da reflektuje novi ferment rate.
 * Poziva se iz main.js kad se fermentRate promeni.
 * @param {number} rate - nova stopa fermentacije
 */
export function setFermentRate(rate) {
  if (!isReady() || muted) return;

  if (!humRunning) {
    // Hum nije pokrenut — pokreni ga
    startAmbientHum(rate);
    return;
  }

  if (!humGain || !audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const normalizedRate = Math.min(rate / 50, 1.0);
    const targetGain =
      HUM_GAIN_MIN + normalizedRate * (HUM_GAIN_MAX - HUM_GAIN_MIN);

    humGain.gain.linearRampToValueAtTime(targetGain, now + 0.8);
  } catch (err) {
    console.warn('[Audio] setFermentRate greška:', err);
  }
}
