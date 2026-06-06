/**
 * ui.js — Screen manager, HUD updates, toasts
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { TOAST_DURATION_MS } from './config.js';

/** Currently visible screen ID */
let _currentScreen = null;

/** Toast timeout handle */
let _toastTimeout = null;

/**
 * Show a screen by ID, hide all others
 * @param {'intro'|'roster'|'scenario'|'outro'} screenId
 */
export function showScreen(screenId) {
  const screens = ['intro', 'roster', 'scenario', 'outro'];

  screens.forEach(id => {
    const el = document.getElementById(`screen-${id}`);
    if (el) {
      el.classList.toggle('screen--visible', id === screenId);
      el.classList.toggle('screen--hidden', id !== screenId);
      el.setAttribute('aria-hidden', id !== screenId ? 'true' : 'false');
    }
  });

  _currentScreen = screenId;

  // Scroll to top on screen change
  window.scrollTo(0, 0);
}

/**
 * Get current screen ID
 * @returns {string|null}
 */
export function getCurrentScreen() {
  return _currentScreen;
}

/**
 * Update Night Score HUD display
 * @param {number} score
 */
export function updateNightScoreHUD(score) {
  const el = document.getElementById('night-score-hud');
  if (!el) return;

  el.textContent = score;

  // Color class based on score
  el.classList.remove('score-legendary', 'score-good', 'score-survived', 'score-kaos');
  if (score >= 85) el.classList.add('score-legendary');
  else if (score >= 60) el.classList.add('score-good');
  else if (score >= 35) el.classList.add('score-survived');
  else el.classList.add('score-kaos');
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'win'|'fail'|'info'|'warning'|'unlock'} type
 * @param {number} [duration] - Override default duration (ms)
 */
export function showToast(message, type = 'info', duration = TOAST_DURATION_MS) {
  // Remove existing toast if any
  hideToast();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
  });

  // Auto-dismiss
  _toastTimeout = setTimeout(() => hideToast(), duration);
}

/**
 * Hide and remove current toast
 */
export function hideToast() {
  if (_toastTimeout) {
    clearTimeout(_toastTimeout);
    _toastTimeout = null;
  }
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }
}

/**
 * Show loading state on a button
 * @param {string} buttonId
 * @param {string} loadingText
 */
export function setButtonLoading(buttonId, loadingText = 'Čekaj...') {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.dataset.originalText = btn.textContent;
  btn.textContent = loadingText;
  btn.disabled = true;
  btn.classList.add('btn--loading');
}

/**
 * Restore button from loading state
 * @param {string} buttonId
 */
export function unsetButtonLoading(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  if (btn.dataset.originalText) {
    btn.textContent = btn.dataset.originalText;
    delete btn.dataset.originalText;
  }
  btn.disabled = false;
  btn.classList.remove('btn--loading');
}

/**
 * Show modal overlay with custom content
 * @param {string} html - HTML content
 * @param {Object} options - {id, onClose, closable}
 * @returns {HTMLElement} modal element
 */
export function showModal(html, options = {}) {
  const { id = 'modal-overlay', onClose, closable = true } = options;

  // Remove existing
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="modal-content">
      ${closable ? '<button class="modal-close" id="modal-close-btn" aria-label="Zatvori">×</button>' : ''}
      ${html}
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  });

  if (closable) {
    modal.querySelector('#modal-close-btn')?.addEventListener('click', () => {
      closeModal(id);
      onClose && onClose();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(id);
        onClose && onClose();
      }
    });
  }

  return modal;
}

/**
 * Close a modal by ID
 * @param {string} id
 */
export function closeModal(id = 'modal-overlay') {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('modal-overlay--visible');
  modal.addEventListener('transitionend', () => modal.remove(), { once: true });
}

/**
 * Show a prestige unlock prompt
 * @param {number} newLevel
 * @param {string|null} unlocked - Newly unlocked member name
 * @param {Function} onConfirm
 * @param {Function} onDecline
 */
export function showPrestigePrompt(newLevel, unlocked, onConfirm, onDecline) {
  const unlockedLine = unlocked ? `<p class="prestige-unlock">🔓 Otključava: <strong>${unlocked}</strong></p>` : '';
  showModal(`
    <div class="prestige-prompt">
      <h2>⭐ Prestige ${newLevel} dostupan!</h2>
      <p>Resetuješ career progresiju, ali zadržavaš Prestige nivo i otključavaš novog člana ekipe.</p>
      ${unlockedLine}
      <div class="prestige-buttons">
        <button class="btn-primary" id="prestige-confirm">Da, prestige!</button>
        <button class="btn-secondary" id="prestige-decline">Ne još</button>
      </div>
    </div>
  `, { closable: false });

  document.getElementById('prestige-confirm')?.addEventListener('click', () => {
    closeModal();
    onConfirm && onConfirm();
  });
  document.getElementById('prestige-decline')?.addEventListener('click', () => {
    closeModal();
    onDecline && onDecline();
  });
}

/**
 * Update crew count display in roster
 * @param {number} count - 0-5
 */
export function updateCrewCountDisplay(count) {
  const el = document.getElementById('crew-count-display');
  if (el) el.textContent = `${count}/5`;

  const startBtn = document.getElementById('btn-start-night');
  if (startBtn) {
    startBtn.disabled = count < 5;
    startBtn.classList.toggle('btn-disabled', count < 5);
    startBtn.classList.toggle('btn-primary', count === 5);
    startBtn.textContent = count === 5 ? '🌙 Kreni u noć!' : `Odaberi još ${5 - count} članova`;
  }
}

/**
 * Animate a DOM element with a CSS class (adds, then removes)
 * @param {HTMLElement|string} elOrId
 * @param {string} className
 * @param {number} [duration] - ms before removing class
 */
export function flashAnimation(elOrId, className, duration = 600) {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) return;

  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

/**
 * Trigger screen shake effect
 * @param {number} [intensity] - 1-3
 */
export function triggerScreenShake(intensity = 1) {
  const root = document.getElementById('game-root');
  if (!root) return;

  root.classList.add(`screen-shake-${intensity}`);
  setTimeout(() => root.classList.remove(`screen-shake-${intensity}`), 500);
}

/**
 * Set visible screen from initial load (no transition)
 * @param {'intro'|'roster'|'scenario'|'outro'} screenId
 */
export function initScreen(screenId) {
  const screens = ['intro', 'roster', 'scenario', 'outro'];
  screens.forEach(id => {
    const el = document.getElementById(`screen-${id}`);
    if (!el) return;
    if (id === screenId) {
      el.classList.remove('screen--hidden');
      el.classList.add('screen--visible');
    } else {
      el.classList.add('screen--hidden');
      el.classList.remove('screen--visible');
    }
  });
  _currentScreen = screenId;
}
