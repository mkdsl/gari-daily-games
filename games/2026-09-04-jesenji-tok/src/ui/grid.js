/**
 * @module ui/grid
 * 6×12 DOM grid: 6 task rows × 12 week columns.
 *
 * Grid layout:
 *   - Left sticky column: task labels (emoji + name + cost badge)
 *   - Header row: week numbers + dates + weather + capacity
 *   - Body cells: tap to assign selected task to a week
 *
 * Cell state classes:
 *   .assigned         — task is assigned here
 *   .in-window        — within optimal scheduling window
 *   .out-window       — outside optimal window (penalty zone)
 *   .rain-blocked     — rain blocks this week for this task
 *   .highlight-available  — selected task can go here
 *   .highlight-out    — selected task could go here but with penalty
 *   .highlight-blocked    — selected task is hard-blocked here
 *   .highlight-full   — week is at group capacity
 *   .error-shake      — temporary error animation
 */

import { TASKS, weekLabel, PARCEL_TYPES } from '../content/tasks.js';
import { WEEKS } from '../config.js';
import {
  getEffectiveWindow,
  isRainWeek,
  isForecastVisible,
  getWeekWeatherEmoji,
  getWeekWeatherDescription,
  isBlockedByRain,
} from '../systems/weather.js';
import { getWeekGroupUsage, getAssignment, getWeekAssignments } from '../state.js';
import { validateAssign, getValidWeeksForTask } from '../systems/validation.js';
import { previewTaskScore } from '../systems/scoring.js';

// ─── Module State ──────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let gridContainer = null;
/** @type {((taskId: string, week: number) => void)|null} */
let onCellClick = null;
/** Grid built flag */
let gridBuilt = false;
/** Cache of last rendered state for partial updates */
let lastStateSnapshot = null;

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize the grid DOM structure
 * @param {HTMLElement} container
 * @param {(taskId: string, week: number) => void} clickHandler
 */
export function initGrid(container, clickHandler) {
  gridContainer = container;
  onCellClick = clickHandler;
  buildGridDOM();
  gridBuilt = true;
}

// ─── Build DOM ─────────────────────────────────────────────────────────────────

/**
 * Build the initial grid DOM (headers + task rows + cells)
 * Only called once at init — updates are done in-place via updateGrid()
 */
function buildGridDOM() {
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  // ── Header row ──
  const headerRow = document.createElement('div');
  headerRow.className = 'grid-header-row';
  headerRow.setAttribute('role', 'row');

  // Task label spacer
  const labelSpacer = document.createElement('div');
  labelSpacer.className = 'grid-task-label-spacer';
  labelSpacer.setAttribute('role', 'columnheader');
  labelSpacer.innerHTML = `<span>Zadatak</span><span class="spacer-hint">↓ tapni → tapni ćeliju</span>`;
  headerRow.appendChild(labelSpacer);

  // Week headers
  for (let w = 1; w <= WEEKS; w++) {
    const cell = document.createElement('div');
    cell.className = 'grid-week-header';
    cell.dataset.week = String(w);
    cell.setAttribute('role', 'columnheader');
    cell.setAttribute('aria-label', `Nedelja ${w}, ${weekLabel(w)}`);
    // Content populated in updateWeekHeaders()
    headerRow.appendChild(cell);
  }
  gridContainer.appendChild(headerRow);

  // ── Task rows ──
  for (const task of TASKS) {
    const row = document.createElement('div');
    row.className = 'grid-task-row';
    row.dataset.taskId = task.id;
    row.setAttribute('role', 'row');
    row.setAttribute('aria-label', task.name);

    // Task label (sticky left)
    const labelCell = buildTaskLabelCell(task);
    row.appendChild(labelCell);

    // Week cells
    for (let w = 1; w <= WEEKS; w++) {
      const cell = buildGridCell(task.id, w);
      row.appendChild(cell);
    }

    gridContainer.appendChild(row);
  }
}

/**
 * Build a task label cell (sticky left column)
 * @param {import('../content/tasks.js').Task} task
 * @returns {HTMLElement}
 */
function buildTaskLabelCell(task) {
  const cell = document.createElement('div');
  cell.className = 'grid-task-label';
  cell.dataset.taskId = task.id;
  cell.setAttribute('role', 'rowheader');
  cell.setAttribute('aria-label', `${task.name}, cost: ${task.group_cost}`);
  cell.style.setProperty('--task-color', task.color);

  cell.innerHTML = `
    <span class="task-color-strip" style="background:${task.color}"></span>
    <span class="task-emoji" aria-hidden="true">${task.emoji}</span>
    <div class="task-label-text">
      <span class="task-name">${task.name}</span>
      <span class="task-parcel-type">${getParcelTypeLabel(task.parcel_type)}</span>
    </div>
    <span class="task-cost-badge" title="Radne grupe potrebne za ovaj zadatak">
      ${task.group_cost}👷
    </span>
  `;
  return cell;
}

/**
 * Build a grid cell element
 * @param {string} taskId
 * @param {number} week
 * @returns {HTMLElement}
 */
function buildGridCell(taskId, week) {
  const cell = document.createElement('div');
  cell.className = 'grid-cell';
  cell.dataset.taskId = taskId;
  cell.dataset.week = String(week);
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('tabindex', '0');

  cell.addEventListener('click', () => {
    if (onCellClick) onCellClick(taskId, week);
  });

  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onCellClick) onCellClick(taskId, week);
    }
  });

  return cell;
}

/**
 * Get display label for a parcel type
 * @param {string} parcelType
 * @returns {string}
 */
function getParcelTypeLabel(parcelType) {
  const found = PARCEL_TYPES.find((p) => p.id === parcelType);
  return found ? `${found.emoji} ${found.label}` : parcelType;
}

// ─── Update ────────────────────────────────────────────────────────────────────

/**
 * Full grid update from current game state.
 * Updates all cells, headers, and labels.
 * @param {import('../state.js').GameState} state
 */
export function updateGrid(state) {
  if (!gridContainer || !gridBuilt) return;

  updateWeekHeaders(state);
  updateTaskLabels(state);
  updateAllCells(state);
}

/**
 * Update week header cells with weather, dates, and group usage
 * @param {import('../state.js').GameState} state
 */
function updateWeekHeaders(state) {
  if (!gridContainer || !state.weather) return;

  for (let w = 1; w <= WEEKS; w++) {
    const header = gridContainer.querySelector(`.grid-week-header[data-week="${w}"]`);
    if (!header) continue;

    const visible = isForecastVisible(state.weather, w);
    const emoji = visible ? getWeekWeatherEmoji(state.weather, w) : '❓';
    const usage = getWeekGroupUsage(state, w);
    const total = state.groups_per_week;
    const desc = getWeekWeatherDescription(state.weather, w);
    const isFull = usage >= total;
    const assignCount = state.assignments.filter((a) => a.week === w).length;

    header.innerHTML = `
      <span class="week-num">N${w}</span>
      <span class="week-date">${weekLabel(w)}</span>
      <span class="week-weather" title="${desc}">${emoji}</span>
      <span class="week-capacity ${isFull ? 'full' : ''}" title="Radne grupe: ${usage}/${total}">
        ${usage}/${total}
      </span>
      ${assignCount > 0 ? `<span class="week-assigned-dot" title="${assignCount} zadatak(a)">●</span>` : ''}
    `;

    // Weather classes
    const isRain = visible && state.weather.rain_weeks.includes(w);
    const isFrost = visible && state.weather.frost_week !== null && w >= state.weather.frost_week;
    const isHot = visible && state.weather.hot_weeks.includes(w);

    header.classList.toggle('rain-week', isRain);
    header.classList.toggle('frost-week', isFrost);
    header.classList.toggle('hot-week', isHot);
    header.classList.toggle('week-full', isFull);
    header.setAttribute('aria-label', desc);
    header.title = desc;
  }
}

/**
 * Update task label cells (selected/assigned state, window display)
 * @param {import('../state.js').GameState} state
 */
function updateTaskLabels(state) {
  if (!gridContainer) return;

  for (const task of TASKS) {
    const labelEl = gridContainer.querySelector(`.grid-task-label[data-task-id="${task.id}"]`);
    if (!labelEl) continue;

    const assignment = getAssignment(state, task.id);
    const isSelected = state.selected_task_id === task.id;
    const isAssigned = !!assignment;

    labelEl.classList.toggle('selected', isSelected);
    labelEl.classList.toggle('assigned', isAssigned);

    // Update cost badge — show prestige-modified cost if applicable
    const costBadge = labelEl.querySelector('.task-cost-badge');
    if (costBadge) {
      const effectiveCost = (state.prestige_bonus === 'cheap_micelij' && task.id === 'micelij')
        ? 1 : task.group_cost;
      const costChanged = effectiveCost !== task.group_cost;
      costBadge.textContent = `${effectiveCost}👷`;
      costBadge.classList.toggle('cost-reduced', costChanged);
      costBadge.title = costChanged
        ? `Prestiž: smanjeno s ${task.group_cost} na ${effectiveCost}`
        : `Radne grupe: ${effectiveCost}`;
    }
  }
}

/**
 * Update all grid body cells
 * @param {import('../state.js').GameState} state
 */
function updateAllCells(state) {
  if (!gridContainer) return;

  // Pre-compute valid weeks for selected task (for efficient cell highlighting)
  let validWeeks = null;
  if (state.selected_task_id && state.weather) {
    validWeeks = getValidWeeksForTask(state, state.selected_task_id);
  }

  for (const task of TASKS) {
    const assignment = getAssignment(state, task.id);
    const effectiveWindow = state.weather
      ? getEffectiveWindow(task, state.weather)
      : { start: task.window_start, end: task.window_end };

    for (let w = 1; w <= WEEKS; w++) {
      const cell = gridContainer.querySelector(
        `.grid-cell[data-task-id="${task.id}"][data-week="${w}"]`
      );
      if (!cell) continue;

      updateCell(cell, task, w, assignment, effectiveWindow, validWeeks, state);
    }
  }
}

/**
 * Update a single grid cell
 * @param {HTMLElement} cell
 * @param {import('../content/tasks.js').Task} task
 * @param {number} week
 * @param {import('../state.js').Assignment|null} assignment
 * @param {{ start: number, end: number }} effectiveWindow
 * @param {{ available: number[], out_of_window: number[], blocked: number[] }|null} validWeeks
 * @param {import('../state.js').GameState} state
 */
function updateCell(cell, task, week, assignment, effectiveWindow, validWeeks, state) {
  const isAssignedHere = assignment && assignment.week === week;
  const inWindow = week >= effectiveWindow.start && week <= effectiveWindow.end;
  const isRainBlocked = state.weather ? isBlockedByRain(task, week, state.weather) : false;
  const weekUsage = state.weather ? getWeekGroupUsage(state, week) : 0;
  const atCapacity = weekUsage >= state.groups_per_week;

  const isSelected = state.selected_task_id === task.id;
  const isErrorCell = state.error_cell?.taskId === task.id && state.error_cell?.week === week;

  // Build class list
  const classes = ['grid-cell'];

  if (isAssignedHere) {
    classes.push('assigned');
    if (inWindow) classes.push('in-window');
    else classes.push('out-window');
  } else {
    if (inWindow && !isRainBlocked) classes.push('in-window');
    else if (!inWindow) classes.push('out-window');
    if (isRainBlocked) classes.push('rain-blocked');

    // Highlighting for selected task
    if (isSelected && validWeeks) {
      if (validWeeks.available.includes(week)) {
        classes.push('highlight-available');
      } else if (validWeeks.out_of_window.includes(week)) {
        classes.push('highlight-out');
      } else if (isRainBlocked) {
        classes.push('highlight-blocked');
      } else if (atCapacity) {
        classes.push('highlight-full');
      }
    }
  }

  if (isErrorCell) classes.push('error-shake');

  cell.className = classes.join(' ');

  // Cell content
  updateCellContent(cell, task, week, isAssignedHere, isRainBlocked, isSelected, state);

  // Accessibility
  const desc = buildCellAriaLabel(task, week, isAssignedHere, inWindow, isRainBlocked, state);
  cell.setAttribute('aria-label', desc);
  cell.title = buildCellTooltip(task, week, isAssignedHere, inWindow, isRainBlocked, isSelected, state);
}

/**
 * Update cell inner content
 * @param {HTMLElement} cell
 * @param {import('../content/tasks.js').Task} task
 * @param {number} week
 * @param {boolean} isAssignedHere
 * @param {boolean} isRainBlocked
 * @param {boolean} isSelected
 * @param {import('../state.js').GameState} state
 */
function updateCellContent(cell, task, week, isAssignedHere, isRainBlocked, isSelected, state) {
  if (isAssignedHere) {
    cell.innerHTML = `<span class="cell-task-emoji">${task.emoji}</span>`;
    return;
  }

  if (isRainBlocked && isSelected) {
    cell.innerHTML = `<span class="cell-blocked-icon">🌧️</span>`;
    return;
  }

  if (isSelected && state.weather) {
    // Show score preview on hover via title only — keep cell clean
    cell.innerHTML = '';
    return;
  }

  cell.innerHTML = '';
}

/**
 * Build aria-label string for a cell
 * @param {import('../content/tasks.js').Task} task
 * @param {number} week
 * @param {boolean} isAssignedHere
 * @param {boolean} inWindow
 * @param {boolean} isRainBlocked
 * @param {import('../state.js').GameState} state
 * @returns {string}
 */
function buildCellAriaLabel(task, week, isAssignedHere, inWindow, isRainBlocked, state) {
  if (isAssignedHere) return `${task.name} — dodeljen N${week}. Tap za uklanjanje.`;
  if (isRainBlocked) return `${task.name} N${week} — blokiran kišom`;
  if (inWindow) return `${task.name} N${week} — dostupno (u prozoru)`;
  return `${task.name} N${week} — van prozora (×0.6 poena)`;
}

/**
 * Build tooltip string for a cell
 * @param {import('../content/tasks.js').Task} task
 * @param {number} week
 * @param {boolean} isAssignedHere
 * @param {boolean} inWindow
 * @param {boolean} isRainBlocked
 * @param {boolean} isSelected
 * @param {import('../state.js').GameState} state
 * @returns {string}
 */
function buildCellTooltip(task, week, isAssignedHere, inWindow, isRainBlocked, isSelected, state) {
  if (isAssignedHere) {
    if (state.weather) {
      const preview = previewTaskScore(task.id, week, state);
      return `${task.name} — N${week} ${inWindow ? '✓' : '⚠️'} ${preview.note}. Tap za uklanjanje.`;
    }
    return `${task.name} — N${week}. Tap za uklanjanje.`;
  }

  if (isRainBlocked) {
    return `🌧️ Kiša blokira "${task.name}" u N${week}`;
  }

  if (isSelected && state.weather) {
    const preview = previewTaskScore(task.id, week, state);
    return `N${week}: ${preview.note}`;
  }

  if (inWindow) {
    return `N${week} — u optimalnom prozoru za ${task.name}`;
  }

  return `N${week} — van prozora (penalty ×0.6)`;
}

// ─── Animations ────────────────────────────────────────────────────────────────

/**
 * Trigger shake animation on a specific error cell
 * @param {string} taskId
 * @param {number} week
 */
export function triggerCellError(taskId, week) {
  if (!gridContainer) return;
  const cell = gridContainer.querySelector(
    `.grid-cell[data-task-id="${taskId}"][data-week="${week}"]`
  );
  if (!cell) return;
  cell.classList.remove('error-shake');
  void cell.offsetWidth; // Force reflow to restart animation
  cell.classList.add('error-shake');
  setTimeout(() => cell.classList.remove('error-shake'), 500);
}

/**
 * Flash a brief "confirmed" animation on an assigned cell
 * @param {string} taskId
 * @param {number} week
 */
export function triggerCellAssigned(taskId, week) {
  if (!gridContainer) return;
  const cell = gridContainer.querySelector(
    `.grid-cell[data-task-id="${taskId}"][data-week="${week}"]`
  );
  if (!cell) return;
  cell.classList.add('assign-flash');
  setTimeout(() => cell.classList.remove('assign-flash'), 400);
}

// ─── Navigation ────────────────────────────────────────────────────────────────

/**
 * Scroll grid so that a specific week column is visible
 * @param {number} week
 */
export function scrollToWeek(week) {
  if (!gridContainer) return;
  const header = gridContainer.querySelector(`.grid-week-header[data-week="${week}"]`);
  if (header) {
    header.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/**
 * Scroll grid to show an assigned task cell
 * @param {string} taskId
 * @param {number} week
 */
export function scrollToCell(taskId, week) {
  if (!gridContainer) return;
  const cell = gridContainer.querySelector(
    `.grid-cell[data-task-id="${taskId}"][data-week="${week}"]`
  );
  if (cell) {
    cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/**
 * Get grid state as a simple matrix for debugging
 * @param {import('../state.js').GameState} state
 * @returns {string[][]} 6 rows × 12 cols, values: 'assigned'|'in-win'|'out-win'|'blocked'|'empty'
 */
export function getGridMatrix(state) {
  return TASKS.map((task) => {
    const assignment = getAssignment(state, task.id);
    return Array.from({ length: WEEKS }, (_, i) => {
      const week = i + 1;
      if (assignment && assignment.week === week) return 'assigned';
      if (!state.weather) return 'empty';
      const { start, end } = getEffectiveWindow(task, state.weather);
      if (isBlockedByRain(task, week, state.weather)) return 'blocked';
      if (week >= start && week <= end) return 'in-win';
      return 'out-win';
    });
  });
}
