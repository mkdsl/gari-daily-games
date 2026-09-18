/** @module audio — Web Audio SFX (card flip, city transition, crowd, win) */

/** @type {AudioContext|null} */
let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * @param {number} freq
 * @param {string} type
 * @param {number} dur
 * @param {number} vol
 * @param {number} [attack=0.01]
 */
function playTone(freq, type, dur, vol, attack = 0.01) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch (e) {
    // Silent fail — audio not critical
  }
}

/**
 * Sweep from f1 to f2
 */
function playSweep(f1, f2, type, dur, vol) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(f1, c.currentTime);
    osc.frequency.linearRampToValueAtTime(f2, c.currentTime + dur);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch (e) { }
}

/**
 * White noise burst
 */
function playNoise(dur, vol) {
  try {
    const c = getCtx();
    const bufferSize = c.sampleRate * dur;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * vol;
    }
    const source = c.createBufferSource();
    const gain = c.createGain();
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(c.destination);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    source.start(c.currentTime);
  } catch (e) { }
}

/** Card flip — snap + whoosh */
export function sfxCardFlip() {
  playNoise(0.06, 0.15);
  playSweep(800, 400, 'sine', 0.1, 0.1);
}

/** Button click — click feedback */
export function sfxClick() {
  playTone(440, 'square', 0.08, 0.12);
}

/** City transition — ascending melody */
export function sfxCityTransition(city_index) {
  const base = [220, 247, 277, 311, 370][city_index % 5];
  playTone(base, 'sine', 0.3, 0.2);
  setTimeout(() => playTone(base * 1.25, 'sine', 0.25, 0.15), 150);
  setTimeout(() => playTone(base * 1.5, 'sine', 0.4, 0.18), 300);
}

/** Crowd cheer — multi-voice noise + rising sine */
export function sfxCrowdCheer() {
  playNoise(0.4, 0.2);
  playSweep(200, 600, 'sine', 0.5, 0.15);
  setTimeout(() => playNoise(0.3, 0.12), 200);
}

/** Win jingle */
export function sfxWin() {
  const notes = [261, 329, 392, 523, 659];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.4, 0.2), i * 120);
  });
}

/** Fail / negative */
export function sfxFail() {
  playSweep(400, 150, 'sawtooth', 0.4, 0.18);
  setTimeout(() => playTone(100, 'square', 0.3, 0.12), 200);
}

/** Budget spend */
export function sfxSpend() {
  playTone(330, 'square', 0.1, 0.1);
  setTimeout(() => playTone(220, 'square', 0.1, 0.08), 80);
}

/** Reputation gain */
export function sfxRepGain() {
  playSweep(440, 880, 'sine', 0.25, 0.15);
}

/** Border crossing — low rumble */
export function sfxBorderCrossing() {
  playNoise(0.8, 0.12);
  playTone(60, 'sine', 0.8, 0.2);
}

/** Card option selected */
export function sfxOptionSelect() {
  playTone(660, 'sine', 0.12, 0.15);
}

/** Prestige unlock */
export function sfxPrestige() {
  const notes = [261, 330, 392, 523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.5, 0.18), i * 90);
  });
}

/** Bass thump — for city arrival */
export function sfxBassThump() {
  playTone(55, 'sine', 0.3, 0.35);
  setTimeout(() => playTone(55, 'sine', 0.2, 0.2), 180);
}
