/**
 * SfxPlayer.js — Short sound effects using Web Audio API synthesis
 * All SFX are generated in code — no .wav/.mp3 files
 * @module SfxPlayer
 */

import AudioEngine from './AudioEngine.js';
import EventBus, { EVENTS } from '../engine/EventBus.js';

// Listen for SFX events
EventBus.on(EVENTS.AUDIO_SFX_PLAY, ({ sfx }) => play(sfx));
EventBus.on(EVENTS.DIALOG_CHOICE_SELECT, () => play('click'));
EventBus.on(EVENTS.DIALOG_START, () => play('dialog_open'));
EventBus.on(EVENTS.RESOURCE_CHANGED, ({ delta }) => {
  if (delta > 0) play('resource_gain');
  else if (delta < 0) play('resource_lose');
});

/**
 * Play a named SFX
 * @param {string} name
 */
export function play(name) {
  const ctx = AudioEngine.getContext();
  if (!ctx || AudioEngine.isMuted()) return;

  const builder = SFX[name];
  if (!builder) return;

  try {
    builder(ctx);
  } catch (e) {
    console.warn('[SfxPlayer] Error playing sfx:', name, e);
  }
}

const SFX = {
  /** UI click — 800Hz sine, 80ms decay */
  click(ctx) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 800;
    g.gain.value = 0;
    o.connect(g);
    g.connect(AudioEngine.getMasterGain());
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    o.start();
    o.stop(ctx.currentTime + 0.1);
  },

  /** Dialog open — 1200→800Hz sweep, 200ms */
  dialog_open(ctx) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1200, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
    g.gain.value = 0;
    o.connect(g);
    g.connect(AudioEngine.getMasterGain());
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    o.start();
    o.stop(ctx.currentTime + 0.22);
  },

  /** Resource gain — 440→550Hz ascending, 300ms */
  resource_gain(ctx) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(550, ctx.currentTime + 0.3);
    g.gain.value = 0;
    o.connect(g);
    g.connect(AudioEngine.getMasterGain());
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    o.start();
    o.stop(ctx.currentTime + 0.35);
  },

  /** Resource lose — 440→370Hz descending, 300ms */
  resource_lose(ctx) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(370, ctx.currentTime + 0.3);
    g.gain.value = 0;
    o.connect(g);
    g.connect(AudioEngine.getMasterGain());
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    o.start();
    o.stop(ctx.currentTime + 0.35);
  },

  /** Gated choice — 150Hz thud, 100ms */
  gated(ctx) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = 150;
    g.gain.value = 0;
    o.connect(g);
    g.connect(AudioEngine.getMasterGain());
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    o.start();
    o.stop(ctx.currentTime + 0.12);
  },

  /** Scene transition — white noise fade 500ms */
  transition(ctx) {
    const bufSize = ctx.sampleRate * 0.5;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.08;
    src.connect(g);
    g.connect(AudioEngine.getMasterGain());
    src.start();
  },

  /** Achievement unlock — ascending arpeggio */
  achievement(ctx) {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5-E5-G5-C6
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(AudioEngine.getMasterGain());
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.start(t);
      o.stop(t + 0.35);
    });
  },

  // Ending stingers
  /** Legendarno jutro — D major arpeggio ascending */
  ending_legendarno(ctx) {
    const notes = [293.66, 369.99, 440.0, 587.33, 739.99]; // D4-F#4-A4-D5-F#5
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(AudioEngine.getMasterGain());
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      o.start(t);
      o.stop(t + 0.85);
    });
  },

  /** Solidno jutro — G major chord */
  ending_solidno(ctx) {
    [392.0, 493.88, 587.33].forEach(freq => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(AudioEngine.getMasterGain());
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      o.start();
      o.stop(ctx.currentTime + 1.6);
    });
  },

  /** Prošlo nekako — A minor */
  ending_proslo(ctx) {
    [440.0, 523.25, 659.25].forEach(freq => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(AudioEngine.getMasterGain());
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      o.start();
      o.stop(ctx.currentTime + 1.6);
    });
  },

  /** Chaos morning — dissonant cluster */
  ending_chaos(ctx) {
    [440, 466.16, 493.88, 523.25].forEach(freq => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(AudioEngine.getMasterGain());
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2);
      o.start();
      o.stop(ctx.currentTime + 2.1);
    });
  },

  /** Nismo stigli — descending chromatic */
  ending_fail(ctx) {
    [523.25, 493.88, 466.16, 440, 415.3, 392].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(AudioEngine.getMasterGain());
      const t = ctx.currentTime + i * 0.15;
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.start(t);
      o.stop(t + 0.45);
    });
  },

  /** Secret endings — D minor to D major pivot */
  ending_secret(ctx) {
    // D minor
    [293.66, 349.23, 440].forEach(freq => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(AudioEngine.getMasterGain());
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      o.start();
      o.stop(ctx.currentTime + 1.6);
    });
    // D major pivot
    setTimeout(() => {
      const actx = AudioEngine.getContext();
      if (!actx) return;
      [293.66, 369.99, 440].forEach(freq => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.value = 0;
        o.connect(g);
        g.connect(AudioEngine.getMasterGain());
        g.gain.setValueAtTime(0.15, actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 1.8);
        o.start();
        o.stop(actx.currentTime + 1.9);
      });
    }, 1800);
  }
};

export default { play };
