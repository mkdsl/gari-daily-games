// Level progression flow
import { getLevelConfig } from '../levels/generator.js';
import { LEVELS } from '../levels/level_data.js';

export const MAX_LEVEL = LEVELS.length;

export function isLastLevel(levelId) {
  return levelId >= MAX_LEVEL;
}

export function getNextLevelId(currentLevel) {
  return Math.min(currentLevel + 1, MAX_LEVEL);
}

/**
 * Decide what happens after a level ends.
 * Returns: 'level_complete' | 'game_over'
 */
export function getLevelOutcome(levelId, allRequiredPacked) {
  // Player must pack all required items to advance
  // (We still allow advancing even if some required are missed, just with penalty score)
  // Game over only after last level or if they explicitly quit
  if (allRequiredPacked && !isLastLevel(levelId)) {
    return 'level_complete';
  }
  if (isLastLevel(levelId)) {
    return 'game_over';
  }
  // Even if not all required, we advance (with score penalty already applied)
  return 'level_complete';
}

export function buildLevelSummary(levelId, placedItems, timeLeft, score) {
  const config = getLevelConfig(levelId);
  return {
    levelId,
    config,
    placedItems: placedItems.slice(),
    timeLeft,
    score,
  };
}
