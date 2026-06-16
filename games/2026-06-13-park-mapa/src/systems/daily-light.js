/**
 * daily-light.js — Dnevna zona rotacija (seed), completion tracking, fanfare trigger
 * Park Mapa | Jova jQuery
 */

import { CONFIG } from '../config.js';

/** @type {string[]} */
const ZONES = ['pult', 'bina', 'suma'];

/**
 * Deterministically pick today's daily-light zone based on date string.
 * Seed = integer from 'YYYY-MM-DD' (digits only), zone = zones[seed % 3].
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string} zone id: 'pult' | 'bina' | 'suma'
 */
export function getDailyLightZone(dateStr) {
  const seed = parseInt(dateStr.replace(/-/g, ''), 10);
  return ZONES[seed % ZONES.length];
}

/**
 * Check if today's daily light challenge has been completed.
 * @param {Object} state
 * @returns {boolean}
 */
export function isDailyLightComplete(state) {
  const today = new Date().toISOString().slice(0, 10);
  return state.dailyLight.date === today && state.dailyLight.completed === true;
}

/**
 * Initialize daily light tracking for today if not already set.
 * Resets date/zone/completed when a new day is detected.
 * Mutates state in place.
 * @param {Object} state
 */
export function initDailyLightForToday(state) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.dailyLight.date !== today) {
    state.dailyLight.date = today;
    state.dailyLight.zone = getDailyLightZone(today);
    state.dailyLight.completed = false;
    state.dailyLight.bonusEarned = 0;
  }
}

/**
 * Mark daily light as completed for today.
 * Awards bonus PT (ZONE_CHECKIN_DAILY_LIGHT - ZONE_CHECKIN = 10 extra on top of normal check-in).
 * Emits 'dailyLightComplete' event.
 * Mutates state in place.
 * @param {Object} state
 * @param {Function} emit - event emitter function: emit(eventName, payload)
 * @returns {number} PT earned as bonus
 */
export function completeDailyLight(state, emit) {
  if (state.dailyLight.completed) return 0;

  // Daily light bonus = total daily-light PT minus the base check-in PT
  const bonus = (CONFIG.ZONE_CHECKIN_DAILY_LIGHT || 25) - (CONFIG.ZONE_CHECKIN || 15);
  state.dailyLight.completed = true;
  state.dailyLight.bonusEarned = bonus;

  if (typeof emit === 'function') {
    emit('dailyLightComplete', {
      zone: state.dailyLight.zone,
      bonus,
      date: state.dailyLight.date
    });
  }

  return bonus;
}

/**
 * Return the display-friendly zone name for today's daily light.
 * @param {Object} state
 * @returns {string} zone id for the current day
 */
export function getDailyLightZoneForDisplay(state) {
  const today = new Date().toISOString().slice(0, 10);
  return getDailyLightZone(today);
}
