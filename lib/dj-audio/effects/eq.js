// effects/eq.js — 3-band EQ chain
//
// low-shelf  @ 250 Hz   (bass)
// peak       @ 1.5 kHz  (mid, Q=1)
// high-shelf @ 5 kHz    (treble)
//
// gain: -24..+24 dB per band

export class ThreeBandEQ {
  /**
   * @param {AudioContext} ctx
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.low = ctx.createBiquadFilter();
    this.low.type = 'lowshelf';
    this.low.frequency.value = 250;
    this.low.gain.value = 0;

    this.mid = ctx.createBiquadFilter();
    this.mid.type = 'peaking';
    this.mid.frequency.value = 1500;
    this.mid.Q.value = 1;
    this.mid.gain.value = 0;

    this.high = ctx.createBiquadFilter();
    this.high.type = 'highshelf';
    this.high.frequency.value = 5000;
    this.high.gain.value = 0;

    // chain: input -> low -> mid -> high -> output
    this.low.connect(this.mid);
    this.mid.connect(this.high);

    this.input = this.low;
    this.output = this.high;
  }

  /**
   * Setuje gain za bend. Vrednost: -24..+24 dB.
   * @param {'low'|'mid'|'high'} band
   * @param {number} gainDb
   * @param {number} [rampTime] sekunde
   */
  setBand(band, gainDb, rampTime = 0.01) {
    const clamped = Math.max(-24, Math.min(24, gainDb));
    const node = this[band];
    if (!node) return;
    const now = this.ctx.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    node.gain.linearRampToValueAtTime(clamped, now + rampTime);
  }

  /**
   * Konveniencija — set all 3.
   * @param {{low?:number, mid?:number, high?:number}} bands
   */
  set({ low, mid, high }) {
    if (low !== undefined) this.setBand('low', low);
    if (mid !== undefined) this.setBand('mid', mid);
    if (high !== undefined) this.setBand('high', high);
  }

  reset() {
    this.set({ low: 0, mid: 0, high: 0 });
  }

  disconnect() {
    try { this.low.disconnect(); } catch (e) {}
    try { this.mid.disconnect(); } catch (e) {}
    try { this.high.disconnect(); } catch (e) {}
  }
}
