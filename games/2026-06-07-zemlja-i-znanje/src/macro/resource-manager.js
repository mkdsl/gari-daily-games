/**
 * resource-manager.js — Zalihe alata i hrane, carry-over između sezona
 */

import { TOOL_DISCOUNT, FOOD_DISCOUNT } from '../config.js';

/**
 * @typedef {Object} ResourceState
 * @property {number} toolQuality - 0.5-1.0
 * @property {number} toolDiscount - 0-0.20
 * @property {number} foodStockpile - broj jedinica
 * @property {number} foodDiscount - 0-0.25
 * @property {number} carryoverBudget
 */

export function createResourceState() {
  return {
    toolQuality: 1.0,
    toolDiscount: 0,
    foodStockpile: 0,
    foodDiscount: 0,
    carryoverBudget: 0
  };
}

/**
 * Habanje alata posle sesije
 */
export function applyToolWear(resources, days) {
  resources.toolQuality = Math.max(0.5, resources.toolQuality - 0.05 * days);
  return resources;
}

/**
 * Popravka alata (košta)
 * @returns {number} trošak popravke
 */
export function repairTools(resources) {
  const wear = 1.0 - resources.toolQuality;
  const cost = Math.round(wear * 200);
  resources.toolQuality = 1.0;
  return cost;
}

/**
 * Unlock tool discount (450 rep)
 */
export function applyToolDiscount(resources) {
  resources.toolDiscount = TOOL_DISCOUNT;
  return resources;
}

/**
 * Cana unlock: food discount + stockpile
 */
export function applyCanaBonus(resources, surplus) {
  resources.foodDiscount = FOOD_DISCOUNT;
  resources.foodStockpile += surplus;
  return resources;
}

/**
 * Carry-over: 30% profita prelazi u sledecu sezonu
 */
export function applyCarryover(resources, profit) {
  resources.carryoverBudget = Math.max(0, Math.round(profit * 0.30));
  return resources;
}

/**
 * Vraca efektivni cost modifier za alat
 */
export function getToolCostMod(resources) {
  return 1 - resources.toolDiscount;
}

export function getFoodCostMod(resources) {
  return 1 - resources.foodDiscount;
}
