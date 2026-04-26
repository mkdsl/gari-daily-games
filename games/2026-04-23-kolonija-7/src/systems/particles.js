// src/systems/particles.js — Particle sistem: worker tačkice, resource pickup efekti

import { CONFIG } from '../config.js';

/**
 * @typedef {'WORKER'|'FOOD_PICKUP'|'MINERAL_PICKUP'|'CRYSTAL_GLOW'|'STORM_DUST'} ParticleType
 */

/**
 * @typedef {{
 *   type: ParticleType,
 *   x: number,
 *   y: number,
 *   vx: number,
 *   vy: number,
 *   life: number,
 *   maxLife: number,
 *   size: number,
 *   color: string
 * }} Particle
 */

/**
 * Kreira novi particle objekat.
 * @param {ParticleType} type
 * @param {number} x
 * @param {number} y
 * @param {object} [opts]
 * @returns {Particle}
 */
export function createParticle(type, x, y, opts = {}) {
  const angle = opts.angle ?? Math.random() * Math.PI * 2;
  const speed = opts.speed ?? (0.5 + Math.random() * 1.5) * 30;
  const life  = opts.life  ?? 1.0;
  return {
    type,
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life,
    maxLife: opts.maxLife ?? life,
    size:  opts.size  ?? 2,
    color: opts.color ?? '#ffffff'
  };
}

/**
 * Spawn-uje burst čestica za resource pickup (hrana ili mineral).
 * @param {import('../state.js').GameState} state
 * @param {number} x - canvas koordinata
 * @param {number} y - canvas koordinata
 * @param {'HRANA'|'MINERAL'} resourceType
 * @param {number} amount
 * @returns {void}
 */
export function spawnResourcePickup(state, x, y, resourceType, amount) {
  const count = Math.min(6, Math.ceil(amount));
  const color = resourceType === 'HRANA' ? CONFIG.COLORS.FOOD : CONFIG.COLORS.MINERAL;
  for (let i = 0; i < count; i++) {
    const life = 0.6 + Math.random() * 0.4;
    state.particles.push(createParticle('FOOD_PICKUP', x, y, {
      angle:   -Math.PI / 2 + (Math.random() - 0.5) * Math.PI,
      speed:   20 + Math.random() * 40,
      life,
      maxLife: life,
      size:    2 + Math.random() * 2,
      color
    }));
  }
}

/**
 * Spawn-uje worker tačkice koje hodaju između tunela.
 * @param {import('../state.js').GameState} state
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {void}
 */
export function spawnWorkerParticles(state, canvasWidth, canvasHeight) {
  if (state.workers.count <= 0) return;

  // Skupi sve tunel ćelije
  const tunnels = [];
  for (let r = 0; r < state.grid.length; r++) {
    for (let c = 0; c < state.grid[r].length; c++) {
      if (state.grid[r][c].type === 'TUNEL') tunnels.push({ c, r });
    }
  }
  if (tunnels.length === 0) return;

  const count = Math.min(2, Math.floor(state.workers.count / 3) + 1);
  const cellSize = CONFIG.CELL_SIZE;
  const gridW = CONFIG.GRID_COLS * cellSize;
  const gridH = CONFIG.GRID_ROWS * cellSize;
  const offsetX = Math.floor((canvasWidth  - gridW) / 2);
  const offsetY = Math.floor((canvasHeight - gridH) / 2) + 30;

  for (let i = 0; i < count; i++) {
    const t = tunnels[Math.floor(Math.random() * tunnels.length)];
    const x = offsetX + t.c * cellSize + cellSize / 2;
    const y = offsetY + t.r * cellSize + cellSize / 2;

    // Usmer prema centru grida
    const cx = offsetX + gridW / 2;
    const cy = offsetY + gridH / 2;
    const dx = cx - x, dy = cy - y;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;

    const life = 1.2 + Math.random() * 0.5;
    state.particles.push(createParticle('WORKER', x, y, {
      angle,
      speed:   15 + Math.random() * 20,
      life,
      maxLife: life,
      size:    2,
      color:   CONFIG.COLORS.WORKER
    }));
  }
}

/**
 * Spawn-uje prašinu bure po ivicama ekrana.
 * @param {import('../state.js').GameState} state
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {number} intensity - 0.0–1.0
 * @returns {void}
 */
export function spawnStormDust(state, canvasWidth, canvasHeight, intensity) {
  if (intensity < 0.1) return;
  const count = Math.floor(intensity * 3);
  for (let i = 0; i < count; i++) {
    const x = -10;
    const y = Math.random() * canvasHeight * 0.7;
    const life = 1.0 + Math.random() * 0.5;
    state.particles.push(createParticle('STORM_DUST', x, y, {
      angle:   0.1 + (Math.random() - 0.5) * 0.3,
      speed:   80 + Math.random() * 60,
      life,
      maxLife: life,
      size:    1 + Math.random() * 2,
      color:   CONFIG.COLORS.STORM_SAND
    }));
  }
}

/**
 * Tick svih čestica — ažurira pozicije, smanjuje life, briše mrtve.
 * @param {import('../state.js').GameState} state
 * @param {number} dt
 * @returns {void}
 */
export function tickParticles(state, dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x  += p.vx * dt;
    p.y  += p.vy * dt;
    p.vy += 10 * dt; // blaga gravitacija
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

/**
 * Vraća sve žive čestice za render.
 * @param {import('../state.js').GameState} state
 * @returns {Particle[]}
 */
export function getParticles(state) {
  return state.particles;
}
