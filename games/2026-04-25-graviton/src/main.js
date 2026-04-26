/**
 * main.js — Entry point za Graviton.
 *
 * Odgovornosti:
 *   - Kreira i skalira canvas na CONFIG.CANVAS_WIDTH × CONFIG.CANVAS_HEIGHT (800×450)
 *   - Pokreće requestAnimationFrame game loop (update → render split)
 *   - Wire-uje sve module: input, systems, render, ui, audio
 *   - Prosleđuje dt (delta time, max 50ms) svim sistemima
 *
 * Ne sadrži gameplay logiku — samo orchestration.
 */

import { CONFIG } from './config.js';
import { createState, resetState, loadBestScore, saveBestScore } from './state.js';
import { initInput, readInput } from './input.js';
import { updateGravity, updateScroll, updateSpeedLevel, updateBuzzsaws } from './systems/physics.js';
import { checkCollisions } from './systems/collision.js';
import { initGenerator, spawnZones } from './systems/generator.js';
import { processFlipInput, updateFlipAnim, updateGOverload } from './entities/player.js';
import { render } from './render.js';
import { renderUI } from './ui.js';
import {
  initAudio,
  playFlip,
  playBeepWarning,
  stopBeepWarning,
  playDeathChord,
  playMilestoneArpeggio,
} from './audio.js';

// ─── Canvas setup ─────────────────────────────────────────────────────────────

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

/**
 * Fiksira canvas logičke dimenzije na 800×450.
 * CSS (base.css) se brine za vizuelno skaliranje u viewport.
 */
function resizeCanvas() {
  canvas.width  = CONFIG.CANVAS_WIDTH;
  canvas.height = CONFIG.CANVAS_HEIGHT;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── Input setup ─────────────────────────────────────────────────────────────
//
// input.js#initInput je stub (čuva canvas referencu ali ne dodaje listenere).
// Dodajemo listenere direktno ovde i parkiramo ih u _pending* bafer.
// _readInput() spaja naš bafer sa onim iz input.js#readInput() (konzumira oba).

initInput(canvas);

let _pendingFlip   = false;
let _pendingAnyKey = false;

function _setFlip()   { _pendingFlip   = true; }
function _setAnyKey() { _pendingAnyKey = true; }

// Keyboard
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === ' ' || key === 'arrowup' || key === 'arrowdown') {
    e.preventDefault(); // blokira scroll stranice
    _setFlip();
  }
  _setAnyKey();
});

// Mouse (na canvas-u — ignorišemo klikove van igre)
canvas.addEventListener('mousedown', () => {
  _setFlip();
  _setAnyKey();
});

// Touch
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  _setFlip();
  _setAnyKey();
}, { passive: false });

/**
 * Čita i konzumira input za ovaj frame.
 * Spaja naš bafer (direktni listeneri) sa input.js bufferom (stub, uvek false).
 * @returns {{ flipPressed: boolean, anyKeyPressed: boolean }}
 */
function _readInput() {
  const base = readInput(); // konzumira input.js buffers
  const snap = {
    flipPressed:   _pendingFlip   || base.flipPressed,
    anyKeyPressed: _pendingAnyKey || base.anyKeyPressed,
  };
  _pendingFlip   = false;
  _pendingAnyKey = false;
  return snap;
}

// ─── Audio init ───────────────────────────────────────────────────────────────

// Registruje listener za lazy kreiranje AudioContext na prvi user gesture
initAudio();

// ─── Game state ───────────────────────────────────────────────────────────────

/** @type {Object} Globalni game state */
const state = createState();
// best_score je već učitan u createState(), ali ga eksplicitno potvrđujemo
state.best_score = loadBestScore();

/** Da li je HIGH_SCORE_CHECK logika već pokrenuta za ovaj run */
let _highScoreChecked = false;

// ─── Game loop ────────────────────────────────────────────────────────────────

/** Vreme prethodnog frame-a (DOMHighResTimeStamp) */
let _prevTime = performance.now();

/** Ukupno vreme od starta aplikacije (sekunde) — za blink animacije u UI */
let _appTime = 0;

/**
 * Glavni game loop. Poziva se svaki frame putem requestAnimationFrame.
 * @param {DOMHighResTimeStamp} now
 */
function loop(now) {
  // Delta time, clamped na 50ms (20 fps min) da sprečimo fizičke skokove pri tab-switch
  const dt = Math.min(0.05, (now - _prevTime) / 1000);
  _prevTime = now;
  _appTime += dt;

  _update(dt);
  _render();

  requestAnimationFrame(loop);
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Sve update logike za jedan frame, po game fazi.
 * @param {number} dt - Delta time u sekundama (max 0.05)
 */
function _update(dt) {
  const input = _readInput();

  switch (state.gamePhase) {

    // ── IDLE: čekaj input da startuje igru ────────────────────────────────────
    case 'IDLE': {
      if (input.anyKeyPressed || input.flipPressed) {
        startGame();
      }
      break;
    }

    // ── PLAYING: glavni gameplay loop ─────────────────────────────────────────
    case 'PLAYING': {
      // Tajmer preživljavanja
      state.survival_time += dt;

      // Input → flip brod (cooldown-om upravljan, resetuje G-overload timer)
      const flipped = processFlipInput(state.brod, input, dt);
      if (flipped) {
        playFlip();
        stopBeepWarning(); // flip resetuje G-overload → gasi beep upozorenje
      }

      // Vizuelna flip animacija (lerp visual_angle → target_angle)
      updateFlipAnim(state.brod, dt);

      // Fizika: velocity_y += gravity_dir * GRAVITY * dt; brod.y += velocity_y * dt
      // Physics.js već lepi brod uz pod/plafon unutar updateGravity
      updateGravity(state.brod, dt);

      // Scroll: pomera active_zones ulevo, uklanja prošle, inkrementira zone_index
      updateScroll(state, dt);

      // Speed level: floor(survival_time / 60), vraća true ako je porastao
      const leveledUp = updateSpeedLevel(state);
      if (leveledUp) {
        playMilestoneArpeggio();
      }

      // Dopuni active_zones iz zone_pool (do ZONE_LOOKAHEAD + 1 = 3 zone)
      spawnZones(state);

      // Buzzsaw animacija: rotacija i vertikalna oscilacija
      updateBuzzsaws(state, dt);

      // Collision detection
      const { result: colResult } = checkCollisions(state.brod, state.active_zones);

      if (colResult === 'obstacle') {
        triggerDeath('obstacle');
        break;
      }

      // Pod/plafon — physics.js ih lepi u tutorial zonama (zone_index < 4).
      // Od zone 4 nadalje, dodir poda/plafona = smrt (ali G-overload je primarni mehanizam).
      // Napomena: updateGravity već clampuje brod unutar granica, pa ovaj check
      // pokriva edge case kada brod doleti direktno u zid sa velikom brzinom.
      if (colResult === 'floor' || colResult === 'ceil') {
        if (state.zone_index >= CONFIG.G_OVERLOAD_ACTIVE_FROM_ZONE) {
          triggerDeath(colResult);
          break;
        }
        // Tutorial zone: physics.js već clampuje, nema smrt
      }

      // G-overload: povećava timer dok igrač ne flipa; od zone 4 nadalje
      const overloadStatus = updateGOverload(state.brod, state.zone_index, dt);
      if (overloadStatus === 'dead') {
        triggerDeath('G-OVERLOAD');
        break;
      }

      // Beep upozorenje za G-overload (počinje od G_OVERLOAD_WARNING_THRESHOLD = 0.5)
      if (state.brod.g_overload_ratio >= CONFIG.G_OVERLOAD_WARNING_THRESHOLD) {
        playBeepWarning(state.brod.g_overload_ratio);
      }

      break;
    }

    // ── DEAD: death fade animacija ────────────────────────────────────────────
    case 'DEAD': {
      state.death_timer += dt;

      // Fade overlay: 0 → 0.8 za DEATH_FADE_DURATION (0.3s)
      const fadeRate = 0.8 / CONFIG.DEATH_FADE_DURATION;
      state.death_overlay_alpha = Math.min(0.8, state.death_overlay_alpha + fadeRate * dt);

      // Kada overlay dostigne max i prođe DEATH_SCREEN_DELAY (0.4s) → end screen
      if (state.death_overlay_alpha >= 0.8 && state.death_timer >= CONFIG.DEATH_SCREEN_DELAY) {
        state.gamePhase = 'HIGH_SCORE_CHECK';
        _highScoreChecked = false;
      }
      break;
    }

    // ── HIGH_SCORE_CHECK: end screen, jednom provjeri/sačuvaj skor ────────────
    case 'HIGH_SCORE_CHECK': {
      if (!_highScoreChecked) {
        _highScoreChecked = true;
        state.current_score = state.survival_time;

        if (state.current_score > state.best_score) {
          state.best_score = state.current_score;
          state.new_record = true;
          saveBestScore(state.current_score);
        } else {
          state.new_record = false;
        }
      }

      // Čekaj input za restart
      if (input.anyKeyPressed || input.flipPressed) {
        restartGame();
      }
      break;
    }
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

/**
 * Crta ceo frame.
 * render.js crta sve canvas slojeve (pozadina, pod/plafon, zone, brod, overlay, HUD).
 * ui.js crta IDLE i HIGH_SCORE_CHECK screen overlay-e na vrhu.
 */
function _render() {
  ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

  // Svi canvas slojevi (faza-nezavisni, render.js interno preskače šta ne treba)
  render(ctx, state);

  // Start screen (IDLE) i end screen (HIGH_SCORE_CHECK) — samo ove dve faze
  renderUI(ctx, state, _appTime);
}

// ─── Helper funkcije ──────────────────────────────────────────────────────────

/**
 * Pokreće novu igru iz IDLE stanja.
 * initGenerator generiše 100 zona, puni active_zones, resetuje zone_index.
 */
export function startGame() {
  initGenerator(state);       // generiše zone_pool, active_zones, zone_index = 0
  state.gamePhase = 'PLAYING';
}

/**
 * Triggeruje smrt broda.
 * Prelazi u DEAD fazu, pokreće audio i CSS screen-shake.
 * Guard sprečava dupliranje ako se dva collidable triggeruju isti frame.
 *
 * @param {'obstacle' | 'floor' | 'ceil' | 'G-OVERLOAD'} cause
 */
export function triggerDeath(cause) {
  // Guard: ne pokreći death dok smo već u DEAD ili HIGH_SCORE_CHECK
  if (state.gamePhase === 'DEAD' || state.gamePhase === 'HIGH_SCORE_CHECK') return;

  state.gamePhase          = 'DEAD';
  state.death_reason       = cause;
  state.death_overlay_alpha = 0;
  state.death_timer        = 0;

  stopBeepWarning();
  playDeathChord();

  // CSS screen-shake (game.css definiše @keyframes death-shake)
  document.body.classList.add('death-shake');
  setTimeout(() => document.body.classList.remove('death-shake'), 300);
}

/**
 * Resetuje state i vraća u IDLE ekran.
 * best_score se čuva između restarta (resetState interno čuva, ali ga eksplicitno vraćamo).
 */
export function restartGame() {
  const savedBest = state.best_score;
  resetState(state);           // vraća sve na početne vrednosti (osim best_score)
  state.best_score = savedBest;
  _highScoreChecked = false;
  state.gamePhase = 'IDLE';
}

// ─── Start ────────────────────────────────────────────────────────────────────

requestAnimationFrame(loop);
