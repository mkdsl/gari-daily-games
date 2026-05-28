let _interval = null;
let _startTime = null;
let _duration = null;

export function startTimer(durationMs, onTick, onExpire) {
  _duration = durationMs;
  _startTime = Date.now();
  _interval = setInterval(() => {
    const elapsed = Date.now() - _startTime;
    const remaining = Math.max(0, _duration - elapsed);
    onTick(remaining);
    if (remaining === 0) {
      clearInterval(_interval);
      _interval = null;
      onExpire();
    }
  }, 100);
}

export function stopTimer() {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
}
