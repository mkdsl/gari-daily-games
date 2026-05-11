// =============================================================================
// systems/vector-reckless.js — V9 Reckless Selection (passive tracking)
// =============================================================================
import { RECKLESS } from '../config.js';
import { clamp } from '../util.js';

export function isUnlocked(state) {
  return state.stats.knowledge >= RECKLESS.gating_knowledge_tier;
}

export function tryRecklessPick(state, isUniqueTrack) {
  if (!isUnlocked(state)) return { attempted: false };
  state.path_progress.signature_picks_attempted += 1;

  // Gated success (Knowledge ≥ 3 & track unique)
  const gated = isUniqueTrack && state.stats.knowledge >= 3;
  const successChance = gated ? 0.55 : 0.30;
  const breakthroughBonus = state.reckless_breakthrough_chance;
  const finalChance = Math.min(0.85, successChance + breakthroughBonus);

  const success = Math.random() < finalChance;
  let atmosphere;
  if (success) {
    atmosphere = gated ? RECKLESS.peak_unique_gated : RECKLESS.peak_ungated;
    state.path_progress.signature_picks_success += 1;
    if (atmosphere >= RECKLESS.success_threshold) {
      state.stats.recognizability = clamp(
        state.stats.recognizability + RECKLESS.recognizability_per_success,
        0, 7
      );
    }
  } else {
    atmosphere = gated ? RECKLESS.drop_unique_gated : RECKLESS.drop_ungated;
  }

  // breakthrough chance "consumed"
  state.reckless_breakthrough_chance = Math.max(0, state.reckless_breakthrough_chance - 0.05);

  return { attempted: true, success, atmosphere, gated };
}

export function getRecklessSuccessRate(state) {
  if (state.path_progress.signature_picks_attempted === 0) return 0;
  return state.path_progress.signature_picks_success / state.path_progress.signature_picks_attempted;
}
