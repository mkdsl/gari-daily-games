/**
 * @file scoring.js
 * Event Score formula + audience match calculation.
 * Imports synergy.js for the matrix evaluation.
 *
 * Formula:
 *   base_total = sum(card.base_score for each of 5 roles, loyalty-adjusted)
 *   synergy_total = positive synergy effects
 *   conflict_total = absolute value of negative effects
 *   audience_match_bonus = AUDIENCE_MATCH_PER_TAG * count(preferred_tags in team tags)
 *   event_score = clamp(0, 100, base_total + synergy_total - conflict_total + audience_match_bonus + ability_deltas)
 */

import {
  MAX_EVENT_SCORE,
  MIN_EVENT_SCORE,
  AUDIENCE_MATCH_PER_TAG,
  getBracket,
  isTier3Unlocked,
} from '../config.js';
import { evaluate as evaluateSynergy } from './synergy.js';

/**
 * @typedef {import('../entities/card.js').Card} Card
 * @typedef {import('../content/events_data.js').EventData} EventData
 * @typedef {import('../state.js').GameState} GameState
 */

/**
 * @typedef {Object} ScoringContext
 * @property {Card[]}      team              5 selected Card instances
 * @property {EventData}   eventData         Current event
 * @property {GameState}   state             Current game state (for loyalty counts)
 * @property {string[]}    preferred_tags    Resolved preferred tags for this event
 * @property {number}      [prev_event_score] Previous event score (for tier3 unlock check)
 */

/**
 * @typedef {Object} ScoreBreakdown
 * @property {number}   base_total
 * @property {number}   synergy_total
 * @property {number}   conflict_total
 * @property {number}   audience_match_count  How many preferred tags matched
 * @property {number}   audience_match_bonus  Points from audience match
 * @property {number}   ability_total         Net delta from special abilities
 * @property {number}   vibe_total
 * @property {number}   logistics_total
 * @property {number}   raw_score             Before clamping
 * @property {number}   event_score           Final clamped score (0-100)
 * @property {Object}   synergy_report        Full SynergyReport from synergy.js
 * @property {Object[]} ability_results       Per-card ability results
 * @property {string}   bracket_label         'Flop' | 'Solid' | 'Zvezda' | 'Legenda'
 */

// ---------------------------------------------------------------------------
// Audience match
// ---------------------------------------------------------------------------

/**
 * Calculate audience match bonus.
 * Each preferred tag found anywhere in the team's combined tag list = +5 pts.
 * Special case: Ela Vizual (video_ela) gets +7 instead of +5 if 'viralmoment' matches.
 *
 * @param {Card[]}   team
 * @param {string[]} preferredTags
 * @returns {{ count: number, bonus: number, matched_tags: string[] }}
 */
export function calcAudienceMatch(team, preferredTags) {
  if (!preferredTags || preferredTags.length === 0) {
    return { count: 0, bonus: 0, matched_tags: [] };
  }

  // Collect all tags across the team (flat, deduplicated for matching)
  const teamTagSet = new Set(team.flatMap(c => c.tags));

  const matched_tags = preferredTags.filter(t => teamTagSet.has(t));
  const count = matched_tags.length;

  if (count === 0) return { count: 0, bonus: 0, matched_tags: [] };

  // Base bonus
  let bonus = count * AUDIENCE_MATCH_PER_TAG;

  // Ela Vizual upgrade: if viralmoment is a preferred tag AND ela is in team AND has viralmoment tag
  const elaInTeam = team.find(c => c.id === 'video_ela');
  if (elaInTeam && matched_tags.includes('viralmoment')) {
    // +7 instead of +5 for the viralmoment match = +2 extra
    bonus += 2;
  }

  return { count, bonus, matched_tags };
}

// ---------------------------------------------------------------------------
// Base score calculation (loyalty-adjusted)
// ---------------------------------------------------------------------------

/**
 * Compute the sum of loyalty-adjusted base scores for a team.
 * @param {Card[]}   team
 * @param {GameState} state
 * @returns {number}
 */
export function calcBaseTotal(team, state) {
  return team.reduce((sum, card) => {
    const survived = state.crew?.loyalty_counts?.[card.id] ?? 0;
    const adjusted = card.loyaltyAdjustedScore(survived);
    return sum + adjusted;
  }, 0);
}

// ---------------------------------------------------------------------------
// Midpoint score estimation (used by dj_lena ability)
// ---------------------------------------------------------------------------

/**
 * Estimate the midpoint score: base_total alone, divided by 2.
 * This is a simple proxy — the real midpoint would require live play data.
 * @param {number} base_total
 * @returns {number}
 */
export function estimateMidpointScore(base_total) {
  return base_total / 2;
}

// ---------------------------------------------------------------------------
// Ability evaluation pass
// ---------------------------------------------------------------------------

/**
 * Evaluate all card special abilities and aggregate their results.
 *
 * @param {Card[]}   team
 * @param {Object}   ctx   AbilityContext fields
 * @returns {{ ability_total: number, vibe_delta: number, logistics_delta: number, results: Object[], burnout_count: number, conflict_rerolled: boolean, conflict_reduce_total: number }}
 */
export function evalAllAbilities(team, ctx) {
  let ability_total = 0;
  let vibe_delta = 0;
  let logistics_delta = 0;
  let burnout_count = 0;
  let conflict_rerolled = false;
  let conflict_reduce_total = 0;
  const results = [];

  for (const card of team) {
    const result = card.evaluateAbility(ctx);
    results.push({ card_id: card.id, ...result });

    ability_total += result.score_delta ?? 0;
    vibe_delta += result.vibe_delta ?? 0;
    logistics_delta += result.logistics_delta ?? 0;

    if (result.burnout_added) burnout_count++;
    if (result.conflict_rerolled) conflict_rerolled = true;

    // Darko's explicit conflict reduction
    if (card.id === 'host_darko') {
      conflict_reduce_total += result.score_delta ?? 0;
    }
  }

  return { ability_total, vibe_delta, logistics_delta, results, burnout_count, conflict_rerolled, conflict_reduce_total };
}

// ---------------------------------------------------------------------------
// Build options for synergy evaluator from ability results
// ---------------------------------------------------------------------------

/**
 * Build EvaluateOptions for synergy.evaluate() based on ability results.
 * @param {Object[]} abilityResults   From evalAllAbilities().results
 * @param {Card[]}   team
 * @returns {import('./synergy.js').EvaluateOptions}
 */
function buildSynergyOpts(abilityResults, team) {
  const byId = Object.fromEntries(abilityResults.map(r => [r.card_id, r]));

  return {
    phantomConflictReroll:      !!(byId['dj_phantom']?.conflict_rerolled),
    darkoConflictReduction:     byId['host_darko']?.score_delta ?? 0,
    filipPenaltyNegated:        !!(byId['host_filip']?.score_delta > 0),
    anaHostPresent:             !!(byId['host_ana']?.negate_security_conflict),
    taraSecPresent:             !!(byId['sec_tara']?.immune_to_conflict),
    ninaRerollSoundSynergy:     !!(byId['sound_nina']?.reroll_sound_synergy),
    somaBlocksWildcardBurnout:  !!(byId['video_soma']?.block_wildcard_burnout),
    petroBurnoutReduce:         byId['sound_petra']?.reduce_burnout ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Main score function
// ---------------------------------------------------------------------------

/**
 * Compute the full event score for a 5-card team.
 *
 * @param {ScoringContext} ctx
 * @returns {ScoreBreakdown}
 */
export function calcEventScore(ctx) {
  const { team, eventData, state, preferred_tags } = ctx;

  if (!team || team.length !== 5) {
    throw new Error('calcEventScore requires exactly 5 cards in team');
  }

  // 1. Base total (loyalty-adjusted)
  const base_total = calcBaseTotal(team, state);

  // 2. Audience match (before abilities so abilities can reference it)
  const { count: audience_match_count, bonus: audience_match_bonus, matched_tags } =
    calcAudienceMatch(team, preferred_tags ?? eventData.preferred_tags ?? []);

  // 3. Midpoint estimate for dj_lena
  const midpoint_score = estimateMidpointScore(base_total);

  // 4. Build initial ability context (synergy not yet known)
  const prelimAbilityCtx = {
    team,
    midpoint_score,
    event_number: eventData.event_number,
    audience_match_bonus,
    conflict_total: 0, // preliminary — will be updated after synergy
    preferred_tags: preferred_tags ?? eventData.preferred_tags ?? [],
    synergyReport: null,
  };

  // 5. First ability pass to get options for synergy
  const firstAbilityPass = evalAllAbilities(team, prelimAbilityCtx);
  const synergyOpts = buildSynergyOpts(firstAbilityPass.results, team);

  // 6. Evaluate synergy matrix with ability modifiers applied
  const synergy_report = evaluateSynergy(team, synergyOpts);

  // 7. Second ability pass with correct conflict_total (sec_simo needs it)
  const secondAbilityCtx = {
    ...prelimAbilityCtx,
    conflict_total: synergy_report.conflict_total,
    synergyReport: synergy_report,
  };
  const { ability_total, vibe_delta, logistics_delta, results: ability_results } =
    evalAllAbilities(team, secondAbilityCtx);

  // 8. Compose final score
  const { synergy_total, conflict_total } = synergy_report;

  const raw_score = base_total + synergy_total - conflict_total + audience_match_bonus + ability_total;
  const event_score = Math.max(MIN_EVENT_SCORE, Math.min(MAX_EVENT_SCORE, Math.round(raw_score)));

  const vibe_total = synergy_report.vibe_total + vibe_delta;
  const logistics_total = synergy_report.logistics_total + logistics_delta;

  const bracket = getBracket(event_score);

  return {
    base_total,
    synergy_total,
    conflict_total,
    audience_match_count,
    audience_match_bonus,
    matched_tags,
    ability_total,
    vibe_total,
    logistics_total,
    raw_score,
    event_score,
    synergy_report,
    ability_results,
    bracket_label: bracket.label,
  };
}

/**
 * Shorthand: compute just the event_score number.
 * @param {ScoringContext} ctx
 * @returns {number}
 */
export function scoreEvent(ctx) {
  return calcEventScore(ctx).event_score;
}

/**
 * Check whether a previous event score unlocks tier 3 for next draft.
 * Re-exported here so callers only need to import from scoring.
 * @param {number} prevScore
 * @returns {boolean}
 */
export { isTier3Unlocked };
