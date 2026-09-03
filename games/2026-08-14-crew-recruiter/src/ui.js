// ui.js — HUD updates, phase indicator, resolve breakdown, action area, toasts

import { PHASE_DISPLAY_NAMES, TOTAL_ROUNDS, PHASE_NARRATIVE } from './config.js';
import { getContextualAforizam } from './content/aforizmi.js';

/**
 * Update phase label and round counter in HUD.
 * @param {number} phaseIndex
 * @param {string} phaseName
 */
export function updatePhaseHUD(phaseIndex, phaseName) {
  const el = document.getElementById('phase-indicator');
  if (!el) return;
  el.innerHTML = `
    <span class="phase-name">${PHASE_DISPLAY_NAMES[phaseName] || phaseName}</span>
    <span class="round-counter">Faza ${phaseIndex + 1} / ${TOTAL_ROUNDS}</span>
  `;
}

/**
 * Set the action button label / enabled state.
 * @param {string} label
 * @param {boolean} enabled
 * @param {string} btnId
 */
export function setActionButton(label, enabled, btnId = 'btn-action') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.textContent = label;
  btn.disabled    = !enabled;
  btn.classList.toggle('btn-disabled', !enabled);
}

/**
 * Render the action button area for a given game phase.
 * Adds contextual subtext below the button when args are provided.
 * @param {string} gamePhase - 'draw'|'assign'|'resolve'
 * @param {() => void} onDraw
 * @param {() => void} onResolve
 * @param {number} [handCount] - number of cards in hand (for draw-phase subtext)
 * @param {number} [slotsFilledCount] - slots currently filled (for assign-phase subtext)
 */
export function renderActionArea(gamePhase, onDraw, onResolve, handCount = 0, slotsFilledCount = 0) {
  const area = document.getElementById('action-btn-area');
  if (!area) return;
  area.innerHTML = '';

  if (gamePhase === 'draw') {
    const btn = document.createElement('button');
    btn.id        = 'btn-action';
    btn.className = 'btn btn-primary';
    btn.textContent = 'Vuci karte';
    btn.addEventListener('click', onDraw);
    area.appendChild(btn);

    if (handCount > 0) {
      const sub = document.createElement('p');
      sub.className   = 'action-subtext';
      sub.textContent = `Biraj gde svrstati ${handCount} ${handCount === 1 ? 'člana ekipe' : 'članova ekipe'}`;
      area.appendChild(sub);
    }

  } else if (gamePhase === 'assign') {
    const btn = document.createElement('button');
    btn.id        = 'btn-action';
    btn.className = 'btn btn-primary';
    btn.textContent = 'Reši rundu';
    btn.addEventListener('click', onResolve);
    area.appendChild(btn);

    const sub = document.createElement('p');
    sub.className = 'action-subtext';
    sub.textContent = `${slotsFilledCount}/5 slotova popunjeno`;

    if (slotsFilledCount < 3) {
      const hint = document.createElement('span');
      hint.className   = 'action-hint';
      hint.textContent = ' — popuni više za bolji score';
      sub.appendChild(hint);
    }
    area.appendChild(sub);
  }
}

/**
 * Build a single breakdown row element.
 * @param {string} icon
 * @param {string} label
 * @param {string} value
 * @param {string} [valClass]
 * @returns {HTMLElement}
 */
function buildBreakdownRow(icon, label, value, valClass = '') {
  const row = document.createElement('div');
  row.className = 'breakdown-row';
  row.innerHTML = `
    <span class="breakdown-icon" aria-hidden="true">${icon}</span>
    <span class="breakdown-label">${label}</span>
    <span class="breakdown-val${valClass ? ' ' + valClass : ''}">${value}</span>
  `;
  return row;
}

/**
 * Show resolve overlay with icon-based breakdown list.
 * Overlay gets role="dialog" and auto-focus for accessibility.
 * @param {import('./systems/resolution.js').RoundResult} result
 */
export function showResolveBreakdown(result) {
  const overlay = document.getElementById('resolve-overlay');
  if (!overlay) return;

  const deltaSign  = result.roundDelta >= 0 ? '+' : '';
  const deltaClass = result.roundDelta >= 0 ? 'delta-positive' : 'delta-negative';

  const box = document.createElement('div');
  box.className  = 'resolve-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Rezultat runde');
  box.setAttribute('tabindex', '-1');

  const list = document.createElement('div');
  list.className = 'breakdown-list';

  // Always show power
  list.appendChild(buildBreakdownRow('⚡', 'Power:', `+${result.weightedPower}`, 'breakdown-neutral'));

  // Conditional rows
  if (result.synergyBonus > 0) {
    list.appendChild(buildBreakdownRow('🔗', 'Sinergija:', `+${result.synergyBonus}`, 'breakdown-positive'));
  }
  if (result.emptyPenalty > 0) {
    list.appendChild(buildBreakdownRow('⬜', 'Prazni slotovi:', `-${result.emptyPenalty}`, 'breakdown-negative'));
  }
  if (result.impatiencePenalty > 0) {
    list.appendChild(buildBreakdownRow('😠', 'Nestrpljenje:', `-${result.impatiencePenalty}`, 'breakdown-negative'));
  }
  if (result.churnPenalty > 0) {
    list.appendChild(buildBreakdownRow('🔄', 'Zamene:', `-${result.churnPenalty}`, 'breakdown-negative'));
  }

  const divider = document.createElement('div');
  divider.className = 'breakdown-divider';

  const delta = document.createElement('div');
  delta.className   = `resolve-delta ${deltaClass}`;
  delta.textContent = `${deltaSign}${result.roundDelta} Vibe`;

  box.appendChild(list);
  box.appendChild(divider);
  box.appendChild(delta);

  overlay.innerHTML = '';
  overlay.appendChild(box);
  overlay.classList.remove('hidden');

  // Auto-focus for screen readers and keyboard nav
  requestAnimationFrame(() => box.focus());
}

/** Hide resolve overlay. */
export function hideResolveOverlay() {
  const overlay = document.getElementById('resolve-overlay');
  if (overlay) overlay.classList.add('hidden');
}

/**
 * Show a phase narrative overlay for 2.5s at phase transition.
 * Uses resolve-overlay element; does not block gameplay.
 * @param {number} phaseIndex
 */
export function showPhaseNarrative(phaseIndex) {
  const sentence = PHASE_NARRATIVE[phaseIndex];
  if (!sentence) return;
  const overlay = document.getElementById('resolve-overlay');
  if (!overlay) return;

  const box = document.createElement('div');
  box.className = 'phase-narrative-box';
  box.innerHTML = `<p class="phase-narrative-text">${sentence}</p>`;

  overlay.innerHTML = '';
  overlay.appendChild(box);
  overlay.classList.remove('hidden');

  setTimeout(() => overlay.classList.add('hidden'), 2500);
}

/**
 * Show an aforism overlay flash.
 * Auto-hides after 2.5 seconds.
 * @param {string} [text]
 * @param {'synergy'|'crisis'|'finale'} [context]
 * @param {number} [vibeScore]
 */
export function showAforizam(text, context, vibeScore) {
  const msg     = text || getContextualAforizam(context, vibeScore);
  const overlay = document.getElementById('resolve-overlay');
  if (!overlay) return;

  const box = document.createElement('div');
  box.className = 'aforizam-box';
  box.innerHTML = `<p class="aforizam-text">"${msg}"</p>`;

  overlay.innerHTML = '';
  overlay.appendChild(box);
  overlay.classList.remove('hidden');

  setTimeout(() => overlay.classList.add('hidden'), 2500);
}

/**
 * Show global toast notification.
 * @param {string} msg
 * @param {number} [ms]
 */
export function showToast(msg, ms = 2000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('toast-visible');
  setTimeout(() => {
    t.classList.remove('toast-visible');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, ms);
}
