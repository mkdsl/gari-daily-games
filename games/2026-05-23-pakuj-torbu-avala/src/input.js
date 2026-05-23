// Unified mouse + touch input handler
import { pixelToCell, bestFitPlacement } from './systems/grid.js';
import { getGridOrigin } from './render.js';
import { CELL_SIZE } from './config.js';

export function setupInput(canvas, state, callbacks) {
  const { onCellClick, onCanvasMove, onCanvasLeave } = callbacks;

  // ---- Mouse ----
  canvas.addEventListener('mousemove', (e) => {
    const pos = getCanvasPos(canvas, e.clientX, e.clientY);
    onCanvasMove(pos.x, pos.y);
  });

  canvas.addEventListener('mouseleave', () => {
    onCanvasLeave();
  });

  canvas.addEventListener('click', (e) => {
    const pos = getCanvasPos(canvas, e.clientX, e.clientY);
    const cell = resolveCell(pos.x, pos.y, canvas, state);
    if (cell) onCellClick(cell.col, cell.row);
  });

  // ---- Touch ----
  let touchCell = null;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(canvas, touch.clientX, touch.clientY);
    touchCell = resolveCell(pos.x, pos.y, canvas, state);
    onCanvasMove(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(canvas, touch.clientX, touch.clientY);
    touchCell = resolveCell(pos.x, pos.y, canvas, state);
    onCanvasMove(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (touchCell) {
      onCellClick(touchCell.col, touchCell.row);
      touchCell = null;
    }
  }, { passive: false });
}

function getCanvasPos(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function resolveCell(px, py, canvas, state) {
  if (!state.backpack) return null;
  const { x: ox, y: oy } = getGridOrigin(canvas, state.backpack);
  return pixelToCell(px, py, CELL_SIZE, ox, oy, state.backpack.width, state.backpack.height);
}
