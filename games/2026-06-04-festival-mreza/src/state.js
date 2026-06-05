/** @module state — macro/micro/meta state shape, localStorage save/load, migration */

import { CONFIG } from './config.js';
import { CITY_ORDER } from './content/cities_data.js';
import { COORDINATORS, getLoyaltyTier } from './content/coordinators_data.js';

/**
 * Get active ability id for coordinator based on static data and loyalty tier
 * @param {object} staticData
 * @param {number} tier 1-5
 * @returns {string|null}
 */
function getActiveAbility(staticData, tier) {
  if (tier >= 5 && staticData.tier5Ability) return staticData.tier5Ability;
  if (tier >= 4 && staticData.tier4Ability) return staticData.tier4Ability;
  if (tier >= 3 && staticData.tier3Ability) return staticData.tier3Ability;
  if (tier >= 2 && staticData.tier2Ability) return staticData.tier2Ability;
  return staticData.tier1Ability || null;
}

// ─────────────────────────────────────────
// MACRO STATE (persisted)
// ─────────────────────────────────────────

/**
 * Create a fresh macro state
 * @param {string} careerTier
 * @returns {MacroState}
 */
export function createMacroState(careerTier = 'rookie') {
  return {
    budget: CONFIG.STARTING_BUDGET_BY_TIER[careerTier] || 2000,
    team_energy: 100,
    reputation: { nis: 0, sarajevo: 0, strand: 0, guncati: 0, avala: 0 },
    connections: 0,
    active_coordinators: [],
    coordinator_loyalty: {},
    current_city_index: 0,
    tour_complete: false,
    promo_investments: [],
    insurance_active: false,
    upgrades_purchased: [],
    city_order: [...CITY_ORDER],
    event_results: [],
    _pendingDialog: null,
    _version: 1,
  };
}

// ─────────────────────────────────────────
// MICRO STATE (ephemeral — never persisted)
// ─────────────────────────────────────────

/**
 * Create a fresh micro state
 * @returns {MicroState}
 */
export function createMicroState() {
  return {
    crowd_groups: [],
    zones: {
      dance_floor: { id: 'dance_floor', capacity: 160, current_crowd: 0, mood_average: 0, overflow_active: false, overflow_timer: 0 },
      bar:         { id: 'bar',         capacity: 100, current_crowd: 0, mood_average: 0, overflow_active: false, overflow_timer: 0 },
      chill:       { id: 'chill',       capacity: 80,  current_crowd: 0, mood_average: 0, overflow_active: false, overflow_timer: 0 },
      stage_front: { id: 'stage_front', capacity: 60,  current_crowd: 0, mood_average: 0, overflow_active: false, overflow_timer: 0 },
    },
    current_bpm: 90,
    floor_temperature: 0,
    satisfaction_points: 0,
    energy_debt: 0,
    incident_queue: [],
    event_time_elapsed: 0,
    event_duration: 180,
    wave_timer: 0,
    peak_phase_triggered: false,
    guest_from_prev_city: null,
    bpm_locked: false,
    bpm_lock_value: null,
    bpm_lock_timer: 0,
    _nisArcTimer: 0,
    _djAnnounceTimer: 0,
    _djAnnouncePending: null,
    _technicianTimer: 0,
    _eventPause: 0,
    _waveIndex: 0,
    _cityId: null,
    _venueCapacity: 200,
  };
}

// ─────────────────────────────────────────
// META STATE (persisted between prestiges)
// ─────────────────────────────────────────

/**
 * Create a fresh meta state
 * @returns {MetaState}
 */
export function createMetaState() {
  return {
    career_tier: 'rookie',
    prestige_count: 0,
    prestige_multiplier: 1.0,
    coordinator_alumni: [],
    veteran_insights: [],
    lifetime_satisfaction: 0,
    lifetime_events: 0,
    achievements: [],
    guncati_unlocked: false,
    challenge_modes_unlocked: false,
    _version: 1,
  };
}

// ─────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────

/**
 * Load macro state from localStorage
 * @param {string} careerTier
 * @returns {MacroState}
 */
export function loadMacroState(careerTier) {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.MACRO);
    if (!raw) return createMacroState(careerTier);
    const parsed = JSON.parse(raw);
    if (!parsed || parsed._version !== 1) return createMacroState(careerTier);

    // Migrate: restore PromoRecord objects
    if (parsed.promo_investments) {
      parsed.promo_investments = parsed.promo_investments.filter(p => p.active !== false);
    }

    // Migrate: restore Coordinator objects — merge saved data with static COORDINATORS data
    if (parsed.active_coordinators && Array.isArray(parsed.active_coordinators)) {
      parsed.active_coordinators = parsed.active_coordinators.map(c => {
        const staticData = COORDINATORS[c.id];
        if (!staticData) return c;
        const loyalty = c.loyalty ?? 0;
        const loyaltyTier = getLoyaltyTier(loyalty);
        return {
          ...staticData,
          id: c.id,
          loyalty,
          usedThisCity: c.usedThisCity ?? false,
          loyaltyTier,
          activeAbility: getActiveAbility(staticData, loyaltyTier),
        };
      });
    }

    return parsed;
  } catch (e) {
    return createMacroState(careerTier);
  }
}

/**
 * Save macro state to localStorage
 * @param {MacroState} macro
 */
export function saveMacroState(macro) {
  try {
    // Coordinators stored as plain objects (class methods not needed at save)
    const serializable = {
      ...macro,
      active_coordinators: macro.active_coordinators.map(c => ({
        id: c.id,
        loyalty: c.loyalty,
        usedThisCity: c.usedThisCity || false,
      })),
    };
    localStorage.setItem(CONFIG.STORAGE_KEYS.MACRO, JSON.stringify(serializable));
  } catch (e) {
    // Quota exceeded — ignore
  }
}

/**
 * Load meta state from localStorage
 * @returns {MetaState}
 */
export function loadMetaState() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.META);
    if (!raw) return createMetaState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed._version !== 1) return createMetaState();
    return parsed;
  } catch (e) {
    return createMetaState();
  }
}

/**
 * Save meta state to localStorage
 * @param {MetaState} meta
 */
export function saveMetaState(meta) {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.META, JSON.stringify(meta));
  } catch (e) {}
}

/**
 * Reset all saved data
 */
export function resetAllSaves() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.MACRO);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.META);
}

/**
 * Restore Coordinator class instances from saved plain objects
 * (Call after loadMacroState)
 * @param {MacroState} macro
 */
export function restoreCoordinatorInstances(macro) {
  // Import is circular-safe since we only need Coordinator class here
  // Coordinators are restored lazily by the coordinator_manager
  // For now, active_coordinators stores plain objects; macro_engine reads .id, .loyalty directly
}
