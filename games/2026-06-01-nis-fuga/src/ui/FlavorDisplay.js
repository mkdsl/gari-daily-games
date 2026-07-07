/**
 * FlavorDisplay.js — Flavor text popup system for hotspot interactions
 * Shows NPC observations, Niš details, and scene-specific commentary
 * Uses typing animation and auto-dismiss with click-to-dismiss
 * @module FlavorDisplay
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';

/** @type {HTMLElement|null} */
let container = null;

/** @type {ReturnType<typeof setTimeout>|null} */
let dismissTimer = null;

/** @type {number|null} Typing interval */
let typingTimer = null;

/** @type {boolean} Visible */
let visible = false;

const AUTOHIDE_DELAY = 5000;

/**
 * Initialize flavor display
 * @param {HTMLElement} parent
 */
export function init(parent) {
  injectStyles();

  container = document.createElement('div');
  container.className = 'flavor-display';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-label', 'Flavor tekst');
  parent.appendChild(container);

  // Listen for flavor events from hotspots
  EventBus.on(EVENTS.HOTSPOT_FLAVOR, ({ text }) => {
    show(text);
  });

  // Dismiss on click
  container.addEventListener('click', dismiss);
  container.addEventListener('touchend', (e) => {
    e.preventDefault();
    dismiss();
  });

  // Hide on scene transitions
  EventBus.on(EVENTS.SCENE_TRANSITION_START, () => dismiss(true));
}

function injectStyles() {
  if (document.getElementById('flavor-display-styles')) return;
  const style = document.createElement('style');
  style.id = 'flavor-display-styles';
  style.textContent = `
    .flavor-display {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      max-width: 420px;
      width: calc(100% - 40px);
      background: rgba(8, 0, 18, 0.92);
      border: 1px solid rgba(232,162,74,0.4);
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 14px;
      font-style: italic;
      color: rgba(245,230,200,0.9);
      line-height: 1.7;
      text-align: center;
      z-index: 500;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    .flavor-display.visible {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      pointer-events: auto;
    }
    .flavor-display .flavor-icon {
      font-size: 20px;
      margin-bottom: 6px;
      display: block;
    }
    .flavor-display .flavor-text {
      display: block;
    }
    .flavor-display .flavor-dismiss {
      display: block;
      margin-top: 8px;
      font-size: 10px;
      color: rgba(245,230,200,0.35);
      font-style: normal;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Show a flavor text with typing animation
 * @param {string} text
 * @param {string} [icon]
 */
export function show(text, icon = '💬') {
  if (!container) return;

  clearTimers();

  // Sanitize
  const cleanText = String(text).slice(0, 400);

  container.innerHTML = `
    <span class="flavor-icon">${icon}</span>
    <span class="flavor-text"></span>
    <span class="flavor-dismiss">Klikni za zatvaranje</span>
  `;

  const textEl = container.querySelector('.flavor-text');
  container.classList.add('visible');
  visible = true;

  // Typing animation
  let i = 0;
  const speed = 18;
  function step() {
    if (!textEl) return;
    if (i <= cleanText.length) {
      textEl.textContent = cleanText.slice(0, i);
      i++;
      typingTimer = setTimeout(step, speed);
    } else {
      typingTimer = null;
      scheduleAutoDismiss();
    }
  }
  step();
}

/**
 * Dismiss flavor popup
 * @param {boolean} [immediate]
 */
export function dismiss(immediate = false) {
  clearTimers();
  if (!container || !visible) return;

  visible = false;
  container.classList.remove('visible');
}

function scheduleAutoDismiss() {
  dismissTimer = setTimeout(() => dismiss(), AUTOHIDE_DELAY);
}

function clearTimers() {
  if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
}

export default { init, show, dismiss };
