// events.js — dynamic events system
import { EVENT_POOL } from '../content/events-pool.js';
import { warningBleep } from '../audio.js';

// Seeded pseudo-random (LCG)
function seededRand(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xFFFFFFFF;
  };
}

export function tickEvents(state, dt) {
  // Age existing events
  state.dynamicEvents = state.dynamicEvents.filter(ev => {
    ev.elapsed += dt;
    return ev.elapsed < ev.duration;
  });

  // Possibly spawn new event based on seeded random
  const tickSeed = Math.floor(state.gameTime * 10) + (state.currentLevel * 1000);
  const rng = seededRand(tickSeed);
  const roll = rng();

  // Spawn probability: ~1 event per 15 real-seconds on average
  if (roll < dt / 15) {
    const pool = EVENT_POOL.filter(e => !state.dynamicEvents.find(a => a.id === e.id));
    if (pool.length > 0) {
      const idx = Math.floor(rng() * pool.length);
      const template = pool[idx];
      const newEvent = {
        ...template,
        elapsed: 0,
        startTime: state.gameTime
      };
      state.dynamicEvents.push(newEvent);
      warningBleep();
      return newEvent;
    }
  }
  return null;
}

export function getActiveEventModifiers(state) {
  const mods = {
    windBonus: 0,
    happinessMult: 1.0,
    neighborLimitDelta: 0,
    zoneDbPenalty: 0,
    mediaBonus: false,
    reflectionBonus: 0,
    requestDb: 0
  };
  for (const ev of state.dynamicEvents) {
    if (ev.windBonus) mods.windBonus += ev.windBonus;
    if (ev.happinessMult) mods.happinessMult *= ev.happinessMult;
    if (ev.neighborLimit) mods.neighborLimitDelta += ev.neighborLimit;
    if (ev.zoneDbPenalty) mods.zoneDbPenalty += ev.zoneDbPenalty;
    if (ev.mediaBonus) mods.mediaBonus = true;
    if (ev.reflectionBonus) mods.reflectionBonus += ev.reflectionBonus;
    if (ev.requestDb) mods.requestDb += ev.requestDb;
  }
  return mods;
}
