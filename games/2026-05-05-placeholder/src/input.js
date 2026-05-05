/**
 * input.js — Keyboard + touch handler za Bespuće
 * Keyboard: ArrowUp/W = thrust, ArrowLeft/A = left, ArrowRight/D = right, Space = action
 * Touch: gornja polovina ekrana = thrust, donja levo/desno zone, tap cijeli = action
 * Eksportuje: initInput(canvas), readInput() → InputSnapshot
 */

const keys = new Set();
const touch = { thrust: false, left: false, right: false, action: false };
let _actionPressed = false;

/** @param {HTMLCanvasElement} canvas */
export function initInput(canvas) {
  window.addEventListener('keydown', e => {
    keys.add(e.key.toLowerCase());
    if (e.key === ' ') { e.preventDefault(); _actionPressed = true; }
  });
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

  // Touch zones
  const handleTouch = (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const h = rect.height;
    const w = rect.width;
    touch.thrust = false;
    touch.left = false;
    touch.right = false;
    touch.action = false;
    for (const t of e.touches) {
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      if (y < h * 0.5) { touch.thrust = true; }
      else if (x < w * 0.5) { touch.left = true; }
      else { touch.right = true; }
    }
    if (e.touches.length === 0) {
      touch.action = true;
      _actionPressed = true;
    }
  };

  canvas.addEventListener('touchstart',  handleTouch, { passive: false });
  canvas.addEventListener('touchmove',   handleTouch, { passive: false });
  canvas.addEventListener('touchend',    handleTouch, { passive: false });
  canvas.addEventListener('touchcancel', handleTouch, { passive: false });
}

/**
 * Vrati snapshot inputa za ovaj frame.
 * @returns {{ thrust: boolean, left: boolean, right: boolean, actionPressed: boolean }}
 */
export function readInput() {
  const k = keys;
  const snapshot = {
    thrust:        k.has('arrowup')    || k.has('w') || touch.thrust,
    left:          k.has('arrowleft')  || k.has('a') || touch.left,
    right:         k.has('arrowright') || k.has('d') || touch.right,
    actionPressed: _actionPressed,
  };
  _actionPressed = false;
  // reset touch action da ne repeata
  touch.action = false;
  return snapshot;
}
