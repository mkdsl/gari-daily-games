/**
 * crewMember.js — CrewMember class: stats, traits, abilities, abilitySpent
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { ROLE_MODIFIERS, GOOD_FIT_BONUS, STAT_LABELS } from '../config.js';
import { getMemberById } from '../content/crew_data.js';

/**
 * CrewMember — runtime wrapper around CREW_DATA entry
 * Holds session-level state (tempStats, abilitySpent)
 */
export class CrewMember {
  /**
   * @param {string} memberId
   * @param {string} role - assigned role for this night
   * @param {Object} globalState - reference to state for ability use
   */
  constructor(memberId, role, globalState) {
    const data = getMemberById(memberId);
    if (!data) throw new Error(`Unknown crew member: ${memberId}`);

    this.id = data.id;
    this.name = data.name;
    this.archetype = data.archetype;
    this.baseStats = { ...data.stats }; // {E, S, P, L}
    this.primaryRole = data.primaryRole;
    this.passiveTrait = data.passiveTrait;
    this.activeAbility = data.activeAbility;
    this.portraitColor = data.portraitColor;
    this.portraitEmoji = data.portraitEmoji;
    this.shortDesc = data.shortDesc || '';
    this.flavorText = data.flavorText || '';
    this.isKluboslavijaCard = data.isKluboslavijaCard || false;

    // Session-level
    this.role = role;
    this.tempStatDeltas = { E: 0, S: 0, P: 0, L: 0 };
    this.abilitySpent = false;
    this.isExhausted = false;
    this._globalState = globalState;
  }

  /**
   * Current stats with temp deltas applied
   * @returns {{E: number, S: number, P: number, L: number}}
   */
  get effectiveStats() {
    return {
      E: Math.max(0, this.baseStats.E + (this.tempStatDeltas.E || 0)),
      S: Math.max(0, this.baseStats.S + (this.tempStatDeltas.S || 0)),
      P: Math.max(0, this.baseStats.P + (this.tempStatDeltas.P || 0)),
      L: Math.max(0, this.baseStats.L + (this.tempStatDeltas.L || 0))
    };
  }

  /**
   * Stat contribution for a given scenario type, considering role modifiers
   * @param {string} scenarioType - 'E'|'S'|'P'|'L'|'X'
   * @returns {number}
   */
  getContribution(scenarioType) {
    const stats = this.effectiveStats;
    const roleMods = ROLE_MODIFIERS[this.role] || {};

    let primary;
    if (scenarioType === 'X') {
      // Mixed: average of all stats
      primary = (stats.E + stats.S + stats.P + stats.L) / 4;
    } else {
      primary = stats[scenarioType] || 0;
    }

    // Apply role modifier for this stat
    const roleMod = roleMods[scenarioType] || 1.0;
    let contribution = primary * roleMod;

    // Good fit bonus
    if (this.role === this.primaryRole) {
      contribution *= (1 + GOOD_FIT_BONUS);
    }

    return contribution;
  }

  /**
   * Apply a temporary stat delta (from aftermath or passive)
   * @param {string} stat
   * @param {number} delta
   */
  applyTempDelta(stat, delta) {
    if (this.tempStatDeltas[stat] !== undefined) {
      this.tempStatDeltas[stat] += delta;
    }
  }

  /**
   * Use active ability (returns result or null if spent/unavailable)
   * @param {...any} args - Passed to ability.use()
   * @returns {Object|null}
   */
  useAbility(...args) {
    if (this.abilitySpent) {
      return { message: `${this.name}: sposobnost već potrošena ove noći.` };
    }
    if (!this.activeAbility || !this.activeAbility.use) return null;
    this.abilitySpent = true;
    return this.activeAbility.use(...args);
  }

  /**
   * Apply passive trait in the given context
   * @param {...any} args
   * @returns {Object|null}
   */
  applyPassive(...args) {
    if (!this.passiveTrait || !this.passiveTrait.apply) return null;
    return this.passiveTrait.apply(...args);
  }

  /**
   * Mark as exhausted (visual indicator, slight debuff)
   */
  setExhausted() {
    this.isExhausted = true;
  }

  /**
   * Get stat bar width percentages for display (0-100)
   * @returns {{E: number, S: number, P: number, L: number}}
   */
  getStatBars() {
    const stats = this.effectiveStats;
    const maxStat = 5;
    return {
      E: Math.round((stats.E / maxStat) * 100),
      S: Math.round((stats.S / maxStat) * 100),
      P: Math.round((stats.P / maxStat) * 100),
      L: Math.round((stats.L / maxStat) * 100)
    };
  }

  /**
   * Summary string for UI display
   * @returns {string}
   */
  getSummaryLine() {
    const stats = this.effectiveStats;
    return `${this.name} [${this.role}] E:${stats.E} S:${stats.S} P:${stats.P} L:${stats.L}`;
  }
}

/**
 * Build a CrewMember array from state.activeCrew + state
 * @param {Object[]} activeCrew - [{memberId, role}]
 * @param {Object} state
 * @returns {CrewMember[]}
 */
export function buildCrewFromState(activeCrew, state) {
  return activeCrew.map(({ memberId, role }) => {
    const cm = new CrewMember(memberId, role, state);
    // Restore spent status from state
    if (state.spentAbilities && state.spentAbilities[memberId]) {
      cm.abilitySpent = true;
    }
    return cm;
  });
}

/**
 * Get the crew member with highest contribution for a given scenario type
 * @param {CrewMember[]} crew
 * @param {string} scenarioType
 * @returns {CrewMember|null}
 */
export function getTopContributor(crew, scenarioType) {
  if (!crew.length) return null;
  return crew.reduce((best, cm) => {
    return cm.getContribution(scenarioType) > best.getContribution(scenarioType) ? cm : best;
  });
}
