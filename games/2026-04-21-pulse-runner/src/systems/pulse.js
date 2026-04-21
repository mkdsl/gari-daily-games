/**
 * systems/pulse.js — Puls timer sistem za Pulse Runner.
 *
 * Srce igre — upravlja ritmom otkucaja.
 *
 * Odgovornosti:
 * - Akumulira dt svaki frame (state.pulseTimer += dt)
 * - Na svakom pulsu (pulseTimer >= pulseInterval):
 *   a. Triggeruje puls event (vizuelni flash + audio)
 *   b. Otvara input window (inInputWindow = true, 80% intervala)
 *   c. Ako postoji queuedInput → prosleđuje tryMove() → executa kretanje
 *   d. Ako nema queuedInput (miss) → inkrementuje missCount
 *   e. Ako missCount >= MISS_LIMIT → poziva endRun callback
 *   f. Resetuje pulseTimer
 * - Ažurira input window flag (zatvara ga posle 80% intervala)
 * - Ažurira flash timer-e (pulseFlashTimer, levelFlashTimer)
 * - Ažurira playerPulsePhase (kontinualna oscilacija, neovisna od pulsa)
 *
 * VAŽNO: "Miss" je definisan kao puls koji prođe BEZ ikakvog input-a.
 * Kretanje u zid NIJE miss — igrač je dao input, samo se nije pomerio.
 *
 * @param {import('../state.js').GameState} state
 * @param {Object} callbacks - { nextLevel, endRun } iz main.js
 */

import { CONFIG } from '../config.js';
import { readQueuedDirection } from '../input.js';
import { tryMove } from './collision.js';
import { triggerScreenShake } from '../ui.js';
import { playPulse, playGameOver } from '../audio.js';

/**
 * Ažurira puls sistem za jedan frame.
 * Centralna funkcija — poziva se iz main.js loop-a svaki frame dok je screen='playing'.
 *
 * @param {import('../state.js').GameState} state
 * @param {number} dt - Delta vreme u sekundama
 * @param {{ nextLevel: function, endRun: function }} callbacks
 */
export function updatePulse(state, dt, callbacks) {
  // TODO: implementiraj

  // 1. Ažuriraj playerPulsePhase (kontinualna animacija igrača)
  // state.playerPulsePhase = (state.playerPulsePhase + dt * (2 * Math.PI / CONFIG.PLAYER_PULSE_PERIOD)) % (2 * Math.PI);

  // 2. Ažuriraj flash timer-e
  // if (state.pulseFlashTimer > 0) {
  //   state.pulseFlashTimer = Math.max(0, state.pulseFlashTimer - dt);
  //   if (state.pulseFlashTimer === 0) state.pulseFlash = false;
  // }
  // if (state.levelFlashTimer > 0) {
  //   state.levelFlashTimer = Math.max(0, state.levelFlashTimer - dt);
  //   if (state.levelFlashTimer === 0) state.levelFlash = false;
  // }

  // 3. Akumuliraj pulse timer
  // state.pulseTimer += dt;

  // 4. Ažuriraj input window flag
  // const windowDuration = state.pulseInterval * CONFIG.INPUT_WINDOW_RATIO;
  // if (state.pulseTimer >= windowDuration) state.inInputWindow = false;

  // 5. Puls event
  // if (state.pulseTimer >= state.pulseInterval) {
  //   _onPulse(state, callbacks);
  //   state.pulseTimer -= state.pulseInterval; // ne resetuje na 0, subtracts
  // }
}

/**
 * Obrađuje jedan puls event.
 * Poziva se iz updatePulse kada timer pređe interval.
 *
 * @param {import('../state.js').GameState} state
 * @param {{ nextLevel: function, endRun: function }} callbacks
 */
function _onPulse(state, callbacks) {
  // TODO: implementiraj

  // 1. Vizuelni + audio feedback
  // state.pulseFlash = true;
  // state.pulseFlashTimer = CONFIG.PULSE_FLASH_DURATION;
  // state.inInputWindow = true;
  // playPulse();
  // triggerScreenShake();

  // 2. Čitaj queued input
  // const dir = readQueuedDirection();

  // 3a. Ako ima input: pokušaj kretanje
  // if (dir) {
  //   const result = tryMove(state, dir);
  //   // tryMove vraća: 'moved', 'wall', 'collectible', 'exit'
  //   // 'collectible' i 'exit' se obrađuju u tryMove/collision.js
  //   // 'exit' triggeruje callbacks.nextLevel(state)
  // } else {
  //   // 3b. Miss — prošao puls bez input-a
  //   _onMiss(state, callbacks);
  // }
}

/**
 * Obrađuje miss event — puls je prošao bez input-a.
 *
 * @param {import('../state.js').GameState} state
 * @param {{ endRun: function }} callbacks
 */
function _onMiss(state, callbacks) {
  // TODO: implementiraj
  // state.missCount++;
  // if (state.missCount >= CONFIG.MISS_LIMIT) {
  //   callbacks.endRun(state);
  // }
}

/**
 * Resetuje miss counter — poziva se iz collision.js na collectible pickup
 * ili level transition. Izloženo za testabilnost.
 *
 * @param {import('../state.js').GameState} state
 */
export function resetMissCounter(state) {
  // TODO: implementiraj
  // state.missCount = 0;
}

/**
 * Vraća true ako je trenutno otvoren input window.
 * UI može koristiti ovo za vizuelnu indikaciju (npr. svetlija boja grida).
 *
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function isInInputWindow(state) {
  return state.inInputWindow;
}
