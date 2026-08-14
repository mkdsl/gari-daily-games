/** @fileoverview Auto-save after each week, checkpoint management */

import { getState, saveState, setState } from '../state.js';
import { CONFIG } from '../config.js';

const CHECKPOINT_KEY = CONFIG.SAVE_KEY + '_checkpoints';
const MAX_CHECKPOINTS = 3;

/**
 * Save a named checkpoint for the current week
 * @param {string} label - e.g., "Week 3 end"
 */
export function saveCheckpoint(label) {
  try {
    const state = getState();
    const checkpoints = loadCheckpoints();

    const checkpoint = {
      label,
      week: state.week,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state))
    };

    checkpoints.unshift(checkpoint);

    // Keep only recent checkpoints
    if (checkpoints.length > MAX_CHECKPOINTS) {
      checkpoints.length = MAX_CHECKPOINTS;
    }

    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoints));
    saveState(); // Also save main state
    return true;
  } catch (e) {
    console.warn('Checkpoint save failed:', e);
    return false;
  }
}

/**
 * Load all checkpoints
 * @returns {Object[]}
 */
export function loadCheckpoints() {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Get latest checkpoint info (for UI display)
 * @returns {{ exists: boolean, label: string, week: number, timeAgo: string }}
 */
export function getLatestCheckpointInfo() {
  const checkpoints = loadCheckpoints();
  if (checkpoints.length === 0) return { exists: false };

  const cp = checkpoints[0];
  const secondsAgo = Math.floor((Date.now() - cp.timestamp) / 1000);
  let timeAgo;
  if (secondsAgo < 60) timeAgo = `${secondsAgo}s`;
  else if (secondsAgo < 3600) timeAgo = `${Math.floor(secondsAgo / 60)}m`;
  else timeAgo = `${Math.floor(secondsAgo / 3600)}h`;

  return {
    exists: true,
    label: cp.label,
    week: cp.week,
    timeAgo
  };
}

/**
 * Auto-save trigger — called at end of each week
 * @param {number} week
 */
export function autoSave(week) {
  saveCheckpoint(`Nedelja ${week} završena`);
}

/**
 * Clear all checkpoints
 */
export function clearCheckpoints() {
  localStorage.removeItem(CHECKPOINT_KEY);
}

/**
 * Check if there's a recent save (for continue button display)
 * @returns {boolean}
 */
export function hasSavedGame() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.state?.week > 1 || parsed?.state?.screen !== 'MENU';
  } catch {
    return false;
  }
}
