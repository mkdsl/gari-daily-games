/**
 * event_engine.js — Daily event draw (0–2 per day), event resolution, BARREL_FAIL listener.
 */

import { EVENTS_DATA } from '../content/events_data.js';
import { EVENTS_PER_DAY } from '../config.js';

/**
 * Izvlači dnevne događaje na osnovu state-a.
 * @param {object} state
 * @returns {Array} Lista EventCard objekata za tekući dan
 */
export function drawDailyEvents(state) {
  const count = EVENTS_PER_DAY.min + Math.floor(
    Math.random() * (EVENTS_PER_DAY.max - EVENTS_PER_DAY.min + 1)
  );

  if (count === 0) return [];

  // Filtriraj relevantne događaje (neki su uslovljeni state-om)
  const eligible = EVENTS_DATA.filter(e => isEventEligible(e, state));

  // Shuffle i uzmi prvih 'count'
  const shuffled = eligible.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, eligible.length));
}

/**
 * Proverava da li je event eligibilan za trenutni state.
 * @param {object} eventDef
 * @param {object} state
 * @returns {boolean}
 */
function isEventEligible(eventDef, state) {
  if (eventDef.requires_bacva && state.bačva_status !== 'fermenting') return false;
  if (eventDef.requires_rakija && !state.unlocks.rakija) return false;
  if (eventDef.min_day && state.day < eventDef.min_day) return false;
  if (eventDef.max_day && state.day > eventDef.max_day) return false;
  return true;
}

/**
 * Primenjuje immediate event (bez izbora igrača).
 * @param {object} event
 * @param {object} state
 * @param {object} persistent
 * @returns {{ state: object, persistent: object }}
 */
export function resolveImmediateEvent(event, state, persistent) {
  if (!event.immediate || !event.effect) return { state, persistent };
  return event.effect(state, persistent);
}

/**
 * Primenjuje izabrani event sa izborom igrača.
 * @param {object} state
 * @param {string} eventId - Id eventa (npr. 'komsija_menja')
 * @param {number} choice - 0 = prihvati, 1 = odbij
 * @param {object} [persistent]
 * @returns {{ state: object, persistent: object }}
 */
export function resolveEvent(state, eventId, choice, persistent = {}) {
  const eventDef = EVENTS_DATA.find(e => e.id === eventId);
  if (!eventDef) return { state, persistent };

  // Immediate events (no choice)
  if (eventDef.immediate && eventDef.effect) {
    return eventDef.effect(state, persistent);
  }

  // Choice-based events
  const choices = eventDef.choices || [];
  const selected = choices[choice];
  if (!selected || !selected.effect) return { state, persistent };

  return selected.effect(state, persistent);
}

/**
 * Emituje BARREL_FAIL event ako bačva propada.
 * Poziva se iz barrel_init.js kad status ide na 'failed'.
 * @param {object} state
 * @returns {object} State sa BARREL_FAIL eventom u today_events
 */
export function triggerBarrelFail(state) {
  const failEvent = EVENTS_DATA.find(e => e.id === 'bacva_ko');
  if (!failEvent) return state;
  return {
    ...state,
    today_events: [...state.today_events, failEvent]
  };
}
