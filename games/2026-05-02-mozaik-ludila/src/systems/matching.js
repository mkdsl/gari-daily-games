/**
 * matching.js — Evaluacija match-ova na gridu posle svakog postavljanja.
 *
 * Logika (pseudokod iz GDD sekcija 1 — Match Evaluacija):
 *
 * evaluateMatches(grid):
 *   matched = new Set()  // ključevi "r,c" — Set garantuje bez duplikata
 *   perfects = { rows: 0, cols: 0, quads: 0 }
 *
 *   // 1. Redovi: provjeri svih 8 redova
 *   for r in 0..7:
 *     color = grid[r][0]
 *     if color != null AND svi grid[r][c] == color for c in 0..7:
 *       for c in 0..7: matched.add(`${r},${c}`)
 *       perfects.rows++
 *
 *   // 2. Kolone: provjeri svih 8 kolona
 *   for c in 0..7:
 *     color = grid[0][c]
 *     if color != null AND svi grid[r][c] == color for r in 0..7:
 *       for r in 0..7: matched.add(`${r},${c}`)
 *       perfects.cols++
 *
 *   // 3. 2×2 kvadranti: top-left = (r,c) gde r in 0..6, c in 0..6
 *   for r in 0..6:
 *     for c in 0..6:
 *       color = grid[r][c]
 *       if color != null
 *         AND grid[r][c+1] == color
 *         AND grid[r+1][c] == color
 *         AND grid[r+1][c+1] == color:
 *           matched.add(`${r},${c}`)
 *           matched.add(`${r},${c+1}`)
 *           matched.add(`${r+1},${c}`)
 *           matched.add(`${r+1},${c+1}`)
 *           perfects.quads++
 *
 *   return { matched, perfects }
 *   // matched je Set stringova "r,c"
 *   // perfects.rows, perfects.cols, perfects.quads su brojači za bonus score
 *
 * NAPOMENA: SET garantuje da se ćelija ne broji dvaput čak i ako je u redu I kvadrantu.
 * Evaluacija je eager (jednom posle postavljanja), nema chain evaluacije.
 *
 * Posle poziva, caller:
 *   1. matched.size == 0 → nema match, combo se resetuje
 *   2. matched.size > 0  → obriši ćelije, izračunaj score, pokreni animaciju
 */

import { GRID_ROWS, GRID_COLS } from '../config.js';

/**
 * Evaluira sve match uslove na gridu (redovi, kolone, 2×2 kvadranti).
 *
 * @param {(string|null)[][]} grid — 8×8 grid; null = prazno, string = hex boja
 * @returns {{ matched: Set<string>, perfects: { rows: number, cols: number, quads: number } }}
 *   matched: Set ključeva "r,c" za sve ćelije koje treba obrisati
 *   perfects: brojač savršenih redova/kolona/kvadranata (za bonus score)
 */
export function evaluateMatches(grid) {
  const matched = new Set(); // ključevi "r,c"
  const perfects = { rows: 0, cols: 0, quads: 0 };

  // Redovi
  for (let r = 0; r < GRID_ROWS; r++) {
    const color = grid[r][0];
    if (color && grid[r].every(c => c === color)) {
      for (let c = 0; c < GRID_COLS; c++) matched.add(`${r},${c}`);
      perfects.rows++;
    }
  }

  // Kolone
  for (let c = 0; c < GRID_COLS; c++) {
    const color = grid[0][c];
    if (color) {
      let allSame = true;
      for (let r = 1; r < GRID_ROWS; r++) {
        if (grid[r][c] !== color) { allSame = false; break; }
      }
      if (allSame) {
        for (let r = 0; r < GRID_ROWS; r++) matched.add(`${r},${c}`);
        perfects.cols++;
      }
    }
  }

  // 2×2 kvadranti: top-left (r,c) gde r ∈ [0..6], c ∈ [0..6]
  for (let r = 0; r < GRID_ROWS - 1; r++) {
    for (let c = 0; c < GRID_COLS - 1; c++) {
      const color = grid[r][c];
      if (color &&
          grid[r][c + 1] === color &&
          grid[r + 1][c] === color &&
          grid[r + 1][c + 1] === color) {
        matched.add(`${r},${c}`);
        matched.add(`${r},${c + 1}`);
        matched.add(`${r + 1},${c}`);
        matched.add(`${r + 1},${c + 1}`);
        perfects.quads++;
      }
    }
  }

  return { matched, perfects };
}

/**
 * Konvertuje Set matched ključeva u array { row, col } objekata.
 * @param {Set<string>} matched
 * @returns {{ row: number, col: number }[]}
 */
export function matchedSetToArray(matched) {
  return Array.from(matched).map(key => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });
}

/**
 * Briše matched ćelije sa grida (postavlja na null).
 * Muta grid in-place.
 * @param {(string|null)[][]} grid
 * @param {Set<string>} matched
 */
export function clearMatchedCells(grid, matched) {
  for (const key of matched) {
    const [r, c] = key.split(',').map(Number);
    grid[r][c] = null;
  }
}
