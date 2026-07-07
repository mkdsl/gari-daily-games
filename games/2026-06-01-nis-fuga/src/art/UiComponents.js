/**
 * UiComponents.js — Reusable UI shape components in CSS
 * Toast notifications, modals, main menu, achievement overlay
 * @module UiComponents
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';
import AchievementSystem from '../engine/AchievementSystem.js';

/** @type {HTMLElement|null} Toast container */
let toastContainer = null;

/** @type {Array<ReturnType<typeof setTimeout>>} Active toast timers */
const toastTimers = [];

/**
 * Initialize UI components
 * @param {HTMLElement} parent
 */
export function init(parent) {
  injectStyles();
  createToastContainer(parent);

  // Listen for toast events
  EventBus.on(EVENTS.UI_TOAST_SHOW, (opts) => showToast(opts));
  EventBus.on(EVENTS.ACHIEVEMENT_UNLOCKED, ({ id, name, desc, icon }) => {
    showToast({
      type: 'achievement',
      title: `Dostignuće: ${name}`,
      message: desc,
      duration: 3500,
      icon
    });
  });
}

function injectStyles() {
  if (document.getElementById('ui-components-styles')) return;
  const style = document.createElement('style');
  style.id = 'ui-components-styles';
  style.textContent = `
    /* Toast container */
    .toast-container {
      position: fixed;
      top: 0; left: 0; right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding-top: 8px;
      z-index: 9500;
      pointer-events: none;
    }
    /* Toast */
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      max-width: 90vw;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      opacity: 0;
      transform: translateY(-12px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: auto;
    }
    .toast.toast-in {
      opacity: 1;
      transform: translateY(0);
    }
    .toast.toast-out {
      opacity: 0;
      transform: translateY(-8px);
    }
    .toast-achievement {
      background: #4A7FA5;
      color: #fff;
      border-left: 4px solid #FFD700;
    }
    .toast-info {
      background: #2A4A2A;
      color: #C8F0C8;
      border-left: 4px solid #4A8A4A;
    }
    .toast-warning {
      background: #4A2A0A;
      color: #F5C880;
      border-left: 4px solid #E8A24A;
    }
    .toast-error {
      background: #4A1A1A;
      color: #F5C0C0;
      border-left: 4px solid #C0392B;
    }
    .toast-icon { font-size: 18px; }
    .toast-body { display: flex; flex-direction: column; }
    .toast-title { font-weight: 700; font-size: 13px; }
    .toast-msg { font-size: 11px; opacity: 0.9; }

    /* Hotspot tooltip */
    .hotspot-tooltip {
      position: fixed;
      background: rgba(0,0,0,0.85);
      color: #F5E6C8;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 8000;
      opacity: 0;
      transition: opacity 0.15s;
      white-space: nowrap;
      max-width: 200px;
      white-space: normal;
    }
    .hotspot-tooltip.visible { opacity: 1; }

    /* Hotspot label */
    .hotspot-label {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.7);
      color: #F5E6C8;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .hotspot-overlay:hover .hotspot-label,
    .hotspot-overlay:focus .hotspot-label { opacity: 1; }
    .hotspot-overlay.visited { opacity: 0.5; }
    .hotspot-overlay { outline: none; }
    .hotspot-overlay:focus-visible { outline: 2px solid #E8A24A; }

    /* Flavor text popup */
    .flavor-popup {
      position: fixed;
      bottom: 30%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.85);
      color: #F5E6C8;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      max-width: 380px;
      text-align: center;
      font-style: italic;
      z-index: 7500;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    .flavor-popup.visible { opacity: 1; }

    /* Main menu */
    .main-menu-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10,0,20,0.92);
      z-index: 8500;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .main-menu-overlay.visible { opacity: 1; }
    .main-menu-title {
      font-size: 2.5rem;
      color: #E8A24A;
      font-weight: 900;
      letter-spacing: 2px;
      text-shadow: 0 0 20px rgba(232,162,74,0.5);
    }
    .main-menu-subtitle {
      font-size: 1rem;
      color: rgba(245,230,200,0.7);
      margin-top: -12px;
    }
    .main-menu-btn {
      padding: 14px 48px;
      font-size: 1rem;
      font-weight: 700;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      min-width: 200px;
    }
    .main-menu-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.5); }
    .main-menu-btn-primary { background: #E8A24A; color: #1A0A00; }
    .main-menu-btn-secondary { background: transparent; color: #F5E6C8; border: 2px solid rgba(245,230,200,0.4); }

    /* Achievement grid */
    .achievement-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      max-width: 380px;
    }
    .ach-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
      gap: 4px;
      font-size: 11px;
      text-align: center;
    }
    .ach-item.locked { opacity: 0.35; }
    .ach-item-icon { font-size: 20px; }
    .ach-item-name { color: #F5E6C8; font-size: 10px; }

    /* Mute button */
    .mute-btn {
      position: fixed;
      top: 12px;
      right: 12px;
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(0,0,0,0.5);
      border: 2px solid rgba(245,230,200,0.4);
      color: #F5E6C8;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 7000;
      transition: background 0.15s;
    }
    .mute-btn:hover { background: rgba(0,0,0,0.8); }
  `;
  document.head.appendChild(style);
}

function createToastContainer(parent) {
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  toastContainer.setAttribute('aria-live', 'assertive');
  toastContainer.setAttribute('aria-atomic', 'false');
  parent.appendChild(toastContainer);
}

/**
 * Show a toast notification
 * @param {object} opts - { type, title, message, duration, icon }
 */
export function showToast({ type = 'info', title = '', message = '', duration = 3000, icon = '' }) {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    ${icon ? `<span class="toast-icon">${icon}</span>` : ''}
    <div class="toast-body">
      ${title ? `<span class="toast-title">${title}</span>` : ''}
      ${message ? `<span class="toast-msg">${message}</span>` : ''}
    </div>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-in'));
  });

  const timer = setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 280);
  }, duration);

  toastTimers.push(timer);
}

/**
 * Show flavor text popup
 * @param {string} text
 * @param {number} [duration=4000]
 */
export function showFlavor(text, duration = 4000) {
  const existing = document.querySelector('.flavor-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'flavor-popup';
  popup.textContent = `"${text}"`;
  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => popup.classList.add('visible'));
  });

  setTimeout(() => {
    popup.classList.remove('visible');
    setTimeout(() => popup.remove(), 350);
  }, duration);
}

/**
 * Create mute button
 * @param {Function} onToggle
 * @returns {HTMLButtonElement}
 */
export function createMuteButton(onToggle) {
  const btn = document.createElement('button');
  btn.className = 'mute-btn';
  btn.setAttribute('aria-label', 'Mute/Unmute zvuk');
  btn.textContent = '🔊';

  btn.addEventListener('click', () => {
    const muted = onToggle();
    btn.textContent = muted ? '🔇' : '🔊';
  });

  return btn;
}

export default { init, showToast, showFlavor, createMuteButton };
