// =============================================================================
// systems/path-tracker.js — Emergent path progress
// =============================================================================
import { PATHS } from '../config.js';
import { getAvgSetQuality, recklessSuccessRate } from '../state.js';

export function evaluatePaths(state) {
  const avgSetQuality = getAvgSetQuality(state);
  const recklessRate = recklessSuccessRate(state);
  const allSacrificeAbove30 = state.sacrifice.health > 30 && state.sacrifice.odnosi > 30 && state.sacrifice.normalnost > 30;
  const allSacrificeAbove40 = state.sacrifice.health >= 40 && state.sacrifice.odnosi >= 40 && state.sacrifice.normalnost >= 40;
  const allSacrificeAbove50 = state.sacrifice.health > 50 && state.sacrifice.odnosi > 50 && state.sacrifice.normalnost > 50;
  const allSacrificeZero = state.sacrifice.health <= 0 && state.sacrifice.odnosi <= 0 && state.sacrifice.normalnost <= 0;
  const totalMoneyTracked = state.money; // simplified

  const achieved = [];

  // Pro Set
  if (state.stats.reputation >= 3 && avgSetQuality >= 70 && allSacrificeAbove30) {
    achieved.push('pro_set');
  }

  // Peak Maker
  if (state.stats.visual >= 5 && state.stats.recognizability >= 4 && recklessRate >= 0.6) {
    achieved.push('peak_maker');
  }

  // Survivor (klasna)
  if (allSacrificeAbove50 && avgSetQuality >= 60 &&
      (state.class_key === 'posthumna_penzija' || state.class_key === 'radnicka_klasa') &&
      state.money >= 0) {
    achieved.push('survivor');
  }

  // Networker
  if (state.stats.network >= 5 &&
      state.path_progress.reputation_events_triggered >= 4 &&
      state.crew_loyalty >= 0.8) {
    achieved.push('networker');
  }

  // Hustler
  if (totalMoneyTracked > 5000 && state.stats.reputation >= 3 && !allSacrificeZero) {
    achieved.push('hustler');
  }

  // Underground Craftsman
  if (state.stats.knowledge >= 5 && recklessRate >= 0.4 && state.stats.reputation >= 2) {
    achieved.push('underground_craftsman');
  }

  // Reckless Selector
  if (recklessRate >= 0.7 &&
      state.stats.knowledge >= 4 &&
      state.stats.recognizability >= 3 &&
      state.path_progress.signature_picks_success >= 12) {
    achieved.push('reckless_selector');
  }

  // The Lasting DJ
  if (achieved.includes('pro_set') && allSacrificeAbove40 && state.hobby_weeks_used >= 8) {
    achieved.push('the_lasting_dj');
    state.flags.lasting_dj = true;
  }

  // The Tragic Genius
  if (allSacrificeZero) {
    achieved.push('the_tragic_genius');
  }

  return achieved;
}

export function getPrimaryPath(achieved) {
  // Priority order for display
  const priority = [
    'the_lasting_dj',
    'reckless_selector',
    'underground_craftsman',
    'peak_maker',
    'networker',
    'hustler',
    'survivor',
    'pro_set',
    'the_tragic_genius'
  ];
  for (const p of priority) {
    if (achieved.includes(p)) return p;
  }
  return null;
}
