/**
 * incident-generator.js — Proceduralni generator incidenata
 * Weight + seed, intenzitet po dobu dana, cooldown check
 */

import { INCIDENTS } from '../content/incident-library.js';
import { INCIDENT_SPAWN_INTERVAL_SECONDS, INCIDENT_MAX_ACTIVE_EARLY } from '../config.js';
import { getIntensityModifier } from './timing-engine.js';
import { createRng } from '../utils.js';

let _rng = createRng(Date.now());

/**
 * Pokušava da spawnuje incident
 * @param {Object} microState
 * @param {number} realDeltaSeconds
 * @param {Object} context
 * @returns {Object|null} incident ili null
 */
export function trySpawnIncident(microState, realDeltaSeconds, context = {}) {
  if (!microState) return null;
  if (microState.activeIncident) return null; // max 1 aktivan

  const { sessionHour = 0, weatherMod = 1.0, participantStates = [], staff = [], tema = 'suvozid', guidedActive = false } = context;

  // Cooldown check: minimum 90s između spawna
  const now = Date.now();
  const lastSpawn = microState.lastIncidentTime || 0;
  const msSinceLastSpawn = now - lastSpawn;

  if (msSinceLastSpawn < INCIDENT_SPAWN_INTERVAL_SECONDS * 1000) return null;

  // Intensity modifier
  const intensityMod = getIntensityModifier(sessionHour) * weatherMod;

  // Build candidate list
  const currentActivity = context.currentActivity || 'teorija';
  const one_time_used = new Set((microState.incidentHistory || []).map(h => h.incidentId));

  const candidates = INCIDENTS.filter(inc => {
    // One-time check
    if (inc.one_time && one_time_used.has(inc.id)) return false;

    // Cooldown per-incident
    const cooldownMs = (inc.cooldown || 90) * 1000;
    const lastUsed = microState.incidentCooldowns?.[inc.id] || 0;
    if (now - lastUsed < cooldownMs) return false;

    // Staff requirement
    if (inc.requires_staff_hired && staff.length === 0) return false;

    // Time context (simplified check)
    const tc = inc.time_context || [];
    if (!tc.includes('any')) {
      // Map activity to context
      const actCtx = currentActivity === 'prakticni_rad' ? 'prakticni_rad' : 'any';
      const timeCtx = sessionHour < 2 ? 'jutro' : sessionHour < 5 ? 'podne' : 'posle_podne';
      if (!tc.includes(actCtx) && !tc.includes(timeCtx) && !tc.includes('teorija') && !tc.includes('prakticni_rad')) {
        // If time_context has specific times, check them
      }
    }

    return true;
  });

  if (candidates.length === 0) return null;

  // Archetype-weighted selection
  const weightedCandidates = candidates.map(inc => {
    let weight = inc.weight;

    // Participant archetype bias
    for (const pState of participantStates) {
      const arch = ARCHETYPES_CACHE[pState.archetypeId];
      if (arch?.incident_weights?.[inc.id]) {
        weight += arch.incident_weights[inc.id];
      }
    }

    // Tema bias
    const temaObj = TEMA_BIAS_CACHE[tema] || [];
    if (temaObj.includes(inc.id)) weight *= 1.5;

    weight *= intensityMod;
    return { item: inc, weight };
  });

  // Roll: svakih 90s, base chance = max weight / 100
  const maxWeight = Math.max(...weightedCandidates.map(c => c.weight));
  const roll = _rng() * 100;
  const threshold = maxWeight * intensityMod * 10;

  if (roll > threshold) return null;

  // Pick from weighted candidates
  const total = weightedCandidates.reduce((s, c) => s + c.weight, 0);
  let r = _rng() * total;
  for (const c of weightedCandidates) {
    r -= c.weight;
    if (r <= 0) return c.item;
  }
  return weightedCandidates[weightedCandidates.length - 1].item;
}

// Lazy cache for archetype incident weights
const ARCHETYPES_CACHE_LOADED = {};
let ARCHETYPES_CACHE = {};
let TEMA_BIAS_CACHE = {};

// Sync load
import('../content/participant-archetypes.js').then(m => {
  Object.assign(ARCHETYPES_CACHE, m.ARCHETYPES);
});

import('../content/masterclass-catalog.js').then(m => {
  Object.entries(m.MASTERCLASS_CATALOG).forEach(([id, tema]) => {
    TEMA_BIAS_CACHE[id] = tema.incident_bias || [];
  });
});

/**
 * Registruje incident kao aktivan u microState
 */
export function activateIncident(microState, incident) {
  microState.activeIncident = {
    ...incident,
    activatedAt: Date.now(),
    activatedMinute: microState.gameMinute
  };
  microState.lastIncidentTime = Date.now();
  if (!microState.incidentCooldowns) microState.incidentCooldowns = {};
  microState.incidentCooldowns[incident.id] = Date.now();
}

/**
 * Briše aktivan incident
 */
export function clearActiveIncident(microState) {
  microState.activeIncident = null;
}

/**
 * Reseed RNG
 */
export function reseedIncidentRng(seed) {
  _rng = createRng(seed);
}
