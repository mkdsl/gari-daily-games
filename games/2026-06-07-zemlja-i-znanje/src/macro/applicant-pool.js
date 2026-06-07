/**
 * applicant-pool.js — Generator polaznika, demand po reputaciji
 */

import { ARCHETYPE_IDS, createParticipant } from '../content/participant-archetypes.js';
import { createRng, pick } from '../utils.js';

const BASE_POOL_SIZE = 8;
const POOL_PER_REP_100 = 3; // +3 kandidata na svakih 100 rep

/**
 * Generise pool kandidata za sezonu
 * @param {number} reputation
 * @param {number} maxParticipants
 * @param {number} seed
 * @param {number} extraPool — bonus od unlock-a
 */
export function generateApplicantPool(reputation, maxParticipants, seed = Date.now(), extraPool = 0) {
  const rng = createRng(seed);
  const poolSize = Math.min(
    BASE_POOL_SIZE + Math.floor(reputation / 100) * POOL_PER_REP_100 + extraPool,
    30
  );

  const pool = [];
  for (let i = 0; i < poolSize; i++) {
    const archetypeId = ARCHETYPE_IDS[Math.floor(rng() * ARCHETYPE_IDS.length)];
    pool.push(createParticipant(archetypeId, i, rng));
  }

  return pool;
}

/**
 * Filter pool da ne bude vise od maxParticipants
 * Prioritizuje raznolikost arhetipova
 */
export function selectParticipants(pool, count) {
  if (pool.length <= count) return pool;

  // Pokusaj da pokrije razlicite arhetipove
  const selected = [];
  const usedArchetypes = new Set();
  const remaining = [...pool];

  // Prvo jedna od svake
  for (const p of remaining) {
    if (!usedArchetypes.has(p.archetypeId) && selected.length < count) {
      selected.push(p);
      usedArchetypes.add(p.archetypeId);
    }
  }

  // Dopuni do count
  for (const p of remaining) {
    if (selected.length >= count) break;
    if (!selected.includes(p)) selected.push(p);
  }

  return selected.slice(0, count);
}
