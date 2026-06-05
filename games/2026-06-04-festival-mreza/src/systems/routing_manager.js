/** @module systems/routing_manager — redirect button logic, crowd migration */

import { CONFIG } from '../config.js';

/** @type {Array<{from:string, to:string, label:string}>} */
export const REDIRECT_PAIRS = [
  { from: 'dance_floor', to: 'chill',       label: 'Dance → Chill' },
  { from: 'bar',         to: 'dance_floor', label: 'Bar → Dance Floor' },
  { from: 'chill',       to: 'stage_front', label: 'Chill → Stage Front' },
  { from: 'stage_front', to: 'bar',         label: 'Stage Front → Bar' },
];

/**
 * Calculate effective follow rate
 * @param {number} baseRate default 0.70
 * @param {number} coordBoost from coordinator_manager
 * @param {object} upgradeEffects
 * @returns {number} 0-1
 */
export function getEffectiveFollowRate(baseRate, coordBoost, upgradeEffects = {}) {
  const upgradeBonus = upgradeEffects.follow_rate_bonus || 0;
  return Math.min(0.95, baseRate + coordBoost + upgradeBonus);
}

/**
 * Execute a redirect — move crowd from zone to zone
 * @param {string} fromZoneId
 * @param {string} toZoneId
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} crowdGroups
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {number} followRate 0-1
 * @param {number} migrationSpeed px/sec
 * @returns {number} count of people redirected
 */
export function executeRedirect(fromZoneId, toZoneId, crowdGroups, zones, followRate, migrationSpeed) {
  const toZone = zones[toZoneId];
  if (!toZone) return 0;

  const inFromZone = crowdGroups.filter(g => g.zoneId === fromZoneId && !g.migrating);
  if (inFromZone.length === 0) return 0;

  let totalRedirected = 0;
  const targetX = toZone.x + toZone.w / 2;
  const targetY = toZone.y + toZone.h / 2;

  for (const group of inFromZone) {
    // Check if destination zone is near capacity
    if (toZone.current_crowd >= toZone.capacity * 1.2) break;

    const followers = group.startMigration(toZoneId, followRate);
    if (followers > 0) {
      group.targetX = targetX + (Math.random() - 0.5) * toZone.w * 0.4;
      group.targetY = targetY + (Math.random() - 0.5) * toZone.h * 0.4;
      totalRedirected += followers;
    }
  }

  return totalRedirected;
}

/**
 * Update all migrating crowd groups
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} crowdGroups
 * @param {number} migrationSpeed px/sec
 * @param {number} dt
 * @param {string} fromZoneId for bar express upgrade
 * @param {object} upgradeEffects
 * @returns {string[]} group IDs that completed migration
 */
export function updateMigrations(crowdGroups, migrationSpeed, dt, upgradeEffects = {}) {
  const completed = [];
  for (const group of crowdGroups) {
    if (!group.migrating) continue;

    // Bar express upgrade: faster bar migrations
    let speed = migrationSpeed;
    if (group.zoneId === 'bar' && upgradeEffects.bar_migration_speed) {
      speed += upgradeEffects.bar_migration_speed;
    }

    const done = group.updateMigration(group.targetX, group.targetY, speed, dt);
    if (done) {
      completed.push(group.id);
    }
  }
  return completed;
}

/**
 * Get redirect button states (which are active/available)
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {boolean} incidentBlocking
 * @returns {Array<{pair, enabled, reason}>}
 */
export function getRedirectButtonStates(zones, incidentBlocking = false) {
  return REDIRECT_PAIRS.map(pair => {
    const fromZone = zones[pair.from];
    const toZone = zones[pair.to];

    if (!fromZone || !toZone) return { pair, enabled: false, reason: 'Zona ne postoji' };
    if (incidentBlocking) return { pair, enabled: false, reason: 'Incident aktivan' };
    if (fromZone.current_crowd === 0) return { pair, enabled: false, reason: 'Prazna zona' };
    if (toZone.current_crowd >= toZone.capacity * 1.2) return { pair, enabled: false, reason: 'Destinacija puna' };

    return { pair, enabled: true, reason: null };
  });
}
