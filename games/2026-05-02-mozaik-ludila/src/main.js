/**
 * main.js — Bootstrap i requestAnimationFrame game loop za Mozaik Ludila.
 * Wires sve module zajedno. Canvas setup sa devicePixelRatio.
 */

import { GRID_COLS, GRID_ROWS, CELL_SIZE, CELL_SIZE_MOBILE, GRID_OFFSET_Y,
         FRAGMENT_ZONE_PADDING } from './config.js';
import { createInitialState, loadState, saveState, resetState } from './state.js';
import { render } from './render.js';
import { initInput } from './input.js';
import { initUI } from './ui.js';
import { initFragmentQueue, enqueueNewFragment } from './entities/fragments.js';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/**
 * Dinamički grid layout — rekalkuliše se pri svakom resize.
 * Sve ostale module čitaju ove vrednosti iz getLayout().
 * @type {{ cellSize: number, gridOffsetX: number, gridOffsetY: number, fragmentZoneY: number, logicalW: number, logicalH: number }}
 */
let _layout = computeLayout();

/**
 * Izračunava layout vrednosti na osnovu trenutne veličine prozora.
 * @returns {Object}
 */
function computeLayout() {
  const logicalW = window.innerWidth;
  const logicalH = window.innerHeight;
  const isMobile = logicalW < 480;
  const cellSize = isMobile ? CELL_SIZE_MOBILE : CELL_SIZE;
  const gridW = GRID_COLS * cellSize;
  const gridOffsetX = Math.floor((logicalW - gridW) / 2);
  const gridOffsetY = GRID_OFFSET_Y;
  const fragmentZoneY = gridOffsetY + GRID_ROWS * cellSize + FRAGMENT_ZONE_PADDING;
  return { cellSize, gridOffsetX, gridOffsetY, fragmentZoneY, logicalW, logicalH };
}

/**
 * Vraća trenutni layout objekat (za render, input, itd.).
 * @returns {typeof _layout}
 */
export function getLayout() {
  return _layout;
}

/**
 * Vraća canvas element.
 * @returns {HTMLCanvasElement}
 */
export function getCanvas() {
  return canvas;
}

/**
 * Vraća 2D rendering context.
 * @returns {CanvasRenderingContext2D}
 */
export function getCtx() {
  return ctx;
}

/**
 * Resizuje canvas na puni ekran sa devicePixelRatio za crisp rendering.
 */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  _layout = computeLayout();
  canvas.width = _layout.logicalW * dpr;
  canvas.height = _layout.logicalH * dpr;
  canvas.style.width = _layout.logicalW + 'px';
  canvas.style.height = _layout.logicalH + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset pre scale
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Reset handler ---
/**
 * Resetuje igru na novi run.
 * Poziva se iz input.js kada igrač klikne "Ponovo" / "Novi mozaik".
 */
function resetGame() {
  state = resetState();
  state.fragmentQueue = initFragmentQueue(3, 0);
  state.activeFragment = state.fragmentQueue[0] ?? null;
}

// --- State inicijalizacija ---
let state = loadState();

if (!state || !state.fragmentQueue || state.fragmentQueue.length === 0) {
  // Nema validnog save-a ili queue je prazan — kreiraj svež state
  state = createInitialState();
  state.fragmentQueue = initFragmentQueue(3, 0);
  state.activeFragment = state.fragmentQueue[0] ?? null;
}

// Defensive: popuni queue ako je kratak (može se desiti sa starim save-om)
while (state.fragmentQueue.length < 3) {
  enqueueNewFragment(state.fragmentQueue, state.score);
}
if (!state.activeFragment) {
  state.activeFragment = state.fragmentQueue[0] ?? null;
}

// Inicijalizuj UI (skloni legacy DOM elemente)
initUI();

// Inicijalizuj input (prosledi state referencu i getLayout/onReset callbacks)
initInput(canvas, state, getLayout, resetGame);

// --- Save timer (save svakih 5s tokom igranja) ---
const SAVE_INTERVAL_MS = 5000;
let saveAccumMs = 0;

// --- Game loop ---
let lastTimestamp = performance.now();

/**
 * Glavna game loop funkcija. Poziva update → render svaki frejm.
 * @param {number} timestamp — DOMHighResTimeStamp od requestAnimationFrame
 */
function loop(timestamp) {
  const dtMs = Math.min(timestamp - lastTimestamp, 100); // cap na 100ms (tab inactive)
  lastTimestamp = timestamp;

  update(dtMs);
  render(ctx, state, _layout);

  // Periodično save tokom igranja
  if (state.gamePhase === 'playing') {
    saveAccumMs += dtMs;
    if (saveAccumMs >= SAVE_INTERVAL_MS) {
      saveState(state);
      saveAccumMs = 0;
    }
  }

  requestAnimationFrame(loop);
}

/**
 * Centralni update koji delegira animacione tajmere i partikle.
 * Logika inputa i match-a živi u systems/; ovde se samo dekrementuju tajmeri.
 * @param {number} dtMs — delta vreme u milisekundama
 */
function update(dtMs) {
  const anim = state.animations;

  // Shake tajmer
  if (anim.shakeTimer > 0) {
    anim.shakeTimer = Math.max(0, anim.shakeTimer - dtMs);
  }

  // Match flash tajmer za svaku ćeliju
  if (anim.matchFlash.length > 0) {
    for (const f of anim.matchFlash) {
      f.timer = Math.max(0, f.timer - dtMs);
    }
    // Očisti gotove flash-ove
    anim.matchFlash = anim.matchFlash.filter(f => f.timer > 0);
  }

  // Combo tekst tajmer
  if (anim.comboText !== null) {
    anim.comboText.timer = Math.max(0, anim.comboText.timer - dtMs);
    if (anim.comboText.timer <= 0) {
      anim.comboText = null;
    }
  }

  // Combo pulse overlay tajmer
  if (anim.comboPulse > 0) {
    anim.comboPulse = Math.max(0, anim.comboPulse - dtMs);
  }

  // Win reveal tajmer
  if (anim.winReveal !== null) {
    anim.winReveal.timer = Math.max(0, anim.winReveal.timer - dtMs);
  }

  // Input block tajmer
  if (state.inputBlocked) {
    state.inputBlockTimer = Math.max(0, state.inputBlockTimer - dtMs);
    if (state.inputBlockTimer <= 0) {
      state.inputBlocked = false;
    }
  }

  // Partikle update
  if (state.particles.length > 0) {
    const dtSec = dtMs / 1000;
    for (const p of state.particles) {
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.life = Math.max(0, p.life - dtMs);
    }
    state.particles = state.particles.filter(p => p.life > 0);
  }
}

// Start loop
requestAnimationFrame(loop);
