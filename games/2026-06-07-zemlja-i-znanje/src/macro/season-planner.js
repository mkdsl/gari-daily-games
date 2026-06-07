/**
 * season-planner.js — Logika planning ekrana
 * Koordiniše: tema, polaznici, staff, budget, plan sesije
 */

import { calcTicketPrice, estimateIncome } from './pricing-engine.js';
import { calcCosts, calcProfit, calcSeasonBudget } from './budget.js';
import { getAvailableThemes, getTema } from '../content/masterclass-catalog.js';
import { generateApplicantPool, selectParticipants } from './applicant-pool.js';
import { getAvailableStaff } from './staff-roster.js';
import { generateDefaultPlan, validatePlan } from './curriculum-builder.js';
import { rollWeather, getCurrentSeason } from './weather.js';
import { MIN_PARTICIPANTS } from '../config.js';

/**
 * Inicijalizuje sve podatke za planning screen
 * @param {Object} metaState
 * @param {Object} macroState
 */
export function initPlanningData(metaState, macroState) {
  const rep = metaState.reputation || 0;
  const prestiz = metaState.prestigeLevel || 0;

  const availableThemes = getAvailableThemes(rep, prestiz);
  const availableStaff = getAvailableStaff(metaState.unlockedStaff || ['alatko']);
  const maxParticipants = metaState.maxParticipants || MIN_PARTICIPANTS;
  const carryoverBudget = macroState.carryoverBudget || 0;

  // Default selections
  const defaultTema = availableThemes[0] || 'suvozid';
  const defaultPlan = generateDefaultPlan(defaultTema);

  return {
    availableThemes,
    availableStaff,
    maxParticipants,
    carryoverBudget,
    reputation: rep,
    prestigeLevel: prestiz,
    // Current selections (mutable)
    selections: {
      tema: defaultTema,
      participantCount: Math.min(4, maxParticipants),
      days: getTema(defaultTema)?.duration_days || 1,
      hiredStaff: [],
      plan: defaultPlan
    }
  };
}

/**
 * Update preview kad se nesto promeni
 */
export function updatePlanningPreview(selections, rep, prestigeLevel = 0, resources = {}) {
  const { tema, participantCount, days, hiredStaff } = selections;

  const temaData = getTema(tema);
  const price = calcTicketPrice(tema, rep, prestigeLevel);
  const income = Math.round(participantCount * price);

  const hasCana = hiredStaff.includes('cana');
  const toolDiscount = resources.toolDiscount || 0;
  const costs = calcCosts({
    days,
    participants: participantCount,
    hasStaff: hiredStaff.length > 0,
    staffCount: hiredStaff.length,
    hasCana,
    toolDiscount
  });

  const { profit, carryover } = calcProfit(income, costs.total);
  const budget = calcSeasonBudget(rep) + (resources.carryoverBudget || 0);

  const planValidation = validatePlan(selections.plan);

  return {
    price,
    income,
    costs,
    profit,
    carryover,
    budget,
    canAfford: budget >= 0,
    temaData,
    planValid: planValidation.valid,
    planErrors: planValidation.errors
  };
}

/**
 * Generise kandidate za odabranu sezonu
 */
export function generateCandidates(rep, maxParticipants, seed = Date.now()) {
  const pool = generateApplicantPool(rep, maxParticipants, seed);
  return pool;
}
