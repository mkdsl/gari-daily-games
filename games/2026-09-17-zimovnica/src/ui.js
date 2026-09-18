/**
 * ui.js — Event wiring, toast notifikacije, generic modal.
 * Koristi event delegation na #app — listener se veže JEDNOM, uvek koristi
 * poslednji state preko referenci (ne re-veže posle svakog rendera).
 */

/** @type {HTMLElement|null} */
let toastContainer = null;

/** Stanja za delegirani listener (ne re-veže na svaki render) */
let _delegatedAttached = false;
let _currentState = null;
let _currentPersistent = null;

/**
 * Vraća ili kreira toast container.
 * @returns {HTMLElement}
 */
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

/**
 * Prikazuje toast obaveštenje.
 * @param {string} message
 * @param {'info'|'warn'|'success'|'error'} type
 * @param {number} [duration=3000] ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, duration + 200);
}

/**
 * Prikazuje generic modal sa overlay-om.
 * @param {string} title
 * @param {string|HTMLElement} content
 * @param {Array<{label: string, type?: string, onClick: function}>} buttons
 * @returns {HTMLElement} overlay element
 */
export function showModal(title, content, buttons = []) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const box = document.createElement('div');
  box.className = 'modal-box';

  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'modal-title';
    titleEl.textContent = title;
    box.appendChild(titleEl);
  }

  const contentEl = document.createElement('div');
  contentEl.className = 'modal-content';
  if (typeof content === 'string') {
    contentEl.textContent = content;
  } else {
    contentEl.appendChild(content);
  }
  box.appendChild(contentEl);

  if (buttons.length > 0) {
    const btnRow = document.createElement('div');
    btnRow.className = 'modal-buttons';
    for (const btn of buttons) {
      const b = document.createElement('button');
      b.className = 'modal-btn' + (btn.type === 'primary' ? ' primary' : '');
      b.textContent = btn.label;
      b.addEventListener('click', () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (btn.onClick) btn.onClick();
      });
      btnRow.appendChild(b);
    }
    box.appendChild(btnRow);
  }

  overlay.appendChild(box);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  });

  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Wires event delegation na #app (jednom) i ažurira state reference.
 * Poziva se posle svakog re-renderovanja iz render.js.
 * @param {object} state
 * @param {object} persistent
 */
export function renderUI(state, persistent) {
  // Ažuriraj referenci — handler uvek koristi poslednju verziju
  _currentState = state;
  _currentPersistent = persistent;

  if (_delegatedAttached) return; // Listener je već vezan — ne dodaj ponovo

  const app = document.getElementById('app');
  if (!app) return;

  app.addEventListener('click', (e) => {
    handleDelegatedClick(e, _currentState, _currentPersistent);
  });
  _delegatedAttached = true;
}

/**
 * Centralni handler za klikove unutar #app (event delegation).
 * @param {MouseEvent} e
 * @param {object} state
 * @param {object} persistent
 */
function handleDelegatedClick(e, state, persistent) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const params = buildParams(target.dataset);

  // Dinamički import sprečava circular dependency
  import('./main.js').then(({ handleAction, nextDay, startNewRun, setScreen }) => {
    switch (action) {
      case 'start_game':
        startNewRun(false);
        break;

      case 'start_prestige':
        startNewRun(true);
        break;

      case 'next_day':
        nextDay();
        break;

      case 'berba':
        handleAction('berba', params);
        break;

      case 'kuvanje':
        handleAction('kuvanje', params);
        break;

      case 'bacva_init':
        handleAction('bacva_init', params);
        break;

      case 'prodaja':
        handleAction('prodaja', params);
        break;

      case 'kupovina':
        handleAction('kupovina', params);
        break;

      case 'shelf_upgrade':
        handleAction('shelf_upgrade', params);
        break;

      case 'event_choice':
        handleAction('event_choice', params);
        break;

      case 'go_menu':
        setScreen('menu');
        break;

      default:
        console.warn('Zimovnica: unknown action', action);
    }
  });
}

/**
 * Konvertuje dataset atribute u params objekat.
 * @param {DOMStringMap} dataset
 * @returns {object}
 */
function buildParams(dataset) {
  const params = {};
  for (const key of Object.keys(dataset)) {
    if (key === 'action') continue;
    const val = dataset[key];
    if (val === 'all') {
      params[key] = 'all';
    } else if (!isNaN(val) && val !== '') {
      params[key] = parseFloat(val);
    } else {
      params[key] = val;
    }
  }
  return params;
}

/**
 * Ažurira prikaz kase u HUD-u (micro-update bez full re-rendera).
 * @param {number} kasa
 */
export function updateKasa(kasa) {
  const el = document.querySelector('.hud-kasa');
  if (el) el.textContent = `${kasa.toLocaleString('sr')} RSD`;
}

/**
 * Ažurira storage bar (popunjenost polica).
 * @param {number} used - Kg
 * @param {number} capacity - Ukupan kapacitet kg
 */
export function updateStorageBar(used, capacity) {
  const fill = document.querySelector('.capacity-bar-fill, .storage-bar-fill');
  if (fill) {
    const pct = capacity > 0 ? Math.min(used / capacity, 1) : 0;
    fill.style.width = `${Math.round(pct * 100)}%`;
    fill.className = fill.className.replace(/ ?(warn|full)/g, '');
    if (pct >= 1.0) fill.className += ' full';
    else if (pct >= 0.75) fill.className += ' warn';
  }
}

/**
 * Ažurira forecast strip.
 * @param {string} today
 * @param {string} tomorrow
 */
export function updateForecast(today, tomorrow) {
  const el = document.querySelector('.hud-forecast');
  if (!el) return;
  import('./render/hud.js').then(({ renderForecast }) => {
    renderForecast(el, today, tomorrow);
  });
}

/**
 * Ažurira countdown prikaz.
 * @param {number} day
 * @param {number} totalDays
 */
export function updateCountdown(day, totalDays) {
  const el = document.querySelector('.hud-countdown .day-num');
  if (el) el.textContent = day;
}

/**
 * Renderuje action slot indikatore.
 * @param {number} slotsRemaining
 * @param {number} totalSlots
 */
export function renderActionSlots(slotsRemaining, totalSlots) {
  const el = document.querySelector('.hud-slots');
  if (!el) return;
  import('./render/hud.js').then(({ renderSlots }) => {
    renderSlots(el, slotsRemaining, totalSlots);
  });
}

/**
 * Prikazuje log poruke u log panelu.
 * @param {Array<{day: number, text: string, type: string}>} log
 */
export function renderLog(log) {
  const panel = document.querySelector('.log-panel');
  if (!panel) return;
  panel.innerHTML = '';
  // Poslednjih 8, najnovije gore
  const recent = log.slice(-8).reverse();
  for (const entry of recent) {
    const div = document.createElement('div');
    div.className = `log-entry ${entry.type || 'info'}`;
    div.textContent = `[D${entry.day}] ${entry.text}`;
    panel.appendChild(div);
  }
}
