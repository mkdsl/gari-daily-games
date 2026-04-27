/**
 * @file main.js
 * @description Entry point za Frekventni Grad — inicijalizuje igru i pokreće game loop.
 *
 * Odgovornosti:
 *  - Povežuje sve module (config, state, input, systems, render, ui, audio)
 *  - requestAnimationFrame game loop sa dt kalkulacijom
 *  - Routing game faza: menu → playing → night_summary → game_over
 *  - handleInput(lane) — prima od input.js, prosleđuje ka systems
 *  - startNight(), endNight(), transitionToNextSong(), handlePrestige()
 *
 * @module main
 */

import { CONFIG } from './config.js';
import { createState, loadState, saveState } from './state.js';
import { initInput } from './input.js';
import { updateSystems } from './systems/index.js';
import { renderFrame, renderBackground } from './render.js';
import { renderHUD, renderMenu, renderNightSummary, renderGameOver, renderSetlistCards } from './ui.js';
import { initAudio, playBassLoop, stopBassLoop, playArpeggio, stopArpeggio, playNightEnd } from './audio.js';
import { getSong } from './levels/patterns.js';

// ─── Canvas setup ─────────────────────────────────────────────────────────────

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/** @type {AudioContext|null} */
let audioCtx = null;

/**
 * Skalira canvas na devicePixelRatio za oštro prikazivanje na Retina ekranima.
 */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── State i input ────────────────────────────────────────────────────────────

/** @type {import('./state.js').GameState} */
const state = loadState() ?? createState();

/** @type {number[]} — Buffer za lane hitove iz ovog frame-a */
const pendingHits = [];

initInput(canvas, (lane) => {
  if (state.gamePhase === 'playing') {
    pendingHits.push(lane);
  } else if (state.gamePhase === 'menu') {
    startGame();
  } else if (state.gamePhase === 'night_summary') {
    transitionToNextSong();
  } else if (state.gamePhase === 'game_over') {
    restartGame();
    startGame();
  }
});

// ─── Game lifecycle ───────────────────────────────────────────────────────────

/**
 * Pokreće prvu sesiju (iz menija).
 * @returns {Promise<void>}
 */
async function startGame() {
  audioCtx = new AudioContext();
  await initAudio(audioCtx);
  Object.assign(state, loadState() ?? createState());
  startNight();
}

/**
 * Inicijalizuje jednu noć: resetuje energy, schedulerHead, activeBeats,
 * nightSummary, i pokreće prvu pesmu noći.
 * @returns {void}
 */
function startNight() {
  state.gamePhase = 'playing';
  state.currentSong = 0;
  state.energy = CONFIG.ENERGY_START;
  state.activeBeats = [];
  state.schedulerHead = 0;
  state.nightSummary = { perfectCount: 0, goodCount: 0, missCount: 0, scoreGained: 0, maxCombo: 0 };
  startSong();
}

/**
 * Pokreće pesmu unutar noći: setuje songStartTime na audioCtx.currentTime,
 * resetuje schedulerHead.
 * @returns {void}
 */
function startSong() {
  const song = getSong(state.currentClub, state.currentNight, state.currentSong);
  if (!song) { endNight(); return; }
  state.songStartTime = audioCtx.currentTime + 1.0;
  state.schedulerHead = state.songStartTime - CONFIG.BEAT_TRAVEL_TIME;
  state.activeBeats = [];
  playBassLoop(audioCtx, song.bpm);
  playArpeggio(audioCtx, song.bpm);
}

/**
 * Završava noć: zaustavlja audio, ažurira statistiku, prelazi na night_summary.
 * @returns {void}
 */
function endNight() {
  stopBassLoop();
  stopArpeggio();
  playNightEnd(audioCtx);
  state.totalNightsPlayed++;
  state.gamePhase = 'night_summary';
  saveState(state);
}

/**
 * Prelaz na sledeću pesmu ili završetak noći.
 * Ako je currentSong === SONGS_PER_NIGHT - 1, poziva endNight().
 * Inače prikazuje setlist kartice (TODO) i pokreće sledeću pesmu.
 * @returns {void}
 */
function transitionToNextSong() {
  state.currentSong++;
  if (state.currentSong >= CONFIG.SONGS_PER_NIGHT) {
    state.currentNight++;
    if (state.currentNight >= CONFIG.NIGHTS_PER_CLUB) {
      state.currentClub = Math.min(state.currentClub + 1, 3);
      state.currentNight = 0;
    }
    if (state.totalNightsPlayed >= CONFIG.PRESTIGE_AFTER_NIGHTS) {
      handlePrestige();
    }
    endNight();
  } else {
    startSong();
    state.gamePhase = 'playing';
  }
}

/**
 * Prestige: resetuje currentClub/currentNight/currentSong,
 * inkrementuje prestigeLevel, primenjuje brzinu multiplier.
 * @returns {void}
 */
function handlePrestige() {
  state.prestigeLevel++;
  state.currentClub = 0;
  state.currentNight = 0;
  state.currentSong = 0;
  state.totalNightsPlayed = 0;
}

/**
 * Restartuje igru posle game over: kreira svež state, ide na meni.
 * @returns {void}
 */
function restartGame() {
  stopBassLoop();
  stopArpeggio();
  Object.assign(state, createState());
}

// ─── Game loop ────────────────────────────────────────────────────────────────

let _lastTime = performance.now();
let _saveTimer = 0;

/**
 * Glavni rAF loop. Prima performance.now() timestamp.
 * @param {DOMHighResTimeStamp} now
 */
function gameLoop(now) {
  const dt = Math.min(0.05, (now - _lastTime) / 1000);
  _lastTime = now;

  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  // Update
  if (state.gamePhase === 'playing' && audioCtx) {
    const song = getSong(state.currentClub, state.currentNight, state.currentSong);
    if (song) {
      updateSystems(state, audioCtx, song, pendingHits);
      // End-of-song check: all beats scheduled and none active
      const songElapsed = audioCtx.currentTime - state.songStartTime;
      const allScheduled = songElapsed > song.duration;
      const noneActive = state.activeBeats.every(b => b.state !== 'active');
      if (allScheduled && noneActive && state.gamePhase === 'playing') {
        transitionToNextSong();
      }
    }
    pendingHits.length = 0;
  }

  // Render
  ctx.clearRect(0, 0, w, h);

  if (state.gamePhase === 'menu') {
    renderMenu(ctx, w, h);
  } else if (state.gamePhase === 'playing') {
    renderFrame(state, ctx, canvas);
    renderHUD(state, ctx, w, h);
  } else if (state.gamePhase === 'night_summary') {
    renderFrame(state, ctx, canvas);
    renderNightSummary(state, ctx, w, h);
  } else if (state.gamePhase === 'game_over') {
    renderFrame(state, ctx, canvas);
    renderGameOver(state, ctx, w, h);
  }

  // Autosave
  _saveTimer += dt;
  if (_saveTimer >= CONFIG.SAVE_INTERVAL_SEC) {
    saveState(state);
    _saveTimer = 0;
  }

  requestAnimationFrame(gameLoop);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

requestAnimationFrame(gameLoop);
