/**
 * audio.js — Ceca Čujka
 * Web Audio synthesis za "Poslednja Smena"
 * Industrijska melanholija: drone, klik, tranzicija, kraj
 */

let ctx = null;
let droneGain = null;
let droneOsc = null;
let droneRunning = false;
let enabled = true;

function getCtx() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  } catch (e) {
    return null;
  }
}

/**
 * Kreira AudioContext — pozovi na prvi user gesture.
 * @returns {boolean} false ako Web Audio nije podržan
 */
export function initAudio() {
  try {
    const c = getCtx();
    if (!c) return false;
    if (c.state === 'suspended') c.resume();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Pokreće konstantni hum mašinerije (~60Hz, gain 0.03).
 * Neznatna detuning modulacija da ne bude monoton.
 */
export function startDrone() {
  if (!enabled) return;
  try {
    const c = getCtx();
    if (!c || droneRunning) return;

    droneGain = c.createGain();
    droneGain.gain.setValueAtTime(0, c.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.03, c.currentTime + 1.5);
    droneGain.connect(c.destination);

    droneOsc = c.createOscillator();
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(60, c.currentTime);

    // Lagan LFO na frekvenciju — neka diše
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 1.2;
    lfo.connect(lfoGain);
    lfoGain.connect(droneOsc.frequency);
    lfo.start();

    droneOsc.connect(droneGain);
    droneOsc.start();
    droneRunning = true;
  } catch (e) {
    droneRunning = false;
  }
}

/**
 * Zaustavlja drone sa laganim fade-out.
 */
export function stopDrone() {
  try {
    if (!droneRunning || !droneGain || !ctx) return;
    const now = ctx.currentTime;
    droneGain.gain.setValueAtTime(droneGain.gain.value, now);
    droneGain.gain.linearRampToValueAtTime(0, now + 1.2);
    const osc = droneOsc;
    setTimeout(() => { try { osc.stop(); } catch (e) {} }, 1300);
    droneRunning = false;
    droneOsc = null;
    droneGain = null;
  } catch (e) {
    droneRunning = false;
  }
}

/**
 * Kratki metalički klik — square wave, ~800Hz, decay 0.08s.
 */
export function playClick() {
  if (!enabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {}
}

/**
 * String-like tranzicioni ton — triangle, ~220Hz, decay 0.4s.
 */
export function playSceneTransition() {
  if (!enabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(210, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  } catch (e) {}
}

/**
 * Kraj igre: tišina (0.6s), pa dubok ton koji se rastvara (~100Hz, sine, 2s).
 */
export function playEnding() {
  if (!enabled) return;
  try {
    const c = getCtx();
    if (!c) return;
    const delay = 0.6;
    const now = c.currentTime + delay;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(88, now + 2.0);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    gain.gain.setValueAtTime(0.22, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 2.1);
  } catch (e) {}
}

/**
 * Mute/unmute audio. Ako se isključuje — zaustavi drone.
 * @param {boolean} bool
 */
export function setEnabled(bool) {
  enabled = !!bool;
  if (!enabled && droneRunning) stopDrone();
}

/** @returns {boolean} */
export function isEnabled() {
  return enabled;
}
