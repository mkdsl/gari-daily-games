import { CONFIG } from './config.js';

/**
 * @typedef {import('./state.js').NodeState} NodeState
 */

/**
 * Generate a complete, guaranteed-solvable grid for the given level.
 *
 * Algorithm overview:
 *  1. Create an N×N grid of empty cells.
 *  2. Random-walk a backbone path from a random start node to a random goal node.
 *  3. Fill remaining cells with node types distributed per CONFIG.NODE_DISTRIBUTION[level].
 *  4. Validate solvability (BFS/DFS from start; goal reachable through open gates).
 *  5. If not solvable, retry (max 10 attempts before relaxing constraints).
 *
 * @param {number} level - 1-15
 * @returns {{
 *   grid: NodeState[][],
 *   startNodeId: string,
 *   goalNodeId: string
 * }}
 */
export function generateGrid(level) {
  // TODO: implement full procedural generation
  const size = CONFIG.GRID_SIZE[level];
  const grid = _createEmptyGrid(size);
  // TODO: random-walk backbone, distribute types, validate
  return {
    grid,
    startNodeId: `0-0`,
    goalNodeId:  `${size - 1}-${size - 1}`,
  };
}

/**
 * Create an N×N grid of default (relay) node stubs.
 * Every cell connected to its 4 orthogonal neighbours (existing cells only).
 * @param {number} size
 * @returns {NodeState[][]}
 */
function _createEmptyGrid(size) {
  // TODO: build 2D array of NodeState objects with id, type='relay', connections, etc.
  return [];
}

/**
 * Compute the canonical node id string from (row, col).
 * @param {number} row
 * @param {number} col
 * @returns {string}
 */
export function nodeId(row, col) {
  return `${row}-${col}`;
}

/**
 * Parse (row, col) from a node id string.
 * @param {string} id
 * @returns {{ row: number, col: number }}
 */
export function parseNodeId(id) {
  const [row, col] = id.split('-').map(Number);
  return { row, col };
}

/**
 * Retrieve a node from the grid by id string.
 * @param {NodeState[][]} grid
 * @param {string} id
 * @returns {NodeState|null}
 */
export function getNode(grid, id) {
  const { row, col } = parseNodeId(id);
  return grid[row]?.[col] ?? null;
}

/**
 * Apply level-specific visibility rules to the grid (mutates in place).
 * Levels 1-5: all visible.
 * Levels 6-10: OR-Splitter hidden (shown as '?').
 * Levels 11-15: Gate, Scrambler, OR-Splitter hidden.
 * @param {NodeState[][]} grid
 * @param {number} level
 */
export function applyVisibility(grid, level) {
  // TODO: set node.visible = false for nodes that should be hidden per level rules
}

/**
 * Temporarily reveal all hidden nodes (used by REVEAL power-up).
 * Returns a cleanup function that re-hides them.
 * @param {NodeState[][]} grid
 * @param {number} level
 * @returns {() => void} cleanup
 */
export function revealAll(grid, level) {
  // TODO: set all nodes visible=true, return function that calls applyVisibility again
  return () => {};
}

/**
 * BFS/DFS solvability check: can the signal reach goalNodeId from startNodeId
 * if all Gates start closed (their natural state)?
 * Used to validate generated grids.
 * @param {NodeState[][]} grid
 * @param {string} startNodeId
 * @param {string} goalNodeId
 * @returns {boolean}
 */
export function isSolvable(grid, startNodeId, goalNodeId) {
  // TODO: BFS from start; Gate nodes with gateOpen=false are impassable
  return false;
}

/**
 * Distribute node types across the grid according to CONFIG.NODE_DISTRIBUTION[level].
 * Does NOT overwrite backbone path nodes.
 * @param {NodeState[][]} grid
 * @param {string[]} backbonePath - array of node ids that must remain as their backbone type
 * @param {number} level
 */
function _distributeNodeTypes(grid, backbonePath, level) {
  // TODO: shuffle remaining cells; assign relay/gate/scrambler/or counts per distribution table
}

/**
 * Random-walk from startNodeId to goalNodeId across the grid.
 * Returns the sequence of node ids forming the backbone path.
 * @param {NodeState[][]} grid
 * @param {string} startNodeId
 * @param {string} goalNodeId
 * @returns {string[]} backbone node ids in order
 */
function _randomWalk(grid, startNodeId, goalNodeId) {
  // TODO: random walk with backtracking until goal is reached; avoid infinite loops with step cap
  return [startNodeId, goalNodeId];
}
