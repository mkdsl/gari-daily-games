/** @module systems/decision_engine — card draw (no repeats), option resolution, effects */

import { CARDS_PER_CITY } from '../config.js';
import { CARDS } from '../content/cards.js';

/**
 * Draw N cards for a city, no repeats per city, respecting city_lock
 * @param {string} city_id
 * @param {string[]} excluded_ids - already drawn in this city
 * @param {number} [count=4]
 * @returns {import('../content/cards.js').Card[]}
 */
export function drawCards(city_id, excluded_ids, count = CARDS_PER_CITY) {
  const eligible = CARDS.filter(c => {
    if (excluded_ids.includes(c.id)) return false;
    if (c.city_lock && c.city_lock !== city_id) return false;
    return true;
  });

  // Shuffle eligible
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Resolve option effects (handles random outcomes)
 * @param {import('../content/cards.js').CardOption} option
 * @returns {Object} resolved effects
 */
export function resolveOption(option) {
  const effects = { ...option.effects };

  if (effects.random && effects.outcomes && effects.outcomes.length > 0) {
    // Pick a random outcome
    const idx = Math.floor(Math.random() * effects.outcomes.length);
    const chosen = effects.outcomes[idx];
    // Merge chosen outcome into effects, remove random marker
    Object.assign(effects, chosen);
    delete effects.random;
    delete effects.outcomes;
  }

  return effects;
}

/**
 * Apply resolved effects to game state
 * @param {Object} state - current game state
 * @param {Object} effects - resolved effects from resolveOption
 * @param {import('../entities/crew_member.js').CrewMember[]} crew
 * @returns {Object} delta to apply (caller merges)
 */
export function computeEffectDelta(state, effects, crew) {
  const delta = {
    budget: 0,
    crew_mood: 0,
    reputation: 0,
    reach: 0,
    cq_bonus: 0,
    next_city_crew_mood: 0,
    budget_per_city: 0,
    skills_temp: null,
  };

  if (effects.budget) delta.budget += effects.budget;
  if (effects.crew_mood) delta.crew_mood += effects.crew_mood;
  if (effects.reputation) delta.reputation += effects.reputation;
  if (effects.reach) delta.reach += effects.reach;
  if (effects.cq_bonus) delta.cq_bonus += effects.cq_bonus;
  if (effects.next_city_crew_mood) delta.next_city_crew_mood += effects.next_city_crew_mood;
  if (effects.budget_per_city) delta.budget_per_city += effects.budget_per_city;
  if (effects.skills_temp) delta.skills_temp = effects.skills_temp;

  return delta;
}

/**
 * Format effects for display
 * @param {Object} effects
 * @returns {string[]} array of display strings
 */
export function formatEffects(effects) {
  const lines = [];
  if (effects.budget > 0) lines.push(`+${effects.budget} EUR`);
  if (effects.budget < 0) lines.push(`${effects.budget} EUR`);
  if (effects.crew_mood > 0) lines.push(`+${effects.crew_mood.toFixed(1)} Mood`);
  if (effects.crew_mood < 0) lines.push(`${effects.crew_mood.toFixed(1)} Mood`);
  if (effects.reputation > 0) lines.push(`+${effects.reputation.toFixed(1)} Rep`);
  if (effects.reputation < 0) lines.push(`${effects.reputation.toFixed(1)} Rep`);
  if (effects.reach > 0) lines.push(`+${effects.reach.toFixed(1)} Reach`);
  if (effects.reach < 0) lines.push(`${effects.reach.toFixed(1)} Reach`);
  if (effects.cq_bonus > 0) lines.push(`+${effects.cq_bonus.toFixed(1)} CQ`);
  if (effects.cq_bonus < 0) lines.push(`${effects.cq_bonus.toFixed(1)} CQ`);
  if (effects.budget_per_city) lines.push(`${effects.budget_per_city} EUR/grad`);
  if (effects.random) lines.push('🎲 Random');
  if (lines.length === 0) lines.push('Nema efekta');
  return lines;
}
