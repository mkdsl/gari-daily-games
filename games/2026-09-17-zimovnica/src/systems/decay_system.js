/**
 * decay_system.js — Ingredient decay per day.
 * paprike -8%/d, paradajz -10%/d, jabuke -12%/d, itd.
 * Wraps applyDecay iz ingredient.js sa logikom za events (kiša ubrzava).
 */

import { applyDecay } from '../entities/ingredient.js';
import { DECAY_BASE, WEATHER_MULT } from '../config.js';

/**
 * Primenjuje dnevni decay uzimajući u obzir vreme i event modifikatore.
 * @param {object} sirovine - {id: kg}
 * @param {string} weather - 'sunny'|'cloudy'|'rainy'
 * @param {number} [eventDecayMult=1.0] - Event-triggered decay multiplikator
 * @returns {{ sirovine: object, report: string[] }}
 */
export function applyDailyDecay(sirovine, weather = 'sunny', eventDecayMult = 1.0) {
  const weatherMult = (weather === 'rainy' ? 1.3 : weather === 'cloudy' ? 1.1 : 1.0) * eventDecayMult;
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
