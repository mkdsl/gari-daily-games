/**
 * input.js — Event delegation handlers for Avala Crew DOM game
 * Click/touch handlers via data-action attributes (event delegation)
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { BUTTON_DEBOUNCE_MS } from './config.js';

/** Map of action handler functions */
const _handlers = new Map();

/** Last action time per action type (for debounce) */
const _lastActionTime = new Map();

/** Whether input system is initialized */
let _initialized = false;

/**
 * Initialize input system — delegates all clicks to game root
 * @param {Object} actions - Map of {actionName: handlerFn}
 */
export function initInput(actions = {}) {
  if (_initialized) return;
  _initialized = true;

  // Register all actions
  for (const [name, fn] of Object.entries(actions)) {
    _handlers.set(name, fn);
  }

  // Single delegation listener on document
  document.addEventListener('click', _handleClick);
  document.addEventListener('touchend', _handleTouch, { passive: true });

  // Change events for select elements (role dropdowns)
  document.addEventListener('change', _handleChange);
}

/**
 * Register or update a handler after init
 * @param {string} actionName
 * @param {Function} handler
 */
export function registerAction(actionName, handler) {
  _handlers.set(actionName, handler);
}

/**
 * Remove a handler
 * @param {string} actionName
 */
export function unregisterAction(actionName) {
  _handlers.delete(actionName);
}

/**
 * Internal click handler
 * @param {MouseEvent} event
 */
function _handleClick(event) {
  const target = _findActionTarget(event.target);
  if (!target) return;

  const action = target.dataset.action;
  if (!action) return;

  // Check debounce
  if (_isDebounced(action)) return;

  event.preventDefault && event.preventDefault();
  _dispatchAction(action, target, event);
}

/**
 * Internal touch handler (touchend)
 * @param {TouchEvent} event
 */
function _handleTouch(event) {
  if (event.touches && event.touches.length > 0) return; // Only on touchend (no remaining touches)

  const touch = event.changedTouches && event.changedTouches[0];
  if (!touch) return;

  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!el) return;

  const target = _findActionTarget(el);
  if (!target) return;

  const action = target.dataset.action;
  if (!action) return;

  if (_isDebounced(action)) return;
  _dispatchAction(action, target, event);
}

/**
 * Internal change handler (for select elements)
 * @param {Event} event
 */
function _handleChange(event) {
  const target = event.target;
  if (!target) return;

  const action = target.dataset.action;
  if (!action) return;

  _dispatchAction(action, target, event);
}

/**
 * Find nearest ancestor with data-action attribute
 * @param {HTMLElement} el
 * @returns {HTMLElement|null}
 */
function _findActionTarget(el) {
  let current = el;
  let depth = 0;
  while (current && depth < 8) {
    if (current.dataset && current.dataset.action) return current;
    current = current.parentElement;
    depth++;
  }
  return null;
}

/**
 * Check if action is debounced
 * @param {string} action
 * @returns {boolean}
 */
function _isDebounced(action) {
  const now = Date.now();
  const last = _lastActionTime.get(action) || 0;
  if (now - last < BUTTON_DEBOUNCE_MS) return true;
  _lastActionTime.set(action, now);
  return false;
}

/**
 * Dispatch an action to its registered handler
 * @param {string} action
 * @param {HTMLElement} target
 * @param {Event} event
 */
function _dispatchAction(action, target, event) {
  const handler = _handlers.get(action);
  if (!handler) {
    // Action not registered yet — ignore silently
    return;
  }

  try {
    handler({ action, target, event, dataset: target.dataset });
  } catch (err) {
    console.error(`[Input] Error in handler for "${action}":`, err);
  }
}

/**
 * Build action handlers object for initInput
 * Called from main.js with all game action callbacks
 *
 * @param {Object} gameCallbacks - All game action handlers
 * @returns {Object}
 */
export function buildActionHandlers(gameCallbacks) {
  return {
    // Roster screen
    'toggle-member': ({ dataset }) => {
      gameCallbacks.toggleMember && gameCallbacks.toggleMember(dataset.memberId);
    },
    'remove-member': ({ dataset }) => {
      gameCallbacks.removeMember && gameCallbacks.removeMember(dataset.memberId);
    },
    'change-role': ({ target, dataset }) => {
      gameCallbacks.changeRole && gameCallbacks.changeRole(dataset.memberId, target.value);
    },
    'start-night': () => {
      gameCallbacks.startNight && gameCallbacks.startNight();
    },

    // Scenario screen
    'resolve-scenario': () => {
      gameCallbacks.resolveScenario && gameCallbacks.resolveScenario();
    },
    'use-ability': ({ dataset }) => {
      gameCallbacks.useAbility && gameCallbacks.useAbility(dataset.memberId);
    },
    'select-choice': ({ dataset }) => {
      gameCallbacks.selectChoice && gameCallbacks.selectChoice(dataset.choice);
    },

    // Outro screen
    'next-night': () => {
      gameCallbacks.nextNight && gameCallbacks.nextNight();
    },
    'share': () => {
      gameCallbacks.share && gameCallbacks.share();
    },
    'cta-click': () => {
      gameCallbacks.ctaClick && gameCallbacks.ctaClick();
    },

    // Intro
    'start-game': () => {
      gameCallbacks.startGame && gameCallbacks.startGame();
    },

    // Prestige
    'prestige-confirm': () => {
      gameCallbacks.prestigeConfirm && gameCallbacks.prestigeConfirm();
    },
    'prestige-decline': () => {
      gameCallbacks.prestigeDecline && gameCallbacks.prestigeDecline();
    }
  };
}

/**
 * Remove all event listeners (for cleanup)
 */
export function destroyInput() {
  document.removeEventListener('click', _handleClick);
  document.removeEventListener('touchend', _handleTouch);
  document.removeEventListener('change', _handleChange);
  _handlers.clear();
  _initialized = false;
}
