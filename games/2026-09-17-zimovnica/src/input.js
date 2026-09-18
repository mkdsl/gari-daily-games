/**
 * input.js — Event bus i touch/click handler-i za action slot selekciju.
 * Delegira na handleAction() iz main.js.
 */

/** @type {Map<string, Function[]>} */
const listeners = new Map();

/**
 * Postavlja sve globalne event listenere.
 * Poziva se jednom iz main.js init.
 */
export function setupInput() {
  document.addEventListener('click', handleClick, { passive: true });
  document.addEventListener('touchend', handleTouch, { passive: false });
  document.addEventListener('keydown', handleKeydown);
}

/**
 * Emituje interni event.
 * @param {string} event
 * @param {any} data
 */
export function emit(event, data) {
  const fns = listeners.get(event) || [];
  fns.forEach(fn => fn(data));
}

/**
 * Registruje listener za interni event.
 * @param {string} event
 * @param {Function} fn
 */
export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(fn);
}

/**
 * @param {MouseEvent} e
 */
function handleClick(e) {}

/**
 * @param {TouchEvent} e
 */
function handleTouch(e) {}

/**
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {}
