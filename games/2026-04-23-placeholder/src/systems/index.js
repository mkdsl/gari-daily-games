// src/systems/index.js — Wire svih sistema, poziva se svaki frame iz main.js

import { tickWorkers } from './workers.js';
import { tickStorm } from './storm.js';
import { applyRoomEffects } from './rooms.js';
import { tickParticles } from './particles.js';
import { checkMetaWin } from './prestige.js';
import { handleGridInput } from './grid.js';

/**
 * Centralni update — poziva sve sisteme u ispravnom redosledu.
 * @param {import('../state.js').GameState} state
 * @param {ReturnType<import('../input.js').readInput>} input
 * @param {number} dt - delta time u sekundama
 */
export function updateSystems(state, input, dt) {
  if (state.paused || state.gameOver) return;

  // Jova: odkomentuj redom kako implementiraš sisteme
  // applyRoomEffects(state);
  // tickWorkers(state, dt);
  // tickStorm(state, dt);
  // tickParticles(state, dt);
  // handleGridInput(state, input);
  // if (checkMetaWin(state)) { state.metaWin = true; }
}
