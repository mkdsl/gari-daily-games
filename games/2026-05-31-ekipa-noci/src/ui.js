/**
 * ui.js — HUD, screen management i toast poruke za Ekipa Noći
 */

import { openCodex } from './ui/codex.js';

// Mapa ekrana: ime → ID elementa
const SCREEN_MAP = {
  intro:        'screen-intro',
  draft:        'screen-draft',
  resolve:      'screen-resolve',
  crew_update:  'screen-crew-update',
  tour_end:     'screen-tour-end'
};

// Role redosled za tabove
const ROLES = ['DJ', 'Host', 'Sound', 'Video', 'Security'];

// Aktivni toast timeout handle
let _toastTimeout = null;

/**
 * Inicijalizuje HUD — postavlja event listenere (Codex dugme).
 * Treba pozvati jednom na startu.
 *
 * @param {Function} getStateCallback — vraća trenutni state za Codex
 */
export function initUI(getStateCallback) {
  const btnCodex = document.getElementById('btn-codex');
  if (btnCodex) {
    btnCodex.addEventListener('click', () => {
      const state = getStateCallback ? getStateCallback() : {};
      const allCards  = state.allCards  || [];
      const unlockedIds = state.unlockedCardIds || allCards.map(c => c.id);
      const cumXP    = state.cumulativeXP || 0;
      openCodex(allCards, unlockedIds, cumXP);
    });
  }
}

/**
 * Ažurira HUD display.
 *
 * @param {Object} state  — game state objekat
 * state.eventName        — string, npr. "Štrand"
 * state.eventIndex       — 0-based (prikazujemo +1)
 * state.totalEvents      — ukupno evenata (5)
 * state.budget           — trenutni budžet
 * state.maxBudget        — maks budžet
 * state.cumulativeXP     — ukupno XP
 * state.activeRole       — trenutna rola u draft-u
 * state.completedRoles   — niz završenih rola
 */
export function updateHUD(state) {
  // Event name + progress
  const eventNameEl = document.getElementById('hud-event-name');
  if (eventNameEl) {
    const idx   = (state.eventIndex ?? 0) + 1;
    const total = state.totalEvents ?? 5;
    eventNameEl.textContent = `${state.eventName || 'Event'} (${idx}/${total})`;
  }

  // Budget
  const budgetEl = document.getElementById('hud-budget');
  if (budgetEl) {
    const current = state.budget    ?? 0;
    const max     = state.maxBudget ?? 60;
    budgetEl.textContent = `${current}/${max} BP`;

    // Vizuelni warning kad je budžet nizak
    budgetEl.classList.toggle('hud__budget--low',      current < max * 0.3);
    budgetEl.classList.toggle('hud__budget--critical', current < max * 0.1);
  }

  // XP / Rep
  const repEl = document.getElementById('hud-rep');
  if (repEl) {
    repEl.textContent = `⭐ ${state.cumulativeXP ?? 0} XP`;
  }

  // Role tabs
  _updateRoleTabs(state.activeRole, state.completedRoles || []);
}

/**
 * Ažurira role tabove u draft ekranu.
 */
function _updateRoleTabs(activeRole, completedRoles) {
  const tabsEl = document.getElementById('role-tabs');
  if (!tabsEl) return;

  // Ako tabovi još ne postoje, kreiraj ih
  if (tabsEl.children.length === 0) {
    ROLES.forEach(role => {
      const tab = document.createElement('button');
      tab.classList.add('role-tab');
      tab.dataset.role = role;
      tab.textContent = role;
      tabsEl.appendChild(tab);
    });
  }

  // Ažuriraj klase
  tabsEl.querySelectorAll('.role-tab').forEach(tab => {
    const r = tab.dataset.role;
    tab.classList.remove('role-tab--active', 'role-tab--done', 'role-tab--future');

    if (r === activeRole) {
      tab.classList.add('role-tab--active');
    } else if (completedRoles.includes(r)) {
      tab.classList.add('role-tab--done');
      // Dodaj checkmark ako ga još nema
      if (!tab.querySelector('.role-tab__check')) {
        const check = document.createElement('span');
        check.classList.add('role-tab__check');
        check.textContent = ' ✓';
        tab.appendChild(check);
      }
    } else {
      tab.classList.add('role-tab--future');
    }
  });
}

/**
 * Prikazuje odgovarajući screen, sakriva sve ostale.
 *
 * @param {string} phaseName  — 'intro' | 'draft' | 'resolve' | 'crew_update' | 'tour_end'
 * @param {Object} [data]     — opcionalni data za inicijalizaciju screen-a
 */
export function showPhase(phaseName, data = {}) {
  Object.entries(SCREEN_MAP).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (key === phaseName) {
      el.classList.add('screen--active');
      el.classList.remove('screen--hidden');
      // Pokreni enter animaciju
      el.classList.remove('screen--entering');
      void el.offsetWidth; // reflow
      el.classList.add('screen--entering');
    } else {
      el.classList.remove('screen--active', 'screen--entering');
      el.classList.add('screen--hidden');
    }
  });
}

/**
 * Prikazuje toast poruku koja se auto-dismissuje.
 *
 * @param {string} text   — poruka
 * @param {string} type   — 'info' | 'success' | 'error'
 */
export function showMessage(text, type = 'info') {
  // Pronađi ili kreiraj toast kontejner
  let toast = document.getElementById('toast-container');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-container';
    document.getElementById('game-root')?.appendChild(toast);
  }

  // Kreiraj toast element
  const msg = document.createElement('div');
  msg.classList.add('toast', `toast--${type}`);
  msg.textContent = text;
  toast.appendChild(msg);

  // Force reflow pa dodaj visible klasu za animaciju
  void msg.offsetWidth;
  msg.classList.add('toast--visible');

  // Ukloni posle 3 sekunde
  if (_toastTimeout) clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => {
    msg.classList.remove('toast--visible');
    msg.addEventListener('transitionend', () => msg.remove(), { once: true });
  }, 3000);
}

/**
 * Prikazuje stinger overlay (pun ekran flash za event result).
 *
 * @param {'success'|'fail'} variant  — success (zeleni) ili fail (crveni)
 * @param {Function} [onDone]         — callback posle animacije
 */
export function showStinger(variant, onDone) {
  let overlay = document.getElementById('stinger-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'stinger-overlay';
    document.getElementById('game-root')?.appendChild(overlay);
  }

  overlay.className = `stinger stinger--${variant}`;
  void overlay.offsetWidth;
  overlay.classList.add('stinger--active');

  overlay.addEventListener('animationend', () => {
    overlay.className = 'stinger';
    if (onDone) onDone();
  }, { once: true });
}
