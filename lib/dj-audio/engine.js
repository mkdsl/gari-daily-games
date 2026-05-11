// engine.js — AudioEngine orchestrator
//
// Vlasnik AudioContext-a + master output chain.
// Factory za Deck instance.
//
// Mobile lite mode: disable reverb, max 1 deck.
// iOS Safari handling: AudioContext mora da krene posle user gesture.

import { Deck } from './deck.js';

export class AudioEngine {
  /**
   * @param {{masterVolume?:number, sampleRate?:number, latencyHint?:string}} [opts]
   */
  constructor(opts = {}) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('AudioEngine: Web Audio API nije podrzan');

    const ctxOpts = {};
    if (opts.sampleRate) ctxOpts.sampleRate = opts.sampleRate;
    if (opts.latencyHint) ctxOpts.latencyHint = opts.latencyHint;

    this.ctx = new AC(ctxOpts);
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = opts.masterVolume ?? 0.8;
    this.masterGain.connect(this.ctx.destination);

    this.decks = new Map();
    this.liteMode = false;

    this._listeners = {};
  }

  /**
   * iOS Safari: AudioContext starts u "suspended" state-u. Mora ovo da se zove
   * iz user gesture handler-a (click/touch) da bi audio krenuo.
   */
  async resume() {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx.state;
  }

  /**
   * @param {string} [label]
   * @returns {Deck}
   */
  createDeck(label) {
    const l = label || `deck${this.decks.size + 1}`;
    if (this.decks.has(l)) return this.decks.get(l);

    if (this.liteMode && this.decks.size >= 1) {
      throw new Error('AudioEngine: liteMode dozvoljava max 1 deck');
    }

    const deck = new Deck(this.ctx, this.masterGain, {
      label: l,
      liteMode: this.liteMode,
    });
    this.decks.set(l, deck);
    return deck;
  }

  getDeck(label) {
    return this.decks.get(label) || null;
  }

  setMasterVolume(v) {
    const clamped = Math.max(0, Math.min(1, v));
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(clamped, now + 0.02);
  }

  /**
   * Lite mode: disable reverb (CPU), enforce single-deck.
   * Mora se zvati PRE createDeck, ne menja existing decks.
   */
  setMobileLiteMode(enabled) {
    this.liteMode = !!enabled;
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((f) => f !== cb);
  }

  _emit(event, payload) {
    const list = this._listeners[event] || [];
    for (const cb of list) {
      try { cb(payload); } catch (e) { console.error(`Engine event ${event}`, e); }
    }
  }

  async destroy() {
    for (const deck of this.decks.values()) deck.destroy();
    this.decks.clear();
    try { this.masterGain.disconnect(); } catch (e) {}
    if (this.ctx.state !== 'closed') {
      await this.ctx.close();
    }
  }
}
