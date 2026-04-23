// src/main.js — Entry point, game loop (requestAnimationFrame), wire svih modula

import { CONFIG } from './config.js';
import { createState, loadState, saveState } from './state.js';
import { initInput, readInput } from './input.js';
import { updateSystems } from './systems/index.js';
import { render } from './render.js';
import { initUI, updateHUD, showRoomMenu, closeRoomMenu } from './ui.js';
import { initAudio } from './audio.js';

import { generateGrid } from './systems/grid.js';
import { createWorkerState } from './systems/workers.js';
import { createStormState } from './systems/storm.js';
import { createPrestigeState } from './systems/prestige.js';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
window.addEventListener('resize', resize);
resize();

// Učitaj ili napravi svež state
let state = loadState();
if (!state) {
  state = createState();
  state.grid = generateGrid(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
  state.workers = createWorkerState();
  state.storm = createStormState();
  state.prestige = createPrestigeState();
} else {
  // Osiguraj da ne nedostaju polja posle verzija promene
  if (!state.particles) state.particles = [];
  if (!state.screenShake) state.screenShake = { timer: 0, intensity: 0 };
  if (!state.camera) state.camera = { x: 0, y: 0 };
}

initInput(canvas);
initUI(state);
initAudio();

let lastTime = performance.now();
let saveTimer = 0;
let prevShowRoomMenu = null;

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const input = readInput();

  if (!state.paused && !state.gameOver && !state.metaWin) {
    updateSystems(state, input, dt);
  }

  // Otvori/zatvori room meni na osnovu state.showRoomMenu
  if (state.showRoomMenu && !prevShowRoomMenu) {
    showRoomMenu(state.showRoomMenu.col, state.showRoomMenu.row, state);
  } else if (!state.showRoomMenu && prevShowRoomMenu) {
    closeRoomMenu();
  }
  prevShowRoomMenu = state.showRoomMenu;

  render(ctx, state);
  updateHUD(state);

  saveTimer += dt;
  if (saveTimer >= CONFIG.SAVE_INTERVAL_SEC) {
    saveState(state);
    saveTimer = 0;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
