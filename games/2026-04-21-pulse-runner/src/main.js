/**
 * main.js — Entry point za Pulse Runner.
 *
 * Odgovornosti:
 * - Inicijalizacija canvas-a (DPI-aware resize)
 * - Kreiranje / učitavanje game state-a
 * - Inicijalizacija svih modula (input, audio, UI, maze)
 * - Pokretanje requestAnimationFrame game loop-a
 * - Pozivanje updateSystems → render → updateHUD svaki frame
 * - Periodično čuvanje high score-a
 *
 * VAŽNO: Logika igre NE ide ovde — ide u systems/*.js.
 * Ovaj fajl je samo žica koja spaja module.
 */

import { CONFIG } from './config.js';
import { createState, saveHighScore, loadHighScore, calcScore } from './state.js';
import { initInput, clearInput } from './input.js';
import { initAudio, playGameOver, playLevelTransition } from './audio.js';
import { render } from './render.js';
import { initUI, updateHUD, showMainMenu, showGameOver, hideOverlay } from './ui.js';
import { generateMaze } from './systems/maze.js';
import { updatePulse } from './systems/pulse.js';
import { tryMove } from './systems/collision.js';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/**
 * Prilagođava canvas dimenzije DPI ekrana i logičkim pikselima.
 * Poziva se na init i na svaki window resize.
 */
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Pokreće novi run: generiše nivo 1 i prelazi na 'playing' ekran.
 *
 * @param {import('./state.js').GameState} state
 */
export function startRun(state) {
  state.screen = 'playing';
  state.level = 1;
  state.depth = 0;
  state.hp = CONFIG.HP_START;
  state.missCount = 0;
  state.score = 0;
  state.totalCollected = 0;
  state.pulseTimer = 0;
  state.pulseInterval = CONFIG.pulseInterval(1);
  state.playerPulsePhase = 0;
  state.pulseFlash = false;
  state.pulseFlashTimer = 0;
  state.levelFlash = false;
  state.levelFlashTimer = 0;
  state.inInputWindow = false;
  state.gridSize = CONFIG.gridSize(1);
  clearInput();
  generateMaze(state);
  hideOverlay();
}

/**
 * Prelaz na sledeći nivo — generiše novi maze, resetuje miss counter,
 * ažurira depth i score, triggeruje levelFlash.
 *
 * @param {import('./state.js').GameState} state
 */
export function nextLevel(state) {
  state.depth++;
  state.level++;
  state.missCount = 0;
  state.score = calcScore(state.depth, state.totalCollected);
  state.levelFlash = true;
  state.levelFlashTimer = CONFIG.LEVEL_FLASH_DURATION;
  state.pulseInterval = CONFIG.pulseInterval(state.level);
  state.gridSize = CONFIG.gridSize(state.level);
  generateMaze(state);
  playLevelTransition();
}

/**
 * Završava run — čuva high score, prelazi na 'gameover' ekran.
 *
 * @param {import('./state.js').GameState} state
 */
export function endRun(state) {
  state.screen = 'gameover';
  saveHighScore(state.score);
  state.highScore = loadHighScore();
  clearInput();
  playGameOver();
  showGameOver(state, () => {
    startRun(state);
  });
}

// ─── Inicijalizacija ────────────────────────────────────────────────────────

window.addEventListener('resize', resize);
resize();

/** @type {import('./state.js').GameState} */
const state = createState();

initInput(canvas);
initAudio();
initUI(state, startRun);

showMainMenu(state, () => {
  startRun(state);
});

// ─── Game Loop ──────────────────────────────────────────────────────────────

let lastTime = performance.now();

/**
 * Glavni game loop — poziva se svaki frame.
 * Razdvojen update i render (delta time u sekundama).
 *
 * @param {number} now - timestamp iz requestAnimationFrame
 */
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000); // cap na 50ms (20fps min)
  lastTime = now;

  if (state.screen === 'playing') {
    // Pulse sistem: akumulira dt, emituje puls, detektuje miss
    // Input se čita direktno iz input.js unutar pulse.js (readQueuedDirection)
    updatePulse(state, dt, { nextLevel, endRun });

    // Collision: izvršava queuedInput na pulsu, proverava pickup/exit
    // (poziva se iz updatePulse na puls event-u, ne svaki frame)
  }

  render(ctx, state);
  updateHUD(state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
