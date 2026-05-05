/**
 * main.js — Entry point za Bespuće
 * Wire-uje sve module, vodi game-state mašinu:
 * MENU → RUNNING → CHECKPOINT_SELECT → DEAD → META_UPGRADE → MENU
 */
import { CONFIG } from './config.js';
import { createState, resetRun, loadMeta, saveMeta } from './state.js';
import { initInput, readInput } from './input.js';
import { updateSystems } from './systems/index.js';
import { render } from './render.js';
import { initUI, updateUI } from './ui.js';
import { createPlayer } from './entities/player.js';
import { initChunks } from './systems/chunks.js';

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

const meta = loadMeta();
const state = createState(meta);
initInput(canvas);
initUI(state);

/** Inicijalizuj igrača i postavi run parametre na osnovu meta upgrade-ova */
function initPlayer(state) {
  state.run.player = createPlayer(CONFIG.PLAYER_X, window.innerHeight / 2);
  state.run.scrollSpeed = CONFIG.SCROLL_SPEED_BASE;
  // primeni meta speed upgrade (+12% po nivou)
  state.run.scrollSpeed *= (1 + state.meta.upgrades.speed * 0.12);
  // primeni meta shield upgrade
  state.run.shieldsLeft = state.meta.upgrades.shield;
  state.run.nextCheckpoint = CONFIG.CHECKPOINT_INTERVAL;
}

/** Pokreni novi run iz bilo kog stanja */
function startGame() {
  resetRun(state);
  initPlayer(state);
  initChunks(state);
  state.screen = 'RUNNING';
}

let lastTime = performance.now();
let saveTimer = 0;
let deadTimer = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const input = readInput();

  // State tranzicije
  if (state.screen === 'MENU') {
    if (input.actionPressed) {
      startGame();
    }
  }

  if (state.screen === 'DEAD') {
    deadTimer += dt;
    if (deadTimer >= 1.5) {
      deadTimer = 0;
      state.screen = 'META_UPGRADE';
    }
  }

  // updateSystems ima guard na screen !== 'RUNNING' — bezbjedno zvati uvijek
  updateSystems(state, input, dt);
  render(ctx, state);
  updateUI(state);

  saveTimer += dt;
  if (saveTimer >= CONFIG.SAVE_INTERVAL_SEC) {
    saveMeta(state.meta);
    saveTimer = 0;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
