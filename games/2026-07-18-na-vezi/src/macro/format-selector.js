/** Format izbor + platform-afinitet preview */
import { FORMATS, GAME_CONFIG } from '../config.js';
import { getState, unlockFormat } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { updateDraftPlan } from './planning-session.js';

/**
 * Vraća listu dostupnih formata sa lock/unlock statusom
 * @returns {Array}
 */
export function getAvailableFormats() {
  const state = getState();
  return Object.values(FORMATS).map(f => ({
    ...f,
    unlocked: state.unlocked_formats.includes(f.id),
    platformAffinity: GAME_CONFIG.FORMAT_PLATFORM_BONUS[f.id],
  }));
}

/**
 * Bira format
 * @param {string} formatId
 * @returns {{ ok: boolean, reason?: string }}
 */
export function selectFormat(formatId) {
  const state = getState();
  if (!state.unlocked_formats.includes(formatId)) {
    return { ok: false, reason: 'Format nije otključan' };
  }
  updateDraftPlan({ format: formatId });
  emit(EVENTS.FORMAT_SELECTED, { formatId });
  return { ok: true };
}

/**
 * Preview platform afinitet za format
 * @param {string} formatId
 * @returns {Object} { ig: number, tiktok: number, youtube: number }
 */
export function getFormatAffinity(formatId) {
  return GAME_CONFIG.FORMAT_PLATFORM_BONUS[formatId] || { ig: 1.0, tiktok: 1.0, youtube: 1.0 };
}

/**
 * Formatira afinitet kao tekst (+40%, +5%, -20%)
 * @param {number} mult
 * @returns {string}
 */
export function formatAffinity(mult) {
  const pct = Math.round((mult - 1) * 100);
  if (pct > 0) return `+${pct}%`;
  if (pct < 0) return `${pct}%`;
  return '=';
}

/**
 * Provera unlock uslova za formate
 * Podkast se otključava posle 3 emisije, Vlog posle 6
 */
export function checkFormatUnlocks() {
  const state = getState();
  const unlocked = [];

  if (state.emisije_u_sezoni >= 3 && !state.unlocked_formats.includes('podkast')) {
    unlockFormat('podkast');
    unlocked.push('podkast');
    emit(EVENTS.FORMAT_UNLOCKED, { formatId: 'podkast' });
  }
  if (state.emisije_u_sezoni >= 6 && !state.unlocked_formats.includes('vlog_uzivo')) {
    unlockFormat('vlog_uzivo');
    unlocked.push('vlog_uzivo');
    emit(EVENTS.FORMAT_UNLOCKED, { formatId: 'vlog_uzivo' });
  }

  return unlocked;
}

/**
 * Tutorial: vraća pre-set format za prvu nedelju
 */
export function getTutorialFormat() {
  return 'dj_lajv';
}
