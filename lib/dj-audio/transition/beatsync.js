// transition/beatsync.js — beatsync drift monitor
//
// Posle deckA.syncTo(deckB), pozadinski monitor proverava phase drift
// na svakih N sekundi i fine-adjustuje playbackRate da se vrati u sync.

import { CamelotWheel } from '../camelot.js';

export class BeatsyncMonitor {
  /**
   * @param {Deck} master vodjeci deck (target tempo)
   * @param {Deck} slave deck koji se prilagodjava
   * @param {{interval?:number, maxDrift?:number, microAdjust?:number}} [opts]
   */
  constructor(master, slave, opts = {}) {
    this.master = master;
    this.slave = slave;
    this.interval = opts.interval ?? 2000; // ms between drift checks
    this.maxDrift = opts.maxDrift ?? 0.05; // sec, catastrophic threshold
    this.microAdjust = opts.microAdjust ?? 0.0008; // playbackRate increment
    this._timer = null;
    this._listeners = { syncLost: [], driftCorrected: [] };
  }

  start() {
    if (this._timer) return;
    // pocetno BPM matching
    this.slave.syncTo(this.master);

    this._timer = setInterval(() => this._tick(), this.interval);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _tick() {
    if (!this.master.playing || !this.slave.playing) return;
    const mPhase = this.master.getBeatPhase();
    const sPhase = this.slave.getBeatPhase();
    let drift = sPhase - mPhase;
    // wrap u [-0.5, 0.5]
    if (drift > 0.5) drift -= 1;
    if (drift < -0.5) drift += 1;

    const secPerBeat = 60 / (this.master.meta.bpm * this.master.playbackRate);
    const driftSec = drift * secPerBeat;

    if (Math.abs(driftSec) > this.maxDrift) {
      // catastrophic — emit i resync hard
      this._emit('syncLost', { driftSec });
      this.slave.syncTo(this.master);
      return;
    }

    if (Math.abs(drift) > 0.01) {
      // micro-adjust playback rate (slave ide brze ili sporije)
      const adjustment = drift > 0 ? -this.microAdjust : this.microAdjust;
      this.slave.setPlaybackRate(this.slave.playbackRate + adjustment);
      this._emit('driftCorrected', { drift, adjustment });
    }
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  _emit(event, payload) {
    const list = this._listeners[event] || [];
    for (const cb of list) { try { cb(payload); } catch (e) {} }
  }
}
