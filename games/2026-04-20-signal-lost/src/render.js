import { CONFIG } from './config.js';

/**
 * @typedef {import('./state.js').GameState} GameState
 */

// Flash effect state (managed internally, mutated by scheduleFlash)
const _flash = { color: null, alpha: 0, timerMs: 0 };

// Accumulated time for goal pulse animation
let _pulseT = 0;

/**
 * Schedule a full-screen color flash effect.
 * @param {'success'|'fail'|'checkpoint'} type
 */
export function scheduleFlash(type) {
  if (type === 'success')    { _flash.color = CONFIG.COLORS.SUCCESS;  _flash.timerMs = CONFIG.FLASH_SUCCESS_MS; }
  if (type === 'fail')       { _flash.color = CONFIG.COLORS.FAIL;     _flash.timerMs = CONFIG.FLASH_FAIL_MS; }
  if (type === 'checkpoint') { _flash.color = CONFIG.COLORS.CYAN;     _flash.timerMs = CONFIG.CHECKPOINT_PULSE_MS; }
  _flash.alpha = 0.5;
}

/**
 * Main render function — clears canvas and draws full scene each frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {number} dt - seconds since last frame (for animations)
 */
export function render(ctx, state, dt = 0) {
  const w = ctx.canvas.width / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  _pulseT += dt;

  // Clear
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  if (state.screen !== 'game' && state.screen !== 'powerup' && state.screen !== 'checkpoint') return;
  if (!state.grid || state.grid.length === 0) return;

  const layout = _calcLayout(state.grid, w, h);

  _drawGridLines(ctx, state.grid, layout);
  _drawNodes(ctx, state, layout);
  _drawSignal(ctx, state, layout, dt);
  _drawFlash(ctx, w, h, dt);
}

/**
 * Calculate pixel positions for each grid cell.
 * Returns an object with cellSize and origin {x, y}.
 * @param {import('./state.js').NodeState[][]} grid
 * @param {number} w - canvas logical width
 * @param {number} h - canvas logical height
 * @returns {{ cellSize: number, originX: number, originY: number }}
 */
function _calcLayout(grid, w, h) {
  const size = grid.length;
  // Reserve top HUD space (52px) and some bottom padding
  const availH = h - 64;
  const availW = w;
  const cellSize = Math.floor(Math.min(availW, availH) * 0.85 / size);
  const originX = (w - cellSize * size) / 2;
  const originY = (h - cellSize * size) / 2 + 16; // slight downward shift for HUD
  return { cellSize, originX, originY, size };
}

/**
 * Convert grid [row, col] to canvas pixel center {x, y}.
 * @param {number} row
 * @param {number} col
 * @param {{ cellSize: number, originX: number, originY: number }} layout
 * @returns {{ x: number, y: number }}
 */
export function gridToPixel(row, col, layout) {
  return {
    x: layout.originX + col * layout.cellSize + layout.cellSize / 2,
    y: layout.originY + row * layout.cellSize + layout.cellSize / 2,
  };
}

/**
 * Convert canvas pixel {x, y} to grid {row, col}.
 * Returns null if outside grid bounds or not close enough to a node center.
 * @param {number} px
 * @param {number} py
 * @param {import('./state.js').NodeState[][]} grid
 * @param {{ cellSize: number, originX: number, originY: number }} layout
 * @returns {{ row: number, col: number }|null}
 */
export function pixelToGrid(px, py, grid, layout) {
  const size = grid.length;
  const col = Math.floor((px - layout.originX) / layout.cellSize);
  const row = Math.floor((py - layout.originY) / layout.cellSize);

  if (row < 0 || row >= size || col < 0 || col >= size) return null;

  // Check proximity to node center
  const center = gridToPixel(row, col, layout);
  const dx = px - center.x;
  const dy = py - center.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > CONFIG.NODE_RADIUS + 4) return null;

  return { row, col };
}

/**
 * Draw faint grid lines connecting adjacent nodes.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').NodeState[][]} grid
 * @param {object} layout
 */
function _drawGridLines(ctx, grid, layout) {
  const seen = new Set();

  ctx.save();
  ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.lineCap = 'round';

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const node = grid[row][col];
      if (!node) continue;
      const from = gridToPixel(row, col, layout);

      for (const connId of node.connections) {
        const edgeKey = [node.id, connId].sort().join('|');
        if (seen.has(edgeKey)) continue;
        seen.add(edgeKey);

        // Find the connected node
        const [connRow, connCol] = connId.split('-').map(Number);
        if (connRow < 0 || connRow >= grid.length || connCol < 0 || connCol >= grid[connRow].length) continue;
        const to = gridToPixel(connRow, connCol, layout);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/**
 * Draw all node circles with icons/labels based on type and visibility.
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {object} layout
 */
function _drawNodes(ctx, state, layout) {
  const grid = state.grid;
  const signal = state.signal;
  const pathSet = new Set(signal.path ?? []);
  const r = CONFIG.NODE_RADIUS;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const node = grid[row][col];
      if (!node) continue;

      const { x, y } = gridToPixel(row, col, layout);
      const isStart = node.id === state.startNodeId;
      const isGoal  = node.id === state.goalNodeId;
      const inPath  = pathSet.has(node.id);
      const isVisible = node.visible !== false;

      ctx.save();

      // Dim nodes already visited
      if (inPath && node.id !== signal.currentNodeId) {
        ctx.globalAlpha = 0.45;
      }

      // Determine fill color
      let fillColor = CONFIG.COLORS.NODE_DEFAULT;
      let glowColor = null;

      if (!isVisible) {
        fillColor = CONFIG.COLORS.NODE_UNKNOWN;
      } else if (node.type === 'gate') {
        fillColor = node.gateOpen ? CONFIG.COLORS.NODE_GATE_ON : CONFIG.COLORS.NODE_GATE_OFF;
        if (node.gateOpen) glowColor = CONFIG.COLORS.NODE_ACTIVE;
      } else if (node.type === 'scrambler') {
        fillColor = CONFIG.COLORS.NODE_SCRAMBLER;
        glowColor = '#7c3aed';
      } else if (node.type === 'or') {
        fillColor = CONFIG.COLORS.NODE_OR;
        glowColor = '#f59e0b';
      } else {
        // relay
        fillColor = CONFIG.COLORS.NODE_DEFAULT;
      }

      // Glow effect (save/restore to prevent bleed)
      if (glowColor) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = glowColor;
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Stroke (ring) for current-node highlight
      if (node.id === signal.currentNodeId) {
        ctx.strokeStyle = CONFIG.COLORS.SIGNAL;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Start node ring — cyan
      if (isStart) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = CONFIG.COLORS.CYAN;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Goal node ring — orange with pulse
      if (isGoal) {
        const pulse = 1 + 0.12 * Math.sin(_pulseT * 4);
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = CONFIG.COLORS.ORANGE;
        ctx.beginPath();
        ctx.arc(x, y, (r + 4) * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = CONFIG.COLORS.ORANGE;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // Draw icon inside node
      ctx.restore();
      ctx.save();
      if (inPath && node.id !== signal.currentNodeId) ctx.globalAlpha = 0.45;
      _drawNodeIcon(ctx, node, x, y, r, isVisible);
      ctx.restore();
    }
  }
}

/**
 * Draw the icon/symbol inside a node circle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').NodeState} node
 * @param {number} x
 * @param {number} y
 * @param {number} r
 * @param {boolean} isVisible
 */
function _drawNodeIcon(ctx, node, x, y, r, isVisible) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (!isVisible) {
    // Unknown: "?"
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `bold ${Math.floor(r * 0.85)}px monospace`;
    ctx.fillText('?', x, y);
    return;
  }

  switch (node.type) {
    case 'relay': {
      // Small dot in center
      ctx.beginPath();
      ctx.arc(x, y, r * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.COLORS.NODE_ACTIVE;
      ctx.fill();
      break;
    }
    case 'gate': {
      if (node.gateOpen) {
        // Open gate: right-pointing arrow chevron
        const s = r * 0.42;
        ctx.strokeStyle = CONFIG.COLORS.BG;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x - s, y - s);
        ctx.lineTo(x + s * 0.6, y);
        ctx.lineTo(x - s, y + s);
        ctx.stroke();
      } else {
        // Closed gate: X
        const s = r * 0.38;
        ctx.strokeStyle = CONFIG.COLORS.FAIL;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - s, y - s);
        ctx.lineTo(x + s, y + s);
        ctx.moveTo(x + s, y - s);
        ctx.lineTo(x - s, y + s);
        ctx.stroke();
      }
      break;
    }
    case 'scrambler': {
      // Rotating arc arrows (simplified spiral symbol)
      const s = r * 0.45;
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      // Outer arc
      ctx.beginPath();
      ctx.arc(x, y, s, -Math.PI * 0.8, Math.PI * 0.8);
      ctx.stroke();
      // Arrow tip on end of arc
      const endX = x + s * Math.cos(Math.PI * 0.8);
      const endY = y + s * Math.sin(Math.PI * 0.8);
      ctx.beginPath();
      ctx.moveTo(endX - 4, endY - 4);
      ctx.lineTo(endX, endY);
      ctx.lineTo(endX + 4, endY - 2);
      ctx.stroke();
      break;
    }
    case 'or': {
      // Y shape (fork)
      const s = r * 0.42;
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      // Stem
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + s);
      ctx.stroke();
      // Left branch
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - s * 0.7, y - s * 0.7);
      ctx.stroke();
      // Right branch
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s * 0.7, y - s * 0.7);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
}

/**
 * Draw the animated signal dot travelling between nodes.
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {object} layout
 * @param {number} dt
 */
function _drawSignal(ctx, state, layout, dt) {
  const signal = state.signal;
  if (!signal || signal.currentNodeId == null) return;

  const grid = state.grid;

  /**
   * Find a node in the grid by id.
   * @param {string} id
   * @returns {{ row: number, col: number }|null}
   */
  function findNodePos(id) {
    if (!id) return null;
    const [r, c] = id.split('-').map(Number);
    if (isNaN(r) || isNaN(c)) return null;
    return { row: r, col: c };
  }

  // Helper: lerp
  const lerp = (a, b, t) => a + (b - a) * t;

  // Draw all active branches (OR splitter secondary paths)
  const branches = signal.activeBranches ?? [];
  for (const branchNodeId of branches) {
    const bPos = findNodePos(branchNodeId);
    if (!bPos) continue;
    const { x, y } = gridToPixel(bPos.row, bPos.col, layout);
    _drawSignalDot(ctx, x, y, CONFIG.SIGNAL_RADIUS * 0.75, 'rgba(255,107,43,0.6)');
  }

  // Compute interpolated position for main signal
  const curPos = findNodePos(signal.currentNodeId);
  if (!curPos) return;
  const curPx = gridToPixel(curPos.row, curPos.col, layout);

  let sigX = curPx.x;
  let sigY = curPx.y;

  if (signal.nextNodeId && signal.moving) {
    const nextPos = findNodePos(signal.nextNodeId);
    if (nextPos) {
      const nextPx = gridToPixel(nextPos.row, nextPos.col, layout);
      const t = Math.max(0, Math.min(1, signal.progress ?? 0));
      sigX = lerp(curPx.x, nextPx.x, t);
      sigY = lerp(curPx.y, nextPx.y, t);
    }
  }

  _drawSignalDot(ctx, sigX, sigY, CONFIG.SIGNAL_RADIUS, CONFIG.COLORS.SIGNAL);
}

/**
 * Draw a glowing signal dot at a given canvas position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} color
 */
function _drawSignalDot(ctx, x, y, radius, color) {
  ctx.save();
  // Outer glow
  ctx.shadowBlur = CONFIG.GLOW_BLUR;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Inner bright core
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.restore();
}

/**
 * Draw full-screen flash overlay (success/fail/checkpoint).
 * Fades out over _flash.timerMs.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} dt
 */
function _drawFlash(ctx, w, h, dt) {
  if (!_flash.color || _flash.timerMs <= 0) return;
  _flash.timerMs -= dt * 1000;
  _flash.alpha = Math.max(0, _flash.alpha * 0.85);
  ctx.save();
  ctx.globalAlpha = _flash.alpha;
  ctx.fillStyle = _flash.color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  if (_flash.timerMs <= 0) { _flash.color = null; _flash.alpha = 0; }
}
