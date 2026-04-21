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
import { createState, saveHighScore } from './state.js';
import { initInput, clearInput } from './input.js';
import { initAudio } from './audio.js';
import { render } from './render.js';
import { initUI, updateHUD, showMainMenu } from './ui.js';
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
  // TODO: implementiraj DPI-aware canvas resize
  // canvas.width = window.innerWidth * devicePixelRatio;
  // canvas.height = window.innerHeight * devicePixelRatio;
  // canvas.style.width = window.innerWidth + 'px';
  // canvas.style.height = window.innerHeight + 'px';
  // ctx.scale(devicePixelRatio, devicePixelRatio);
}

/**
 * Pokreće novi run: generiše nivo 1 i prelazi na 'playing' ekran.
 *
 * @param {import('./state.js').GameState} state
 */
export function startRun(state) {
  // TODO: implementiraj
  // state.screen = 'playing';
  // generateMaze(state);
}

/**
 * Prelaz na sledeći nivo — generiše novi maze, resetuje miss counter,
 * ažurira depth i score, triggeruje levelFlash.
 *
 * @param {import('./state.js').GameState} state
 */
export function nextLevel(state) {
  // TODO: implementiraj
  // state.depth++;
  // state.level++;
  // state.missCount = 0;
  // state.score = calcScore(state.depth, state.totalCollected);
  // state.levelFlash = true;
  // state.levelFlashTimer = CONFIG.LEVEL_FLASH_DURATION;
  // state.pulseInterval = CONFIG.pulseInterval(state.level);
  // generateMaze(state);
}

/**
 * Završava run — čuva high score, prelazi na 'gameover' ekran.
 *
 * @param {import('./state.js').GameState} state
 */
export function endRun(state) {
  // TODO: implementiraj
  // state.screen = 'gameover';
  // const isNewPB = saveHighScore(state.score);
  // state.highScore = loadHighScore();
  // playGameOver(); (iz audio.js)
}

// ─── Inicijalizacija ────────────────────────────────────────────────────────

window.addEventListener('resize', resize);
resize();

/** @type {import('./state.js').GameState} */
const state = createState();

initInput(canvas);
initAudio();
initUI(state, startRun);

showMainMenu(state);

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
