// Level setup: pick items, shuffle item panel
import { LEVELS } from './level_data.js';
import { ITEMS } from '../content/items_data.js';
import { Item } from '../entities/item.js';

export function getLevelConfig(levelId) {
  return LEVELS.find(l => l.id === levelId) || LEVELS[0];
}

/**
 * Build the list of Item instances for a level.
 * Returns shuffled array with required items first (for visual clarity),
 * then bonus items.
 */
export function generateLevelItems(levelId) {
  const config = getLevelConfig(levelId);

  const required = config.requiredItems.map(id => {
    const def = ITEMS.find(i => i.id === id);
    if (!def) return null;
    return new Item(def);
  }).filter(Boolean);

  const bonus = config.bonusItems.map(id => {
    const def = ITEMS.find(i => i.id === id);
    if (!def) return null;
    return new Item(def);
  }).filter(Boolean);

  // Shuffle each group independently
  shuffle(required);
  shuffle(bonus);

  return [...required, ...bonus];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
