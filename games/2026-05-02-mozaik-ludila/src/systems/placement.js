/**
 * placement.js — Validacija postavljanja fragmenata i Game Over provjera.
 *
 * Placement model (iz GDD sekcija 1 — Input Flow):
 * - Igrač klikne na fragment → selekcija
 * - Klikne na grid ćeliju → provjeri isValidPlacement → postavi ili shake
 * - Origin ćelija = ćelija ispod vrha kursora (gornji-levi ugao fragmenta)
 * - Fragment zauzima: za svaki [dr, dc] u SHAPES[shapeId].rotations[rotationIndex],
 *   ćelija (originRow + dr, originCol + dc) mora biti:
 *     1. Unutar [0..7] × [0..7]
 *     2. Prazna (null)
 */

import { GRID_ROWS, GRID_COLS } from '../config.js';
import { SHAPES } from '../entities/fragments.js';

/**
 * Provjerava da li je postavljanje fragmenta validno na datoj poziciji.
 *
 * @param {(string|null)[][]} grid — 8×8 grid
 * @param {string} shapeId — ključ u SHAPES
 * @param {number} rotationIndex — indeks rotacije
 * @param {number} originRow — red gornjeg-levog ugla fragmenta
 * @param {number} originCol — kolona gornjeg-levog ugla fragmenta
 * @returns {boolean} true ako je postavljanje validno
 */
export function isValidPlacement(grid, shapeId, rotationIndex, originRow, originCol) {
  const shape = SHAPES[shapeId];
  if (!shape) return false;
  const cells = shape.rotations[rotationIndex];
  if (!cells) return false;

  for (const [dr, dc] of cells) {
    const r = originRow + dr;
    const c = originCol + dc;
    // Provjera granica
    if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return false;
    // Provjera zauzetosti
    if (grid[r][c] !== null) return false;
  }
  return true;
}

/**
 * Postavlja fragment na grid (muta grid in-place).
 * Pretpostavlja da je pozicija već validirana sa isValidPlacement.
 *
 * @param {(string|null)[][]} grid
 * @param {string} shapeId
 * @param {number} rotationIndex
 * @param {number} originRow
 * @param {number} originCol
 * @param {string} color — hex boja fragmenta
 * @returns {number} broj postavljenih pločica (za placement bonus)
 */
export function placeFragment(grid, shapeId, rotationIndex, originRow, originCol, color) {
  const cells = SHAPES[shapeId].rotations[rotationIndex];
  for (const [dr, dc] of cells) {
    grid[originRow + dr][originCol + dc] = color;
  }
  return cells.length;
}

/**
 * Provjerava da li je Game Over — da li aktivan fragment (u bilo kojoj rotaciji)
 * može stati negde na gridu.
 *
 * Algoritam (iz GDD sekcija 1 — Game Over):
 *   Za svaku rotaciju aktivnog fragmenta:
 *     Za svaki (row, col) na gridu (0..7, 0..7):
 *       Ako su svi (row + dr, col + dc) unutar granica i prazni → NIJE game over
 *   Ako ništa nije pronađeno → GAME OVER
 *
 * Kompleksnost: O(rotations × 64 × cells) ≈ max 4 × 64 × 4 = 1024 — trivijalno.
 *
 * @param {(string|null)[][]} grid
 * @param {{ shapeId: string, rotationIndex: number, color: string }|null} activeFragment
 * @returns {boolean} true ako je Game Over (nema validne pozicije)
 */
export function checkGameOver(grid, activeFragment) {
  if (!activeFragment) return false;

  const shape = SHAPES[activeFragment.shapeId];
  if (!shape) return false;

  for (const rotationCells of shape.rotations) {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        let fits = true;
        for (const [dr, dc] of rotationCells) {
          const r = row + dr;
          const c = col + dc;
          if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS || grid[r][c] !== null) {
            fits = false;
            break;
          }
        }
        if (fits) return false; // postoji validna pozicija
      }
    }
  }

  return true; // nema nijedne validne pozicije
}

/**
 * Dobija ćelije koje bi fragment zauzeo na datoj poziciji (bez validacije).
 * Korisno za render ghost preview-a.
 *
 * @param {string} shapeId
 * @param {number} rotationIndex
 * @param {number} originRow
 * @param {number} originCol
 * @returns {{ row: number, col: number }[]}
 */
export function getFragmentCells(shapeId, rotationIndex, originRow, originCol) {
  const shape = SHAPES[shapeId];
  if (!shape) return [];
  const cells = shape.rotations[rotationIndex] ?? [];
  return cells.map(([dr, dc]) => ({ row: originRow + dr, col: originCol + dc }));
}
