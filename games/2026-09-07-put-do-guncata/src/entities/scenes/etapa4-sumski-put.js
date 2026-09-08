/**
 * @module etapa4-sumski-put — šumski put DOM, prepreke
 */
import { STAGE_COLORS } from '../../config.js';
import { on, off } from '../../input.js';
import { createObstacleDodge } from '../../systems/obstacle-dodge.js';
import { finalizeEtapa4 } from '../../systems/pripremljenost.js';
import { saveState } from '../../state.js';

let _dodge = null;
let _cleanup = null;

/**
 * @param {HTMLElement} container
 * @param {Object} state
 * @param {{next: Function}} callbacks
 */
export function mount(container, state, callbacks) {
  _applyCSS();
  const c = STAGE_COLORS[4];
  const route = state.route || 'sigurnije';

  container.style.cssText = `
    background:${c.bg}; color:${c.text}; font-family:system-ui,sans-serif;
    position:relative; overflow:hidden; height:100%;
  `;

  container.innerHTML = `
    <div class="e4-wrap">
      <div class="e4-header">
        <span class="e4-label">Etapa 4 — Šumski put</span>
        <span class="e4-route-badge">${_routeLabel(route)}</span>
      </div>

      <div class="e4-scene" id="e4-scene">
        <div class="e4-trees e4-trees-back"></div>
        <div class="e4-road-strip"></div>
        <div class="e4-track" id="e4-track"></div>
        <div class="e4-player" id="e4-player">🚗</div>
      </div>

      <div class="e4-progress-row">
        <span class="e4-prog-label">Napredak</span>
        <div class="e4-prog-track"><div class="e4-prog-bar" id="e4-prog-bar"></div></div>
        <span class="e4-prog-text" id="e4-prog-text">0/0</span>
      </div>

      <div class="e4-bottom">
        <div class="e4-hint" id="e4-hint"></div>
        <div class="e4-score-col">
          <span style="font-size:0.72rem;opacity:0.65">Pripremljenost</span>
          <span class="e4-score" id="e4-score">${state.pripremljenost}</span>
        </div>
      </div>
    </div>
  `;

  const sceneEl    = container.querySelector('#e4-scene');
  const trackEl    = container.querySelector('#e4-track');
  const progBar    = container.querySelector('#e4-prog-bar');
  const progText   = container.querySelector('#e4-prog-text');
  const hintEl     = container.querySelector('#e4-hint');
  const scoreEl    = container.querySelector('#e4-score');
  const playerEl   = container.querySelector('#e4-player');

  let _curObstacleEl = null;

  _dodge = createObstacleDodge({
    route,
    isNight: state.isNightMode,
    onObstacle: (obs) => {
      if (obs.isDistractor) {
        _spawnEl(trackEl, obs.label, true);
        hintEl.textContent = '(pejzaž)';
        return;
      }
      hintEl.textContent = obs.hint;
      _curObstacleEl = _spawnEl(trackEl, obs.label, false);
    },
    onObstacleResult: (avoided) => {
      _curObstacleEl?.remove();
      _curObstacleEl = null;
      if (avoided) {
        _whoosh();
        hintEl.textContent = '✓';
        playerEl.style.filter = 'drop-shadow(0 0 8px #4caf50)';
        setTimeout(() => { playerEl.style.filter = ''; }, 350);
      } else {
        sceneEl.classList.add('screen-shake');
        setTimeout(() => sceneEl.classList.remove('screen-shake'), 320);
        hintEl.textContent = '💥';
      }
      scoreEl.textContent = state.pripremljenost;
      setTimeout(() => { hintEl.textContent = ''; }, 700);
    },
    onProgress: (done, total) => {
      progBar.style.width = Math.round(done / total * 100) + '%';
      progText.textContent = `${done}/${total}`;
    },
    onComplete: (data) => {
      const d = finalizeEtapa4(data);
      scoreEl.textContent = state.pripremljenost;
      _showResult(container, data, d, c, () => { saveState(); callbacks.next(); });
    }
  });

  const tapHandler = ({ x, y }) => {
    const rect = container.getBoundingClientRect();
    const relY = y - rect.top;
    _dodge?.respond(relY > rect.height * 0.58 ? 'tap-down' : 'tap');
  };
  const swipeHandler = () => { _dodge?.respond('swipe-left'); };

  on('tap', tapHandler);
  on('swipe-left', swipeHandler);

  _dodge.start();

  _cleanup = () => {
    off('tap', tapHandler);
    off('swipe-left', swipeHandler);
    _dodge?.stop();
    _dodge = null;
  };
  return _cleanup;
}

export function unmount(container) {
  if (_cleanup) { _cleanup(); _cleanup = null; }
  container.innerHTML = '';
}

function _routeLabel(r) {
  return { brze:'⚡ Brža', slikovitije:'🌿 Slikovita', sigurnije:'🛡️ Sigurnija' }[r] || r;
}

function _spawnEl(track, label, isDistractor) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute; right:-90px; top:${isDistractor ? '15%' : '50%'};
    transform:translateY(-50%); font-size:${isDistractor ? '1rem' : '1.5rem'};
    opacity:${isDistractor ? '0.55' : '1'};
    animation:obsMove ${isDistractor ? '4s' : '3s'} linear forwards;
    pointer-events:none; white-space:nowrap;
  `;
  el.textContent = label;
  track.appendChild(el);
  if (isDistractor) setTimeout(() => el.remove(), 4100);
  return el;
}

function _whoosh() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

function _showResult(container, data, delta, c, onNext) {
  const pct = data.obstaclesTotal > 0
    ? Math.round(data.obstaclesAvoided / data.obstaclesTotal * 100) : 0;
  const overlay = document.createElement('div');
  overlay.className = 'e4-result';
  overlay.innerHTML = `
    <div style="font-size:1.4rem;font-weight:700">Šumski put — Kraj</div>
    <div style="opacity:0.8;font-size:0.9rem">
      Izbegnuto: ${data.obstaclesAvoided}/${data.obstaclesTotal} (${pct}%)
    </div>
    <div style="font-size:1.1rem;color:${delta >= 0 ? '#4caf50' : '#e57373'}">
      Δ pripremljenost: ${delta >= 0 ? '+' : ''}${delta}
    </div>
    <button class="e4-next-btn" style="background:${c.accent}">Nastavi →</button>
  `;
  container.appendChild(overlay);
  overlay.querySelector('.e4-next-btn').addEventListener('pointerdown', onNext);
}

function _applyCSS() {
  if (document.getElementById('etapa4-css')) return;
  const s = document.createElement('style');
  s.id = 'etapa4-css';
  s.textContent = `
    .e4-wrap { display:flex; flex-direction:column; height:100%; padding:1rem; gap:0.7rem; }
    .e4-header { display:flex; justify-content:space-between; align-items:center; }
    .e4-label  { font-size:0.78rem; opacity:0.6; }
    .e4-route-badge {
      font-size:0.72rem; background:rgba(61,84,38,0.55);
      padding:0.2rem 0.5rem; border-radius:4px;
    }
    .e4-scene {
      flex:1; border-radius:10px; background:#1a2812;
      position:relative; overflow:hidden; min-height:90px;
    }
    .e4-trees-back {
      position:absolute; inset:0;
      background:repeating-linear-gradient(
        to right, #1a2812 0 18px, #263a18 18px 34px
      );
      opacity:0.6;
    }
    .e4-road-strip {
      position:absolute; top:38%; left:0; right:0; height:24%;
      background:#263a18;
    }
    .e4-track { position:absolute; inset:0; }
    .e4-player {
      position:absolute; left:14%; top:50%; transform:translateY(-50%);
      font-size:2rem; z-index:10; transition:filter 0.2s;
    }
    .e4-progress-row {
      display:flex; align-items:center; gap:0.5rem;
    }
    .e4-prog-label { font-size:0.72rem; opacity:0.65; white-space:nowrap; }
    .e4-prog-track {
      flex:1; height:7px; background:#263a18; border-radius:4px; overflow:hidden;
    }
    .e4-prog-bar { height:100%; background:#3d5426; border-radius:4px; transition:width 0.4s; }
    .e4-prog-text { font-size:0.72rem; opacity:0.65; white-space:nowrap; }
    .e4-bottom { display:flex; justify-content:space-between; align-items:center; }
    .e4-hint   { font-size:1rem; font-weight:700; min-height:1.4rem; }
    .e4-score-col { display:flex; flex-direction:column; align-items:center; }
    .e4-score  { font-size:1.4rem; font-weight:700; color:#c8d8b0; }
    .screen-shake { animation:shake 0.32s ease; }
    .e4-result {
      position:absolute; inset:0; background:rgba(26,40,18,0.94);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:0.85rem; z-index:60; animation:fadeIn 0.3s; color:#c8d8b0;
      font-family:system-ui,sans-serif;
    }
    .e4-next-btn {
      margin-top:0.4rem; padding:0.7rem 2rem; color:#1a2812;
      border:none; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer;
    }
    @keyframes obsMove {
      from { right:-90px; }
      to   { right:110%; }
    }
    @keyframes shake {
      0%  { transform:translate(0,0); }
      20% { transform:translate(-5px,2px); }
      40% { transform:translate(5px,-2px); }
      60% { transform:translate(-3px,1px); }
      80% { transform:translate(3px,-1px); }
      100%{ transform:translate(0,0); }
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  `;
  document.head.appendChild(s);
}
