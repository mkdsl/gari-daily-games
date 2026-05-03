/**
 * @file systems/mutations.js
 * Fermenter — Varenički Bunt
 * Mutacije — pool, random odabir i primjena na state.
 */

import { CONFIG } from '../config.js';
import { computeDerivedStats } from '../state.js';

/**
 * Re-export mutacija iz CONFIG-a za udoban pristup ostalim modulima.
 * @type {Array<{id:string,name:string,badge:string,description:string,effectType:string}>}
 */
export const MUTATIONS = CONFIG.MUTATIONS;

/**
 * Vrati do 3 random mutacije koje igrač još nema.
 * Koristi Fisher-Yates shuffle za nepristrasnu selekciju.
 * @param {GameState} state
 * @returns {Array<{id:string,name:string,badge:string,description:string,effectType:string}>}
 */
export function getRandomMutationOptions(state) {
  // Filtriraj mutacije koje igrač već ima
  const available = CONFIG.MUTATIONS.filter(
    m => !state.activeMutations.includes(m.id)
  );

  // Fisher-Yates shuffle in-place na kopiji
  const pool = available.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  // Vrati prvih 3 (ili manje ako je pool manji)
  return pool.slice(0, 3);
}

/**
 * Primijeni mutaciju na state.
 * Svaka mutacija se dodaje u activeMutations lista (bez duplikata).
 * Neke mutacije inicijalizuju dodatni state u mutationState.
 * @param {GameState} state — mutira se in-place
 * @param {string} mutationId
 */
export function applyMutation(state, mutationId) {
  // Ne dodavaj duplikate
  if (state.activeMutations.includes(mutationId)) return;

  state.activeMutations.push(mutationId);

  // Mutacija-specifična inicijalizacija
  switch (mutationId) {
    case 'M1':
      // Termofilni Kvasac — inicijalizuj stack na 1 (bez busta)
      state.mutationState.thermoClickStack = 1;
      state.mutationState.thermoLastClickTime = 0;
      state.mutationState.thermoActiveSeconds = 0;
      break;

    case 'M4':
      // Micelarna Mreža — head start teče odmah posle prvog prestiže
      // doPrestige() ga postavlja na HEAD_START_DURATION posle reseta,
      // ali ovde inicijalizujemo i ako se primijeni prvi put
      state.mutationState.headStartRemaining = CONFIG.HEAD_START_DURATION;
      break;

    default:
      // Ostale mutacije (M2, M3, M5, M6, M7, M8) nemaju poseban init state —
      // njihov efekat se primjenjuje pasivno u fermentation.js / computeDerivedStats
      break;
  }

  // Rekalkuliši izvedene statistike (M8 sinerija, M1 clickPower, M7 noDegrade...)
  computeDerivedStats(state);
}
