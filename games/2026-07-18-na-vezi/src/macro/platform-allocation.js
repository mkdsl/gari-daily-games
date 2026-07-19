/** Bandwidth slider, weekly_capacity provera */
import { getState } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { updateDraftPlan, getDraftPlan } from './planning-session.js';
import { GAME_CONFIG } from '../config.js';

/**
 * Ažurira alokaciju za platformu, pokušava da rebalansira ostatak
 * @param {string} platform - 'ig'|'tiktok'|'youtube'
 * @param {number} value 0-100
 * @returns {Object} nova alokacija
 */
export function setAllocation(platform, value) {
  const draft = getDraftPlan();
  if (!draft) return null;
  const state = getState();

  value = Math.round(Math.max(0, Math.min(100, value)));
  const alloc = { ...draft.platform_alloc };

  // Tutorial — samo IG
  if (state.tutorialMode) {
    alloc.ig = 100;
    alloc.tiktok = 0;
    alloc.youtube = 0;
    updateDraftPlan({ platform_alloc: alloc });
    return alloc;
  }

  alloc[platform] = value;

  // Rebalansira ostale dve da zbir bude 100
  const others = ['ig', 'tiktok', 'youtube'].filter(p => p !== platform);
  const remaining = 100 - value;
  const currentOthersTotal = others.reduce((s, p) => s + alloc[p], 0);

  if (currentOthersTotal === 0) {
    // Ravnomerno rasporedi ostatak
    const perOther = Math.floor(remaining / others.length);
    others.forEach((p, i) => {
      alloc[p] = i === 0 ? remaining - perOther * (others.length - 1) : perOther;
    });
  } else {
    // Proporcionalno smanji/poveći
    const ratio = remaining / currentOthersTotal;
    let roundingError = remaining;
    others.forEach((p, i) => {
      if (i === others.length - 1) {
        alloc[p] = Math.max(0, roundingError);
      } else {
        alloc[p] = Math.max(0, Math.round(alloc[p] * ratio));
        roundingError -= alloc[p];
      }
    });
  }

  // Osiguraj da zbir bude tačno 100
  const total = Object.values(alloc).reduce((s, v) => s + v, 0);
  if (total !== 100) {
    const diff = 100 - total;
    const adjustPlatform = others[0];
    alloc[adjustPlatform] = Math.max(0, alloc[adjustPlatform] + diff);
  }

  updateDraftPlan({ platform_alloc: alloc });
  emit(EVENTS.PLATFORM_ALLOC_CHANGE, { alloc });
  return alloc;
}

/**
 * Vraća total alokacije
 * @param {Object} alloc
 * @returns {number}
 */
export function getAllocTotal(alloc) {
  return Object.values(alloc).reduce((s, v) => s + v, 0);
}

/**
 * Validacija alokacije
 * @param {Object} alloc
 * @returns {{ valid: boolean, total: number, status: 'exact'|'over'|'under' }}
 */
export function validateAllocation(alloc) {
  const total = getAllocTotal(alloc);
  return {
    valid: total === 100,
    total,
    status: total === 100 ? 'exact' : total > 100 ? 'over' : 'under',
  };
}

/**
 * Procenjuje efektivni drain na kapacitet za ovu alokaciju
 * @param {Object} alloc
 * @param {string} format
 * @param {Object} equipment
 * @returns {number} drain po sekundi
 */
export function estimateDrain(alloc, format, equipment) {
  const baseDrain = GAME_CONFIG.BASE_DRAIN_RATE[format] || 0.18;
  let platformDrain = 0;
  for (const [p, pct] of Object.entries(alloc)) {
    if (pct > 0) {
      platformDrain += GAME_CONFIG.PLATFORM_DRAW[p] * (pct / 100);
    }
  }

  // Lighting draw
  let lightingDrain = 0;
  if (equipment.r3) lightingDrain = GAME_CONFIG.LIGHTING_DRAW.r3;
  else if (equipment.r1) lightingDrain = GAME_CONFIG.LIGHTING_DRAW.r1;
  else if (equipment.r2) lightingDrain = GAME_CONFIG.LIGHTING_DRAW.r2;

  // B3 reduces platform cost
  const platformMultiplier = equipment.b3 ? 0.85 : 1.0;
  // L3 reduces battery draw
  const l3Reduction = equipment.l3 ? 0.08 : 0;

  return (baseDrain + platformDrain * platformMultiplier + lightingDrain) - l3Reduction;
}

/**
 * Procenjuje koliko sekundi emisije izdržava kapacitet
 * @param {number} capacity 0-100
 * @param {number} drainPerSec
 * @returns {number} sekunde
 */
export function estimateBatteryLife(capacity, drainPerSec) {
  if (drainPerSec <= 0) return Infinity;
  return capacity / drainPerSec;
}
