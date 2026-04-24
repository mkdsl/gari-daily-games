/**
 * progression.js — Napredak kroz čvorove, nagrade, skor.
 *
 * Redosled borbi: node 0=Gremlin, 1=Ratnik, 2=Čuvar, 3=Boss (0-indexed).
 * After boss (node 3) — victory.
 *
 * @typedef {import('../config.js').CardDef} CardDef
 * @typedef {import('../config.js').EnemyDef} EnemyDef
 * @typedef {import('../state.js').GameState} GameState
 */

import { CONFIG } from '../config.js';

/**
 * Postavi neprijatelja za trenutni čvor i resetiraj enemy state.
 * Poziva se kad igrač uđe u borbu (MAP → PLAYER_TURN).
 * @param {GameState} state
 */
export function startBattle(state) {
  const enemyId  = CONFIG.NODE_ENEMIES[state.node];
  const enemyDef = CONFIG.ENEMIES[enemyId];

  if (!enemyDef) {
    console.error(`[progression] Nepoznati neprijatelj za node ${state.node}: "${enemyId}"`);
    return;
  }

  state.enemy = {
    id:          enemyDef.id,
    name:        enemyDef.name,
    hp:          enemyDef.hp,
    maxHp:       enemyDef.hp,
    shield:      0,
    effects:     [],
    intentIndex: 0,
    def:         enemyDef,  // ref na originalnu definiciju (za intent pattern)
    color:       enemyDef.color,
  };

  // Energija se vraća na max
  state.player.energy = CONFIG.PLAYER_ENERGY_PER_TURN;
}

/**
 * Prelaz na sledeći čvor i pokretanje sledeće borbe.
 * Inkrementira node i poziva startBattle.
 * Faza se postavlja na MAP (prikazuje se mapa/nagradu), caller bira dalje.
 * @param {GameState} state
 */
export function nextNode(state) {
  state.node++;
  startBattle(state);
  state.phase = CONFIG.PHASES.MAP;
}

/**
 * Vraća 3 random karte iz reward pool-a za node (1-indexed pool).
 * Pool je indeksiran 1-4; node 0 → pool 1, node 3 → pool 4.
 * Ako je pool prazan ili nema dovoljno karata — vraća šta ima.
 * @param {GameState} state
 * @returns {CardDef[]}
 */
export function getRewardCards(state) {
  // Pool je 1-indexed: node 0 daje pool 1, node 1 → pool 2, itd.
  const poolIndex = state.node + 1;
  const poolIds   = CONFIG.REWARD_POOLS[poolIndex];

  if (!poolIds || poolIds.length === 0) return [];

  // Kopija da ne mijenjamo original
  const available = [...poolIds];

  // Fisher-Yates na maloj listi — izvuci max 3
  const count  = Math.min(3, available.length);
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  return available.slice(0, count).map(id => CONFIG.REWARD_CARDS[id]).filter(Boolean);
}

/**
 * Izračunaj score na kraju runa.
 * Formula: player.hp * 10 + totalDamageDealt / 5 + node * 50
 * @param {GameState} state
 * @returns {number}
 */
export function calculateScore(state) {
  const hp     = state.player.hp || 0;
  const damage = state.stats
    ? (state.stats.totalDamageDealt || 0)
    : (state.totalDamageDealt || 0);
  const node   = state.node || 0;

  return Math.floor(hp * 10 + damage / 5 + node * 50);
}

/**
 * Vraća label trenutnog čvora u formatu "X/4".
 * node je 0-indexed, ali prikazujemo 1-indexed.
 * @param {GameState} state
 * @returns {string}
 */
export function getNodeLabel(state) {
  const current = (state.node || 0) + 1;
  return `${current}/${CONFIG.TOTAL_NODES}`;
}
