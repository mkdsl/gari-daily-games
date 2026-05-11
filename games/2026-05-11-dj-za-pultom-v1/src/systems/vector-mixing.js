// =============================================================================
// systems/vector-mixing.js — V4 Mixing skill
// =============================================================================
import { MIXING } from '../config.js';
import { clamp } from '../util.js';

export function computeMixing(slot, state) {
  const length = slot.session_length ?? 0;
  if (length === 0) return { tierGain: 0, energyCost: 0, timeCost: 0, mixtapeRecogGain: 0 };

  const baseGain = MIXING.base_gain;
  const intensity = MIXING.session_intensity[length] ?? 0;

  let recoveryMod = 1.0;
  if (state.sacrifice.health < MIXING.health_low_threshold) {
    recoveryMod = MIXING.health_low_modifier;
  }

  const tierGain = baseGain * intensity * recoveryMod;
  const timeCost = MIXING.session_time_cost[length] ?? 0;
  const energyCost = MIXING.session_energy_cost[length] ?? 0;

  let mixtapeRecogGain = 0;
  if (slot.record_mixtape && length >= 240) {
    mixtapeRecogGain = MIXING.mixtape_recognizability_gain;
  }

  return { tierGain, timeCost, energyCost, mixtapeRecogGain };
}

export function applyMixing(state, slot) {
  const out = computeMixing(slot, state);
  state.stats.mixing = clamp(state.stats.mixing + out.tierGain, 0, MIXING.tier_max);
  state.stats.recognizability = clamp(state.stats.recognizability + out.mixtapeRecogGain, 0, 7);
  return out;
}
