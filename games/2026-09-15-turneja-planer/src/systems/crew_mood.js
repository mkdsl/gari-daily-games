/** @module systems/crew_mood — mood decay per transit, resilience mods */

import { BASE_MOOD_DECAY_PER_TRANSIT, MOOD_DECAY, MAX_CREW_MOOD, MIN_CREW_MOOD } from '../config.js';

/**
 * Calculate mood decay for a single crew member during transit
 * @param {'high'|'med'|'low'} resilience
 * @returns {number} mood delta (negative)
 */
export function memberMoodDecay(resilience) {
  return MOOD_DECAY[resilience] ?? -1.0;
}

/**
 * Calculate average mood decay for the whole crew during transit
 * @param {import('../entities/crew_member.js').CrewMember[]} crew
 * @returns {number} average decay (negative value)
 */
export function crewMoodDecay(crew) {
  if (crew.length === 0) return 0;
  const total = crew.reduce((sum, m) => sum + memberMoodDecay(m.resilience), 0);
  return total / crew.length;
}

/**
 * Apply mood delta and clamp
 * @param {number} current
 * @param {number} delta
 * @returns {number}
 */
export function applyMoodDelta(current, delta) {
  return Math.max(MIN_CREW_MOOD, Math.min(MAX_CREW_MOOD, current + delta));
}

/**
 * Describe mood state
 * @param {number} mood
 * @returns {string}
 */
export function moodLabel(mood) {
  if (mood >= 8) return 'Odlično 🔥';
  if (mood >= 6) return 'Dobro 😊';
  if (mood >= 4) return 'Meh 😐';
  if (mood >= 2) return 'Loše 😟';
  return 'Kritično 💀';
}

/**
 * Color class for mood bar
 * @param {number} mood
 * @returns {string}
 */
export function moodColor(mood) {
  if (mood >= 7) return '#52b788';
  if (mood >= 4) return '#f77f00';
  return '#e63946';
}
