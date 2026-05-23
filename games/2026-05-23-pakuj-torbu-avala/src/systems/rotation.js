// Rotate a 2D shape array 90 degrees clockwise
export function rotateShape(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  // New shape: cols rows, rows cols
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
}

/**
 * Rotate item's currentShape in-place (clockwise 90deg).
 * Updates item.rotation.
 */
export function rotateItem(item) {
  item.rotate();
}
