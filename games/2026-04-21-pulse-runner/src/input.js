/**
 * input.js — Keyboard i touch input handler za Pulse Runner.
 *
 * Odgovornosti:
 * - Keyboard: arrow keys + WASD → smer kretanja (gore/dole/levo/desno)
 * - Touch: swipe detection (min threshold da se ne pomeri slučajno)
 * - Queued input buffer: max 1 na čekanju, novi overwrite-uje stari
 * - readQueuedDirection() vraća i briše queued smer
 * - NE izvršava kretanje — to radi collision.js na puls eventu
 *
 * Queued input je delta pozicija: { row: -1|0|1, col: -1|0|1 }
 * Npr. gore = { row: -1, col: 0 }, desno = { row: 0, col: 1 }
 */

/** @typedef {{ row: -1|0|1, col: -1|0|1 }} Direction */

/** Minimalni piksel pomak za swipe detekciju */
const SWIPE_THRESHOLD = 30;

/** @type {Direction|null} Queued input, max 1 — novi overwrite-uje stari */
let _queuedDirection = null;

/** Touch tracking za swipe detection */
let _touchStart = { x: 0, y: 0 };

/**
 * Inicijalizuje keyboard i touch event listener-e.
 * Poziva se jednom iz main.js na startu.
 *
 * @param {HTMLCanvasElement} canvas
 */
export function initInput(canvas) {
  window.addEventListener('keydown', _onKeyDown);
  canvas.addEventListener('touchstart', _onTouchStart, { passive: true });
  canvas.addEventListener('touchend', _onTouchEnd, { passive: true });
}

/**
 * Obrađuje keydown event i postavi queuedDirection.
 * ArrowUp/W → gore, ArrowDown/S → dole, ArrowLeft/A → levo, ArrowRight/D → desno.
 *
 * @param {KeyboardEvent} e
 */
function _onKeyDown(e) {
  const dirMap = {
    'ArrowUp':    { row: -1, col:  0 },
    'w':          { row: -1, col:  0 },
    'W':          { row: -1, col:  0 },
    'ArrowDown':  { row:  1, col:  0 },
    's':          { row:  1, col:  0 },
    'S':          { row:  1, col:  0 },
    'ArrowLeft':  { row:  0, col: -1 },
    'a':          { row:  0, col: -1 },
    'A':          { row:  0, col: -1 },
    'ArrowRight': { row:  0, col:  1 },
    'd':          { row:  0, col:  1 },
    'D':          { row:  0, col:  1 },
  };
  const dir = dirMap[e.key];
  if (dir) {
    _queuedDirection = dir;
    e.preventDefault();
  }
}

/**
 * Pamti početak touch-a za swipe tracking.
 *
 * @param {TouchEvent} e
 */
function _onTouchStart(e) {
  const t = e.touches[0];
  _touchStart = { x: t.clientX, y: t.clientY };
}

/**
 * Izračunava swipe smer na kraju touch-a.
 * Samo dominantna osa (horizontalna ili vertikalna) se uzima.
 * Ignoriše swipe-ove ispod SWIPE_THRESHOLD.
 *
 * @param {TouchEvent} e
 */
function _onTouchEnd(e) {
  const t = e.changedTouches[0];
  const dx = t.clientX - _touchStart.x;
  const dy = t.clientY - _touchStart.y;
  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    _queuedDirection = dx > 0 ? { row: 0, col: 1 } : { row: 0, col: -1 };
  } else {
    _queuedDirection = dy > 0 ? { row: 1, col: 0 } : { row: -1, col: 0 };
  }
}

/**
 * Vraća i briše queued direction.
 * Poziva se iz pulse.js na puls eventu da bi izvršio kretanje.
 *
 * @returns {Direction|null} Queued smer ili null ako nema input-a
 */
export function readQueuedDirection() {
  const dir = _queuedDirection;
  _queuedDirection = null;
  return dir;
}

/**
 * Vraća queued direction BEZ brisanja (za debugging / UI prikaz).
 *
 * @returns {Direction|null}
 */
export function peekQueuedDirection() {
  return _queuedDirection;
}

/**
 * Briše queued direction (npr. na game over ili menu).
 */
export function clearInput() {
  _queuedDirection = null;
}
