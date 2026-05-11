// =============================================================================
// systems/recognizability.js — Recognizability tier + decay
// =============================================================================
import { RECOGNIZABILITY, CASCADE } from '../config.js';
import { clamp } from '../util.js';

export function applyRecognizabilityDecay(state) {
  // Decay if Normalnost low
  if (state.sacrifice.normalnost <= CASCADE.normalnost.identity_crisis_threshold) {
    const decay = RECOGNIZABILITY.decay_per_week_if_normalnost_low
                * state.recognizability_decay_multiplier;
    state.stats.recognizability = clamp(state.stats.recognizability - decay, 0, RECOGNIZABILITY.tier_max);
  }
}

export function getRecognizabilityModifier(tier) {
  return RECOGNIZABILITY.tier_modifier(tier);
}
