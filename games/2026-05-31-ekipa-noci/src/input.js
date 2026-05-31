/**
 * @file input.js
 * Click / touch / keyboard event handlers for card selection and phase buttons.
 * Wires DOM events → state mutations → render triggers.
 * Caller (main.js) must invoke initInput(callbacks) once the DOM is ready.
 */

import { getState, setState, selectCardForRole, advanceDraftRole, updateDraft } from './state.js';
import { ROLES, HAND_SIZE } from './config.js';

/**
 * @typedef {Object} InputCallbacks
 * @property {function(): void} onCardSelected    Called after a card is picked and state is updated
 * @property {function(): void} onDraftComplete   Called when all 5 roles are drafted
 * @property {function(): void} onResolveConfirm  Called when player confirms resolve phase
 * @property {function(): void} onCrewConfirm     Called when player confirms crew_update screen
 * @property {function(): void} onNextEvent       Called when player advances to next event
 * @property {function(): void} onRestartRun      Called when player restarts from tour_end
 * @property {function(string): void} onPhaseNav  Called for any phase-specific navigation button (receives button id)
 */

/** @type {InputCallbacks|null} */
let _callbacks = null;

/** @type {AbortController|null} — used to detach all listeners cleanly */
let _abortController = null;

// ---------------------------------------------------------------------------
// Init / teardown
// ---------------------------------------------------------------------------

/**
 * Initialize all event listeners.
 * Safe to call multiple times — each call cleans up previous listeners.
 * @param {InputCallbacks} callbacks
 */
export function initInput(callbacks) {
  _callbacks = callbacks;
  teardownInput();
  _abortController = new AbortController();
  const signal = _abortController.signal;

  // Global delegated click handler on document
  document.addEventListener('click', _handleClick, { signal });

  // Touch — prevent double-fire on mobile by consuming touchstart for card elements
  document.addEventListener('touchstart', _handleTouchStart, { signal, passive: true });

  // Keyboard shortcuts
  document.addEventListener('keydown', _handleKeydown, { signal });
}

/**
 * Remove all registered event listeners.
 */
export function teardownInput() {
  if (_abortController) {
    _abortController.abort();
    _abortController = null;
  }
}

// ---------------------------------------------------------------------------
// Core dispatcher
// ---------------------------------------------------------------------------

/**
 * Dispatch a pointer interaction originating from `target`.
 * @param {EventTarget} target
 */
function _dispatch(target) {
  const el = /** @type {HTMLElement} */ (target);

  // Card selection during draft phase
  const cardEl = el.closest('[data-card-id]');
  if (cardEl) {
    _handleCardClick(/** @type {HTMLElement} */ (cardEl));
    return;
  }

  // Phase action buttons identified by data-action attribute
  const btnEl = el.closest('[data-action]');
  if (btnEl) {
    _handleAction(/** @type {HTMLElement} */ (btnEl).dataset.action ?? '');
    return;
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/**
 * @param {MouseEvent} e
 */
function _handleClick(e) {
  _dispatch(/** @type {EventTarget} */ (e.target));
}

/** @type {Set<EventTarget>} tracks elements touched this frame to skip click */
const _touchedThisFrame = new Set();

/**
 * @param {TouchEvent} e
 */
function _handleTouchStart(e) {
  const t = e.target;
  if (!t) return;
  // If it's a card or button, register it so click still fires but we track
  if (/** @type {HTMLElement} */(t).closest('[data-card-id], [data-action]')) {
    _touchedThisFrame.add(t);
    // Clear after a frame to avoid stale entries
    requestAnimationFrame(() => _touchedThisFrame.delete(t));
  }
}

/**
 * Keyboard shortcut handler.
 * 1 / 2 / 3 → select card at index during draft
 * Enter       → confirm current phase action
 * @param {KeyboardEvent} e
 */
function _handleKeydown(e) {
  const state = getState();
  if (state.phase !== 'draft') {
    if (e.key === 'Enter') {
      _handleAction('confirm');
    }
    return;
  }

  const keyMap = { '1': 0, '2': 1, '3': 2 };
  const idx = keyMap[e.key];
  if (idx !== undefined) {
    _selectHandIndex(idx);
  }
  if (e.key === 'Enter') {
    _handleAction('confirm');
  }
}

// ---------------------------------------------------------------------------
// Card selection
// ---------------------------------------------------------------------------

/**
 * Handle click on a card element in the hand.
 * @param {HTMLElement} cardEl
 */
function _handleCardClick(cardEl) {
  const state = getState();
  if (state.phase !== 'draft') return;

  const cardId = cardEl.dataset.cardId;
  if (!cardId) return;

  const { hand, current_role_index } = state.draft;
  const role = ROLES[current_role_index];
  if (!role) return;

  const card = hand.find(c => c.id === cardId);
  if (!card) return;

  _applyCardSelection(role, card);
}

/**
 * Select a card from the hand by 0-based index.
 * @param {number} idx  0, 1, or 2
 */
function _selectHandIndex(idx) {
  const state = getState();
  if (state.phase !== 'draft') return;

  const { hand, current_role_index } = state.draft;
  if (idx >= hand.length) return;

  const role = ROLES[current_role_index];
  if (!role) return;

  _applyCardSelection(role, hand[idx]);
}

/**
 * Commit a card selection for the current role, advance or complete draft.
 * @param {string} role
 * @param {Object} card  Card instance or plain object with id
 */
function _applyCardSelection(role, card) {
  selectCardForRole(role, card);

  // Visual feedback — mark selected, deselect others
  _setSelectedVisual(card.id);

  _callbacks?.onCardSelected();

  // Advance to next role or signal draft complete
  const newIndex = advanceDraftRole();
  if (newIndex >= ROLES.length) {
    _callbacks?.onDraftComplete();
  }
}

/**
 * Add/remove .is-selected CSS class on hand cards.
 * @param {string} selectedId
 */
function _setSelectedVisual(selectedId) {
  document.querySelectorAll('[data-card-id]').forEach(el => {
    const htmlEl = /** @type {HTMLElement} */ (el);
    if (htmlEl.dataset.cardId === selectedId) {
      htmlEl.classList.add('is-selected');
    } else {
      htmlEl.classList.remove('is-selected');
    }
  });
}

// ---------------------------------------------------------------------------
// Phase action buttons
// ---------------------------------------------------------------------------

/**
 * Handle a data-action button click.
 * @param {string} action
 */
function _handleAction(action) {
  switch (action) {
    case 'start-run':
      setState({ phase: 'draft' });
      _callbacks?.onPhaseNav('start-run');
      break;

    case 'confirm-resolve':
      _callbacks?.onResolveConfirm();
      break;

    case 'confirm-crew':
      _callbacks?.onCrewConfirm();
      break;

    case 'next-event':
      _callbacks?.onNextEvent();
      break;

    case 'restart-run':
      _callbacks?.onRestartRun();
      break;

    case 'confirm':
      // Generic confirm — delegate based on current phase
      _dispatchConfirmForPhase();
      break;

    case 'open-codex':
      _callbacks?.onPhaseNav('open-codex');
      break;

    case 'close-codex':
      _callbacks?.onPhaseNav('close-codex');
      break;

    default:
      _callbacks?.onPhaseNav(action);
  }
}

/**
 * Dispatch a confirm action based on current game phase.
 */
function _dispatchConfirmForPhase() {
  const { phase } = getState();
  switch (phase) {
    case 'resolve':     _callbacks?.onResolveConfirm(); break;
    case 'crew_update': _callbacks?.onCrewConfirm();    break;
    case 'next_event':  _callbacks?.onNextEvent();      break;
    case 'tour_end':    _callbacks?.onRestartRun();     break;
    default: break;
  }
}

// ---------------------------------------------------------------------------
// Utility: programmatically trigger a card selection (used by tests / AI)
// ---------------------------------------------------------------------------

/**
 * Programmatically select a card by its DOM element or card ID.
 * @param {string} cardId
 */
export function triggerCardSelect(cardId) {
  const el = document.querySelector(`[data-card-id="${cardId}"]`);
  if (el) {
    _handleCardClick(/** @type {HTMLElement} */ (el));
  }
}

/**
 * Programmatically trigger a phase action.
 * @param {string} action  Value of data-action
 */
export function triggerAction(action) {
  _handleAction(action);
}
