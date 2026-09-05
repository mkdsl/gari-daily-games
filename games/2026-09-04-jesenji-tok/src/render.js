/**
 * @module render
 * DOM render orchestrator for Jesenji Tok.
 * This is a pure DOM game — no canvas. Render reads state and delegates
 * to specialized UI components for grid, cards, HUD, and overlay management.
 *
 * Render is called:
 *   1. After every user input (card select, cell tap)
 *   2. On a low-frequency RAF loop for error-state decay (~10fps sufficient)
 *   3. After state changes from game systems
 *
 * Architecture: render() is intentionally thin — it reads state and passes
 * slices to specialized functions. No direct DOM manipulation here beyond
 * the toast/notification system.
 */

import { updateGrid } from './ui/grid.js';
import { updateCards } from './ui/cards.js';
import { tickErrorState } from './systems/conflict.js';
import { getForecastDisplayData, getWeatherSummary } from './systems/weather.js';
import { checkEcosystemBonusStatus } from './systems/scoring.js';
import { weekLabel } from './content/tasks.js';

// ─── Module State ──────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let hudEl = null;
/** @type {HTMLElement|null} */
let forecastBarEl = null;
/** @type {HTMLElement|null} */
let toastContainerEl = null;
/** @type {HTMLElement|null} */
let ecoStatusEl = null;

/** Track last rendered phase to avoid redundant full re-renders */
let lastRenderedPhase = null;
/** Track last error timestamp to avoid re-rendering same error */
let lastErrorTimestamp = 0;
/** Active toast ids to prevent duplicates */
const activeToastIds = new Set();

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize render system with root DOM elements
 * @param {Object} elements
 * @param {HTMLElement} elements.hud
 * @param {HTMLElement} elements.forecastBar
 */
export function initRender({ hud, forecastBar }) {
  hudEl = hud;
  forecastBarEl = forecastBar;

  // Toast container (fixed, above everything)
  toastContainerEl = document.getElementById('toast-container');
  if (!toastContainerEl) {
    toastContainerEl = document.createElement('div');
    toastContainerEl.id = 'toast-container';
    document.body.appendChild(toastContainerEl);
  }

  // Eco status badge
  ecoStatusEl = document.getElementById('eco-status');
  if (!ecoStatusEl) {
    ecoStatusEl = document.createElement('div');
    ecoStatusEl.id = 'eco-status';
    ecoStatusEl.className = 'eco-status eco-none';
    document.body.appendChild(ecoStatusEl);
  }
}

// ─── Full Render Pass ──────────────────────────────────────────────────────────

/**
 * Full render pass — called after state changes.
 * Delegates to specialized render functions.
 * @param {import('./state.js').GameState} state
 */
export function render(state) {
  if (state.phase !== 'planning') return;

  updateGrid(state);
  updateCards(state);
  renderForecastBar(state);
  renderHUD(state);
  renderEcoStatus(state);
  tickErrorState(state);
  renderErrorToast(state);
}

// ─── HUD ───────────────────────────────────────────────────────────────────────

/**
 * Render the HUD: progress, season info, close-season button, group usage
 * @param {import('./state.js').GameState} state
 */
export function renderHUD(state) {
  if (!hudEl) return;

  const assigned = state.assignments.length;
  const total = 6; // TASKS.length
  const progressPct = Math.round((assigned / total) * 100);

  const bestScore = getBestScoreDisplay();
  const bonusLabel = getBonusLabel(state.prestige_bonus);
  const groupInfo = getGroupUsageSummary(state);
  const allDone = assigned === total;

  hudEl.innerHTML = `
    <div class="hud-row hud-top">
      <div class="hud-left">
        <span class="hud-title">🍂 Jesenji Tok</span>
        <span class="hud-run">Sezona ${state.run_number + 1}</span>
        ${bonusLabel ? `<span class="hud-bonus">${bonusLabel}</span>` : ''}
      </div>
      <div class="hud-right">
        ${bestScore ? `<span class="hud-best">🏆 Rekord: ${bestScore}p</span>` : ''}
        <button class="hud-audio-btn" id="hud-audio-btn" title="Zvuk">🔊</button>
      </div>
    </div>
    <div class="hud-row hud-middle">
      <div class="hud-progress-wrap">
        <span class="hud-progress-label">${assigned}/${total} zadataka</span>
        <div class="hud-progress-bar-container" role="progressbar"
          aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100"
          aria-label="Progres rasporeda">
          <div class="hud-progress-bar" style="width:${progressPct}%"></div>
        </div>
        <span class="hud-progress-pct">${progressPct}%</span>
      </div>
    </div>
    <div class="hud-row hud-bottom">
      <div class="hud-group-info">${groupInfo}</div>
      <div class="hud-actions">
        ${assigned < total && assigned > 0
          ? `<span class="hud-hint">↓ ${total - assigned} zadataka čekaju</span>`
          : ''}
        ${allDone
          ? `<span class="hud-hint hud-hint-ready">✓ Svi raspoređeni!</span>`
          : ''}
        <button class="btn-close-season" id="btn-close-season"
          ${assigned === 0 ? 'disabled title="Dodaj bar jedan zadatak pre zatvaranja sezone"' : ''}
          aria-label="Zatvori sezonu i vidi rezultat">
          🌬️ Zatvori sezonu
        </button>
      </div>
    </div>
  `;

  // Close season handler
  hudEl.querySelector('#btn-close-season')?.addEventListener('click', () => {
    if (assigned > 0) {
      document.dispatchEvent(new CustomEvent('close-season'));
    }
  });

  // Audio toggle
  hudEl.querySelector('#hud-audio-btn')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('toggle-audio'));
  });
}

/**
 * Get group usage summary across all weeks (for HUD display)
 * @param {import('./state.js').GameState} state
 * @returns {string}
 */
function getGroupUsageSummary(state) {
  if (!state.weather) return '';
  const busy = [];
  for (let w = 1; w <= 12; w++) {
    const weekAssigns = state.assignments.filter((a) => a.week === w);
    if (weekAssigns.length > 0) {
      busy.push(`N${w}`);
    }
  }
  if (busy.length === 0) return 'Nema dodeljenih nedelja';
  return `Aktivne nedelje: ${busy.join(', ')}`;
}

/**
 * Get display label for active prestige bonus
 * @param {string|null} bonus
 * @returns {string}
 */
function getBonusLabel(bonus) {
  if (!bonus) return '';
  const labels = {
    extra_group: '👷+1 Grupa',
    cheap_micelij: '🍄 Popust',
    full_forecast: '🌤️ Puna prognoza',
  };
  return labels[bonus] ?? bonus;
}

/**
 * Get best score display string
 * @returns {string}
 */
function getBestScoreDisplay() {
  try {
    const val = localStorage.getItem('jt_best_score');
    return val && val !== '0' ? val : '';
  } catch (e) {
    return '';
  }
}

// ─── Forecast Bar ──────────────────────────────────────────────────────────────

/**
 * Render the forecast bar showing 12 weeks of weather
 * @param {import('./state.js').GameState} state
 */
export function renderForecastBar(state) {
  if (!forecastBarEl || !state.weather) return;

  const weather = state.weather;
  const summary = getWeatherSummary(weather);
  const forecastData = getForecastDisplayData(weather);

  // Count assigned weeks for the usage bar
  const weekUsage = {};
  for (let w = 1; w <= 12; w++) {
    weekUsage[w] = state.assignments.filter((a) => a.week === w).length;
  }

  forecastBarEl.innerHTML = `
    <div class="forecast-header">
      <div class="forecast-title-row">
        <span class="forecast-icon">${summary.emoji}</span>
        <span class="forecast-preset-name">${summary.name}</span>
        ${summary.warnings.length > 0
          ? `<span class="forecast-warning-count" title="${summary.warnings.join(' | ')}">⚠️ ${summary.warnings.length}</span>`
          : '<span class="forecast-clear">✓ Čisto</span>'}
      </div>
      ${summary.warnings.length > 0
        ? `<div class="forecast-warnings">${summary.warnings.map((w) => `<span class="fw">${w}</span>`).join('')}</div>`
        : ''}
    </div>
    <div class="forecast-weeks" role="list" aria-label="Nedeljne prognoze">
      ${forecastData.map((d) => `
        <div class="${d.classes.join(' ')}"
          data-week="${d.week}"
          role="listitem"
          title="${d.description}">
          <span class="forecast-emoji">${d.emoji}</span>
          <span class="forecast-label">${d.visible ? `N${d.week}` : '?'}</span>
          ${weekUsage[d.week] > 0
            ? `<span class="forecast-dot" title="${weekUsage[d.week]} rad(ova)">•</span>`
            : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Ecosystem Status ──────────────────────────────────────────────────────────

/**
 * Render the ecosystem bonus status indicator
 * @param {import('./state.js').GameState} state
 */
export function renderEcoStatus(state) {
  if (!ecoStatusEl || !state.weather) return;

  const { achievable, missing, all_assigned } = checkEcosystemBonusStatus(state);

  if (achievable) {
    ecoStatusEl.className = 'eco-status eco-achieved';
    ecoStatusEl.innerHTML = '🌿 Ekosistem bonus!';
    ecoStatusEl.title = 'Micelij + Jezero + Kompost svi u prozoru — ×1.5 poena!';
  } else if (!all_assigned && missing.length < 3) {
    // Partially assigned, some out of window
    const pct = Math.round(((3 - missing.length) / 3) * 100);
    ecoStatusEl.className = 'eco-status eco-partial';
    ecoStatusEl.innerHTML = `🌿 Ekosistem: ${pct}%`;
    ecoStatusEl.title = `Nedostaje: ${missing.join(', ')}`;
  } else if (missing.length === 3 || (missing.length > 0 && missing.every((m) => !m.includes('van prozora')))) {
    // Nothing assigned yet
    ecoStatusEl.className = 'eco-status eco-none';
    ecoStatusEl.innerHTML = `🌿 Micelij + Jezero + Kompost = +50%`;
    ecoStatusEl.title = 'Dodeli sva tri u prozoru za ekosistem bonus';
  } else {
    ecoStatusEl.className = 'eco-status eco-partial';
    ecoStatusEl.innerHTML = `🌿 Ekosistem: popravi pozicije`;
    ecoStatusEl.title = `Van prozora: ${missing.join(', ')}`;
  }
}

// ─── Error State ───────────────────────────────────────────────────────────────

/**
 * Show error toast if state has a new error
 * @param {import('./state.js').GameState} state
 */
export function renderErrorToast(state) {
  if (
    state.error_message &&
    state.error_timestamp &&
    state.error_timestamp !== lastErrorTimestamp
  ) {
    lastErrorTimestamp = state.error_timestamp;
    const id = `error-${state.error_timestamp}`;
    if (!activeToastIds.has(id)) {
      showToast(state.error_message, 'error', id);
    }
  }
}

// ─── Toast System ──────────────────────────────────────────────────────────────

/**
 * Show an achievement unlock toast
 * @param {string} message
 */
export function showAchievementToast(message) {
  showToast(message, 'achievement');
}

/**
 * Show a generic toast notification
 * @param {string} message
 * @param {'info'|'error'|'achievement'|'warning'} type
 * @param {string} [id] optional id to prevent duplicate toasts
 */
export function showToast(message, type = 'info', id = null) {
  if (!toastContainerEl) return;

  // Prevent duplicates
  if (id) {
    if (activeToastIds.has(id)) return;
    activeToastIds.add(id);
  }

  // Limit simultaneous toasts
  const existing = toastContainerEl.querySelectorAll('.toast');
  if (existing.length >= 3) {
    // Remove oldest
    existing[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  if (id) toast.id = id;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  toastContainerEl.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Animate out
  const duration = type === 'achievement' ? 4000 : type === 'error' ? 3000 : 2500;
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
      if (id) activeToastIds.delete(id);
    }, 350);
  }, duration);
}

/**
 * Clear all active toasts immediately
 */
export function clearAllToasts() {
  if (!toastContainerEl) return;
  toastContainerEl.querySelectorAll('.toast').forEach((t) => t.remove());
  activeToastIds.clear();
}

// ─── Utility ───────────────────────────────────────────────────────────────────

/**
 * Animate a numeric counter from start to end value in a given element
 * @param {HTMLElement} el
 * @param {number} start
 * @param {number} end
 * @param {number} duration - ms
 * @param {(val: number) => string} [formatter]
 */
export function animateCounter(el, start, end, duration, formatter) {
  if (!el) return;
  const startTime = performance.now();
  const fmt = formatter ?? ((v) => String(Math.round(v)));

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + (end - start) * eased;
    el.textContent = fmt(value);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/**
 * Flash an element with a CSS class for a brief animation
 * @param {HTMLElement} el
 * @param {string} className
 * @param {number} duration - ms
 */
export function flashElement(el, className, duration = 400) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // Force reflow
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

/**
 * Scroll an element into view smoothly
 * @param {Element|null} el
 * @param {'start'|'center'|'end'|'nearest'} block
 * @param {'start'|'center'|'end'|'nearest'} inline
 */
export function scrollIntoView(el, block = 'nearest', inline = 'center') {
  if (!el) return;
  try {
    el.scrollIntoView({ behavior: 'smooth', block, inline });
  } catch (e) {
    el.scrollIntoView();
  }
}
