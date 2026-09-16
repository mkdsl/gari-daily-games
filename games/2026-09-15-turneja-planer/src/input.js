/** @module input — click, touch handlers and event bus */

/** @type {Map<string, Function[]>} */
const listeners = new Map();

/**
 * Emit a game event
 * @param {string} event
 * @param {*} data
 */
export function emit(event, data) {
  const fns = listeners.get(event) || [];
  fns.forEach(fn => fn(data));
}

/**
 * Subscribe to a game event
 * @param {string} event
 * @param {Function} fn
 * @returns {Function} unsubscribe
 */
export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(fn);
  return () => off(event, fn);
}

/**
 * Remove listener
 * @param {string} event
 * @param {Function} fn
 */
export function off(event, fn) {
  const fns = listeners.get(event);
  if (fns) {
    const idx = fns.indexOf(fn);
    if (idx !== -1) fns.splice(idx, 1);
  }
}

/**
 * Attach click + touch to an element, emitting an event
 * @param {HTMLElement} el
 * @param {string} event
 * @param {*} data
 */
export function bindAction(el, event, data) {
  const handler = (e) => {
    e.preventDefault();
    emit(event, data);
  };
  el.addEventListener('click', handler);
  el.addEventListener('touchend', handler, { passive: false });
}

/**
 * Attach slider input event
 * @param {HTMLInputElement} slider
 * @param {Function} onChange - (value: number) => void
 */
export function bindSlider(slider, onChange) {
  slider.addEventListener('input', () => onChange(Number(slider.value)));
}

/**
 * Initialize keyboard shortcuts
 * @param {Function} onEsc - ESC key handler
 */
export function initKeyboard(onEsc) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') onEsc();
    // Number keys for quick card option
    if (e.key === '1') emit('card_option', 'A');
    if (e.key === '2') emit('card_option', 'B');
    if (e.key === '3') emit('card_option', 'C');
  });
}

/**
 * Prevent default touch scroll on game UI
 * @param {HTMLElement} el
 */
export function lockScroll(el) {
  el.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
}
