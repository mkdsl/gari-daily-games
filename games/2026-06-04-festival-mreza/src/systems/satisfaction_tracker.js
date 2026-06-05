/** @module systems/satisfaction_tracker — satisfaction delta, energy debt, peak phase */

import { CONFIG } from '../config.js';
import { AudioAPI } from '../audio.js';
import { getAverageZoneUtilization, countOverflowZones } from './zone_manager.js';

const MOOD_THRESHOLD = 0.5;  // 'warm' threshold

/**
 * Calculate satisfaction delta per second
 * satisfaction_delta = (mood_above_threshold_factor × 0.4) + (avg_utilization × 0.3)
 *                    - (overflow_zones × 0.2) - (incident_factor × 0.1)
 *
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} crowdGroups
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {number} incidentCount active incidents
 * @returns {number} delta per second
 */
export function calculateSatisfactionDelta(crowdGroups, zones, incidentCount) {
  // Mood factor: fraction of crowd above MOOD_THRESHOLD
  const totalCrowd = crowdGroups.reduce((s, g) => s + g.size, 0);
  const moodyCrowd = crowdGroups.filter(g => g.moodValue >= MOOD_THRESHOLD).reduce((s, g) => s + g.size, 0);
  const moodFactor = totalCrowd > 0 ? moodyCrowd / totalCrowd : 0;

  const avgUtil = getAverageZoneUtilization(zones);
  const overflows = countOverflowZones(zones);
  const incidentFactor = Math.min(1, incidentCount * 0.25);

  return (moodFactor * 0.4) + (avgUtil * 0.3) - (overflows * 0.2) - (incidentFactor * 0.1);
}

/**
 * Update satisfaction points
 * @param {import('../state.js').MicroState} micro
 * @param {number} delta per second
 * @param {number} dt
 */
export function updateSatisfaction(micro, delta, dt) {
  micro.satisfaction_points = Math.max(0,
    micro.satisfaction_points + delta * dt
  );
}

/**
 * Calculate energy debt
 * debt += max(0, floor_temp - 0.7) × 3.0 per second
 * debt -= max(0, 0.7 - floor_temp) × 1.5 per second
 *
 * @param {import('../state.js').MicroState} micro
 * @param {number} dt
 * @param {number} floorTemp 0-1
 * @param {number} maxDebt
 */
export function updateEnergyDebt(micro, dt, floorTemp, maxDebt) {
  const accumulate = Math.max(0, floorTemp - CONFIG.ENERGY_DEBT_THRESHOLD) * CONFIG.ENERGY_DEBT_ACCUMULATE_RATE;
  const decay = Math.max(0, CONFIG.ENERGY_DEBT_THRESHOLD - floorTemp) * CONFIG.ENERGY_DEBT_DECAY_RATE;
  micro.energy_debt = Math.max(0, Math.min(maxDebt,
    micro.energy_debt + (accumulate - decay) * dt
  ));
}

/**
 * Get max energy debt for current setup
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @returns {number}
 */
export function getMaxEnergyDebt(macro, meta) {
  const coordTierBonus = macro.active_coordinators.length > 0
    ? macro.active_coordinators.reduce((max, c) => Math.max(max, c.loyaltyTier), 0) * 5
    : 0;
  const reserveBonus = meta.veteran_insights.includes('vi_energy_reserve') ? 15 : 0;
  return CONFIG.ENERGY_DEBT_MAX_BASE + coordTierBonus + reserveBonus;
}

/**
 * Check and trigger peak phase (last 1/3 of event)
 * @param {import('../state.js').MicroState} micro
 */
export function checkPeakPhase(micro) {
  if (micro.peak_phase_triggered) return;
  const elapsed = micro.event_time_elapsed;
  const duration = micro.event_duration;
  if (elapsed >= duration * 0.67) {
    micro.peak_phase_triggered = true;
    AudioAPI.onPeakPhase();
  }
}

/**
 * Calculate final satisfaction score for event
 * @param {import('../state.js').MicroState} micro
 * @param {number} startingBonus from buzz
 * @param {object} upgradeEffects
 * @returns {number} 0-100
 */
export function calculateFinalSatisfaction(micro, startingBonus, upgradeEffects = {}) {
  const raw = (micro.satisfaction_points / micro.event_duration) * 100;
  const djBoothBonus = upgradeEffects.dj_booth_premium || 0;
  const grandFinaleBonus = upgradeEffects.grand_finale_satisfaction || 0;
  const total = raw + startingBonus + djBoothBonus + grandFinaleBonus;
  return Math.min(100, Math.max(0, total));
}

/**
 * Get satisfaction color for display
 * @param {number} satisfaction 0-100
 * @returns {string} CSS color
 */
export function getSatisfactionColor(satisfaction) {
  if (satisfaction >= 90) return '#4df5ff';
  if (satisfaction >= 70) return '#4a7c59';
  if (satisfaction >= 50) return '#ffb830';
  return '#ff4444';
}
