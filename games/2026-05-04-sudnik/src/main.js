// src/main.js — Flow controller i phase manager
// Ovo je DOM-based igra; nema Canvas game loop-a.
// main.js orchestrira fazne prelaze i vezuje sve module zajedno.

import { CONFIG } from './config.js';
import { createState, loadState, saveState, resetState } from './state.js';
import { generateCase } from './cases.js';
import { drawCards, discardAndDraw, discardHand } from './deck.js';
import { applyPrecedentEffectsOnCaseOpen, generatePrecedent, tickPrecedents, getEffectiveCardValue } from './precedents.js';
import { applyVerdictReputation, checkGameOver, getGameOverMessage } from './reputation.js';
import { selectProfileTemplate, buildShareText } from './profile.js';
import {
  renderPhase,
  renderResources,
  renderBalance,
  renderCase,
  renderHand,
  renderPrecedents,
  renderGameOver,
  renderSummary,
  renderDiscardButton,
  renderProgress,
  renderVerdictAnimation,
  renderPlayedZones,
  renderReputation,
  bindVerdictButtons,
  bindDiscardButton,
  bindRestartButton,
  bindShareButton
} from './ui.js';

// ─── Global state ────────────────────────────────────────────────────────────

/** @type {Object} Global game state — single source of truth */
let state;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/**
 * Bootstrap: učitaj ili kreiraj novi state, pa pokreni prvu fazu.
 * Poziva se na DOMContentLoaded.
 */
export function init() {
  state = loadState() ?? createState();
  // Ako smo u sredini igre — nastavi od trenutne faze
  const phase = state.session.phase;
  if (phase === 'play' || phase === 'draw') {
    // Bezbedno — vrati se na draw da re-generišemo ruku
    state.session.phase = 'draw';
    transitionTo('draw');
  } else {
    transitionTo('draw');
  }
}

// ─── State Machine ────────────────────────────────────────────────────────────

/**
 * Centralni state machine — prelaz između faza.
 * @param {'draw'|'play'|'verdict'|'reputation'|'gameover'|'summary'} phase
 */
export function transitionTo(phase) {
  state.session.phase = phase;

  switch (phase) {
    case 'draw':       phaseDrawHandler();       break;
    case 'play':       phasePlayHandler();       break;
    case 'verdict':    phaseVerdictHandler();    break;
    case 'reputation': phaseReputationHandler(); break;
    case 'gameover':   phaseGameoverHandler();   break;
    case 'summary':    phaseSummaryHandler();    break;
    default:
      console.warn(`[main] Nepoznata faza: ${phase}`);
  }
}

// ─── Phase handlers ───────────────────────────────────────────────────────────

/**
 * Faza 'draw': generisanje novog slučaja, vuča karata, primena presedanata.
 * Poziva se na početku svakog slučaja.
 */
function phaseDrawHandler() {
  // 1. Generiši novi slučaj
  state.currentCase = generateCase(state);

  // 2. Primeni automatske presedant efekte na balanceScore
  applyPrecedentEffectsOnCaseOpen(state);

  // 3. Vuci karte u ruku
  drawCards(state, CONFIG.HAND_SIZE);

  // 4. Render svih UI elemenata i prikaži draw fazu
  renderPhase('draw');
  renderProgress(state.session.caseIndex, state.session.totalCases);
  renderCase(state.currentCase);
  renderPrecedents(state.precedents);
  renderBalance(state.currentCase.balanceScore);
  renderResources(state.resources);
  renderHand(state.hand, state.precedents, onCardPlay);
  renderDiscardButton(false);
  renderPlayedZones(state.currentCase.playedCards, state.precedents);

  // 5. Kratka pauza da igrač vidi draw fazu, pa pređi u play
  setTimeout(() => transitionTo('play'), 50);
}

/**
 * Faza 'play': igrač igra karte na KRIV ili SLOBODAN zonu.
 * Ostaje u ovoj fazi dok igrač ne pritisne PRESUDI.
 */
function phasePlayHandler() {
  renderPhase('play');
  bindVerdictButtons(onVerdict);
  bindDiscardButton(onDiscard);
}

// ─── Card play callback ───────────────────────────────────────────────────────

/**
 * Callback: igrač je odigrao kartu u zonu.
 * Primenjuje efektivnu vrednost uz aktivne presedant multiplikatore.
 *
 * @param {Object} card — karta iz state.hand
 * @param {'guilty'|'free'} direction
 */
function onCardPlay(card, direction) {
  // Proveri max karata po slučaju
  if (state.currentCase.playedCards.length >= CONFIG.MAX_CARDS_TO_PLAY) return;

  // Skloni kartu iz ruke
  state.hand = state.hand.filter(c => c.id !== card.id);

  // Zapamti direction na karti za renderovanje zona
  const playedCard = { ...card, direction };

  // Dodaj u playedCards
  state.currentCase.playedCards.push(playedCard);

  // Računaj delta uz presedant multiplikatore
  const effectiveValue = getEffectiveCardValue(card, state.precedents);
  const delta = direction === 'guilty' ? +effectiveValue : -effectiveValue;
  state.currentCase.balanceScore += delta;

  // Primeni specijalni efekat kartice c10 (Emocionalni apel → vlast -2)
  if (card.effect === 'vlast_minus2') {
    state.resources.vlast = Math.max(0, state.resources.vlast - 2);
    renderResources(state.resources);
  }

  // Re-render
  renderBalance(state.currentCase.balanceScore);
  renderHand(state.hand, state.precedents, onCardPlay);
  renderPlayedZones(state.currentCase.playedCards, state.precedents);
}

// ─── Discard callback ─────────────────────────────────────────────────────────

/**
 * Callback: igrač koristi "Odbaci i Povuci".
 * Max CONFIG.MAX_CARDS_TO_DISCARD karata.
 *
 * @param {string[]} cardIds — ID-jevi karata za odbacivanje (1 ili 2)
 */
function onDiscard(cardIds) {
  if (!cardIds || cardIds.length === 0) return;
  if (state.currentCase.discardUsed) return;

  // Ograniči na max dozvoljeni broj
  const limitedIds = cardIds.slice(0, CONFIG.MAX_CARDS_TO_DISCARD);

  discardAndDraw(state, limitedIds);

  // Re-render ruke
  renderHand(state.hand, state.precedents, onCardPlay);
  renderDiscardButton(true);
}

// ─── Verdict callback ─────────────────────────────────────────────────────────

/**
 * Callback: igrač pritisne KRIV ili SLOBODAN.
 * @param {'guilty'|'free'} verdict
 */
function onVerdict(verdict) {
  state.currentCase.verdict = verdict;

  // Ažuriraj stats
  _updateStats(verdict);

  // Pređi u verdict animaciju
  transitionTo('verdict');
}

/**
 * Ažurira stats objekat posle presude.
 * @param {'guilty'|'free'} verdict
 */
function _updateStats(verdict) {
  const c = state.currentCase;

  if (verdict === 'guilty') {
    state.stats.totalGuilty++;
    state.stats.guiltyByWealth[c.suspectWealth] = (state.stats.guiltyByWealth[c.suspectWealth] ?? 0) + 1;
    state.stats.guiltyByAge[c.suspectAge]        = (state.stats.guiltyByAge[c.suspectAge] ?? 0) + 1;
    state.stats.guiltyByCrime[c.crimeType]       = (state.stats.guiltyByCrime[c.crimeType] ?? 0) + 1;
    if (c.isRecidivist) state.stats.guiltyRecidivists++;
  } else {
    state.stats.totalFree++;
    if (c.isRecidivist) state.stats.freeRecidivists++;
  }
}

// ─── Verdict phase ────────────────────────────────────────────────────────────

/**
 * Faza 'verdict': kratka animacija presude, pa dalje na reputation.
 */
function phaseVerdictHandler() {
  const verdict = state.currentCase.verdict;

  renderVerdictAnimation(verdict, () => {
    transitionTo('reputation');
  });
}

// ─── Reputation phase ─────────────────────────────────────────────────────────

/**
 * Faza 'reputation': prikazuje reputation UI sa deltama i presedantom.
 * Sva tranziciona logika se izvršava tek na klik "Sledeći slučaj".
 */
function phaseReputationHandler() {
  // 1. Snapshot resursa pre primene promene
  const masaBefore = state.resources.masa;
  const vlastBefore = state.resources.vlast;

  // 2. Primeni promene resursa (masa/vlast)
  applyVerdictReputation(state);

  const masaDelta = state.resources.masa - masaBefore;
  const vlastDelta = state.resources.vlast - vlastBefore;

  // 3. Generiši novu presedant kartu i dodaj u deck/precedents
  generatePrecedent(state);
  const latestPrecedent = state.precedents[state.precedents.length - 1];
  const precedentName = latestPrecedent ? latestPrecedent.name : null;

  // 4. Prikaži reputation UI
  renderPhase('reputation');
  renderReputation(
    state.currentCase.verdict,
    masaDelta,
    vlastDelta,
    precedentName
  );
  renderResources(state.resources);

  // 5. Bind "Sledeći slučaj" dugme — klonuj da ukloniš stare listener-e
  const btnNext = document.getElementById('btn-next-case');
  if (btnNext) {
    const fresh = btnNext.cloneNode(true);
    btnNext.parentNode.replaceChild(fresh, btnNext);
    fresh.addEventListener('click', () => {
      // Ostatak logike izvršava se posle klika
      tickPrecedents(state);
      discardHand(state);
      saveState(state);
      state.session.caseIndex++;

      const gameOverCause = checkGameOver(state.resources);
      if (gameOverCause !== 'none') {
        transitionTo('gameover');
        return;
      }
      if (state.session.caseIndex >= CONFIG.TOTAL_CASES) {
        transitionTo('summary');
        return;
      }
      transitionTo('draw');
    });
  }
}

// ─── Game Over phase ──────────────────────────────────────────────────────────

/**
 * Faza 'gameover': prikaz game-over ekrana.
 */
function phaseGameoverHandler() {
  const cause = checkGameOver(state.resources);
  const message = getGameOverMessage(cause);

  renderPhase('gameover');
  renderGameOver(state, message);
  bindRestartButton(onRestart);
}

// ─── Summary phase ────────────────────────────────────────────────────────────

/**
 * Faza 'summary': prikaz profil sudnika ekrana.
 */
function phaseSummaryHandler() {
  const profile = selectProfileTemplate(state.stats);
  const shareText = buildShareText(state, profile);

  renderPhase('summary');
  renderSummary(state, profile);
  bindRestartButton(onRestart);
  bindShareButton(shareText);
}

// ─── Restart ──────────────────────────────────────────────────────────────────

/**
 * Restart: resetuje state i počinje novu igru.
 */
function onRestart() {
  resetState();
  state = createState();
  transitionTo('draw');
}

// ─── Entry point ──────────────────────────────────────────────────────────────

// Pokreni igru kad se DOM učita
document.addEventListener('DOMContentLoaded', init);
