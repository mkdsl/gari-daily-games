import { CONFIG } from './config.js';
import { createState, loadState, saveState, loadCheckpointState, resetState } from './state.js';
import { initInput, readInput } from './input.js';
import { render } from './render.js';
import { initUI, updateHUD, showScreen } from './ui.js';
import { initAudio, resumeAudio } from './audio.js';
import { updateSignal, startSignal, handleNodeClick, initLevel } from './signal.js';
import { applyPowerupTick, generatePowerupOffer, pickPowerup, resetPowerups } from './powerups.js';
import { pixelToGrid } from './render.js';

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ---------------------------------------------------------------------------
// Canvas resize
// ---------------------------------------------------------------------------

/**
 * Resize canvas to fill viewport at device pixel ratio.
 * Must be called on load and on every 'resize' event.
 */
function resize() {
  const dpr = devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset before rescale
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** @type {import('./state.js').GameState} */
let state = loadState() ?? createState();

// ---------------------------------------------------------------------------
// UI callbacks
// ---------------------------------------------------------------------------

/** Called when player clicks START on the title screen */
function onStart() {
  resumeAudio();
  resetState();
  state = createState();
  state.screen = 'game';
  initLevel(state);
  showScreen('game');
}

/** Called when player clicks RESTART on death screen */
function onRestart() {
  resumeAudio();
  resetState();
  state = createState();
  resetPowerups(state);
  state.screen = 'game';
  initLevel(state);
  showScreen('game');
}

/** Called when player clicks "Resume from checkpoint" on death screen */
function onCheckpointUse() {
  resumeAudio();
  const ckpt = loadCheckpointState();
  if (!ckpt) { onRestart(); return; }
  state = ckpt;
  state.screen = 'game';
  initLevel(state);
  showScreen('game');
}

/**
 * Called when player picks a power-up from the offer screen.
 * @param {string} id
 */
function onPowerupPick(id) {
  pickPowerup(state, id);
  // pickPowerup transitions screen and inits next level internally
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

initUI(state, {
  onStart,
  onRestart,
  onCheckpointUse,
  onPowerupPick,
});

initAudio();
initInput(canvas);

// Resume or show start screen
if (state.screen === 'game') {
  // Mid-run save was restored — jump straight into gameplay
  initLevel(state);
  showScreen('game');
} else {
  showScreen('start');
}

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

let lastTime  = performance.now();
let saveTimer = 0;

/**
 * Main game loop — called every animation frame.
 * @param {number} now - DOMHighResTimeStamp from requestAnimationFrame
 */
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000); // cap at 50ms (20fps minimum)
  lastTime = now;

  if (!state.paused && !state.gameOver && !state.won && state.screen === 'game') {
    const input = readInput();

    // Handle player click → gate toggle
    if (input.pointer.pressed) {
      const gridCoords = pixelToGrid(input.pointer.x, input.pointer.y, state.grid, null);
      if (gridCoords) {
        const { row, col } = gridCoords;
        handleNodeClick(state, `${row}-${col}`);
      }
    }

    // Tick active power-up timers
    applyPowerupTick(state, dt);

    // Advance signal
    updateSignal(state, input, dt);

    // Update elapsed time (for score calculation)
    state.elapsedSec += dt;

    // Periodic save
    saveTimer += dt;
    if (saveTimer >= CONFIG.SAVE_INTERVAL_SEC) {
      saveState(state);
      saveTimer = 0;
    }
  } else {
    // Drain input buffer even outside gameplay to avoid stale pressed events
    readInput();
  }

  render(ctx, state, dt);
  updateHUD(state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
