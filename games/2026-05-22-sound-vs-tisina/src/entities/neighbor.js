// Neighbor entity

export class Neighbor {
  constructor({ pos, radius = 3, name = 'Komšija' }) {
    this.pos = { x: pos.x, y: pos.y };
    this.radius = radius;
    this.name = name;
    this.currentSPL = 0;
    this.isAngry = false;
    this.angerLevel = 0; // 0-1
  }

  update(spl, limit) {
    this.currentSPL = spl;
    const ratio = (spl - (limit - 10)) / 15;
    this.angerLevel = Math.max(0, Math.min(1, ratio));
    this.isAngry = spl > limit;
  }

  // Returns emoji mood
  getMood() {
    if (this.angerLevel < 0.3) return '😴';
    if (this.angerLevel < 0.6) return '😐';
    if (this.angerLevel < 0.85) return '😤';
    return '😡';
  }
}
