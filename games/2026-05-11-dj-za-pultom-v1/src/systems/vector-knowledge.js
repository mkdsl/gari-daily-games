// =============================================================================
// systems/vector-knowledge.js — V3 Knowledge (Mile sekcija 11.3)
// =============================================================================
import { KNOWLEDGE, CLASS_MODIFIERS } from '../config.js';
import { clamp } from '../util.js';

export function computeKnowledge(slot, state) {
  if (!slot.source || (slot.hours ?? 0) <= 0) {
    return { tierGain: 0, moneyCost: 0, timeCost: 0 };
  }
  const baseGain = KNOWLEDGE.base_gain;
  const eff = KNOWLEDGE.source_efficiency[slot.source] ?? 0.7;
  const currentTier = state.stats.knowledge;
  const diminishing = 1 / (1 + Math.pow(currentTier, KNOWLEDGE.diminishing_exponent));

  // Hours multiplier — capped
  const hoursMult = Math.min(slot.hours / 10, 1.5);

  let tierGain = baseGain * eff * diminishing * hoursMult;

  // Posthumna penzija monomania bonus
  if (state.class_key === 'posthumna_penzija') {
    tierGain *= CLASS_MODIFIERS.posthumna_penzija.knowledge_monomania_bonus;
  }

  // Bogata deca underground penalty (only mentor source for first 5 weeks)
  // Actually — bogata se odnosi na reputation gain; knowledge OK

  const moneyCost = KNOWLEDGE.source_money_cost[slot.source] ?? 0;
  const timeCost = Math.max(5, slot.hours);

  return { tierGain, moneyCost, timeCost };
}

export function applyKnowledge(state, slot) {
  const out = computeKnowledge(slot, state);
  state.stats.knowledge = clamp(state.stats.knowledge + out.tierGain, 0, KNOWLEDGE.tier_max);
  state.money -= out.moneyCost;
  return out;
}
