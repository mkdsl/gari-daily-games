import { CONFIG } from './config.js';
import { createState, loadState, saveState } from './state.js';
import { initInput, readInput } from './input.js';
import { render } from './render.js';
import { initUI, updateHUD, showScreen } from './ui.js';
import { initAudio } from './audio.js';
import { updateSignal } from './signal.js';
import { applyPowerupTick } from './powerups.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

/**
 * Resize canvas to fill viewport at device pixel ratio.
 */
function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
window.addEventListener('resize', resize);
resize();

const state = loadState() ?? createState();
initInput(canvas);
initUI(state);
initAudio();

// Show the start screen on first load; if mid-run state was restored, jump to gameplay.
if (state.screen === 'start' || !state.screen) {
  showScreen('start');
} else {
  showScreen('game');
}

let lastTime = performance.now();
let saveTimer = 0;

/**
 * Main game loop — called every animation frame.
 * @param {number} now - DOMHighResTimeStamp from requestAnimationFrame
 */
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (!state.paused && !state.gameOver && state.screen === 'game') {
    const input = readInput();

    // Update active power-up timers
    applyPowerupTick(state, dt);

    // Advance signal movement and handle node interactions
    updateSignal(state, input, dt);

    // Persist state periodically
    saveTimer += dt;
    if (saveTimer >= CONFIG.SAVE_INTERVAL_SEC) {
      saveState(state);
      saveTimer = 0;
    }
  } else {
    // Still drain the input buffer even when not in active gameplay
    readInput();
  }

  render(ctx, state);
  updateHUD(state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
