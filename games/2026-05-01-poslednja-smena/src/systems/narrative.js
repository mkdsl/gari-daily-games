/**
 * narrative.js — logika navigacije kroz narativ
 *
 * Exports:
 *   getScene(index)          → scena | null
 *   applyChoice(state, idx)  → novi state (imutabilan)
 *   determineEnding(stats)   → 'A'|'B'|'C'|'D'|'E'
 *   getEpilog(endingId)      → epilog objekat
 *   isGameOver(state)        → boolean
 */

import { CONFIG } from '../config.js';
import { SCENES, EPILOGS } from '../levels/scenes.js';
import { clamp } from '../state.js';

const { STAT_MIN, STAT_MAX, STAT_START, HIDDEN_THRESHOLD } = CONFIG;

// ─── Granice za određivanje kraja ────────────────────────────────────────────
const LOW  = STAT_START - HIDDEN_THRESHOLD;  // 35
const HIGH = STAT_START + HIDDEN_THRESHOLD;  // 65

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Vraća scenu na datom indeksu, ili null ako indeks ne postoji.
 *
 * @param {number} index
 * @returns {Object|null}
 */
export function getScene(index) {
  return SCENES[index] ?? null;
}

/**
 * Primenjuje odabir na state i vraća NOVI state objekat (ne mutira original).
 *
 * @param {Object} state  — trenutni game state
 * @param {number} choiceIndex  — indeks izabrane opcije u sceni
 * @returns {Object} novi state
 */
export function applyChoice(state, choiceIndex) {
  const scene = SCENES[state.currentSceneIndex];
  if (!scene) return state;

  const option = scene.options[choiceIndex];
  if (!option) return state;

  // Primeni efekte na stats (imutabilno)
  const newStats = { ...state.stats };
  for (const [stat, delta] of Object.entries(option.effects)) {
    if (stat in newStats) {
      newStats[stat] = clamp(newStats[stat] + delta, STAT_MIN, STAT_MAX);
    }
  }

  // Dodaj u history
  const newHistory = [
    ...state.history,
    { sceneId: scene.id, choiceIndex },
  ];

  return {
    ...state,
    stats: newStats,
    history: newHistory,
    currentSceneIndex: state.currentSceneIndex + 1,
  };
}

/**
 * Određuje ID kraja na osnovu finalnih stats vrednosti.
 *
 * Prioritet:
 *   E — svi stati između LOW i HIGH (neutralni kraj, skrivena istina)
 *   A — ponos ≥ HIGH AND gorčina ≤ LOW
 *   B — solidarnost ≥ HIGH
 *   C — umor ≥ HIGH
 *   D — fallback (gorčina dominira ili nijedno od gore)
 *
 * @param {{ ponos: number, gorčina: number, umor: number, solidarnost: number }} stats
 * @returns {'A'|'B'|'C'|'D'|'E'}
 */
export function determineEnding(stats) {
  const { ponos, gorčina, umor, solidarnost } = stats;

  const allNeutral =
    ponos        >= LOW && ponos        <= HIGH &&
    gorčina      >= LOW && gorčina      <= HIGH &&
    umor         >= LOW && umor         <= HIGH &&
    solidarnost  >= LOW && solidarnost  <= HIGH;

  if (allNeutral)            return 'E';
  if (ponos >= HIGH && gorčina <= 40) return 'A';
  if (solidarnost >= HIGH)   return 'B';
  if (umor >= HIGH)          return 'C';
  return 'D';
}

/**
 * Vraća epilog objekat za dati ID kraja.
 *
 * @param {'A'|'B'|'C'|'D'|'E'} endingId
 * @returns {Object|undefined}
 */
export function getEpilog(endingId) {
  return EPILOGS[endingId];
}

/**
 * Vraća true kad je igrač prošao sve scene.
 *
 * @param {Object} state
 * @returns {boolean}
 */
export function isGameOver(state) {
  return state.currentSceneIndex >= SCENES.length;
}
