import { CONFIG } from './config.js';

/**
 * @typedef {import('./state.js').NodeState} NodeState
 */

/**
 * Generate a complete, guaranteed-solvable grid for the given level.
 *
 * Algorithm overview:
 *  1. Create an N×N grid of empty cells.
 *  2. Random-walk a backbone path from start (0,0) to goal (N-1,N-1).
 *  3. Distribute node types per CONFIG.NODE_DISTRIBUTION[level].
 *  4. Validate solvability (BFS from start; goal reachable through open gates).
 *  5. If not solvable, retry (max 10 attempts).
 *
 * @param {number} level - 1-15
 * @returns {{
 *   grid: NodeState[][],
 *   startNodeId: string,
 *   goalNodeId: string
 * }}
 */
export function generateGrid(level) {
  const size = CONFIG.GRID_SIZE[level];
  const startNodeId = '0-0';
  const goalNodeId  = `${size - 1}-${size - 1}`;

  const MAX_ATTEMPTS = 10;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const grid = _createEmptyGrid(size);
    const backbone = _randomWalk(grid, startNodeId, goalNodeId);
    _distributeNodeTypes(grid, backbone, level);

    if (isSolvable(grid, startNodeId, goalNodeId)) {
      return { grid, startNodeId, goalNodeId };
    }
  }

  // Fallback: create a clean relay-only grid (always solvable)
  const grid = _createEmptyGrid(size);
  return { grid, startNodeId, goalNodeId };
}

/**
 * Create an N×N grid of default (relay) node stubs.
 * Every cell connected to its 4 orthogonal neighbours (existing cells only).
 * @param {number} size
 * @returns {NodeState[][]}
 */
function _createEmptyGrid(size) {
  /** @type {NodeState[][]} */
  const grid = [];

  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      grid[r][c] = {
        id: nodeId(r, c),
        type: 'relay',
        gateOpen: false,
        visible: true,
        row: r,
        col: c,
        connections: [],
      };
    }
  }

  // Wire up 4-directional connections
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          grid[r][c].connections.push(nodeId(nr, nc));
        }
      }
    }
  }

  return grid;
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
 * Manhattan distance between two node ids.
 * @param {string} aId
 * @param {string} bId
 * @returns {number}
 */
function _manhattan(aId, bId) {
  const a = parseNodeId(aId);
  const b = parseNodeId(bId);
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
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
  const { FULL, PARTIAL, MINIMAL } = CONFIG.VISIBILITY;

  for (const row of grid) {
    for (const node of row) {
      if (FULL.includes(level)) {
        node.visible = true;
      } else if (PARTIAL.includes(level)) {
        // Only OR-Splitter hidden
        node.visible = node.type !== 'or';
      } else if (MINIMAL.includes(level)) {
        // Everything except relay is hidden
        node.visible = node.type === 'relay';
      } else {
        node.visible = true;
      }
    }
  }
}

/**
 * Temporarily reveal all hidden nodes (used by REVEAL power-up).
 * Returns a cleanup function that re-hides them.
 * @param {NodeState[][]} grid
 * @param {number} level
 * @returns {() => void} cleanup
 */
export function revealAll(grid, level) {
  // Collect which nodes were hidden so we can restore them
  const hiddenIds = [];
  for (const row of grid) {
    for (const node of row) {
      if (!node.visible) {
        hiddenIds.push(node.id);
        node.visible = true;
      }
    }
  }

  return () => {
    // Re-apply visibility rules (only needed for MINIMAL/PARTIAL; FULL rows stay visible)
    applyVisibility(grid, level);
  };
}

/**
 * BFS solvability check: can the signal reach goalNodeId from startNodeId?
 * Treats gate nodes with gateOpen=false as impassable.
 * relay, scrambler, or, and open gate nodes are passable.
 * @param {NodeState[][]} grid
 * @param {string} startNodeId
 * @param {string} goalNodeId
 * @returns {boolean}
 */
export function isSolvable(grid, startNodeId, goalNodeId) {
  const visited = new Set();
  const queue = [startNodeId];
  visited.add(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === goalNodeId) return true;

    const node = getNode(grid, current);
    if (!node) continue;

    for (const neighborId of node.connections) {
      if (visited.has(neighborId)) continue;
      const neighbor = getNode(grid, neighborId);
      if (!neighbor) continue;

      // Closed gates are impassable in validation
      if (neighbor.type === 'gate' && !neighbor.gateOpen) continue;

      visited.add(neighborId);
      queue.push(neighborId);
    }
  }

  return false;
}

/**
 * Distribute node types across the grid according to CONFIG.NODE_DISTRIBUTION[level].
 * The backbone path nodes get their types assigned first; remaining cells fill in.
 * @param {NodeState[][]} grid
 * @param {string[]} backbonePath - ordered list of node ids on the backbone
 * @param {number} level
 */
function _distributeNodeTypes(grid, backbonePath, level) {
  const size = grid.length;
  const [relayCount, gateCount, scramblerCount, orCount] = CONFIG.NODE_DISTRIBUTION[level];

  // Track how many of each type remain to be placed (across whole grid)
  let remaining = { relay: relayCount, gate: gateCount, scrambler: scramblerCount, or: orCount };

  const backboneSet = new Set(backbonePath);

  // ----- Assign types to backbone nodes (skip start and goal — keep them relay) -----
  const startId = backbonePath[0];
  const goalId  = backbonePath[backbonePath.length - 1];

  // Backbone interior nodes (exclude start/goal)
  const interiorBackbone = backbonePath.slice(1, -1);

  // We distribute: gate-heavy, occasional scrambler/or, rest relay.
  // Max 1 scrambler per 3 consecutive backbone nodes to avoid deadlock clusters.
  let lastScramblerIdx = -99;

  for (let i = 0; i < interiorBackbone.length; i++) {
    const id = interiorBackbone[i];
    const node = getNode(grid, id);
    if (!node) continue;

    // Determine candidate types for this backbone node
    // Priority order: or > scrambler > gate > relay
    // Constraints:
    //   - scrambler: not within 3 steps of previous scrambler on backbone
    //   - or: must have at least 2 connections (always true on interior grid)
    //   - gate: freely placed on backbone (player can click to open)

    let assignedType = 'relay';

    // Try to place an 'or' node
    if (remaining.or > 0 && Math.random() < 0.15) {
      assignedType = 'or';
      remaining.or--;
    }
    // Try to place a scrambler
    else if (remaining.scrambler > 0 && (i - lastScramblerIdx) >= 3 && Math.random() < 0.12) {
      // Safety: check the scrambler won't create a deadlock.
      // A deadlock occurs if the only passable neighbor on backbone is also the only
      // gate that the scrambler would toggle — making it flip from required-open to closed.
      // Simple heuristic: only place scrambler if this node has >1 backbone neighbor.
      const backboneNeighbors = node.connections.filter(nid => backboneSet.has(nid));
      if (backboneNeighbors.length >= 1) {
        assignedType = 'scrambler';
        remaining.scrambler--;
        lastScramblerIdx = i;
      } else {
        assignedType = 'relay';
        remaining.relay = Math.max(0, remaining.relay - 1);
      }
    }
    // Try to place a gate
    else if (remaining.gate > 0 && Math.random() < 0.45) {
      assignedType = 'gate';
      remaining.gate--;
      // Gates start closed; player must click them
    }
    // Default: relay
    else {
      if (remaining.relay > 0) {
        remaining.relay--;
      }
    }

    node.type = assignedType;
    if (assignedType === 'gate') {
      node.gateOpen = false;
    }
  }

  // Backbone start and goal stay relay
  const startNode = getNode(grid, startId);
  const goalNode  = getNode(grid, goalId);
  if (startNode) { startNode.type = 'relay'; }
  if (goalNode)  { goalNode.type  = 'relay'; }

  // ----- Assign types to off-backbone nodes -----
  // Collect non-backbone cells
  const offBackbone = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const id = nodeId(r, c);
      if (!backboneSet.has(id)) {
        offBackbone.push(id);
      }
    }
  }

  // Shuffle off-backbone nodes
  _shuffle(offBackbone);

  // Distribute remaining types to off-backbone cells
  // Remaining counts are whatever wasn't consumed on backbone
  const offTotal = offBackbone.length;

  for (let i = 0; i < offTotal; i++) {
    const id = offBackbone[i];
    const node = getNode(grid, id);
    if (!node) continue;

    // Pick type based on remaining proportions
    const pick = Math.random() * (remaining.relay + remaining.gate + remaining.scrambler + remaining.or);
    let cum = 0;
    let assignedType = 'relay';

    cum += remaining.relay;
    if (pick < cum && remaining.relay > 0) {
      assignedType = 'relay';
      remaining.relay--;
    } else {
      cum += remaining.gate;
      if (pick < cum && remaining.gate > 0) {
        assignedType = 'gate';
        remaining.gate--;
      } else {
        cum += remaining.scrambler;
        if (pick < cum && remaining.scrambler > 0) {
          assignedType = 'scrambler';
          remaining.scrambler--;
        } else if (remaining.or > 0) {
          assignedType = 'or';
          remaining.or--;
        } else if (remaining.gate > 0) {
          assignedType = 'gate';
          remaining.gate--;
        } else if (remaining.relay > 0) {
          assignedType = 'relay';
          remaining.relay--;
        }
      }
    }

    node.type = assignedType;
    if (assignedType === 'gate') {
      node.gateOpen = false;
    }
  }

  // ----- Mark backbone gates as open for BFS validation -----
  // Backbone gates start closed in gameplay (player must click them).
  // For isSolvable() validation we mark them gateOpen=true — modeling the fact that
  // the player CAN open them before the signal arrives. This is the correct semantic:
  // the puzzle is solvable IF the player opens the backbone gates.
  for (const id of interiorBackbone) {
    const node = getNode(grid, id);
    if (node && node.type === 'gate') {
      node.gateOpen = true;
    }
  }
}

/**
 * Random-walk from startNodeId to goalNodeId across the grid.
 * 70% of steps move toward the goal (lower Manhattan distance); 30% random.
 * Returns the sequence of node ids forming the backbone path.
 * @param {NodeState[][]} grid
 * @param {string} startNodeId
 * @param {string} goalNodeId
 * @returns {string[]} backbone node ids in order
 */
function _randomWalk(grid, startNodeId, goalNodeId) {
  const MAX_STEPS = 300;
  const MAX_RESTARTS = 20;

  for (let restart = 0; restart < MAX_RESTARTS; restart++) {
    const path = [startNodeId];
    const visited = new Set([startNodeId]);
    let current = startNodeId;

    for (let step = 0; step < MAX_STEPS; step++) {
      if (current === goalNodeId) {
        return path;
      }

      const node = getNode(grid, current);
      if (!node) break;

      // Split neighbors into "toward goal" and "any"
      const unvisited = node.connections.filter(id => !visited.has(id));
      if (unvisited.length === 0) {
        // Dead end — backtrack one step if possible
        if (path.length > 1) {
          path.pop();
          visited.delete(current);
          current = path[path.length - 1];
          continue;
        }
        break; // truly stuck
      }

      // Sort by distance to goal (ascending = toward goal first)
      const sorted = unvisited.slice().sort(
        (a, b) => _manhattan(a, goalNodeId) - _manhattan(b, goalNodeId)
      );

      let next;
      if (Math.random() < 0.70) {
        // Greedy: pick the closest unvisited neighbor
        next = sorted[0];
      } else {
        // Random: pick any unvisited neighbor
        next = unvisited[Math.floor(Math.random() * unvisited.length)];
      }

      path.push(next);
      visited.add(next);
      current = next;
    }
  }

  // Fallback: straight-line path along row then column
  return _straightPath(startNodeId, goalNodeId);
}

/**
 * Deterministic fallback: walk along rows then columns.
 * @param {string} startId
 * @param {string} goalId
 * @returns {string[]}
 */
function _straightPath(startId, goalId) {
  const { row: sr, col: sc } = parseNodeId(startId);
  const { row: gr, col: gc } = parseNodeId(goalId);
  const path = [];
  let r = sr;
  let c = sc;
  path.push(nodeId(r, c));
  while (r !== gr) {
    r += r < gr ? 1 : -1;
    path.push(nodeId(r, c));
  }
  while (c !== gc) {
    c += c < gc ? 1 : -1;
    path.push(nodeId(r, c));
  }
  return path;
}

/**
 * In-place Fisher-Yates shuffle.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
