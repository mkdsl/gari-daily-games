/**
 * audio.js — Web Audio API zvuci za Zimovnicu.
 * Kuhinjski ambijent, zvek tegli, bačva KO heavy, rakija hum.
 * Bez .wav/.mp3 fajlova — sve generisano proceduralno.
 *
 * Exports: initAudio, playSound, startAmbient, stopAmbient, setAmbientIntensity,
 *          setEnabled, isEnabled
 */

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** @type {AudioContext|null} */
let ctx = null;

/** @type {boolean} */
let enabled = true;

/** @type {boolean} — da li je ambijent trenutno aktivan */
let ambientRunning = false;

/** @type {GainNode|null} — master gain za ambijent (brown noise) */
let ambientMasterGain = null;

/** @type {AudioBufferSourceNode|null} — brown noise source */
let noiseSource = null;

/** @type {number} — handle za setTimeout kapljica */
let dripTimeout = null;

/** @type {number} — trenutni interval između kapljica (ms) */
let dripInterval = 10000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Inicijalizuje Web Audio kontekst.
 * Mora se pozvati nakon user gesture zbog autoplay policy.
 * Poziv je idempotentan — drugi poziv je no-op.
 */
export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Nekim browserima treba resume() posle korisničke akcije
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch (e) {
    enabled = false;
    console.warn('Zimovnica Audio: Web Audio nije podržan', e);
  }
}

/**
 * Reprodukuje zvuk po imenu.
 * @param {string} name
 */
export function playSound(name) {
  if (!enabled || !ctx) return;
  try {
    // Resume suspended context (mobile)
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    switch (name) {
      case 'clink':       _playClink();      break;
      case 'berba':       _playBerba();      break;
      case 'kuvanje':     _playKuvanje();    break;
      case 'toci':        _playToci();       break;
      case 'bačva_init':  _playBacvaInit();  break;
      case 'bačva_ko':    _playBacvaKO();    break;
      case 'rakija':      _playRakija();     break;
      case 'prodaj':      _playProdaj();     break;
      case 'toast_info':  _playToastInfo();  break;
      case 'toast_warn':  _playToastWarn();  break;
      case 'toast_error': _playToastError(); break;
      case 'day_advance': _playDayAdvance(); break;
      case 'event':       _playEvent();      break;
      case 'ending_good': _playEndingGood(); break;
      case 'ending_bad':  _playEndingBad();  break;
      default:
        console.warn('Zimovnica Audio: nepoznat zvuk:', name);
    }
  } catch (e) {
    console.warn('Zimovnica Audio: playSound greška', name, e);
  }
}

/**
 * Pokreće kuhinjski ambijent loop.
 * Tih brownian noise + povremene kapljice.
 * Idempotentan — drugi poziv je no-op ako već radi.
 */
export function startAmbient() {
  if (!enabled || !ctx || ambientRunning) return;
  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    _startNoiseLayer();
    _scheduleDrip();
    ambientRunning = true;
  } catch (e) {
    console.warn('Zimovnica Audio: startAmbient greška', e);
  }
}

/**
 * Zaustavlja kuhinjski ambijent loop.
 */
export function stopAmbient() {
  if (!ambientRunning) return;
  try {
    if (dripTimeout !== null) {
      clearTimeout(dripTimeout);
      dripTimeout = null;
    }
    if (noiseSource) {
      try { noiseSource.stop(); } catch (_) {}
      noiseSource = null;
    }
    if (ambientMasterGain) {
      try {
        ambientMasterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      } catch (_) {}
      ambientMasterGain = null;
    }
    ambientRunning = false;
  } catch (e) {
    console.warn('Zimovnica Audio: stopAmbient greška', e);
  }
}

/**
 * Podešava intenzitet ambienta prema danu igre.
 * Dan 14 = sporiji, tiši; Dan 3 = brži, glasniji.
 * @param {number} day — 1..14
 */
export function setAmbientIntensity(day) {
  if (!enabled || !ctx) return;
  try {
    const clampedDay = Math.max(1, Math.min(14, day));
    // Gain raste kako se bliži kraju (manji dan = bliže kraju)
    const gain = 0.03 + (14 - clampedDay) * 0.003;
    // Interval kapljica — kraći na manjim danima
    dripInterval = Math.max(2000, 15000 - clampedDay * 800);

    if (ambientMasterGain && ctx) {
      ambientMasterGain.gain.setTargetAtTime(gain, ctx.currentTime, 0.5);
    }
  } catch (e) {
    console.warn('Zimovnica Audio: setAmbientIntensity greška', e);
  }
}

/**
 * Uključuje/isključuje zvuk.
 * @param {boolean} on
 */
export function setEnabled(on) {
  enabled = on;
  if (!on && ambientRunning) stopAmbient();
}

/** @returns {boolean} */
export function isEnabled() { return enabled; }

// ---------------------------------------------------------------------------
// Internal helpers — ambient
// ---------------------------------------------------------------------------

/**
 * Kreira buffer sa brownian (brown/red) noise-om.
 * Brownian noise ima više energije na niskim frekvencijama — idealan za
 * podrum/kuhinjski ambijent (tišina sa "težinom").
 * @returns {AudioBuffer}
 */
function _createBrownNoiseBuffer() {
  const sampleRate = ctx.sampleRate;
  const seconds = 4; // loop svake 4s
  const frameCount = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < frameCount; i++) {
    const white = Math.random() * 2 - 1;
    // Brownian integration: low-pass filter white noise
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5; // amplify
  }
  return buffer;
}

/**
 * Pokreće brown noise layer kao osnovu ambienta.
 */
function _startNoiseLayer() {
  const buffer = _createBrownNoiseBuffer();

  noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  // Low-pass filter da ostane podrum-mek (~200Hz cutoff)
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 220;
  lpf.Q.value = 0.5;

  ambientMasterGain = ctx.createGain();
  ambientMasterGain.gain.value = 0.03; // tih default (dan 14)

  noiseSource.connect(lpf);
  lpf.connect(ambientMasterGain);
  ambientMasterGain.connect(ctx.destination);
  noiseSource.start();
}

/**
 * Rekurzivno zakazuje kapljicu vode na randomizovanom intervalu.
 */
function _scheduleDrip() {
  if (!ambientRunning) return;
  const variance = dripInterval * 0.4;
  const delay = dripInterval + (Math.random() - 0.5) * variance;
  dripTimeout = setTimeout(() => {
    if (!ambientRunning) return;
    try {
      _playAmbientDrip();
    } catch (_) {}
    _scheduleDrip();
  }, delay);
}

/**
 * Jedna kapljica — tih sine tap sa kratkim decay.
 */
function _playAmbientDrip() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  // Randomizuj visinu kapljice malo
  osc.frequency.value = 600 + Math.random() * 300;

  gain.gain.setValueAtTime(0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.25);
}

// ---------------------------------------------------------------------------
// Internal helpers — SFX
// ---------------------------------------------------------------------------

/**
 * Util: kreira gain node i veže ga na destination sa auto-cleanup.
 * @param {number} startTime
 * @param {number} duration
 * @returns {GainNode}
 */
function _makeGain(startTime, duration) {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  // Osiguraj da nema klikova posle zvuka
  gain.gain.setValueAtTime(0.0001, startTime + duration + 0.01);
  return gain;
}

/**
 * "clink" — zvek tegle: kratki sine sweep 800→400Hz, 0.08s
 */
function _playClink() {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = _makeGain(t, 0.08);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);

  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

  osc.connect(gain);
  osc.start(t);
  osc.stop(t + 0.09);
}

/**
 * "berba" — berba: noise burst + low thump, 0.15s
 */
function _playBerba() {
  const t = ctx.currentTime;

  // Noise burst (listovi/plodovi)
  const noiseBuffer = _whiteNoiseBuffer(0.15);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1200;
  noiseFilter.Q.value = 1.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.15);

  // Low thump
  const osc = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

  thumpGain.gain.setValueAtTime(0.4, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

  osc.connect(thumpGain);
  thumpGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

/**
 * "kuvanje" — kuvanje/ajvar: 3 brze kapljice (bubbling), 0.3s total
 */
function _playKuvanje() {
  const t = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const offset = i * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 500 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, t + offset);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, t + offset + 0.08);

    gain.gain.setValueAtTime(0.12, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.09);
  }
}

/**
 * "toci" — teglanje/sipanje: liquid pour sim, sweep 600→200Hz, 0.2s
 */
function _playToci() {
  const t = ctx.currentTime;

  // Filtered noise za zvuk tečnosti
  const noiseBuffer = _whiteNoiseBuffer(0.2);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, t);
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.2);
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
  gain.gain.setValueAtTime(0.3, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.21);
}

/**
 * "bačva_init" — inicijacija bačve: low wooden thump, 300Hz, 0.25s
 */
function _playBacvaInit() {
  const t = ctx.currentTime;

  // Thump
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);

  gain.gain.setValueAtTime(0.45, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.26);

  // Kratkotrajni click na početku (drvo)
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = 'square';
  click.frequency.value = 180;
  clickGain.gain.setValueAtTime(0.2, t);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.start(t);
  click.stop(t + 0.02);
}

/**
 * "bačva_ko" — BAČVA KO: heavy low thud + long decay, 80Hz + 120Hz, 0.6s
 * Atmosferski — ne alarm. Dvostruki tud + rumble.
 */
function _playBacvaKO() {
  const t = ctx.currentTime;

  // Primarni heavy thud — 80Hz
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(80, t);
  osc1.frequency.exponentialRampToValueAtTime(25, t + 0.5);
  gain1.gain.setValueAtTime(0.6, t);
  gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + 0.61);

  // Sekundarni harmonik — 120Hz, malo kasniji
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(120, t + 0.02);
  osc2.frequency.exponentialRampToValueAtTime(50, t + 0.4);
  gain2.gain.setValueAtTime(0.0001, t);
  gain2.gain.linearRampToValueAtTime(0.35, t + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + 0.55);

  // Noise rumble (rezonanca bačve)
  const noiseBuffer = _whiteNoiseBuffer(0.6);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 150;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.15, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  noiseSource.connect(lpf);
  lpf.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.61);
}

/**
 * "rakija" — destilacija: hissing steam, narrow bandpass noise, 0.4s
 */
function _playRakija() {
  const t = ctx.currentTime;
  const noiseBuffer = _whiteNoiseBuffer(0.4);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  // Uski bandpass da izgleda kao para/hiss
  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(3000, t);
  bpf.frequency.linearRampToValueAtTime(4500, t + 0.2);
  bpf.frequency.linearRampToValueAtTime(2500, t + 0.4);
  bpf.Q.value = 4;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.28, t + 0.05);
  gain.gain.setValueAtTime(0.28, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

  noiseSource.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.41);
}

/**
 * "prodaj" — prodaja: cash register click, 1200Hz tap, 0.05s
 */
function _playProdaj() {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);

  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

/**
 * "toast_info" — soft click, 600Hz, 0.03s
 */
function _playToastInfo() {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 600;

  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.04);
}

/**
 * "toast_warn" — double beep, 400Hz, 0.12s
 */
function _playToastWarn() {
  const t = ctx.currentTime;
  for (let i = 0; i < 2; i++) {
    const offset = i * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 400;

    gain.gain.setValueAtTime(0.2, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.06);
  }
}

/**
 * "toast_error" — descend 500→200Hz, 0.2s
 */
function _playToastError() {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(500, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);

  gain.gain.setValueAtTime(0.18, t);
  gain.gain.setValueAtTime(0.18, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.21);
}

/**
 * "day_advance" — sledeći dan: soft gong, 220Hz + harmonik, 0.4s
 */
function _playDayAdvance() {
  const t = ctx.currentTime;

  // Fundamental
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.value = 220;
  gain1.gain.setValueAtTime(0.3, t);
  gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + 0.41);

  // Harmonik (karakteristika gonga — ne savršen)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = 550; // ne egzaktan harmonik — gong karakter
  gain2.gain.setValueAtTime(0.12, t);
  gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + 0.3);
}

/**
 * "event" — daily event: paper rustle sim (noise burst), 0.1s
 */
function _playEvent() {
  const t = ctx.currentTime;
  const noiseBuffer = _whiteNoiseBuffer(0.1);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  // Visoki bandpass — zvuk papira
  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 4000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

  noiseSource.connect(hpf);
  hpf.connect(gain);
  gain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.11);
}

/**
 * "ending_good" — dobar ending: ascending major triad (C-E-G), 0.6s total
 */
function _playEndingGood() {
  const t = ctx.currentTime;
  // C4=261.63, E4=329.63, G4=392.00
  const freqs = [261.63, 329.63, 392.00];
  freqs.forEach((freq, i) => {
    const offset = i * 0.15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, t + offset);
    gain.gain.linearRampToValueAtTime(0.25, t + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.4);
  });
}

/**
 * "ending_bad" — loš ending: descending diminished (C-Eb-Gb), 0.4s
 */
function _playEndingBad() {
  const t = ctx.currentTime;
  // Diminished chord, descending: C4=261.63, Eb4=311.13, Gb4=369.99
  // Sviramo od gore nadole za "pad" efekt
  const freqs = [369.99, 311.13, 261.63];
  freqs.forEach((freq, i) => {
    const offset = i * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.18, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.3);
  });
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Kreira kratki AudioBuffer ispunjen white noise-om.
 * @param {number} duration — dužina u sekundama
 * @returns {AudioBuffer}
 */
function _whiteNoiseBuffer(duration) {
  const sampleRate = ctx.sampleRate;
  const frameCount = Math.ceil(sampleRate * duration);
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}
