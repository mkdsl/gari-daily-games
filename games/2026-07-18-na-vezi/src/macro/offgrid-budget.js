/** Nedeljni capacity roll + finalna alokacija */
import { GAME_CONFIG, clamp, randRange, lerp } from '../config.js';
import { getState } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { updateDraftPlan, getDraftPlan } from './planning-session.js';

/**
 * Roluje nedeljni kapacitet na osnovu base + vremena
 * @param {number} baseCapacity
 * @param {boolean} hasVarianceReduction - B2 solar panel
 * @returns {{ capacity: number, band: string, mult: number }}
 */
export function rollWeeklyCapacity(baseCapacity, hasVarianceReduction = false) {
  const roll = Math.random();
  let band, mult;

  if (roll < GAME_CONFIG.WEATHER_BANDS.oblacno.chance) {
    band = 'oblacno';
    mult = randRange(
      GAME_CONFIG.WEATHER_BANDS.oblacno.min,
      GAME_CONFIG.WEATHER_BANDS.oblacno.max
    );
  } else if (roll < GAME_CONFIG.WEATHER_BANDS.oblacno.chance + GAME_CONFIG.WEATHER_BANDS.prosecno.chance) {
    band = 'prosecno';
    mult = randRange(
      GAME_CONFIG.WEATHER_BANDS.prosecno.min,
      GAME_CONFIG.WEATHER_BANDS.prosecno.max
    );
  } else {
    band = 'suncano';
    mult = randRange(
      GAME_CONFIG.WEATHER_BANDS.suncano.min,
      GAME_CONFIG.WEATHER_BANDS.suncano.max
    );
  }

  // B2 solar panel smanjuje varijancu za 35%
  if (hasVarianceReduction) {
    mult = lerp(mult, 1.0, 0.35);
  }

  const capacity = clamp(Math.round(baseCapacity * mult), 15, 100);
  return { capacity, band, mult };
}

/**
 * Vraća textuelni opis vremenskog pojasa
 * @param {string} band
 * @returns {string}
 */
export function getWeatherBandLabel(band) {
  const labels = {
    oblacno: '☁ Oblačno',
    prosecno: '⛅ Prosečno',
    suncano: '☀ Sunčano',
  };
  return labels[band] || '⛅ Nepoznato';
}

/**
 * Boja indikatora za kapacitet
 * @param {number} capacity
 * @returns {string} CSS color var
 */
export function getCapacityColor(capacity) {
  if (capacity >= 60) return 'var(--color-offgrid)';
  if (capacity >= 30) return 'var(--color-warn)';
  return 'var(--color-critical)';
}

/**
 * Procenjuje da li emisija može trajati puno vreme
 * @param {number} capacity
 * @param {number} drainPerSec
 * @returns {{ canFinish: boolean, estimatedSecs: number }}
 */
export function estimateEmisijaViability(capacity, drainPerSec) {
  if (drainPerSec <= 0) return { canFinish: true, estimatedSecs: Infinity };
  const secs = capacity / drainPerSec;
  return {
    canFinish: secs >= GAME_CONFIG.EMISIJA_DURATION,
    estimatedSecs: Math.round(secs),
  };
}

/**
 * Finalizuje offgrid odluku (poslednji korak planiranja)
 */
export function confirmOffgrid() {
  emit(EVENTS.OFFGRID_CONFIRMED, { plan: getDraftPlan() });
  return { ok: true };
}

/**
 * Preporučena alokacija za kapacitet
 * @param {number} capacity 0-100
 * @returns {Object} platform_alloc preporuka
 */
export function getRecommendedAllocation(capacity) {
  if (capacity < 30) {
    // Niska energija — fokus samo na jednu platformu
    return { ig: 100, tiktok: 0, youtube: 0 };
  } else if (capacity < 60) {
    // Srednje — dve platforme
    return { ig: 70, tiktok: 30, youtube: 0 };
  } else {
    // Visoka energija — sve platforme
    return { ig: 50, tiktok: 30, youtube: 20 };
  }
}
