// render.js — Orchestrates DOM rendering for the game screen

import { renderHand } from './ui/cards.js';
import { renderSlots } from './ui/slots.js';
import { updateVibeMeter } from './ui/vibe-meter.js';
import { updatePhaseHUD, showResolveBreakdown } from './ui.js';
import { showSynergyPairs } from './ui/synergy-display.js';
import { PHASES } from './config.js';
import { detectActivePairs } from './systems/synergy.js';

/**
 * Extract a flat list of role strings from an array of active synergy pairs.
 * Used to pass to renderSlots/renderHand for visual highlighting.
 * @param {import('./systems/synergy.js').ActivePair[]} activePairs
 * @returns {string[]} deduplicated array of role strings
 */
export function extractActiveRoles(activePairs) {
  const roles = new Set();
  for (const pair of activePairs) {
    const [a, b] = pair.key.split('-');
    if (a) roles.add(a);
    if (b) roles.add(b);
  }
  return [...roles];
}

/**
 * Full render pass: update all game-screen DOM nodes from state.
 * Passes active synergy roles to renderSlots so synergy dots appear in real time.
 * @param {import('./state.js').GameState} state
 * @param {number} [vibeDelta] - delta for bump animation on vibe meter
 * @param {import('./systems/resolution.js').RoundResult|null} [result] - optional result for activeRoles
 */
export function render(state, vibeDelta = 0, result = null) {
  const phaseName = PHASES[state.phase_index] || 'setup';

  updatePhaseHUD(state.phase_index, phaseName);
  updateVibeMeter(state.vibe_score, vibeDelta);

  // Use active pairs from result if available, otherwise detect from current slots
  let activeRoles = [];
  if (result) {
    activeRoles = extractActiveRoles(result.activePairs);
  } else if (state.gamePhase === 'assign') {
    const pairs = detectActivePairs(state.slots, state.eventType);
    activeRoles = extractActiveRoles(pairs);
  }

  renderSlots(state.slots, state.churnCountThisRound, activeRoles);

  // Detect active pairs for card glow hints during assign phase
  const activePairRoles = state.gamePhase === 'assign' ? activeRoles : [];
  renderHand(state.hand, activePairRoles);
}

/**
 * Minimal update — only vibe meter and slots (used during resolve animation).
 * @param {import('./state.js').GameState} state
 * @param {number} delta
 */
export function renderVibeDelta(state, delta) {
  updateVibeMeter(state.vibe_score, delta);
  renderSlots(state.slots, state.churnCountThisRound);
}

/**
 * Orchestrate the resolve sequence with staggered timing.
 * Step 0 (0ms):   Show breakdown overlay.
 * Step 1 (400ms): Animate vibe bar bump via CSS class.
 * Step 2 (800ms): Show synergy pairs one by one (200ms each).
 * Step 3:         Call onDone() after last pair resolves.
 *
 * Note: main.js performs these steps manually; this function is an
 * alternate orchestrator for future use or testing.
 *
 * @param {import('./systems/resolution.js').RoundResult} result
 * @param {() => void} onDone
 */
export function renderResolveSequence(result, onDone) {
  // Step 0: show breakdown overlay immediately
  showResolveBreakdown(result);

  // Step 1: trigger vibe bar bump animation at 400ms
  setTimeout(() => {
    const container = document.getElementById('vibe-container');
    if (container) {
      const bumpClass = result.roundDelta >= 0 ? 'vibe-bump-up' : 'vibe-bump-down';
      container.classList.add(bumpClass);
      container.addEventListener('animationend', () => container.classList.remove(bumpClass), { once: true });
    }
  }, 400);

  // Step 2: show synergy pairs at 800ms (each pair 200ms apart via showSynergyPairs)
  setTimeout(() => {
    showSynergyPairs(result.activePairs, onDone);
  }, 800);
}
