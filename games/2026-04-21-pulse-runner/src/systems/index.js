/**
 * systems/index.js — Agregator svih sistema za Pulse Runner.
 *
 * Ovaj fajl se VIŠE NE KORISTI direktno iz main.js —
 * main.js importuje sisteme direktno (updatePulse, generateMaze, tryMove).
 *
 * Ostaje kao barrel export za slučaj da neki agent želi da importuje
 * više sistema odjednom.
 *
 * Glavni tok igre:
 *   main.js loop → updatePulse(state, dt, callbacks)
 *     → pulse.js: akumulira timer, na pulsu:
 *       → readQueuedDirection() (input.js)
 *       → tryMove(state, dir, callbacks) (collision.js)
 *         → _onCollectible ili _onExit
 *       → ili _onMiss()
 *     → callbacks.nextLevel → generateMaze (maze.js)
 *     → callbacks.endRun → endRun (main.js)
 */

export { generateMaze, bfsSolvable, debugPrintGrid } from './maze.js';
export { updatePulse, resetMissCounter, isInInputWindow } from './pulse.js';
export { tryMove, isPassable } from './collision.js';
