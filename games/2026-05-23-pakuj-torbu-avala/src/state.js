// Centralized game state
import { loadHighscores, saveHighscore } from './systems/highscore.js';

export const state = {
  screen: 'start',           // 'start' | 'playing' | 'level_complete' | 'game_over'
  currentLevel: 1,
  totalScore: 0,
  levelScore: 0,
  timeLeft: 90,
  backpack: null,            // Backpack instance
  availableItems: [],        // Item[] shown in panel (not yet placed)
  placedItems: [],           // Item[] placed in grid
  selectedItem: null,        // Item currently selected/dragging
  ghost: null,               // { item, gridX, gridY, valid } | null
  particles: [],             // Particle[]
  highscores: [],            // [{score, grade, ts}] top 5
  lastBreakdown: [],         // breakdown lines from last scoring
  levelItems: [],            // all items for current level (placed + available)
};

export function initState() {
  state.screen = 'start';
  state.currentLevel = 1;
  state.totalScore = 0;
  state.levelScore = 0;
  state.timeLeft = 90;
  state.backpack = null;
  state.availableItems = [];
  state.placedItems = [];
  state.selectedItem = null;
  state.ghost = null;
  state.particles = [];
  state.highscores = loadHighscores();
  state.lastBreakdown = [];
  state.levelItems = [];
}

export function recordHighscore(score, grade) {
  const updated = saveHighscore(score, grade);
  state.highscores = updated;
  return updated;
}
