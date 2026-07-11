import { formatDin } from '../economy/market.js';
import { PHASE_LABELS } from '../systems/phases.js';
import { formatSeasonTimer } from '../systems/seasons.js';

let lastCapital = 0;
let trendTimer = 0;

/** Update the persistent HUD bar */
export function updateHUD(state) {
  // Capital
  const capEl = document.getElementById('capital-amount');
  const trendEl = document.getElementById('capital-trend');
  if (capEl) {
    capEl.textContent = formatDin(state.capital).replace(' din', '');
  }
  if (trendEl) {
    const diff = state.capital - lastCapital;
    if (Math.abs(diff) > 10) {
      trendEl.textContent = diff > 0 ? '▲' : '▼';
      trendEl.className = diff > 0 ? 'trend-up' : 'trend-down';
      lastCapital = state.capital;
    }
  }

  // Phase
  const phaseBadge = document.getElementById('phase-badge');
  if (phaseBadge) {
    phaseBadge.textContent = state.phase;
    phaseBadge.className = `phase-badge phase-${state.phase.toLowerCase()}`;
    phaseBadge.title = PHASE_LABELS[state.phase] || '';
  }

  // Season
  const seasonEl = document.getElementById('season-num');
  const timerEl = document.getElementById('season-timer');
  if (seasonEl) seasonEl.textContent = state.season;
  if (timerEl) {
    timerEl.textContent = formatSeasonTimer(state.seasonTimer);
    // Pulse warning when < 15s
    if (state.seasonTimer < 15) {
      timerEl.classList.add('season-timer-warning');
    } else {
      timerEl.classList.remove('season-timer-warning');
    }
  }

  // Daily actions
  const actionsEl = document.getElementById('actions-display');
  if (actionsEl) {
    const total = state.workers.dailyActionsTotal;
    const used = state.workers.dailyActionsUsed;
    actionsEl.textContent = `${total - used}/${total}`;
    actionsEl.className = (total - used) === 0 ? 'actions-depleted' : '';
  }

  // Reputation
  const repEl = document.getElementById('rep-display');
  if (repEl) repEl.textContent = state.reputation.toFixed(2) + '×';

  // Active event indicator
  const hudBar = document.getElementById('hud-bar');
  if (hudBar) {
    if (state.activeEvent) {
      hudBar.classList.add('hud-event-active');
    } else {
      hudBar.classList.remove('hud-event-active');
    }
  }
}
