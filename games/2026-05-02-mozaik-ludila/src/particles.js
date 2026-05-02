/**
 * particles.js — Particle sistem za match eksplozije u Mozaik Ludilu.
 *
 * Svaka čestica:
 *   - Počinje na centru matched ćelije
 *   - Leti u random smeru (0–360°) konstantnom brzinom (60–120 px/s)
 *   - Fade opacity 1 → 0 tokom PARTICLE_LIFETIME ms
 *   - Veličina: 4×4px kvadrat, boja = boja ćelije
 *   - Bez gravitacije — čisto linearna putanja
 *
 * State: partikle žive u state.particles kao array plain JS objekata:
 *   { x, y, vx, vy, color, life, maxLife }
 * Update i draw se pozivaju iz main.js / render.js.
 */

import {
  PARTICLE_COUNT, PARTICLE_LIFETIME,
  PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX, PARTICLE_SIZE,
} from './config.js';

/**
 * Generiše `PARTICLE_COUNT` čestica za jednu matched ćeliju i dodaje ih u array.
 *
 * @param {Object[]} particles — referenca na state.particles (muta ga direktno)
 * @param {number} cx — canvas X koordinata centra ćelije (logikalna, bez DPR)
 * @param {number} cy — canvas Y koordinata centra ćelije
 * @param {string} color — hex boja ćelije
 * @param {number} [count] — broj čestica (default: PARTICLE_COUNT)
 */
export function spawnParticles(particles, cx, cy, color, count) {
  const n = count ?? PARTICLE_COUNT;
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = PARTICLE_SPEED_MIN + Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN);
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: PARTICLE_LIFETIME,
      maxLife: PARTICLE_LIFETIME,
    });
  }
}

/**
 * Iscrtava sve aktivne čestice na ctx.
 * Pozivaj iz render.js na kraju render pasa (over the grid).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object[]} particles — state.particles
 */
export function drawParticles(ctx, particles) {
  if (particles.length === 0) return;

  const half = PARTICLE_SIZE / 2;
  for (const p of particles) {
    const opacity = p.life / p.maxLife;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - half, p.y - half, PARTICLE_SIZE, PARTICLE_SIZE);
  }
  ctx.globalAlpha = 1;
}
