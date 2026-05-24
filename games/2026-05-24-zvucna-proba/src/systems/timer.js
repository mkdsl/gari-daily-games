// timer.js — Countdown, urgency

export class GameTimer {
  constructor({ duration, onTick, onExpire, onUrgency }) {
    this.duration = duration;     // ms
    this.onTick = onTick;         // (remaining, fraction) => void
    this.onExpire = onExpire;     // () => void
    this.onUrgency = onUrgency;   // (remaining) => void — called when <2000ms
    this._start = 0;
    this._raf = null;
    this._active = false;
    this._urgencyFired = false;
  }

  start() {
    this._start = performance.now();
    this._active = true;
    this._urgencyFired = false;
    this._tick();
  }

  stop() {
    this._active = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  elapsed() {
    return performance.now() - this._start;
  }

  _tick() {
    if (!this._active) return;
    const elapsed = performance.now() - this._start;
    const remaining = Math.max(0, this.duration - elapsed);
    const fraction = remaining / this.duration;

    this.onTick && this.onTick(remaining, fraction);

    if (!this._urgencyFired && remaining < 2000) {
      this._urgencyFired = true;
      this.onUrgency && this.onUrgency(remaining);
    }

    if (remaining <= 0) {
      this._active = false;
      this.onExpire && this.onExpire();
      return;
    }

    this._raf = requestAnimationFrame(() => this._tick());
  }
}
