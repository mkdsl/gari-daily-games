/**
 * @module ui
 * HUD and tooltip orchestrator. Syncs game state → UI display.
 *
 * This module coordinates UI elements that live OUTSIDE of the specialized
 * screen components (score-screen, prestige-screen, tutorial). It manages:
 *   - Tooltip display and positioning
 *   - Inline warning messages near cards
 *   - Intro message (Brana's welcome text at game start)
 *   - Ecosystem status indicator
 *   - Loading states
 *   - Weather info panel
 *   - Accessibility announcements
 */

import { TASK_INFO } from './content/brana_dialogs.js';
import { TASKS } from './content/tasks.js';
import { getActiveBonusInfo } from './systems/prestige.js';
import { checkEcosystemBonusStatus } from './systems/scoring.js';
import { renderHUD, renderForecastBar } from './render.js';
import { getWeatherEffectOnTask, getEffectiveWindow } from './systems/weather.js';

// ─── Module State ──────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let tooltipEl = null;
/** @type {HTMLElement|null} */
let ecoStatusEl = null;
/** @type {HTMLElement|null} */
let ariaLiveEl = null;

/** Currently shown tooltip task ID (to avoid re-rendering same tooltip) */
let _activeTooltipId = null;

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize shared UI components.
 * Should be called once after DOMContentLoaded.
 */
export function initUI() {
  // Tooltip element (absolutely positioned)
  tooltipEl = document.getElementById('tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'tooltip';
    tooltipEl.className = 'tooltip';
    tooltipEl.hidden = true;
    tooltipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltipEl);
  }

  // Eco status badge
  ecoStatusEl = document.getElementById('eco-status');
  if (!ecoStatusEl) {
    ecoStatusEl = document.createElement('div');
    ecoStatusEl.id = 'eco-status';
    ecoStatusEl.className = 'eco-status eco-none';
    document.body.appendChild(ecoStatusEl);
  }

  // ARIA live region for screen reader announcements
  ariaLiveEl = document.getElementById('aria-live');
  if (!ariaLiveEl) {
    ariaLiveEl = document.createElement('div');
    ariaLiveEl.id = 'aria-live';
    ariaLiveEl.setAttribute('aria-live', 'polite');
    ariaLiveEl.setAttribute('aria-atomic', 'true');
    ariaLiveEl.className = 'sr-only';
    document.body.appendChild(ariaLiveEl);
  }

  // Close tooltip on outside click
  document.addEventListener('click', (e) => {
    if (tooltipEl && !tooltipEl.contains(e.target) && !e.target.closest('.card-info-btn')) {
      hideTooltip();
    }
  });

  // Close tooltip on Escape; shake score/bura overlay if it's visible
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tooltipEl && !tooltipEl.hidden) {
      hideTooltip();
    } else if (e.key === 'Escape') {
      const overlayEl = document.getElementById('overlay');
      if (overlayEl && !overlayEl.hidden) {
        e.preventDefault();
        announce('Igra je završena. Pritisnite R za restart ili osvežite stranicu.');
        shakeOverlay(overlayEl);
      }
    }
  });
}

/**
 * Briefly shake an overlay element to give keyboard feedback.
 * Adds `.overlay-shake` CSS class for 400 ms, then removes it.
 * @param {HTMLElement} el
 */
function shakeOverlay(el) {
  el.classList.remove('overlay-shake'); // reset if already animating
  // Force reflow so removing+re-adding the class restarts the animation
  void el.offsetWidth;
  el.classList.add('overlay-shake');
  setTimeout(() => el.classList.remove('overlay-shake'), 400);
}

// ─── HUD Update ───────────────────────────────────────────────────────────────

/**
 * Full UI sync: update HUD, forecast bar, and eco status from state.
 * @param {import('./state.js').GameState} state
 */
export function updateHUD(state) {
  renderHUD(state);
  renderForecastBar(state);
  updateEcoStatus(state);
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

/**
 * Show task info tooltip near an anchor element.
 * @param {string} taskId
 * @param {DOMRect|null} anchorRect - bounding rect of anchor element, or null to center
 * @param {import('./state.js').GameState|null} [state] - for weather effect display
 */
export function showTaskTooltip(taskId, anchorRect, state = null) {
  if (!tooltipEl) return;

  const info = TASK_INFO[taskId];
  const task = TASKS.find((t) => t.id === taskId);
  if (!info || !task) return;

  // Don't re-render same tooltip
  if (_activeTooltipId === taskId && !tooltipEl.hidden) return;
  _activeTooltipId = taskId;

  // Weather effect on this task
  const weatherEffect = state?.weather ? getWeatherEffectOnTask(task, state.weather) : null;
  const effectiveWindow = state?.weather ? getEffectiveWindow(task, state.weather) : null;
  const windowChanged = effectiveWindow &&
    (effectiveWindow.start !== task.window_start || effectiveWindow.end !== task.window_end);

  tooltipEl.innerHTML = `
    <div class="tooltip-header">
      <span class="tooltip-emoji">${task.emoji}</span>
      <strong class="tooltip-title">${info.title || task.name}</strong>
      <button class="tooltip-close" aria-label="Zatvori tooltip">✕</button>
    </div>
    <p class="tooltip-body">${info.body}</p>
    ${weatherEffect ? `<p class="tooltip-weather-effect">${weatherEffect}</p>` : ''}
    ${windowChanged ? `
      <p class="tooltip-window-note">
        📅 Prozor promenjen: N${effectiveWindow.start}–N${effectiveWindow.end}
        (standard: N${task.window_start}–N${task.window_end})
      </p>` : ''}
    <p class="tooltip-tip">💡 ${info.tip}</p>
    <div class="tooltip-stats">
      <span>👷 ${task.group_cost} ${task.group_cost === 1 ? 'grupa' : 'grupe'}</span>
      <span>⭐ ${task.base_score} base</span>
      ${task.blocked_by_rain ? '<span>🌧️ Blokira se kišom</span>' : ''}
    </div>
  `;

  tooltipEl.hidden = false;

  tooltipEl.querySelector('.tooltip-close')?.addEventListener('click', () => {
    hideTooltip();
  });

  // Position
  if (anchorRect) {
    positionTooltip(anchorRect);
  } else {
    // Center on screen
    tooltipEl.style.top = '50%';
    tooltipEl.style.left = '50%';
    tooltipEl.style.transform = 'translate(-50%, -50%)';
  }

  // Announce to screen readers
  announce(`Info o zadatku ${task.name}: ${info.body}`);
}

/**
 * Position the tooltip near an anchor rect, keeping it in viewport.
 * @param {DOMRect} anchorRect
 */
function positionTooltip(anchorRect) {
  if (!tooltipEl) return;

  // Reset transform to measure naturally
  tooltipEl.style.transform = '';

  const margin = 8;
  const ttRect = tooltipEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try below anchor first
  let top = anchorRect.bottom + margin;
  let left = anchorRect.left;

  // Clamp horizontal
  if (left + ttRect.width > vw - margin) {
    left = vw - ttRect.width - margin;
  }
  if (left < margin) left = margin;

  // If tooltip goes below viewport, show above anchor
  if (top + ttRect.height > vh - margin) {
    top = anchorRect.top - ttRect.height - margin;
  }
  if (top < margin) top = margin;

  tooltipEl.style.top = `${top}px`;
  tooltipEl.style.left = `${left}px`;
}

/**
 * Hide the tooltip.
 */
export function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.hidden = true;
    _activeTooltipId = null;
  }
}

/**
 * Check if the tooltip is currently visible.
 * @returns {boolean}
 */
export function isTooltipVisible() {
  return !!(tooltipEl && !tooltipEl.hidden);
}

// ─── Inline Warnings ──────────────────────────────────────────────────────────

/**
 * Show a contextual warning message near a DOM element (e.g. near a card).
 * Removes itself after 3 seconds.
 * @param {string} message
 * @param {Element} anchorEl
 */
export function showWarningNear(message, anchorEl) {
  if (!anchorEl) return;

  // Remove existing warning on this anchor
  anchorEl.querySelectorAll('.inline-warning').forEach((w) => w.remove());

  const warn = document.createElement('div');
  warn.className = 'inline-warning';
  warn.setAttribute('role', 'alert');
  warn.textContent = message;
  anchorEl.appendChild(warn);

  setTimeout(() => {
    warn.style.opacity = '0';
    setTimeout(() => warn.remove(), 300);
  }, 2700);
}

// ─── Eco Status ───────────────────────────────────────────────────────────────

/**
 * Update the ecosystem bonus status indicator element.
 * @param {import('./state.js').GameState} state
 */
export function updateEcoStatus(state) {
  if (!ecoStatusEl || !state.weather) return;

  const { achievable, missing, all_assigned } = checkEcosystemBonusStatus(state);

  if (achievable) {
    ecoStatusEl.className = 'eco-status eco-achieved';
    ecoStatusEl.innerHTML = '🌿 Ekosistem bonus!';
    ecoStatusEl.title = '×1.5 poena za Micelij, Jezero i Kompost!';
  } else if (!all_assigned && missing.length < 3) {
    const assigned = 3 - missing.length;
    ecoStatusEl.className = 'eco-status eco-partial';
    ecoStatusEl.innerHTML = `🌿 Ekosistem: ${assigned}/3`;
    ecoStatusEl.title = `Još van prozora: ${missing.join(', ')}`;
  } else {
    ecoStatusEl.className = 'eco-status eco-none';
    ecoStatusEl.innerHTML = '🌿 Micelij + Jezero + Kompost = +50%';
    ecoStatusEl.title = 'Postavi sva tri u optimalnom prozoru za Ekosistem bonus';
  }
}

// ─── Intro Message ────────────────────────────────────────────────────────────

/**
 * Show Brana's intro message at game start.
 * Auto-dismisses after 5 seconds, or can be closed manually.
 * @param {string} weatherComment - Brana's comment on the weather
 * @param {import('./state.js').GameState} state
 */
export function showIntroMessage(weatherComment, state) {
  const bonusInfo = getActiveBonusInfo(state.prestige_bonus);

  // Remove existing intro if any
  document.getElementById('intro-message')?.remove();

  const intro = document.createElement('div');
  intro.id = 'intro-message';
  intro.className = 'intro-message';
  intro.setAttribute('role', 'status');
  intro.setAttribute('aria-label', 'Brana kaže');
  intro.innerHTML = `
    <span class="intro-brana" aria-hidden="true">🧑‍🌾</span>
    <div class="intro-text">
      <p class="intro-weather">${weatherComment}</p>
      ${bonusInfo ? `
        <p class="intro-bonus">
          ${bonusInfo.emoji} Aktivan bonus: <strong>${bonusInfo.label}</strong>
        </p>
      ` : ''}
    </div>
    <button class="intro-dismiss" aria-label="Zatvori poruku">✕</button>
  `;

  const app = document.getElementById('app') ?? document.body;
  app.prepend(intro);

  const dismiss = () => {
    intro.style.opacity = '0';
    setTimeout(() => intro.remove(), 300);
  };

  intro.querySelector('.intro-dismiss')?.addEventListener('click', dismiss);
  setTimeout(dismiss, 5000);
}

// ─── Loading State ────────────────────────────────────────────────────────────

/**
 * Show or hide a full-screen loading indicator.
 * @param {boolean} visible
 * @param {string} [message]
 */
export function setLoadingState(visible, message = 'Učitavanje...') {
  let loader = document.getElementById('loader');
  if (visible) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'loader';
      loader.className = 'loader';
      loader.setAttribute('role', 'status');
      loader.setAttribute('aria-live', 'polite');
      document.body.appendChild(loader);
    }
    loader.textContent = message;
    loader.hidden = false;
  } else {
    if (loader) loader.hidden = true;
  }
}

// ─── Accessibility ────────────────────────────────────────────────────────────

/**
 * Announce a message to screen readers via ARIA live region.
 * @param {string} message
 */
export function announce(message) {
  if (!ariaLiveEl) return;
  // Clear first to ensure re-announcement of same message
  ariaLiveEl.textContent = '';
  setTimeout(() => {
    if (ariaLiveEl) ariaLiveEl.textContent = message;
  }, 50);
}

/**
 * Show a weather info panel for a specific task.
 * Used when weather modifies a task's window.
 * @param {string} taskId
 * @param {import('./state.js').GameState} state
 * @param {DOMRect} anchorRect
 */
export function showWeatherInfoPanel(taskId, state, anchorRect) {
  if (!state.weather) return;
  const task = TASKS.find((t) => t.id === taskId);
  if (!task) return;

  const effect = getWeatherEffectOnTask(task, state.weather);
  if (!effect) return;

  showWarningNear(effect, document.querySelector(`.task-card[data-task-id="${taskId}"]`));
}
