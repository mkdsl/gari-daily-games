import { CONFIG, signalSpeedMs } from './config.js';
import { getNode } from './grid.js';
import { saveCheckpoint } from './state.js';
import { scheduleFlash } from './render.js';
import {
  sfxSignalStep, sfxScrambler, sfxOrSplit,
  sfxLevelClear, sfxCheckpoint, sfxFail,
} from './audio.js';

/**
 * @typedef {import('./state.js').GameState} GameState
 */

/**
 * Accumulator for time since the signal last advanced (milliseconds).
 * Reset to 0 each time the signal steps to a new node.
 */
let _stepAccMs = 0;

/**
 * Main signal update — called every frame from main.js.
 * Handles:
 *  - Advancing the signal animation progress (0→1 between nodes)
 *  - Triggering node interactions on arrival
 *  - Detecting win / fail conditions
 *  - Firing audio and flash effects
 *
 * @param {GameState} state
 * @param {{ pointer: { pressed: boolean, x: number, y: number } }} input
 * @param {number} dt - seconds since last frame
 */
export function updateSignal(state, input, dt) {
  if (!state.signal.moving) return;
  if (state.paused || state.gameOver || state.won) return;

  // TODO: accumulate dt, advance signal.progress, call _arriveAtNode when progress >= 1
  _stepAccMs += dt * 1000 * _getSpeedMultiplier(state);

  const stepMs = _getStepMs(state);

  if (state.signal.progress < 1) {
    state.signal.progress = Math.min(1, _stepAccMs / stepMs);
  }

  if (state.signal.progress >= 1) {
    _stepAccMs -= stepMs;
    state.signal.progress = 0;
    _arriveAtNode(state);
  }
}

/**
 * Start signal movement from the beginning of a new level.
 * Picks the first step from startNodeId toward the next connected node.
 * @param {GameState} state
 */
export function startSignal(state) {
  // TODO: set signal.currentNodeId = state.startNodeId, pick nextNodeId via _pickNext
  //   set signal.moving = true, signal.path = [startNodeId], reset _stepAccMs
  _stepAccMs = 0;
  state.signal.moving = false;
  state.signal.progress = 0;
  state.signal.path = [];
  state.signal.activeBranches = [];
  // TODO: set currentNodeId, nextNodeId
}

/**
 * Handle a player click on a grid node.
 * Only Gate nodes respond to clicks; toggles gateOpen and plays sfx.
 * @param {GameState} state
 * @param {string} nodeId - id of clicked node
 */
export function handleNodeClick(state, nodeId) {
  const node = getNode(state.grid, nodeId);
  if (!node || node.type !== 'gate') return;
  // TODO: toggle node.gateOpen; call sfxGateToggle(node.gateOpen)
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Called when the signal finishes travelling to state.signal.nextNodeId.
 * Updates currentNodeId, runs node interaction, picks the next node.
 * @param {GameState} state
 */
function _arriveAtNode(state) {
  // TODO:
  // 1. state.signal.currentNodeId = state.signal.nextNodeId
  // 2. state.signal.path.push(currentNodeId)
  // 3. call _interactNode(state, currentNode)
  // 4. if not dead/won, call _pickNext(state)
}

/**
 * Process the node the signal just arrived at.
 * - relay: pass through, sfxSignalStep
 * - gate (open): pass through, sfxSignalStep
 * - gate (closed): signal STOPS → fail → sfxFail → state.gameOver
 * - scrambler: redirect signal to a random connected node, sfxScrambler
 * - or: fork signal (one branch continues, another added to activeBranches), sfxOrSplit
 * - goal: level cleared → _levelClear(state)
 * @param {GameState} state
 * @param {import('./state.js').NodeState} node
 */
function _interactNode(state, node) {
  // TODO: switch(node.type) { ... }
}

/**
 * Choose the next node for the signal to travel to from currentNodeId.
 * Follows the backbone path if possible; falls back to any connected unvisited node.
 * If no valid next node exists, triggers _fail(state).
 * @param {GameState} state
 */
function _pickNext(state) {
  // TODO: from current node's connections, filter out visited (signal.path)
  //   prefer unvisited; if multiple choices, pick randomly
  //   set state.signal.nextNodeId or call _fail
}

/**
 * Handle level clear — advance to next level or trigger win.
 * Saves checkpoint if needed, shows powerup offer if needed.
 * @param {GameState} state
 */
function _levelClear(state) {
  sfxLevelClear();
  scheduleFlash('success');

  const nextLevel = state.level + 1;

  // TODO: calc score for this level, add to state.score

  if (nextLevel > CONFIG.MAX_LEVELS) {
    state.won = true;
    state.screen = 'win';
    return;
  }

  state.level = nextLevel;

  // Checkpoint save at level 6 and 11 (entering those levels)
  if (CONFIG.CHECKPOINTS.includes(nextLevel)) {
    saveCheckpoint(state);
    sfxCheckpoint();
    scheduleFlash('checkpoint');
    state.screen = 'checkpoint';
    return;
  }

  // Power-up offer after clearing levels 3, 6, 9, 12
  if (CONFIG.POWERUP_OFFER_AFTER.includes(state.level - 1)) {
    state.screen = 'powerup';
    return;
  }

  // Otherwise go straight to next level
  _initLevel(state);
}

/**
 * Trigger failure — stop signal, set gameOver, flash red.
 * @param {GameState} state
 */
function _fail(state) {
  sfxFail();
  scheduleFlash('fail');
  state.signal.moving = false;
  state.gameOver = true;
  state.screen = 'death';
}

/**
 * Initialise grid and signal for state.level.
 * Called at level start (including after checkpoints / power-up screens).
 * @param {GameState} state
 */
export function initLevel(state) {
  // TODO: call generateGrid(state.level), applyVisibility, startSignal
  _initLevel(state);
}

/** @param {GameState} state */
function _initLevel(state) {
  // TODO: import generateGrid + applyVisibility, build new grid, reset signal
  state.signal.moving = false;
  state.signal.progress = 0;
  state.signal.path = [];
  state.signal.activeBranches = [];
  _stepAccMs = 0;
}

/**
 * Get the effective ms-per-node step duration, factoring in power-ups.
 * @param {GameState} state
 * @returns {number}
 */
function _getStepMs(state) {
  let ms = signalSpeedMs(state.level);
  for (const ap of state.activePowerups) {
    if (ap.id === 'SLOW_SIGNAL' && ap.remainingNodes > 0) ms += CONFIG.POWERUPS.SLOW_SIGNAL.bonusMs;
    if (ap.id === 'FREEZE'      && ap.remainingSec > 0)   ms = Infinity;
  }
  return ms;
}

/**
 * Get the speed multiplier from TIME_BUBBLE power-up (default 1).
 * @param {GameState} state
 * @returns {number}
 */
function _getSpeedMultiplier(state) {
  for (const ap of state.activePowerups) {
    if (ap.id === 'TIME_BUBBLE' && ap.remainingSec > 0) {
      return CONFIG.POWERUPS.TIME_BUBBLE.speedMultiplier;
    }
  }
  return 1;
}
