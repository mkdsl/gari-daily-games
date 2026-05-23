// Grid system — pure logic helpers (canPlace, place, remove, getOccupied)
// Works with Backpack instance and Item instances

/**
 * Returns the pixel position of a grid cell's top-left corner.
 * gridOriginX/Y: top-left pixel of the entire grid.
 */
export function cellToPixel(col, row, cellSize, gridOriginX, gridOriginY) {
  return {
    x: gridOriginX + col * cellSize,
    y: gridOriginY + row * cellSize,
  };
}

/**
 * Converts a pixel position to grid cell coordinates.
 * Returns {col, row} or null if outside grid.
 */
export function pixelToCell(px, py, cellSize, gridOriginX, gridOriginY, gridW, gridH) {
  const col = Math.floor((px - gridOriginX) / cellSize);
  const row = Math.floor((py - gridOriginY) / cellSize);
  if (col < 0 || col >= gridW || row < 0 || row >= gridH) return null;
  return { col, row };
}

/**
 * Snap gridX/gridY so the item stays inside the grid as much as possible.
 */
export function clampToGrid(gridX, gridY, itemCols, itemRows, gridW, gridH) {
  const cx = Math.max(0, Math.min(gridW - itemCols, gridX));
  const cy = Math.max(0, Math.min(gridH - itemRows, gridY));
  return { cx, cy };
}

/**
 * Given the top-left target cell, find the best-fit placement position
 * considering the item shape. Tries to center the shape on the clicked cell.
 */
export function bestFitPlacement(item, clickedCol, clickedRow, gridW, gridH) {
  const gridX = Math.round(clickedCol - (item.cols - 1) / 2);
  const gridY = Math.round(clickedRow - (item.rows - 1) / 2);
  const { cx, cy } = clampToGrid(gridX, gridY, item.cols, item.rows, gridW, gridH);
  return { gridX: cx, gridY: cy };
}
