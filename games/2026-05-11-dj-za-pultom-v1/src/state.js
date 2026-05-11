// =============================================================================
// state.js — Game state shape, save/load, kreiranje novog state-a
// =============================================================================

import { SAVE_KEY, CLASS_MODIFIERS, WEEKS_PER_SEASON } from './config.js';
import { deepCopy } from './util.js';

export function createNewState() {
  return {
    version: '0.1.0-scaffold',
    season: 1,
    week: 1,
    scene: 'splash',  // splash → origin → macro → micro → recap → finale

    origin: {
      class_key: null,
      class_name: null,
      custom_preset: null,      // izabran custom-path key kad je class='custom' (Jova 2026-05-11)
      answers: {
        q1_class: null,         // klasna pozadina
        q2_observed_djs: null,  // kako gledao DJ-eve
        q3_signature_taste: null, // signature ukus (single_choice value) — Jova 2026-05-11
        q4_first_decks: null,   // ko te pustio prvi put
        q5_apstinencija: null,  // 'apstinent' / 'drustveno' / 'scene_fitted' / 'dj_navike'
        custom_preset: null     // u answers takodje (mirror)
      }
    },

    // Klasna konstantna oznaka
    class_key: null,

    // Macro stat-ovi (tier 0-7)
    stats: {
      knowledge: 0,
      mixing: 0,
      visual: 0,
      network: 0,
      recognizability: 0,
      reputation: 0
    },

    // Money/Energy
    money: 0,
    energy: 100,
    rsvp_next: 0,

    // Žrtvovanje (0-100)
    sacrifice: {
      health: 100,
      odnosi: 100,
      normalnost: 100
    },

    // Music katalog
    music_catalog: {
      total_tracks: 0,
      avg_freshness: 1.0,
      tracks: []  // {bpm, key, name, freshness}
    },

    // Knowledge baseline (slow accumulator iz V2)
    knowledge_baseline: 0,

    // Fitness baseline (V5 fitness cumulative)
    fitness_baseline: 0,

    // Sljakanje (samo rad-klasa)
    sljakanje_pct: 60,  // default 60%

    // Apstinencija (origin C5)
    apstinent: false,

    // Pušenje (origin sub-toggle)
    pusi: false,

    // Pera nudges arhiva
    pera_log: [],

    // History — nedeljna agregacija
    week_log: [],

    // Žurke odigrane
    gigs_played: [],   // {week, quality, atmosphere, pre_drinks, signature_picks_success}

    // Path tracker (akumulira ka path conditions)
    path_progress: {
      pro_set_progress: 0,
      networker_progress: 0,
      reckless_selector_progress: 0,
      reputation_events_triggered: 0,
      signature_picks_attempted: 0,
      signature_picks_success: 0
    },

    // Pasoš pečati
    pecati: 0,
    crew_loyalty: 0,

    // Reckless Selection breakthrough chance (akumulira iz V8 hobby)
    reckless_breakthrough_chance: 0,

    // Cumulative hobby week count (Lasting DJ condition)
    hobby_weeks_used: 0,

    // Flag-ovi
    flags: {
      hard_fail_health: false,
      hard_fail_bankrupt: false,
      identity_crisis: false,
      tragic_genius: false,
      lasting_dj: false,
      season_lost: false,
      season_completed: false
    },

    // Money tracking za Hard Fail 2
    weeks_with_negative_balance: 0,

    // Cumulative set quality (avg)
    cumulative_set_quality_sum: 0,
    cumulative_set_quality_count: 0,

    // Reputation events triggered list
    reputation_events: [],

    // Recognizability decay multiplier (cascade)
    recognizability_decay_multiplier: 1.0,

    // Forced recovery (Hard Fail 1)
    forced_recovery_weeks: 0,

    // Plan za sledecu nedelju (Macro week input)
    next_week_plan: null,

    // Build/audit
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function applyClassToState(state, classKey) {
  const mod = CLASS_MODIFIERS[classKey];
  if (!mod) return state;

  state.class_key = classKey;
  state.origin.class_key = classKey;
  state.origin.class_name = mod.name;

  // Initialize stat tier-ove iz klasne pozadine (0-100% → tier 0-7)
  state.stats.knowledge = (mod.knowledge_start_pct / 100) * 7;
  state.stats.network = (mod.network_start_pct / 100) * 7;
  state.stats.recognizability = (mod.recognizability_start_pct / 100) * 7;
  state.stats.visual = (mod.visual_start_pct / 100) * 7;
  state.stats.mixing = (mod.mixing_start_pct / 100) * 7;

  // Money baseline (0-100% → 0-2000 RSD start cash)
  state.money = (mod.money_baseline_pct / 100) * 2000;

  // Žrtvovanje start
  state.sacrifice.health = mod.health_start;
  state.sacrifice.odnosi = mod.odnosi_start;
  state.sacrifice.normalnost = mod.normalnost_start;

  return state;
}

export function applyOriginAnswers(state) {
  // Apstinencija (q5)
  if (state.origin.answers.q5_apstinencija === 'apstinent') {
    state.apstinent = true;
  }
  // ostali q1-q4 utiču na finije narativne flag-ove kasnije — Sine integration
  return state;
}

export function saveState(state) {
  state.updated_at = new Date().toISOString();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('saveState failed', e);
    return false;
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('loadState failed', e);
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export function getAvgSetQuality(state) {
  if (state.cumulative_set_quality_count === 0) return 0;
  return state.cumulative_set_quality_sum / state.cumulative_set_quality_count;
}

export function isSeasonOver(state) {
  return state.week > WEEKS_PER_SEASON
      || state.flags.season_lost
      || state.flags.season_completed;
}

export function recklessSuccessRate(state) {
  if (state.path_progress.signature_picks_attempted === 0) return 0;
  return state.path_progress.signature_picks_success / state.path_progress.signature_picks_attempted;
}

export function snapshotForLog(state) {
  return {
    week: state.week,
    stats: deepCopy(state.stats),
    sacrifice: deepCopy(state.sacrifice),
    money: state.money,
    rsvp_next: state.rsvp_next,
    energy: state.energy
  };
}
