/**
 * @file audio.js
 * @description Web Audio API implementacija za Frekventni Grad.
 *              Bass loop, arpeggio, hit zvukovi, night-end jingle.
 *
 * Sve scheduling koristi AudioContext.currentTime — nikad Date.now().
 * Loop pattern koristi lookahead scheduler (setTimeout + scheduleAhead)
 * umesto setInterval da se izbjegnu timing drift problemi.
 *
 * @module audio
 */

// ─── Module-level state ───────────────────────────────────────────────────────

/** @type {AudioContext|null} */
let _ctx = null;

/** @type {GainNode|null} Glavni output gain */
let _masterGain = null;

// Bass loop state
let _bassActive = false;
let _bassNextTime = 0;
let _bassBpm = 120;
/** @type {ReturnType<typeof setTimeout>|null} */
let _bassTimerId = null;

// Arpeggio loop state
let _arpActive = false;
let _arpNextTime = 0;
let _arpBpm = 120;
let _arpIndex = 0;
/** @type {ReturnType<typeof setTimeout>|null} */
let _arpTimerId = null;
/** @type {GainNode|null} Gain za smoothno zaustavljanje arpeggija */
let _arpMasterGain = null;

/** Frekvencije arpeggija: A3, C#4, E4, G#4 */
const ARP_FREQS = [220, 277, 330, 415];

/** Lookahead za scheduling (sekunde) */
const SCHEDULE_AHEAD = 0.3;

/** Interval provjere scheduler-a (ms) */
const SCHEDULER_INTERVAL = 100;

// ─── Soft-clip WaveShaper curve ───────────────────────────────────────────────

/**
 * Pravi soft-clip WaveShaper kurvu za distortion.
 * @param {AudioContext} ctx
 * @param {number} amount  0–100 jačina clipa
 * @returns {WaveShaperNode}
 */
function makeSoftClipDistortion(ctx, amount = 50) {
  const shaper = ctx.createWaveShaper();
  const samples = 256;
  const curve = new Float32Array(samples);
  const k = (2 * amount) / (100 - amount);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  shaper.curve = curve;
  shaper.oversample = '2x';
  return shaper;
}

// ─── initAudio ────────────────────────────────────────────────────────────────

/**
 * Inicijalizuje AudioContext i interni master gain.
 * Mora se zvati iz user-gesture handlera (click, keydown…).
 * Prihvata opcioni vanjski AudioContext koji je kreirao main.js;
 * ako nije dat, kreira novi.
 *
 * @param {AudioContext} [audioCtx]
 * @returns {Promise<void>}
 */
export async function initAudio(audioCtx) {
  if (_ctx) return; // već inicijalizovano

  _ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

  // Resume ako je browser suspendovao (autoplay policy)
  if (_ctx.state === 'suspended') {
    await _ctx.resume();
  }

  // Master gain — sve ide kroz njega
  _masterGain = _ctx.createGain();
  _masterGain.gain.setValueAtTime(1.0, _ctx.currentTime);
  _masterGain.connect(_ctx.destination);
}

// ─── Bass loop ────────────────────────────────────────────────────────────────

/**
 * Scheduled jedna nota bas loopa na zadatom vremenu.
 * @param {AudioContext} ctx
 * @param {number} time  AudioContext.currentTime u sekundama
 * @param {number} bpm
 */
function scheduleBassNote(ctx, time, bpm) {
  const beatDur = 60 / bpm;        // četvrtina
  const noteDur = 0.250;           // trajanje oscilatorske note
  const attack = 0.010;
  const sustainEnd = 0.100;
  const release = 0.200;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.value = 55; // A1

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.3, time + attack);
  gain.gain.setValueAtTime(0.3, time + sustainEnd);
  gain.gain.linearRampToValueAtTime(0, time + release);

  osc.connect(gain);
  gain.connect(_masterGain || ctx.destination);

  osc.start(time);
  osc.stop(time + noteDur);
}

/**
 * Scheduler petlja za bass loop. Poziva se svakih SCHEDULER_INTERVAL ms.
 * Unaprijed planira sve note koje padaju unutar SCHEDULE_AHEAD prozora.
 */
function _bassScheduler() {
  if (!_bassActive || !_ctx) return;

  const now = _ctx.currentTime;
  const beatDur = 60 / _bassBpm;

  while (_bassNextTime < now + SCHEDULE_AHEAD) {
    scheduleBassNote(_ctx, _bassNextTime, _bassBpm);
    _bassNextTime += beatDur;
  }

  _bassTimerId = setTimeout(_bassScheduler, SCHEDULER_INTERVAL);
}

/**
 * Pokreće bas loop u petlji na zadatom BPM-u.
 * @param {AudioContext} [audioCtx]  opcionalni — ako je main.js proslijedio ctx
 * @param {number} [bpm=120]
 * @returns {void}
 */
export function playBassLoop(audioCtx, bpm = 120) {
  if (!_ctx && audioCtx) _ctx = audioCtx;
  if (!_ctx) return;

  if (_bassActive) stopBassLoop();

  _bassActive = true;
  _bassBpm = bpm;
  _bassNextTime = _ctx.currentTime + 0.05; // kratki offset za stabilan start

  _bassScheduler();
}

/**
 * Zaustavlja bas loop.
 * @returns {void}
 */
export function stopBassLoop() {
  _bassActive = false;
  if (_bassTimerId !== null) {
    clearTimeout(_bassTimerId);
    _bassTimerId = null;
  }
}

// ─── Arpeggio loop ────────────────────────────────────────────────────────────

/**
 * Scheduled jednu notu arpeggija.
 * @param {AudioContext} ctx
 * @param {number} time
 * @param {number} freq
 */
function scheduleArpNote(ctx, time, freq) {
  const noteDur = 0.080;
  const attack = 0.005;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.12, time + attack);
  gain.gain.linearRampToValueAtTime(0, time + noteDur);

  osc.connect(gain);
  // Ide kroz _arpMasterGain radi smooth zaustavljanja
  gain.connect(_arpMasterGain || _masterGain || ctx.destination);

  osc.start(time);
  osc.stop(time + noteDur + 0.005);
}

/**
 * Scheduler petlja za arpeggio loop.
 */
function _arpScheduler() {
  if (!_arpActive || !_ctx) return;

  const now = _ctx.currentTime;
  const eighthDur = 60 / _arpBpm / 2; // osmina

  while (_arpNextTime < now + SCHEDULE_AHEAD) {
    const freq = ARP_FREQS[_arpIndex % ARP_FREQS.length];
    scheduleArpNote(_ctx, _arpNextTime, freq);
    _arpIndex++;
    _arpNextTime += eighthDur;
  }

  _arpTimerId = setTimeout(_arpScheduler, SCHEDULER_INTERVAL);
}

/**
 * Pokreće arpegio loop u petlji na zadatom BPM-u.
 * @param {AudioContext} [audioCtx]
 * @param {number} [bpm=120]
 * @returns {void}
 */
export function playArpeggio(audioCtx, bpm = 120) {
  if (!_ctx && audioCtx) _ctx = audioCtx;
  if (!_ctx) return;

  if (_arpActive) stopArpeggio();

  // Dedicated gain node za arpeggio — može se fade-out-ovati posebno
  _arpMasterGain = _ctx.createGain();
  _arpMasterGain.gain.setValueAtTime(1.0, _ctx.currentTime);
  _arpMasterGain.connect(_masterGain || _ctx.destination);

  _arpActive = true;
  _arpBpm = bpm;
  _arpIndex = 0;
  _arpNextTime = _ctx.currentTime + 0.05;

  _arpScheduler();
}

/**
 * Zaustavlja arpegio loop uz kratki fade-out da ne puca.
 * @returns {void}
 */
export function stopArpeggio() {
  _arpActive = false;
  if (_arpTimerId !== null) {
    clearTimeout(_arpTimerId);
    _arpTimerId = null;
  }
  if (_arpMasterGain && _ctx) {
    const now = _ctx.currentTime;
    _arpMasterGain.gain.cancelScheduledValues(now);
    _arpMasterGain.gain.setValueAtTime(_arpMasterGain.gain.value, now);
    _arpMasterGain.gain.linearRampToValueAtTime(0, now + 0.080);
  }
  _arpMasterGain = null;
}

// ─── Hit sounds ───────────────────────────────────────────────────────────────

/**
 * Reproducira kratki hit zvuk koji odgovara rezultatu udara.
 * @param {AudioContext} [audioCtx]
 * @param {'PERFECT'|'GOOD'|'MISS'} result
 * @returns {void}
 */
export function playHitSound(audioCtx, result) {
  if (!_ctx && audioCtx) _ctx = audioCtx;
  if (!_ctx) return;

  const now = _ctx.currentTime;
  const dest = _masterGain || _ctx.destination;

  if (result === 'PERFECT') {
    // sine 880 Hz, 30ms, gain 0.3
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.030);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.035);

  } else if (result === 'GOOD') {
    // sine 660 Hz, 40ms, gain 0.2
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.040);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.045);

  } else if (result === 'MISS') {
    // square 80 Hz, 100ms, gain 0.15, soft-clip distortion
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    const shaper = makeSoftClipDistortion(_ctx, 60);

    osc.type = 'square';
    osc.frequency.value = 80;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.100);

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.110);
  }
}

// ─── Night end crescendo ──────────────────────────────────────────────────────

/**
 * Reproducira kratku jingle melodiju na kraju noći.
 * Uzlazni arpeggio [220, 330, 440, 660] Hz, svaka nota 150ms,
 * uz gain crescendo od 0.3 → 0.8 za 2s, pa fade na 0 za 1s.
 *
 * @param {AudioContext} [audioCtx]
 * @returns {void}
 */
export function playNightEnd(audioCtx) {
  if (!_ctx && audioCtx) _ctx = audioCtx;
  if (!_ctx) return;

  const now = _ctx.currentTime;
  const noteFreqs = [220, 330, 440, 660];
  const noteDur = 0.150;
  const totalNotesDur = noteFreqs.length * noteDur; // 0.6s

  // Crescendo gain node za cijelu sekvencu
  const crescendoGain = _ctx.createGain();
  crescendoGain.gain.setValueAtTime(0.3, now);
  crescendoGain.gain.linearRampToValueAtTime(0.8, now + 2.0);
  crescendoGain.gain.linearRampToValueAtTime(0, now + 3.0);
  crescendoGain.connect(_masterGain || _ctx.destination);

  noteFreqs.forEach((freq, i) => {
    const t = now + i * noteDur;
    const osc = _ctx.createOscillator();
    const noteGain = _ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    noteGain.gain.setValueAtTime(0, t);
    noteGain.gain.linearRampToValueAtTime(1.0, t + 0.010);  // attack
    noteGain.gain.setValueAtTime(1.0, t + noteDur - 0.030);
    noteGain.gain.linearRampToValueAtTime(0, t + noteDur);  // release

    osc.connect(noteGain);
    noteGain.connect(crescendoGain);

    osc.start(t);
    osc.stop(t + noteDur + 0.005);
  });
}
