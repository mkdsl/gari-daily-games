/**
 * systems/index.js — Orkestrator svih sistema za Bespuće
 * Redosled poziva: chunks → physics → pickups → obstacles → collision
 * Eksportuje: updateSystems
 */
import { updatePhysics } from './physics.js';
import { updateChunks } from './chunks.js';
import { checkCollisions } from './collision.js';
import { updateObstacles, scrollObstacles } from '../entities/obstacle.js';
import { updatePickups } from '../entities/pickup.js';

/**
 * Pokreni sve sisteme za jedan frame (samo kad je screen === 'RUNNING').
 * @param {object} state  - Cijeli state objekat
 * @param {object} input  - Input snapshot
 * @param {number} dt     - Delta time u sekundama
 */
export function updateSystems(state, input, dt) {
  if (state.screen !== 'RUNNING') return;
  const run = state.run;
  updateChunks(run, run.scrollSpeed, dt);
  updatePhysics(run.player, input, dt);
  scrollObstacles(run.obstacles, run.scrollSpeed, dt);
  updateObstacles(run.obstacles, dt);
  updatePickups(run.pickups, run.player, run.scrollSpeed, dt);
  checkCollisions(run, state);
}
