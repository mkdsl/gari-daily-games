/**
 * scenario.js — Scenario class/data structure, type definitions
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { getScenarioById } from '../content/scenarios_data.js';
import { SCENARIO_TYPE_LABELS, SCENARIO_TYPE_ICONS } from '../config.js';

/**
 * @typedef {Object} AftermathEffect
 * @property {'buff'|'debuff'|'neutral'} type
 * @property {number} magnitude - percentage as decimal (0.1 = 10%)
 * @property {number} duration - in scenarios
 * @property {string} statAffected - 'E'|'S'|'P'|'L'
 * @property {string} label - human readable
 */

/**
 * @typedef {Object} ScenarioChoice
 * @property {string} text - button label
 * @property {Object} statBonus - {stat: delta}
 * @property {Object} statPenalty - {stat: delta}
 */

/**
 * @typedef {Object} ScenarioResult
 * @property {string} scenarioId
 * @property {'win'|'partial'|'fail'} outcome
 * @property {number} scoreGained
 * @property {number} crewScore - raw crew score before threshold comparison
 * @property {AftermathEffect|null} aftermath
 * @property {string} outcomeText
 */

/**
 * Scenario — runtime wrapper around SCENARIOS_DATA entry
 */
export class Scenario {
  /**
   * @param {string} scenarioId
   */
  constructor(scenarioId) {
    const data = getScenarioById(scenarioId);
    if (!data) throw new Error(`Unknown scenario: ${scenarioId}`);

    this.id = data.id;
    this.name = data.name;
    this.text = data.text;
    this.type = data.type; // 'E'|'S'|'P'|'L'|'X'
    this.baseScore = data.baseScore;
    this.successThreshold = data.successThreshold;
    this.partialThreshold = data.partialThreshold;
    this.phase = data.phase;
    this.winAftermath = data.winAftermath || null;
    this.failAftermath = data.failAftermath || null;
    this.winText = data.winText;
    this.partialText = data.partialText || data.winText;
    this.failText = data.failText;
    this.choices = data.choices || null;
  }

  /**
   * Whether this scenario has choices (player decision point)
   * @returns {boolean}
   */
  get hasChoices() {
    return this.choices !== null;
  }

  /**
   * Type label for display
   * @returns {string}
   */
  get typeLabel() {
    return SCENARIO_TYPE_LABELS[this.type] || this.type;
  }

  /**
   * Type icon for display
   * @returns {string}
   */
  get typeIcon() {
    return SCENARIO_TYPE_ICONS[this.type] || '?';
  }

  /**
   * Get outcome text based on result
   * @param {'win'|'partial'|'fail'} outcome
   * @returns {string}
   */
  getOutcomeText(outcome) {
    switch (outcome) {
      case 'win': return this.winText;
      case 'partial': return this.partialText;
      case 'fail': return this.failText;
      default: return this.text;
    }
  }

  /**
   * Get aftermath for a given outcome
   * @param {'win'|'partial'|'fail'} outcome
   * @returns {AftermathEffect|null}
   */
  getAftermath(outcome) {
    if (outcome === 'win' || outcome === 'partial') {
      return this.winAftermath || null;
    }
    if (outcome === 'fail') {
      return this.failAftermath || null;
    }
    return null;
  }

  /**
   * Get HTML-safe phase display string
   * @returns {string}
   */
  get phaseLabel() {
    const labels = { gathering: 'Sabiranje', peak: 'Vrh', departure: 'Rastanak' };
    return labels[this.phase] || this.phase;
  }
}

/**
 * Build scenarios array for a night from scenario IDs
 * @param {string[]} scenarioIds
 * @returns {Scenario[]}
 */
export function buildScenariosForNight(scenarioIds) {
  return scenarioIds.map(id => new Scenario(id));
}

/**
 * Get phase for a scenario index (0-based, 10 total)
 * @param {number} index - 0-9
 * @returns {'gathering'|'peak'|'departure'}
 */
export function getPhaseForScenarioIndex(index) {
  if (index < 3) return 'gathering';
  if (index < 7) return 'peak';
  return 'departure';
}

/**
 * Type definitions for JSDoc usage
 * @type {Object.<string, string>}
 */
export const SCENARIO_TYPES = {
  E: 'energy',
  S: 'social',
  P: 'dance',
  L: 'logistics',
  X: 'mixed'
};

/**
 * Phase display order
 * @type {string[]}
 */
export const PHASE_ORDER = ['gathering', 'peak', 'departure'];

/**
 * Phase labels in Serbian
 * @type {Object.<string, string>}
 */
export const PHASE_LABELS = {
  gathering: 'Sabiranje',
  peak: 'Vrh',
  departure: 'Rastanak'
};

/**
 * Phase icons
 * @type {Object.<string, string>}
 */
export const PHASE_ICONS = {
  gathering: '🌅',
  peak: '🔥',
  departure: '🌙'
};
