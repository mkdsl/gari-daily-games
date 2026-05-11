// effects/feedback-delay.js — algoritamski reverb preko feedback delay
//
// NE koristi ConvolverNode (mobile CPU restrikcija per concept doc, sekcija 14 risk 2).
// Umesto toga, kratak DelayNode + feedback loop + lowpass filter za "tail decay".
//
// Topologija:
//   input -> dry path -> output
//         -> wet path: delay -> feedback gain -> back to delay (loop)
//                                            -> wet gain -> output

export class FeedbackDelayReverb {
  /**
   * @param {AudioContext} ctx
   * @param {{delayTime?:number, feedback?:number, lpFreq?:number}} [opts]
   */
  constructor(ctx, opts = {}) {
    this.ctx = ctx;
    const delayTime = opts.delayTime ?? 0.085; // sek — kratka soba feel
    const feedback = opts.feedback ?? 0.55;    // 0..0.95 (>=1 = self-oscillation)
    const lpFreq = opts.lpFreq ?? 3200;        // pristisni high-end u reverb tail

    this.input = ctx.createGain();
    this.input.gain.value = 1.0;

    this.dryGain = ctx.createGain();
    this.dryGain.gain.value = 1.0;

    this.wetGain = ctx.createGain();
    this.wetGain.gain.value = 0.0; // pocni dry

    this.delay = ctx.createDelay(2.0); // max 2s
    this.delay.delayTime.value = delayTime;

    this.feedbackGain = ctx.createGain();
    this.feedbackGain.gain.value = feedback;

    this.lp = ctx.createBiquadFilter();
    this.lp.type = 'lowpass';
    this.lp.frequency.value = lpFreq;

    this.output = ctx.createGain();
    this.output.gain.value = 1.0;

    // dry path
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // wet path: input -> delay -> lp -> wetGain -> output
    //                          \-> feedbackGain -> delay (loop)
    this.input.connect(this.delay);
    this.delay.connect(this.lp);
    this.lp.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // feedback loop
    this.lp.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delay);
  }

  /**
   * Wet level 0..1. 0 = pure dry, 1 = pun reverb.
   * @param {number} wet
   * @param {number} [rampTime]
   */
  setWet(wet, rampTime = 0.05) {
    const w = Math.max(0, Math.min(1, wet));
    const now = this.ctx.currentTime;
    this.wetGain.gain.cancelScheduledValues(now);
    this.wetGain.gain.setValueAtTime(this.wetGain.gain.value, now);
    this.wetGain.gain.linearRampToValueAtTime(w, now + rampTime);
  }

  /**
   * Reverb room size (0=small, 1=hall). Mapira na delayTime + feedback.
   */
  setRoomSize(size) {
    const s = Math.max(0, Math.min(1, size));
    const dt = 0.05 + s * 0.25;   // 50ms..300ms
    const fb = 0.4 + s * 0.5;     // 0.4..0.9
    const now = this.ctx.currentTime;
    this.delay.delayTime.setTargetAtTime(dt, now, 0.05);
    this.feedbackGain.gain.setTargetAtTime(fb, now, 0.05);
  }

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
