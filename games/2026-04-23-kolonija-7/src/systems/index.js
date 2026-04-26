// src/systems/index.js — Wire svih sistema, poziva se svaki frame iz main.js

import { CONFIG } from '../config.js';
import { tickWorkers } from './workers.js';
import { tickStorm } from './storm.js';
import { applyRoomEffects } from './rooms.js';
import { buildRoom } from './rooms.js';
import { tickParticles, spawnWorkerParticles, spawnStormDust } from './particles.js';
import { checkMetaWin } from './prestige.js';
import { handleGridInput } from './grid.js';

/** Timer za periodični spawn worker čestica */
let particleTimer = 0;

/**
 * Centralni update — poziva sve sisteme u ispravnom redosledu.
 * @param {import('../state.js').GameState} state
 * @param {ReturnType<import('../input.js').readInput>} input
 * @param {number} dt - delta time u sekundama
 */
export function updateSystems(state, input, dt) {
  if (state.paused || state.gameOver || state.metaWin || state.showPrestigeScreen) return;

  // 1. Primeni efekte soba (recalculate caps, kapaciteti)
  applyRoomEffects(state);

  // 2. Tick radnica (auto-collect resursa, koristi prestige bonuse interno)
  tickWorkers(state, dt);

  // 3. Tick bure (faze: MIRNO → TELEGRAPH → AKTIVNA → SMIRUJE_SE)
  tickStorm(state, dt);

  // 4. Obradi pending room akcije iz UI menija
  if (state._pendingRoom) {
    const { action, type, col, row } = state._pendingRoom;
    state._pendingRoom = null;
    buildRoom(state, type, col, row);
  }

  // 5. Input na gridu (kopanje, otvaranje room menija)
  handleGridInput(state, input);

  // 6. Escape zatvara room meni
  if (input.keys && input.keys.has('escape')) {
    state.showRoomMenu = null;
  }

  // 7. Tick čestica
  tickParticles(state, dt);

  // 8. Periodični spawn worker i storm čestica
  particleTimer += dt;
  if (particleTimer >= 0.5) {
    particleTimer = 0;
    // Koristi stvarne canvas dimenzije ako su dostupne, inače fallback
    const canvas = document.getElementById('game-canvas');
    const cw = canvas ? canvas.width / (window.devicePixelRatio || 1) : 800;
    const ch = canvas ? canvas.height / (window.devicePixelRatio || 1) : 600;

    spawnWorkerParticles(state, cw, ch);
    if (state.storm.intensity > 0) {
      spawnStormDust(state, cw, ch, state.storm.intensity);
    }
  }

  // 9. Proveri meta win
  if (checkMetaWin(state)) {
    state.metaWin = true;
  }
}
