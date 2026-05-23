// Countdown timer system
export class Timer {
  constructor(duration, onTick, onExpire) {
    this.duration = duration;
    this.timeLeft = duration;
    this.running = false;
    this.onTick = onTick || (() => {});
    this.onExpire = onExpire || (() => {});
    this._lastTimestamp = null;
  }

  start() {
    this.running = true;
    this._lastTimestamp = null;
  }

  pause() {
    this.running = false;
    this._lastTimestamp = null;
  }

  reset(newDuration) {
    this.duration = newDuration !== undefined ? newDuration : this.duration;
    this.timeLeft = this.duration;
    this.running = false;
    this._lastTimestamp = null;
  }

  /**
   * Call every frame with the current timestamp (from requestAnimationFrame).
   * Returns true if timer just expired.
   */
  update(timestamp) {
    if (!this.running) return false;
    if (this._lastTimestamp === null) {
      this._lastTimestamp = timestamp;
      return false;
    }

    const dt = (timestamp - this._lastTimestamp) / 1000;
    this._lastTimestamp = timestamp;
    this.timeLeft = Math.max(0, this.timeLeft - dt);

    this.onTick(this.timeLeft, dt);

    if (this.timeLeft <= 0) {
      this.running = false;
      this.onExpire();
      return true;
    }
    return false;
  }

  get isUrgent() {
    return this.timeLeft <= 10 && this.running;
  }

  get progress() {
    return this.duration > 0 ? this.timeLeft / this.duration : 0;
  }
}
