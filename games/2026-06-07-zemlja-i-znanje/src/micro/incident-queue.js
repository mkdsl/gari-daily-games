/**
 * incident-queue.js — Red incidenata, push/pop, cooldown, max 1 aktivan
 */

import { bus, EVT } from '../events.js';
import { trySpawnIncident, activateIncident, clearActiveIncident } from './incident-generator.js';

/**
 * Pokušava spawn i emituje EVT.INCIDENT_TRIGGER ako uspije
 */
export function processIncidentQueue(microState, realDeltaSeconds, context) {
  if (microState.activeIncident) return; // max 1 aktivan

  const incident = trySpawnIncident(microState, realDeltaSeconds, context);
  if (incident) {
    activateIncident(microState, incident);
    bus.emit(EVT.INCIDENT_TRIGGER, { incident: microState.activeIncident });
  }
}

/**
 * Resolve incident sa odabranom opcijom
 * @returns {Object} efekat
 */
export function resolveIncident(microState, optionIndex) {
  if (!microState.activeIncident) return null;

  const incident = microState.activeIncident;
  const option = incident.options?.[optionIndex];
  if (!option) return null;

  const effect = option.effect || {};

  // Record u history
  if (!microState.incidentHistory) microState.incidentHistory = [];
  microState.incidentHistory.push({
    incidentId: incident.id,
    optionIndex,
    effect,
    gameMinute: microState.gameMinute,
    optionText: option.text
  });

  microState.incidentCount = (microState.incidentCount || 0) + 1;

  // Clear active
  clearActiveIncident(microState);

  bus.emit(EVT.INCIDENT_RESOLVED, { incidentId: incident.id, optionIndex, effect });

  return effect;
}

/**
 * Timeout — auto-resolve sa neutral efektom
 */
export function timeoutIncident(microState) {
  if (!microState.activeIncident) return;
  const incident = microState.activeIncident;

  if (!microState.incidentHistory) microState.incidentHistory = [];
  microState.incidentHistory.push({
    incidentId: incident.id,
    optionIndex: -1,
    effect: { satisfaction: -5 },
    gameMinute: microState.gameMinute,
    optionText: 'Timeout'
  });

  clearActiveIncident(microState);
  bus.emit(EVT.INCIDENT_TIMEOUT, { incidentId: incident.id, effect: { satisfaction: -5 } });
}
