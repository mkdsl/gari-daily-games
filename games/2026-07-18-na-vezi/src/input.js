/** Keyboard/mouse/touch handlers, pointer abstraction */
import { resumeAudio } from './audio.js';

/** @type {Map<string, Set<Function>>} */
const _keyHandlers = new Map();

/** @type {Set<Function>} */
const _tapHandlers = new Set();

/** @type {boolean} */
let _initialized = false;

/**
 * Inicijalizuje input sistem
 */
export function initInput() {
  if (_initialized) return;
  _initialized = true;

  // Keyboard
  document.addEventListener('keydown', _onKeyDown);

  // Touch (za mobilne)
  document.addEventListener('touchstart', _onTouchStart, { passive: true });

  // Click normalizacija
  document.addEventListener('click', _onClick);
}

function _onKeyDown(e) {
  resumeAudio();
  const handlers = _keyHandlers.get(e.code);
  if (handlers) {
    for (const fn of handlers) fn(e);
  }
  // Wildcard
  const all = _keyHandlers.get('*');
  if (all) {
    for (const fn of all) fn(e);
  }
}

function _onTouchStart(e) {
  resumeAudio();
  for (const fn of _tapHandlers) fn(e);
}

function _onClick(e) {
  resumeAudio();
}

/**
 * Registruje key handler
 * @param {string} keyCode - npr. 'Space', 'Escape', '*' za sve
 * @param {Function} handler
 * @returns {Function} unsubscribe
 */
export function onKey(keyCode, handler) {
  if (!_keyHandlers.has(keyCode)) {
    _keyHandlers.set(keyCode, new Set());
  }
  _keyHandlers.get(keyCode).add(handler);
  return () => offKey(keyCode, handler);
}

/**
 * Uklanja key handler
 */
export function offKey(keyCode, handler) {
  const set = _keyHandlers.get(keyCode);
  if (set) set.delete(handler);
}

/**
 * Registruje touch handler
 */
export function onTap(handler) {
  _tapHandlers.add(handler);
  return () => _tapHandlers.delete(handler);
}

/**
 * Čisti sve handlere (između sesija)
 */
export function clearInputHandlers() {
  _keyHandlers.clear();
  _tapHandlers.clear();
}

/**
 * Helper: pointer event (mouse i touch) na elementu
 * @param {HTMLElement} el
 * @param {Function} handler
 * @returns {Function} cleanup
 */
export function onPointer(el, handler) {
  const onClick = (e) => { e.preventDefault(); handler(e); };
  el.addEventListener('click', onClick);
  el.addEventListener('touchend', onClick, { passive: false });
  return () => {
    el.removeEventListener('click', onClick);
    el.removeEventListener('touchend', onClick);
  };
}

/**
 * Slider drag handler (za platform allocation)
 * @param {HTMLInputElement} slider
 * @param {Function} handler - prima {value: number}
 * @returns {Function} cleanup
 */
export function onSlider(slider, handler) {
  const onChange = () => handler({ value: parseFloat(slider.value) });
  slider.addEventListener('input', onChange);
  return () => slider.removeEventListener('input', onChange);
}
