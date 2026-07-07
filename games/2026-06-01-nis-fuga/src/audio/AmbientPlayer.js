/**
 * AmbientPlayer.js — Scene-specific ambient audio using Web Audio API
 * Each scene has a unique generative ambient soundscape
 * @module AmbientPlayer
 */

import AudioEngine from './AudioEngine.js';
import EventBus, { EVENTS } from '../engine/EventBus.js';

/** @type {Array<AudioNode>} Active ambient nodes */
let activeNodes = [];

/** @type {string|null} Currently playing track */
let currentTrack = null;

/** @type {GainNode|null} Ambient master gain */
let ambientGain = null;

// Listen for scene ambient changes
EventBus.on(EVENTS.AUDIO_AMBIENT_CHANGE, ({ track }) => {
  if (track !== currentTrack) {
    play(track);
  }
});

/**
 * Play ambient track for a scene
 * @param {string} trackName
 */
export function play(trackName) {
  stop();
  currentTrack = trackName;

  const ctx = AudioEngine.getContext();
  if (!ctx) return;

  ambientGain = AudioEngine.createGainNode(0);
  if (!ambientGain) return;

  // Fade in
  ambientGain.gain.setTargetAtTime(0.25, ctx.currentTime, 0.5);

  const builder = AMBIENTS[trackName];
  if (!builder) return;

  try {
    activeNodes = builder(ctx, ambientGain);
  } catch (e) {
    console.warn('[AmbientPlayer] Error building ambient:', trackName, e);
  }
}

/**
 * Stop ambient playback with fade out
 */
export function stop() {
  const ctx = AudioEngine.getContext();
  if (ambientGain && ctx) {
    ambientGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    setTimeout(() => {
      for (const node of activeNodes) {
        try { node.stop?.(); } catch {}
        try { node.disconnect?.(); } catch {}
      }
      try { ambientGain?.disconnect(); } catch {}
      activeNodes = [];
      ambientGain = null;
    }, 800);
  } else {
    activeNodes = [];
    ambientGain = null;
  }
  currentTrack = null;
}

/**
 * Ambient builder functions for each scene
 */
const AMBIENTS = {
  bulevar(ctx, dest) {
    const nodes = [];

    // Low drone — morning street rumble
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.value = 82;
    droneGain.gain.value = 0.08;
    drone.connect(droneGain);
    droneGain.connect(dest);
    drone.start();
    nodes.push(drone);

    // Filtered white noise — distant traffic
    const bufSize = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.04;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.3;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start();
    nodes.push(noise);

    // Stochastic click pattern — footsteps / tram
    const clickInterval = setInterval(() => {
      const c = ctx.createOscillator();
      const cg = ctx.createGain();
      c.type = 'triangle';
      c.frequency.value = 200 + Math.random() * 400;
      cg.gain.value = 0;
      c.connect(cg);
      cg.connect(dest);
      cg.gain.setValueAtTime(0.05, ctx.currentTime);
      cg.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      c.start();
      c.stop(ctx.currentTime + 0.1);
      nodes.push(c);
    }, 800 + Math.random() * 1200);
    nodes.push({ stop: () => clearInterval(clickInterval), disconnect: () => {} });

    return nodes;
  },

  kiosk(ctx, dest) {
    const nodes = [];

    // Bandpass noise — crowd chatter
    const bufSize = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.04;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 2;
    const ng = ctx.createGain();
    ng.gain.value = 0.4;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(dest);
    noise.start();
    nodes.push(noise);

    // Rhythmic percussive bursts — printer sounds
    const printInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = 100 + Math.random() * 50;
        g.gain.value = 0;
        o.connect(g);
        g.connect(dest);
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        o.start();
        o.stop(ctx.currentTime + 0.06);
      }
    }, 300);
    nodes.push({ stop: () => clearInterval(printInterval), disconnect: () => {} });

    return nodes;
  },

  kafana(ctx, dest) {
    const nodes = [];

    // Pentatonic random walk — distant music
    const scale = [293.66, 329.63, 392.0, 440.0, 493.88]; // D-E-G-A-B pentatonic
    let scaleIdx = 0;

    const melody = ctx.createOscillator();
    const melGain = ctx.createGain();
    melody.type = 'sine';
    melody.frequency.value = scale[0];
    melGain.gain.value = 0.04;
    melody.connect(melGain);
    melGain.connect(dest);
    melody.start();
    nodes.push(melody);

    const noteInterval = setInterval(() => {
      const dir = Math.random() > 0.5 ? 1 : -1;
      scaleIdx = Math.max(0, Math.min(scale.length - 1, scaleIdx + dir));
      melody.frequency.setTargetAtTime(scale[scaleIdx], ctx.currentTime, 0.1);
    }, 600);
    nodes.push({ stop: () => clearInterval(noteInterval), disconnect: () => {} });

    // Decay pops — coffee cups, chairs
    const popInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 400 + Math.random() * 200;
        g.gain.value = 0;
        o.connect(g);
        g.connect(dest);
        g.gain.setValueAtTime(0.04, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        o.start();
        o.stop(ctx.currentTime + 0.18);
      }
    }, 1500);
    nodes.push({ stop: () => clearInterval(popInterval), disconnect: () => {} });

    return nodes;
  },

  tvrdjava(ctx, dest) {
    const nodes = [];

    // LFO-modulated wind
    const wind = ctx.createOscillator();
    wind.type = 'sawtooth';
    wind.frequency.value = 0.15;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.06;
    wind.connect(windGain);

    const bufSize = ctx.sampleRate * 5;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;

    const ng = ctx.createGain();
    ng.gain.value = 0.2;

    noise.connect(lp);
    lp.connect(ng);
    windGain.connect(ng.gain); // LFO into gain
    ng.connect(dest);
    noise.start();
    wind.start();
    nodes.push(noise, wind);

    return nodes;
  },

  kapija(ctx, dest) {
    const nodes = [];

    // Sub oscillator — bass rumble from club
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.value = 40;
    subGain.gain.value = 0.12;
    sub.connect(subGain);
    subGain.connect(dest);
    sub.start();
    nodes.push(sub);

    // Pulsed bandpass — muffled music
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 350;
    bp.Q.value = 3;
    const ng = ctx.createGain();
    ng.gain.value = 0.15;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(dest);
    noise.start();
    nodes.push(noise);

    // Pulse effect — bass kicks
    let beat = 0;
    const beatInterval = setInterval(() => {
      beat++;
      if (beat % 4 === 0) {
        const kick = ctx.createOscillator();
        const kg = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(80, ctx.currentTime);
        kick.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
        kg.gain.setValueAtTime(0.3, ctx.currentTime);
        kg.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        kick.connect(kg);
        kg.connect(dest);
        kick.start();
        kick.stop(ctx.currentTime + 0.22);
      }
    }, 125); // ~120 BPM 16th notes
    nodes.push({ stop: () => clearInterval(beatInterval), disconnect: () => {} });

    return nodes;
  }
};

export default { play, stop };
