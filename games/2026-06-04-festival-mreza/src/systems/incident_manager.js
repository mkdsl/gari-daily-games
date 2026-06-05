/** @module systems/incident_manager — incident creation, escalation, turn-based modal */

import { CONFIG } from '../config.js';
import { AudioAPI } from '../audio.js';

/**
 * @typedef {'CROWD_OVERFLOW'|'FLOOR_TOO_COLD'|'EQUIPMENT_FAILURE'} IncidentType
 * @typedef {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} Severity
 */

export class Incident {
  /**
   * @param {object} opts
   * @param {IncidentType} opts.type
   * @param {Severity} opts.severity
   * @param {string} [opts.zoneId]
   * @param {string} [opts.cityId]
   */
  constructor({ type, severity, zoneId = null, cityId = null }) {
    this.id = `inc_${type}_${Date.now()}`;
    this.type = type;
    this.severity = severity;
    this.zoneId = zoneId;
    this.cityId = cityId;
    this.resolved = false;
    this.timerActive = false;   // timer paused while modal is open
    this.createdAt = Date.now();
  }
}

/**
 * Check if FLOOR_TOO_COLD should trigger
 * @param {import('../state.js').MicroState} micro
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} crowdGroups
 * @returns {boolean}
 */
export function shouldTriggerColdFloor(micro, crowdGroups) {
  if (crowdGroups.length === 0) return false;
  const totalCrowd = crowdGroups.reduce((s, g) => s + g.size, 0);
  const coldCrowd = crowdGroups.filter(g => g.mood === 'cold').reduce((s, g) => s + g.size, 0);
  const coldRatio = totalCrowd > 0 ? coldCrowd / totalCrowd : 0;
  return coldRatio > 0.6 && micro.floor_temperature < 0.3 && micro.event_time_elapsed > 30;
}

/**
 * Check if EQUIPMENT_FAILURE should trigger (random, not in Niš)
 * @param {string} cityId
 * @param {number} dt
 * @param {boolean} hasDekiProtection
 * @returns {boolean}
 */
export function checkEquipmentFailure(cityId, dt, hasDekiProtection) {
  if (cityId === 'nis') return false;
  if (hasDekiProtection) return false;
  // ~1.5% chance per minute
  return Math.random() < 0.015 * dt / 60;
}

/**
 * Create and queue an incident
 * @param {import('../state.js').MicroState} micro
 * @param {IncidentType} type
 * @param {Severity} severity
 * @param {object} opts
 */
export function queueIncident(micro, type, severity, opts = {}) {
  // Don't duplicate same type
  if (micro.incident_queue.some(i => i.type === type && !i.resolved)) return;

  const incident = new Incident({ type, severity, ...opts });
  micro.incident_queue.push(incident);
  AudioAPI.onIncident(severity.toLowerCase());
}

/**
 * Get current active (unresolved) incident
 * @param {import('../state.js').MicroState} micro
 * @returns {Incident|null}
 */
export function getActiveIncident(micro) {
  return micro.incident_queue.find(i => !i.resolved) || null;
}

/**
 * Resolve incident with chosen option
 * @param {import('../state.js').MicroState} micro
 * @param {import('../state.js').MacroState} macro
 * @param {string} incidentId
 * @param {number} optionIndex 0,1,2
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} crowdGroups
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {object} upgradeEffects
 * @returns {string} outcome description
 */
export function resolveIncident(micro, macro, incidentId, optionIndex, crowdGroups, zones, upgradeEffects = {}) {
  const incident = micro.incident_queue.find(i => i.id === incidentId);
  if (!incident) return '';

  incident.resolved = true;
  let outcome = '';

  switch (incident.type) {
    case 'CROWD_OVERFLOW': {
      if (optionIndex === 0) {
        // Open emergency exit — cost 80 EUR
        if (macro.budget >= 80) {
          macro.budget -= 80;
          // Move 40% of overflow zone to chill
          const overflowZone = zones[incident.zoneId];
          if (overflowZone) {
            const excess = Math.floor(overflowZone.current_crowd * 0.4);
            const inZone = crowdGroups.filter(g => g.zoneId === incident.zoneId);
            let moved = 0;
            for (const g of inZone) {
              if (moved >= excess) break;
              g.zoneId = 'chill';
              moved += g.size;
            }
            overflowZone.overflow_timer = 0;
          }
          outcome = 'Rezervni izlaz otvoren. 40% prebačeno u Chill.';
        } else {
          outcome = 'Nedovoljan budžet! Overflow nastavlja.';
          incident.resolved = false;
        }
      } else if (optionIndex === 1) {
        // DJ announcement — free, 60% follow, 10s delay
        micro._djAnnounceTimer = 10;
        micro._djAnnouncePending = { zoneId: incident.zoneId, followRate: 0.60 };
        outcome = 'DJ najava: publika sluša (60% follow za 10s).';
      } else {
        // Ignore
        outcome = 'Ignorišeš overflow. Raspoloženje pada.';
        const zone = zones[incident.zoneId];
        if (zone) zone.overflow_timer = 0;  // reset timer but overflow stays
      }
      break;
    }

    case 'FLOOR_TOO_COLD': {
      if (optionIndex === 0) {
        // Spotlight moment — 120 EUR
        if (macro.budget >= 120) {
          macro.budget -= 120;
          crowdGroups.forEach(g => { g.moodValue = Math.min(1, g.moodValue + 0.25); });
          micro.current_bpm = 108;
          outcome = 'Spotlight moment! Sve raspoloženje +0.25, BPM→108.';
        } else {
          outcome = 'Nedovoljan budžet!';
          incident.resolved = false;
        }
      } else if (optionIndex === 1) {
        // Free round — 60 EUR
        if (macro.budget >= 60) {
          macro.budget -= 60;
          crowdGroups.filter(g => g.zoneId === 'bar').forEach(g => {
            g.moodValue = Math.min(1, g.moodValue + 0.2);
          });
          outcome = 'Runda za kuću! Bar publika raspoloženija +0.2.';
        } else {
          outcome = 'Nedovoljan budžet!';
          incident.resolved = false;
        }
      } else {
        // Wait
        outcome = 'Čekaš. Situacija se ne popravlja sama.';
      }
      break;
    }

    case 'EQUIPMENT_FAILURE': {
      const freeTechnician = upgradeEffects.free_technician;
      if (optionIndex === 0) {
        // Technician cost (0 with V5)
        const cost = freeTechnician ? 0 : 200;
        if (macro.budget >= cost) {
          macro.budget -= cost;
          micro._technicianTimer = 15;
          outcome = `Tehničar na putu (${cost} EUR). Rešava za 15s.`;
        } else {
          outcome = `Nedovoljan budžet za tehničara (${cost} EUR)!`;
          incident.resolved = false;
        }
      } else if (optionIndex === 1) {
        // Improvised DJ set
        micro.bpm_locked = true;
        micro.bpm_lock_value = 100;
        micro.bpm_lock_timer = 30;
        micro.current_bpm = 100;
        crowdGroups.forEach(g => { g.moodValue = Math.max(0, g.moodValue - 0.15); });
        outcome = 'Improvizovani set. BPM zaključan na 100 za 30s, mood -0.15.';
      } else {
        // Event pause
        micro._eventPause = 45;
        outcome = 'Pauza eventa 45s. Publika čeka...';
      }
      break;
    }
  }

  return outcome;
}

/**
 * Update incident-related timers
 * @param {import('../state.js').MicroState} micro
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} crowdGroups
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {number} dt
 */
export function updateIncidentTimers(micro, crowdGroups, zones, dt) {
  // DJ announce delay
  if (micro._djAnnounceTimer > 0) {
    micro._djAnnounceTimer -= dt;
    if (micro._djAnnounceTimer <= 0 && micro._djAnnouncePending) {
      const { zoneId, followRate } = micro._djAnnouncePending;
      const inZone = crowdGroups.filter(g => g.zoneId === zoneId);
      for (const g of inZone) {
        const followers = Math.floor(g.size * followRate);
        if (followers > 0) g.zoneId = 'chill';
      }
      micro._djAnnouncePending = null;
    }
  }

  // Technician repair
  if (micro._technicianTimer > 0) {
    micro._technicianTimer -= dt;
  }

  // Event pause
  if (micro._eventPause > 0) {
    micro._eventPause -= dt;
  }
}

/**
 * Count all incidents in both beta reports (for scoring)
 * @param {Incident[]} incidents
 * @param {Severity} severity
 * @returns {number}
 */
export function countIncidentsBySeverity(incidents, severity) {
  return incidents.filter(i => i.severity === severity).length;
}
