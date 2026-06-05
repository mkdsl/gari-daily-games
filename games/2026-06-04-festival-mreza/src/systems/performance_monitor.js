/** @module systems/performance_monitor — FPS tracking, particle mode */

import { CONFIG } from '../config.js';

const FRAME_WINDOW = 60;
const frameTimes = new Float64Array(FRAME_WINDOW);
let frameIndex = 0;
let framesFilled = 0;

export let particleMode = 'high';
export let particleCap = CONFIG.PARTICLE_CAP_HIGH;

// Detect on init
;(function initDetect() {
  const cpuCores = navigator.hardwareConcurrency || 2;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile || cpuCores < 4) {
    particleMode = 'mobile';
    particleCap = CONFIG.PARTICLE_CAP_MOBILE;
  }
  if (cpuCores < 2) {
    particleMode = 'low';
    particleCap = CONFIG.PARTICLE_CAP_LOW;
  }
})();

/**
 * Record a frame timestamp for rolling FPS average
 * @param {number} now performance.now()
 */
export function recordFrame(now) {
  frameTimes[frameIndex] = now;
  frameIndex = (frameIndex + 1) % FRAME_WINDOW;
  if (framesFilled < FRAME_WINDOW) framesFilled++;
}

/**
 * Compute rolling average FPS
 * @returns {number}
 */
export function getRollingFPS() {
  if (framesFilled < 2) return 60;
  const oldest = frameTimes[(frameIndex - framesFilled + FRAME_WINDOW) % FRAME_WINDOW];
  const newest = frameTimes[(frameIndex - 1 + FRAME_WINDOW) % FRAME_WINDOW];
  const elapsed = (newest - oldest) / 1000;
  if (elapsed <= 0) return 60;
  return (framesFilled - 1) / elapsed;
}

/**
 * Dynamic downgrade: if rolling FPS avg < threshold, reduce particle cap
 * Call once per second
 */
export function checkAndDowngrade() {
  const fps = getRollingFPS();
  if (fps < CONFIG.FPS_DOWNGRADE_THRESHOLD && particleCap > CONFIG.PARTICLE_CAP_LOW) {
    particleCap = Math.max(CONFIG.PARTICLE_CAP_LOW, particleCap - 20);
    if (particleCap <= CONFIG.PARTICLE_CAP_MOBILE) particleMode = 'mobile';
    if (particleCap <= CONFIG.PARTICLE_CAP_LOW) particleMode = 'low';
  }
}

/** @returns {{fps:number, mode:string, cap:number}} */
export function getPerformanceInfo() {
  return { fps: Math.round(getRollingFPS()), mode: particleMode, cap: particleCap };
}
