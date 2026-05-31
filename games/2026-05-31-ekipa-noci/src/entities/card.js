/**
 * @file card.js
 * Card class: constructs from raw CardData, evaluates special abilities,
 * applies loyalty modifier.
 */

import {
  ABILITY,
  LOYALTY_THRESHOLD,
  LOYALTY_SCORE_BONUS,
  LOYALTY_SCORE_MAX_BONUS,
} from '../config.js';

/**
 * @typedef {Object} CardData
 * @property {string}   id
 * @property {string}   role
 * @property {string}   name
 * @property {string[]} traits
 * @property {string[]} tags
 * @property {number}   base_score
 * @property {number}   cost
 * @property {number}   tier
 * @property {string}   special
 * @property {number}   locked_until_xp
 */

/**
 * @typedef {Object} AbilityContext
 * @property {Card[]}   team             All 5 selected cards (may be incomplete during eval)
 * @property {number}   midpoint_score   Score at halftime of event (or best estimate)
 * @property {number}   event_number     1-5
 * @property {number}   audience_match_bonus  Computed audience match value
 * @property {number}   conflict_total   Conflict penalties before abilities
 * @property {Object}   synergyReport    Output from synergy.evaluate()
 */

/**
 * @typedef {Object} AbilityResult
 * @property {number}  score_delta      Added to event score
 * @property {number}  vibe_delta       Sub-category modifier
 * @property {number}  logistics_delta  Sub-category modifier
 * @property {boolean} burnout_added    True if this ability introduces burnout
 * @property {boolean} conflict_rerolled  True if a conflict was zeroed
 * @property {string}  description      Human-readable explanation of what fired
 */

/** @returns {AbilityResult} neutral result */
function neutralResult(description = '') {
  return { score_delta: 0, vibe_delta: 0, logistics_delta: 0, burnout_added: false, conflict_rerolled: false, description };
}

export class Card {
  /**
   * @param {CardData} data
   */
  constructor(data) {
    /** @type {string} */
    this.id = data.id;
    /** @type {string} */
    this.role = data.role;
    /** @type {string} */
    this.name = data.name;
    /** @type {string[]} */
    this.traits = [...data.traits];
    /** @type {string[]} */
    this.tags = [...data.tags];
    /** @type {number} */
    this.base_score = data.base_score;
    /** @type {number} */
    this.cost = data.cost;
    /** @type {number} */
    this.tier = data.tier;
    /** @type {string} */
    this.special = data.special;
    /** @type {number} */
    this.locked_until_xp = data.locked_until_xp;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns true if this card has a given trait.
   * @param {string} trait
   * @returns {boolean}
   */
  hasTrait(trait) {
    return this.traits.includes(trait);
  }

  /**
   * Returns true if this card has a given tag.
   * @param {string} tag
   * @returns {boolean}
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }

  /**
   * Whether this card carries the burnout risk tag.
   * @returns {boolean}
   */
  hasBurnoutTag() {
    return this.tags.includes('burnout');
  }

  /**
   * Whether this card is a Wildcard.
   * @returns {boolean}
   */
  isWildcard() {
    return this.traits.includes('Wildcard');
  }

  /**
   * Whether this card is a Veteran.
   * @returns {boolean}
   */
  isVeteran() {
    return this.traits.includes('Veteran');
  }

  /**
   * Whether this card is a HeavyHitter.
   * @returns {boolean}
   */
  isHeavyHitter() {
    return this.traits.includes('HeavyHitter');
  }

  // ---------------------------------------------------------------------------
  // Loyalty modifier
  // ---------------------------------------------------------------------------

  /**
   * Calculate effective base_score after applying loyalty bonus.
   * Bonus = +2 per event survived past the LOYALTY_THRESHOLD, capped at max.
   * @param {number} events_survived  From crew.loyalty_counts[this.id]
   * @returns {number} Effective base score
   */
  loyaltyAdjustedScore(events_survived) {
    if (events_survived < LOYALTY_THRESHOLD) return this.base_score;
    const bonus_events = events_survived - (LOYALTY_THRESHOLD - 1);
    const bonus = Math.min(bonus_events * LOYALTY_SCORE_BONUS, LOYALTY_SCORE_MAX_BONUS);
    return this.base_score + bonus;
  }

  // ---------------------------------------------------------------------------
  // Special ability evaluations
  // Each method returns AbilityResult.
  // ---------------------------------------------------------------------------

  /**
   * Evaluate this card's special ability in the given context.
   * Dispatches to the correct per-card method.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  evaluateAbility(ctx) {
    const method = `_ability_${this.id}`;
    if (typeof this[method] === 'function') {
      return this[method](ctx);
    }
    return neutralResult('No special ability defined');
  }

  // ---------------------------------------------------------------------------
  // DJ abilities
  // ---------------------------------------------------------------------------

  /**
   * dj_drazen: +4 if Sound card has 'precision' or 'techno' tag.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_dj_drazen(ctx) {
    const sound = ctx.team.find(c => c.role === 'sound');
    if (sound && (sound.hasTag('precision') || sound.hasTag('techno'))) {
      return { ...neutralResult(), score_delta: ABILITY.DJ_DRAZEN_BONUS, description: `Dražen Bura: +${ABILITY.DJ_DRAZEN_BONUS} (Sound precision/techno sync)` };
    }
    return neutralResult('Dražen Bura: Sound has no precision/techno tag');
  }

  /**
   * dj_lena: if midpoint_score > 50 → +6, else -3.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_dj_lena(ctx) {
    if (ctx.midpoint_score > ABILITY.DJ_LENA_MIDPOINT) {
      return { ...neutralResult(), score_delta: ABILITY.DJ_LENA_HI_BONUS, description: `Lena Voltage: +${ABILITY.DJ_LENA_HI_BONUS} (midpoint ${ctx.midpoint_score} > 50)` };
    }
    return { ...neutralResult(), score_delta: ABILITY.DJ_LENA_LO_PENALTY, description: `Lena Voltage: ${ABILITY.DJ_LENA_LO_PENALTY} (midpoint ${ctx.midpoint_score} <= 50)` };
  }

  /**
   * dj_phantom: reroll 1 conflict to 0; adds burnout effect.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult}
   */
  _ability_dj_phantom(_ctx) {
    return {
      ...neutralResult(),
      conflict_rerolled: true,
      burnout_added: true,
      description: 'MC Phantom: rerolled 1 conflict to 0; burnout risk added',
    };
  }

  /**
   * dj_toni: +3 if team has 3+ Veteran cards.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_dj_toni(ctx) {
    const vetCount = ctx.team.filter(c => c.isVeteran()).length;
    if (vetCount >= ABILITY.DJ_TONI_VET_COUNT) {
      return { ...neutralResult(), score_delta: ABILITY.DJ_TONI_BONUS, description: `Toni Groove: +${ABILITY.DJ_TONI_BONUS} (${vetCount} Veterans in team)` };
    }
    return neutralResult(`Toni Groove: only ${vetCount} Veterans (need ${ABILITY.DJ_TONI_VET_COUNT})`);
  }

  /**
   * dj_zara: +5 score NEXT event if retained (loyalty trigger).
   * This returns a score_delta of 0 for the current event.
   * The progression system reads 'next_event_bonus' from AbilityResult extensions.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult & { next_event_bonus: number }}
   */
  _ability_dj_zara(_ctx) {
    return {
      ...neutralResult(),
      next_event_bonus: ABILITY.DJ_ZARA_NEXT_EVENT_BONUS,
      description: `Zara Static: +${ABILITY.DJ_ZARA_NEXT_EVENT_BONUS} queued for NEXT event if retained`,
    };
  }

  // ---------------------------------------------------------------------------
  // Host abilities
  // ---------------------------------------------------------------------------

  /**
   * host_filip: negates 1 impulsive or controversy penalty in team.
   * score_delta = +conflict reduction (scoring.js uses this).
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_host_filip(ctx) {
    const hasImpulsive = ctx.team.some(c => c.hasTag('impulsive'));
    const hasControversy = ctx.team.some(c => c.hasTag('controversy'));
    if (hasImpulsive || hasControversy) {
      return { ...neutralResult(), score_delta: 4, description: 'Filip Sena: negated 1 impulsive/controversy penalty (+4 effective)' };
    }
    return neutralResult('Filip Sena: no impulsive/controversy in team to negate');
  }

  /**
   * host_mia: if audience_match_bonus >= 1, +4 vibe.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_host_mia(ctx) {
    if (ctx.audience_match_bonus >= 1) {
      return { ...neutralResult(), vibe_delta: ABILITY.HOST_MIA_VIBE_BONUS, description: `Mia Flare: +${ABILITY.HOST_MIA_VIBE_BONUS} vibe (audience match active)` };
    }
    return neutralResult('Mia Flare: no audience match, vibe bonus not triggered');
  }

  /**
   * host_darko: reduce all conflict penalties by 2.
   * score_delta reflects the reduction.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_host_darko(ctx) {
    const reduction = Math.min(ctx.conflict_total, ABILITY.HOST_DARKO_CONFLICT_REDUCE);
    return { ...neutralResult(), score_delta: reduction, description: `Darko Mirni: conflict reduced by ${reduction}` };
  }

  /**
   * host_sasha: +10 if DJ is HeavyHitter; -10 if DJ is Introvert.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_host_sasha(ctx) {
    const dj = ctx.team.find(c => c.role === 'dj');
    if (!dj) return neutralResult('Sasha Bold: no DJ in team');
    if (dj.isHeavyHitter()) {
      return { ...neutralResult(), score_delta: ABILITY.HOST_SASHA_HH_BONUS, description: `Sasha Bold: +${ABILITY.HOST_SASHA_HH_BONUS} (DJ is HeavyHitter)` };
    }
    if (dj.hasTrait('Introvert')) {
      return { ...neutralResult(), score_delta: ABILITY.HOST_SASHA_INTRO_PENALTY, description: `Sasha Bold: ${ABILITY.HOST_SASHA_INTRO_PENALTY} (DJ is Introvert)` };
    }
    return neutralResult('Sasha Bold: DJ is neither HeavyHitter nor Introvert');
  }

  /**
   * host_ana: no conflict penalty with any Security card.
   * This is enforced by synergy.js; ability returns a marker.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult & { negate_security_conflict: boolean }}
   */
  _ability_host_ana(_ctx) {
    return {
      ...neutralResult(),
      negate_security_conflict: true,
      description: 'Ana Tiha: host-security conflicts negated',
    };
  }

  // ---------------------------------------------------------------------------
  // Sound abilities
  // ---------------------------------------------------------------------------

  /**
   * sound_boro: +5 if DJ has 'techno' or 'precision' tag.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_sound_boro(ctx) {
    const dj = ctx.team.find(c => c.role === 'dj');
    if (dj && (dj.hasTag('techno') || dj.hasTag('precision'))) {
      return { ...neutralResult(), score_delta: ABILITY.SOUND_BORO_BONUS, description: `Boro Bas: +${ABILITY.SOUND_BORO_BONUS} (DJ has techno/precision)` };
    }
    return neutralResult('Boro Bas: DJ has no techno/precision tag');
  }

  /**
   * sound_nina: reroll 1 sound-related synergy once per event.
   * Handled by synergy.js; this returns the marker.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult & { reroll_sound_synergy: boolean }}
   */
  _ability_sound_nina(_ctx) {
    return {
      ...neutralResult(),
      reroll_sound_synergy: true,
      description: 'Nina Fx: can reroll 1 sound synergy this event',
    };
  }

  /**
   * sound_marko: +8 if event is Grand Finale (E5); adds burnout.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_sound_marko(ctx) {
    if (ctx.event_number === 5) {
      return {
        ...neutralResult(),
        score_delta: ABILITY.SOUND_MARKO_FINALE_BONUS,
        burnout_added: true,
        description: `Marko Loud: +${ABILITY.SOUND_MARKO_FINALE_BONUS} (Grand Finale) + burnout`,
      };
    }
    return { ...neutralResult(), burnout_added: true, description: 'Marko Loud: burnout added (not Grand Finale)' };
  }

  /**
   * sound_petra: reduce burnout effects in team by 1 point.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult & { reduce_burnout: number }}
   */
  _ability_sound_petra(_ctx) {
    return {
      ...neutralResult(),
      reduce_burnout: ABILITY.SOUND_PETRA_BURNOUT_REDUCE,
      description: `Petra Soft: reduces team burnout effects by ${ABILITY.SOUND_PETRA_BURNOUT_REDUCE}`,
    };
  }

  /**
   * sound_luka: +3 for each Ekstrovert member in team.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_sound_luka(ctx) {
    const extroCount = ctx.team.filter(c => c.hasTrait('Ekstrovert')).length;
    const delta = extroCount * ABILITY.SOUND_LUKA_EXTRO_BONUS;
    return { ...neutralResult(), score_delta: delta, description: `Luka Sync: +${delta} (${extroCount} Ekstroverts × ${ABILITY.SOUND_LUKA_EXTRO_BONUS})` };
  }

  // ---------------------------------------------------------------------------
  // Video abilities
  // ---------------------------------------------------------------------------

  /**
   * video_vuk: +4 if Sound has 'technical' or 'ambient' tag.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_video_vuk(ctx) {
    const sound = ctx.team.find(c => c.role === 'sound');
    if (sound && (sound.hasTag('technical') || sound.hasTag('ambient'))) {
      return { ...neutralResult(), score_delta: ABILITY.VIDEO_VUK_BONUS, description: `Vuk Frame: +${ABILITY.VIDEO_VUK_BONUS} (Sound technical/ambient)` };
    }
    return neutralResult('Vuk Frame: Sound has no technical/ambient tag');
  }

  /**
   * video_ela: if audience preferred tag is 'viralmoment', +7 instead of +5.
   * The scoring system provides audience_match_bonus; this supplements it.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_video_ela(ctx) {
    // Check if the team already earned an audience match on viralmoment
    // ctx.preferred_tags should be passed through if scoring sets it
    const preferredTags = ctx.preferred_tags ?? [];
    if (preferredTags.includes('viralmoment') && this.hasTag('viralmoment')) {
      const extra = ABILITY.VIDEO_ELA_VIRAL_BONUS - ABILITY.VIDEO_ELA_STANDARD_BONUS;
      return { ...neutralResult(), score_delta: extra, description: `Ela Vizual: +${extra} extra (viralmoment preferred match bonus upgrade)` };
    }
    return neutralResult('Ela Vizual: viralmoment not a preferred tag or not matched');
  }

  /**
   * video_rex: +5 vibe, -3 logistics; has burnout.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult}
   */
  _ability_video_rex(_ctx) {
    return {
      ...neutralResult(),
      vibe_delta: ABILITY.VIDEO_REX_VIBE_BONUS,
      logistics_delta: ABILITY.VIDEO_REX_LOGISTICS_PENALTY,
      burnout_added: true,
      description: `Rex Glitch: +${ABILITY.VIDEO_REX_VIBE_BONUS} vibe, ${ABILITY.VIDEO_REX_LOGISTICS_PENALTY} logistics, burnout`,
    };
  }

  /**
   * video_soma: blocks burnout from 1 Wildcard in team.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult & { block_wildcard_burnout: boolean }}
   */
  _ability_video_soma(_ctx) {
    return {
      ...neutralResult(),
      block_wildcard_burnout: true,
      description: 'Soma Still: blocks burnout effect from 1 Wildcard',
    };
  }

  /**
   * video_kika: +2 for each audience_match_bonus point earned.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_video_kika(ctx) {
    const delta = ctx.audience_match_bonus * ABILITY.VIDEO_KIKA_MATCH_BONUS;
    return { ...neutralResult(), score_delta: delta, description: `Kika Motion: +${delta} (${ctx.audience_match_bonus} match pts × ${ABILITY.VIDEO_KIKA_MATCH_BONUS})` };
  }

  // ---------------------------------------------------------------------------
  // Security abilities
  // ---------------------------------------------------------------------------

  /**
   * sec_zoran: reduce risky conflict penalties by 3 per event.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_sec_zoran(ctx) {
    const hasRisky = ctx.team.some(c => c.hasTag('risky') && c.id !== this.id);
    if (hasRisky) {
      return { ...neutralResult(), score_delta: ABILITY.SEC_ZORAN_RISKY_REDUCE, description: `Zoran Zid: +${ABILITY.SEC_ZORAN_RISKY_REDUCE} (risky conflict reduction)` };
    }
    return neutralResult('Zoran Zid: no risky cards in team');
  }

  /**
   * sec_branka: +5 if Host has 'charisma' or 'crowdcontrol' tag.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_sec_branka(ctx) {
    const host = ctx.team.find(c => c.role === 'host');
    if (host && (host.hasTag('charisma') || host.hasTag('crowdcontrol'))) {
      return { ...neutralResult(), score_delta: ABILITY.SEC_BRANKA_BONUS, description: `Branka Štit: +${ABILITY.SEC_BRANKA_BONUS} (Host has charisma/crowdcontrol)` };
    }
    return neutralResult('Branka Štit: Host has no charisma/crowdcontrol tag');
  }

  /**
   * sec_simo: +10 if conflict_total=0; -5 if conflict_total>=10.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_sec_simo(ctx) {
    if (ctx.conflict_total === 0) {
      return { ...neutralResult(), score_delta: ABILITY.SEC_SIMO_NO_CONFLICT_BONUS, description: `Simo Hajduk: +${ABILITY.SEC_SIMO_NO_CONFLICT_BONUS} (zero conflicts!)` };
    }
    if (ctx.conflict_total >= ABILITY.SEC_SIMO_CONFLICT_HIGH_THRESHOLD) {
      return { ...neutralResult(), score_delta: ABILITY.SEC_SIMO_HIGH_CONFLICT_PENALTY, description: `Simo Hajduk: ${ABILITY.SEC_SIMO_HIGH_CONFLICT_PENALTY} (conflict_total >= ${ABILITY.SEC_SIMO_CONFLICT_HIGH_THRESHOLD})` };
    }
    return neutralResult(`Simo Hajduk: conflict_total ${ctx.conflict_total} — no bonus/penalty`);
  }

  /**
   * sec_tara: no conflict penalty regardless of traits.
   * Marker for synergy.js to skip tara in conflict calculations.
   * @param {AbilityContext} _ctx
   * @returns {AbilityResult & { immune_to_conflict: boolean }}
   */
  _ability_sec_tara(_ctx) {
    return {
      ...neutralResult(),
      immune_to_conflict: true,
      description: 'Tara Senka: immune to all conflict penalties',
    };
  }

  /**
   * sec_boban: +6 if DJ or Host has 'hype' tag; -4 if neither.
   * @param {AbilityContext} ctx
   * @returns {AbilityResult}
   */
  _ability_sec_boban(ctx) {
    const dj = ctx.team.find(c => c.role === 'dj');
    const host = ctx.team.find(c => c.role === 'host');
    const hasHype = (dj?.hasTag('hype') ?? false) || (host?.hasTag('hype') ?? false);
    if (hasHype) {
      return { ...neutralResult(), score_delta: ABILITY.SEC_BOBAN_HYPE_BONUS, description: `Boban Grom: +${ABILITY.SEC_BOBAN_HYPE_BONUS} (DJ/Host has hype)` };
    }
    return { ...neutralResult(), score_delta: ABILITY.SEC_BOBAN_NO_HYPE_PENALTY, description: `Boban Grom: ${ABILITY.SEC_BOBAN_NO_HYPE_PENALTY} (no hype in DJ/Host)` };
  }

  // ---------------------------------------------------------------------------
  // Serialization
  // ---------------------------------------------------------------------------

  /**
   * Plain-object snapshot for JSON serialization.
   * @returns {CardData}
   */
  toJSON() {
    return {
      id: this.id,
      role: this.role,
      name: this.name,
      traits: [...this.traits],
      tags: [...this.tags],
      base_score: this.base_score,
      cost: this.cost,
      tier: this.tier,
      special: this.special,
      locked_until_xp: this.locked_until_xp,
    };
  }

  /**
   * Reconstruct a Card from a plain object (e.g. after JSON.parse).
   * @param {CardData} plain
   * @returns {Card}
   */
  static fromJSON(plain) {
    return new Card(plain);
  }
}
