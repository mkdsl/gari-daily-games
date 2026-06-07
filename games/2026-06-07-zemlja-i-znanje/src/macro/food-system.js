/**
 * food-system.js — Cana konzervacija, hrana iz prethodne sezone
 */

import { COST_FOOD_PER_PARTICIPANT_PER_DAY, FOOD_DISCOUNT } from '../config.js';

/**
 * Izracunava trošak hrane sa Cana bonus-om
 */
export function calcFoodCost(participants, days, hasCana = false, stockpile = 0) {
  const baseCost = COST_FOOD_PER_PARTICIPANT_PER_DAY * participants * days;
  const discount = hasCana ? FOOD_DISCOUNT : 0;

  // Stockpile smanjuje trošak (1 unit = 1 obrok za 1 osobu)
  const mealsTotal = participants * days;
  const stockpileUsed = Math.min(stockpile, mealsTotal);
  const stockpileValue = stockpileUsed * COST_FOOD_PER_PARTICIPANT_PER_DAY;

  const discountedCost = baseCost * (1 - discount);
  const finalCost = Math.max(0, discountedCost - stockpileValue);

  return {
    baseCost: Math.round(baseCost),
    finalCost: Math.round(finalCost),
    stockpileUsed,
    savings: Math.round(baseCost - finalCost)
  };
}

/**
 * Generise stockpile posle sezone (Cana)
 * @param {number} participants
 * @param {number} days
 * @param {number} satisfaction — ako je visoko, manje ostataka
 */
export function generateStockpile(participants, days, satisfaction = 0.7) {
  const surplusRate = 0.3 - (satisfaction * 0.2); // visoko zadovoljstvo = manje ostataka (pojeli sve)
  const meals = participants * days;
  return Math.round(meals * Math.max(0.05, surplusRate));
}

/**
 * Pauza benefit sa Cana hranom
 */
export function getPausaEnergyBonus(hasCana) {
  return hasCana ? 5 : 0;
}
