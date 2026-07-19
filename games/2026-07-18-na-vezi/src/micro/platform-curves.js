/** IG/TikTok/YouTube formule tick-po-tick */
import { GAME_CONFIG, clamp } from '../config.js';
import { getDashboardState, updateDashboardState } from './dashboard-state.js';
import { getState } from '../state.js';
import { emit, EVENTS } from '../events.js';

/** @type {boolean} TikTok spike već aktiviran ove emisije */
let _tiktokSpikeUsed = false;

/** @type {number} Tick u kome je TikTok spike aktiviran */
let _tiktokSpikeAt = -1;

/**
 * Resetuje state po emisiji
 */
export function resetPlatformCurves() {
  _tiktokSpikeUsed = false;
  _tiktokSpikeAt = -1;
}

/**
 * Izračunava engagement po platformi za ovaj tick
 * @param {number} elapsed - sekunde
 * @param {number} signalLevel - 0-100
 * @param {Object} chatMomentum - { ig, tiktok, youtube }
 * @param {boolean} gostArrived
 * @param {string} format
 * @param {Object} platformAlloc - % po platformi
 * @returns {Object} { ig: 0-1, tiktok: 0-1, youtube: 0-1 }
 */
export function calcPlatformEngagement(elapsed, signalLevel, chatMomentum, gostArrived, format, platformAlloc) {
  const state = getState();
  const ds = getDashboardState();
  const prestigeMult = state.season_multiplier || 1.0;
  const formatBonus = GAME_CONFIG.FORMAT_PLATFORM_BONUS[format] || {};
  const signalFactor = clamp(signalLevel / 100, 0, 1);

  const engagement = { ig: 0, tiktok: 0, youtube: 0 };

  // IG engagement
  if (platformAlloc.ig > 0) {
    const chatBoost = chatMomentum.ig || 0;
    const formatMult = formatBonus.ig || 1.0;
    engagement.ig = clamp(
      signalFactor * 0.5 + chatBoost * 0.3 + (gostArrived ? 0.2 : 0) * formatMult * prestigeMult,
      0, 1
    );
  }

  // TikTok engagement — spike logika
  if (platformAlloc.tiktok > 0) {
    const chatBoost = chatMomentum.tiktok || 0;
    const formatMult = formatBonus.tiktok || 1.0;
    let tikBase = signalFactor * 0.4 + chatBoost * 0.4;

    // Early engagement u prvih 2 min (120s) = TikTok spike
    if (elapsed < 120 && tikBase > 0.5 && !_tiktokSpikeUsed) {
      _tiktokSpikeUsed = true;
      _tiktokSpikeAt = elapsed;
      tikBase *= GAME_CONFIG.TIKTOK_SPIKE_MULT;
      if (ds) {
        ds.tiktokSpike = true;
        ds.tiktokSpikeEarly = elapsed < 120;
      }
      emit(EVENTS.TIKTOK_SPIKE, { elapsed, early: elapsed < 120 });
    }

    engagement.tiktok = clamp(tikBase * formatMult * prestigeMult, 0, 1);
  }

  // YouTube engagement — steady, retention-based
  if (platformAlloc.youtube > 0) {
    const chatBoost = chatMomentum.youtube || 0;
    const formatMult = formatBonus.youtube || 1.0;
    // YouTube raste sa trajanjem (retencija)
    const retentionFactor = Math.min(elapsed / GAME_CONFIG.EMISIJA_DURATION, 1);
    engagement.youtube = clamp(
      (signalFactor * 0.45 + chatBoost * 0.25 + retentionFactor * 0.3) * formatMult * prestigeMult,
      0, 1
    );
  }

  return engagement;
}

/**
 * Da li je TikTok spike aktiviran?
 * @returns {boolean}
 */
export function hasTiktokSpike() {
  return _tiktokSpikeUsed;
}

/**
 * U kome trenutku je spike aktiviran
 * @returns {number} sekunde ili -1
 */
export function getTiktokSpikeTime() {
  return _tiktokSpikeAt;
}

/**
 * Formatira engagement za UI
 * @param {number} value 0-1
 * @returns {string}
 */
export function formatEngagement(value) {
  return `${Math.round(value * 100)}%`;
}

/**
 * Prosek engagement-a svih platformi (za scoring)
 * @param {Object} engagement
 * @param {Object} alloc
 * @returns {number} 0-1
 */
export function calcWeightedEngagement(engagement, alloc) {
  const total = alloc.ig + alloc.tiktok + alloc.youtube;
  if (total === 0) return 0;
  return (
    (engagement.ig    * alloc.ig +
     engagement.tiktok * alloc.tiktok +
     engagement.youtube * alloc.youtube) / total
  );
}
