/** @module entities/fan — Fan DB entry structure and accumulation */

/**
 * @typedef {Object} FanEntry
 * @property {string} city_id
 * @property {number} attendance
 * @property {number} crowd_quality - 0-10
 * @property {number} value - computed fan_db contribution
 */

/**
 * @typedef {Object} FanDB
 * @property {number} total - total fan_db points
 * @property {FanEntry[]} entries - per-city entries
 * @property {number} promo_eff_bonus - bonus from log10 formula (capped)
 */

/**
 * Compute fan_db contribution from a city event
 * @param {number} attendance
 * @param {number} crowd_quality - 0-10
 * @param {number} ending_mult - from FAN_DB_MULTIPLIERS
 * @returns {number}
 */
export function computeFanValue(attendance, crowd_quality, ending_mult) {
  return Math.floor(attendance * (crowd_quality / 10) * ending_mult);
}

/**
 * Compute promo_eff_bonus from fan_db total
 * @param {number} fan_db_total
 * @param {number} cap - default 0.3
 * @returns {number}
 */
export function computePromoEffBonus(fan_db_total, cap = 0.3) {
  if (fan_db_total <= 0) return 0;
  return Math.min(Math.log10(fan_db_total / 1000 + 1) * 0.1, cap);
}

/**
 * Create empty FanDB
 * @returns {FanDB}
 */
export function createFanDB() {
  return { total: 0, entries: [], promo_eff_bonus: 0 };
}

/**
 * Add a fan entry and recompute promo_eff_bonus
 * @param {FanDB} db
 * @param {FanEntry} entry
 * @returns {FanDB}
 */
export function addFanEntry(db, entry) {
  const total = db.total + entry.value;
  return {
    total,
    entries: [...db.entries, entry],
    promo_eff_bonus: computePromoEffBonus(total),
  };
}
