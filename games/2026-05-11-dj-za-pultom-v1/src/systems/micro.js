// =============================================================================
// systems/micro.js — Micro layer (žurka) — PLACEHOLDER simplified
// =============================================================================
// V1: simplified — "set rate skill slider + random outcome".
// Full Diner Dash-style 2-deck beatsync + tap mechanic = sledeca iteracija.
// =============================================================================
import { SET_QUALITY, DESYNC, BOOZE } from '../config.js';
import { clamp, randomInt, chance } from '../util.js';
import { tryRecklessPick } from './vector-reckless.js';
import { addPecat } from './pasos.js';

export function getDesyncTimer(state) {
  const w = state.week;
  let timer;
  if (w <= 3)  timer = DESYNC.timer_weeks_1_3;
  else if (w <= 8) timer = DESYNC.timer_weeks_4_8;
  else timer = DESYNC.timer_weeks_9_12;

  if (state.stats.mixing >= 5) timer *= (1 + DESYNC.mixing_tier_5plus_bonus);
  return Math.round(timer);
}

export function simulateSet(state, choices) {
  // choices = {effort: 'low'|'normal'|'high'|'max', pre_drinks: number, attempt_signatures: number}
  const effort = choices.effort ?? 'normal';
  const preDrinks = choices.pre_drinks ?? 0;
  const sigAttempts = choices.attempt_signatures ?? 0;

  // Base
  let quality = SET_QUALITY.base;

  // Mixing bonus
  quality += state.stats.mixing * SET_QUALITY.mixing_factor;

  // Effort modifier
  const effortMod = { low: -10, normal: 0, high: 8, max: 12 }[effort] ?? 0;
  quality += effortMod;

  // Camelot compatibility — random for placeholder
  const compatibleRate = 0.4 + Math.random() * 0.5;
  quality += compatibleRate * SET_QUALITY.camelot_factor;

  // Freshness
  quality += state.music_catalog.avg_freshness * SET_QUALITY.freshness_factor;

  // Signature picks
  let sigSuccessCount = 0;
  for (let i = 0; i < sigAttempts; i++) {
    const isUniqueTrack = state.stats.knowledge >= 3 && Math.random() < 0.5;
    const pick = tryRecklessPick(state, isUniqueTrack);
    if (pick.attempted) {
      quality += pick.atmosphere;
      if (pick.success) sigSuccessCount += 1;
    }
  }

  // De-sync — simplified to "expected effort" outcome
  const desyncSeconds = (effort === 'low') ? 8
                      : (effort === 'normal') ? randomInt(1, 4)
                      : (effort === 'high') ? randomInt(0, 2)
                      : 0;
  quality -= desyncSeconds * SET_QUALITY.desync_penalty_factor;

  // Alcohol pre-set
  if (preDrinks > SET_QUALITY.alcohol_preset_threshold) {
    quality -= SET_QUALITY.alcohol_preset_penalty;
  }

  // Health low
  if (state.sacrifice.health < SET_QUALITY.health_low_threshold) {
    quality -= SET_QUALITY.health_low_penalty;
  }

  // Forced cancellation chance (Mile sekcija 7.1)
  let canceled = false;
  if (state.sacrifice.health < 30 && chance(0.30)) {
    canceled = true;
    quality = 0;
  }

  quality = clamp(quality, SET_QUALITY.range_min, SET_QUALITY.range_max);

  // Effects on Macro
  let reputationDelta = 0;
  let recogDelta = 0;
  let rsvpDelta = 0;

  if (!canceled) {
    if (quality > SET_QUALITY.reputation_gain_threshold) {
      reputationDelta = 0.1;
      state.stats.reputation = clamp(state.stats.reputation + reputationDelta, 0, 7);
    } else if (quality < SET_QUALITY.reputation_loss_threshold) {
      reputationDelta = -0.2;
      state.stats.reputation = clamp(state.stats.reputation + reputationDelta, 0, 7);
    }
    if (quality > SET_QUALITY.recog_gain_threshold) {
      recogDelta = 0.05;
      state.stats.recognizability = clamp(state.stats.recognizability + recogDelta, 0, 7);
    }
    rsvpDelta = Math.round((quality - 50) * SET_QUALITY.rsvp_delta_factor);
    state.rsvp_next += rsvpDelta;
  }

  // Gig fee — derived (Mile sekcija 2.2 V7)
  let gigFee = 0;
  if (!canceled) {
    gigFee = Math.round(50 + state.stats.reputation * 30 + (quality - 50));
    state.money += gigFee;
  }

  // Pasoš pečat — uvek dobija jedan ako odsvirao
  if (!canceled) addPecat(state);

  // Track set quality cumulative
  if (!canceled) {
    state.cumulative_set_quality_sum += quality;
    state.cumulative_set_quality_count += 1;
  }

  // Push gig record
  state.gigs_played.push({
    week: state.week,
    quality,
    pre_drinks: preDrinks,
    canceled,
    sigSuccess: sigSuccessCount,
    sigAttempts,
    desyncSeconds,
    gigFee,
    reputationDelta,
    recogDelta,
    rsvpDelta
  });

  return {
    quality,
    canceled,
    sigSuccessCount,
    sigAttempts,
    desyncSeconds,
    gigFee,
    reputationDelta,
    recogDelta,
    rsvpDelta,
    effort,
    preDrinks
  };
}
