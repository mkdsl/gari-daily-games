/**
 * ui.js — Screen manager: montira/demontira screene
 * Screens: start, planning, session, season_summary, meta, prestige, modal, toast
 */

import { bus, EVT } from './events.js';
import { clearEl, el, createEl } from './utils.js';
import { mountPlanningUI } from './macro/planning-ui.js';
import { mountSessionUI, unmountSessionUI } from './micro/session-ui.js';
import { renderSeasonSummaryHTML } from './macro/season-summary.js';
import { renderMetaScreen } from './meta/meta-ui.js';
import { mountShareButton } from './share.js';
import { getBrandLinkHTML } from './content/brand-hooks.js';
import { getAforizem } from './content/aforizmi.js';

let _currentScreen = null;
let _overlay = null;
let _mainContainer = null;

// Toast queue
let _toastQueue = [];
let _toastActive = false;

export function initUI(overlay, mainContainer) {
  _overlay = overlay;
  _mainContainer = mainContainer;

  // Toast listener
  bus.on(EVT.TOAST, ({ msg, type, duration }) => {
    showToast(msg, type, duration);
  });

  // Modal listeners
  bus.on(EVT.MODAL_OPEN, ({ type, title, content }) => {
    showModal(title, content);
  });

  bus.on(EVT.MODAL_CLOSE, () => {
    closeModal();
  });

  // Screen change
  bus.on(EVT.SCREEN_CHANGE, ({ screen, data }) => {
    // Handled externally by main.js
  });
}

/**
 * Show start screen
 */
export function showStartScreen(container) {
  clearEl(container);
  _currentScreen = 'start';

  container.innerHTML = `
    <div class="start-screen">
      <div class="start-bg"></div>
      <div class="start-content">
        <div class="start-logo">🌿</div>
        <h1 class="start-title">Zemlja i Znanje</h1>
        <div class="start-subtitle">Guncati Masterclass Simulator</div>
        <p class="start-desc">
          Vodi imanje prirodnih zanata. Planiraš sezone, organizuješ masterclass programe,
          rešavaš incidente u realnom vremenu. Gradi reputaciju. Pokreni prestiž reset.
        </p>
        <div class="start-actions">
          <button class="btn-primary btn-start-game" id="btn-new-game">Počni Igru</button>
          <button class="btn-secondary btn-start-continue" id="btn-continue-game">Nastavi</button>
        </div>
        <div class="start-brand">${getBrandLinkHTML('small')}</div>
        <div class="start-aforizem">"${getAforizem()}"</div>
      </div>
    </div>
  `;
}

/**
 * Show guided end message
 */
export function showGuidedEndMessage(container) {
  const msg = createEl('div', 'guided-end-message');
  msg.innerHTML = `
    <div class="guided-end-content">
      <span class="guided-end-icon">🌿</span>
      <span class="guided-end-text">Spreman si — dalje sam!</span>
    </div>
  `;
  container.appendChild(msg);
  setTimeout(() => msg.classList.add('fade-out'), 2000);
  setTimeout(() => msg.parentNode?.removeChild(msg), 2500);
}

/**
 * Show season summary screen
 */
export function showSeasonSummary(container, summary, metaState, macroState) {
  clearEl(container);
  _currentScreen = 'season_summary';

  const wrapper = createEl('div', 'screen-wrapper');
  wrapper.innerHTML = renderSeasonSummaryHTML(summary);

  // Share button
  mountShareButton(wrapper, summary, metaState);

  const actions = createEl('div', 'summary-actions');
  actions.innerHTML = `
    <button class="btn-primary" id="btn-next-season">Sledeća Sezona →</button>
    <button class="btn-secondary" id="btn-view-meta">Karijera</button>
  `;
  wrapper.appendChild(actions);

  container.appendChild(wrapper);
}

/**
 * Show meta screen
 */
export function showMetaScreen(container, metaState, macroState) {
  clearEl(container);
  _currentScreen = 'meta';
  renderMetaScreen(container, metaState, macroState);
}

// === TOAST ===
export function showToast(msg, type = 'info', duration = 3000) {
  _toastQueue.push({ msg, type, duration });
  if (!_toastActive) processToastQueue();
}

function processToastQueue() {
  if (!_toastQueue.length) { _toastActive = false; return; }
  _toastActive = true;

  const { msg, type, duration } = _toastQueue.shift();

  let toastContainer = el('#toast-container', document.body);
  if (!toastContainer) {
    toastContainer = createEl('div', 'toast-container');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = createEl('div', `toast toast-${type}`);
  toast.textContent = msg;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.add('visible'), 10);

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.parentNode?.removeChild(toast);
      processToastQueue();
    }, 350);
  }, duration - 350);
}

// === MODAL ===
export function showModal(title, content) {
  closeModal();

  const backdrop = createEl('div', 'modal-backdrop');
  backdrop.id = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" id="btn-modal-close">✕</button>
      </div>
      <div class="modal-body">${content}</div>
    </div>
  `;
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  el('#btn-modal-close', backdrop)?.addEventListener('click', closeModal);
}

export function closeModal() {
  const existing = el('#modal-backdrop', document.body);
  if (existing) existing.parentNode?.removeChild(existing);
}

export function getCurrentScreen() {
  return _currentScreen;
}
