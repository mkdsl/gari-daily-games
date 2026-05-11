// effects/half-beat-delay.js — half-beat delay transition effect
//
// Šef brief (2026-05-11): "delay na pola beata, koji daje svemu brzinu
// i urgentnost u prelazu". CPU-friendly alternativa reverb send-u tokom
// auto-mix transition build-up-a.
//
// Half-beat = 30000 / bpm ms (na 128 BPM = 234.375 ms).
//
// Topologija:
//   input -> dry path -> output
//         -> wet path: delay -> feedback gain -> back to delay (loop)
//                            -> lpf -> wet gain -> output
//
// API:
//   const fx = new HalfBeatDelay(ctx);
//   fx.setBpm(128);            // automatski izračuna delayTime = 0.234s
//   fx.setIntensity(0..1);      // 0 = bypass, 1 = max wet + feedback
//   fx.input.connect(...);
//   fx.output.connect(...);
//
// Pozvati se iz Deck.applyHalfBeatDelay(intensity) — interni API,
// igrač ne dira direktno.

export class HalfBeatDelay {
  /**
   * @param {AudioContext} ctx
   * @param {{bpm?:number, maxFeedback?:number, lpFreq?:number}} [opts]
   */
  constructor(ctx, opts = {}) {
    this.ctx = ctx;
    this._bpm = opts.bpm ?? 120;
    this._maxFeedback = opts.maxFeedback ?? 0.55; // pri intensity=1
    const lpFreq = opts.lpFreq ?? 4500;

    this.input = ctx.createGain();
    this.input.gain.value = 1.0;

    this.output = ctx.createGain();
    this.output.gain.value = 1.0;

    // dry path uvek 1.0 — delay je SEND efekat (paralelan), ne insert.
    this.dryGain = ctx.createGain();
    this.dryGain.gain.value = 1.0;

    this.wetGain = ctx.createGain();
    this.wetGain.gain.value = 0.0; // bypass na startu

    // max 1s delay buffer — 30 BPM (najsporiji) je 1s half-beat, ok
    this.delay = ctx.createDelay(1.0);
    this.delay.delayTime.value = this._halfBeatSec(this._bpm);

    this.feedbackGain = ctx.createGain();
    this.feedbackGain.gain.value = 0.0; // bypass

    this.lp = ctx.createBiquadFilter();
    this.lp.type = 'lowpass';
    this.lp.frequency.value = lpFreq;

    // dry path
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // wet path
    this.input.connect(this.delay);
    this.delay.connect(this.lp);
    this.lp.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // feedback loop
    this.lp.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delay);

    this._intensity = 0;
  }

  _halfBeatSec(bpm) {
    // half-beat = 0.5 * (60 / bpm) sec = 30 / bpm sec
    const safeBpm = Math.max(30, Math.min(300, bpm));
    return 30 / safeBpm;
  }

  /**
   * Update BPM — pomera delayTime na novi half-beat interval.
   * Smooth ramp da ne klikne.
   * @param {number} bpm
   * @param {number} [rampTime]
   */
  setBpm(bpm, rampTime = 0.05) {
    this._bpm = bpm;
    const dt = this._halfBeatSec(bpm);
    const now = this.ctx.currentTime;
    this.delay.delayTime.cancelScheduledValues(now);
    this.delay.delayTime.setValueAtTime(this.delay.delayTime.value, now);
    this.delay.delayTime.linearRampToValueAtTime(dt, now + rampTime);
  }

  /**
   * Set intensity 0..1.
   *   0      = bypass (wet 0, feedback 0)
   *   0.3-0.5= slap echo (jedan ponovak, urgency feel)
   *   0.7-1.0= long tail (više ponovaka, gušće)
   * Wet gain i feedback skaliraju zajedno.
   * @param {number} i 0..1
   * @param {number} [rampTime]
   */
  setIntensity(i, rampTime = 0.05) {
    const clamped = Math.max(0, Math.min(1, i));
    this._intensity = clamped;
    const wet = clamped * 0.6;                       // max wet 0.6
    const fb = clamped * this._maxFeedback;           // max feedback 0.55
    const now = this.ctx.currentTime;
    this.wetGain.gain.cancelScheduledValues(now);
    this.wetGain.gain.setValueAtTime(this.wetGain.gain.value, now);
    this.wetGain.gain.linearRampToValueAtTime(wet, now + rampTime);
    this.feedbackGain.gain.cancelScheduledValues(now);
    this.feedbackGain.gain.setValueAtTime(this.feedbackGain.gain.value, now);
    this.feedbackGain.gain.linearRampToValueAtTime(fb, now + rampTime);
  }

  get intensity() { return this._intensity; }
  get bpm() { return this._bpm; }

  disconnect() {
    try { this.input.disconnect(); } catch (e) {}
    try { this.dryGain.disconnect(); } catch (e) {}
    try { this.wetGain.disconnect(); } catch (e) {}
    try { this.delay.disconnect(); } catch (e) {}
    try { this.feedbackGain.disconnect(); } catch (e) {}
    try { this.lp.disconnect(); } catch (e) {}
    try { this.output.disconnect(); } catch (e) {}
  }
}
