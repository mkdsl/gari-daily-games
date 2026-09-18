/**
 * rng_harvest.js — Berba RNG pool sa floor garantijama.
 * paprike >= 25 kg uvek, ostale sirovine po HARVEST_FREQ.
 */

import { HARVEST_FLOORS, HARVEST_MAXES, HARVEST_FREQ, WEATHER_MULT } from '../config.js';

/**
 * Generiše dnevnu berbu.
 * @param {number} day - Trenutni dan (1-14)
 * @param {string} weather - 'sunny'|'cloudy'|'rainy'
 * @param {object} [prestigeBonuses] - Prestige bonusi
 * @returns {object} {ingredientId: kg}
 */
export function generateHarvest(day, weather = 'sunny', prestigeBonuses = {}) {
  const result = {};
  const wm = WEATHER_MULT[weather] ?? 1.0;
  const prestige_mult = prestigeBonuses.harvest_bonus || 1.0;

  for (const [id, freq] of Object.entries(HARVEST_FREQ)) {
    const floor = HARVEST_FLOORS[id] || 0;
    const max = HARVEST_MAXES[id] || 0;

    // Floor garantija — uvek dobijamo minimum
    if (floor > 0) {
      const base = floor + Math.random() * (max - floor);
      result[id] = Math.round(base * wm * prestige_mult);
      continue;
    }

    // Ostale sirovine — po verovatnoći pojave
    if (Math.random() < freq) {
      const qty = Math.round(Math.random() * max * wm * prestige_mult);
      if (qty > 0) result[id] = qty;
    }
  }

  return result;
}

/**
 * Dodaje berbu na postojeće sirovine.
 * @param {object} existing - Postojeće sirovine {id: kg}
 * @param {object} harvest - Nova berba {id: kg}
 * @returns {object} Kombinovane sirovine
 */
export function mergeHarvest(existing, harvest) {
  const result = { ...existing };
  for (const [id, kg] of Object.entries(harvest)) {
    result[id] = (result[id] || 0) + kg;
  }
  return result;
}
