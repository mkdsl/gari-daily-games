/** @fileoverview Volunteer assignment grid: click-to-assign, stat bars, compatibility hints */

import { getState, setState } from '../state.js';
import { CONFIG } from '../config.js';
import { VOLUNTEER_TYPES, getTaskEffectiveness, getEffectivenessLabel } from '../entities/volunteer.js';
import { getAssignmentSummary, suggestTask } from '../systems/micro.js';
import { showHUDToast } from './hud.js';

/** @type {string|null} */
let _selectedVolunteerId = null;
/** @type {Function|null} */
let _onConfirmMicro = null;

/**
 * Render Micro screen
 * @param {HTMLElement} container
 * @param {Function} onConfirmMicro - called with assignments object
 */
export function renderMicro(container, onConfirmMicro) {
  _onConfirmMicro = onConfirmMicro;
  _selectedVolunteerId = null;

  const state = getState();
  container.innerHTML = buildMicroHTML(state);
  bindMicroEvents(container, state);
}

function buildMicroHTML(state) {
  const { volunteers, volunteerAssignments } = state;

  if (!volunteers || volunteers.length === 0) {
    return `
      <div class="screen-header">
        <h2>Nedelja ${state.week} — Raspoređivanje Volontera</h2>
        <p class="screen-subtitle">Ana se priključuje sledeće nedelje!</p>
      </div>
      <div class="micro-empty">
        <div class="empty-icon">👥</div>
        <p>Nema volontera ove nedelje.</p>
        <p>Investiraj u Zajednicu da privučeš tim.</p>
        <button class="btn-primary" id="btn-skip-micro">Preskoči ovu fazu →</button>
      </div>
    `;
  }

  const taskIds = Object.keys(CONFIG.TASKS).filter(t => t !== 'hrana_r' && t !== 'rest');

  const volunteersHTML = volunteers.map(v => {
    const assigned = volunteerAssignments?.[v.id];
    const isSelected = v.id === _selectedVolunteerId;
    return buildVolunteerCard(v, assigned, isSelected);
  }).join('');

  const taskPanelHTML = buildTaskPanel(taskIds);
  const summaryHTML = buildAssignmentSummary(volunteers, volunteerAssignments || {});

  return `
    <div class="screen-header">
      <h2>Nedelja ${state.week} — Raspoređivanje Volontera</h2>
      <p class="screen-subtitle">Klikni volontera, zatim zadatak.</p>
    </div>

    <div class="micro-layout">
      <div class="micro-volunteers">
        <h3>👥 Volonteri (${volunteers.length})</h3>
        <div class="volunteers-grid" id="volunteers-grid">
          ${volunteersHTML}
        </div>
      </div>

      <div class="micro-tasks">
        <h3>⚒️ Zadaci</h3>
        ${_selectedVolunteerId ? buildCompatibilityRow(state) : '<div class="task-hint">← Izaberi volontera</div>'}
        <div class="tasks-grid" id="tasks-grid">
          ${taskPanelHTML}
        </div>
        <div class="recovery-options">
          <h4>🔋 Oporavak</h4>
          <button class="task-btn task-rest" data-task="rest">
            😴 Odmor <span class="task-eff">(+40 Energija)</span>
          </button>
          <button class="task-btn task-food" data-task="hrana_r">
            🍲 Hrana <span class="task-eff">(+50 Glad, +Vibe)</span>
          </button>
        </div>
      </div>

      <div class="micro-right">
        <div class="assignment-summary panel">
          <h3>📋 Raspored</h3>
          <div id="assignment-summary">
            ${summaryHTML}
          </div>
        </div>
        <div class="actions-panel">
          <button class="btn-secondary" id="btn-auto-assign">🤖 Auto-rasporedi</button>
          <button class="btn-primary btn-large" id="btn-confirm-micro">
            ✅ Potvrdi → Rezultati
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildVolunteerCard(volunteer, assignedTask, isSelected) {
  const type = VOLUNTEER_TYPES[volunteer.typeId];
  const energyPct = volunteer.energija;
  const gladPct = volunteer.glad;
  const vibePct = volunteer.vibe;

  const energyColor = energyPct > 60 ? 'var(--c-fire)' : energyPct > 30 ? 'var(--c-gold)' : '#f44336';
  const gladColor = gladPct > 60 ? '#8bc34a' : gladPct > 30 ? 'var(--c-gold)' : '#f44336';
  const vibeColor = vibePct > 60 ? '#2196f3' : vibePct > 30 ? 'var(--c-gold)' : '#f44336';

  const assignedLabel = assignedTask
    ? (CONFIG.TASKS[assignedTask]?.emoji + ' ' + (CONFIG.TASKS[assignedTask]?.name || assignedTask))
    : '—';

  const exhausted = volunteer.energija < 20;

  return `
    <div class="volunteer-card ${isSelected ? 'vol-selected' : ''} ${exhausted ? 'vol-exhausted' : ''}"
         data-vol-id="${volunteer.id}" tabindex="0" role="button"
         aria-label="${volunteer.name}">
      <div class="vol-emoji">${volunteer.emoji || '👤'}</div>
      <div class="vol-info">
        <div class="vol-name">${volunteer.name}</div>
        <div class="vol-assigned">${assignedLabel}</div>
      </div>
      <div class="vol-stats">
        <div class="stat-bar-row" title="Energija: ${energyPct}%">
          ⚡<div class="stat-track"><div class="stat-fill" style="width:${energyPct}%;background:${energyColor}"></div></div>
        </div>
        <div class="stat-bar-row" title="Glad: ${gladPct}%">
          🍽️<div class="stat-track"><div class="stat-fill" style="width:${gladPct}%;background:${gladColor}"></div></div>
        </div>
        <div class="stat-bar-row" title="Vibe: ${vibePct}%">
          🎵<div class="stat-track"><div class="stat-fill" style="width:${vibePct}%;background:${vibeColor}"></div></div>
        </div>
      </div>
      ${exhausted ? '<div class="exhausted-badge">UMORAN</div>' : ''}
    </div>
  `;
}

function buildTaskPanel(taskIds) {
  return taskIds.map(taskId => {
    const task = CONFIG.TASKS[taskId];
    const state = getState();
    let effLabel = '';
    let effClass = '';
    if (_selectedVolunteerId) {
      const vol = state.volunteers.find(v => v.id === _selectedVolunteerId);
      if (vol) {
        const eff = getTaskEffectiveness(vol.typeId, taskId);
        const label = getEffectivenessLabel(eff);
        effLabel = label.label;
        effClass = label.className;
      }
    }

    return `
      <button class="task-btn ${effClass}" data-task="${taskId}"
              title="${task?.name || taskId}: ${CONFIG.TASKS[taskId]?.energyCost || 2} Energija">
        <span class="task-emoji">${task?.emoji || '⚒️'}</span>
        <span class="task-name">${task?.name || taskId}</span>
        ${effLabel ? `<span class="task-eff-badge eff-badge-${effClass}">${effLabel}</span>` : ''}
      </button>
    `;
  }).join('');
}

function buildCompatibilityRow(state) {
  const vol = state.volunteers.find(v => v.id === _selectedVolunteerId);
  if (!vol) return '';

  const taskIds = Object.keys(CONFIG.TASKS).filter(t => !CONFIG.TASKS[t].isRest && !CONFIG.TASKS[t].isRecovery);
  const best = suggestTask(vol, taskIds);

  return `
    <div class="compat-hint">
      <span class="compat-vol">${vol.emoji} ${vol.name}</span>
      <span class="compat-best">Preporučeno: ${CONFIG.TASKS[best]?.emoji} ${CONFIG.TASKS[best]?.name || best}</span>
    </div>
  `;
}

function buildAssignmentSummary(volunteers, assignments) {
  if (!volunteers.length) return '<p class="empty-summary">Nema volontera</p>';

  return volunteers.map(v => {
    const taskId = assignments[v.id];
    const task = CONFIG.TASKS[taskId];
    const eff = taskId ? getTaskEffectiveness(v.typeId, taskId) : null;
    const effLabel = eff ? getEffectivenessLabel(eff) : null;

    return `
      <div class="summary-row">
        <span>${v.emoji} ${v.name}</span>
        <span>
          ${task ? task.emoji + ' ' + task.name : '—'}
          ${effLabel ? `<span class="eff-mini ${effLabel.className}">${effLabel.label}</span>` : ''}
        </span>
      </div>
    `;
  }).join('');
}

function bindMicroEvents(container, state) {
  // Volunteer card click
  const volGrid = container.querySelector('#volunteers-grid');
  volGrid?.addEventListener('click', (e) => {
    const card = e.target.closest('.volunteer-card');
    if (!card) return;
    _selectedVolunteerId = card.dataset.volId;

    // Update selection UI
    volGrid.querySelectorAll('.volunteer-card').forEach(c =>
      c.classList.toggle('vol-selected', c.dataset.volId === _selectedVolunteerId)
    );

    // Re-render task panel with compatibility
    const taskSection = container.querySelector('.micro-tasks');
    if (taskSection) {
      const compatHintEl = taskSection.querySelector('.compat-hint, .task-hint');
      if (compatHintEl) {
        compatHintEl.outerHTML = buildCompatibilityRow(getState());
      }
      // Re-render tasks with eff badges
      const tasksGrid = container.querySelector('#tasks-grid');
      if (tasksGrid) {
        const taskIds = Object.keys(CONFIG.TASKS).filter(t => t !== 'hrana_r' && t !== 'rest');
        tasksGrid.innerHTML = buildTaskPanel(taskIds);
      }
    }
  });

  // Task button click
  container.addEventListener('click', (e) => {
    const taskBtn = e.target.closest('.task-btn');
    if (!taskBtn) return;
    if (!_selectedVolunteerId) {
      showHUDToast('Izaberi volontera prvo!', 'warning');
      return;
    }
    const taskId = taskBtn.dataset.task;
    onAssignTask(_selectedVolunteerId, taskId, container);
  });

  // Auto-assign
  container.querySelector('#btn-auto-assign')?.addEventListener('click', () => {
    autoAssignAll(container);
  });

  // Confirm
  container.querySelector('#btn-confirm-micro')?.addEventListener('click', () => {
    const s = getState();
    _onConfirmMicro?.(s.volunteerAssignments || {});
  });

  // Skip (no volunteers)
  container.querySelector('#btn-skip-micro')?.addEventListener('click', () => {
    _onConfirmMicro?.({});
  });
}

function onAssignTask(volId, taskId, container) {
  const state = getState();
  const assignments = { ...(state.volunteerAssignments || {}), [volId]: taskId };
  setState({ volunteerAssignments: assignments });

  // Update summary
  const summaryEl = container.querySelector('#assignment-summary');
  if (summaryEl) summaryEl.innerHTML = buildAssignmentSummary(state.volunteers, assignments);

  // Update volunteer card assigned label
  const volCard = container.querySelector(`[data-vol-id="${volId}"]`);
  if (volCard) {
    const task = CONFIG.TASKS[taskId];
    const assignedEl = volCard.querySelector('.vol-assigned');
    if (assignedEl) {
      assignedEl.textContent = task
        ? task.emoji + ' ' + task.name
        : '—';
    }
  }

  const task = CONFIG.TASKS[taskId];
  showHUDToast(`${task?.emoji || ''} ${task?.name || taskId} dodeljen`, 'info', 1200);

  // Auto-select next unassigned
  const nextUnassigned = state.volunteers.find(v =>
    !assignments[v.id] && v.id !== volId
  );
  if (nextUnassigned) {
    _selectedVolunteerId = nextUnassigned.id;
    const volGrid = container.querySelector('#volunteers-grid');
    volGrid?.querySelectorAll('.volunteer-card').forEach(c =>
      c.classList.toggle('vol-selected', c.dataset.volId === _selectedVolunteerId)
    );
  }
}

function autoAssignAll(container) {
  const state = getState();
  const taskIds = Object.keys(CONFIG.TASKS).filter(t => !CONFIG.TASKS[t].isRest && !CONFIG.TASKS[t].isRecovery);
  const assignments = {};

  for (const v of state.volunteers) {
    const best = suggestTask(v, taskIds);
    assignments[v.id] = best;
  }

  setState({ volunteerAssignments: assignments });

  // Re-render
  const volGrid = container.querySelector('#volunteers-grid');
  if (volGrid) {
    const s = getState();
    volGrid.innerHTML = s.volunteers.map(v =>
      buildVolunteerCard(v, assignments[v.id], false)
    ).join('');
  }

  const summaryEl = container.querySelector('#assignment-summary');
  if (summaryEl) summaryEl.innerHTML = buildAssignmentSummary(state.volunteers, assignments);

  showHUDToast('🤖 Auto-raspored primenjen', 'success');
}
