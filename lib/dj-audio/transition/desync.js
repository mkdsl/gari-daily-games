// transition/desync.js — progressive desync animator
//
// Wrappuje deck.desync() u glatku animaciju 0 -> targetIntensity tokom durationMs.
// Periodicno re-applicira random walk efekte (svako 300ms refresh).

export class DesyncAnimator {
  /**
   * @param {Deck} deck
   */
  constructor(deck) {
    this.deck = deck;
    this._raf = null;
    this._interval = null;
    this._currentIntensity = 0;
  }

  /**
   * Ramp od trenutne intensity do target tokom durationMs.
   * @param {number} target 0..1
   * @param {number} durationMs
   */
  rampTo(target, durationMs = 5000) {
    this.stop();
    const start = performance.now();
    const startIntensity = this._currentIntensity;
    const delta = target - startIntensity;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = this._easeInOut(t);
      this._currentIntensity = startIntensity + delta * eased;
      this.deck.desync(this._currentIntensity);
      if (t < 1) {
        this._raf = requestAnimationFrame(tick);
      } else {
        this._raf = null;
        // posle ramp-a, refresh modulators na svakih 400ms za "lively" drift
        if (target > 0) {
          this._interval = setInterval(() => {
            this.deck.desync(this._currentIntensity);
          }, 400);
        }
      }
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  reset() {
    this.stop();
    this._currentIntensity = 0;
    this.deck.desync(0);
  }

  getIntensity() {
    return this._currentIntensity;
  }

  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}
