/** @fileoverview DJ slot entity: hype curve (+3%/min), transitions (±20%), slot system */

import { CONFIG } from '../config.js';

/**
 * @typedef {Object} DJSlot
 * @property {number} index - slot number
 * @property {string} name
 * @property {boolean} active
 * @property {number} hypeContrib - hype per minute while this DJ plays
 * @property {boolean} hasMajaBonus
 */

/**
 * Build DJ slots for a finale session
 * @param {number} totalSlots - from building pozornica level
 * @param {boolean} hasMaja - Maja is in volunteer roster
 * @returns {DJSlot[]}
 */
export function buildDJSlots(totalSlots, hasMaja) {
  const names = ['DJ Bora', 'DJ Cira', 'DJ Zdravko'];
  const slots = [];
  for (let i = 0; i < Math.max(1, totalSlots); i++) {
    const isMaja = hasMaja && i === totalSlots - 1;
    slots.push({
      index: i,
      name: isMaja ? 'DJ Maja' : (names[i] || `DJ ${i + 1}`),
      active: i === 0,
      hypeContrib: CONFIG.DJ_HYPE_RAMP,
      hasMajaBonus: isMaja
    });
  }
  return slots;
}

/**
 * Calculate hype delta for current tick
 * @param {DJSlot[]} slots
 * @param {number} currentSlot - index
 * @param {number} dtSeconds
 * @returns {number}
 */
export function calculateHypeDelta(slots, currentSlot, dtSeconds) {
  const slot = slots[currentSlot];
  if (!slot) return 0;
  const baseRamp = slot.hypeContrib * (dtSeconds / 60);
  const majaMultiplier = slot.hasMajaBonus ? CONFIG_MAJA_MULT : 1.0;
  return baseRamp * majaMultiplier;
}

// Cached maja mult to avoid circular import issues
const CONFIG_MAJA_MULT = 1.2;

/**
 * Apply a good DJ transition (player clicked in window)
 * @param {Object} finaleState - mutable
 * @param {DJSlot[]} slots
 */
export function applyGoodTransition(finaleState, slots) {
  finaleState.djHype = Math.min(100, finaleState.djHype + CONFIG.DJ_HYPE_TRANSITION_GOOD);
  finaleState.currentSlot = Math.min(finaleState.currentSlot + 1, slots.length - 1);
  finaleState.pendingTransition = false;
  finaleState.transitionWindowStart = null;
  return { success: true, hypeDelta: CONFIG.DJ_HYPE_TRANSITION_GOOD };
}

/**
 * Apply a bad DJ transition (missed window or auto-advance)
 * @param {Object} finaleState - mutable
 * @param {DJSlot[]} slots
 */
export function applyBadTransition(finaleState, slots) {
  finaleState.djHype = Math.max(0, finaleState.djHype + CONFIG.DJ_HYPE_TRANSITION_BAD);
  finaleState.currentSlot = Math.min(finaleState.currentSlot + 1, slots.length - 1);
  finaleState.pendingTransition = false;
  finaleState.transitionWindowStart = null;
  return { success: false, hypeDelta: CONFIG.DJ_HYPE_TRANSITION_BAD };
}

/**
 * Check if transition window has expired
 * @param {number|null} windowStart - timestamp ms
 * @returns {boolean}
 */
export function isTransitionWindowExpired(windowStart) {
  if (windowStart === null) return false;
  return Date.now() - windowStart > CONFIG.DJ_TRANSITION_WINDOW_SEC * 1000;
}

/**
 * Calculate the minute mark for periodic DJ transitions
 * @param {number} elapsedSeconds
 * @param {number} totalSlots
 * @returns {number[]} array of minutes at which transitions should trigger
 */
export function getTransitionMinutes(elapsedSeconds, totalSlots) {
  if (totalSlots <= 1) return [];
  const duration = CONFIG.FINALE_DURATION_SEC / 60;
  const interval = duration / totalSlots;
  const minutes = [];
  for (let i = 1; i < totalSlots; i++) {
    minutes.push(Math.floor(i * interval));
  }
  return minutes;
}

/**
 * Should a transition trigger now?
 * @param {number} elapsedSeconds
 * @param {number} currentSlot
 * @param {number} totalSlots
 * @param {boolean} pendingTransition
 * @returns {boolean}
 */
export function shouldTriggerTransition(elapsedSeconds, currentSlot, totalSlots, pendingTransition) {
  if (pendingTransition) return false;
  if (currentSlot >= totalSlots - 1) return false;
  const minutes = getTransitionMinutes(elapsedSeconds, totalSlots);
  const elapsedMin = Math.floor(elapsedSeconds / 60);
  return minutes.includes(elapsedMin);
}
