/**
 * main.js — Entry point za Bespuće
 * Wire-uje sve module, vodi game-state mašinu:
 * MENU → RUNNING → CHECKPOINT_SELECT → DEAD → META_UPGRADE → MENU
 */
import { CONFIG } from './config.js';
import { createState, loadMeta, saveMeta } from './state.js';
import { initInput, readInput } from './input.js';
import { updateSystems } from './systems/index.js';
import { render } from './render.js';
import { initUI, updateUI } from './ui.js';

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

let lastTime = performance.now();
let saveTimer = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const input = readInput();
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
