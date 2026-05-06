import { CONFIG } from './config.js';
import { loadSprites } from './sprites.js';
import { createState, saveDailyHighscore } from './state.js';
import { initInput, showTouchControls, hideTouchControls } from './input.js';
import {
  initAudio, resumeAudio, updateAudio,
  playTrashSound, playGameOverSound, playLogoSound
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

  initWorld(state, logicalW(), logicalH());
  initPlayer(state, groundY());
  initSpawner(state, logicalW());
}

// Confetti / explosion particles
let confettiParticles = [];
let confettiTimer = 0;
const CONFETTI_DURATION = 1.5; // seconds before showing game over overlay

function spawnConfetti(isFirst) {
  const W = logicalW();
  const H = logicalH();
  const count = isFirst ? 120 : 60;
  const colors = isFirst
    ? ['#FFD700', '#ff4466', '#ff88aa', '#ffee44', '#44ff88', '#88aaff', '#ffffff']
    : ['#cc2244', '#ff4466', '#8899AA', '#aabbcc', '#ffffff'];
  const cx = state.player.x;
  const cy = state.player.y + 30;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * (isFirst ? 350 : 200);
    confettiParticles.push({
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isFirst ? 150 : 80),
      size: isFirst ? 3 + Math.random() * 5 : 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 12,
      alpha: 1
    });
  }
}

function updateConfetti(dt) {
  for (const p of confettiParticles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 400 * dt; // gravity
    p.vx *= 0.98;
    p.rot += p.rotV * dt;
    p.alpha = Math.max(0, p.alpha - dt * 0.5);
  }
  confettiParticles = confettiParticles.filter(p => p.alpha > 0.01);
}

function drawConfetti(ctx) {
  for (const p of confettiParticles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
}

function endRun() {
  state.screen = 'confetti';
  hideTouchControls();
  playGameOverSound();
  saveDailyHighscore(state);
  const rank = state.daily.scores.length ? state.daily.scores.indexOf(state.score) + 1 : 0;
  spawnConfetti(rank === 1);
  confettiTimer = CONFETTI_DURATION;
}

function finishEndRun() {
  state.screen = 'gameover';
  confettiParticles = [];
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
    // Update speed
    state.speed = Math.min(
      CONFIG.SPEED_MAX,
      CONFIG.SPEED_BASE + state.distance * CONFIG.SPEED_GROWTH
    );

    // Anti-abuse: svakih 30s dodaj random delay
    state.antiAbuseTimer += dt;
    if (state.antiAbuseTimer >= CONFIG.ANTI_ABUSE_INTERVAL) {
      state.antiAbuseTimer = 0;
      state.antiAbuseDelay = Math.random() * 0.5;
    }

    // Distance i score (smeće + distanca)
    const dx = state.speed * dt;
    state.distance += dx;
    state.score = state.trashCount * CONFIG.TRASH_SCORE
      + Math.floor(state.distance / 100) * CONFIG.DIST_SCORE_PER_100PX;

    // Update world
    updateWorld(state, dt);

    // Update player
    updatePlayer(state, dt, gY);

    // Update spawner
    updateSpawner(state, W, dt);

    // Collision
    const { hit, obj } = checkCollisions(state, gY);
    if (hit) {
      if (obj.type === 'collectible') {
        obj.collected = true;
        if (obj.kind === 'logo') {
          state.score += CONFIG.LOGO_SCORE;
          playLogoSound();
        } else {
          state.trashCount++;
          playTrashSound();
        }
      } else {
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

  // Confetti transition
  if (state.screen === 'confetti') {
    updateConfetti(dt);
    confettiTimer -= dt;
    if (confettiTimer <= 0) {
      finishEndRun();
    }
  }

  render(ctx, state, W, H);

  // Draw confetti on top of everything
  if (state.screen === 'confetti') {
    drawConfetti(ctx);
  }
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
