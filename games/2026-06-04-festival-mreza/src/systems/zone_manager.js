/** @module systems/zone_manager — zone state updates, overflow detection */

import { CONFIG } from '../config.js';

/**
 * Sync all zones from current crowd groups
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} crowdGroups
 */
export function syncZones(zones, crowdGroups) {
  for (const zone of Object.values(zones)) {
    zone.syncFromGroups(crowdGroups);
  }
}

/**
 * Update overflow state for all zones
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {number} dt
 * @param {number} overflowThresholdFactor
 * @returns {string[]} zoneIds newly entering overflow
 */
export function updateZoneOverflow(zones, dt, overflowThresholdFactor = 1.1) {
  const newOverflows = [];
  for (const zone of Object.values(zones)) {
    const wasOverflow = zone.overflow_active;
    zone.updateOverflow(dt, overflowThresholdFactor);
    if (zone.overflow_active && !wasOverflow) {
      newOverflows.push(zone.id);
    }
  }
  return newOverflows;
}

/**
 * Calculate average zone utilization
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @returns {number} 0-1
 */
export function getAverageZoneUtilization(zones) {
  const zoneList = Object.values(zones);
  if (zoneList.length === 0) return 0;
  const total = zoneList.reduce((s, z) => s + Math.min(1, z.utilization), 0);
  return total / zoneList.length;
}

/**
 * Count overflow zones
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @returns {number}
 */
export function countOverflowZones(zones) {
  return Object.values(zones).filter(z => z.overflow_active).length;
}

/**
 * Calculate floor temperature
 * floor_temp = (bpm - 90) / 48 * 0.6 + (dance_floor.utilization) * 0.4
 * @param {number} bpm
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @returns {number} 0-1
 */
export function calculateFloorTemp(bpm, zones) {
  const bpmFactor = Math.max(0, Math.min(1, (bpm - 90) / 48));
  const dfUtil = zones.dance_floor ? Math.min(1, zones.dance_floor.utilization) : 0;
  return bpmFactor * 0.6 + dfUtil * 0.4;
}

/**
 * Check if any zone needs CROWDOVERFLOW incident
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {string[]} veteranInsights
 * @returns {{ zoneId:string, severity:'MEDIUM'|'HIGH' }|null}
 */
export function checkOverflowIncident(zones, veteranInsights = []) {
  const mediumDelay = veteranInsights.includes('vi_incident_delay') ? 15 : 0;

  for (const zone of Object.values(zones)) {
    if (!zone.overflow_active) continue;
    const highThreshold = CONFIG.OVERFLOW_HIGH_TIME + mediumDelay;
    const mediumThreshold = CONFIG.OVERFLOW_MEDIUM_TIME + mediumDelay;

    if (zone.overflow_timer >= highThreshold) {
      return { zoneId: zone.id, severity: 'HIGH' };
    }
    if (zone.overflow_timer >= mediumThreshold) {
      return { zoneId: zone.id, severity: 'MEDIUM' };
    }
  }
  return null;
}

/**
 * Apply VIP zone if V2 upgrade purchased
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {import('../entities/zone.js').Zone} VIPZone
 */
export function addVIPZone(zones, VIPZone) {
  zones['vip'] = VIPZone;
}
