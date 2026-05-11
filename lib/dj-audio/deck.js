// deck.js — Deck class (load, play, EQ, reverb, sync, desync)
//
// Signal chain per deck:
//   BufferSource -> EQ -> Reverb -> HalfBeatDelay -> deckGain -> masterGain
//
// EQ, Reverb i HalfBeatDelay su INTERNI engine API-ji — igrač ne dira ih.
// Auto-mix / game scena ih poziva interno kroz Deck.setEQ / setReverb /
// applyHalfBeatDelay tokom prelaza.
//
// Metadata se PARSE iz filename-a (BPM-KEY-name-BARS.opus). Nema FFT analize.

import { ThreeBandEQ } from './effects/eq.js';
import { FeedbackDelayReverb } from './effects/feedback-delay.js';
import { HalfBeatDelay } from './effects/half-beat-delay.js';
import { parseTrackName, expectedDuration } from './parser.js';

export class Deck {
  /**
   * @param {AudioContext} ctx
   * @param {AudioNode} masterDestination output node (npr. masterGain)
   * @param {{label?:string, liteMode?:boolean}} [opts]
   */
  constructor(ctx, masterDestination, opts = {}) {
    this.ctx = ctx;
    this.label = opts.label || 'deck';
    this.liteMode = !!opts.liteMode;

    // state
    this.buffer = null;
    this.meta = null;           // {bpm, key, name, bars, ...}
    this.source = null;          // current AudioBufferSourceNode
    this.startTime = 0;          // ctx.currentTime when started
    this.startOffset = 0;        // offset u buffer-u (za pause/resume)
    this.playing = false;
    this.playbackRate = 1.0;
    this.baseDetune = 0;         // cents, za desync pitch drift
    this._listeners = { trackEnd: [], beat: [], barEnd: [] };
    this._beatTimer = null;

    // desync state
    this._desyncIntensity = 0;
    this._desyncLFO = null;
    this._desyncLFOGain = null;
    this._desyncDistortion = null;

    // node graph
    this.deckGain = ctx.createGain();
    this.deckGain.gain.value = 1.0;

    this.eq = new ThreeBandEQ(ctx);

    // half-beat delay je transition effect — uvek prisutan (jeftin),
    // bypass-uje sebe kad je intensity=0. Smešten ZA reverbom u chain-u
    // tako da auto-mix može da engage-uje delay na izlaznom decku tokom
    // poslednjih bara, sa minimalnim mešanjem sa reverb tail-om.
    this.halfBeatDelay = new HalfBeatDelay(ctx);

    // reverb opcioni — skipuj u liteMode
    if (!this.liteMode) {
      this.reverb = new FeedbackDelayReverb(ctx);
      this.eq.output.connect(this.reverb.input);
      this.reverb.output.connect(this.halfBeatDelay.input);
    } else {
      this.reverb = null;
      this.eq.output.connect(this.halfBeatDelay.input);
    }
    this.halfBeatDelay.output.connect(this.deckGain);

    this.deckGain.connect(masterDestination);
  }

  /**
   * Fetch + decode + parse meta iz filename-a.
   * @param {string} url
   * @returns {Promise<object>} TrackMeta
   */
  async load(url) {
    this.stop();
    const filename = url.split('/').pop();
    const meta = parseTrackName(filename);
    if (!meta) {
      throw new Error(`Deck.load: invalid naming for "${filename}". Expected BPM-KEY-name-BARS.opus`);
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Deck.load: fetch failed ${resp.status} ${url}`);
    const arrayBuf = await resp.arrayBuffer();
    const audioBuf = await this.ctx.decodeAudioData(arrayBuf);

    this.buffer = audioBuf;
    this.meta = {
      ...meta,
      url,
      duration: audioBuf.duration,
      expectedDuration: expectedDuration(meta.bpm, meta.bars),
    };
    return this.meta;
  }

  /**
   * Direktan inject buffer + meta (za test-data koji nije iz network-a).
   */
  setBuffer(buffer, meta) {
    this.stop();
    this.buffer = buffer;
    this.meta = { ...meta, duration: buffer.duration };
  }

  play({ fadeIn = 0 } = {}) {
    if (!this.buffer) throw new Error('Deck.play: nema učitanog buffer-a');
    if (this.playing) return;

    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.loop = true; // loops su 8/16 bar — pretpostavka da gen hoce loop. game logika gasi.
    src.playbackRate.value = this.playbackRate;
    // iOS 14: src.detune može biti scheduling-only (cancelScheduledValues + setValueAtTime).
    // Feature-detect: ako detune.value setter ne radi, hold ga u this.baseDetune i apply
    // kroz setValueAtTime u desync() — playbackRate je glavni tempo control, detune je fine.
    if (src.detune && typeof src.detune.value === 'number') {
      try {
        src.detune.value = this.baseDetune;
        this._detuneDirect = true;
      } catch (e) {
        this._detuneDirect = false;
        if (this.baseDetune !== 0) {
          src.detune.setValueAtTime(this.baseDetune, this.ctx.currentTime);
        }
      }
    } else {
      this._detuneDirect = false;
    }

    src.connect(this.eq.input);

    src.onended = () => {
      // onended se okida i pri stop() — proveri da li je stvarno end-of-track
      if (this.source === src && !src.loop) {
        this._emit('trackEnd', { deck: this.label });
      }
    };

    const now = this.ctx.currentTime;
    src.start(now, this.startOffset % this.buffer.duration);
    this.source = src;
    this.startTime = now - (this.startOffset / this.playbackRate);
    this.playing = true;

    if (fadeIn > 0) {
      this.deckGain.gain.setValueAtTime(0, now);
      this.deckGain.gain.linearRampToValueAtTime(1, now + fadeIn);
    }

    this._startBeatTimer();
  }

  pause() {
    if (!this.playing) return;
    this.startOffset = this.getPosition();
    this._stopSource();
    this.playing = false;
    this._stopBeatTimer();
  }

  stop() {
    this._stopSource();
    this.startOffset = 0;
    this.playing = false;
    this._stopBeatTimer();
    this._stopDesyncModulators();
    this._desyncIntensity = 0;
    if (this.halfBeatDelay) this.halfBeatDelay.setIntensity(0);
  }

  _stopSource() {
    if (!this.source) return;
    try { this.source.stop(); } catch (e) {}
    try { this.source.disconnect(); } catch (e) {}
    this.source = null;
  }

  /**
   * Current position u buffer-u u sec.
   */
  getPosition() {
    if (!this.playing || !this.buffer) return this.startOffset;
    const elapsed = (this.ctx.currentTime - this.startTime) * this.playbackRate;
    return elapsed % this.buffer.duration;
  }

  /**
   * Trenutni bar index 0..(bars-1).
   */
  getCurrentBar() {
    if (!this.meta || !this.buffer) return 0;
    const beatsPerBar = 4;
    const secPerBeat = 60 / this.meta.bpm;
    const secPerBar = secPerBeat * beatsPerBar;
    const pos = this.getPosition();
    return Math.floor(pos / secPerBar) % this.meta.bars;
  }

  /**
   * Phase u tekucem beat-u 0..1.
   */
  getBeatPhase() {
    if (!this.meta) return 0;
    const secPerBeat = 60 / this.meta.bpm;
    const pos = this.getPosition();
    return (pos % secPerBeat) / secPerBeat;
  }

  setVolume(v) {
    const clamped = Math.max(0, Math.min(1, v));
    const now = this.ctx.currentTime;
    this.deckGain.gain.cancelScheduledValues(now);
    this.deckGain.gain.setValueAtTime(this.deckGain.gain.value, now);
    this.deckGain.gain.linearRampToValueAtTime(clamped, now + 0.02);
  }

  setEQ(bands) { this.eq.set(bands); }

  setReverb(wet) {
    if (this.reverb) this.reverb.setWet(wet);
  }

  /**
   * Half-beat delay kao transition effect. INTERNI API — igrač ne zove.
   * Pozivaju ga game scene ili auto-mix tokom prelaza za "urgency build-up".
   *
   * Delay vreme automatski prati trenutni effective BPM (meta.bpm * playbackRate),
   * tako da half-beat ostaje muzički zaključan i kad je deck sync-ovan na drugi.
   *
   * @param {number} intensity 0..1 (0 = bypass)
   */
  applyHalfBeatDelay(intensity) {
    if (!this.halfBeatDelay) return;
    if (this.meta) {
      const effBpm = this.meta.bpm * this.playbackRate;
      this.halfBeatDelay.setBpm(effBpm);
    }
    this.halfBeatDelay.setIntensity(intensity);
  }

  /**
   * Half-beat delay sa auto-decay: aktivira se na intensity za zadati broj bara,
   * pa se sam ramp-uje na 0. Šef brief: "delay treba da traje jedan bar ili pola".
   *
   * Automatski sinhronizuje delay vreme sa effective BPM (meta.bpm * playbackRate)
   * pre aktivacije.
   *
   * @param {number} intensity 0..1
   * @param {number} bars 1 = ceo bar, 0.5 = pola bara
   * @returns {number} ukupno trajanje u sekundama (za scheduling drop-a)
   */
  applyHalfBeatDelayForBars(intensity, bars) {
    if (!this.halfBeatDelay) return 0;
    const effBpm = this.meta ? this.meta.bpm * this.playbackRate : 120;
    this.halfBeatDelay.setBpm(effBpm);
    if (typeof this.halfBeatDelay.applyForBars === 'function') {
      return this.halfBeatDelay.applyForBars(intensity, bars, effBpm);
    }
    // fallback ako stari half-beat-delay modul: setIntensity + manual clear
    this.halfBeatDelay.setIntensity(intensity);
    const totalSec = (60 / effBpm) * 4 * bars;
    setTimeout(() => {
      try { this.halfBeatDelay.setIntensity(0); } catch (e) {}
    }, totalSec * 0.9 * 1000);
    return totalSec;
  }

  /**
   * Reset transition effekata (half-beat delay) na bypass.
   * Zove se posle prelaza.
   */
  clearTransitionEffect() {
    if (this.halfBeatDelay) this.halfBeatDelay.setIntensity(0);
  }

  setPlaybackRate(rate) {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    this.playbackRate = clamped;
    if (this.source) {
      const now = this.ctx.currentTime;
      this.source.playbackRate.cancelScheduledValues(now);
      this.source.playbackRate.setValueAtTime(this.source.playbackRate.value, now);
      this.source.playbackRate.linearRampToValueAtTime(clamped, now + 0.05);
    }
    // održi half-beat delay zaključan na effective BPM ako je aktivan
    if (this.halfBeatDelay && this.meta && this.halfBeatDelay.intensity > 0) {
      this.halfBeatDelay.setBpm(this.meta.bpm * clamped);
    }
  }

  /**
   * Match BPM (i opciono phase) ka drugom deck-u.
   * @param {Deck} otherDeck
   */
  syncTo(otherDeck) {
    if (!this.meta || !otherDeck.meta) {
      throw new Error('Deck.syncTo: oba deck-a moraju imati učitan track');
    }
    const targetBpm = otherDeck.meta.bpm * otherDeck.playbackRate;
    const rate = targetBpm / this.meta.bpm;
    this.setPlaybackRate(rate);
  }

  /**
   * Progressive desync — 4 sloja: phase drift, BPM drift, pitch detune, distortion artifacts.
   * @param {number} intensity 0..1
   */
  desync(intensity) {
    const i = Math.max(0, Math.min(1, intensity));
    this._desyncIntensity = i;
    if (i === 0) {
      this._stopDesyncModulators();
      this.setPlaybackRate(1.0);
      this.baseDetune = 0;
      if (this.source && this.source.detune) {
        try { this.source.detune.setValueAtTime(0, this.ctx.currentTime); }
        catch (e) { /* iOS 14 detune scheduling quirk — ignore */ }
      }
      return;
    }

    // sloj 1: BPM drift (LFO na playbackRate)
    // sloj 2: pitch detune (cents)
    if (this.source) {
      const now = this.ctx.currentTime;
      // detune u cents: ±20 cent pri i=1
      const detuneCents = (Math.random() - 0.5) * 40 * i;
      this.baseDetune = detuneCents;
      this.source.detune.cancelScheduledValues(now);
      this.source.detune.setValueAtTime(this.source.detune.value, now);
      this.source.detune.linearRampToValueAtTime(detuneCents, now + 0.2);

      // BPM drift: random walk na playbackRate
      const drift = (Math.random() - 0.5) * 0.08 * i; // ±4% pri i=1
      const newRate = Math.max(0.5, Math.min(2.0, this.playbackRate + drift));
      this.source.playbackRate.cancelScheduledValues(now);
      this.source.playbackRate.setValueAtTime(this.source.playbackRate.value, now);
      this.source.playbackRate.linearRampToValueAtTime(newRate, now + 0.3);
    }

    // sloj 3 (>0.6): distortion artifacts preko WaveShaper na reverb wet path
    if (i > 0.6 && this.reverb) {
      this.reverb.setWet(Math.min(0.4, this.reverb.wetGain.gain.value + 0.2 * i));
    }
  }

  _stopDesyncModulators() {
    if (this._desyncLFO) {
      try { this._desyncLFO.stop(); } catch (e) {}
      try { this._desyncLFO.disconnect(); } catch (e) {}
      this._desyncLFO = null;
    }
    if (this._desyncLFOGain) {
      try { this._desyncLFOGain.disconnect(); } catch (e) {}
      this._desyncLFOGain = null;
    }
  }

  // beat timer — preko setInterval za onBeat/onBarEnd events
  _startBeatTimer() {
    this._stopBeatTimer();
    if (!this.meta) return;
    const secPerBeat = 60 / (this.meta.bpm * this.playbackRate);
    let beatCount = 0;
    this._beatTimer = setInterval(() => {
      this._emit('beat', { deck: this.label, beat: beatCount });
      if (beatCount > 0 && beatCount % 4 === 0) {
        this._emit('barEnd', { deck: this.label, bar: Math.floor(beatCount / 4) });
      }
      beatCount++;
    }, secPerBeat * 1000);
  }

  _stopBeatTimer() {
    if (this._beatTimer) {
      clearInterval(this._beatTimer);
      this._beatTimer = null;
    }
  }

  // event emitter
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
      try { cb(payload); } catch (e) { console.error(`Deck event ${event}`, e); }
    }
  }

  destroy() {
    this.stop();
    if (this.reverb) this.reverb.disconnect();
    if (this.halfBeatDelay) this.halfBeatDelay.disconnect();
    this.eq.disconnect();
    try { this.deckGain.disconnect(); } catch (e) {}
  }
}
