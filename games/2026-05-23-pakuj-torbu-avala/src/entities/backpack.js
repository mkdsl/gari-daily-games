// Backpack — grid container, cell state management
export class Backpack {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    // cells[row][col] = null | itemId string
    this.cells = Array.from({ length: height }, () =>
      Array(width).fill(null)
    );
  }

  inBounds(r, c) {
    return r >= 0 && r < this.height && c >= 0 && c < this.width;
  }

  /**
   * Check if an item can be placed at (gridX, gridY) with its currentShape.
   * Returns true if all occupied cells are in-bounds and empty.
   */
  canPlace(item, gridX, gridY) {
    for (let r = 0; r < item.rows; r++) {
      for (let c = 0; c < item.cols; c++) {
        if (item.currentShape[r][c] === 1) {
          const row = gridY + r;
          const col = gridX + c;
          if (!this.inBounds(row, col)) return false;
          if (this.cells[row][col] !== null) return false;
        }
      }
    }
    return true;
  }

  /**
   * Place item at (gridX, gridY). Mutates item.placed, item.gridX, item.gridY.
   * Assumes canPlace() was checked first.
   */
  place(item, gridX, gridY) {
    for (let r = 0; r < item.rows; r++) {
      for (let c = 0; c < item.cols; c++) {
        if (item.currentShape[r][c] === 1) {
          this.cells[gridY + r][gridX + c] = item.id;
        }
      }
    }
    item.placed = true;
    item.gridX = gridX;
    item.gridY = gridY;
  }

  /**
   * Remove item from grid. Clears all cells occupied by item.
   */
  remove(item) {
    if (!item.placed) return;
    const cells = item.getOccupiedCells(item.gridX, item.gridY);
    for (const { r, c } of cells) {
      if (this.inBounds(r, c)) {
        this.cells[r][c] = null;
      }
    }
    item.placed = false;
    item.gridX = -1;
    item.gridY = -1;
  }

  /** Returns array of {r, c} for all filled cells */
  getFilledCells() {
    const filled = [];
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.cells[r][c] !== null) {
          filled.push({ r, c, itemId: this.cells[r][c] });
        }
      }
    }
    return filled;
  }

  clear() {
    this.cells = Array.from({ length: this.height }, () =>
      Array(this.width).fill(null)
    );
  }
}
