/**
 * @module ui/cards
 * Task card DOM components for the card palette.
 *
 * Cards live in the #card-palette element below the game grid.
 * Each card displays:
 *   - Task name and emoji
 *   - Group cost badge
 *   - Scheduling window (updated with weather modifiers)
 *   - Rain-sensitive tag (for tasks blocked by rain)
 *   - Assignment slot (shows which week it's assigned to)
 *   - Info button for educational tooltip
 *
 * Visual states:
 *   'unassigned'   — default, not yet placed
 *   'selected'     — active selection (player is choosing a week)
 *   'assigned'     — placed on the grid
 *   'in-window'    — placed in the optimal window
 *   'out-window'   — placed outside the optimal window (reduced score)
 *   'error-flash'  — brief shake on error
 *   'assign-flash' — brief green flash on successful assign
 */

import { TASKS } from '../content/tasks.js';
import { getAssignment, getWeekGroupUsage } from '../state.js';
import { getEffectiveWindow, isInWindow } from '../systems/weather.js';
import { weekLabel } from '../content/tasks.js';
import { getEffectiveTaskCost } from '../systems/validation.js';

// ─── Module State ──────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let paletteContainer = null;
/** @type {((taskId: string) => void)|null} */
let onCardClick = null;
/** @type {((taskId: string) => void)|null} */
let onCardInfoClick = null;

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize the card palette with DOM container and handlers.
 * @param {HTMLElement} container
 * @param {(taskId: string) => void} clickHandler - called when card body is selected/tapped
 * @param {(taskId: string) => void} infoHandler  - called when ⓘ button is clicked
 */
export function initCards(container, clickHandler, infoHandler) {
  paletteContainer = container;
  onCardClick = clickHandler;
  onCardInfoClick = infoHandler;
  buildCardsDOM();
}

// ─── DOM Construction ─────────────────────────────────────────────────────────

/**
 * Build the initial static card DOM elements.
 * Cards are created once and updated in place on each render pass.
 */
function buildCardsDOM() {
  if (!paletteContainer) return;
  paletteContainer.innerHTML = '';

  for (const task of TASKS) {
    const card = buildCard(task);
    paletteContainer.appendChild(card);
  }
}

/**
 * Build a single task card element.
 * @param {import('../content/tasks.js').Task} task
 * @returns {HTMLElement}
 */
function buildCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card unassigned';
  card.dataset.taskId = task.id;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${task.name} — Tapni da selektuješ`);
  card.style.setProperty('--card-color', task.color ?? 'var(--accent)');

  card.innerHTML = buildCardHTML(task, 2, task.window_start, task.window_end);

  // Card main click/tap (select)
  card.addEventListener('click', (e) => {
    if (e.target.closest('.card-info-btn')) return;
    if (onCardClick) onCardClick(task.id);
  });

  // Keyboard activation
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onCardClick) onCardClick(task.id);
    }
  });

  // Info button
  const infoBtn = card.querySelector('.card-info-btn');
  if (infoBtn) {
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onCardInfoClick) onCardInfoClick(task.id);
    });
  }

  return card;
}

/**
 * Build the inner HTML for a task card.
 * @param {import('../content/tasks.js').Task} task
 * @param {number} effectiveCost - group cost (may differ from task.group_cost with prestige)
 * @param {number} windowStart
 * @param {number} windowEnd
 * @returns {string}
 */
function buildCardHTML(task, effectiveCost, windowStart, windowEnd) {
  const windowModified = windowStart !== task.window_start || windowEnd !== task.window_end;
  const windowLabel = `N${windowStart}–N${windowEnd}`;
  const costModified = effectiveCost !== task.group_cost;

  return `
    <div class="card-header">
      <span class="card-emoji" aria-hidden="true">${task.emoji}</span>
      <span class="card-name">${task.name}</span>
      <button class="card-info-btn"
        data-task-id="${task.id}"
        title="Više o zadatku"
        aria-label="Info o zadatku ${task.name}">ⓘ</button>
    </div>
    <div class="card-meta">
      <span class="card-cost ${costModified ? 'cost-modified' : ''}"
        title="${costModified ? 'Cena smanjena prestižom' : 'Cena u radnim grupama'}">
        👷 ${effectiveCost}
      </span>
      <span class="card-window ${windowModified ? 'modified-window' : ''}"
        title="${windowModified ? 'Prozor promenjen vremenskim prilikama' : 'Optimalni vremenski prozor'}">
        📅 ${windowLabel}
      </span>
      ${task.blocked_by_rain ? `<span class="card-rain-tag" title="Blokira se kišom">🌧️</span>` : ''}
    </div>
    <div class="card-assign-slot">
      <span class="card-assign-text">Tap za selekciju</span>
    </div>
  `;
}

// ─── Render Pass ──────────────────────────────────────────────────────────────

/**
 * Full render pass: update all card states from current game state.
 * Called after every state change.
 * @param {import('../state.js').GameState} state
 */
export function updateCards(state) {
  if (!paletteContainer) return;

  for (const task of TASKS) {
    const card = paletteContainer.querySelector(`.task-card[data-task-id="${task.id}"]`);
    if (!card) continue;
    updateCard(card, task, state);
  }
}

/**
 * Update a single card's DOM state.
 * @param {HTMLElement} card
 * @param {import('../content/tasks.js').Task} task
 * @param {import('../state.js').GameState} state
 */
function updateCard(card, task, state) {
  const assignment = getAssignment(state, task.id);
  const isSelected = state.selected_task_id === task.id;
  const isAssigned = !!assignment;

  // --- Class updates ---
  card.classList.toggle('selected', isSelected);
  card.classList.toggle('assigned', isAssigned);
  card.classList.toggle('unassigned', !isAssigned);

  // --- Aria ---
  if (isSelected) {
    card.setAttribute('aria-label', `${task.name} — izabrana, tapni ćeliju u gridu`);
    card.setAttribute('aria-pressed', 'true');
  } else if (isAssigned) {
    card.setAttribute('aria-label', `${task.name} — dodeljena u nedelji ${assignment.week}`);
    card.setAttribute('aria-pressed', 'false');
  } else {
    card.setAttribute('aria-label', `${task.name} — Tapni da selektuješ`);
    card.setAttribute('aria-pressed', 'false');
  }

  // --- Weather-adjusted window ---
  const { start: wStart, end: wEnd } = state.weather
    ? getEffectiveWindow(task, state.weather)
    : { start: task.window_start, end: task.window_end };

  const windowEl = card.querySelector('.card-window');
  if (windowEl) {
    const modified = wStart !== task.window_start || wEnd !== task.window_end;
    windowEl.textContent = `📅 N${wStart}–N${wEnd}`;
    windowEl.classList.toggle('modified-window', modified);
    windowEl.title = modified
      ? `Prozor promenjen vremenskim prilikama (standard: N${task.window_start}–N${task.window_end})`
      : 'Optimalni vremenski prozor';
  }

  // --- Effective cost (prestige cheap_micelij) ---
  const effectiveCost = state ? getEffectiveTaskCost(state, task) : task.group_cost;
  const costEl = card.querySelector('.card-cost');
  if (costEl) {
    const costModified = effectiveCost !== task.group_cost;
    costEl.textContent = `👷 ${effectiveCost}`;
    costEl.classList.toggle('cost-modified', costModified);
    costEl.title = costModified ? `Smanjena cena (prestiž): ${effectiveCost} grupa` : `${task.group_cost} radne grupe`;
  }

  // --- Assign slot ---
  const assignSlot = card.querySelector('.card-assign-slot');
  const assignText = card.querySelector('.card-assign-text');
  if (assignSlot && assignText) {
    if (isAssigned) {
      const inWin = state.weather ? isInWindow(task, assignment.week, state.weather) : true;
      assignSlot.classList.toggle('in-window', inWin);
      assignSlot.classList.toggle('out-window', !inWin);
      const wkLabel = weekLabel(assignment.week);
      assignText.textContent = `✓ N${assignment.week}${wkLabel ? ` — ${wkLabel}` : ''}`;
      assignSlot.title = inWin
        ? `U optimalnom prozoru (+100% poena)`
        : `Van prozora (×0.6 poena — premesti u N${wStart}–N${wEnd} za bolji rezultat)`;
    } else {
      assignSlot.classList.remove('in-window', 'out-window');
      assignText.textContent = isSelected ? '← Tap ćeliju u gridu' : 'Tap za selekciju';
      assignSlot.title = '';
    }
  }

  // --- Error flash ---
  if (state.error_task === task.id) {
    triggerCardError(card);
  }
}

// ─── Animations ───────────────────────────────────────────────────────────────

/**
 * Flash a card with the error animation (brief red shake).
 * @param {HTMLElement} card
 */
function triggerCardError(card) {
  card.classList.remove('error-flash');
  void card.offsetWidth; // Force reflow
  card.classList.add('error-flash');
  setTimeout(() => card.classList.remove('error-flash'), 500);
}

/**
 * Flash a card green to indicate successful assignment.
 * @param {string} taskId
 */
export function flashCardAssigned(taskId) {
  if (!paletteContainer) return;
  const card = paletteContainer.querySelector(`.task-card[data-task-id="${taskId}"]`);
  if (!card) return;
  card.classList.remove('assign-flash');
  void card.offsetWidth;
  card.classList.add('assign-flash');
  setTimeout(() => card.classList.remove('assign-flash'), 420);
}

/**
 * Play a brief "unassign" visual on a card (quick color fade).
 * @param {string} taskId
 */
export function flashCardUnassigned(taskId) {
  if (!paletteContainer) return;
  const card = paletteContainer.querySelector(`.task-card[data-task-id="${taskId}"]`);
  if (!card) return;
  card.classList.add('unassign-flash');
  setTimeout(() => card.classList.remove('unassign-flash'), 350);
}

// ─── Scroll & Focus ───────────────────────────────────────────────────────────

/**
 * Scroll a specific card into view in the palette.
 * @param {string} taskId
 */
export function scrollToCard(taskId) {
  if (!paletteContainer) return;
  const card = paletteContainer.querySelector(`.task-card[data-task-id="${taskId}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/**
 * Focus a card for keyboard navigation.
 * @param {string} taskId
 */
export function focusCard(taskId) {
  if (!paletteContainer) return;
  const card = paletteContainer.querySelector(`.task-card[data-task-id="${taskId}"]`);
  if (card) card.focus({ preventScroll: true });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Get count of assigned vs total tasks.
 * @param {import('../state.js').GameState} state
 * @returns {{ assigned: number, total: number }}
 */
export function getAssignProgress(state) {
  return { assigned: state.assignments.length, total: TASKS.length };
}

/**
 * Get the card element for a task ID.
 * @param {string} taskId
 * @returns {HTMLElement|null}
 */
export function getCardElement(taskId) {
  return paletteContainer?.querySelector(`.task-card[data-task-id="${taskId}"]`) ?? null;
}

/**
 * Get all rendered card elements in order.
 * @returns {HTMLElement[]}
 */
export function getAllCardElements() {
  if (!paletteContainer) return [];
  return Array.from(paletteContainer.querySelectorAll('.task-card'));
}
