/** Gost no-show istorija — NE resetuje se pri prestige */
import { getState, saveState } from '../state.js';

/**
 * Vraća trenutnu reliability gosta
 * @param {string} gostId
 * @returns {number} 0-100
 */
export function getGuestReliability(gostId) {
  const state = getState();
  return state.guest_reliability[gostId] ?? 50;
}

/**
 * Vraća sve reliability vrednosti
 * @returns {Object}
 */
export function getAllReliabilities() {
  const state = getState();
  return { ...state.guest_reliability };
}

/**
 * Vraća ukupan broj booking-a za gosta
 * @param {string} gostId
 * @returns {number}
 */
export function getGuestBookingCount(gostId) {
  const state = getState();
  return state.guest_bookings[gostId] || 0;
}

/**
 * Je li gost pouzdan (reliability >= 80)?
 * @param {string} gostId
 * @returns {boolean}
 */
export function isGuestReliable(gostId) {
  return getGuestReliability(gostId) >= 80;
}

/**
 * Gost sa najvišom reliability
 * @returns {{ gostId: string, reliability: number }|null}
 */
export function getMostReliableGuest() {
  const state = getState();
  const entries = Object.entries(state.guest_reliability);
  if (!entries.length) return null;
  const [gostId, reliability] = entries.reduce((best, curr) =>
    curr[1] > best[1] ? curr : best
  );
  return { gostId, reliability };
}

/**
 * Broj uzastopnih bookinga bez no-show-a (za AC9)
 * @returns {number}
 */
export function getConsecutiveNoShowFreeCount() {
  const state = getState();
  return state.consecutive_noshow_free || 0;
}

/**
 * Ažurira consecutive no-show counter
 * @param {boolean} noShow
 */
export function updateNoShowStreak(noShow) {
  const state = getState();
  if (noShow) {
    state.consecutive_noshow_free = 0;
  } else if (state.weekly_plan.chosen_guest_id !== 'g8') {
    state.consecutive_noshow_free = (state.consecutive_noshow_free || 0) + 1;
  }
  saveState();
}
