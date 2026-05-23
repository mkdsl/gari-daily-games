// Item entity: shape, rotation, placement state
import { rotateShape } from '../systems/rotation.js';

export class Item {
  constructor(def) {
    this.id = def.id;
    this.label = def.label;
    this.emoji = def.emoji || '';
    this.baseShape = def.shape.map(row => [...row]); // deep copy
    this.currentShape = def.shape.map(row => [...row]);
    this.color = def.color;
    this.required = def.required;
    this.points = def.points;
    this.rotation = 0; // 0, 90, 180, 270
    this.placed = false;
    this.gridX = -1;
    this.gridY = -1;
  }

  get cols() {
    return this.currentShape[0].length;
  }

  get rows() {
    return this.currentShape.length;
  }

  rotate() {
    this.currentShape = rotateShape(this.currentShape);
    this.rotation = (this.rotation + 90) % 360;
  }

  resetRotation() {
    this.currentShape = this.baseShape.map(row => [...row]);
    this.rotation = 0;
  }

  clone() {
    const copy = new Item(this);
    copy.currentShape = this.currentShape.map(row => [...row]);
    copy.rotation = this.rotation;
    copy.placed = this.placed;
    copy.gridX = this.gridX;
    copy.gridY = this.gridY;
    return copy;
  }

  getOccupiedCells(gridX, gridY) {
    const cells = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.currentShape[r][c] === 1) {
          cells.push({ r: gridY + r, c: gridX + c });
        }
      }
    }
    return cells;
  }
}
