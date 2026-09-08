/**
 * @module input — Unified Pointer Events handler
 * Emits: tap, tap-start, swipe, swipe-left, long-press, drag
 */

/** @type {Map<string, Set<Function>>} */
const listeners = new Map();

/** @type {Map<number, {x: number, y: number, t: number}>} */
const activePointers = new Map();

/**
 * @param {string} event
 * @param {Function} cb
 */
export function on(event, cb) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(cb);
}

/**
 * @param {string} event
 * @param {Function} cb
 */
export function off(event, cb) {
  listeners.get(event)?.delete(cb);
}

/** @param {string} event @param {any} data */
function emit(event, data) {
  listeners.get(event)?.forEach(cb => { try { cb(data); } catch (_) {} });
}

/** @param {HTMLElement} el */
export function attachTo(el) {
  el.addEventListener('pointerdown',   onDown,   { passive: false });
  el.addEventListener('pointerup',     onUp,     { passive: false });
  el.addEventListener('pointermove',   onMove,   { passive: false });
  el.addEventListener('pointercancel', onCancel, { passive: false });
}

/** @param {HTMLElement} el */
export function detachFrom(el) {
  el.removeEventListener('pointerdown',   onDown);
  el.removeEventListener('pointerup',     onUp);
  el.removeEventListener('pointermove',   onMove);
  el.removeEventListener('pointercancel', onCancel);
}

function onDown(e) {
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, t: Date.now() });
  emit('tap-start', { x: e.clientX, y: e.clientY, target: e.target, pointerId: e.pointerId });
}

function onMove(e) {
  const start = activePointers.get(e.pointerId);
  if (!start) return;
  const dx = e.clientX - start.x;
  const dy = e.clientY - start.y;
  if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
    emit('drag', { dx, dy, x: e.clientX, y: e.clientY, pointerId: e.pointerId });
  }
}

function onUp(e) {
  const start = activePointers.get(e.pointerId);
  if (!start) return;
  activePointers.delete(e.pointerId);

  const dx = e.clientX - start.x;
  const dy = e.clientY - start.y;
  const dt = Date.now() - start.t;
  const dist = Math.hypot(dx, dy);

  if (dist < 12 && dt < 500) {
    emit('tap', { x: e.clientX, y: e.clientY, target: e.target });
  } else if (dist >= 12) {
    emit('swipe', { dx, dy, dist, target: e.target });
    if (Math.abs(dx) > Math.abs(dy) && dx < -20) {
      emit('swipe-left', { dx, dy, target: e.target });
    }
  }

  if (dt >= 500 && dist < 12) {
    emit('long-press', { x: e.clientX, y: e.clientY, target: e.target });
  }
}

function onCancel(e) {
  activePointers.delete(e.pointerId);
}

/** Remove all registered listeners */
export function clearAll() {
  listeners.clear();
  activePointers.clear();
}
