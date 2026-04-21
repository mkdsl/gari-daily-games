import { CONFIG } from './config.js';

/**
 * @typedef {Object} NodeState
 * @property {string} id - Unique node id e.g. "3-2"
 * @property {'relay'|'gate'|'scrambler'|'or'} type - Node type
 * @property {boolean} gateOpen - Only relevant for gate nodes; true = open
 * @property {boolean} visible - Whether the player can see the real type
 * @property {number} row
 * @property {number} col
 * @property {string[]} connections - Array of connected node ids
 */

/**
 * @typedef {Object} SignalState
 * @property {string|null} currentNodeId - Node currently being visited; null = in transit
 * @property {string|null} nextNodeId    - Node the signal is heading toward
 * @property {number} progress           - 0..1 animation progress between current→next
 * @property {boolean} moving            - Is signal actively travelling?
 * @property {string[]} path             - Ids of nodes visited so far this level
 * @property {string[]} activeBranches   - For OR-Splitter: additional active branch node ids
 */

/**
 * @typedef {Object} ActivePowerup
 * @property {string} id - Power-up id from CONFIG.POWERUPS
 * @property {number} remainingSec    - Seconds left (for time-based power-ups; -1 if node-based)
 * @property {number} remainingNodes  - Nodes left (for node-based power-ups; -1 if time-based)
 */

/**
 * @typedef {Object} GameState
 * @property {number} version
 * @property {number} started          - timestamp of run start
 * @property {number} level            - current level 1-15
 * @property {number} score
 * @property {boolean} gameOver
 * @property {boolean} won
 * @property {boolean} paused
 * @property {'start'|'game'|'powerup'|'checkpoint'|'death'|'win'} screen
 * @property {NodeState[][]} grid      - 2-D grid of node states for the current level
 * @property {string} startNodeId     - Id of start node
 * @property {string} goalNodeId      - Id of goal node
 * @property {SignalState} signal
 * @property {ActivePowerup[]} activePowerups - Stack of currently active power-ups
 * @property {string[]} heldPowerups  - Ids of power-ups the player has but hasn't activated
 * @property {string[]} powerupOffer  - Ids of power-ups shown on the current offer screen
 * @property {number} elapsedSec      - Total time elapsed in current run (for score calc)
 * @property {number|null} checkpointLevel - The last checkpoint reached (6 or 11), or null
 * @property {GameState|null} checkpointSnapshot - Full state snapshot at last checkpoint
 */

/**
 * Create a fresh initial game state (new run, no checkpoint).
 * @returns {GameState}
 */
export function createState() {
  return {
    version: 1,
    started: Date.now(),
    level: 1,
    score: 0,
    gameOver: false,
    won: false,
    paused: false,
    screen: 'start',
    grid: [],
    startNodeId: null,
    goalNodeId: null,
    signal: {
      currentNodeId: null,
      nextNodeId: null,
      progress: 0,
      moving: false,
      path: [],
      activeBranches: [],
    },
    activePowerups: [],
    heldPowerups: [],
    powerupOffer: [],
    elapsedSec: 0,
    checkpointLevel: null,
    checkpointSnapshot: null,
  };
}

/**
 * Load persisted state from localStorage.
 * Returns null if nothing saved or version mismatch.
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist current state to localStorage.
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    // Don't persist the heavy checkpointSnapshot recursively; store it separately.
    const toSave = { ...state, checkpointSnapshot: null };
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(toSave));
    if (state.checkpointSnapshot) {
      localStorage.setItem(
        CONFIG.SAVE_KEY + '-ckpt',
        JSON.stringify(state.checkpointSnapshot)
      );
    }
  } catch {
    // quota or private mode — ignore
  }
}

/**
 * Clear persisted state so the next createState() is a clean run.
 */
export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
  localStorage.removeItem(CONFIG.SAVE_KEY + '-ckpt');
}

/**
 * Restore state from the latest checkpoint snapshot (levels 6 or 11).
 * Returns null if no checkpoint snapshot exists.
 * @returns {GameState|null}
 */
export function loadCheckpointState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY + '-ckpt');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save a deep copy of the current state as the checkpoint snapshot.
 * Called by signal.js when a checkpoint level is cleared.
 * @param {GameState} state
 */
export function saveCheckpoint(state) {
  try {
    const snapshot = JSON.parse(JSON.stringify(state));
    snapshot.checkpointSnapshot = null; // avoid infinite nesting
    localStorage.setItem(CONFIG.SAVE_KEY + '-ckpt', JSON.stringify(snapshot));
    state.checkpointLevel = state.level;
    state.checkpointSnapshot = snapshot;
  } catch {
    // ignore
  }
}
