// Drag & drop system — pickup, ghost preview, drop
import { bestFitPlacement } from './grid.js';
import { getGridOrigin } from '../render.js';
import { CELL_SIZE } from '../config.js';
import { pixelToCell } from './grid.js';

/**
 * Update ghost state based on current cursor/touch position on canvas.
 * Mutates state.ghost.
 */
export function updateGhost(px, py, canvas, state) {
  if (!state.selectedItem || !state.backpack) {
    state.ghost = null;
    return;
  }

  const { x: ox, y: oy } = getGridOrigin(canvas, state.backpack);
  const cell = pixelToCell(px, py, CELL_SIZE, ox, oy, state.backpack.width, state.backpack.height);

  if (!cell) {
    state.ghost = null;
    return;
  }

  const { gridX, gridY } = bestFitPlacement(
    state.selectedItem,
    cell.col,
    cell.row,
    state.backpack.width,
    state.backpack.height
  );

  const valid = state.backpack.canPlace(state.selectedItem, gridX, gridY);

  state.ghost = {
    item: state.selectedItem,
    gridX,
    gridY,
    valid,
  };
}

/**
 * Clear ghost.
 */
export function clearGhost(state) {
  state.ghost = null;
}

/**
 * Attempt to place the selected item at the cell under cursor.
 * Returns 'placed' | 'invalid' | 'no_selection'.
 */
export function tryDrop(col, row, state) {
  if (!state.selectedItem || !state.backpack) return 'no_selection';

  const { gridX, gridY } = bestFitPlacement(
    state.selectedItem,
    col,
    row,
    state.backpack.width,
    state.backpack.height
  );

  if (state.backpack.canPlace(state.selectedItem, gridX, gridY)) {
    state.backpack.place(state.selectedItem, gridX, gridY);
    state.selectedItem.placed = true;

    // Move from available to placed
    const idx = state.availableItems.indexOf(state.selectedItem);
    if (idx !== -1) state.availableItems.splice(idx, 1);
    state.placedItems.push(state.selectedItem);

    state.selectedItem = null;
    state.ghost = null;
    return 'placed';
  }

  return 'invalid';
}
