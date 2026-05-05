import { CONFIG } from './config.js';
import { loadSprites } from './sprites.js';
import { createState, saveDailyHighscore } from './state.js';
import { initInput } from './input.js';
import {
  initAudio, resumeAudio, updateAudio,
  playCardSound, playTrashSound, playGameOverSound
} from './audio.js';
import { render } from './render.js';
import { showMenu, hideMenu, updateHUD, showGameOver, hideGameOver } from './ui.js';
import { initPlayer, updatePlayer } from './entities/player.js';
import { initWorld, updateWorld } from './systems/world.js';
import { initSpawner, updateSpawner } from './systems/spawner.js';
import { checkCollisions } from './systems/collision.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resize);
resize();

const state = createState();
initInput(canvas);
initAudio();

function logicalW() { return canvas.width / (window.devicePixelRatio || 1); }
function logicalH() { return canvas.height / (window.devicePixelRatio || 1); }
function groundY() { return logicalH() * CONFIG.GROUND_RATIO; }

function startRun() {
  hideMenu();
  hideGameOver();
  resumeAudio();

  state.screen = 'playing';
  state.score = 0;
  state.cardCount = 0;
  state.trashCount = 0;
  state.distance = 0;
  state.speed = CONFIG.SPEED_BASE;
  state.cardBoostTimer = 0;
  state.antiAbuseTimer = 0;
  state.antiAbuseDelay = 0;

  initWorld(state, logicalW(), logicalH());
  initPlayer(state, groundY());
  initSpawner(state, logicalW());
}

function endRun() {
  state.screen = 'gameover';
  playGameOverSound();
  saveDailyHighscore(state);
  showGameOver(state, startRun);
}

// Try to load sprites (graceful — if missing, engine uses programmatic drawing)
loadSprites('sprites/atlas.json').catch(() => {});

showMenu(startRun);

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const W  = logicalW();
  const H  = logicalH();
  const gY = groundY();

  if (state.screen === 'playing') {
    // Update speed
    state.speed = Math.min(
      CONFIG.SPEED_MAX,
      CONFIG.SPEED_BASE + state.distance * CONFIG.SPEED_GROWTH
    );
    if (state.cardBoostTimer > 0) {
      state.cardBoostTimer -= dt;
      state.speed = Math.min(CONFIG.SPEED_MAX, state.speed + CONFIG.CARD_BOOST_SPEED);
    }

    // Anti-abuse: svakih 30s dodaj random delay
    state.antiAbuseTimer += dt;
    if (state.antiAbuseTimer >= CONFIG.ANTI_ABUSE_INTERVAL) {
      state.antiAbuseTimer = 0;
      state.antiAbuseDelay = Math.random() * 0.5;  // 0-500ms delay
    }

    // Distance i score
    const dx = state.speed * dt;
    state.distance += dx;
    state.score = state.cardCount * CONFIG.CARD_SCORE
      + Math.floor(state.distance / 100) * CONFIG.DIST_SCORE_PER_100PX;

    // Update world
    updateWorld(state, dt);

    // Update player
    updatePlayer(state, dt, gY);

    // Update spawner
    updateSpawner(state, W);

    // Collision
    const { hit, obj } = checkCollisions(state, gY);
    if (hit) {
      if (obj.type === 'collectible') {
        obj.collected = true;
        if (obj.kind === 'karta') {
          state.cardCount++;
          state.cardBoostTimer = CONFIG.CARD_BOOST_DURATION;
          playCardSound();
        } else {
          state.trashCount++;
          playTrashSound();
        }
      } else {
        // Prepreka — game over
        endRun();
        requestAnimationFrame(loop);
        return;
      }
    }

    // Audio beat
    updateAudio(dt, true);

    // HUD
    updateHUD(state);
  }

  render(ctx, state, W, H);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
