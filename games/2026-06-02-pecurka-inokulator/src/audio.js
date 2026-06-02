/** @module audio — Ceca Čujka — Web Audio API SFX i ambient. Bez .wav/.mp3. */

/** @type {AudioContext|null} */
let ctx = null;

/** @type {GainNode|null} */
let ambientGain = null;

/** @type {OscillatorNode|null} */
let ambientOsc = null;

/**
 * Inicijalizuje AudioContext i pokreće ambijentalni hum.
 * Mora se pozvati nakon user gesture-a (klik/tap).
 * @returns {Promise<void>}
 */
export async function initAudio() {
  if (ctx) return; // već inicijalizovano
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') await ctx.resume();

  // Ambient hum: 80 Hz sine, gain 0.04
  ambientOsc = ctx.createOscillator();
  ambientGain = ctx.createGain();
  ambientOsc.type = 'sine';
  ambientOsc.frequency.value = 80;
  ambientGain.gain.value = 0.04;
  ambientOsc.connect(ambientGain);
  ambientGain.connect(ctx.destination);
  ambientOsc.start();
}

/**
 * Nastavlja AudioContext ako je bio suspended (Safari policy).
 * @returns {Promise<void>}
 */
export async function resumeAudio() {
  if (ctx && ctx.state === 'suspended') await ctx.resume();
}

/**
 * Pauzira ambijentalni hum (npr. kad je igra na pauzi / menu).
 */
export function muteAmbient() {
  if (!ambientGain) return;
  ambientGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
}

/**
 * Vraća ambijentalni hum (kad se igra nastavlja).
 */
export function unmuteAmbient() {
  if (!ambientGain) return;
  ambientGain.gain.setTargetAtTime(0.04, ctx.currentTime, 0.1);
}

/**
 * Metronomski tick — interval smanjuje sa speed.
 * @param {number} speed - 0.8 (nivo 1) → 3.6 (nivo 10)
 */
export function playTick(speed) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 440 + speed * 40; // viši ton na višim nivoima
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

/**
 * Success hit: ding (880 Hz → 1100 Hz, triangle, 0.15 s) + fizzy noise burst.
 */
export function playHit() {
  if (!ctx) return;

  // Ding
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);

  // Fizzy noise burst
  _playNoiseBurst(0.05, 0.08);
}

/**
 * Golden hit: standardni hit + dodatni harmonik na 1320 Hz.
 */
export function playGoldenHit() {
  if (!ctx) return;

  playHit();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 1320;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

/**
 * Fail (klik van prozora ili promašaj): buzzer sawtooth 200 Hz → 60 Hz + splat noise.
 */
export function playFail() {
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.35);

  _playNoiseBurst(0.1, 0.12);
}

/**
 * Streak aktivacija (streak >= 3): C5–E5–G5 major chord simultano, 0.2 s.
 */
export function playStreakActivation() {
  if (!ctx) return;
  [523, 659, 784].forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  });
}

/**
 * Level clear: C5 → E5 → G5 arpegio, po 0.12 s po noti.
 */
export function playLevelClear() {
  if (!ctx) return;
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + i * 0.12;
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

/**
 * Game over: G4 → E4 → C4 silazni motiv, po 0.18 s.
 */
export function playGameOver() {
  if (!ctx) return;
  [392, 330, 262].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + i * 0.18;
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

/**
 * Countdown beep za nivo start (kratki tick na višoj frekvenciji).
 * @param {boolean} isLast - poslednji beep je viši
 */
export function playCountdown(isLast = false) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = isLast ? 880 : 660;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/**
 * Perfect hit (streak bonus window): zlatni ding + shimmer.
 */
export function playPerfect() {
  if (!ctx) return;
  playGoldenHit();

  // Dodatni shimmer: brzi vibrato triangle
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();

  lfo.frequency.value = 18;
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  osc.type = 'triangle';
  osc.frequency.value = 1760;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  lfo.start();
  osc.start();
  lfo.stop(ctx.currentTime + 0.3);
  osc.stop(ctx.currentTime + 0.3);
}

/**
 * Blink warning (timing window trепери kad se sužava): kratki high-pitched click.
 */
export function playBlink() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 1800;
  gain.gain.setValueAtTime(0.025, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.025);
}

// ── Interni helper ──────────────────────────────────────────────────────────

/**
 * Kratki noise burst — za hit splash i fail splat.
 * @param {number} gainVal  - peak gain
 * @param {number} duration - trajanje u sekundama
 */
function _playNoiseBurst(gainVal, duration) {
  if (!ctx) return;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 0.8;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}
