// ============================================================
//  entities/klub.js — Sarajevo ili Smrt
//  Klub entity: tier, capacity, genre affinity, booking fee calc.
// ============================================================

import { KVART_NAMES, IDLE_BASE_PER_TIER } from '../config.js';
import { getBookingFeeMulti } from '../state.js';

// Per-kvart klub data
const KLUB_DATA = {
  bascarsija: {
    name: 'Kafana Daire',
    flavour_text: 'Stare drvene klupe, sevdah u zraku.',
    genre_affinity: 'sevdah',
    tier_names: ['Mala kafana', 'Poznata kafana', 'Legendarni klub'],
    tier_capacity: [60, 120, 250]
  },
  marijin_dvor: {
    name: 'Club Metropolis',
    flavour_text: 'Stakleni pult, laserski osvjetljeni podij.',
    genre_affinity: 'urban_tech',
    tier_names: ['Lokal', 'Noćni klub', 'Premium venue'],
    tier_capacity: [80, 200, 400]
  },
  grbavica: {
    name: 'Podrum 88',
    flavour_text: 'Podrum. Beton. Iskrenost ili izlaz.',
    genre_affinity: 'underground',
    tier_names: ['Podrum', 'Tajni venue', 'Kultni podrum'],
    tier_capacity: [40, 100, 200]
  }
};

// ----------------------------------------------------------------
//  Klub info accessor
// ----------------------------------------------------------------
/**
 * @param {string} kvart
 * @param {number} tier  1-3
 * @returns {object}
 */
export function getKlubInfo(kvart, tier) {
  const data = KLUB_DATA[kvart] ?? KLUB_DATA.bascarsija;
  const tier_idx = Math.max(0, Math.min(2, tier - 1));
  return {
    kvart,
    name: data.name,
    tier_name: data.tier_names[tier_idx],
    flavour_text: data.flavour_text,
    genre_affinity: data.genre_affinity,
    capacity: data.tier_capacity[tier_idx],
    tier
  };
}

// ----------------------------------------------------------------
//  Booking fee calculation
// ----------------------------------------------------------------
/**
 * How much LP the DJ earns as "booking fee" per night in this klub.
 * Based on C upgrade multiplier × base tier income.
 * @param {object} state
 * @param {string} kvart
 * @returns {number} LP (float)
 */
export function calcBookingFee(state, kvart) {
  const ks = state.kvartovi[kvart];
  if (!ks || !ks.active || ks.locked) return 0;

  const tier = Math.max(1, Math.min(3, ks.klub_tier));
  const base = IDLE_BASE_PER_TIER[tier - 1] ?? 0.8;
  const booking_multi = getBookingFeeMulti(state);
  return base * booking_multi;
}

// ----------------------------------------------------------------
//  Klub display data (for macro map overlay)
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {string} kvart
 * @returns {object}
 */
export function getKlubDisplayData(state, kvart) {
  const ks = state.kvartovi[kvart];
  if (!ks) return null;

  const info = getKlubInfo(kvart, ks.klub_tier);
  const booking_fee = calcBookingFee(state, kvart);

  return {
    ...info,
    active: ks.active,
    locked: ks.locked,
    rep: ks.mahala_reputacija,
    booking_fee_per_night: Math.floor(booking_fee)
  };
}

/**
 * Returns all klub display data for macro map.
 * @param {object} state
 * @returns {object[]}
 */
export function getAllKlubData(state) {
  return Object.keys(KLUB_DATA).map(kvart => getKlubDisplayData(state, kvart));
}
