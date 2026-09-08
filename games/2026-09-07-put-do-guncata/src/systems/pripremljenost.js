/**
 * @module pripremljenost — score računanje, delta events
 */
import { applyDelta, computeScore, state } from '../state.js';
import { computeDelta1 } from './timing-puzzle.js';
import { computeDelta2 } from './resource-balance.js';
import { computeDelta3 } from './branching.js';
import { computeDelta4 } from './obstacle-dodge.js';

_injectCSS();

/** @type {HTMLElement|null} */
let _scoreEl = null;
/** @type {HTMLElement|null} */
let _popupContainer = null;

/**
 * @param {HTMLElement} scoreEl
 * @param {HTMLElement} popupEl
 */
export function initDisplay(scoreEl, popupEl) {
  _scoreEl = scoreEl;
  _popupContainer = popupEl;
  _refresh();
}

function _refresh() {
  if (_scoreEl) _scoreEl.textContent = computeScore();
}

/**
 * @param {number} value
 * @param {HTMLElement} [nearEl]
 */
export function showDeltaPopup(value, nearEl) {
  const container = _popupContainer || document.body;
  const el = document.createElement('div');
  el.className = 'delta-popup';
  el.textContent = value >= 0 ? `+${value}` : `${value}`;
  el.style.color = value >= 0 ? '#4caf50' : '#e57373';

  if (nearEl && container !== document.body) {
    const r  = nearEl.getBoundingClientRect();
    const pr = container.getBoundingClientRect();
    el.style.left = (r.left - pr.left + r.width / 2) + 'px';
    el.style.top  = (r.top  - pr.top) + 'px';
  } else {
    el.style.left = '50%';
    el.style.top  = '35%';
  }

  container.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/** @param {number} accuracy 0–100 @returns {number} applied delta */
export function finalizeEtapa1(accuracy) {
  const d = computeDelta1(accuracy);
  applyDelta('d1', d);
  state.etapa1.accuracy = accuracy;
  state.etapa1.completed = true;
  showDeltaPopup(d);
  _refresh();
  return d;
}

/** @param {{fuel:number, eventsCorrect:number, eventsTotal:number, moodChanged:boolean}} data */
export function finalizeEtapa2(data) {
  const d = computeDelta2(data);
  applyDelta('d2', d);
  Object.assign(state.etapa2, data, { completed: true });
  showDeltaPopup(d);
  _refresh();
  return d;
}

/** @param {'brze'|'slikovitije'|'sigurnije'} route */
export function finalizeEtapa3(route) {
  const d = computeDelta3();
  applyDelta('d3', d);
  state.etapa3.route = route;
  state.route = route;
  state.etapa3.completed = true;
  _refresh();
  return d;
}

/** @param {{obstaclesTotal:number, obstaclesAvoided:number, hitRate:number}} data */
export function finalizeEtapa4(data) {
  const d = computeDelta4(data.hitRate);
  applyDelta('d4', d);
  Object.assign(state.etapa4, data, { completed: true });
  showDeltaPopup(d);
  _refresh();
  return d;
}

export function finalizeEtapa5() {
  applyDelta('d5', 0);
  state.etapa5.completed = true;
  _refresh();
  return 0;
}

function _injectCSS() {
  if (document.getElementById('pripremljenost-css')) return;
  const s = document.createElement('style');
  s.id = 'pripremljenost-css';
  s.textContent = `
    .delta-popup {
      position:absolute; font-size:1.5rem; font-weight:700; pointer-events:none;
      z-index:200; animation:dpFloat 0.85s ease-out forwards;
      transform:translateX(-50%);
    }
    @keyframes dpFloat {
      0%   { opacity:1; transform:translateX(-50%) translateY(0); }
      100% { opacity:0; transform:translateX(-50%) translateY(-55px); }
    }
  `;
  document.head.appendChild(s);
}
