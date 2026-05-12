// main.js — Boot, scene management

import { state, resetSimState } from './state.js';
import { initRenderer, renderFrame } from './render.js';
import { initUI, renderMenu, renderLevelSelect, renderGameHUD, bindHUDEvents,
         updateMeters, updateTimerBar, showSimButtons, setSliderDisabled,
         renderWinScreen, bindWinButtons, renderFailScreen, bindFailButtons } from './ui.js';
import { initAudio, setHappiness, setWinState, playFail, playWarning, stopAll } from './audio.js';
import { wireAudioResume } from './input.js';
import { startSimulation, stopSimulation, tickSim, computeCurrentValues } from './systems/sim.js';
import { saveLevelScore, getLevelBest } from './systems/score.js';
import { refreshUnlockedLevels, unlockLevel } from './systems/progression.js';
import { LEVELS } from './levels/level_data.js';
import { SPL_WARN_THRESHOLD } from './config.js';

const canvas = document.getElementById('game-canvas');
const hud = document.getElementById('hud');
const menu_root = document.getElementById('menu');

let last_ts = 0;
let overlay_el = null; // for win/fail overlay

// Resize canvas to fill its CSS size
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width);
  canvas.height = Math.round(rect.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ---- SCENE TRANSITIONS ----

function goScene(scene) {
  state.scene = scene;
  menu_root.innerHTML = '';
  menu_root.classList.remove('hidden');
  hud.innerHTML = '';
  hud.classList.remove('hidden');

  // Remove overlay if any
  if (overlay_el) {
    overlay_el.remove();
    overlay_el = null;
  }

  switch (scene) {
    case 'menu':
      canvas.classList.add('hidden');
      hud.classList.add('hidden');
      renderMenu(menu_root);
      document.getElementById('btn-play').addEventListener('click', () => {
        goScene('level_select');
      });
      break;

    case 'level_select':
      canvas.classList.add('hidden');
      hud.classList.add('hidden');
      refreshUnlockedLevels();
      renderLevelSelect(menu_root);
      document.getElementById('btn-back-menu').addEventListener('click', () => goScene('menu'));
      menu_root.querySelectorAll('.level-card:not(.locked)').forEach(card => {
        card.addEventListener('click', () => {
          const lvl_id = parseInt(card.dataset.level, 10);
          startLevel(lvl_id);
        });
      });
      break;

    case 'game':
      canvas.classList.remove('hidden');
      menu_root.classList.add('hidden');
      break;

    case 'win': {
      canvas.classList.remove('hidden');
      menu_root.classList.add('hidden');
      const level = LEVELS[state.current_level];
      const has_next = state.current_level < LEVELS.length - 1;
      overlay_el = document.createElement('div');
      overlay_el.id = 'result-overlay-el';
      overlay_el.style.cssText = 'position:absolute;inset:0;z-index:10;pointer-events:auto;';
      document.getElementById('game-root').appendChild(overlay_el);
      renderWinScreen(overlay_el, level, state.final_score, state.solve_time_seconds, state.max_kdb_during_sim, has_next);
      bindWinButtons(has_next);
      break;
    }

    case 'fail_inspection':
    case 'fail_crowd': {
      canvas.classList.remove('hidden');
      menu_root.classList.add('hidden');
      overlay_el = document.createElement('div');
      overlay_el.id = 'result-overlay-el';
      overlay_el.style.cssText = 'position:absolute;inset:0;z-index:10;pointer-events:auto;';
      document.getElementById('game-root').appendChild(overlay_el);
      renderFailScreen(overlay_el, scene);
      bindFailButtons();
      break;
    }
  }
}

// ---- GAME LOOP ----

function gameLoop(ts) {
  if (state.scene !== 'game') return;

  const dt = last_ts ? ts - last_ts : 16;
  last_ts = ts;

  resizeCanvas();
  renderFrame(dt);

  if (state.sim_running) {
    const result = tickSim(ts, dt);
    const { kdbs, hs } = computeCurrentValues();
    state.happiness = hs;
    state.neighbour_kdbs = kdbs;

    const level = LEVELS[state.current_level];
    updateMeters(hs, kdbs, level);
    updateTimerBar(state.win_start_time, ts);

    const max_kdb = kdbs.length > 0 ? Math.max(...kdbs) : -Infinity;
    setHappiness(hs);
    playWarning(max_kdb >= SPL_WARN_THRESHOLD && max_kdb < 70);

    if (result) {
      onSimResult(result);
      state.raf_id = requestAnimationFrame(gameLoop);
      return;
    }
  }

  state.raf_id = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
  if (state.raf_id) cancelAnimationFrame(state.raf_id);
  last_ts = 0;
  state.raf_id = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
  if (state.raf_id) {
    cancelAnimationFrame(state.raf_id);
    state.raf_id = null;
  }
}

// ---- LEVEL MANAGEMENT ----

function startLevel(level_id) {
  state.current_level = level_id;
  resetSimState();

  const level = LEVELS[level_id];

  // Reset controls
  if (level.dual_speakers) {
    state.spl_l = 95; state.spl_r = 95;
    state.angle_l = -25; state.angle_r = 25;
  } else {
    state.spl = level.sweet_spot ? (level.sweet_spot.spl || 95) : 95;
    state.bass_ratio = 0.5;
    state.angle = 0;
  }
  state.wind_delta = 0;

  // Compute initial values
  const { kdbs, hs } = computeCurrentValues();
  state.happiness = hs;
  state.neighbour_kdbs = kdbs;

  goScene('game');
  renderGameHUD(level);
  bindHUDEvents(level);
  updateMeters(hs, kdbs, level);
  showSimButtons(false);
  startGameLoop();
}

function onSimResult(result) {
  stopAll();
  playWarning(false);
  const level = LEVELS[state.current_level];

  if (result === 'win') {
    unlockLevel(state.current_level + 1);
    saveLevelScore(state.current_level, state.final_score, state.solve_time_seconds);
    setWinState();
    setTimeout(() => goScene('win'), 400);
  } else {
    playFail(result);
    setTimeout(() => goScene(result), 600);
  }
}

// ---- INIT UI ----

initUI({
  on_slider_change: () => {
    if (state.sim_running) return;
    const level = LEVELS[state.current_level];
    const { kdbs, hs } = computeCurrentValues();
    state.happiness = hs;
    state.neighbour_kdbs = kdbs;
    updateMeters(hs, kdbs, level);
    // Import onSliderInput lazily
    import('./input.js').then(m => m.onSliderInput());
  },
  on_test_click: () => {
    if (state.sim_running) return;
    const level = LEVELS[state.current_level];
    setSliderDisabled(true, level);
    showSimButtons(true);
    startSimulation(performance.now());
    initAudio();
  },
  on_stop_click: () => {
    stopSimulation();
    stopAll();
    playWarning(false);
    const level = LEVELS[state.current_level];
    setSliderDisabled(false, level);
    showSimButtons(false);
    updateTimerBar(null, 0);
  },
  on_retry_click: () => {
    startLevel(state.current_level);
  },
  on_next_click: () => {
    const next = state.current_level + 1;
    if (next < LEVELS.length) startLevel(next);
    else goScene('level_select');
  },
  on_menu_click: () => goScene('menu'),
  on_level_select_click: () => goScene('level_select')
});

// ---- BOOT ----

refreshUnlockedLevels();
wireAudioResume();
initRenderer(canvas);
goScene('menu');
