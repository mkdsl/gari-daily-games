/**
 * InputHandler.js — Keyboard, gamepad, and touch input management
 * Enables keyboard navigation for accessibility and desktop play
 * @module InputHandler
 */

import EventBus, { EVENTS } from './EventBus.js';
import DialogEngine from './DialogEngine.js';

/** @type {Set<string>} Currently held keys */
const heldKeys = new Set();

/** @type {boolean} */
let initialized = false;

/** @type {number|null} Gamepad polling interval */
let gamepadInterval = null;

/** @type {object} Key bindings */
const KEY_MAP = {
  '1': 0, '2': 1, '3': 2, '4': 3,  // choice selection by number
  'Enter': 'confirm',
  ' ': 'confirm',
  'Escape': 'menu',
  'ArrowUp': 'prev_choice',
  'ArrowDown': 'next_choice',
  'm': 'toggle_mute',
  'M': 'toggle_mute'
};

/** @type {number} Focused choice index */
let focusedChoiceIdx = -1;

/**
 * Initialize input handler
 */
export function init() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // Touch: swipe-up to skip typing animation
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (dy > 60) {
      // Swipe up — skip typing / go to next
      EventBus.emit(EVENTS.DIALOG_NODE + ':skip', {});
    }
  }, { passive: true });

  // Gamepad polling
  if (navigator.getGamepads) {
    gamepadInterval = setInterval(pollGamepad, 100);
  }
}

/**
 * Handle keydown
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
  if (e.repeat) return;
  heldKeys.add(e.key);

  const action = KEY_MAP[e.key];

  // Number keys: select choice by index
  if (typeof action === 'number') {
    e.preventDefault();
    selectChoiceByIndex(action);
    return;
  }

  switch (action) {
    case 'confirm':
      e.preventDefault();
      handleConfirm();
      break;

    case 'menu':
      e.preventDefault();
      EventBus.emit(EVENTS.UI_MENU_OPEN, {});
      break;

    case 'prev_choice':
      e.preventDefault();
      navigateChoice(-1);
      break;

    case 'next_choice':
      e.preventDefault();
      navigateChoice(1);
      break;

    case 'toggle_mute':
      EventBus.emit(EVENTS.AUDIO_SFX_PLAY, { sfx: 'click' });
      document.querySelector('.mute-btn')?.click();
      break;
  }
}

function handleKeyUp(e) {
  heldKeys.delete(e.key);
}

/**
 * Select a choice button by keyboard number
 * @param {number} idx
 */
function selectChoiceByIndex(idx) {
  const choiceBtns = document.querySelectorAll('.choice-btn:not(:disabled)');
  if (choiceBtns[idx]) {
    choiceBtns[idx].click();
  }
}

/**
 * Navigate choice focus up/down
 * @param {number} dir -1 or 1
 */
function navigateChoice(dir) {
  const choiceBtns = Array.from(document.querySelectorAll('.choice-btn'));
  if (choiceBtns.length === 0) return;

  focusedChoiceIdx = Math.max(0, Math.min(choiceBtns.length - 1, focusedChoiceIdx + dir));
  choiceBtns[focusedChoiceIdx]?.focus();
}

/**
 * Confirm current focused element or first available choice
 */
function handleConfirm() {
  const focused = document.activeElement;
  if (focused && focused.classList.contains('choice-btn') && !focused.disabled) {
    focused.click();
    return;
  }

  // Default: click first available choice
  const firstChoice = document.querySelector('.choice-btn:not(:disabled)');
  if (firstChoice) {
    firstChoice.click();
    return;
  }

  // Skip typing if dialog active
  if (DialogEngine.isActive()) {
    EventBus.emit(EVENTS.DIALOG_NODE + ':skip', {});
  }
}

/**
 * Poll gamepad input
 */
function pollGamepad() {
  const gamepads = navigator.getGamepads?.() ?? [];
  for (const gp of gamepads) {
    if (!gp) continue;
    handleGamepadInput(gp);
    break; // first active gamepad only
  }
}

/** @type {object} Previous gamepad button states */
const prevButtonStates = {};

function handleGamepadInput(gp) {
  const prev = prevButtonStates[gp.index] ?? {};

  // D-pad up/down for choice navigation
  const dpadUp = gp.buttons[12]?.pressed;
  const dpadDown = gp.buttons[13]?.pressed;
  const aButton = gp.buttons[0]?.pressed;

  if (dpadUp && !prev.dpadUp) navigateChoice(-1);
  if (dpadDown && !prev.dpadDown) navigateChoice(1);
  if (aButton && !prev.aButton) handleConfirm();

  // Number shortcuts via shoulder buttons
  const lb = gp.buttons[4]?.pressed;
  if (lb && !prev.lb) selectChoiceByIndex(0);

  prevButtonStates[gp.index] = { dpadUp, dpadDown, aButton, lb };
}

/**
 * Check if a key is currently held
 * @param {string} key
 * @returns {boolean}
 */
export function isKeyHeld(key) {
  return heldKeys.has(key);
}

/**
 * Cleanup
 */
export function destroy() {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  if (gamepadInterval) clearInterval(gamepadInterval);
  initialized = false;
}

export default { init, isKeyHeld, destroy };
