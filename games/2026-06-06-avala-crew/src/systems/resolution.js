/**
 * resolution.js — resolveScenario() čista funkcija
 * Jova jQuery @ Gari Daily Games 2026-06-06
 *
 * Formula:
 * 1. Za svaki crew member: memberContribution = scenario_primary_stat × roleMultiplier × aftermathModifier
 * 2. CrewScore = Σ(memberContributions) + passiveTraitBonuses + abilityBonuses + synergyBonuses
 * 3. Poređenje sa thresholdima → outcome
 * 4. scoreGained = WIN: baseScore × (1 + (CrewScore - threshold) / 20) capped 1.5×
 *                  PARTIAL: 0.5× baseScore; FAIL: 0
 */

import { AFTERMATH_STACK_MAX, NIGHT_SCORE_CAP } from '../config.js';
import { applyAftermathToStat } from './aftermath.js';

/**
 * Core scenario resolution function — pure, no state mutation
 *
 * @param {import('../entities/crewMember.js').CrewMember[]} crew
 * @param {import('../entities/scenario.js').Scenario} scenario
 * @param {Object[]} aftermathStack
 * @param {Object} appliedAbilities - {[memberId]: Object} ability results pre-applied
 * @param {Object[]} activeSynergies - [{synergyId, memberIds, effect}]
 * @param {Object} [options] - Additional options
 * @param {string} [options.currentPhase] - For phase-specific bonuses
 * @param {number} [options.peakPhaseBonus] - Tonović ability: peak phase bonus
 * @param {boolean} [options.aftermathFrozen] - Guncati ability: aftermath frozen
 * @param {number} [options.nightScore] - Current night score (for conditional passives)
 * @returns {{
 *   outcome: 'win'|'partial'|'fail',
 *   scoreGained: number,
 *   crewScore: number,
 *   memberContributions: Object[],
 *   newAftermath: Object|null,
 *   passiveBonuses: string[],
 *   abilityBonuses: string[],
 *   synergyBonuses: string[]
 * }}
 */
export function resolveScenario(crew, scenario, aftermathStack, appliedAbilities = {}, activeSynergies = [], options = {}) {
  const { currentPhase = 'gathering', peakPhaseBonus = 0, aftermathFrozen = false, nightScore = 0 } = options;

  const passiveBonuses = [];
  const abilityBonuses = [];
  const synergyBonuses = [];
  let memberContributions = [];
  let forcedOutcome = null;
  let forceMinOutcome = null;
  let abilityScoreBonus = 0;
  let passiveScoreBonus = 0;

  // ── Step 1: Per-member contributions ─────────────────────────
  for (const member of crew) {
    let contribution = member.getContribution(scenario.type);

    // Apply aftermath modifiers to this stat (if not frozen)
    if (!aftermathFrozen && aftermathStack.length > 0) {
      const statKey = scenario.type === 'X' ? null : scenario.type;
      if (statKey) {
        const modifiedStat = applyAftermathToStat(
          member.effectiveStats[statKey] || 0,
          statKey,
          aftermathStack
        );
        // Recalculate contribution with modified stat
        const originalStat = member.effectiveStats[statKey] || 0;
        if (originalStat > 0) {
          contribution = contribution * (modifiedStat / originalStat);
        }
      }
    }

    memberContributions.push({
      memberId: member.id,
      name: member.name,
      role: member.role,
      contribution: Math.max(0, contribution)
    });
  }

  let crewScore = memberContributions.reduce((sum, c) => sum + c.contribution, 0);

  // ── Step 2: Passive trait bonuses ────────────────────────────
  for (const member of crew) {
    const passive = member.passiveTrait;
    if (!passive) continue;

    let passiveResult = null;

    switch (passive.trigger) {
      case 'scenario_resolve':
        // Pass in appropriate context
        passiveResult = member.applyPassive(crewScore, scenario, currentPhase, { nightScore, aftermathStack });
        break;
      case 'always':
        passiveResult = member.applyPassive();
        break;
      default:
        break;
    }

    if (passiveResult) {
      if (passiveResult.scoreMultiplier) {
        crewScore *= passiveResult.scoreMultiplier;
        passiveBonuses.push(passiveResult.message || `${member.name}: ${passiveResult.scoreMultiplier}× bonus`);
      }
      if (passiveResult.scoreBonus) {
        passiveScoreBonus += passiveResult.scoreBonus;
        passiveBonuses.push(passiveResult.message || `${member.name}: +${passiveResult.scoreBonus} score`);
      }
      if (passiveResult.forceMinOutcome) {
        forceMinOutcome = passiveResult.forceMinOutcome;
        passiveBonuses.push(`${member.name}: minimum outcome = ${passiveResult.forceMinOutcome}`);
      }
      if (passiveResult.preventExhausted) {
        passiveBonuses.push(`${member.name}: nema Exhausted status`);
      }
    }
  }

  // ── Step 3: Pre-applied ability bonuses ──────────────────────
  for (const [memberId, abilityResult] of Object.entries(appliedAbilities)) {
    if (!abilityResult) continue;

    if (abilityResult.forceOutcome) {
      // Check if the ability is applicable (e.g., Bojan solo only on P scenarios)
      if (abilityResult.forceOutcome === 'win' &&
          (scenario.type === 'P' || abilityResult.anyType)) {
        forcedOutcome = 'win';
        abilityBonuses.push(`${memberId}: auto-WIN (ability)`);
      }
    }
    if (abilityResult.overrideOutcome === 'partial') {
      if (forcedOutcome !== 'win') {
        forceMinOutcome = 'partial';
        abilityBonuses.push(`${memberId}: minimum partial (ability)`);
      }
    }
    if (abilityResult.scoreBonus) {
      // scoreBonus from abilities applied in outro/score, not here
    }
    if (abilityResult.skipScenario) {
      // Lena shortcut: neutral outcome
      return {
        outcome: 'partial',
        scoreGained: abilityResult.neutralScore || 5,
        crewScore: 0,
        memberContributions,
        newAftermath: null,
        passiveBonuses: [],
        abilityBonuses: ['Lena prečica — preskočeno!'],
        synergyBonuses: []
      };
    }
  }

  // ── Step 4: Synergy bonuses ───────────────────────────────────
  for (const syn of activeSynergies) {
    if (!syn || !syn.effect) continue;
    const eff = syn.effect;

    const synApplies = (
      eff.scenarioType === scenario.type ||
      (Array.isArray(eff.scenarioTypes) && eff.scenarioTypes.includes(scenario.type))
    );

    if (synApplies && eff.bonus) {
      crewScore *= (1 + eff.bonus);
      synergyBonuses.push(`${syn.synergyId || ''}: +${Math.round(eff.bonus * 100)}% (synergy)`);
    }
    if (synApplies && eff.type === 'floor_guarantee') {
      forceMinOutcome = eff.minOutcome || 'partial';
      synergyBonuses.push(`Sinergija: minimum ${eff.minOutcome}`);
    }
    if (eff.type === 'fail_immunity' && eff.scenarioType === scenario.type) {
      if (!forceMinOutcome) forceMinOutcome = 'partial';
      synergyBonuses.push(`Sinergija: fail immunity`);
    }
  }

  // ── Step 5: Phase bonus (peak Tonović ability) ────────────────
  if (currentPhase === 'peak' && peakPhaseBonus > 0) {
    crewScore *= (1 + peakPhaseBonus);
    abilityBonuses.push(`Tonović Peak Set: +${Math.round(peakPhaseBonus * 100)}%`);
  }

  // ── Step 6: Determine outcome ─────────────────────────────────
  let outcome;
  if (forcedOutcome) {
    outcome = forcedOutcome;
  } else {
    if (crewScore >= scenario.successThreshold) {
      outcome = 'win';
    } else if (crewScore >= scenario.partialThreshold) {
      outcome = 'partial';
    } else {
      outcome = 'fail';
    }
    // Apply minimum outcome floor
    if (forceMinOutcome) {
      if (forceMinOutcome === 'partial' && outcome === 'fail') outcome = 'partial';
      if (forceMinOutcome === 'win' && outcome !== 'win') outcome = 'win';
    }
  }

  // ── Step 7: Calculate score gained ───────────────────────────
  let scoreGained = 0;
  if (outcome === 'win') {
    const excessRatio = (crewScore - scenario.successThreshold) / 20;
    const multiplier = Math.min(1 + Math.max(0, excessRatio), 1.5);
    scoreGained = Math.round(scenario.baseScore * multiplier);
  } else if (outcome === 'partial') {
    scoreGained = Math.round(scenario.baseScore * 0.5);
  } else {
    scoreGained = 0;
  }

  // Passive score bonus (e.g., Ana's webs, Ivana's content machine)
  scoreGained += passiveScoreBonus;
  scoreGained = Math.max(0, scoreGained);

  // ── Step 8: Determine aftermath ───────────────────────────────
  const newAftermath = scenario.getAftermath ? scenario.getAftermath(outcome) : null;

  return {
    outcome,
    scoreGained,
    crewScore: Math.round(crewScore * 10) / 10,
    memberContributions,
    newAftermath,
    passiveBonuses,
    abilityBonuses,
    synergyBonuses
  };
}

/**
 * Apply score gained to night score, respecting cap
 * @param {number} currentScore
 * @param {number} scoreGained
 * @returns {number}
 */
export function applyScoreGained(currentScore, scoreGained) {
  return Math.min(currentScore + scoreGained, NIGHT_SCORE_CAP);
}
