/** @fileoverview Persistent HUD: week number, GC balance, WB indicator, building status */

import { getState } from '../state.js';
import { getWBStatus } from '../systems/wellbeing.js';
import { formatGC } from '../systems/economy.js';
import { getFinaleProgress } from '../systems/progression.js';

/** @type {HTMLElement|null} */
let _hudEl = null;

/**
 * Initialize HUD element
 * @param {HTMLElement} container
 */
export function initHUD(container) {
  _hudEl = container;
  _hudEl.innerHTML = buildHUDHTML();
}

/**
 * Update HUD with current state
 */
export function updateHUD() {
  if (!_hudEl) return;
  const state = getState();

  // Don't show HUD on MENU or SCORE screens
  if (state.screen === 'MENU') {
    _hudEl.style.display = 'none';
    return;
  }
  _hudEl.style.display = 'flex';

  // Week
  const weekEl = _hudEl.querySelector('.hud-week');
  if (weekEl) {
    const progress = getFinaleProgress(state.week);
    weekEl.textContent = `Nedelja ${Math.min(state.week, 10)} / 10`;
    weekEl.title = progress.label;
    weekEl.className = `hud-week urgency-${progress.urgency}`;
  }

  // GC Balance
  const gcEl = _hudEl.querySelector('.hud-gc');
  if (gcEl) {
    gcEl.textContent = formatGC(state.gcBalance);
    gcEl.classList.toggle('hud-gc-low', state.gcBalance < 50);
  }

  // WB
  const wbEl = _hudEl.querySelector('.hud-wb');
  const wbBarEl = _hudEl.querySelector('.hud-wb-bar');
  const wbStatus = getWBStatus(state.currentWB);
  if (wbEl) {
    wbEl.textContent = `WB: ${Math.round(state.currentWB)}%`;
    wbEl.title = wbStatus.label;
    wbEl.style.color = wbStatus.color;
  }
  if (wbBarEl) {
    wbBarEl.style.width = `${Math.round(state.currentWB)}%`;
    wbBarEl.style.background = wbStatus.color;
  }

  // Tom Sawyer badge
  const tsEl = _hudEl.querySelector('.hud-ts');
  if (tsEl) {
    tsEl.style.display = wbStatus.tomSawyerActive ? 'inline-block' : 'none';
  }

  // Building icons
  const bldEl = _hudEl.querySelector('.hud-buildings');
  if (bldEl) {
    bldEl.innerHTML = buildingStatusHTML(state.buildings);
  }

  // Progress bar
  const progressEl = _hudEl.querySelector('.hud-progress-fill');
  if (progressEl) {
    const pct = ((state.week - 1) / 10) * 100;
    progressEl.style.width = `${Math.min(pct, 100)}%`;
  }

  // Prestige indicator
  const repEl = _hudEl.querySelector('.hud-reputation');
  if (repEl && state.isPrestige) {
    repEl.style.display = 'flex';
    repEl.textContent = `⭐ ${state.reputation}`;
    repEl.title = `Reputacija: ${state.reputation}`;
  } else if (repEl) {
    repEl.style.display = 'none';
  }
}

function buildHUDHTML() {
  return `
    <div class="hud-left">
      <span class="hud-week urgency-low">Nedelja 1 / 10</span>
      <div class="hud-progress">
        <div class="hud-progress-fill"></div>
      </div>
    </div>
    <div class="hud-center">
      <span class="hud-gc">500 GC</span>
      <div class="hud-wb-container">
        <span class="hud-wb">WB: 50%</span>
        <div class="hud-wb-track">
          <div class="hud-wb-bar" style="width:50%"></div>
        </div>
        <span class="hud-ts" title="Tom Sawyer aktivan — volonteri rade besplatno!">✊ TS</span>
      </div>
    </div>
    <div class="hud-right">
      <div class="hud-buildings"></div>
      <span class="hud-reputation" style="display:none"></span>
    </div>
  `;
}

/**
 * Generate building status icons HTML
 * @param {Object} buildings
 * @returns {string}
 */
function buildingStatusHTML(buildings) {
  const CONFIG_B = {
    pozornica: '🎪',
    wc: '🚻',
    satre: '⛺',
    bar: '🍺',
    parking: '🅿️'
  };

  return Object.entries(buildings)
    .filter(([, level]) => level > 0)
    .map(([id, level]) => {
      const emoji = CONFIG_B[id] || '🏗️';
      return `<span class="hud-bld" title="${id} L${level}">${emoji}<sub>${level}</sub></span>`;
    })
    .join('');
}

/**
 * Flash HUD GC to indicate spend
 */
export function flashGCSpend() {
  const gcEl = _hudEl?.querySelector('.hud-gc');
  if (!gcEl) return;
  gcEl.classList.add('hud-gc-flash');
  setTimeout(() => gcEl.classList.remove('hud-gc-flash'), 400);
}

/**
 * Show a toast notification in HUD area
 * @param {string} message
 * @param {'info'|'success'|'warning'|'error'} type
 * @param {number} duration - ms
 */
export function showHUDToast(message, type = 'info', duration = 2500) {
  const toast = document.createElement('div');
  toast.className = `hud-toast hud-toast-${type}`;
  toast.textContent = message;

  const container = document.querySelector('#hud') || document.body;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('hud-toast-visible'), 10);
  setTimeout(() => {
    toast.classList.remove('hud-toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
