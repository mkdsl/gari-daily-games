// neighbor.js — Neighbor entity with SPL sampling radius
export class Neighbor {
  constructor({ pos, radius, name, limitDb }) {
    this.pos = { x: pos.x, y: pos.y }; // grid coords
    this.radius = radius || 3;          // cells around neighbor for SPL averaging
    this.name = name || 'Komšija';
    this.limitDb = limitDb || 70;       // complaint threshold for this neighbor
    this.currentSPL = 0;               // updated each tick by spl-engine
    this.complaints = 0;               // complaint count
    this.isSleeping = false;           // true when baby event active etc.
  }

  // Returns 0-1 anger level based on SPL vs limit
  getAnger() {
    if (this.currentSPL < this.limitDb - 5) return 0;
    if (this.currentSPL >= this.limitDb + 5) return 1;
    return (this.currentSPL - (this.limitDb - 5)) / 10;
  }

  // Returns string label for thermometer
  getStatusLabel() {
    const anger = this.getAnger();
    if (anger < 0.2) return 'Spava mirno';
    if (anger < 0.5) return 'Probudjen';
    if (anger < 0.8) return 'Ljut';
    return 'Zove inspekciju!';
  }

  // Serialize for save state
  toJSON() {
    return { pos: this.pos, complaints: this.complaints, currentSPL: this.currentSPL };
  }
}
