/**
 * easter-eggs.js — Seed-based daily egg generation, click detection, collection
 * Park Mapa | Jova jQuery
 *
 * 40 predefined hotspot positions across the full canvas (900×540).
 * 7 eggs per day, positions chosen deterministically from hotspots via seeded RNG.
 * Same seed = same positions every time until calendar date changes.
 */

import { CONFIG } from '../config.js';

// ─── 40 predefined hotspot positions across the 3×3 zone grid ─────────────────
// Cells mapped to approximate pixel areas (900×540 canvas, zones start near y=40)
// Col bands: col0=20-280, col1=300-580, col2=600-880
// Row bands: row0=50-175, row1=195-305, row2=325-430
// 6 hotspots in active (row0) zones, 4 in row1, 3 in row2, summing to 40.
const HOTSPOTS = (function buildHotspots() {
  /** @type {{x:number, y:number}[]} */
  const spots = [];

  const cells = [
    // Row 0 — active zones
    { xMin: 20,  xMax: 280, yMin: 55,  yMax: 175 }, // pult
    { xMin: 300, xMax: 580, yMin: 55,  yMax: 175 }, // bina
    { xMin: 600, xMax: 880, yMin: 55,  yMax: 175 }, // suma
    // Row 1 — locked V1
    { xMin: 20,  xMax: 280, yMin: 195, yMax: 305 }, // jezero
    { xMin: 300, xMax: 580, yMin: 195, yMax: 305 }, // kafana
    { xMin: 600, xMax: 880, yMin: 195, yMax: 305 }, // arene
    // Row 2 — locked V1/S2
    { xMin: 20,  xMax: 280, yMin: 325, yMax: 430 }, // staklenici
    { xMin: 300, xMax: 580, yMin: 325, yMax: 430 }, // cuvarica
    { xMin: 600, xMax: 880, yMin: 325, yMax: 430 }, // biblioteka
  ];

  // Points per cell — total must equal 40.
  // Active row gets more spots (6 each), middle row 4 each, bottom row 3 each, but
  // 6+6+6 = 18, 4+4+4 = 12, 3+3+4 = 10  → 40 total.
  const perCell = [6, 6, 6, 4, 4, 4, 3, 3, 4];

  // Up to 6 fixed fractional offsets [fx, fy] within each cell.
  // Using static fractions so the hotspot array is fully deterministic
  // (no runtime randomness, not affected by engine changes).
  const OFFSETS = [
    [0.15, 0.20], [0.45, 0.15], [0.75, 0.30],
    [0.25, 0.65], [0.60, 0.70], [0.85, 0.50],
  ];

  cells.forEach((cell, ci) => {
    const count = perCell[ci];
    const cw = cell.xMax - cell.xMin;
    const ch = cell.yMax - cell.yMin;
    for (let i = 0; i < count; i++) {
      const [fx, fy] = OFFSETS[i % OFFSETS.length];
      spots.push({
        x: Math.round(cell.xMin + fx * cw),
        y: Math.round(cell.yMin + fy * ch),
      });
    }
  });

  return spots;
}());

// ─── Seeded PRNG (xorshift32) ─────────────────────────────────────────────────
/**
 * Returns a PRNG function from a numeric seed.
 * Each call to the returned function yields a pseudo-random float in [0, 1).
 * @param {number} seed  Must be a non-zero 32-bit unsigned integer.
 * @returns {() => number}
 */
function seededRandom(seed) {
  let s = (seed >>> 0) || 1; // Guard against 0
  return function rng() {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using the provided RNG.
 * Returns a new shuffled array; source array is not mutated.
 * @template T
 * @param {T[]} arr
 * @param {() => number} rng
 * @returns {T[]}
 */
function fisherYates(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate the daily egg set for a given date string.
 * Fully deterministic: same dateStr always produces the same 7 eggs.
 *
 * @param {string} dateStr  'YYYY-MM-DD'
 * @returns {Array<{id:string, x:number, y:number, type:object, ptValue:number, collected:boolean}>}
 */
export function generateDailyEggs(dateStr) {
  // Convert 'YYYY-MM-DD' → integer seed, e.g. '2026-06-13' → 20260613
  const seed = parseInt(dateStr.replace(/-/g, ''), 10);
  const rng = seededRandom(seed);

  // Shuffle all hotspots and take the first EGGS_PER_DAY
  const shuffled = fisherYates(HOTSPOTS, rng);
  const chosen = shuffled.slice(0, CONFIG.EGGS_PER_DAY);

  // Assign type and PT value (also seed-derived, so reload-proof)
  return chosen.map((pos, i) => {
    const typeIndex = Math.floor(rng() * CONFIG.EGG_TYPES.length);
    const ptRange = CONFIG.PT_REWARDS.EGG_MAX - CONFIG.PT_REWARDS.EGG_MIN;
    const ptValue = CONFIG.PT_REWARDS.EGG_MIN + Math.floor(rng() * (ptRange + 1));

    return {
      id: `egg_${dateStr}_${i}`,
      x: pos.x,
      y: pos.y,
      type: CONFIG.EGG_TYPES[typeIndex],
      ptValue,
      collected: false,
    };
  });
}

/**
 * Return the egg array for today, generating it if absent.
 * Mutates state.eggs in place.
 *
 * @param {{ eggs: Object.<string, Array> }} state
 * @param {string} dateStr  'YYYY-MM-DD'
 * @returns {Array}
 */
export function getDailyEggsState(state, dateStr) {
  if (!state.eggs) state.eggs = {};
  if (!state.eggs[dateStr]) {
    state.eggs[dateStr] = generateDailyEggs(dateStr);
  }
  return state.eggs[dateStr];
}

/**
 * Mark an egg as collected, earn PT, emit event.
 *
 * @param {Object} state
 * @param {string} eggId
 * @param {string} dateStr
 * @param {((event:string, data:any) => void)|null} emit
 * @returns {number}  PT earned (0 if already collected or not found)
 */
export function collectEgg(state, eggId, dateStr, emit) {
  const eggs = getDailyEggsState(state, dateStr);
  const egg = eggs.find(e => e.id === eggId);
  if (!egg || egg.collected) return 0;

  egg.collected = true;

  if (emit) {
    emit('eggCollected', { egg, ptValue: egg.ptValue });
  }

  return egg.ptValue;
}

/**
 * Count how many eggs have been collected today.
 * @param {Object} state
 * @param {string} dateStr
 * @returns {number}
 */
export function getCollectedEggCount(state, dateStr) {
  if (!state.eggs || !state.eggs[dateStr]) return 0;
  return state.eggs[dateStr].filter(e => e.collected).length;
}

/**
 * Count eggs collected across all days.
 * @param {Object} state
 * @returns {number}
 */
export function getTotalEggsCollected(state) {
  if (!state.eggs) return 0;
  return Object.values(state.eggs).reduce(
    (sum, dayEggs) => sum + dayEggs.filter(e => e.collected).length,
    0,
  );
}

/**
 * Hit-test a point (x, y) against uncollected eggs.
 * Returns the first matching egg, or null.
 *
 * @param {Array} eggs  Array of egg objects for the current day
 * @param {number} x
 * @param {number} y
 * @param {number} [radius]  Touch/click hit radius in px (default: EGG_HIT_RADIUS from CONFIG or 12)
 * @returns {Object|null}
 */
export function checkEggClick(eggs, x, y, radius = CONFIG.EGG_HIT_RADIUS ?? 12) {
  for (const egg of eggs) {
    if (egg.collected) continue;
    const dx = egg.x - x;
    const dy = egg.y - y;
    if (dx * dx + dy * dy <= radius * radius) return egg;
  }
  return null;
}

/**
 * Expose the full hotspot list for debug / render overlay purposes.
 * @returns {ReadonlyArray<{x:number, y:number}>}
 */
export function getHotspots() {
  return HOTSPOTS;
}
