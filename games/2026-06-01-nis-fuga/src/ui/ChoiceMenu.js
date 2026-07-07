/**
 * ChoiceMenu.js — Dialog choice buttons with hover, disabled, and tooltip states
 * Renders choice options from dialog nodes
 * @module ChoiceMenu
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';
import DialogEngine from '../engine/DialogEngine.js';
import SfxPlayer from '../audio/SfxPlayer.js';

/** @type {HTMLElement|null} */
let container = null;

/** @type {boolean} Locked while animating */
let locked = false;

/**
 * Initialize choice menu
 * @param {HTMLElement} parent
 */
export function init(parent) {
  container = document.createElement('div');
  container.className = 'choice-menu';
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', 'Izbori');
  parent.appendChild(container);

  // Listen for dialog nodes
  EventBus.on(EVENTS.DIALOG_NODE, ({ choices }) => {
    render(choices);
  });

  EventBus.on(EVENTS.DIALOG_END, () => {
    clear();
  });

  EventBus.on(EVENTS.SCENE_TRANSITION_START, () => {
    clear();
    locked = true;
  });

  EventBus.on(EVENTS.SCENE_READY, () => {
    locked = false;
  });
}

/**
 * Render choice buttons
 * @param {Array} choices
 */
function render(choices) {
  if (!container) return;
  container.innerHTML = '';

  if (!choices || choices.length === 0) return;

  choices.forEach((choice, idx) => {
    const btn = createChoiceButton(choice, idx);
    container.appendChild(btn);
  });

  // Animate in
  container.classList.add('choices-entering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => container.classList.remove('choices-entering'));
  });
}

/**
 * Create a single choice button element
 * @param {object} choice
 * @param {number} idx
 * @returns {HTMLButtonElement}
 */
function createChoiceButton(choice, idx) {
  const btn = document.createElement('button');
  btn.className = 'choice-btn';
  btn.dataset.choiceId = choice.id;
  btn.setAttribute('tabindex', '0');

  if (!choice.available) {
    btn.disabled = true;
    btn.classList.add('choice-gated');
    btn.setAttribute('aria-disabled', 'true');
  }

  // Build button content
  const textSpan = document.createElement('span');
  textSpan.className = 'choice-text';
  textSpan.textContent = choice.text;
  btn.appendChild(textSpan);

  // Requirements badge
  if (!choice.available && choice.disabledReason) {
    const badge = document.createElement('span');
    badge.className = 'choice-requirement';
    badge.textContent = choice.disabledReason;
    btn.appendChild(badge);

    // Add tooltip
    btn.title = choice.disabledReason;
  }

  // Tooltip from choice def
  if (choice.tooltip && choice.available) {
    const tip = document.createElement('span');
    tip.className = 'choice-tooltip';
    tip.textContent = choice.tooltip;
    btn.appendChild(tip);
  }

  // Effects preview
  if (choice.effects && choice.available) {
    const effectsEl = buildEffectsPreview(choice.effects);
    if (effectsEl) btn.appendChild(effectsEl);
  }

  // Event handlers
  btn.addEventListener('click', () => handleChoiceClick(choice.id, choice.available));
  btn.addEventListener('mouseenter', () => {
    if (!choice.available) {
      SfxPlayer.play('gated');
    }
    EventBus.emit(EVENTS.DIALOG_CHOICE_HOVER, { choice });
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChoiceClick(choice.id, choice.available);
    }
  });

  return btn;
}

/**
 * Build effects preview element
 * @param {object} effects
 * @returns {HTMLElement|null}
 */
function buildEffectsPreview(effects) {
  const parts = [];
  const labels = { time: '⏱', patience: '😤', morale: '👥', reputation: '⭐' };

  for (const [key, val] of Object.entries(effects)) {
    if (!(key in labels)) continue;
    const sign = val > 0 ? '+' : '';
    const cls = val > 0 ? 'effect-pos' : 'effect-neg';
    parts.push(`<span class="${cls}">${labels[key]}${sign}${val}</span>`);
  }

  if (parts.length === 0) return null;

  const el = document.createElement('span');
  el.className = 'choice-effects';
  el.innerHTML = parts.join(' ');
  return el;
}

/**
 * Handle choice click
 * @param {string} choiceId
 * @param {boolean} available
 */
function handleChoiceClick(choiceId, available) {
  if (locked) return;
  if (!available) {
    SfxPlayer.play('gated');
    return;
  }

  locked = true;
  setTimeout(() => { locked = false; }, 500);

  // Animate button
  const btn = container?.querySelector(`[data-choice-id="${choiceId}"]`);
  if (btn) {
    btn.classList.add('choice-selected');
  }

  DialogEngine.selectChoice(choiceId);
}

/**
 * Clear all choices
 */
export function clear() {
  if (container) {
    container.innerHTML = '';
  }
}

export default { init, clear };
