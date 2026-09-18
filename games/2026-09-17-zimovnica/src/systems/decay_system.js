/**
 * decay_system.js — Ingredient decay per day.
 * paprike -8%/d, paradajz -10%/d, jabuke -12%/d, itd.
 * Wraps applyDecay iz ingredient.js sa logikom za events (kiša ubrzava).
 * Includes sirovine_held_days tracking for accelerated decay.
 */

import { applyDecay } from '../entities/ingredient.js';
import { DECAY_BASE, WEATHER_MULT } from '../config.js';

/**
 * Primenjuje dnevni decay na state — prati sirovine_held_days.
 * @param {object} state - Full game state (needs state.sirovine, state.today_weather, state.sirovine_held_days)
 * @returns {{ state: object, total_lost_kg: number }}
 */
export function applyDailyDecayState(state) {
  const weather = state.today_weather || 'sunny';
  const held = state.sirovine_held_days || {};
  const weatherMult = weather === 'rainy' ? 1.3 : weather === 'cloudy' ? 1.1 : 1.0;

  const newSirovine = {};
  const newHeld = {};
  let total_lost_kg = 0;

  for (const [id, kg] of Object.entries(state.sirovine)) {
    if (!kg || kg <= 0) { newSirovine[id] = 0; newHeld[id] = 0; continue; }

    const base_rate = DECAY_BASE[id] || 0;
    if (base_rate <= 0) { newSirovine[id] = kg; newHeld[id] = (held[id] || 0) + 1; continue; }

    const days_held = held[id] || 0;
    // Decay accelerates with age: decay_chance = base_rate * (1 + days_held^0.8 / 10)
    const age_factor = 1 + Math.pow(days_held, 0.8) / 10;
    const effective_rate = base_rate * weatherMult * age_factor;
    const loss = kg * effective_rate;
    const after = Math.max(0, kg - loss);
    newSirovine[id] = after;
    newHeld[id] = days_held + 1;
    total_lost_kg += loss;
  }

  return {
    state: { ...state, sirovine: newSirovine, sirovine_held_days: newHeld },
    total_lost_kg
  };
}

/**
 * Primenjuje dnevni decay uzimajući u obzir vreme i event modifikatore.
 * Legacy signature — prima sirovine dict umesto punog state-a.
 * @param {object} sirovine - {id: kg}
 * @param {string} weather - 'sunny'|'cloudy'|'rainy'
 * @param {number} [eventDecayMult=1.0] - Event-triggered decay multiplikator
 * @returns {{ sirovine: object, report: string[] }}
 */
export function applyDailyDecay(sirovine, weather = 'sunny', eventDecayMult = 1.0) {
  const { sirovine: updated, decayed } = applyDecay(sirovine, weather);

  const report = [];
  for (const [id, loss] of Object.entries(decayed)) {
    if (loss >= 0.5) {
      report.push(`${id}: -${loss.toFixed(1)} kg`);
    }
  }

  return { sirovine: updated, report };
}

/**
 * Izračunava koliko dana neka sirovina može trajati pre nego što propadne.
 * @param {string} ingredientId
 * @param {string} weather
 * @returns {number} Broj dana
 */
export function daysUntilSpoiled(ingredientId, weather = 'sunny') {
  const rate = DECAY_BASE[ingredientId];
  if (!rate || rate <= 0) return 99;
  const wm = weather === 'rainy' ? 1.3 : weather === 'cloudy' ? 1.1 : 1.0;
  // Propada kada preostane <5% originalne količine
  return Math.floor(Math.log(0.05) / Math.log(1 - rate * wm));
}
