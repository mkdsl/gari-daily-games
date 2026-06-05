/** @module systems/bpm_controller — BPM slider, floor temp, auto-arc */

import { CONFIG } from '../config.js';
import { AudioAPI } from '../audio.js';

let _bpmSyncTimeout = null;

/**
 * Get BPM range label
 * @param {number} bpm
 * @param {object} upgradeEffects
 * @returns {'cool'|'warm'|'hot'}
 */
export function getBPMRange(bpm, upgradeEffects = {}) {
  const warmExpand = upgradeEffects.bpm_warm_expand ? 5 : 0;
  const [warmMin, warmMax] = [CONFIG.BPM_WARM_RANGE[0] - warmExpand, CONFIG.BPM_WARM_RANGE[1] + warmExpand];
  if (bpm <= CONFIG.BPM_COOL_RANGE[1] - warmExpand) return 'cool';
  if (bpm <= warmMax) return 'warm';
  return 'hot';
}

/**
 * Set BPM value, clamp, trigger audio sync
 * @param {import('../state.js').MicroState} micro
 * @param {number} value
 * @param {object} upgradeEffects
 */
export function setBPM(micro, value, upgradeEffects = {}) {
  const step = CONFIG.BPM_STEP;
  const snapped = Math.round(value / step) * step;
  micro.current_bpm = Math.max(CONFIG.BPM_MIN, Math.min(CONFIG.BPM_MAX, snapped));

  // Debounced audio sync
  if (_bpmSyncTimeout) clearTimeout(_bpmSyncTimeout);
  _bpmSyncTimeout = setTimeout(() => {
    AudioAPI.onBPMChange(micro.current_bpm);
  }, CONFIG.AUDIO_BPM_SYNC_DELAY);
}

/**
 * Niš tutorial auto-arc: BPM gently moves toward 108 if player is idle
 * @param {import('../state.js').MicroState} micro
 * @param {number} dt
 * @param {string} cityId
 */
export function applyNisAutoArc(micro, dt, cityId) {
  if (cityId !== 'nis') return;
  const target = 108;
  const diff = target - micro.current_bpm;
  if (Math.abs(diff) < CONFIG.BPM_STEP) return;
  const direction = diff > 0 ? 1 : -1;
  const step = CONFIG.BPM_STEP;
  // Nudge once every 8 seconds
  micro._nisArcTimer = (micro._nisArcTimer || 0) + dt;
  if (micro._nisArcTimer >= 8) {
    micro._nisArcTimer = 0;
    micro.current_bpm = Math.max(CONFIG.BPM_MIN,
      Math.min(CONFIG.BPM_MAX, micro.current_bpm + direction * step));
  }
}

/**
 * Lock BPM (during equipment_failure improvised DJ set)
 * @param {import('../state.js').MicroState} micro
 * @param {number} lockedValue
 * @param {number} durationSec
 */
export function lockBPM(micro, lockedValue, durationSec) {
  micro.bpm_locked = true;
  micro.bpm_lock_value = lockedValue;
  micro.bpm_lock_timer = durationSec;
  micro.current_bpm = lockedValue;
}

/**
 * Update BPM lock timer
 * @param {import('../state.js').MicroState} micro
 * @param {number} dt
 */
export function updateBPMLock(micro, dt) {
  if (!micro.bpm_locked) return;
  micro.bpm_lock_timer -= dt;
  micro.current_bpm = micro.bpm_lock_value;
  if (micro.bpm_lock_timer <= 0) {
    micro.bpm_locked = false;
    micro.bpm_lock_value = null;
    micro.bpm_lock_timer = 0;
  }
}

/**
 * Get BPM color for HUD
 * @param {number} bpm
 * @param {object} upgradeEffects
 * @returns {string} CSS color
 */
export function getBPMColor(bpm, upgradeEffects = {}) {
  const range = getBPMRange(bpm, upgradeEffects);
  if (range === 'cool') return '#4df5ff';
  if (range === 'warm') return '#4a7c59';
  return '#ff5500';
}

/**
 * Get BPM slider percentage 0-1
 * @param {number} bpm
 * @returns {number}
 */
export function getBPMSliderPct(bpm) {
  return (bpm - CONFIG.BPM_MIN) / (CONFIG.BPM_MAX - CONFIG.BPM_MIN);
}

/**
 * BPM from slider percentage
 * @param {number} pct 0-1
 * @returns {number}
 */
export function bpmFromSliderPct(pct) {
  const raw = CONFIG.BPM_MIN + pct * (CONFIG.BPM_MAX - CONFIG.BPM_MIN);
  const step = CONFIG.BPM_STEP;
  return Math.round(raw / step) * step;
}
