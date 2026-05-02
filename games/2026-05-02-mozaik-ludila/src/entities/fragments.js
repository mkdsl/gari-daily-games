/**
 * fragments.js — Definicije oblika fragmenata pločica (SHAPES), factory funkcije.
 *
 * SHAPES format: svaki oblik ima `rotations` array.
 * Svaka rotacija je array [row, col] offseta od gornjeg-levog ugla bounding boxa.
 * Origin ćelija (0,0) je uvek gornji-levi ugao fragmenta.
 *
 * Oblici koji su simetrični (Single, O) imaju 1 rotaciju.
 * Oblici sa 180°=0° simetrijom (I2, I3, I4, S, Z) imaju 2 rotacije.
 * Asimetrični oblici (L, J, T) imaju 4 rotacije.
 */

import { TILE_COLORS, FRAGMENT_QUEUE_SIZE, PHASE_POOLS } from '../config.js';

/**
 * Sve prekalkulisane rotacije za svih 10 oblika.
 * Format: SHAPES[shapeId].rotations[rotationIndex] = [[row,col], ...]
 * @type {Object.<string, {rotations: number[][][]}> }
 */
export const SHAPES = {
  /** Jedna pločica — 1 rotacija */
  Single: {
    rotations: [
      [[0, 0]],
    ],
  },

  /** Horizontalna ili vertikalna dvojka — 2 rotacije */
  I2: {
    rotations: [
      [[0, 0], [0, 1]],          // 0° horizontalno
      [[0, 0], [1, 0]],          // 90° vertikalno
    ],
  },

  /** Trojka — 2 rotacije */
  I3: {
    rotations: [
      [[0, 0], [0, 1], [0, 2]],  // 0° horizontalno
      [[0, 0], [1, 0], [2, 0]],  // 90° vertikalno
    ],
  },

  /** Četvorka — 2 rotacije */
  I4: {
    rotations: [
      [[0, 0], [0, 1], [0, 2], [0, 3]],  // 0° horizontalno
      [[0, 0], [1, 0], [2, 0], [3, 0]],  // 90° vertikalno
    ],
  },

  /**
   * L oblik — 4 rotacije
   * 0°:  X        90°: X X X    180°: X X     270°:     X
   *      X              X                X            X X X
   *      X X
   */
  L: {
    rotations: [
      [[0, 0], [1, 0], [2, 0], [2, 1]],  // 0°
      [[0, 0], [0, 1], [0, 2], [1, 0]],  // 90°
      [[0, 0], [0, 1], [1, 1], [2, 1]],  // 180°
      [[0, 2], [1, 0], [1, 1], [1, 2]],  // 270°
    ],
  },

  /**
   * J oblik (zrcalna slika L) — 4 rotacije
   * 0°:   X       90°: X            180°: X X    270°: X X X
   *       X            X X X               X                X
   *     X X
   */
  J: {
    rotations: [
      [[0, 1], [1, 1], [2, 0], [2, 1]],  // 0°
      [[0, 0], [1, 0], [1, 1], [1, 2]],  // 90°
      [[0, 0], [0, 1], [1, 0], [2, 0]],  // 180°
      [[0, 0], [0, 1], [0, 2], [1, 2]],  // 270°
    ],
  },

  /**
   * T oblik — 4 rotacije
   * 0°: X X X    90°: X      180°:   X     270°:   X
   *       X           X X          X X X          X X
   *                   X                             X
   */
  T: {
    rotations: [
      [[0, 0], [0, 1], [0, 2], [1, 1]],  // 0°
      [[0, 0], [1, 0], [1, 1], [2, 0]],  // 90°
      [[1, 0], [1, 1], [1, 2], [0, 1]],  // 180°
      [[0, 1], [1, 0], [1, 1], [2, 1]],  // 270°
    ],
  },

  /**
   * S oblik — 2 rotacije
   * 0°:   X X    90°: X
   *     X X           X X
   *                     X
   */
  S: {
    rotations: [
      [[0, 1], [0, 2], [1, 0], [1, 1]],  // 0°
      [[0, 0], [1, 0], [1, 1], [2, 1]],  // 90°
    ],
  },

  /**
   * Z oblik — 2 rotacije
   * 0°: X X      90°:   X
   *       X X         X X
   *                   X
   */
  Z: {
    rotations: [
      [[0, 0], [0, 1], [1, 1], [1, 2]],  // 0°
      [[0, 1], [1, 0], [1, 1], [2, 0]],  // 90°
    ],
  },

  /**
   * O oblik (2×2 kvadrat) — 1 rotacija (simetričan)
   * X X
   * X X
   */
  O: {
    rotations: [
      [[0, 0], [0, 1], [1, 0], [1, 1]],
    ],
  },
};

/**
 * Bira nasumičan shapeId na osnovu score faze (weighted random).
 * @param {number} score — trenutni score igrača
 * @returns {string} shapeId
 */
export function pickRandomShape(score) {
  // Pronađi odgovarajuću fazu
  const phase = PHASE_POOLS.find(p => score >= p.scoreMin && score <= p.scoreMax)
    ?? PHASE_POOLS[PHASE_POOLS.length - 1];

  const pool = phase.pool;
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let r = Math.random() * totalWeight;
  for (const entry of pool) {
    r -= entry.weight;
    if (r <= 0) return entry.id;
  }
  // Fallback (float rounding)
  return pool[pool.length - 1].id;
}

/**
 * Bira nasumičnu boju iz TILE_COLORS.
 * @param {string[]} [colors] — opcioni override array boja; defaultuje na TILE_COLORS
 * @returns {string} hex boja
 */
export function pickRandomColor(colors) {
  const palette = colors ?? TILE_COLORS;
  return palette[Math.floor(Math.random() * palette.length)];
}

/**
 * Kreira novi fragment sa slučajnom početnom rotacijom.
 * @param {string} shapeId — ključ u SHAPES
 * @param {string} color — hex boja
 * @returns {{ shapeId: string, rotationIndex: number, color: string }}
 */
export function createFragment(shapeId, color) {
  const shape = SHAPES[shapeId];
  if (!shape) throw new Error(`Unknown shapeId: ${shapeId}`);
  const rotationIndex = Math.floor(Math.random() * shape.rotations.length);
  return { shapeId, rotationIndex, color };
}

/**
 * Inicijalizuje fragment queue sa `count` novih fragmenata.
 * Score se koristi za odabir oblika po fazi (defaultuje na 0 za početak igre).
 * @param {number} count — koliko fragmenata kreirati (obično FRAGMENT_QUEUE_SIZE = 3)
 * @param {number} [score=0]
 * @returns {Array<{ shapeId: string, rotationIndex: number, color: string }>}
 */
export function initFragmentQueue(count, score) {
  const currentScore = score ?? 0;
  const queue = [];
  for (let i = 0; i < count; i++) {
    const shapeId = pickRandomShape(currentScore);
    const color = pickRandomColor();
    queue.push(createFragment(shapeId, color));
  }
  return queue;
}

/**
 * Generiše jedan novi fragment i dodaje ga na kraj queue.
 * @param {Array} queue — referenca na fragmentQueue iz state-a (muta ga direktno)
 * @param {number} score — za odabir faze
 */
export function enqueueNewFragment(queue, score) {
  const shapeId = pickRandomShape(score ?? 0);
  const color = pickRandomColor();
  queue.push(createFragment(shapeId, color));
}
