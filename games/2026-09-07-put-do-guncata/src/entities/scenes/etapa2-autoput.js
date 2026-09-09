/**
 * @module etapa2-autoput — autoput DOM, gorivo/clock/mood UI
 */
import { STAGE_COLORS } from '../../config.js';
import { createResourceBalance } from '../../systems/resource-balance.js';
import { attachRadio, detachRadio } from '../../systems/radio.js';
import { finalizeEtapa2 } from '../../systems/pripremljenost.js';
import { saveState } from '../../state.js';

let _balance = null;
let _cleanup = null;

/**
 * @param {HTMLElement} container
 * @param {Object} state
 * @param {{next: Function}} callbacks
 */
export function mount(container, state, callbacks) {
  _applyCSS();
  const night = state.isNightMode;
  const col = night ? STAGE_COLORS[2].night : STAGE_COLORS[2].day;

  container.style.cssText = `
    background:${col.bg}; color:${col.text}; font-family:system-ui,sans-serif;
    position:relative; overflow:hidden; height:100%;
  `;

  container.innerHTML = `
    <div class="e2-wrap">
      <div class="e2-header">
        <span class="e2-label">Etapa 2 — ${night ? 'Noćni autoput' : 'Autoput'}</span>
        <span id="e2-clock" class="e2-clock">3:00</span>
      </div>

      <div class="e2-road" style="background:${col.road || '#3a3a4a'}">
        <div class="e2-horizon" style="background:${col.horizon || '#f5d87a'}"></div>
        <div class="e2-stripes"></div>
      </div>

      <div class="e2-hud">
        <div class="e2-fuel-wrap">
          <div class="e2-hud-label">⛽ Gorivo</div>
          <div class="e2-fuel-track" id="e2-fuel-track">
            <div id="e2-fuel-bar" class="e2-fuel-bar"></div>
          </div>
        </div>

        <div class="e2-mood-wrap">
          <div class="e2-hud-label">🎵 Muzika</div>
          <div class="e2-mood-btns" id="e2-mood-btns">
            <button class="mood-btn active" data-genre="rock">Rock</button>
            <button class="mood-btn" data-genre="jazz">Jazz</button>
            <button class="mood-btn" data-genre="folk">Folk</button>
          </div>
        </div>

        <div class="e2-score-wrap">
          <div class="e2-hud-label">Pripr.</div>
          <div id="e2-score" class="e2-score">${state.pripremljenost}</div>
        </div>
      </div>

      <div class="radio-ticker" id="e2-radio"></div>
      <div id="e2-event-overlay" class="e2-event-overlay" hidden></div>
    </div>
  `;

  const clockEl   = container.querySelector('#e2-clock');
  const fuelBar   = container.querySelector('#e2-fuel-bar');
  const fuelTrack = container.querySelector('#e2-fuel-track');
  const scoreEl   = container.querySelector('#e2-score');
  const eventOvl  = container.querySelector('#e2-event-overlay');

  attachRadio(container.querySelector('#e2-radio'), 9000);

  _balance = createResourceBalance({
    isNight: night,
    onFuelUpdate: (fuel) => {
      fuelBar.style.height = fuel + '%';
      fuelBar.style.background = fuel > 50 ? '#4caf50' : fuel > 20 ? '#ffc107' : '#e57373';
      fuelTrack.classList.toggle('fuel-critical', fuel <= 20);
    },
    onTimeUpdate: (secs) => {
      const m = Math.floor(secs / 60);
      const s = String(secs % 60).padStart(2, '0');
      clockEl.textContent = `${m}:${s}`;
    },
    onEvent: (ev) => {
      eventOvl.hidden = false;
      eventOvl.innerHTML = `
        <div class="e2-event-card">
          <div class="e2-ev-label">${ev.label}</div>
          <div class="e2-ev-hint">${ev.hint}</div>
          <button class="e2-ev-btn" id="e2-ev-tap">Reaguj!</button>
        </div>
      `;
      container.querySelector('#e2-ev-tap')?.addEventListener('pointerdown', () => {
        _balance?.respondToEvent();
        eventOvl.hidden = true;
      });
      setTimeout(() => { eventOvl.hidden = true; }, 2200);
    },
    onEventResult: (correct, delta) => {
      scoreEl.style.color = delta >= 0 ? '#4caf50' : '#f44336';
      setTimeout(() => { scoreEl.style.color = ''; }, 800);
      _floatDelta(container, delta);
    },
    onComplete: (data) => {
      const d = finalizeEtapa2(data);
      scoreEl.textContent = state.pripremljenost;
      _showResult(container, data, d, () => {
        saveState();
        callbacks.next();
      });
    }
  });

  container.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('pointerdown', () => {
      container.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _balance?.changeMood(btn.dataset.genre);
    });
  });

  _balance.start();

  _cleanup = () => { _balance?.stop(); detachRadio(); _balance = null; };
  return _cleanup;
}

export function unmount(container) {
  if (_cleanup) { _cleanup(); _cleanup = null; }
  container.innerHTML = '';
}

function _floatDelta(container, delta) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute; left:50%; top:35%; transform:translateX(-50%);
    font-size:1.5rem; font-weight:700; pointer-events:none; z-index:80;
    color:${delta >= 0 ? '#4caf50' : '#e57373'};
    animation:e2float 0.85s ease-out forwards;
  `;
  el.textContent = delta >= 0 ? `+${delta}` : `${delta}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function _showResult(container, data, delta, onNext) {
  const overlay = document.createElement('div');
  overlay.className = 'e2-result';
  overlay.innerHTML = `
    <div style="font-size:1.4rem;font-weight:700">Autoput — Kraj</div>
    <div style="opacity:0.8;font-size:0.9rem">Gorivo: ${Math.round(data.fuel)}%</div>
    <div style="opacity:0.8;font-size:0.9rem">Događaji: ${data.eventsCorrect}/${data.eventsTotal}</div>
    <div style="font-size:1.1rem;color:${delta >= 0 ? '#4caf50' : '#e57373'}">
      Δ pripremljenost: ${delta >= 0 ? '+' : ''}${delta}
    </div>
    <button class="e2-next-btn">Nastavi →</button>
  `;
  container.appendChild(overlay);
  overlay.querySelector('.e2-next-btn').addEventListener('pointerdown', onNext);
}

function _applyCSS() {
  if (document.getElementById('etapa2-css')) return;
  const s = document.createElement('style');
  s.id = 'etapa2-css';
  s.textContent = `
    .e2-wrap { display:flex; flex-direction:column; height:100%; padding:1rem; gap:0.7rem; }
    .e2-header { display:flex; justify-content:space-between; align-items:center; }
    .e2-label  { font-size:0.78rem; opacity:0.6; }
    .e2-clock  { font-size:1.4rem; font-weight:700; color:#f5d87a; }
    .e2-road {
      flex:1; border-radius:8px; position:relative; overflow:hidden; min-height:80px;
    }
    .e2-horizon { position:absolute; top:0; left:0; right:0; height:28%; opacity:0.35; }
    .e2-stripes {
      position:absolute; inset:0;
      background:repeating-linear-gradient(
        to bottom, transparent 0 40px, rgba(255,255,255,0.07) 40px 80px
      );
      animation:roadScroll 1.2s linear infinite;
    }
    .e2-hud { display:flex; gap:0.8rem; align-items:flex-end; }
    .e2-hud-label { font-size:0.72rem; opacity:0.65; margin-bottom:0.25rem; }
    .e2-fuel-wrap { display:flex; flex-direction:column; }
    .e2-fuel-track {
      width:22px; height:72px; background:rgba(0,0,0,0.35); border-radius:4px;
      overflow:hidden; display:flex; align-items:flex-end;
    }
    .e2-fuel-bar { width:100%; height:100%; border-radius:4px; transition:height 0.6s, background 0.5s; background:#4caf50; }
    .e2-fuel-track.fuel-critical { animation:fuelPulse 0.6s infinite alternate; }
    .e2-mood-wrap { flex:1; display:flex; flex-direction:column; }
    .e2-mood-btns { display:flex; gap:0.35rem; }
    .mood-btn {
      flex:1; padding:0.3rem; border:1px solid rgba(255,255,255,0.15);
      border-radius:6px; font-size:0.72rem; cursor:pointer; transition:background 0.2s;
      background:rgba(255,255,255,0.07); color:inherit;
    }
    .mood-btn.active { background:#f5d87a; color:#1c1c28; border-color:#f5d87a; }
    .e2-score-wrap { text-align:center; }
    .e2-score { font-size:1.4rem; font-weight:700; }
    .e2-event-overlay {
      position:absolute; inset:0; background:rgba(0,0,0,0.72);
      display:flex; align-items:center; justify-content:center; z-index:40;
    }
    .e2-event-card {
      background:#2a2a3a; border-radius:12px; padding:1.5rem 2rem;
      text-align:center; display:flex; flex-direction:column; gap:0.7rem;
    }
    .e2-ev-label { font-size:1.4rem; font-weight:700; }
    .e2-ev-hint  { font-size:0.88rem; opacity:0.8; }
    .e2-ev-btn {
      padding:0.55rem 1.4rem; background:#f5d87a; color:#1c1c28;
      border:none; border-radius:8px; font-size:0.95rem; font-weight:700; cursor:pointer;
    }
    .e2-result {
      position:absolute; inset:0; background:rgba(10,13,24,0.94);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:0.85rem; z-index:60; animation:fadeIn 0.3s; color:#e8dcc8;
      font-family:system-ui,sans-serif;
    }
    .e2-next-btn {
      margin-top:0.4rem; padding:0.7rem 2rem; background:#f5d87a; color:#1c1c28;
      border:none; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer;
    }
    @keyframes roadScroll { to { background-position:0 80px; } }
    @keyframes fuelPulse  { from{opacity:1} to{opacity:0.35} }
    @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
    @keyframes e2float {
      0%   { opacity:1; transform:translateX(-50%) translateY(0); }
      100% { opacity:0; transform:translateX(-50%) translateY(-52px); }
    }
  `;
  document.head.appendChild(s);
}
