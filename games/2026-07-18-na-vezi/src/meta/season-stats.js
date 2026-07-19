/** Istorija sezone, "Signal Stabilan" tracking */
import { getState, updateState } from '../state.js';
import { GAME_CONFIG } from '../config.js';

/**
 * Vraća sezonske statistike
 * @returns {Object}
 */
export function getSeasonStats() {
  const state = getState();
  return {
    ...state.season_stats,
    week: state.week,
    emisije: state.emisije_u_sezoni,
    prestige: state.prestige_count,
    multiplier: state.season_multiplier,
    signal_stabilan_streak: state.signal_stabilan_streak,
    emisijeDoPrestizhu: Math.max(0, GAME_CONFIG.SEASON_LENGTH_EMISIJE - state.emisije_u_sezoni),
  };
}

/**
 * Ažurira signal stabilan streak posle emisije
 * @param {boolean} hadCritical
 * @returns {number} novi streak
 */
export function updateSignalStabilanStreak(hadCritical) {
  const state = getState();
  const newStreak = hadCritical ? 0 : (state.signal_stabilan_streak || 0) + 1;
  updateState({ signal_stabilan_streak: newStreak });
  return newStreak;
}

/**
 * Formatira stats za briefing prikaz
 * @returns {Object}
 */
export function getBriefingStats() {
  const state = getState();
  return {
    totalAudience: state.audience.ig + state.audience.tiktok + state.audience.youtube,
    capital: state.capital,
    week: state.week,
    streak: state.signal_stabilan_streak,
    prestige: state.prestige_count,
    multiplier: state.season_multiplier,
  };
}

/**
 * Ukupna publika
 * @returns {number}
 */
export function getTotalAudience() {
  const state = getState();
  return (state.audience.ig || 0) + (state.audience.tiktok || 0) + (state.audience.youtube || 0);
}

/**
 * Najuspešnija platforma (po audienciji)
 * @returns {string}
 */
export function getTopPlatform() {
  const state = getState();
  const aud = state.audience;
  if (aud.ig >= aud.tiktok && aud.ig >= aud.youtube) return 'ig';
  if (aud.tiktok >= aud.youtube) return 'tiktok';
  return 'youtube';
}

/**
 * Da li je nova sezona (emissions reset)?
 * @returns {boolean}
 */
export function isNewSeason() {
  const state = getState();
  return state.emisije_u_sezoni === 0 && state.prestige_count > 0;
}
