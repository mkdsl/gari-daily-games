/**
 * DialogRenderer.js — Speech bubble, NPC portrait, and dialog text rendering
 * Handles typing animation and dialog node display
 * @module DialogRenderer
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';
import SfxPlayer from '../audio/SfxPlayer.js';

/** @type {HTMLElement|null} */
let container = null;

/** @type {HTMLElement|null} */
let bubbleEl = null;

/** @type {HTMLElement|null} */
let portraitEl = null;

/** @type {HTMLElement|null} */
let speakerEl = null;

/** @type {HTMLElement|null} */
let textEl = null;

/** @type {number|null} Typing interval */
let typingTimer = null;

/** @type {string} Full text of the current dialog node */
let currentFullText = '';

/** @type {Function|null} Completion callback for current typing animation */
let currentOnComplete = null;

/**
 * Initialize dialog renderer
 * @param {HTMLElement} parent
 */
export function init(parent) {
  container = document.createElement('div');
  container.className = 'dialog-container';
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'true');
  container.innerHTML = buildHTML();
  parent.appendChild(container);

  bubbleEl = container.querySelector('.dialog-bubble');
  portraitEl = container.querySelector('.dialog-portrait');
  speakerEl = container.querySelector('.dialog-speaker');
  textEl = container.querySelector('.dialog-text');

  // Listen for dialog node events
  EventBus.on(EVENTS.DIALOG_NODE, ({ node }) => {
    showNode(node);
  });

  EventBus.on(EVENTS.DIALOG_END, () => {
    hide();
  });

  EventBus.on(EVENTS.SCENE_TRANSITION_START, () => {
    hide(true);
  });

  // Click on bubble to skip typing animation
  bubbleEl?.addEventListener('click', skipTyping);
  bubbleEl?.addEventListener('touchend', (e) => {
    e.preventDefault();
    skipTyping();
  });
}

function buildHTML() {
  return `
    <div class="dialog-portrait-wrap">
      <div class="dialog-portrait" aria-hidden="true"></div>
    </div>
    <div class="dialog-bubble" role="article">
      <div class="dialog-speaker"></div>
      <div class="dialog-text" aria-label="Dialog text"></div>
      <div class="dialog-continue-hint">Klikni za nastavak...</div>
    </div>
  `;
}

/**
 * Show a dialog node
 * @param {object} node
 */
export function showNode(node) {
  if (!container) return;

  container.classList.add('dialog-visible');
  container.classList.remove('dialog-hidden');

  // Update portrait
  if (portraitEl) {
    portraitEl.className = `dialog-portrait npc-portrait-${node.portrait ?? 'default'}`;
  }

  // Update speaker name
  if (speakerEl) {
    speakerEl.textContent = node.speaker ?? '';
  }

  // Clear previous text
  if (textEl) {
    textEl.textContent = '';
  }

  // Hide continue hint during typing
  const hint = container.querySelector('.dialog-continue-hint');
  if (hint) hint.style.opacity = '0';

  SfxPlayer.play('dialog_open');

  // Save full text and completion callback in closure for skipTyping()
  currentFullText = node.text ?? '';
  currentOnComplete = () => {
    if (hint) hint.style.opacity = '0.6';
  };

  // Start typing animation
  typeText(currentFullText, currentOnComplete);
}

/**
 * Typing animation
 * @param {string} text
 * @param {Function} onComplete
 */
function typeText(text, onComplete) {
  clearTimeout(typingTimer);
  if (!textEl) return;

  let i = 0;
  const speed = 22; // ms per character

  function step() {
    if (i <= text.length) {
      textEl.textContent = text.slice(0, i);
      i++;
      typingTimer = setTimeout(step, speed);
    } else {
      typingTimer = null;
      onComplete?.();
    }
  }

  step();
}

/**
 * Skip typing and show full text immediately
 */
function skipTyping() {
  if (typingTimer !== null) {
    clearTimeout(typingTimer);
    typingTimer = null;
    // Show full text immediately
    if (textEl) textEl.textContent = currentFullText;
    // Fire completion callback (shows "Klikni za nastavak..." hint)
    currentOnComplete?.();
  }
}

/**
 * Hide dialog
 * @param {boolean} [immediate]
 */
export function hide(immediate = false) {
  clearTimeout(typingTimer);
  typingTimer = null;

  if (!container) return;

  if (immediate) {
    container.classList.remove('dialog-visible');
    container.classList.add('dialog-hidden');
  } else {
    container.classList.add('dialog-hiding');
    setTimeout(() => {
      container.classList.remove('dialog-visible', 'dialog-hiding');
      container.classList.add('dialog-hidden');
    }, 300);
  }
}

export default { init, showNode, hide };
