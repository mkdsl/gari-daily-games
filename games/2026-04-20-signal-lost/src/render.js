import { CONFIG } from './config.js';

/**
 * @typedef {import('./state.js').GameState} GameState
 */

// Flash effect state (managed internally, mutated by scheduleFlash)
const _flash = { color: null, alpha: 0, timerMs: 0 };

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
  // TODO: compute cellSize so grid fits centered with padding
  return { cellSize: 0, originX: 0, originY: 0 };
}

/**
 * Convert grid [row, col] to canvas pixel center {x, y}.
 * @param {number} row
 * @param {number} col
 * @param {{ cellSize: number, originX: number, originY: number }} layout
 * @returns {{ x: number, y: number }}
 */
export function gridToPixel(row, col, layout) {
  // TODO: return pixel center of (row, col) cell
  return { x: 0, y: 0 };
}

/**
 * Convert canvas pixel {x, y} to grid {row, col}.
 * Returns null if outside grid bounds.
 * @param {number} px
 * @param {number} py
 * @param {import('./state.js').NodeState[][]} grid
 * @param {{ cellSize: number, originX: number, originY: number }} layout
 * @returns {{ row: number, col: number }|null}
 */
export function pixelToGrid(px, py, grid, layout) {
  // TODO: inverse of gridToPixel; bounds-check before returning
  return null;
}

/**
 * Draw faint grid lines connecting adjacent nodes.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').NodeState[][]} grid
 * @param {object} layout
 */
function _drawGridLines(ctx, grid, layout) {
  // TODO: draw edge lines for each connected pair using CONFIG.COLORS.GRID_LINE
}

/**
 * Draw all node circles with icons/labels based on type and visibility.
 * Gate = open/closed lock icon; Scrambler = X; OR = Y; Relay = dot; unknown = ?
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {object} layout
 */
function _drawNodes(ctx, state, layout) {
  // TODO: for each node in grid, draw circle + icon
  //   highlight start (CYAN border) and goal (ORANGE border)
  //   highlight nodes in signal.path (dimly lit)
  //   apply glow via ctx.shadowBlur when NODE_ACTIVE
}

/**
 * Draw the animated signal dot travelling between nodes.
 * Interpolates position based on state.signal.progress.
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {object} layout
 * @param {number} dt
 */
function _drawSignal(ctx, state, layout, dt) {
  // TODO: draw SIGNAL colored glow dot at lerped position between currentNode and nextNode
  //   also draw each branch in state.signal.activeBranches
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
