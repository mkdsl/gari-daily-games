// zone.js — AudioZone entity
export class AudioZone {
  constructor({ id, name, pos, defaultDb, isControllable, isNeighbor }) {
    this.id = id;
    this.name = name;
    this.pos = { x: pos.x, y: pos.y }; // grid coords (0–99, 0–59)
    this.db = defaultDb;
    this.defaultDb = defaultDb;
    this.isControllable = !!isControllable;
    this.isNeighbor = !!isNeighbor;
    this.minDb = 60;
    this.maxDb = 110;
  }

  setDb(value) {
    this.db = Math.max(this.minDb, Math.min(this.maxDb, value));
  }

  // Returns dot-indicator string (5 dots, filled proportionally)
  getDotIndicator() {
    const range = this.maxDb - this.minDb;
    const filled = Math.round(((this.db - this.minDb) / range) * 5);
    return '●'.repeat(filled) + '○'.repeat(5 - filled);
  }
}
