import { GAME_CONFIG } from '../config.js';
import { saveState } from '../state.js';
import { tickMushrooms } from '../economy/mushrooms.js';
import { tickGreenhouse } from '../economy/greenhouse.js';
import { tickFishpond } from '../economy/fishpond.js';
import { updateSynergies } from '../economy/synergies.js';
import { evaluatePhase } from '../systems/phases.js';
import { tickSeason, handleSeasonEnd } from '../systems/seasons.js';
import { checkAchievements } from '../systems/achievements.js';
import { updateAllUI } from '../ui/tabs.js';

let tickInterval = null;
let saveTimer = 0;
let lastTickTime = 0;
const TICK_MS = 1000; // 1 second real-time = 1 game second

/** @param {Object} gameRef - { state, audio, onStateChange } */
export function startTick(gameRef) {
  lastTickTime = performance.now();
  tickInterval = setInterval(() => {
    const now = performance.now();
    // dt should be ~1s but account for tab visibility slowdown
    const dt = Math.min((now - lastTickTime) / 1000, 3.0);
    lastTickTime = now;

    tick(gameRef, dt);
  }, TICK_MS);
}

export function stopTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

/** Main game tick — called once per second */
function tick(gameRef, dt) {
  const { state, audio } = gameRef;

  // Accumulate play time
  state.playTime += dt;

  // Update synergies (cheap boolean checks)
  updateSynergies(state);

  // Tick economy branches
  if (state.mushrooms.unlocked) {
    tickMushrooms(state, dt, audio);
  }
  if (state.greenhouse.unlocked) {
    tickGreenhouse(state, dt, audio);
  }
  if (state.fishpond.unlocked) {
    tickFishpond(state, dt, audio);
  }

  // Tick season countdown
  const seasonEnded = tickSeason(state, dt);
  if (seasonEnded) {
    handleSeasonEnd(state, audio, gameRef.onSeasonEnd);
  }

  // Evaluate phase transitions
  evaluatePhase(state, audio, gameRef.onPhaseUnlock);

  // Check achievements (fast loop over pending triggers)
  checkAchievements(state, audio, gameRef.onAchievement);

  // Update all UI
  updateAllUI(state);

  // Auto-save
  saveTimer += dt;
  if (saveTimer >= GAME_CONFIG.SAVE_INTERVAL_SEC) {
    saveState(state);
    saveTimer = 0;
  }
}
