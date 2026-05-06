import { CONFIG } from './config.js';
import { loadSprites } from './sprites.js';
import { createState, saveDailyHighscore, computeHash } from './state.js';
import { initInput, showTouchControls, hideTouchControls } from './input.js';
import {
  initAudio, resumeAudio, updateAudio,
  playTrashSound, playGameOverSound, playLogoSound,
  toggleMute
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
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resize);
}

window.addEventListener('resize', resize);
resize();

const state = createState();
initInput(canvas);
initAudio();

document.getElementById('btn-mute').addEventListener('click', () => {
  const isMuted = toggleMute();
  document.getElementById('btn-mute').textContent = isMuted ? '\u2715' : '\u266A';
});

function logicalW() { return canvas.getBoundingClientRect().width; }
function logicalH() { return canvas.getBoundingClientRect().height; }
function groundY() { return logicalH() * CONFIG.GROUND_RATIO; }

function startRun() {
  hideMenu();
  hideGameOver();
  showTouchControls();
  resumeAudio();

  state.screen = 'playing';
  state.score = 0;
  state.trashCount = 0;
  state.distance = 0;
  state.speed = CONFIG.SPEED_BASE;
  state.antiAbuseTimer = 0;
  state.antiAbuseDelay = 0;

  // New gameplay state
  state.combo = 0;
  state.comboMultiplier = 1;
  state.comboBonus = 0;
  state.shield = 0;
  state.lastMilestone = 0;
  state.dropping = false;
  state.dropDuration = 0;
  state.dropTimer = CONFIG.DROP_INTERVAL_BASE - CONFIG.DROP_INTERVAL_VARIANCE + Math.random() * CONFIG.DROP_INTERVAL_VARIANCE * 2;
  state.flashMessages = [];

  state.player.isDead = false;
  deathTimer = 0;

  initWorld(state, logicalW(), logicalH());
  initPlayer(state, groundY());
  initSpawner(state, logicalW());
}

let deathTimer = 0;

function endRun() {
  state.screen = 'dying';
  state.player.isDead = true;
  state.combo = 0;
  state.comboMultiplier = 1;
  deathTimer = 0;
  hideTouchControls();
  playGameOverSound();
}

function finishDeath() {
  state.screen = 'gameover';
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

  state.canvasW = W;

  if (state.screen === 'playing') {
    // === Drop moment logic ===
    let effectiveSpeedMult = 1;
    if (state.dropping) {
      state.dropDuration -= dt;
      effectiveSpeedMult = CONFIG.DROP_SPEED_MULT;
      if (state.dropDuration <= 0) {
        state.dropping = false;
      }
    } else {
      state.dropTimer -= dt;
      if (state.dropTimer <= 0) {
        state.dropping = true;
        state.dropDuration = CONFIG.DROP_DURATION;
        state.dropTimer = CONFIG.DROP_INTERVAL_BASE - CONFIG.DROP_INTERVAL_VARIANCE + Math.random() * CONFIG.DROP_INTERVAL_VARIANCE * 2;
        state.flashMessages.push({ text: 'DROP!', timer: 1.2, color: '#ff4466', size: 48 });
      }
    }

    // Update speed
    state.speed = Math.min(
      CONFIG.SPEED_MAX,
      CONFIG.SPEED_BASE + state.distance * CONFIG.SPEED_GROWTH
    );
    const effectiveSpeed = state.speed * effectiveSpeedMult;

    // Anti-abuse: svakih 30s dodaj random delay
    state.antiAbuseTimer += dt;
    if (state.antiAbuseTimer >= CONFIG.ANTI_ABUSE_INTERVAL) {
      state.antiAbuseTimer = 0;
      state.antiAbuseDelay = Math.random() * 0.5;
    }

    // Distance i score (smeće + distanca)
    const savedSpeed = state.speed;
    state.speed = effectiveSpeed;
    const dx = effectiveSpeed * dt;
    state.distance += dx;
    state.score = state.trashCount * CONFIG.TRASH_SCORE + state.comboBonus
      + Math.floor(state.distance / 100) * CONFIG.DIST_SCORE_PER_100PX;
    state._scoreHash = computeHash(state.score, state.trashCount, state.distance);

    // === Milestone check ===
    const distMeters = Math.floor(state.distance / 10);
    for (const milestone of CONFIG.MILESTONES) {
      if (distMeters >= milestone && state.lastMilestone < milestone) {
        state.lastMilestone = milestone;
        const bonus = Math.floor(milestone / 10);
        state.score += bonus;
        state._scoreHash = computeHash(state.score, state.trashCount, state.distance);
        state.flashMessages.push({ text: milestone + 'm! +' + bonus, timer: 1.2, color: '#88aaff', size: 36 });
      }
    }

    // Update world
    updateWorld(state, dt);

    // Update player
    updatePlayer(state, dt, gY);

    // Restore base speed for spawner (so spawn gaps stay consistent)
    state.speed = savedSpeed;

    // Update spawner
    updateSpawner(state, W, dt);

    // Restore effective speed
    state.speed = effectiveSpeed;

    // Collision
    const { hit, obj } = checkCollisions(state, gY);
    if (hit) {
      if (obj.type === 'collectible') {
        obj.collected = true;
        if (obj.kind === 'logo') {
          state.score += CONFIG.LOGO_SCORE;
          // Shield from logo
          if (state.shield < 1) {
            state.shield = 1;
            state.flashMessages.push({ text: 'SHIELD!', timer: 1.2, color: '#FFD700', size: 32 });
          }
          state._scoreHash = computeHash(state.score, state.trashCount, state.distance);
          playLogoSound();
        } else {
          // Trash collected — combo system
          state.combo++;
          state.trashCount++;
          if (state.combo >= CONFIG.COMBO_THRESHOLD) {
            state.comboMultiplier = CONFIG.COMBO_MULTIPLIER;
            state.flashMessages.push({ text: 'COMBO x' + CONFIG.COMBO_MULTIPLIER + '!', timer: 1.2, color: '#FFD700', size: 32 });
          }
          // Add combo bonus for this pickup
          if (state.comboMultiplier > 1) {
            state.comboBonus += CONFIG.TRASH_SCORE * (state.comboMultiplier - 1);
          }
          state.score = state.trashCount * CONFIG.TRASH_SCORE + state.comboBonus
            + Math.floor(state.distance / 100) * CONFIG.DIST_SCORE_PER_100PX;
          state._scoreHash = computeHash(state.score, state.trashCount, state.distance);
          playTrashSound();
        }
      } else {
        // Hit obstacle
        if (state.shield > 0) {
          state.shield = 0;
          state.combo = 0;
          state.comboMultiplier = 1;
          state.flashMessages.push({ text: 'SHIELD BROKEN!', timer: 1.2, color: '#ff8800', size: 32 });
          // Remove the obstacle so player can pass
          obj.collected = true;
        } else {
          endRun();
          state.speed = savedSpeed;
          requestAnimationFrame(loop);
          return;
        }
      }
    }

    // === Near-miss detection ===
    const player = state.player;
    for (const nobj of state.objects) {
      if (nobj.type !== 'obstacle' || nobj.nearMissed) continue;
      const sx = nobj.worldX - state.world.scrollX;
      // Object has passed behind the player
      if (sx + nobj.w < player.x - 5) {
        // Check vertical overlap (was player in the obstacle's vertical zone?)
        const objTop = gY - nobj.groundOffset;
        const objBottom = objTop + nobj.hitH;
        const pH = player.isDucking ? CONFIG.PLAYER_H_DUCK : CONFIG.PLAYER_H_RUN;
        const pTop = player.y;
        const pBottom = player.y + pH;
        const verticalOverlap = pTop < objBottom && pBottom > objTop;
        // Check horizontal near-miss distance
        const horizDist = (player.x) - (sx + nobj.w);
        if (verticalOverlap && horizDist < CONFIG.NEAR_MISS_DISTANCE) {
          nobj.nearMissed = true;
          state.score += CONFIG.NEAR_MISS_BONUS;
          state._scoreHash = computeHash(state.score, state.trashCount, state.distance);
          state.flashMessages.push({ text: 'CLOSE! +5', timer: 1.2, color: '#44ff88', size: 28 });
        } else {
          // Mark as missed so we don't check again
          nobj.nearMissed = true;
        }
      }
    }

    // Restore base speed
    state.speed = savedSpeed;

    // === Flash message update ===
    for (let i = state.flashMessages.length - 1; i >= 0; i--) {
      state.flashMessages[i].timer -= dt;
      if (state.flashMessages[i].timer <= 0) {
        state.flashMessages.splice(i, 1);
      }
    }

    // Audio beat
    updateAudio(dt, true);

    // HUD
    updateHUD(state);
  }

  if (state.screen === 'dying') {
    updateAudio(dt, false);
    deathTimer += dt;
    if (deathTimer >= 0.8) {
      finishDeath();
    }
  }

  render(ctx, state, W, H);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
