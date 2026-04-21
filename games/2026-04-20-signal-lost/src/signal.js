import { CONFIG, signalSpeedMs } from './config.js';
import { getNode, generateGrid, applyVisibility } from './grid.js';
import { saveCheckpoint } from './state.js';
import { scheduleFlash } from './render.js';
import {
  sfxSignalStep, sfxScrambler, sfxOrSplit,
  sfxLevelClear, sfxCheckpoint, sfxFail,
  sfxGateToggle,
} from './audio.js';

/**
 * @typedef {import('./state.js').GameState} GameState
 * @typedef {import('./state.js').NodeState} NodeState
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

  _stepAccMs += dt * 1000 * _getSpeedMultiplier(state);

  const stepMs = _getStepMs(state);

  if (state.signal.progress < 1) {
    state.signal.progress = Math.min(1, _stepAccMs / stepMs);
  }

  if (state.signal.progress >= 1) {
    _stepAccMs -= stepMs;
    if (_stepAccMs < 0) _stepAccMs = 0;
    state.signal.progress = 0;
    _arriveAtNode(state);
  }
}

/**
 * Start signal movement from the beginning of a new level.
 * Uses the pre-computed plannedPath for first step; falls back to first neighbor.
 * @param {GameState} state
 */
export function startSignal(state) {
  _stepAccMs = 0;
  state.signal.moving = false;
  state.signal.progress = 0;
  state.signal.path = [];
  state.signal.activeBranches = [];
  state.signal.currentNodeId = state.startNodeId;

  const planned = state.signal.plannedPath;
  if (planned && planned.length >= 2) {
    state.signal.nextNodeId = planned[1];
  } else {
    // Fallback: pick first neighbor
    const startNode = getNode(state.grid, state.startNodeId);
    state.signal.nextNodeId = startNode?.connections?.[0] ?? null;
  }

  state.signal.path.push(state.startNodeId);
  state.signal.moving = state.signal.nextNodeId !== null;
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
  node.gateOpen = !node.gateOpen;
  sfxGateToggle(node.gateOpen);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Manhattan distance from a nodeId to the goal.
 * @param {string} id
 * @param {string} goalId
 * @returns {number}
 */
function _manhattanToGoal(id, goalId) {
  const a = _parseId(id);
  const b = _parseId(goalId);
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Parse row/col from id string.
 * @param {string} id
 * @returns {{ row: number, col: number }}
 */
function _parseId(id) {
  const [row, col] = id.split('-').map(Number);
  return { row, col };
}

/**
 * Called when the signal finishes travelling to state.signal.nextNodeId.
 * Updates currentNodeId, runs node interaction, picks the next node.
 * @param {GameState} state
 */
function _arriveAtNode(state) {
  const currentNodeId = state.signal.nextNodeId;
  state.signal.currentNodeId = currentNodeId;
  state.signal.path.push(currentNodeId);

  const node = getNode(state.grid, currentNodeId);
  if (!node) {
    _fail(state);
    return;
  }

  _interactNode(state, node);

  // If the interaction caused game over or win, stop here
  if (state.gameOver || state.won || state.screen !== 'game') return;

  _pickNext(state);
}

/**
 * Process the node the signal just arrived at.
 * - relay: pass through, sfxSignalStep
 * - gate (open): pass through, sfxSignalStep
 * - gate (closed): signal STOPS → fail
 * - scrambler: toggle all adjacent gate nodes, sfxScrambler
 * - or: pick an unvisited/passable neighbor; if both blocked → fail
 * - goal: level cleared → _levelClear(state)
 * @param {GameState} state
 * @param {NodeState} node
 */
function _interactNode(state, node) {
  // Check if this is the goal node first
  if (node.id === state.goalNodeId) {
    _levelClear(state);
    return;
  }

  switch (node.type) {
    case 'relay':
      sfxSignalStep(state.level);
      break;

    case 'gate':
      if (node.gateOpen) {
        sfxSignalStep(state.level);
      } else {
        _fail(state);
      }
      break;

    case 'scrambler': {
      sfxScrambler();
      // Toggle all adjacent gate nodes
      for (const neighborId of node.connections) {
        const neighbor = getNode(state.grid, neighborId);
        if (neighbor && neighbor.type === 'gate') {
          neighbor.gateOpen = !neighbor.gateOpen;
        }
      }
      break;
    }

    case 'or': {
      sfxOrSplit();
      // OR node: signal picks the best available unvisited neighbor that isn't a closed gate.
      // "Both paths blocked" → fail
      // The actual routing happens in _pickNext — here we just play the sound.
      // We mark this as an OR split for _pickNext to handle specially.
      state.signal._atOrNode = true;
      break;
    }

    default:
      sfxSignalStep(state.level);
      break;
  }
}

/**
 * BFS od startId do goalId — ignoriše gateOpen (pretpostavlja da igrač otvori prave gate-ove).
 * @param {import('./state.js').NodeState[][]} grid
 * @param {string} startId
 * @param {string} goalId
 * @returns {string[]} niz node id-ova od start do goal (uključujući oba), ili []
 */
function _computePlannedPath(grid, startId, goalId) {
  const queue = [[startId]];
  const seen = new Set([startId]);
  while (queue.length > 0) {
    const path = queue.shift();
    const last = path[path.length - 1];
    if (last === goalId) return path;
    const node = getNode(grid, last);
    if (!node) continue;
    for (const nid of node.connections) {
      if (!seen.has(nid)) {
        seen.add(nid);
        queue.push([...path, nid]);
      }
    }
  }
  return [startId, goalId]; // fallback
}

/**
 * Choose the next node for the signal to travel to from currentNodeId.
 * Uses the pre-planned BFS path as primary routing; falls back to greedy manhattan.
 * If no valid next node exists, triggers _fail(state).
 * @param {GameState} state
 */
function _pickNext(state) {
  const planned = state.signal.plannedPath;
  const idx = planned ? planned.indexOf(state.signal.currentNodeId) : -1;

  if (planned && idx >= 0 && idx + 1 < planned.length) {
    state.signal.nextNodeId = planned[idx + 1];
    return;
  }

  // Fallback: greedy manhattan
  const current = getNode(state.grid, state.signal.currentNodeId);
  if (!current) { _fail(state); return; }
  const visited = new Set(state.signal.path);
  let candidates = current.connections
    .filter(id => !visited.has(id))
    .filter(id => {
      const n = getNode(state.grid, id);
      return n && !(n.type === 'gate' && !n.gateOpen);
    });
  if (candidates.length === 0) {
    if (!state.won && !state.gameOver) _fail(state);
    return;
  }
  const goalId = state.goalNodeId;
  candidates.sort((a, b) => _manhattanToGoal(a, goalId) - _manhattanToGoal(b, goalId));
  state.signal.nextNodeId = candidates[0];
}

/**
 * Handle level clear — advance to next level or trigger win.
 * Saves checkpoint if needed, shows powerup offer if needed.
 * @param {GameState} state
 */
function _levelClear(state) {
  sfxLevelClear();
  scheduleFlash('success');

  const justCleared = state.level;
  const nextLevel = state.level + 1;

  // Add score for this level
  state.score += CONFIG.SCORE_PER_LEVEL;

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
  if (CONFIG.POWERUP_OFFER_AFTER.includes(justCleared)) {
    // Generate a random offer of 3 distinct power-up ids
    const allIds = Object.keys(CONFIG.POWERUPS);
    for (let i = allIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
    }
    state.powerupOffer = allIds.slice(0, 3);
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
 * Exported so powerups.js can call it after a power-up pick.
 * @param {GameState} state
 */
export function initLevel(state) {
  _initLevel(state);
}

/** @param {GameState} state */
function _initLevel(state) {
  // Generate fresh grid
  const { grid, startNodeId, goalNodeId } = generateGrid(state.level);
  applyVisibility(grid, state.level);

  state.grid         = grid;
  state.startNodeId  = startNodeId;
  state.goalNodeId   = goalNodeId;
  state.gameOver     = false;
  state.won          = false;

  // Pre-compute BFS path so signal routing is deterministic and always solvable
  state.signal.plannedPath    = _computePlannedPath(grid, startNodeId, goalNodeId);
  state.signal.plannedPathIdx = 0;

  // Reset signal state
  state.signal.moving        = false;
  state.signal.progress      = 0;
  state.signal.path          = [];
  state.signal.activeBranches = [];
  state.signal.currentNodeId  = null;
  state.signal.nextNodeId     = null;
  state.signal._atOrNode      = false;
  _stepAccMs = 0;

  state.screen = 'game';
  startSignal(state);
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
