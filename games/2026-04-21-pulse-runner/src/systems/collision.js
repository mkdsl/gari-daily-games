/**
 * systems/collision.js — Kretanje igrača i collision detekcija.
 *
 * Odgovornosti:
 * - tryMove(state, dir): pokušava da pomeri igrača u zadatom smeru
 *   — Provera granica grida (ne van grida)
 *   — Provera zida (ne ulazi u 'wall' ćeliju)
 *   — Ako je slobodno: pomeri playerPos
 *   — Ako nova ćelija je 'collectible': pickup (+1 HP, resetMissCount, markira ćeliju 'empty')
 *   — Ako nova ćelija je 'exit': triggeruje level transition
 * - Vraća tip rezultata: 'moved' | 'wall' | 'out_of_bounds' | 'collectible' | 'exit'
 *
 * Poziva se iz pulse.js na puls eventu (ne svaki frame).
 */

import { CONFIG } from '../config.js';
import { resetMissCounter } from './pulse.js';
import { playCollectible } from '../audio.js';

/**
 * @typedef {'moved' | 'wall' | 'out_of_bounds' | 'collectible' | 'exit'} MoveResult
 * @typedef {import('../state.js').GameState} GameState
 * @typedef {import('../input.js').Direction} Direction
 */

/**
 * Pokušava da pomeri igrača u zadatom smeru.
 * Poziva se iz pulse.js na svakom pulsu gde postoji queued input.
 *
 * @param {GameState} state
 * @param {Direction} dir - Smer: { row: -1|0|1, col: -1|0|1 }
 * @param {{ nextLevel: function(GameState): void }} callbacks
 * @returns {MoveResult}
 */
export function tryMove(state, dir, callbacks) {
  // TODO: implementiraj
  const newRow = state.playerPos.row + dir.row;
  const newCol = state.playerPos.col + dir.col;

  // 1. Provera granica grida
  // if (newRow < 0 || newRow >= state.gridSize || newCol < 0 || newCol >= state.gridSize) {
  //   return 'out_of_bounds';
  // }

  // 2. Provera zida
  // const cell = state.grid[newRow][newCol];
  // if (cell.type === 'wall') return 'wall';

  // 3. Pomeri igrača
  // state.playerPos = { row: newRow, col: newCol };

  // 4. Provjeri tip ćelije na novoj poziciji
  // if (cell.type === 'collectible') {
  //   return _onCollectible(state, newRow, newCol);
  // }
  // if (cell.type === 'exit') {
  //   return _onExit(state, callbacks);
  // }

  return 'moved';
}

/**
 * Obrađuje collectible pickup.
 * +1 HP (do max), reset miss counter, označi ćeliju kao 'empty'.
 *
 * @param {GameState} state
 * @param {number} row
 * @param {number} col
 * @returns {'collectible'}
 */
function _onCollectible(state, row, col) {
  // TODO: implementiraj
  // state.grid[row][col] = { type: 'empty' };
  // state.hp = Math.min(state.hp + CONFIG.HP_PER_COLLECTIBLE, CONFIG.HP_MAX);
  // state.totalCollected++;
  // resetMissCounter(state); // miss counter resetuje se na pickup
  // playCollectible();
  return 'collectible';
}

/**
 * Obrađuje exit — pokreće level transition.
 * Poziva callbacks.nextLevel(state) koji generiše sledeći nivo.
 *
 * @param {GameState} state
 * @param {{ nextLevel: function(GameState): void }} callbacks
 * @returns {'exit'}
 */
function _onExit(state, callbacks) {
  // TODO: implementiraj
  // callbacks.nextLevel(state);
  return 'exit';
}

/**
 * Proverava da li je pozicija validna (unutar grida i nije zid).
 * Pomoćna funkcija za BFS i AI.
 *
 * @param {GameState} state
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
export function isPassable(state, row, col) {
  // TODO: implementiraj
  // if (row < 0 || row >= state.gridSize || col < 0 || col >= state.gridSize) return false;
  // return state.grid[row][col].type !== 'wall';
  return false;
}
