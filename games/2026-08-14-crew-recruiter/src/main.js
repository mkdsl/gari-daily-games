// main.js — Bootstrap, game loop, state machine

import { createInitialState, resetForNewRun } from './state.js';
import { initInput, registerInputCallbacks } from './input.js';
import { initAudio, setCrowdForPhase, sfxDraw, sfxAssign, sfxSynergy, sfxVibeDropLow } from './audio.js';
import { createDeck, drawCards } from './systems/deck.js';
import { resolveRound } from './systems/resolution.js';
import { recordCompletedRun } from './systems/progression.js';
import { PHASES, TOTAL_ROUNDS, VIBE_MIN, CARDS_DRAWN_PER_ROUND } from './config.js';
import { assignCard } from './entities/slot.js';
import { flashChurnIndicator } from './ui/slots.js';
import { render } from './render.js';
import { renderMenu, hideMenu } from './ui/menu.js';
import { showSynergyPairs, clearSynergyDisplay } from './ui/synergy-display.js';
import { showEndingScreen, hideEndingScreen } from './ui/ending-screen.js';
import { maybeShowTutorial } from './ui/tutorial.js';
import {
  renderActionArea,
  showResolveBreakdown,
  hideResolveOverlay,
  showAforizam,
  showToast
} from './ui.js';

// ── Global state ──────────────────────────────────────────────────────────────
let state = createInitialState('klub');

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initInput();
  registerInputCallbacks({
    onCardDrop:  handleCardDrop,
    onConfirm:   handleConfirm,
    onDiscard:   handleDiscard
  });

  renderMenu(state, startGame);
});

// ── Game flow ─────────────────────────────────────────────────────────────────

/**
 * Start a new game run with the selected event type.
 * @param {string} eventType
 */
function startGame(eventType) {
  hideMenu();
  hideEndingScreen();

  resetForNewRun(state, eventType);
  state.deck = createDeck(eventType);

  // Show game screen
  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.remove('hidden');

  // Init audio on first interaction
  try { initAudio(); } catch { /* AudioContext may be blocked */ }

  maybeShowTutorial(state.isFirstRun, () => {
    state.isFirstRun = false;
    enterDrawPhase();
  });
}

/** Restart: go back to menu. */
function restartGame() {
  hideEndingScreen();
  document.getElementById('game-screen')?.classList.add('hidden');
  renderMenu(state, startGame);
}

// ── Phase transitions ─────────────────────────────────────────────────────────

function enterDrawPhase() {
  clearSynergyDisplay();
  hideResolveOverlay();
  state.gamePhase          = 'draw';
  state.churnCountThisRound = 0;

  const phaseName = PHASES[state.phase_index];
  setCrowdForPhase(phaseName);

  renderActionArea('draw', performDraw, () => {});
  render(state);
}

function performDraw() {
  // Clear old hand (unassigned cards go to graveyard)
  state.graveyard.push(...state.hand);
  state.hand = [];

  drawCards(CARDS_DRAWN_PER_ROUND, state);
  sfxDraw();
  state.gamePhase = 'assign';

  render(state);
  renderActionArea('assign', () => {}, performResolve);
}

function enterResolvePhase() {
  performResolve();
}

function performResolve() {
  if (state.gamePhase !== 'assign') return;
  state.gamePhase = 'resolve';

  const phaseName = PHASES[state.phase_index];
  const isRound1  = state.phase_index === 0;
  const result    = resolveRound(state.slots, phaseName, isRound1, state.churnCountThisRound, state.eventType);

  // Apply delta
  state.vibe_score = Math.max(VIBE_MIN, Math.min(100, state.vibe_score + result.roundDelta));

  // SFX
  if (result.synergyBonus >= 3) sfxSynergy();
  if (state.vibe_score <= 30)   sfxVibeDropLow();

  // Render breakdown
  showResolveBreakdown(result);
  render(state, result.roundDelta);

  // Show synergy pairs then maybe aforism
  showSynergyPairs(result.activePairs, () => {
    if (result.synergyBonus >= 4) {
      showAforizam();
      setTimeout(afterResolve, 2000);
    } else {
      setTimeout(afterResolve, 800);
    }
  });
}

function afterResolve() {
  hideResolveOverlay();

  // Crash check
  if (state.vibe_score <= VIBE_MIN) {
    state.crashed = true;
    enterEnding();
    return;
  }

  state.phase_index++;

  if (state.phase_index >= TOTAL_ROUNDS) {
    enterEnding();
  } else {
    // Slots PERSIST between rounds — roster carries over.
    // Only hand cards (unplayed) are discarded (handled in performDraw).
    enterDrawPhase();
  }
}

function enterEnding() {
  recordCompletedRun(state, state.vibe_score);
  clearSynergyDisplay();
  document.getElementById('game-screen')?.classList.add('hidden');
  showEndingScreen(state.vibe_score, state.eventType, state.crashed, restartGame);
}

// ── Input handlers ────────────────────────────────────────────────────────────

/**
 * Handle card being dropped/clicked onto a slot.
 * @param {string} cardId
 * @param {string} slotRole
 */
function handleCardDrop(cardId, slotRole) {
  if (state.gamePhase !== 'assign') return;

  const cardIdx = state.hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return;

  const card = state.hand[cardIdx];
  const slot = state.slots.find(s => s.role === slotRole);
  if (!slot) return;

  // Displace existing card (churn)
  const displaced = assignCard(slot, card);
  if (displaced) {
    state.graveyard.push(displaced);
    state.churnCountThisRound++;
  }

  // Remove from hand
  state.hand.splice(cardIdx, 1);

  if (displaced) {
    flashChurnIndicator(slotRole);
  }

  sfxAssign();
  render(state);

  // If hand is empty, optionally auto-resolve hint
  if (state.hand.length === 0) {
    showToast('Svi slotovi popunjeni — pritisni "Reši rundu"!', 1800);
  }
}

function handleConfirm() {
  if (state.gamePhase === 'assign') performResolve();
  else if (state.gamePhase === 'draw') performDraw();
}

function handleDiscard() {
  // Discard selected card from hand to graveyard (costs nothing, just reduces options)
  const selected = document.querySelector('.card-selected');
  if (!selected) return;
  const cardId = selected.dataset.cardId;
  const idx    = state.hand.findIndex(c => c.id === cardId);
  if (idx !== -1) {
    state.graveyard.push(state.hand.splice(idx, 1)[0]);
    render(state);
  }
}
