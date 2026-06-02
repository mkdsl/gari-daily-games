// entities/bag.js — Bag entitet (vreća supstrata)
import { CONFIG } from '../config.js';

export class Bag {
  /**
   * @param {number} x - centar X na canvasu (logički px)
   * @param {number} y - centar Y na canvasu (logički px)
   * @param {Object} levelConfig - CONFIG.LEVELS[n]
   */
  constructor(x, y, levelConfig) {
    this.x = x;
    this.y = y;
    this.width  = CONFIG.BAG.width;
    this.height = CONFIG.BAG.height;

    // Status vreće
    this.status = 'waiting'; // 'waiting' | 'active' | 'inoculated' | 'contaminated'

    // Koliko inokulacija treba (double_inoculation = 2)
    this.inoculationsNeeded = levelConfig.speciality === 'double_inoculation' ? 2 : 1;
    this.inoculationsDone   = 0;

    // Animacioni state
    this.animTimer  = 0;      // countdown ms; 0 = nema animacije
    this.animType   = null;   // 'success' | 'fail' | null
    this.animAlpha  = 1.0;    // fade out tokom animacije

    // Vizuelna varijanta (0,1,2) — utice na detalje crteža vreće
    this.variant = Math.floor(Math.random() * 3);

    // Micelij particle-i za success anim
    this.particles = [];
  }

  /**
   * Pokreće animaciju
   * @param {'success'|'fail'} type
   * @param {number} durationMs
   */
  startAnim(type, durationMs) {
    this.animType  = type;
    this.animTimer = durationMs;
    this.animAlpha = 1.0;

    if (type === 'success') {
      // Kreira micelij particle-e
      this.particles = [];
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
        this.particles.push({
          angle,
          speed:  40 + Math.random() * 30,
          len:    8  + Math.random() * 10,
          alpha:  1.0,
          life:   1.0,
        });
      }
    } else {
      // Fail: blob particle-i
      this.particles = [];
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        this.particles.push({
          angle,
          speed:  20 + Math.random() * 25,
          radius: 4  + Math.random() * 6,
          alpha:  1.0,
          life:   1.0,
        });
      }
    }
  }

  /**
   * @param {number} dt - delta time ms
   */
  update(dt) {
    if (this.animTimer <= 0) {
      this.animTimer = 0;
      this.animType  = null;
      this.particles = [];
      return;
    }
    this.animTimer -= dt;
    // Particle update
    const dtSec = dt / 1000;
    for (const p of this.particles) {
      p.life  -= dtSec * 1.8;
      p.alpha  = Math.max(0, p.life);
    }
    // Animacija je gotova kad timer padne na 0
    if (this.animTimer < 0) this.animTimer = 0;
  }

  /** Vraća true ako ima aktivnu animaciju */
  get isAnimating() {
    return this.animTimer > 0;
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Kreira niz Bag objekata raspoređenih po canvasu za dati nivo.
 * @param {Object} levelConfig
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {Bag[]}
 */
export function createBagsForLevel(levelConfig, canvasW, canvasH) {
  const bags = [];
  const { speciality, bags: bagCount, multiCount } = levelConfig;

  // Y pozicija stola (iznad timing bara)
  const tableY = canvasH * 0.42;

  // Koliko vreca istovremeno leži na stolu (vidljive odjednom)
  // Za multi_bag_2: 2, multi_bag_3: 3, sve ostalo: 1 (sekvencijalno)
  let simultaneous = 1;
  if ((speciality === 'multi_bag_2' || speciality === 'all_combined') && multiCount) simultaneous = 2;
  if (speciality === 'multi_bag_3' && multiCount) simultaneous = 3;

  if (simultaneous > 1) {
    // Multi-bag layout: vreće side-by-side, ponoviti u grupama
    const groupSize = simultaneous;
    const groups    = Math.ceil(bagCount / groupSize);

    for (let g = 0; g < groups; g++) {
      const inGroup = Math.min(groupSize, bagCount - g * groupSize);
      for (let i = 0; i < inGroup; i++) {
        // Horizontalni razmak između vreća
        const totalW  = inGroup * CONFIG.BAG.width + (inGroup - 1) * 16;
        const startX  = (canvasW - totalW) / 2 + CONFIG.BAG.width / 2 + i * (CONFIG.BAG.width + 16);
        const bag     = new Bag(startX, tableY, levelConfig);
        bag.groupIndex = g;
        bag.posInGroup = i;
        bags.push(bag);
      }
    }
  } else {
    // Sekvencijalni layout: jedna vreća u centru, menja se
    for (let i = 0; i < bagCount; i++) {
      const bag = new Bag(canvasW / 2, tableY, levelConfig);
      bags.push(bag);
    }
  }

  // Prva vreća postaje aktivna
  if (bags.length > 0) bags[0].status = 'active';

  return bags;
}
