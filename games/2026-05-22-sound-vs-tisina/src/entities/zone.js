// AudioZone entity

export class AudioZone {
  constructor({ id, name, pos, defaultDb, isControllable, isNeighbor = false }) {
    this.id = id;
    this.name = name;
    this.pos = { x: pos.x, y: pos.y }; // grid coordinates (0-99, 0-59)
    this.db = defaultDb;
    this.defaultDb = defaultDb;
    this.minDb = 60;
    this.maxDb = 110;
    this.isControllable = isControllable;
    this.isNeighbor = isNeighbor;
    this.currentSPL = 0; // computed SPL at this zone position
  }

  setDb(value) {
    if (!this.isControllable) return;
    this.db = Math.max(this.minDb, Math.min(this.maxDb, value));
  }

  // Returns dot indicator count (0-5) based on normalized db
  getDotLevel() {
    const norm = (this.db - this.minDb) / (this.maxDb - this.minDb);
    return Math.round(norm * 5);
  }

  reset() {
    this.db = this.defaultDb;
  }
}
