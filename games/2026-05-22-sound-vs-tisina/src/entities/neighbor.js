// neighbor.js — Neighbor entity
export class Neighbor {
  constructor({ pos, radius, name }) {
    this.pos = { x: pos.x, y: pos.y }; // grid coords
    this.radius = radius || 3; // cells around neighbor to average
    this.name = name || 'Komšija';
    this.currentSPL = 0;
  }
}
