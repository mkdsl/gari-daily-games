/** @module entities/crowd_group — CrowdGroup entity */

import { CONFIG } from '../config.js';

/** @typedef {'cold'|'warm'|'hot'} MoodTemp */

export class CrowdGroup {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {number} opts.size
   * @param {string} opts.zoneId
   * @param {MoodTemp} opts.initialMood
   * @param {boolean} [opts.isCarryOver]
   * @param {number} [opts.x]
   * @param {number} [opts.y]
   */
  constructor({ id, size, zoneId, initialMood = 'cold', isCarryOver = false, x = 0, y = 0 }) {
    this.id = id;
    this.size = size;
    this.zoneId = zoneId;
    this.mood = initialMood;    // 'cold' | 'warm' | 'hot'
    this.moodValue = initialMood === 'hot' ? 0.8 : initialMood === 'warm' ? 0.5 : 0.2;
    this.isCarryOver = isCarryOver;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.migrating = false;
    this.targetZoneId = null;
    this.migrationTimer = 0;
    this.energyLevel = 1.0;     // 0-1
    this.overflowTimer = 0;
  }

  /**
   * Update mood value based on BPM range and current group mood
   * @param {string} bpmRange 'cool'|'warm'|'hot'
   * @param {number} dt seconds
   */
  updateMoodFromBPM(bpmRange, dt) {
    const effects = CONFIG.BPM_MOOD_EFFECTS[bpmRange];
    if (!effects) return;
    const delta = effects[this.mood] * dt;
    this.moodValue = Math.max(0, Math.min(1, this.moodValue + delta));
    // Update mood string
    if (this.moodValue < 0.35) this.mood = 'cold';
    else if (this.moodValue < 0.70) this.mood = 'warm';
    else this.mood = 'hot';
  }

  /**
   * Decay energy over time
   * @param {number} dt
   * @param {number} floorTemp 0-1
   */
  decayEnergy(dt, floorTemp) {
    const exertion = floorTemp * 0.02;
    this.energyLevel = Math.max(0, this.energyLevel - exertion * dt);
  }

  /**
   * Start migration to target zone
   * @param {string} targetZoneId
   * @param {number} followRate 0-1 — fraction of group that follows
   * @returns {number} number of people who follow
   */
  startMigration(targetZoneId, followRate) {
    const followers = Math.floor(this.size * followRate);
    if (followers <= 0) return 0;
    this.migrating = true;
    this.targetZoneId = targetZoneId;
    this.migrationTimer = 0;
    return followers;
  }

  /**
   * Update migration position toward target
   * @param {number} targetX
   * @param {number} targetY
   * @param {number} speed pixels/sec
   * @param {number} dt
   * @returns {boolean} reached target
   */
  updateMigration(targetX, targetY, speed, dt) {
    if (!this.migrating) return false;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) {
      this.x = targetX;
      this.y = targetY;
      this.zoneId = this.targetZoneId;
      this.migrating = false;
      this.targetZoneId = null;
      return true;
    }
    const step = Math.min(speed * dt * 60, dist);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return false;
  }

  /** @returns {string} CSS color for this group */
  getColor() {
    if (this.isCarryOver) return '#ffb830';  // amber — carry-over
    if (this.mood === 'hot')  return '#ff5500';
    if (this.mood === 'warm') return '#4df5ff';
    return '#6a6a9a';                         // cold — desaturated
  }
}
