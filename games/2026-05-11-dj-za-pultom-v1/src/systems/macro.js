// =============================================================================
// systems/macro.js — Macro week loop orchestrator (Mile sekcija 11.1)
// =============================================================================
import { applyPromo } from './vector-promo.js';
import { applyMusicResearch, decayCatalogFreshness } from './vector-music.js';
import { applyKnowledge } from './vector-knowledge.js';
import { applyMixing } from './vector-mixing.js';
import { applyVisual } from './vector-visual.js';
import { applyScenePresence } from './scene-presence.js';
import { applyFinance } from './finansije.js';
import { applyEnergy } from './vector-energy.js';
import { applySacrificeDrain } from './sacrifice.js';
import { checkCascadeThresholds } from './cascade.js';
import { applyRecognizabilityDecay } from './recognizability.js';
import { evaluatePaths } from './path-tracker.js';
import { GIG_SCHEDULE, SLJAKANJE_TIERS, WEEKS_PER_SEASON } from '../config.js';
import { snapshotForLog } from '../state.js';

export function runWeek(state, plan) {
  const log = {
    week: state.week,
    plan,
    applied: {},
    pre: snapshotForLog(state),
    events: [],
    drainDeltas: null,
    cascadeEvents: [],
    pathsAchieved: []
  };

  // Sljakanje tax adjust (radnicka klasa)
  if (state.class_key === 'radnicka_klasa') {
    const tier = SLJAKANJE_TIERS[state.sljakanje_pct];
    if (tier) {
      // Apply music dev efikasnost bonus — multiplies music vector gains
      // (zalepiti u stage results)
    }
  }

  // Run vectors in order
  log.applied.promo = applyPromo(state, plan.promo ?? {});
  log.applied.music = applyMusicResearch(state, plan.music ?? {});
  log.applied.knowledge = applyKnowledge(state, plan.knowledge ?? {});
  log.applied.mixing = applyMixing(state, plan.mixing ?? {});
  log.applied.visual = applyVisual(state, plan.visual ?? {});
  log.applied.scene = applyScenePresence(state, plan.scene ?? {});
  log.applied.finance = applyFinance(state, plan.finance ?? {});
  log.applied.energy = applyEnergy(state, plan.energy ?? {});

  // Music catalog freshness decay
  decayCatalogFreshness(state);

  // Sacrifice drain
  const slotsAgg = {
    gigs_this_week: state.gigs_this_week ?? 0,
    energy: plan.energy ?? {},
    music_time: log.applied.music.timeCost,
    knowledge_time: log.applied.knowledge.timeCost,
    mixing_time: log.applied.mixing.timeCost,
    total_time_spent: Object.values(log.applied).reduce((sum, a) => sum + (a.timeCost || 0), 0),
    festival_events: 0,
    scene_atmospheric_time: (plan.scene?.atmospheric_count ?? 0) * 8
  };
  log.drainDeltas = applySacrificeDrain(state, slotsAgg);

  // Recognizability decay if Normalnost low
  applyRecognizabilityDecay(state);

  // Cascade check
  log.cascadeEvents = checkCascadeThresholds(state);

  // Path eval (running)
  log.pathsAchieved = evaluatePaths(state);

  // Snapshot post
  log.post = snapshotForLog(state);

  state.week_log.push(log);
  state.week += 1;

  return log;
}

export function getCurrentGigScheduled(state) {
  return GIG_SCHEDULE.default_weeks.includes(state.week);
}

export function getRemainingWeeks(state) {
  return WEEKS_PER_SEASON - state.week + 1;
}
