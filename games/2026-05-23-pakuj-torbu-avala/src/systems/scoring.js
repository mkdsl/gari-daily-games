// Scoring — calculate score, grade, breakdown
import { getGrade } from '../content/brand_hooks.js';

export const BONUS_ALL_REQUIRED = 100;
export const PENALTY_MISSED_REQUIRED = 30;
export const TIME_BONUS_PER_SECOND = 1;

/**
 * Calculate final score for a completed level.
 * @param {Item[]} placedItems - items placed in the backpack
 * @param {Item[]} levelItems - all items in this level (required + bonus)
 * @param {number} timeLeft - remaining seconds
 * @returns {object} { total, breakdown[], allRequiredPacked }
 */
export function calculateLevelScore(placedItems, levelItems, timeLeft) {
  const breakdown = [];
  let total = 0;

  const placedIds = new Set(placedItems.map(i => i.id));
  const requiredItems = levelItems.filter(i => i.required);
  const bonusItems = levelItems.filter(i => !i.required);

  // Points for each placed required item
  for (const item of requiredItems) {
    if (placedIds.has(item.id)) {
      breakdown.push({
        label: `${item.emoji} ${item.label} (obavezno)`,
        points: item.points,
        type: 'required',
      });
      total += item.points;
    } else {
      breakdown.push({
        label: `${item.emoji} ${item.label} — zaboravljeno!`,
        points: -PENALTY_MISSED_REQUIRED,
        type: 'missed',
      });
      total -= PENALTY_MISSED_REQUIRED;
    }
  }

  // Points for bonus items
  for (const item of bonusItems) {
    if (placedIds.has(item.id)) {
      breakdown.push({
        label: `${item.emoji} ${item.label} (bonus)`,
        points: item.points,
        type: 'bonus',
      });
      total += item.points;
    }
  }

  // All required packed bonus
  const allRequiredPacked = requiredItems.every(i => placedIds.has(i.id));
  if (allRequiredPacked) {
    breakdown.push({
      label: 'Sve obavezno spakovano!',
      points: BONUS_ALL_REQUIRED,
      type: 'bonus',
    });
    total += BONUS_ALL_REQUIRED;
  }

  // Time bonus
  const timeBonus = Math.floor(timeLeft) * TIME_BONUS_PER_SECOND;
  if (timeBonus > 0) {
    breakdown.push({
      label: `Vreme: ${Math.floor(timeLeft)}s`,
      points: timeBonus,
      type: 'time',
    });
    total += timeBonus;
  }

  return { total: Math.max(0, total), breakdown, allRequiredPacked };
}

export function getScoreGrade(total) {
  return getGrade(total);
}

/**
 * Returns lists of packed and missed required items for display
 */
export function getSummary(placedItems, levelItems) {
  const placedIds = new Set(placedItems.map(i => i.id));
  const packed = [];
  const missed = [];

  for (const item of levelItems) {
    if (placedIds.has(item.id)) {
      packed.push(item);
    } else if (item.required) {
      missed.push(item);
    }
  }
  return { packed, missed };
}
