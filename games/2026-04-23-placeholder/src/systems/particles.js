// src/systems/particles.js — Particle sistem: worker tačkice, resource pickup efekti

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
export function createParticle(type, x, y, opts) {}

/**
 * Spawn-uje burst čestica za resource pickup (hrana ili mineral).
 * @param {import('../state.js').GameState} state
 * @param {number} x - canvas koordinata
 * @param {number} y - canvas koordinata
 * @param {'HRANA'|'MINERAL'} resourceType
 * @param {number} amount
 * @returns {void}
 */
export function spawnResourcePickup(state, x, y, resourceType, amount) {}

/**
 * Spawn-uje worker tačkice koje hodaju između tunela i magacina.
 * @param {import('../state.js').GameState} state
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {void}
 */
export function spawnWorkerParticles(state, canvasWidth, canvasHeight) {}

/**
 * Spawn-uje prašinu bure po ivicama ekrana.
 * @param {import('../state.js').GameState} state
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {number} intensity - 0.0–1.0
 * @returns {void}
 */
export function spawnStormDust(state, canvasWidth, canvasHeight, intensity) {}

/**
 * Tick svih čestica — ažurira pozicije, smanjuje life, briše mrtve.
 * @param {import('../state.js').GameState} state
 * @param {number} dt
 * @returns {void}
 */
export function tickParticles(state, dt) {}

/**
 * Vraća sve žive čestice za render.
 * @param {import('../state.js').GameState} state
 * @returns {Particle[]}
 */
export function getParticles(state) {}
