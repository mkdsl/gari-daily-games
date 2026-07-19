/** Resolveuje prošlu nedelju u kapital/reputaciju */
import { GAME_CONFIG, formatCapital } from '../config.js';
import { getState, updateState, saveState } from '../state.js';

/**
 * Izračunava revenue na kraju nedelje
 * @param {Object} audience - { ig, tiktok, youtube }
 * @param {Object} engagement - po platformi 0-1
 * @param {Object} platformAlloc - procenat alokacije
 * @param {number} prestigeMult
 * @returns {number} ukupan revenue
 */
export function calcWeeklyRevenue(audience, engagement, platformAlloc, prestigeMult = 1.0) {
  let revenue = 0;
  const platforms = ['ig', 'tiktok', 'youtube'];
  for (const p of platforms) {
    const alloc = (platformAlloc[p] || 0) / 100;
    if (alloc <= 0) continue;
    const aud = audience[p] || 0;
    const eng = engagement[p] || 0;
    const weight = GAME_CONFIG.MONETIZATION_WEIGHT[p] || 1.0;
    revenue += aud * eng * alloc * weight * prestigeMult;
  }
  return Math.round(revenue);
}

/**
 * Ažurira audience posle emisije
 * @param {Object} audience - trenutni audience
 * @param {Object} engagement - po platformi 0-1
 * @param {Object} platformAlloc - % alokacije
 * @param {string} format
 * @param {number} reputationMult - prosek reputacije
 * @param {number} prestigeMult
 * @returns {Object} nova audience vrednost
 */
export function updateAudienceAfterEmisija(audience, engagement, platformAlloc, format, reputationMult, prestigeMult) {
  const alloc = platformAlloc;
  const formatBonus = GAME_CONFIG.FORMAT_PLATFORM_BONUS[format] || { ig: 1, tiktok: 1, youtube: 1 };
  const newAudience = { ...audience };

  // IG growth
  if (alloc.ig > 0) {
    const igEng = engagement.ig || 0;
    newAudience.ig = Math.round(
      audience.ig * (1 + GAME_CONFIG.IG_GROWTH_RATE * (alloc.ig / 100) * reputationMult * prestigeMult * formatBonus.ig)
    );
  }

  // TikTok — spike logika
  const tiktokEng = engagement.tiktok || 0;
  const spike = tiktokEng > 0.7 && (alloc.tiktok || 0) > 20 ? GAME_CONFIG.TIKTOK_SPIKE_MULT : 1.0;
  if (alloc.tiktok > 0) {
    const newGain = tiktokEng * spike * (alloc.tiktok / 100) * 50 * prestigeMult * formatBonus.tiktok;
    newAudience.tiktok = Math.round(audience.tiktok + newGain);
  } else {
    newAudience.tiktok = Math.round(audience.tiktok * (1 - GAME_CONFIG.TIKTOK_DECAY_NO_ALLOC));
  }

  // YouTube — steady growth
  if (alloc.youtube > 0) {
    const ytEng = engagement.youtube || 0;
    const retentionBonus = ytEng * 20 * (alloc.youtube / 100) * prestigeMult * formatBonus.youtube;
    newAudience.youtube = Math.round(
      audience.youtube * GAME_CONFIG.YOUTUBE_GROWTH_RATE + retentionBonus
    );
  }

  return newAudience;
}

/**
 * Ažurira reputaciju posle emisije
 * @param {Object} reputation - trenutna { ig, tiktok, youtube }
 * @param {Object} engagement - po platformi
 * @param {number} signalUptime - % vremena bez alarma
 * @returns {Object} nova reputacija
 */
export function updateReputation(reputation, engagement, signalUptime) {
  const factor = 0.1; // Learning rate
  const newRep = {};
  for (const p of ['ig', 'tiktok', 'youtube']) {
    const target = (engagement[p] || 0) * signalUptime;
    newRep[p] = Math.max(0, Math.min(1,
      reputation[p] + (target - reputation[p]) * factor
    ));
  }
  return newRep;
}

/**
 * Finalizuje nedelju — primenjuje sve promene u state
 * @param {Object} emisijaResult - iz emisija-resolver-a
 * @returns {Object} outcome summary
 */
export function resolveWeeklyOutcome(emisijaResult) {
  const state = getState();
  const {
    engagement,
    signalUptime,
    capitalDelta,
    noShow,
    tiktokSpike,
  } = emisijaResult;

  const plan = state.weekly_plan;

  // Revenue
  const revenue = capitalDelta || calcWeeklyRevenue(
    state.audience,
    engagement,
    plan.platform_alloc,
    state.season_multiplier
  );

  // Audience update
  const reputationAvg = (state.reputation.ig + state.reputation.tiktok + state.reputation.youtube) / 3;
  const newAudience = updateAudienceAfterEmisija(
    state.audience,
    engagement,
    plan.platform_alloc,
    plan.format,
    reputationAvg,
    state.season_multiplier
  );

  // Reputacija
  const newReputation = updateReputation(state.reputation, engagement, signalUptime);

  // Kapital
  const newCapital = Math.max(0, state.capital + revenue - GAME_CONFIG.UPKEEP_COST_PER_WEEK);

  const outcome = {
    week: state.week,
    format: plan.format,
    weather: plan.weather_band,
    engagement,
    signalUptime,
    revenue,
    capitalDelta: revenue - GAME_CONFIG.UPKEEP_COST_PER_WEEK,
    noShow,
    tiktokSpike,
    audienceBefore: { ...state.audience },
    audienceAfter: newAudience,
    audienceDelta: {
      ig: newAudience.ig - state.audience.ig,
      tiktok: newAudience.tiktok - state.audience.tiktok,
      youtube: newAudience.youtube - state.audience.youtube,
    },
  };

  // Primeni u state
  updateState({
    capital: newCapital,
    audience: newAudience,
    reputation: newReputation,
    week: state.week + 1,
    emisije_u_sezoni: state.emisije_u_sezoni + 1,
    last_week_outcome: outcome,
  });

  return outcome;
}
