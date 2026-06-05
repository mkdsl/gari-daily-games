/** @module entities/zone — Zone entity */

import { CONFIG } from '../config.js';

export class Zone {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {string} opts.label
   * @param {number} opts.capacity
   * @param {number} opts.x  canvas position
   * @param {number} opts.y
   * @param {number} opts.w
   * @param {number} opts.h
   * @param {string} opts.color
   */
  constructor({ id, label, capacity, x, y, w, h, color }) {
    this.id = id;
    this.label = label;
    this.capacity = capacity;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.current_crowd = 0;
    this.mood_average = 0.2;    // 0-1
    this.overflow_active = false;
    this.overflow_timer = 0;    // seconds since overflow started
    this.mood_groups = [];      // array of {size, moodValue}
  }

  /**
   * Update crowd count from groups in this zone
   * @param {import('./crowd_group.js').CrowdGroup[]} groups
   */
  syncFromGroups(groups) {
    const inZone = groups.filter(g => g.zoneId === this.id);
    this.current_crowd = inZone.reduce((s, g) => s + g.size, 0);

    if (inZone.length > 0) {
      const totalMood = inZone.reduce((s, g) => s + g.moodValue * g.size, 0);
      this.mood_average = totalMood / this.current_crowd;
    } else {
      this.mood_average = 0;
    }
  }

  /** @returns {number} utilization 0-1+ */
  get utilization() {
    return this.capacity > 0 ? this.current_crowd / this.capacity : 0;
  }

  /**
   * Update overflow state
   * @param {number} dt seconds
   * @param {number} overflowThresholdFactor default 1.1, can be upgraded
   * @returns {string|null} incident type if newly triggered
   */
  updateOverflow(dt, overflowThresholdFactor = 1.1) {
    const threshold = this.capacity * overflowThresholdFactor;
    if (this.current_crowd > threshold) {
      this.overflow_active = true;
      this.overflow_timer += dt;
    } else {
      this.overflow_active = false;
      this.overflow_timer = 0;
    }
    return null;  // incident_manager handles escalation
  }

  /** @returns {string} fill color based on utilization */
  getFillColor() {
    const u = this.utilization;
    if (u > 1.1) return 'rgba(255, 68, 68, 0.25)';
    if (u > 0.85) return 'rgba(255, 184, 48, 0.20)';
    if (u > 0.5)  return 'rgba(77, 245, 255, 0.12)';
    return 'rgba(77, 245, 255, 0.05)';
  }

  /** @returns {string} border color */
  getBorderColor() {
    if (this.overflow_active) return '#ff4444';
    const u = this.utilization;
    if (u > 0.85) return '#ffb830';
    return this.color;
  }
}

/**
 * Create default zones for a venue
 * @param {number} venueCapacity
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {Record<string, Zone>}
 */
export function createDefaultZones(venueCapacity, canvasW, canvasH) {
  const pct = CONFIG.ZONE_PCT;
  const pad = 10;
  const halfW = (canvasW - pad * 3) / 2;
  const halfH = (canvasH - pad * 3) / 2;

  return {
    dance_floor: new Zone({
      id: 'dance_floor', label: 'Dance Floor',
      capacity: Math.floor(venueCapacity * pct.dance_floor),
      x: pad, y: pad, w: halfW, h: halfH,
      color: '#c44dff',
    }),
    bar: new Zone({
      id: 'bar', label: 'Bar',
      capacity: Math.floor(venueCapacity * pct.bar),
      x: halfW + pad * 2, y: pad, w: halfW, h: halfH,
      color: '#ffb830',
    }),
    chill: new Zone({
      id: 'chill', label: 'Chill Zone',
      capacity: Math.floor(venueCapacity * pct.chill),
      x: pad, y: halfH + pad * 2, w: halfW, h: halfH,
      color: '#4df5ff',
    }),
    stage_front: new Zone({
      id: 'stage_front', label: 'Stage Front',
      capacity: Math.floor(venueCapacity * pct.stage_front),
      x: halfW + pad * 2, y: halfH + pad * 2, w: halfW, h: halfH,
      color: '#4a7c59',
    }),
  };
}
