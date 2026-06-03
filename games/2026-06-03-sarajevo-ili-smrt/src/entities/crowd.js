// ============================================================
//  entities/crowd.js — Sarajevo ili Smrt
//  Crowd entity: level, decay per tick, floor, reactions,
//  bad rep trigger logic.
// ============================================================

import { CROWD_FAIL_THRESHOLD } from '../config.js';
import { CROWD_REACTIONS } from '../content/aforizmi.js';

// ----------------------------------------------------------------
//  Crowd reaction trigger
// ----------------------------------------------------------------
/**
 * Get a crowd reaction string based on crowd level and kvart.
 * Called at meaningful moments (vibe hit, fail, legend).
 * @param {string} kvart
 * @param {'good'|'bad'|'legend'} mood
 * @returns {string}
 */
export function getCrowdReaction(kvart, mood) {
  const pool = CROWD_REACTIONS[kvart]?.[mood] ?? CROWD_REACTIONS.bascarsija[mood];
  if (!pool || pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}

// ----------------------------------------------------------------
//  Crowd level categorisation (for render color)
// ----------------------------------------------------------------
/**
 * @param {number} crowd  0-100
 * @returns {'dead'|'low'|'mid'|'high'|'legend'}
 */
export function getCrowdTier(crowd) {
  if (crowd < 20) return 'dead';
  if (crowd < 40) return 'low';
  if (crowd < 65) return 'mid';
  if (crowd < 90) return 'high';
  return 'legend';
}

/**
 * @param {number} crowd
 * @returns {string} hex color
 */
export function getCrowdColor(crowd) {
  if (crowd < 20) return '#FF3333';
  if (crowd < 40) return '#FF6600';
  if (crowd < 65) return '#FFAA00';
  if (crowd < 90) return '#33FF88';
  return '#FFD700';
}

// ----------------------------------------------------------------
//  Should trigger bad rep event?
// ----------------------------------------------------------------
/**
 * @param {number} crowd_level
 * @param {object} state
 * @returns {boolean}
 */
export function shouldTriggerBadRep(crowd_level, state) {
  // Bad rep triggers if crowd stays below threshold
  // E5: no bad rep in Baščaršija/MD (handled in session.js by kvart check)
  return crowd_level < CROWD_FAIL_THRESHOLD;
}

// ----------------------------------------------------------------
//  Crowd bar render data
// ----------------------------------------------------------------
/**
 * @param {number} crowd  0-100
 * @returns {{ fill: number, color: string, label: string }}
 */
export function getCrowdBarData(crowd) {
  return {
    fill: Math.max(0, Math.min(100, crowd)) / 100,
    color: getCrowdColor(crowd),
    label: `${Math.floor(crowd)}%`
  };
}
