/**
 * budget.js — Budžet kalkulacija — prihodi, troškovi, carry-over
 */

import {
  BASE_BUDGET,
  COST_MATERIALS_PER_DAY,
  COST_FOOD_PER_PARTICIPANT_PER_DAY,
  COST_STAFF_HONORAR_PER_DAY,
  PROFIT_CARRYOVER_RATIO,
  TOOL_DISCOUNT,
  FOOD_DISCOUNT
} from '../config.js';

/**
 * Kalkuliše ukupni budžet za sezonu
 * @param {number} reputation
 * @returns {number}
 */
export function calcSeasonBudget(reputation) {
  return Math.round(BASE_BUDGET + reputation * 0.5);
}

/**
 * Kalkuliše prihode od masterclass-a
 * @param {number} participants
 * @param {number} pricePerPerson
 * @returns {number}
 */
export function calcIncome(participants, pricePerPerson) {
  return Math.round(participants * pricePerPerson);
}

/**
 * Kalkuliše troškove sesije
 * @param {Object} params
 * @param {number} params.days
 * @param {number} params.participants
 * @param {boolean} params.hasStaff
 * @param {number} params.staffCount
 * @param {boolean} params.hasCana — Cana Ćup food discount
 * @param {number} params.toolDiscount — 0-0.2
 */
export function calcCosts({ days, participants, hasStaff = false, staffCount = 0, hasCana = false, toolDiscount = 0 }) {
  const materijali = COST_MATERIALS_PER_DAY * days;
  const hrana = COST_FOOD_PER_PARTICIPANT_PER_DAY * participants * days;
  const honorar = hasStaff ? COST_STAFF_HONORAR_PER_DAY * days * staffCount : 0;

  const foodMod = hasCana ? (1 - FOOD_DISCOUNT) : 1;
  const toolMod = 1 - toolDiscount;

  const total = Math.round(
    (materijali * toolMod) +
    (hrana * foodMod) +
    honorar
  );

  return {
    materijali: Math.round(materijali * toolMod),
    hrana: Math.round(hrana * foodMod),
    honorar: Math.round(honorar),
    total
  };
}

/**
 * Izracunava profit i carry-over
 * @param {number} income
 * @param {number} costs
 * @returns {{ profit, carryover }}
 */
export function calcProfit(income, costs) {
  const profit = income - costs;
  const carryover = Math.max(0, Math.round(profit * PROFIT_CARRYOVER_RATIO));
  return { profit, carryover };
}

/**
 * Full budget summary za planning screen
 */
export function buildBudgetSummary(options) {
  const {
    tema, participants, days, rep,
    hasStaff, staffCount, hasCana, toolDiscount,
    carryoverBudget = 0, prestigeMultiplierVal = 1.0
  } = options;

  const price = calcPrice(tema, rep);
  const income = calcIncome(participants, price);
  const costs = calcCosts({ days, participants, hasStaff, staffCount, hasCana, toolDiscount });
  const { profit, carryover } = calcProfit(income, costs.total);
  const budget = calcSeasonBudget(rep);

  return {
    budget,
    carryoverBudget,
    totalAvailable: budget + carryoverBudget,
    price,
    income,
    costs,
    profit,
    carryover,
    profitWithPrestige: Math.round(profit * prestigeMultiplierVal),
    canAfford: costs.total <= (budget + carryoverBudget),
    netChange: income - costs.total
  };
}

// Sync import workaround
function await_import_sync() {
  return {
    calcPrice: (tema, rep) => {
      const basePrices = {
        suvozid: 80, inokulacija: 100, rammed_earth: 120,
        permakultura: 130, akvakultura: 150, kombinovani: 200,
        prirodna_gradnja: 140, muzika_prostor: 120, akvakultura_napredna: 180
      };
      const base = basePrices[tema] || 100;
      return Math.min(base * (1 + rep / 200), base * 6);
    }
  };
}

export function calcPrice(tema, rep) {
  const basePrices = {
    suvozid: 80, inokulacija: 100, rammed_earth: 120,
    permakultura: 130, akvakultura: 150, kombinovani: 200,
    prirodna_gradnja: 140, muzika_prostor: 120, akvakultura_napredna: 180
  };
  const base = basePrices[tema] || 100;
  return Math.round(Math.min(base * (1 + rep / 200), base * 6));
}

/**
 * Check da li je sezona finansijski viable
 */
export function isFinanciallyViable(income, costs) {
  return income > costs;
}
