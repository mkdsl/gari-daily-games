/**
 * @module radio — aforizam rotacija overlay system
 */
import { AFORIZMI } from '../config.js';

_injectCSS();

/** @type {HTMLElement|null} */
let _el = null;
let _timer = null;
let _idx = 0;

/**
 * Attach radio ticker to a DOM element.
 * @param {HTMLElement} el
 * @param {number} [intervalMs=8000]
 */
export function attachRadio(el, intervalMs = 8000) {
  _el = el;
  _idx = Math.floor(Math.random() * AFORIZMI.length);
  _show();
  _timer = setInterval(() => {
    _idx = (_idx + 1) % AFORIZMI.length;
    _show();
  }, intervalMs);
}

function _show() {
  if (!_el) return;
  _el.textContent = '📻 ' + AFORIZMI[_idx];
  _el.style.animation = 'none';
  void _el.offsetWidth; // reflow
  _el.style.animation = 'radioFade 0.5s ease-in-out';
}

export function detachRadio() {
  clearInterval(_timer);
  _timer = null;
  _el = null;
}

/** @returns {string} */
export function getCurrentAforizam() {
  return AFORIZMI[_idx];
}

/** @param {string} text */
export function showAforizam(text) {
  if (!_el) return;
  _el.textContent = '📻 ' + text;
}

function _injectCSS() {
  if (document.getElementById('radio-css')) return;
  const s = document.createElement('style');
  s.id = 'radio-css';
  s.textContent = `
    @keyframes radioFade { from{opacity:0} to{opacity:1} }
    .radio-ticker {
      font-size:0.78rem; padding:0.3rem 0.75rem;
      background:rgba(0,0,0,0.3); border-radius:4px;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      max-width:100%; opacity:0.85;
    }
  `;
  document.head.appendChild(s);
}
