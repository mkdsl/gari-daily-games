/** Format unlock redosled (solo→gost→simulcast) */
import { getState, unlockFormat } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { FORMATS } from '../config.js';

/** Unlock threshold-i po emisijama u sezoni */
const UNLOCK_THRESHOLDS = {
  podkast:    3,
  vlog_uzivo: 6,
};

/**
 * Proverava i primenjuje format unlock-ove
 * @returns {string[]} novi unlocked format IDs
 */
export function checkAndApplyUnlocks() {
  const state = getState();
  const newUnlocks = [];

  for (const [formatId, threshold] of Object.entries(UNLOCK_THRESHOLDS)) {
    if (!state.unlocked_formats.includes(formatId) &&
        state.emisije_u_sezoni >= threshold) {
      unlockFormat(formatId);
      newUnlocks.push(formatId);
      emit(EVENTS.FORMAT_UNLOCKED, { formatId, format: FORMATS[formatId] });
    }
  }

  return newUnlocks;
}

/**
 * Je li format otključan?
 * @param {string} formatId
 * @returns {boolean}
 */
export function isFormatUnlocked(formatId) {
  const state = getState();
  return state.unlocked_formats.includes(formatId);
}

/**
 * Emisija do sledećeg unlock-a
 * @returns {{ formatId: string, emisijeDo: number }|null}
 */
export function getNextUnlock() {
  const state = getState();
  for (const [formatId, threshold] of Object.entries(UNLOCK_THRESHOLDS)) {
    if (!state.unlocked_formats.includes(formatId)) {
      return {
        formatId,
        format: FORMATS[formatId],
        emisijeDo: Math.max(0, threshold - state.emisije_u_sezoni),
      };
    }
  }
  return null; // sve otključano
}

/**
 * Listu svih formata sa unlock statusom
 * @returns {Array}
 */
export function getFormatsWithStatus() {
  const state = getState();
  return Object.values(FORMATS).map(f => ({
    ...f,
    unlocked: state.unlocked_formats.includes(f.id),
    threshold: UNLOCK_THRESHOLDS[f.id] || 0,
  }));
}
