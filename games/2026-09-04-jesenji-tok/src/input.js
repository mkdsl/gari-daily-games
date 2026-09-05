/**
 * @module input
 * Tap/click handler for card selection and grid cell assignment.
 * Implements tap-tap flow: tap card → tap cell → assign.
 *
 * Interaction model:
 *   1. Player taps a task card in the palette → card gets "selected" state
 *   2. Player taps a grid cell → assign selected task to that week
 *   3. Tapping the same card again deselects it
 *   4. Tapping an already-assigned cell with no selection = unassign
 *   5. Tapping an already-assigned cell with a different selection = reassign
 *
 * No drag-drop (complex on mobile) — pointer events only.
 *
 * Keyboard shortcuts:
 *   1-6   — select task by index
 *   Esc   — deselect
 *   Enter — confirm/close season (when all assigned)
 *   ?     — show task info for selected card
 *   Arrow keys — navigate grid when focused
 */

import { TASKS } from './content/tasks.js';

// ─── Module State ──────────────────────────────────────────────────────────────

/** @type {((taskId: string|null) => void)|null} */
let onCardSelect = null;
/** @type {((taskId: string, week: number) => void)|null} */
let onCellTap = null;
/** @type {((taskId: string) => void)|null} */
let onCardInfo = null;
/** @type {(() => void)|null} */
let onLabelTap = null;
/** @type {(() => void)|null} */
let onConfirmAction = null;

/** Last tap position for double-tap detection */
let _lastTapTime = 0;
let _lastTapTarget = null;

/** Grid keyboard navigation: {taskIdx, weekIdx} */
let _gridFocus = { taskIdx: 0, weekIdx: 0 };
let _keyboardNavEnabled = false;

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize input handlers.
 * @param {Object} handlers
 * @param {(taskId: string|null) => void}     handlers.onCardSelect  - Card selected/deselected
 * @param {(taskId: string, week: number) => void} handlers.onCellTap - Grid cell tapped
 * @param {(taskId: string) => void}           handlers.onCardInfo   - Info button tapped
 * @param {() => void}                         [handlers.onLabelTap] - Task label tapped
 * @param {() => void}                         [handlers.onConfirm]  - Confirm action (Enter)
 */
export function initInput({
  onCardSelect: cs,
  onCellTap: ct,
  onCardInfo: ci,
  onLabelTap: lt,
  onConfirm: conf,
}) {
  onCardSelect = cs ?? null;
  onCellTap = ct ?? null;
  onCardInfo = ci ?? null;
  onLabelTap = lt ?? null;
  onConfirmAction = conf ?? null;
}

// ─── Card Interaction ─────────────────────────────────────────────────────────

/**
 * Handle a card palette tap.
 * Called by ui/cards.js when a card element is clicked.
 * @param {string} taskId
 * @param {boolean} isInfoButton - whether the ⓘ info button was tapped
 */
export function handleCardTap(taskId, isInfoButton = false) {
  if (isInfoButton) {
    if (onCardInfo) onCardInfo(taskId);
    return;
  }
  if (onCardSelect) onCardSelect(taskId);
}

// ─── Cell Interaction ─────────────────────────────────────────────────────────

/**
 * Handle a grid cell tap.
 * Called by ui/grid.js when a cell is clicked.
 * @param {string} taskId - task row (from data-task-id attribute)
 * @param {number} week   - week column (from data-week attribute)
 */
export function handleCellTap(taskId, week) {
  if (onCellTap) onCellTap(taskId, week);
}

/**
 * Handle task label tap in grid (clicking the task name on the left).
 * Tapping a label selects/deselects that task in the card palette.
 * @param {string} taskId
 */
export function handleLabelTap(taskId) {
  if (onLabelTap) {
    onLabelTap(taskId);
  } else if (onCardSelect) {
    onCardSelect(taskId);
  }
}

// ─── Keyboard Input ───────────────────────────────────────────────────────────

/**
 * Keyboard shortcut handler.
 * Attach to document keydown event.
 * @param {KeyboardEvent} event
 * @param {import('./state.js').GameState} state
 */
export function handleKeyboard(event, state) {
  // Don't capture keys when typing in inputs
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

  switch (event.key) {
    case 'Escape':
      // Deselect current task
      if (state.selected_task_id !== null && onCardSelect) {
        event.preventDefault();
        onCardSelect(null);
      }
      break;

    case 'Enter':
      // Confirm action (close season if all done, or activate selected)
      if (onConfirmAction) {
        event.preventDefault();
        onConfirmAction();
      }
      break;

    case '?':
    case '/':
      // Show info for selected card
      if (state.selected_task_id && onCardInfo) {
        event.preventDefault();
        onCardInfo(state.selected_task_id);
      }
      break;

    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      if (_keyboardNavEnabled) {
        event.preventDefault();
        _handleArrowNav(event.key, state);
      }
      break;

    default: {
      // Number keys 1-6: select corresponding task
      const taskIndex = parseInt(event.key, 10) - 1;
      if (!isNaN(taskIndex) && taskIndex >= 0 && taskIndex < TASKS.length) {
        event.preventDefault();
        const taskId = TASKS[taskIndex].id;
        if (onCardSelect) onCardSelect(taskId);
      }
      break;
    }
  }
}

/**
 * Handle arrow key navigation in the grid.
 * @param {string} key - 'ArrowUp'|'ArrowDown'|'ArrowLeft'|'ArrowRight'
 * @param {import('./state.js').GameState} state
 */
function _handleArrowNav(key, state) {
  const numTasks = TASKS.length;
  const numWeeks = 12;

  switch (key) {
    case 'ArrowUp':
      _gridFocus.taskIdx = Math.max(0, _gridFocus.taskIdx - 1);
      break;
    case 'ArrowDown':
      _gridFocus.taskIdx = Math.min(numTasks - 1, _gridFocus.taskIdx + 1);
      break;
    case 'ArrowLeft':
      _gridFocus.weekIdx = Math.max(0, _gridFocus.weekIdx - 1);
      break;
    case 'ArrowRight':
      _gridFocus.weekIdx = Math.min(numWeeks - 1, _gridFocus.weekIdx + 1);
      break;
  }

  // Focus the cell in the DOM
  const taskId = TASKS[_gridFocus.taskIdx]?.id;
  const week = _gridFocus.weekIdx + 1;
  if (taskId) {
    const cell = document.querySelector(`[data-task-id="${taskId}"][data-week="${week}"]`);
    if (cell) {
      cell.focus({ preventScroll: false });
    }
  }
}

/**
 * Enable/disable keyboard grid navigation.
 * @param {boolean} enabled
 */
export function setKeyboardNavEnabled(enabled) {
  _keyboardNavEnabled = enabled;
}

/**
 * Update keyboard nav focus to match a tapped cell.
 * @param {string} taskId
 * @param {number} week
 */
export function syncKeyboardFocus(taskId, week) {
  const taskIdx = TASKS.findIndex((t) => t.id === taskId);
  if (taskIdx !== -1) {
    _gridFocus.taskIdx = taskIdx;
    _gridFocus.weekIdx = week - 1;
  }
}

// ─── Touch Utilities ──────────────────────────────────────────────────────────

/**
 * Prevent default touch scroll on a game container element.
 * Allows vertical scroll but prevents horizontal swipe interference.
 * @param {HTMLElement} element
 */
export function preventScrollOnElement(element) {
  element.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (touch) {
      element._touchStartX = touch.clientX;
      element._touchStartY = touch.clientY;
    }
  }, { passive: true });

  element.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (!touch || element._touchStartX === undefined) return;
    const dx = Math.abs(touch.clientX - element._touchStartX);
    const dy = Math.abs(touch.clientY - element._touchStartY);
    // If clearly horizontal swipe on the game grid, prevent default
    if (dx > dy * 1.5 && dx > 8) {
      // Allow — horizontal scrolling of grid is intentional
    }
  }, { passive: true });
}

/**
 * Detect double tap on an element.
 * Returns true if this is a double tap (two taps within 300ms on same target).
 * @param {Event} event
 * @returns {boolean}
 */
export function isDoubleTap(event) {
  const now = Date.now();
  const target = event.currentTarget;
  if (now - _lastTapTime < 300 && _lastTapTarget === target) {
    _lastTapTime = 0;
    _lastTapTarget = null;
    return true;
  }
  _lastTapTime = now;
  _lastTapTarget = target;
  return false;
}

/**
 * Detect if device is touch-first (prefer touch over mouse).
 * @returns {boolean}
 */
export function isTouchDevice() {
  return window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
}

/**
 * Detect if device supports pointer events.
 * @returns {boolean}
 */
export function supportsPointerEvents() {
  return 'PointerEvent' in window;
}

// ─── Haptic Feedback ─────────────────────────────────────────────────────────

/**
 * Add haptic feedback for mobile (if Vibration API supported).
 * @param {'light'|'medium'|'heavy'|'error'} intensity
 */
export function haptic(intensity = 'light') {
  if (!navigator.vibrate) return;
  const patterns = {
    light: 15,
    medium: 35,
    heavy: 65,
    error: [30, 50, 30],
  };
  try {
    const pattern = patterns[intensity] ?? 15;
    navigator.vibrate(pattern);
  } catch (e) {}
}

// ─── Gesture Recognition ─────────────────────────────────────────────────────

/**
 * Simple swipe gesture recognizer.
 * Returns the swipe direction or null if not a clear swipe.
 * @param {{ startX: number, startY: number, endX: number, endY: number }} gesture
 * @returns {'left'|'right'|'up'|'down'|null}
 */
export function recognizeSwipe({ startX, startY, endX, endY }) {
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 30) return null; // Too short

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

/**
 * Build a swipe tracker on an element.
 * Returns a cleanup function.
 * @param {HTMLElement} el
 * @param {(dir: string) => void} onSwipe
 * @returns {() => void}
 */
export function addSwipeListener(el, onSwipe) {
  let startX = 0;
  let startY = 0;

  function touchstart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }

  function touchend(e) {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dir = recognizeSwipe({ startX, startY, endX, endY });
    if (dir) onSwipe(dir);
  }

  el.addEventListener('touchstart', touchstart, { passive: true });
  el.addEventListener('touchend', touchend, { passive: true });

  return () => {
    el.removeEventListener('touchstart', touchstart);
    el.removeEventListener('touchend', touchend);
  };
}

// ─── Focus Management ────────────────────────────────────────────────────────

/**
 * Trap focus inside a modal/overlay element.
 * Returns a cleanup function to remove the trap.
 * @param {HTMLElement} container
 * @returns {() => void}
 */
export function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleTab(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', handleTab);
  if (first) first.focus();

  return () => container.removeEventListener('keydown', handleTab);
}

/**
 * Get the next focusable sibling element.
 * Useful for keyboard navigation between interactive elements.
 * @param {Element} current
 * @param {Element[]} all - ordered list of focusable elements
 * @param {number} delta - +1 or -1
 * @returns {Element|null}
 */
export function getNextFocusable(current, all, delta = 1) {
  const idx = all.indexOf(current);
  if (idx === -1) return all[0] ?? null;
  const next = idx + delta;
  if (next < 0) return all[all.length - 1] ?? null;
  if (next >= all.length) return all[0] ?? null;
  return all[next];
}
