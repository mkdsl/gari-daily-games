/**
 * @file synergy.js
 * Evaluate the synergy matrix for a 5-card team.
 * Returns a full SynergyReport with active effects, totals, and flavor lines.
 *
 * Entry point: evaluate(team, options)
 */

import { SYNERGY_DATA } from '../content/synergy_data.js';

/**
 * @typedef {import('../entities/card.js').Card} Card
 * @typedef {import('../content/synergy_data.js').SynergyEntry} SynergyEntry
 */

/**
 * @typedef {Object} ActiveEffect
 * @property {string}  synergy_id
 * @property {string}  category
 * @property {number}  score_delta      Net score contribution
 * @property {number}  vibe_delta
 * @property {number}  logistics_delta
 * @property {number}  crowd_delta
 * @property {number}  reach_delta
 * @property {string}  flavor
 * @property {string}  description
 */

/**
 * @typedef {Object} SynergyReport
 * @property {number}        synergy_total    Sum of positive score deltas
 * @property {number}        conflict_total   Sum of negative score deltas (as positive number)
 * @property {number}        vibe_total       Sum of all vibe_delta
 * @property {number}        logistics_total  Sum of all logistics_delta
 * @property {ActiveEffect[]} active_effects  All entries that triggered
 * @property {string[]}      flavor_lines     One line per active effect
 */

/**
 * @typedef {Object} EvaluateOptions
 * @property {boolean} [ignoreConflicts=false]  Skip conflict (negative) entries
 * @property {boolean} [anaHostPresent=false]   Ana Tiha: host-security conflicts negated
 * @property {boolean} [taraSecPresent=false]   Tara Senka: tara immune to conflicts
 * @property {boolean} [darkoConflictReduction=0] Darko Mirni conflict reduction value
 * @property {boolean} [filipPenaltyNegated=false] Filip Sena: 1 impulsive/controversy negated
 * @property {boolean} [phantomConflictReroll=false]  MC Phantom: 1 conflict rerolled to 0
 * @property {boolean} [ninaRerollSoundSynergy=false] Nina Fx: reroll 1 sound synergy
 * @property {boolean} [somaBlocksWildcardBurnout=false] Soma Still: block 1 wildcard burnout
 * @property {number}  [petroBurnoutReduce=0]   Petra Soft: reduce burnout effect
 */

// ---------------------------------------------------------------------------
// Condition checkers
// ---------------------------------------------------------------------------

/**
 * Count how many cards in team have a specific trait.
 * @param {Card[]} team
 * @param {string} trait
 * @returns {number}
 */
function countTrait(team, trait) {
  return team.filter(c => c.traits.includes(trait)).length;
}

/**
 * Count how many cards have either of two tags (for OR-based counts).
 * @param {Card[]} team
 * @param {string} tagA
 * @param {string|undefined} tagOrB
 * @returns {number}
 */
function countTagOrBoth(team, tagA, tagOrB) {
  if (!tagOrB) return team.filter(c => c.tags.includes(tagA)).length;
  // Count cards that have tagA OR tagOrB, but each card counted once
  return team.filter(c => c.tags.includes(tagA) || c.tags.includes(tagOrB)).length;
}

/**
 * Check if two traits coexist anywhere in the team (on separate or same cards).
 * For wild_intro / rookie_vet / wild_vet these must be on different cards.
 * @param {Card[]} team
 * @param {string} traitA
 * @param {string} traitB
 * @returns {boolean}
 */
function hasTwoTraitsOnTeam(team, traitA, traitB) {
  return team.some(c => c.traits.includes(traitA)) &&
         team.some(c => c.traits.includes(traitB));
}

/**
 * Check if a tag combo exists: at least one card with tagA AND at least one with tagB
 * (may be same card or different cards).
 * @param {Card[]} team
 * @param {string} tagA
 * @param {string} tagB
 * @returns {boolean}
 */
function hasTagCombo(team, tagA, tagB) {
  return team.some(c => c.tags.includes(tagA)) &&
         team.some(c => c.tags.includes(tagB));
}

// ---------------------------------------------------------------------------
// Per-entry evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate a single SynergyEntry against the team.
 * Returns null if the condition is not met.
 * @param {SynergyEntry} entry
 * @param {Card[]} team
 * @returns {ActiveEffect|null}
 */
function evaluateEntry(entry, team) {
  let triggered = false;

  switch (entry.condition_type) {
    case 'trait_count': {
      const count = countTrait(team, entry.trait_a);
      triggered = count >= (entry.min_count ?? 1);
      break;
    }
    case 'tag_count': {
      const count = countTagOrBoth(team, entry.tag_a, entry.tag_or_b);
      triggered = count >= (entry.min_count ?? 1);
      break;
    }
    case 'trait_pair': {
      // Requires both traits present in team (on any cards)
      triggered = hasTwoTraitsOnTeam(team, entry.trait_a, entry.trait_b);
      break;
    }
    case 'tag_combo': {
      triggered = hasTagCombo(team, entry.tag_a, entry.tag_b);
      break;
    }
    case 'tag_pair': {
      // Same as tag_combo — both tags present somewhere in team
      triggered = hasTagCombo(team, entry.tag_a, entry.tag_b);
      break;
    }
    default:
      triggered = false;
  }

  if (!triggered) return null;

  // Build the ActiveEffect
  const score_delta = entry.effect ?? 0;
  const vibe_delta = entry.effect_vibe ?? 0;
  const logistics_delta = entry.effect_logistics ?? 0;
  const crowd_delta = entry.effect_crowd ?? 0;
  const reach_delta = entry.effect_reach ?? 0;

  // Net score contribution includes mixed-category effects summed
  // vibe and logistics are tracked separately but also roll into overall scoring
  const net = score_delta + vibe_delta + logistics_delta + crowd_delta;

  return {
    synergy_id: entry.id,
    category: entry.category,
    score_delta: net,
    vibe_delta,
    logistics_delta,
    crowd_delta,
    reach_delta,
    flavor: entry.flavor,
    description: entry.condition,
  };
}

// ---------------------------------------------------------------------------
// Ability modifier application
// ---------------------------------------------------------------------------

/**
 * Apply card special ability modifiers that affect the synergy report.
 * Mutates the active_effects list in-place.
 *
 * @param {ActiveEffect[]} effects
 * @param {EvaluateOptions} opts
 * @returns {ActiveEffect[]}
 */
function applyAbilityModifiers(effects, opts) {
  const modifiedEffects = [...effects];

  // MC Phantom: reroll 1 conflict to 0 (remove first conflict entry)
  if (opts.phantomConflictReroll) {
    const conflictIdx = modifiedEffects.findIndex(e => e.score_delta < 0);
    if (conflictIdx !== -1) {
      const removed = modifiedEffects[conflictIdx];
      modifiedEffects[conflictIdx] = {
        ...removed,
        score_delta: 0,
        vibe_delta: 0,
        logistics_delta: 0,
        crowd_delta: 0,
        description: `${removed.description} [Phantom rerolled → 0]`,
      };
    }
  }

  // Darko Mirni: reduce conflict penalties by darkoConflictReduction points total
  if (opts.darkoConflictReduction && opts.darkoConflictReduction > 0) {
    let remaining = opts.darkoConflictReduction;
    for (let i = 0; i < modifiedEffects.length && remaining > 0; i++) {
      const e = modifiedEffects[i];
      if (e.score_delta < 0) {
        const reduction = Math.min(remaining, Math.abs(e.score_delta));
        modifiedEffects[i] = { ...e, score_delta: e.score_delta + reduction };
        remaining -= reduction;
      }
    }
  }

  // Filip Sena: negate 1 impulsive or controversy entry
  if (opts.filipPenaltyNegated) {
    const targetIdx = modifiedEffects.findIndex(
      e => e.score_delta < 0 && (e.description.includes('impulsive') || e.description.includes('controversy'))
    );
    if (targetIdx !== -1) {
      const e = modifiedEffects[targetIdx];
      modifiedEffects[targetIdx] = { ...e, score_delta: 0, description: `${e.description} [Filip negated]` };
    }
  }

  // Ana Tiha: host-security conflict negated
  // (This is handled at scoring level, not synergy matrix, but mark if relevant)
  // Tara Senka: immune to conflict — skip entries involving her tags
  // Both are handled by scoring.js reading ability results.

  // Nina Fx: reroll 1 sound-related synergy entry (pick best available that's negative)
  if (opts.ninaRerollSoundSynergy) {
    const soundSynergyIds = ['vet_vet', 'precision_techno', 'burnout_x2', 'lowmaint_x2'];
    const rerollIdx = modifiedEffects.findIndex(
      e => e.score_delta < 0 && soundSynergyIds.includes(e.synergy_id)
    );
    if (rerollIdx !== -1) {
      const e = modifiedEffects[rerollIdx];
      modifiedEffects[rerollIdx] = { ...e, score_delta: 0, description: `${e.description} [Nina rerolled]` };
    }
  }

  // Soma Still: blocks burnout effect from 1 Wildcard
  if (opts.somaBlocksWildcardBurnout) {
    const burnoutIdx = modifiedEffects.findIndex(e => e.synergy_id === 'burnout_x2');
    if (burnoutIdx !== -1) {
      const e = modifiedEffects[burnoutIdx];
      // Reduce the penalty by 5 (one Wildcard's contribution)
      const delta = Math.min(5, Math.abs(e.score_delta));
      modifiedEffects[burnoutIdx] = { ...e, score_delta: e.score_delta + delta, description: `${e.description} [Soma blocked 1 Wildcard burnout]` };
    }
  }

  // Petra Soft: reduce burnout effects in team by petroBurnoutReduce points
  if (opts.petroBurnoutReduce && opts.petroBurnoutReduce > 0) {
    const burnoutIdx = modifiedEffects.findIndex(e => e.synergy_id === 'burnout_x2');
    if (burnoutIdx !== -1) {
      const e = modifiedEffects[burnoutIdx];
      const reduction = Math.min(opts.petroBurnoutReduce, Math.abs(e.score_delta));
      modifiedEffects[burnoutIdx] = { ...e, score_delta: e.score_delta + reduction, description: `${e.description} [Petra reduced burnout by ${reduction}]` };
    }
  }

  return modifiedEffects;
}

// ---------------------------------------------------------------------------
// Main evaluate function
// ---------------------------------------------------------------------------

/**
 * Evaluate the full synergy matrix for a team of 5 cards.
 *
 * @param {Card[]}          team   Exactly 5 Card instances
 * @param {EvaluateOptions} [opts]
 * @returns {SynergyReport}
 */
export function evaluate(team, opts = {}) {
  if (!Array.isArray(team) || team.length === 0) {
    return {
      synergy_total: 0,
      conflict_total: 0,
      vibe_total: 0,
      logistics_total: 0,
      active_effects: [],
      flavor_lines: [],
    };
  }

  // Evaluate each synergy entry
  let rawEffects = SYNERGY_DATA
    .map(entry => evaluateEntry(entry, team))
    .filter(e => e !== null);

  // Apply card ability modifiers
  const effects = applyAbilityModifiers(rawEffects, opts);

  // Aggregate totals
  let synergy_total = 0;
  let conflict_total = 0;
  let vibe_total = 0;
  let logistics_total = 0;

  for (const e of effects) {
    if (e.score_delta > 0) {
      synergy_total += e.score_delta;
    } else if (e.score_delta < 0) {
      conflict_total += Math.abs(e.score_delta);
    }
    vibe_total += e.vibe_delta;
    logistics_total += e.logistics_delta;
  }

  return {
    synergy_total,
    conflict_total,
    vibe_total,
    logistics_total,
    active_effects: effects,
    flavor_lines: effects.map(e => e.flavor),
  };
}

/**
 * Quick check: does a team have any burnout tags?
 * @param {Card[]} team
 * @returns {number} count of burnout-tagged cards
 */
export function countBurnoutCards(team) {
  return team.filter(c => c.tags.includes('burnout')).length;
}

/**
 * Get the IDs of all synergy entries that triggered for a team.
 * @param {Card[]} team
 * @returns {string[]}
 */
export function getActiveSynergyIds(team) {
  return SYNERGY_DATA
    .filter(entry => evaluateEntry(entry, team) !== null)
    .map(entry => entry.id);
}

/**
 * Check if a specific synergy would trigger for the given team.
 * @param {string} synergyId
 * @param {Card[]} team
 * @returns {boolean}
 */
export function isSynergyActive(synergyId, team) {
  const entry = SYNERGY_DATA.find(s => s.id === synergyId);
  if (!entry) return false;
  return evaluateEntry(entry, team) !== null;
}
