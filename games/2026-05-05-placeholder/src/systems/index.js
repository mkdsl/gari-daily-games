/**
 * systems/index.js — Orkestrator svih sistema za Bespuće
 * Redosled poziva: chunks → physics → pickups → obstacles → collision
 * Eksportuje: updateSystems, selectCheckpointPowerup
 */
import { updatePhysics } from './physics.js';
import { updateChunks } from './chunks.js';
import { checkCollisions } from './collision.js';
import { updateObstacles, scrollObstacles } from '../entities/obstacle.js';
import { updatePickups } from '../entities/pickup.js';
import {
  updatePlayerPowerups,
  updateRecordY,
  applyPowerup,
} from '../entities/player.js';
import { CONFIG } from '../config.js';

// ─── Power-up pool ────────────────────────────────────────────────────────────
const POWERUP_POOL = [
  'SHIELD',
  'SLOW_TIME',
  'SCORE_2X',
  'MAGNET_TEMP',
  'WIDE_SHIP',
  'SPEED_BURST',
  'GHOST_PASS',
  'CRYSTAL_RAIN',
];

/**
 * Nasumično odaberi n različitih power-up ID-ova iz pool-a.
 * @param {number} n
 * @returns {string[]}
 */
function selectPowerups(n) {
  const shuffled = [...POWERUP_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Primeni odabrani checkpoint power-up na run state i vrati igru u RUNNING.
 * Poziva se iz main.js / ui.js kad igrač odabere, ili automatski po timeout-u.
 * @param {object} run    - Run state
 * @param {object} state  - Cijeli state (za promenu screen-a)
 * @param {string} id     - Power-up ID
 */
export function selectCheckpointPowerup(run, state, id) {
  if (id === 'SHIELD') {
    run.shieldsLeft++;
  } else if (id === 'CRYSTAL_RAIN') {
    // Spawni 5 kristala ispred igrača
    for (let i = 0; i < 5; i++) {
      run.pickups.push({
        type: 'CRYSTAL',
        x: run.player.x + 50 + i * 30,
        y: run.player.y,
        angle: 0,
        collected: false,
      });
    }
  } else {
    applyPowerup(run.player, id);
  }

  run.checkpointChoices = null;
  run.checkpointTimer   = 0;
  state.screen = 'RUNNING';
}

/**
 * Pokreni sve sisteme za jedan frame.
 * Ako je screen === 'CHECKPOINT_SELECT': odbrojava timer i autoselect.
 * Sve ostalo se ne updateuje dok je pauziran.
 * @param {object} state  - Cijeli state objekat
 * @param {object} input  - Input snapshot { thrust, left, right }
 * @param {number} dt     - Delta time u sekundama
 */
export function updateSystems(state, input, dt) {
  const run = state.run;

  // ── CHECKPOINT_SELECT — samo odbrojava timer ─────────────────────────────
  if (state.screen === 'CHECKPOINT_SELECT') {
    if (run.checkpointTimer !== undefined && run.checkpointTimer > 0) {
      run.checkpointTimer -= dt;
      if (run.checkpointTimer <= 0) {
        // Autoselect prvi choice
        const choices = run.checkpointChoices;
        if (choices && choices.length > 0) {
          selectCheckpointPowerup(run, state, choices[0]);
        } else {
          state.screen = 'RUNNING';
        }
      }
    }
    return;
  }

  if (state.screen !== 'RUNNING') return;

  // ── Scroll speed raste s vremenom ────────────────────────────────────────
  run.scrollSpeed = Math.min(
    CONFIG.SCROLL_SPEED_MAX,
    run.scrollSpeed + CONFIG.SCROLL_ACCEL * dt,
  );

  // ── SLOW_TIME powerup: efektivni scroll za distance računanje ────────────
  const effectiveScroll = (run.player && run.player.powerups.slowTime > 0)
    ? run.scrollSpeed * 0.6
    : run.scrollSpeed;

  // ── Ažuriraj chunk-ove (pomeri, recikliraj, generiši nove) ───────────────
  updateChunks(run, effectiveScroll, dt);

  // ── Fizika broda ─────────────────────────────────────────────────────────
  updatePhysics(run.player, input, dt);

  // ── Pickups (magnet, rotacija, scroll, checkpoint trigger) ───────────────
  updatePickups(run.pickups, run.player, state.meta, effectiveScroll, dt);

  // ── Obstacles (scroll + animacija MOVING_GATE) ────────────────────────────
  scrollObstacles(run.obstacles, effectiveScroll, dt);
  updateObstacles(run.obstacles, dt);

  // ── Collision detection ───────────────────────────────────────────────────
  checkCollisions(run, state);

  // Ako je igrač poginuo u collision, preskoči ostatak logike ovog framea
  if (state.screen !== 'RUNNING') return;

  // ── Distance ─────────────────────────────────────────────────────────────
  run.distance += effectiveScroll * dt;

  // ── Multiplier rast ───────────────────────────────────────────────────────
  run.multiplierTimer = (run.multiplierTimer || 0) + dt;
  if (run.multiplierTimer >= CONFIG.MULTIPLIER_GROWTH_SEC) {
    run.multiplierTimer = 0;
    run.multiplier = Math.min(
      CONFIG.MULTIPLIER_CAP,
      run.multiplier + CONFIG.MULTIPLIER_STEP,
    );
  }

  // ── Score (distance-based; kristali dodaju direktno u checkCollisions) ───
  // Kristali su već dodati kao flat bonus u collision.js, ovde samo distance score
  const score2x = (run.player && run.player.powerups.score2x > 0) ? 2 : 1;
  run.score = Math.floor(
    (run.distance / CONFIG.SCORE_DIVISOR) * score2x * run.multiplier,
  ) + run.crystals * CONFIG.CRYSTAL_SCORE;

  // ── Player powerup tajmeri i Record Line uzorkovanje ─────────────────────
  if (run.player && run.player.alive) {
    updatePlayerPowerups(run.player, dt);
    updateRecordY(run.player, run);
  }

  // ── Checkpoint trigger ────────────────────────────────────────────────────
  if (run.nextCheckpoint === 0) {
    // Postavi prvi checkpoint prag na početku runa
    run.nextCheckpoint = CONFIG.CHECKPOINT_INTERVAL;
  }
  if (run.distance >= run.nextCheckpoint) {
    run.nextCheckpoint += CONFIG.CHECKPOINT_INTERVAL;
    run.checkpointChoices = selectPowerups(CONFIG.POWERUP_CHOICES);
    run.checkpointTimer   = CONFIG.POWERUP_SELECT_TIMEOUT;
    state.screen = 'CHECKPOINT_SELECT';
  }

  // ── Checkpoint pickup trigger (iz pickup.js triggered flag) ──────────────
  for (const pu of run.pickups) {
    if (pu.type === 'CHECKPOINT' && pu.triggered && !pu._processed) {
      pu._processed = true;
      // Checkpoint via spawn marker — koristimo distance-based sistem gore
    }
  }

  // ── Čisti van-ekrana i skupljene pickupe ─────────────────────────────────
  run.pickups = run.pickups.filter(p => !p.collected && p.x > -200);

  // ── Čisti van-ekrana obstacles ────────────────────────────────────────────
  run.obstacles = run.obstacles.filter(o => o.x + o.w > -100);

  // ── Ažuriraj particle čestice ─────────────────────────────────────────────
  for (const particle of run.particles) {
    particle.x  += particle.vx * dt;
    particle.y  += particle.vy * dt;
    particle.vy += 50 * dt; // blagi gravity
    particle.life -= dt;
  }
  run.particles = run.particles.filter(p => p.life > 0);
}
