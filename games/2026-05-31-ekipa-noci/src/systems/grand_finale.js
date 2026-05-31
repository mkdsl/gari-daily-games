/**
 * @file grand_finale.js
 * Seeded random selection of Grand Finale preferred_tags.
 * Seed = date integer (YYYYMMDD) XOR cumulative_xp.
 * This ensures each player on the same day with same XP sees the same finale
 * BUT players with different progression levels see different challenges.
 */

import { GRAND_FINALE_TAG_POOL, GRAND_FINALE_TAG_COUNT } from '../config.js';
import { getState } from '../state.js';

// ---------------------------------------------------------------------------
// Seeded PRNG: mulberry32
// ---------------------------------------------------------------------------

/**
 * Create a mulberry32 PRNG from a 32-bit seed.
 * @param {number} seed
 * @returns {() => number}  Returns float in [0, 1)
 */
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Seed construction
// ---------------------------------------------------------------------------

/**
 * Build the finale seed from a date string (YYYY-MM-DD) and cumulative XP.
 * @param {string} dateStr  ISO date string, e.g. '2026-05-31'
 * @param {number} cumulativeXp
 * @returns {number}  32-bit unsigned seed
 */
export function buildFinaleSeed(dateStr, cumulativeXp) {
  // Parse date → integer YYYYMMDD
  const parts = dateStr.replace(/-/g, '');
  const dateInt = parseInt(parts, 10) || 20260531;

  // XOR with XP to make each progression path unique
  return (dateInt ^ (cumulativeXp | 0)) >>> 0;
}

/**
 * Build seed using today's date (runtime).
 * @param {number} cumulativeXp
 * @returns {number}
 */
export function buildTodaySeed(cumulativeXp) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return buildFinaleSeed(`${y}-${m}-${d}`, cumulativeXp);
}

// ---------------------------------------------------------------------------
// Tag selection
// ---------------------------------------------------------------------------

/**
 * Select GRAND_FINALE_TAG_COUNT tags from GRAND_FINALE_TAG_POOL using the
 * given seed. No repeats. Order is deterministic for equal seeds.
 *
 * @param {number} seed
 * @param {string[]} [pool]   Override pool (defaults to GRAND_FINALE_TAG_POOL)
 * @param {number}  [count]  Override count (defaults to GRAND_FINALE_TAG_COUNT)
 * @returns {string[]}
 */
export function seededFinaleTagPick(seed, pool, count) {
  const tagPool = pool ?? [...GRAND_FINALE_TAG_POOL];
  const tagCount = count ?? GRAND_FINALE_TAG_COUNT;
  const rand = mulberry32(seed);

  // Fisher-Yates partial shuffle to pick tagCount items
  const arr = [...tagPool];
  const result = [];

  for (let i = 0; i < Math.min(tagCount, arr.length); i++) {
    const j = i + Math.floor(rand() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
    result.push(arr[i]);
  }

  return result;
}

/**
 * Main entry point: generate finale preferred_tags for the current run.
 * Reads cumulative_xp from state, uses today's date.
 *
 * @param {number} [xpOverride]  Provide XP directly (for testing)
 * @param {string} [dateOverride] Provide date string (for testing)
 * @returns {string[]}
 */
export function generateFinalePreferredTags(xpOverride, dateOverride) {
  const state = getState();
  const xp = xpOverride ?? state.cumulative_xp;

  let seed;
  if (dateOverride) {
    seed = buildFinaleSeed(dateOverride, xp);
  } else {
    seed = buildTodaySeed(xp);
  }

  return seededFinaleTagPick(seed);
}

// ---------------------------------------------------------------------------
// Preview helpers (for Codex / UI)
// ---------------------------------------------------------------------------

/**
 * Return all possible tags in the Grand Finale pool.
 * Used by UI to tease the possible outcomes.
 * @returns {string[]}
 */
export function getFinaleTagPool() {
  return [...GRAND_FINALE_TAG_POOL];
}

/**
 * Check if a given tag could appear in the Grand Finale.
 * @param {string} tag
 * @returns {boolean}
 */
export function isFinalePoolTag(tag) {
  return GRAND_FINALE_TAG_POOL.includes(tag);
}

/**
 * Given a seed, return ALL possible 2-tag combinations and how likely each
 * tag is to appear. Purely informational for analytics / debugging.
 *
 * @param {number} seed
 * @returns {{ tags: string[], seed: number }}
 */
export function debugFinalePick(seed) {
  const tags = seededFinaleTagPick(seed);
  return { tags, seed };
}
