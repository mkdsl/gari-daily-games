// events.js — Random event system

import { EVENT_POOL } from '../config.js';

/**
 * Roll for a random event
 * @param {string} city_id
 * @param {Array} crew_in_hand - array of role strings currently in the block
 * @param {boolean} prestige_mode
 * @param {number} event_reduce - synergy-based event chance reduction (0-1)
 * @returns {null | { event, mitigated: bool, effect: fn }}
 */
export function rollEvent(city_id, crew_in_hand, prestige_mode, event_reduce = 0) {
  // Filter events relevant to this city
  const eligible = EVENT_POOL.filter(e => {
    if (e.cities.includes('all')) return true;
    return e.cities.includes(city_id);
  });

  // Roll each eligible event
  for (const event of eligible) {
    let chance = event.chance;

    // Prestige mode reduces negative events by 30%
    if (prestige_mode) chance *= 0.7;

    // Synergy-based event reduction (Security+MC = -50%)
    chance *= (1 - event_reduce);

    if (Math.random() < chance) {
      const mitigated = crew_in_hand.includes(event.mitigates);
      return {
        event,
        mitigated,
        effectApplied: false
      };
    }
  }

  return null;
}

/**
 * Apply an event's effect to event_state
 * @param {Object} eventResult - from rollEvent
 * @param {Object} event_state - will be mutated
 * @returns {Object} { event_state (mutated), description: string }
 */
export function applyEvent(eventResult, event_state, tourney_state) {
  if (!eventResult || eventResult.mitigated) {
    if (eventResult && eventResult.mitigated) {
      return {
        description: `${eventResult.event.label} mitigovan! Crew je bio spreman.`,
        mitigated: true
      };
    }
    return { description: '', mitigated: false };
  }

  const { event } = eventResult;
  let description = `${event.label}: ${event.desc}`;

  switch (event.effectKey) {
    case 'fanScore*0.6':
      event_state.fan_score = Math.floor(event_state.fan_score * 0.6);
      description += ` Fan score -40%.`;
      break;

    case 'crowd*0.8':
      event_state.fan_score = Math.floor(event_state.fan_score * 0.8);
      description += ` Crowd -20%.`;
      break;

    case 'miss2xmedia':
      event_state.media_coverage = Math.floor(event_state.media_coverage * 0.5);
      description += ` Media coverage prepolovljen.`;
      break;

    case 'reputation-10':
      if (tourney_state) tourney_state.reputation = Math.max(0, tourney_state.reputation - 10);
      description += ` Reputacija -10.`;
      break;

    case 'revenue*0.75':
      event_state.revenue = Math.floor(event_state.revenue * 0.75);
      description += ` Revenue -25%.`;
      break;

    case 'reputation-20':
      if (tourney_state) tourney_state.reputation = Math.max(0, tourney_state.reputation - 20);
      description += ` Reputacija -20.`;
      break;

    default:
      break;
  }

  eventResult.effectApplied = true;
  return { description, mitigated: false };
}

/**
 * Get risk category icon and mitigation hint for UI
 */
export function getRiskInfo(eventId) {
  const event = EVENT_POOL.find(e => e.id === eventId);
  if (!event) return { icon: '⚠️', label: 'Nepoznat rizik', hint: '' };
  return {
    icon: event.icon,
    label: event.label,
    hint: `Šansa mitiga: ${event.mitigates}`,
    mitigates: event.mitigates
  };
}

/**
 * Get the event type that might trigger for this city (for risk warning)
 * Returns the most likely event or null
 */
export function getMostLikelyRisk(city_id) {
  const eligible = EVENT_POOL
    .filter(e => e.cities.includes('all') || e.cities.includes(city_id))
    .sort((a, b) => b.chance - a.chance);

  return eligible[0] || null;
}

/**
 * Determine if a random event should trigger for the pre-block warning
 * (called before each block to decide if warning overlay shows)
 */
export function shouldShowRiskWarning(city_id) {
  const eligible = EVENT_POOL.filter(e =>
    e.cities.includes('all') || e.cities.includes(city_id)
  );
  const totalChance = eligible.reduce((sum, e) => sum + e.chance, 0);
  return Math.random() < Math.min(totalChance * 1.5, 0.65);
}
