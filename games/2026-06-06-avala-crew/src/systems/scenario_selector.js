/**
 * scenario_selector.js — Semi-proceduralni scenario selector
 * Seeded random baziran na date + careerTier + nightNumber
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { SCENARIOS_DATA, SCENARIO_POOLS } from '../content/scenarios_data.js';
import { SCENARIOS_PER_NIGHT, PHASE_SCENARIO_COUNT } from '../config.js';

/**
 * Simple seeded pseudo-random number generator (Mulberry32)
 * @param {number} seed
 * @returns {function(): number} Returns function that generates [0, 1)
 */
function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simple hash function for strings
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Shuffle array using seeded RNG (Fisher-Yates)
 * @param {any[]} arr
 * @param {function(): number} rng
 * @returns {any[]}
 */
function seededShuffle(arr, rng) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select 10 scenarios for a night using seeded randomness
 * Rules:
 *   Gathering (3): guaranteed 1 L, 1 S/E, 1 random from S01-S08
 *   Peak (4): guaranteed 1 P, 1 S, 1 E/L, 1 random (Bond3 priority)
 *   Departure (3): always R04, 2 random from R01/R02/R03/R05
 *
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {number} careerTier - 0-3
 * @param {number} nightNumber - Total completed nights
 * @param {string[]} crewIds - Current crew member IDs
 * @param {Object} bondLevels - Bond level map from state
 * @returns {string[]} Array of 10 scenario IDs
 */
export function selectNightScenarios(date, careerTier, nightNumber, crewIds, bondLevels) {
  const seedString = `${date}-${careerTier}-${nightNumber}`;
  const seed = hashString(seedString);
  const rng = createRng(seed);

  const selected = [];

  // ── GATHERING PHASE (3 scenarios) ────────────────────────────
  const gatheringPool = [...SCENARIO_POOLS.gathering];
  const shuffledGathering = seededShuffle(gatheringPool, rng);

  // Guaranteed: 1 L type
  const lGathering = shuffledGathering.find(id => SCENARIOS_DATA[id]?.type === 'L');
  if (lGathering) selected.push(lGathering);

  // Guaranteed: 1 S or E type (not already selected)
  const seGathering = shuffledGathering.find(id =>
    !selected.includes(id) &&
    (SCENARIOS_DATA[id]?.type === 'S' || SCENARIOS_DATA[id]?.type === 'E')
  );
  if (seGathering) selected.push(seGathering);

  // 1 random remaining from gathering
  const remainingGathering = shuffledGathering.filter(id => !selected.includes(id));
  if (remainingGathering.length > 0) {
    selected.push(remainingGathering[0]);
  }

  // Pad gathering to exactly 3 if needed
  while (selected.length < 3 && shuffledGathering.length > selected.length) {
    const fallback = shuffledGathering.find(id => !selected.includes(id));
    if (fallback) selected.push(fallback);
    else break;
  }

  // ── PEAK PHASE (4 scenarios) ─────────────────────────────────
  const peakPool = [...SCENARIO_POOLS.peak];
  const shuffledPeak = seededShuffle(peakPool, rng);
  const peakSelected = [];

  // Guaranteed: 1 P type
  const pPeak = shuffledPeak.find(id => SCENARIOS_DATA[id]?.type === 'P');
  if (pPeak) peakSelected.push(pPeak);

  // Guaranteed: 1 S type
  const sPeak = shuffledPeak.find(id =>
    !peakSelected.includes(id) &&
    SCENARIOS_DATA[id]?.type === 'S'
  );
  if (sPeak) peakSelected.push(sPeak);

  // Guaranteed: 1 E or L type
  const elPeak = shuffledPeak.find(id =>
    !peakSelected.includes(id) &&
    (SCENARIOS_DATA[id]?.type === 'E' || SCENARIOS_DATA[id]?.type === 'L')
  );
  if (elPeak) peakSelected.push(elPeak);

  // Check for high-bond scenarios (priority if crew has bond level 3 pairs)
  const hasBond3 = bondLevels && Object.values(bondLevels).some(b => b.bondLevel >= 3);

  // 1 more random from peak (prioritize X type if bond3, otherwise random)
  let lastPeak;
  if (hasBond3) {
    lastPeak = shuffledPeak.find(id =>
      !peakSelected.includes(id) && SCENARIOS_DATA[id]?.type === 'X'
    );
  }
  if (!lastPeak) {
    lastPeak = shuffledPeak.find(id => !peakSelected.includes(id));
  }
  if (lastPeak) peakSelected.push(lastPeak);

  // Pad to 4 if needed
  while (peakSelected.length < 4) {
    const fallback = shuffledPeak.find(id => !peakSelected.includes(id));
    if (fallback) peakSelected.push(fallback);
    else break;
  }

  selected.push(...peakSelected.slice(0, 4));

  // ── DEPARTURE PHASE (3 scenarios) ────────────────────────────
  // R04 always included (the "after party?" scenario)
  selected.push('R04');

  // 2 random from R01, R02, R03, R05 (not R04 again)
  const departurePool = SCENARIO_POOLS.departure.filter(id => id !== 'R04');
  const shuffledDeparture = seededShuffle(departurePool, rng);
  selected.push(shuffledDeparture[0]);
  if (shuffledDeparture.length > 1) selected.push(shuffledDeparture[1]);

  // ── VALIDATE: ensure exactly 10 unique scenarios ─────────────
  const unique = [...new Set(selected)];

  // If somehow we have less than 10 (shouldn't happen with full data)
  while (unique.length < SCENARIOS_PER_NIGHT) {
    const allIds = Object.keys(SCENARIOS_DATA);
    const fallback = allIds.find(id => !unique.includes(id));
    if (fallback) unique.push(fallback);
    else break;
  }

  return unique.slice(0, SCENARIOS_PER_NIGHT);
}

/**
 * Generate a night seed for the current night
 * @param {string} date
 * @param {number} careerTier
 * @param {number} nightNumber
 * @returns {number}
 */
export function generateNightSeed(date, careerTier, nightNumber) {
  return hashString(`${date}-${careerTier}-${nightNumber}`);
}

/**
 * Get the phase order for 10 scenarios
 * Returns array of phase labels per scenario index
 * @returns {string[]}
 */
export function getScenarioPhaseOrder() {
  return [
    'gathering', 'gathering', 'gathering',  // 0-2
    'peak', 'peak', 'peak', 'peak',          // 3-6
    'departure', 'departure', 'departure'   // 7-9
  ];
}

/**
 * Get which scenarios are in each phase
 * @param {string[]} scenarioIds - 10 scenario IDs
 * @returns {{gathering: string[], peak: string[], departure: string[]}}
 */
export function splitByPhase(scenarioIds) {
  return {
    gathering: scenarioIds.slice(0, 3),
    peak: scenarioIds.slice(3, 7),
    departure: scenarioIds.slice(7, 10)
  };
}
