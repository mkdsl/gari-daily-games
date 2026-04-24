/**
 * main.js — Entry point za Kartaški Front.
 *
 * Inicijalizuje igru, wire-uje sve module i upravlja state-machine tranzicijama.
 * Igra je turn-based i UI-driven — nema rAF game loop.
 * Svaka akcija (klik karte, kraj runde, reward pick...) direktno muta state
 * i zatim refreshuje prikaz.
 *
 * Faze (CONFIG.PHASES):
 *   MAP         → igrač bira čvor (prikazan overlay)
 *   PLAYER_TURN → igrač igra karte
 *   RESOLVING   → kratkotrajno (endPlayerTurn → odmah ENEMY_TURN)
 *   ENEMY_TURN  → neprijatelj izvršava intent
 *   REWARD      → igrač bira novu kartu
 *   GAME_OVER   → overlay, restart dugme
 *   VICTORY     → overlay, restart dugme
 */

import { CONFIG }        from './config.js';
import { createState, loadState, saveState, resetState } from './state.js';
import { initInput }     from './input.js';
import { initCanvas, render } from './render.js';
import {
  renderHand, updateToolbar,
  showMapScreen, showRewardScreen,
  showGameOver, showVictory,
  hideOverlay,
} from './ui.js';
import { applyCard, endPlayerTurn, applyEnemyIntent, applyEnemyEndOfTurn, checkCombatEnd } from './systems/combat.js';
import { drawHand, discardHand, addCardToDeck } from './systems/deck.js';
import { startBattle, getRewardCards } from './systems/progression.js';

// ── Inicijalizacija ─────────────────────────────────────────────────────────

const battlefieldEl = /** @type {HTMLCanvasElement} */ (document.getElementById('battlefield'));
const { ctx } = initCanvas(battlefieldEl);

/** @type {import('./state.js').GameState} */
let state = loadState() ?? createState();

// Ako učitani state je bio usred borbe, prikaži ga korektno; inače kreni od mape
if (state.phase === CONFIG.PHASES.PLAYER_TURN || state.phase === CONFIG.PHASES.ENEMY_TURN) {
  state.phase = CONFIG.PHASES.PLAYER_TURN;
  if (state.hand.length === 0) drawHand(state);
}

// Input init — wire-uje click delegation za karte, overlay i dugmad
initInput({
  onCardClick:    handleCardClick,
  onEndTurn:      handleEndTurn,
  onOverlayClick: handleOverlayClick,
});

// Inicijalni prikaz
_refresh();

// ── Refresh — sinhronizuj prikaz sa state-om ────────────────────────────────

function _refresh() {
  render(ctx, state);
  updateToolbar(state);
  renderHand(state); // karte se uvek re-renderuju; input delegation hvata kliks

  const { PHASES } = CONFIG;
  switch (state.phase) {
    case PHASES.MAP:       showMapScreen(state);    break;
    case PHASES.REWARD:    showRewardScreen(state.rewardOptions ?? []); break;
    case PHASES.GAME_OVER: showGameOver(state);     break;
    case PHASES.VICTORY:   showVictory(state);      break;
    default:               hideOverlay();           break;
  }

  saveState(state);
}

// ── Handleri ─────────────────────────────────────────────────────────────────

/**
 * Klik na kartu u ruci.
 * input.js poziva: handleCardClick(cardEl, cardIndex)
 * @param {HTMLElement} _cardEl — DOM element (ignorišemo, koristimo index)
 * @param {number} cardIndex    — indeks u state.hand
 */
function handleCardClick(_cardEl, cardIndex) {
  if (state.phase !== CONFIG.PHASES.PLAYER_TURN) return;

  const card = state.hand[cardIndex];
  if (!card) return;
  if (state.player.energy < card.cost) return; // nema energije

  // Ukloni kartu iz ruke, baci u discard
  state.hand.splice(cardIndex, 1);
  state.discard.push(card);

  // Primeni karticu na state
  applyCard(state, card);

  // Provjeri kraj borbe odmah (napad mogao ubiti neprijatelja)
  const combatResult = checkCombatEnd(state);
  if (combatResult) {
    _handleCombatEnd(combatResult);
    return;
  }

  _refresh();
}

/**
 * Klik "Kraj runde" — igrač završava svoju rundu.
 */
function handleEndTurn() {
  if (state.phase !== CONFIG.PHASES.PLAYER_TURN) return;

  // Statistika
  state.stats.roundsPlayed++;

  // Odbaci ruku u discard
  discardHand(state);

  // Primeni end-of-player-turn efekte, postavi fazu na RESOLVING
  endPlayerTurn(state);

  // RESOLVING je momentalno — odmah prelazi u ENEMY_TURN
  state.phase = CONFIG.PHASES.ENEMY_TURN;
  _refresh(); // kratki vizuelni refresh pre enemy akcije

  // Neprijatelj odmah izvršava intent
  _doEnemyTurn();
}

/**
 * Neprijatelj izvršava intent i vraća igru na PLAYER_TURN.
 */
function _doEnemyTurn() {
  applyEnemyIntent(state);
  applyEnemyEndOfTurn(state); // reset enemy shield, tick enemy effects

  // Provjeri kraj borbe (burn/poison mogao ubiti u enemy turn-u)
  const combatResult = checkCombatEnd(state);
  if (combatResult) {
    _handleCombatEnd(combatResult);
    return;
  }

  // Obnovi energiju igrača i vrati fazu
  state.player.energy = CONFIG.PLAYER_ENERGY_PER_TURN;
  state.phase = CONFIG.PHASES.PLAYER_TURN;

  // Vuci novu ruku za igrača
  drawHand(state);

  _refresh();
}

/**
 * Kraj borbe — player dead ili enemy dead.
 * @param {'player_dead' | 'enemy_dead'} result
 */
function _handleCombatEnd(result) {
  if (result === 'player_dead') {
    state.phase = CONFIG.PHASES.GAME_OVER;
    state.player.hp = 0;
    _refresh();
    return;
  }

  // enemy_dead — pobeda na čvoru
  if (state.node >= CONFIG.TOTAL_NODES - 1) {
    // Pobedili smo sve 4 borbe (node je 0-indexed, poslednji je TOTAL_NODES-1)
    state.node = CONFIG.TOTAL_NODES; // označi kao završen
    state.phase = CONFIG.PHASES.VICTORY;
    _refresh();
    return;
  }

  // Ima još čvorova — pripremi reward
  state.rewardOptions = getRewardCards(state);
  state.phase = CONFIG.PHASES.REWARD;
  _refresh();
}

// ── Overlay click dispatcher ─────────────────────────────────────────────────

/**
 * Svi klikovi unutar #overlay (map-node, reward-pick, restart).
 * data-action na dugmetu/kartici određuje akciju.
 * @param {Event} e
 */
function handleOverlayClick(e) {
  const target = /** @type {HTMLElement} */ (
    (e.target instanceof Element) ? e.target.closest('[data-action]') : null
  );
  if (!target) return;

  const action = target.dataset.action;

  switch (action) {

    case 'map-node': {
      if (state.phase !== CONFIG.PHASES.MAP) return;
      const nodeNum = parseInt(target.dataset.node ?? '1', 10);
      // Linearni map — samo aktivan čvor (state.node + 1) je klikabilan
      if (nodeNum !== state.node + 1) return;

      // state.node je "poslednji završen" — postavi na indeks sledećeg (0-based)
      state.node = nodeNum - 1;
      startBattle(state);
      state.phase = CONFIG.PHASES.PLAYER_TURN;
      drawHand(state);
      _refresh();
      break;
    }

    case 'reward-pick': {
      if (state.phase !== CONFIG.PHASES.REWARD) return;
      const cardId = target.dataset.id;
      const card   = state.rewardOptions.find(c => c.id === cardId);
      if (!card) return;

      addCardToDeck(state, card);
      state.rewardOptions = [];
      state.node++; // pomeri na sledeći čvor

      if (state.node >= CONFIG.TOTAL_NODES) {
        state.phase = CONFIG.PHASES.VICTORY;
        _refresh();
        return;
      }

      startBattle(state);
      state.phase = CONFIG.PHASES.MAP;
      _refresh();
      break;
    }

    case 'restart': {
      resetState();
      state = createState();
      initInput({
        onCardClick:    handleCardClick,
        onEndTurn:      handleEndTurn,
        onOverlayClick: handleOverlayClick,
      });
      _refresh();
      break;
    }
  }
}
