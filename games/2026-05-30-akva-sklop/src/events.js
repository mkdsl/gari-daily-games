/**
 * events.js — Akva-Sklop
 * Event scheduling and application.
 * Events are pre-scheduled at run start using a seeded LCG RNG.
 */

import {
  EVENT_TYPES,
  DIFFICULTY,
  PH_MIN,
  PH_MAX,
} from './config.js';

// ---------------------------------------------------------------------------
// Seedable LCG RNG
// ---------------------------------------------------------------------------

/**
 * Linear Congruential Generator step.
 * Returns [nextSeed, randomFloat 0–1].
 */
function lcgStep(seed) {
  const next = ((seed * 1664525 + 1013904223) >>> 0); // keep 32-bit unsigned
  return [next, next / 0x100000000];
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

/**
 * Generate a pseudo-random seed for a new run.
 * @returns {number}
 */
export function generateSeed() {
  return Math.floor(Math.random() * 999999);
}

/**
 * Schedule events for the whole run up-front.
 * @param {string|object} difficulty  difficulty id or object
 * @param {number}        seed
 * @returns {Array<{type:string, triggerWeek:number, params:object}>}
 */
export function scheduleEvents(difficulty, seed) {
  const diff = typeof difficulty === 'string'
    ? (DIFFICULTY[difficulty] || DIFFICULTY['fazaA'])
    : difficulty;

  const maxEvents = diff.maxEvents || 0;
  if (maxEvents === 0) return [];

  // Candidate event types (exclude DROUGHT_BREAK — auto-appended after DROUGHT)
  const candidates = Object.values(EVENT_TYPES).filter(et => {
    if (et.id === 'drought_break') return false;
    if (et.difficulty && et.difficulty !== diff.id) return false;
    return true;
  });

  // Build weighted pool
  const pool = [];
  for (const et of candidates) {
    for (let w = 0; w < (et.weight || 10); w++) {
      pool.push(et);
    }
  }

  let rng = seed;
  const scheduled = [];
  const usedWeeks = new Set();

  for (let i = 0; i < maxEvents; i++) {
    if (pool.length === 0) break;

    // Pick event type
    let r;
    [rng, r] = lcgStep(rng);
    const et = pool[Math.floor(r * pool.length)];

    // Pick trigger week in valid range
    const minW = et.minWeek || 2;
    const maxW = et.maxWeek || 11;
    let tries = 20;
    let week = -1;
    while (tries-- > 0) {
      [rng, r] = lcgStep(rng);
      const candidate = minW + Math.floor(r * (maxW - minW + 1));
      if (!usedWeeks.has(candidate)) {
        week = candidate;
        break;
      }
    }
    if (week < 0) continue; // couldn't find a free week

    usedWeeks.add(week);
    scheduled.push({ type: et.id, triggerWeek: week, params: {} });

    // Auto-append DROUGHT_BREAK after DROUGHT
    if (et.id === 'drought') {
      const breakWeek = week + EVENT_TYPES.DROUGHT_BREAK.delay;
      if (breakWeek <= 12) {
        scheduled.push({ type: 'drought_break', triggerWeek: breakWeek, params: {} });
        usedWeeks.add(breakWeek);
      }
    }
  }

  scheduled.sort((a, b) => a.triggerWeek - b.triggerWeek);
  return scheduled;
}

// ---------------------------------------------------------------------------
// Runtime access
// ---------------------------------------------------------------------------

/**
 * Return the event that should fire this week, or null.
 * @param {Array}  events       scheduled event list
 * @param {number} currentWeek
 * @returns {object|null}
 */
export function getActiveEvent(events, currentWeek) {
  return events.find(e => e.triggerWeek === currentWeek) || null;
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

/**
 * Apply an event's side-effects to state.
 * @param {object} state   mutable game state
 * @param {object} event   { type, triggerWeek, params }
 * @returns {object} state (same reference, mutated)
 */
export function applyEvent(state, event) {
  const diff = DIFFICULTY[state.difficulty] || DIFFICULTY['fazaA'];

  switch (event.type) {
    case 'drought':
      state.source.rate *= 0.5;
      state.activeEvent = { type: 'drought', weeksLeft: EVENT_TYPES.DROUGHT.duration };
      break;

    case 'drought_break':
      state.source.rate = diff.sourceRate;
      state.activeEvent = null;
      break;

    case 'duck_migration': {
      // Add 6 ducks to the lake with the highest current capacity
      const lakeIds = ['A', 'B', 'C'];
      let target = lakeIds.reduce((best, id) =>
        state.lakes[id].capacity > state.lakes[best].capacity ? id : best, 'A');
      state.lakes[target].ducks += EVENT_TYPES.DUCK_MIGRATION.duckBonus;
      event.params.targetLake = target;
      break;
    }

    case 'forest_runoff': {
      const lake = state.lakes['C'];
      lake.pH = Math.max(PH_MIN, lake.pH + EVENT_TYPES.FOREST_RUNOFF.pHDelta);
      break;
    }

    case 'heavy_rain': {
      for (const id of ['A', 'B', 'C']) {
        const lake = state.lakes[id];
        lake.level = Math.min(lake.capacity, lake.level + EVENT_TYPES.HEAVY_RAIN.levelBonus);
      }
      break;
    }

    default:
      console.warn('[events] Unknown event type:', event.type);
  }

  return state;
}

// ---------------------------------------------------------------------------
// Descriptions
// ---------------------------------------------------------------------------

/**
 * Human-readable event description in Serbian.
 * @param {string} eventType
 * @returns {string}
 */
export function getEventDescription(eventType) {
  const descriptions = {
    drought:        'Suša: izvor na 50% kapaciteta tokom 2 nedelje.',
    drought_break:  'Kraj suše: protok se vraća na normalu.',
    duck_migration: 'Jato pataka: +6 pataka stiglo u jezero!',
    forest_runoff:  'Šumska kontaminacija: pH Jezera C pada za 0.8.',
    heavy_rain:     'Jak kiša: sva jezera dobijaju +30L instant.',
  };
  return descriptions[eventType] || 'Nepoznat događaj.';
}
