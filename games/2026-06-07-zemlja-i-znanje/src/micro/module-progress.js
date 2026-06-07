/**
 * module-progress.js — Tracker naučenog materijala po modulu (0-100%)
 */

/**
 * Inicijalizuje module progress za temu
 */
export function initModuleProgress(temaId, plan) {
  const progress = {};
  // Map activities to modules
  plan.forEach((slot, i) => {
    const key = `${slot.activity}_slot_${i}`;
    progress[key] = 0;
  });
  return progress;
}

/**
 * Update progress na osnovu deltaMinutes
 * @param {Object} moduleProgress
 * @param {string} activityId
 * @param {number} slotIndex
 * @param {number} deltaMinutes
 * @param {number} slotDurationMinutes
 */
export function updateModuleProgress(moduleProgress, activityId, slotIndex, deltaMinutes, slotDurationMinutes = 60) {
  const key = `${activityId}_slot_${slotIndex}`;
  const increment = (deltaMinutes / slotDurationMinutes) * 100;
  moduleProgress[key] = Math.min(100, (moduleProgress[key] || 0) + increment);
  return moduleProgress;
}

/**
 * Vraca total learned score (0-100)
 */
export function getTotalLearnedScore(moduleProgress) {
  const values = Object.values(moduleProgress);
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * Vraca completion % za display
 */
export function getCompletionPct(moduleProgress) {
  const total = getTotalLearnedScore(moduleProgress);
  return Math.round(total);
}
