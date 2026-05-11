// =============================================================================
// systems/vector-visual.js — V5 Izgled
// =============================================================================
import { VISUAL, CLASS_MODIFIERS } from '../config.js';
import { clamp } from '../util.js';

export function computeVisual(slot, state) {
  const category = slot.category;
  if (!category || category === 'none') {
    return { tierGain: 0, moneyCost: 0, timeCost: 0, energyCost: 0, fitnessBaselineGain: 0 };
  }
  const costFactor = VISUAL.cost_factor[category] ?? 200;
  const timeCost = VISUAL.time_cost[category] ?? 5;
  const energyCost = VISUAL.energy_cost[category] ?? 2;

  let moneyCost = costFactor;
  let tierGain;

  if (category === 'fitness') {
    moneyCost = 0;
    tierGain = 0.15;
  } else {
    // visual gain proporcionalan trošku
    tierGain = costFactor / 800;
  }

  // Posthumna penzija — visual gain penalty
  if (state.class_key === 'posthumna_penzija') {
    tierGain *= CLASS_MODIFIERS.posthumna_penzija.visual_gain_penalty;
  }

  let fitnessBaselineGain = 0;
  if (category === 'fitness') {
    fitnessBaselineGain = VISUAL.fitness_baseline_gain;
  }

  return { tierGain, moneyCost, timeCost, energyCost, fitnessBaselineGain };
}

export function applyVisual(state, slot) {
  const out = computeVisual(slot, state);
  state.stats.visual = clamp(state.stats.visual + out.tierGain, 0, VISUAL.tier_max);
  state.fitness_baseline = clamp(state.fitness_baseline + out.fitnessBaselineGain, 0, 0.3);
  state.money -= out.moneyCost;
  return out;
}
