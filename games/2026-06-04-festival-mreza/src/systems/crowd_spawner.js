/** @module systems/crowd_spawner — procedural crowd wave generation, LCG seed */

import { CONFIG } from '../config.js';
import { CrowdGroup } from '../entities/crowd_group.js';
import { CITIES, getMaxWaveSize } from '../content/cities_data.js';

let _seed = 0n;

/**
 * Initialize LCG seed from game parameters
 * @param {number} dateUnixDays
 * @param {number} careerTierIndex 0-3
 * @param {number} cityIndex 0-4
 */
export function initSeed(dateUnixDays, careerTierIndex, cityIndex) {
  const raw = (BigInt(dateUnixDays) * 7919n + BigInt(careerTierIndex) * 1013n + BigInt(cityIndex) * 337n) % 65536n;
  _seed = raw;
}

/**
 * LCG next random value 0-1
 * @returns {number}
 */
function lcgNext() {
  _seed = (_seed * CONFIG.CROWD_SEED_PRIME_A + CONFIG.CROWD_SEED_PRIME_B) & 0xFFFFFFFFFFFFFFFFn;
  return Number((_seed >> 33n) & 0x7FFFFFFFn) / 0x7FFFFFFF;
}

/**
 * Generate a crowd wave for the current city
 * @param {import('../state.js').MicroState} micro
 * @param {string} cityId
 * @param {number} venueCapacity
 * @param {number} waveIndex
 * @param {object} zones Record<string, Zone>
 * @param {number} peakBonus extra crowd % if peak phase
 * @returns {CrowdGroup[]} new crowd groups
 */
export function spawnWave(micro, cityId, venueCapacity, waveIndex, zones, peakBonus = 0) {
  const maxWave = getMaxWaveSize(cityId, venueCapacity);
  const baseSize = Math.floor(maxWave * (0.6 + lcgNext() * 0.4));
  const peakExtra = Math.floor(baseSize * peakBonus);
  const totalSize = Math.min(baseSize + peakExtra, maxWave);

  if (totalSize <= 0) return [];

  const groups = [];
  const zoneIds = Object.keys(zones);
  let remaining = totalSize;
  let groupId = `g_wave${waveIndex}_${Date.now()}`;

  // Split into 2-4 groups entering through different zones
  const groupCount = Math.min(4, 1 + Math.floor(lcgNext() * 3));
  for (let i = 0; i < groupCount && remaining > 0; i++) {
    const isLast = i === groupCount - 1;
    const size = isLast ? remaining : Math.floor(remaining * (0.3 + lcgNext() * 0.4));
    if (size <= 0) continue;
    remaining -= size;

    // Initial mood: tutorial city mostly cold, later cities mix
    const moodRoll = lcgNext();
    let mood;
    if (cityId === 'nis') {
      mood = moodRoll < 0.7 ? 'cold' : 'warm';
    } else if (cityId === 'avala') {
      mood = moodRoll < 0.3 ? 'cold' : moodRoll < 0.7 ? 'warm' : 'hot';
    } else {
      mood = moodRoll < 0.5 ? 'cold' : 'warm';
    }

    // Enter from bar zone (entry point)
    const entryZoneId = 'bar';
    const zone = zones[entryZoneId];
    const x = zone ? zone.x + zone.w * lcgNext() : 50;
    const y = zone ? zone.y + zone.h * lcgNext() : 50;

    const group = new CrowdGroup({
      id: `${groupId}_${i}`,
      size,
      zoneId: entryZoneId,
      initialMood: mood,
      isCarryOver: false,
      x, y,
    });
    groups.push(group);
  }

  return groups;
}

/**
 * Inject carry-over guests as a crowd group
 * @param {object} carryOverData {size, mood, isCarryOver}
 * @param {object} zones
 * @param {number} waveIndex
 * @returns {CrowdGroup}
 */
export function spawnCarryOverGroup(carryOverData, zones, waveIndex) {
  const zone = zones['dance_floor'] || zones['bar'];
  const x = zone ? zone.x + zone.w * 0.5 : 50;
  const y = zone ? zone.y + zone.h * 0.5 : 50;

  return new CrowdGroup({
    id: `carry_over_${waveIndex}_${Date.now()}`,
    size: carryOverData.size,
    zoneId: zone ? zone.id : 'bar',
    initialMood: carryOverData.mood || 'warm',
    isCarryOver: true,
    x, y,
  });
}

/**
 * Scatter groups across zone area for render positions
 * @param {CrowdGroup[]} groups
 * @param {object} zones
 */
export function scatterGroupPositions(groups, zones) {
  for (const group of groups) {
    const zone = zones[group.zoneId];
    if (!zone) continue;
    group.x = zone.x + 5 + lcgNext() * (zone.w - 10);
    group.y = zone.y + 5 + lcgNext() * (zone.h - 10);
  }
}
