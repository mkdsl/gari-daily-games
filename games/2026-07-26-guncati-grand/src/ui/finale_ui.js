/** @fileoverview Real-time Finale HUD: Crowd Mood meter, DJ hype bar, event decision cards */

import { getState } from '../state.js';
import { CONFIG } from '../config.js';
import { moodToColor, moodToLabel } from '../entities/crowd.js';
import { playerDJTransition, resolveFinaleEvent } from '../systems/finale.js';
import { createEventLogEntry } from '../systems/events.js';
import { formatGC } from '../systems/economy.js';

/** @type {HTMLElement|null} */
let _container = null;
/** @type {Object[]} */
let _eventLog = [];
/** @type {boolean} */
let _transitionPending = false;
/** @type {number|null} */
let _transitionTimeoutId = null;

/**
 * Render the Finale screen shell
 * @param {HTMLElement} container
 */
export function renderFinale(container) {
  _container = container;
  _eventLog = [];
  _transitionPending = false;

  container.innerHTML = buildFinaleHTML();
  bindFinaleEvents(container);
}

/**
 * Update finale HUD based on current finale state
 * Called every tick
 * @param {Object} finaleState
 */
export function updateFinaleHUD(finaleState) {
  if (!_container) return;

  // Timer
  const timerEl = _container.querySelector('#finale-timer');
  if (timerEl) {
    const remaining = CONFIG.FINALE_DURATION_SEC - finaleState.elapsed;
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining % 60);
    timerEl.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    timerEl.classList.toggle('timer-urgent', remaining < 120);
  }

  // Elapsed progress bar
  const progressEl = _container.querySelector('#finale-progress-fill');
  if (progressEl) {
    const pct = (finaleState.elapsed / CONFIG.FINALE_DURATION_SEC) * 100;
    progressEl.style.width = `${Math.min(pct, 100)}%`;
  }

  // Crowd Mood
  const moodEl = _container.querySelector('#crowd-mood-value');
  const moodBarEl = _container.querySelector('#crowd-mood-bar');
  const moodLabelEl = _container.querySelector('#crowd-mood-label');
  if (moodEl) moodEl.textContent = `${Math.round(finaleState.crowdMood)}%`;
  if (moodBarEl) {
    moodBarEl.style.width = `${finaleState.crowdMood}%`;
    moodBarEl.style.background = moodToColor(finaleState.crowdMood);
  }
  if (moodLabelEl) moodLabelEl.textContent = moodToLabel(finaleState.crowdMood);

  // DJ Hype
  const hypeEl = _container.querySelector('#dj-hype-value');
  const hypeBarEl = _container.querySelector('#dj-hype-bar');
  if (hypeEl) hypeEl.textContent = `${Math.round(finaleState.djHype)}%`;
  if (hypeBarEl) {
    hypeBarEl.style.width = `${finaleState.djHype}%`;
    const hypeColor = finaleState.djHype > 70 ? 'var(--c-gold)' : finaleState.djHype > 40 ? 'var(--c-fire)' : '#888';
    hypeBarEl.style.background = hypeColor;
  }

  // Current DJ slot
  const djSlotEl = _container.querySelector('#dj-slot-label');
  if (djSlotEl) {
    djSlotEl.textContent = `DJ ${finaleState.currentSlot + 1}/${finaleState.totalSlots}`;
  }

  // Revenue ticker
  const revEl = _container.querySelector('#finale-revenue');
  if (revEl) revEl.textContent = formatGC(Math.floor(finaleState.revenue));

  // Crowd count
  const crowdEl = _container.querySelector('#finale-crowd');
  if (crowdEl) {
    crowdEl.textContent = `${finaleState.crowdCurrent} / ${finaleState.crowdCap}`;
  }

  // DJ transition button
  updateTransitionButton(finaleState);

  // Pending event card
  if (finaleState.pendingEvent && !_container.querySelector('#event-card')) {
    showEventCard(finaleState.pendingEvent);
  }
}

function buildFinaleHTML() {
  return `
    <div class="finale-layout">
      <div class="finale-header">
        <h2 class="finale-title">🎪 Grand Finale — Guncati!</h2>
        <div class="finale-timer-wrap">
          <span class="timer-label">Preostalo:</span>
          <span id="finale-timer" class="finale-timer">15:00</span>
        </div>
        <div class="finale-progress-track">
          <div id="finale-progress-fill" class="finale-progress-fill"></div>
        </div>
      </div>

      <div class="finale-body">
        <div class="finale-left">
          <!-- Crowd Mood -->
          <div class="meter-panel panel">
            <div class="meter-header">
              <span class="meter-label">😄 Raspoloženje Publike</span>
              <span id="crowd-mood-value" class="meter-value">70%</span>
            </div>
            <div class="meter-track">
              <div id="crowd-mood-bar" class="meter-fill mood-bar" style="width:70%"></div>
            </div>
            <span id="crowd-mood-label" class="meter-sublabel">Dobro raspoloženi</span>
          </div>

          <!-- DJ Hype -->
          <div class="meter-panel panel">
            <div class="meter-header">
              <span class="meter-label">🎧 DJ Hype</span>
              <span id="dj-hype-value" class="meter-value">50%</span>
            </div>
            <div class="meter-track">
              <div id="dj-hype-bar" class="meter-fill hype-bar" style="width:50%;background:var(--c-fire)"></div>
            </div>
            <div class="dj-slot-info">
              <span id="dj-slot-label">DJ 1/1</span>
            </div>
          </div>

          <!-- DJ Transition Button -->
          <div class="dj-transition-panel">
            <button id="btn-dj-transition" class="btn-transition" disabled>
              🎵 CUE NEXT DJ
            </button>
            <div id="transition-progress" class="transition-progress" style="display:none">
              <div id="transition-fill" class="transition-fill"></div>
            </div>
          </div>
        </div>

        <div class="finale-center">
          <!-- Event card container -->
          <div id="event-card-container"></div>

          <!-- Stats -->
          <div class="finale-stats panel">
            <div class="stat-row-finale">
              <span>👥 Publika</span>
              <span id="finale-crowd">0 / 0</span>
            </div>
            <div class="stat-row-finale">
              <span>💰 Prihod</span>
              <span id="finale-revenue">0 GC</span>
            </div>
          </div>

          <!-- Event log -->
          <div class="event-log panel">
            <h4>📋 Log</h4>
            <div id="event-log-list" class="event-log-list"></div>
          </div>
        </div>

        <div class="finale-right">
          <!-- Farm visualization during finale -->
          <div class="finale-farm panel" id="finale-farm-viz">
            <h4>🌄 Guncati Teren</h4>
            <div class="farm-grid" id="finale-farm-grid"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindFinaleEvents(container) {
  container.querySelector('#btn-dj-transition')?.addEventListener('click', () => {
    if (!_transitionPending) return;
    const result = playerDJTransition();
    updateTransitionButton({ pendingTransition: false });

    if (result.success) {
      addEventLogEntry('🎵 DJ Smena Savršena!', '+20 Hype', 'log-success');
    } else {
      addEventLogEntry('🎵 Zakašnela Smena', '-10 Hype', 'log-warning');
    }
  });
}

function updateTransitionButton(finaleState) {
  const btn = _container?.querySelector('#btn-dj-transition');
  const progressEl = _container?.querySelector('#transition-progress');
  const fillEl = _container?.querySelector('#transition-fill');

  if (!btn) return;

  if (finaleState.pendingTransition) {
    _transitionPending = true;
    btn.disabled = false;
    btn.classList.add('btn-transition-active', 'pulse');
    progressEl && (progressEl.style.display = 'block');

    // Animate countdown
    if (fillEl) {
      fillEl.style.transition = `width ${CONFIG.DJ_TRANSITION_WINDOW_SEC}s linear`;
      fillEl.style.width = '0%';
      // Force reflow
      fillEl.getBoundingClientRect();
      fillEl.style.width = '100%';
    }

    // Auto-expire
    if (_transitionTimeoutId) clearTimeout(_transitionTimeoutId);
    _transitionTimeoutId = setTimeout(() => {
      _transitionPending = false;
      btn.disabled = true;
      btn.classList.remove('btn-transition-active', 'pulse');
      progressEl && (progressEl.style.display = 'none');
    }, CONFIG.DJ_TRANSITION_WINDOW_SEC * 1000 + 100);
  } else if (!finaleState.pendingTransition) {
    _transitionPending = false;
    btn.disabled = finaleState.totalSlots <= 1 || finaleState.currentSlot >= finaleState.totalSlots - 1;
    btn.classList.remove('btn-transition-active', 'pulse');
    progressEl && (progressEl.style.display = 'none');
  }
}

/**
 * Show event decision card
 * @param {Object} event
 */
export function showEventCard(event) {
  const container = _container?.querySelector('#event-card-container');
  if (!container) return;

  const optionsHTML = (event.options || []).map((opt, i) => `
    <button class="btn-event-option" data-option="${i}">
      <strong>${opt.text}</strong>
      ${opt.desc ? `<span class="opt-desc">${opt.desc}</span>` : ''}
    </button>
  `).join('');

  container.innerHTML = `
    <div id="event-card" class="event-card animate-in">
      <div class="event-card-header">
        <span class="event-urgent-badge">⚡ ODLUKA</span>
        <h3>${event.title}</h3>
        <p>${event.description || ''}</p>
      </div>
      <div class="event-options">
        ${optionsHTML}
      </div>
    </div>
  `;

  container.querySelectorAll('.btn-event-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.option);
      const result = resolveFinaleEvent(idx);
      if (result?.success === false && result.reason) {
        btn.textContent = '❌ ' + result.reason;
        btn.disabled = true;
        return;
      }
      container.innerHTML = '';
      if (result) {
        addEventLogEntry(event.title, result.optionText || 'Rešeno', 'log-event');
      }
    });
  });
}

/**
 * Add entry to event log
 * @param {string} title
 * @param {string} detail
 * @param {string} className
 */
export function addEventLogEntry(title, detail, className = '') {
  const listEl = _container?.querySelector('#event-log-list');
  if (!listEl) return;

  const state = getState();
  const elapsed = state.finale?.elapsed || 0;
  const min = Math.floor(elapsed / 60);
  const sec = Math.floor(elapsed % 60);
  const time = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  const entry = document.createElement('div');
  entry.className = `log-entry ${className}`;
  entry.innerHTML = `<span class="log-time">${time}</span> <span class="log-title">${title}</span> <span class="log-detail">${detail}</span>`;
  listEl.prepend(entry);

  // Keep max 10 entries
  while (listEl.children.length > 10) {
    listEl.lastChild?.remove();
  }
}

/**
 * Update farm visualization during finale
 * @param {Object} state
 */
export function updateFinaleFarm(state) {
  const farmGrid = _container?.querySelector('#finale-farm-grid');
  if (!farmGrid) return;

  const buildings = state.buildings || {};
  const buildingEmojis = { pozornica: '🎪', wc: '🚻', satre: '⛺', bar: '🍺', parking: '🅿️' };

  farmGrid.innerHTML = Object.entries(buildings)
    .filter(([, l]) => l > 0)
    .map(([id, level]) => `
      <div class="farm-cell farm-cell-built" title="${id} L${level}">
        <span>${buildingEmojis[id] || '🏗️'}</span>
        <span class="farm-level">L${level}</span>
      </div>
    `).join('') || '<p class="farm-empty">Teren neizgrađen</p>';
}
