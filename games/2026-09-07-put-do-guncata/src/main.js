/**
 * @module main — bootstrap, DOMContentLoaded entry point
 */
import { loadState, initState, saveState, state, computeScore, getScoreBucket } from './state.js';
import { init as routerInit, registerScene, goToStage, onGameEnd } from './router.js';
import './input.js';
import { initHUD } from './ui.js';
import { resetBranching } from './systems/branching.js';
import { mount as mountEtapa1, unmount as unmountEtapa1 } from './entities/scenes/etapa1-parking.js';
import { mount as mountEtapa2, unmount as unmountEtapa2 } from './entities/scenes/etapa2-autoput.js';
import { mount as mountEtapa3, unmount as unmountEtapa3 } from './entities/scenes/etapa3-skretanje.js';
import { mount as mountEtapa4, unmount as unmountEtapa4 } from './entities/scenes/etapa4-sumski-put.js';
import { checkPrestige } from './systems/prestige.js';
import { STAGE_COLORS, SCORE_BUCKETS } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  checkPrestige();

  const gameStage = document.getElementById('game-stage');
  if (!gameStage) { console.error('[main] #game-stage not found'); return; }

  routerInit(gameStage);

  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    initHUD(gameContainer, { pripremljenost: state.pripremljenost ?? 0, currentEtapa: 0 });
  }

  // Register all scenes
  registerScene(0, { mount: mountMenu, unmount: (c) => { c.innerHTML = ''; } });
  registerScene(1, { mount: mountEtapa1, unmount: unmountEtapa1 });
  registerScene(2, { mount: mountEtapa2, unmount: unmountEtapa2 });
  registerScene(3, { mount: mountEtapa3, unmount: unmountEtapa3 });
  registerScene(4, { mount: mountEtapa4, unmount: unmountEtapa4 });

  // Etapa5: dynamic import (other agent scope), with inline fallback
  registerScene(5, {
    mount: (container, st, cbs) => {
      import('./entities/scenes/etapa5-dolazak.js')
        .then(mod => { container.innerHTML = ''; mod.mount(container, st, { ...cbs, onPlayAgain: cbs.onEnd || cbs.next || (() => console.warn('[put-do-guncata] onPlayAgain: both onEnd and next are nullish')) }); })
        .catch(() => mountFallbackEnd(container, st, cbs));
      return () => {};
    },
    unmount: (container) => {
      import('./entities/scenes/etapa5-dolazak.js')
        .then(mod => mod.unmount(container))
        .catch(() => { container.innerHTML = ''; });
    }
  });

  onGameEnd(() => {
    const score = computeScore();
    state.scoreBucket = getScoreBucket(score);
    state.completedRuns += 1;
    checkPrestige();
    saveState();
    goToStage(0);
  });

  goToStage(0);
});

// ── Menu ────────────────────────────────────────────────────────────────────

function mountMenu(container, st, callbacks) {
  const c = STAGE_COLORS[1];
  _injectGlobalCSS();

  container.style.cssText = `
    background:${c.bg}; color:${c.text}; font-family:system-ui,sans-serif;
    position:relative; overflow:hidden; height:100%;
  `;

  const wrap = document.createElement('div');
  wrap.style.cssText = `
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    height:100%; gap:1.4rem; padding:2rem; box-sizing:border-box;
  `;

  const title = el('h1', {
    style: `margin:0; font-size:clamp(1.8rem,5vw,3rem); color:${c.accent}; text-align:center;`,
    textContent: 'Put do Guncata'
  });

  const sub = el('p', {
    style: 'margin:0; font-size:1rem; opacity:0.75; text-align:center;',
    textContent: '5 etapa · 1 vožnja · Pripremljenost se meri'
  });

  wrap.appendChild(title);
  wrap.appendChild(sub);

  if (st.completedRuns > 0) {
    const badge = el('div', {
      style: `background:${c.surface}; border-radius:8px; padding:0.6rem 1.2rem; font-size:0.85rem; opacity:0.9;`,
      textContent: `Vožnji završeno: ${st.completedRuns}`
    });
    wrap.appendChild(badge);
  }

  // Night mode toggle — only after prestige unlock
  if (st.prestigeUnlocked) {
    const nightBtn = el('button', {
      style: btn(c.surface, c.text, '0.9rem'),
      textContent: st.isNightMode ? '🌙 Noćna vožnja (ON)' : '☀️ Dnevna vožnja'
    });
    nightBtn.addEventListener('pointerdown', () => {
      state.isNightMode = !state.isNightMode;
      nightBtn.textContent = state.isNightMode ? '🌙 Noćna vožnja (ON)' : '☀️ Dnevna vožnja';
    });
    wrap.appendChild(nightBtn);
  }

  const startBtn = el('button', {
    style: btn(c.accent, '#1c1c28', '1.2rem'),
    textContent: 'Kreni 🚗'
  });
  startBtn.addEventListener('pointerdown', () => {
    const night = state.isNightMode;
    initState();
    resetBranching();
    state.isNightMode = night;
    state.isRunning = true;
    saveState();
    callbacks.next();
  });
  wrap.appendChild(startBtn);

  const brand = el('p', {
    style: 'margin:0; font-size:0.72rem; opacity:0.45; letter-spacing:0.1em;',
    textContent: 'Guncati × Kluboslavija'
  });
  wrap.appendChild(brand);

  container.appendChild(wrap);
  return () => { container.innerHTML = ''; };
}

function mountFallbackEnd(container, st, cbs) {
  const c = STAGE_COLORS[1];
  const score = computeScore();
  const bucket = getScoreBucket(score);
  container.style.cssText = `
    background:${c.bg}; color:${c.text}; display:flex; flex-direction:column;
    align-items:center; justify-content:center; height:100%; gap:1.2rem;
    font-family:system-ui,sans-serif;
  `;
  container.innerHTML = `
    <h2 style="color:${c.accent};margin:0">Stigao si!</h2>
    <div style="font-size:3rem;font-weight:700;color:${SCORE_BUCKETS[bucket].color}">${score}</div>
    <div style="font-size:1.1rem">${SCORE_BUCKETS[bucket].label}</div>
    <button id="fb-replay" style="${btn(c.accent,'#1c1c28','1rem')}">Ponovo</button>
  `;
  container.querySelector('#fb-replay')?.addEventListener('pointerdown', () => cbs.onEnd?.());
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function el(tag, props) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  return e;
}

function btn(bg, color, size) {
  return `background:${bg};color:${color};border:none;border-radius:8px;
    padding:0.75rem 2rem;font-size:${size};cursor:pointer;font-weight:600;
    min-width:140px;touch-action:manipulation;`;
}

function _injectGlobalCSS() {
  if (document.getElementById('pdg-global-css')) return;
  const s = document.createElement('style');
  s.id = 'pdg-global-css';
  s.textContent = `
    #game-stage { width:100%; height:100%; position:relative; }
    * { box-sizing:border-box; }
  `;
  document.head.appendChild(s);
}
