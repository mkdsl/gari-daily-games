/**
 * @module etapa1-parking — parking scena DOM + radial meter
 */
import { STAGE_COLORS } from '../../config.js';
import { on, off } from '../../input.js';
import { createTimingPuzzle } from '../../systems/timing-puzzle.js';
import { attachRadio, detachRadio } from '../../systems/radio.js';
import { finalizeEtapa1 } from '../../systems/pripremljenost.js';
import { saveState } from '../../state.js';

let _puzzle = null;
let _cleanup = null;

/**
 * @param {HTMLElement} container
 * @param {Object} state
 * @param {{next: Function}} callbacks
 * @returns {Function} cleanup
 */
export function mount(container, state, callbacks) {
  _applyCSS();
  const c = STAGE_COLORS[1];

  container.style.cssText = `
    background:${c.bg}; color:${c.text}; font-family:system-ui,sans-serif;
    position:relative; overflow:hidden; height:100%;
  `;

  container.innerHTML = `
    <div class="e1-wrap">
      <div class="e1-header">
        <span class="e1-label">Etapa 1 — Parkiranje</span>
        <span id="e1-timer" class="e1-timer">60s</span>
      </div>
      <p class="e1-hint">Tapni unutar žute zone!</p>
      <div class="e1-meter-wrap">
        <svg id="e1-svg" class="e1-svg"></svg>
      </div>
      <div class="e1-bottom">
        <div class="radio-ticker" id="e1-radio"></div>
        <div class="e1-score-row">Pripremljenost: <strong id="e1-score">${state.pripremljenost}</strong></div>
      </div>
    </div>
  `;

  const svgEl    = container.querySelector('#e1-svg');
  const timerEl  = container.querySelector('#e1-timer');
  const scoreEl  = container.querySelector('#e1-score');
  const radioEl  = container.querySelector('#e1-radio');

  attachRadio(radioEl, 8000);

  _puzzle = createTimingPuzzle(
    svgEl,
    (accuracy) => {
      finalizeEtapa1(accuracy);
      scoreEl.textContent = state.pripremljenost;
      _showResult(container, accuracy, state.deltas.d1, () => {
        saveState();
        callbacks.next();
      });
    },
    (accuracy) => {
      svgEl.classList.toggle('tap-good', accuracy >= 50);
      svgEl.classList.toggle('tap-miss', accuracy < 50);
      setTimeout(() => svgEl.classList.remove('tap-good', 'tap-miss'), 400);
    }
  );
  _puzzle.setTimerEl(timerEl);
  _puzzle.start();

  const tapHandler = ({ x, y, target }) => {
    if (svgEl === target || svgEl.contains(target)) _puzzle?.handleTap(x, y);
  };
  on('tap', tapHandler);

  _cleanup = () => {
    off('tap', tapHandler);
    _puzzle?.stop();
    detachRadio();
    _puzzle = null;
  };
  return _cleanup;
}

export function unmount(container) {
  if (_cleanup) { _cleanup(); _cleanup = null; }
  container.innerHTML = '';
}

function _showResult(container, accuracy, delta, onNext) {
  const grade = accuracy >= 80 ? '🟢 Savršeno!' : accuracy >= 50 ? '🟡 Dobro' : '🔴 Promašaj';
  const overlay = document.createElement('div');
  overlay.className = 'e1-result';
  overlay.innerHTML = `
    <div style="font-size:2.2rem">${grade}</div>
    <div style="font-size:0.9rem;opacity:0.8">Tačnost: ${Math.round(accuracy)}%</div>
    <div style="font-size:1.1rem;color:${delta >= 0 ? '#4caf50' : '#e57373'}">
      Δ pripremljenost: ${delta >= 0 ? '+' : ''}${delta}
    </div>
    <button class="e1-next-btn">Nastavi →</button>
  `;
  container.appendChild(overlay);
  overlay.querySelector('.e1-next-btn').addEventListener('pointerdown', onNext);
}

function _applyCSS() {
  if (document.getElementById('etapa1-css')) return;
  const s = document.createElement('style');
  s.id = 'etapa1-css';
  s.textContent = `
    .e1-wrap {
      display:flex; flex-direction:column; align-items:center;
      height:100%; padding:1rem; gap:0.7rem;
    }
    .e1-header { display:flex; width:100%; justify-content:space-between; align-items:center; }
    .e1-label  { font-size:0.78rem; opacity:0.6; letter-spacing:0.04em; }
    .e1-timer  { font-size:1.4rem; font-weight:700; color:#f5d87a; }
    .e1-hint   { margin:0; font-size:0.88rem; opacity:0.72; }
    .e1-meter-wrap { flex:1; display:flex; align-items:center; justify-content:center; }
    .e1-svg {
      width:min(260px,70vmin); height:min(260px,70vmin); cursor:pointer;
      transition:filter 0.2s;
    }
    .e1-svg.tap-good { filter:drop-shadow(0 0 14px #4caf50); }
    .e1-svg.tap-miss { filter:drop-shadow(0 0 14px #e57373); }
    .e1-bottom { width:100%; display:flex; flex-direction:column; gap:0.35rem; }
    .e1-score-row { font-size:0.88rem; opacity:0.8; }
    .e1-result {
      position:absolute; inset:0; background:rgba(28,28,40,0.93);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:0.9rem; z-index:60; animation:fadeIn 0.3s ease;
      color:#e8dcc8; font-family:system-ui,sans-serif;
    }
    .e1-next-btn {
      margin-top:0.4rem; padding:0.7rem 2rem; background:#f5d87a; color:#1c1c28;
      border:none; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  `;
  document.head.appendChild(s);
}
