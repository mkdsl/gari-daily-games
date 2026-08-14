/** @fileoverview Click/touch event handlers, delegation to active screen */

import { getState } from './state.js';
import { getAudio, initAudio } from './audio.js';

/** @type {boolean} */
let _audioInitialized = false;

/** @type {AbortController|null} */
let _controller = null;

/**
 * Initialize global input handling
 */
export function initInput() {
  _controller = new AbortController();
  const sig = { signal: _controller.signal };

  // First interaction: init audio
  document.addEventListener('click', _onFirstInteraction, { once: true, ...sig });
  document.addEventListener('touchstart', _onFirstInteraction, { once: true, ...sig });

  // Touch enhancement: passive touch handlers for scroll
  document.addEventListener('touchstart', _preventDoubleTapZoom, { passive: false, ...sig });

  // Keyboard shortcuts
  document.addEventListener('keydown', _onKeyDown, sig);

  // Prevent context menu on long-press mobile
  document.addEventListener('contextmenu', (e) => e.preventDefault(), sig);

  // Visibility change for finale pause
  document.addEventListener('visibilitychange', _onVisibilityChange, sig);

  // Handle back button (mobile)
  window.addEventListener('popstate', _onPopState, sig);
}

/**
 * Remove all input listeners
 */
export function destroyInput() {
  _controller?.abort();
  _controller = null;
}

function _onFirstInteraction() {
  if (_audioInitialized) return;
  _audioInitialized = true;

  const audio = initAudio();
  if (audio) {
    audio.resume?.();
    // Play menu ambient if on menu screen
    const state = getState();
    if (state.screen === 'MENU') {
      audio.playAmbient?.('menu');
    }
  }
}

function _preventDoubleTapZoom(e) {
  // Allow default scroll behavior; prevent only double-tap zoom
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}

function _onKeyDown(e) {
  const state = getState();

  switch (e.key) {
    case 'Escape':
      // Close modals
      const overlay = document.querySelector('.modal-overlay-active');
      if (overlay) {
        e.preventDefault();
        document.querySelector('.modal-close')?.click();
      }
      break;

    case 'm':
    case 'M':
      // Toggle audio
      if (!e.ctrlKey && !e.metaKey) {
        const audio = getAudio();
        if (audio) {
          const enabled = !audio.isEnabled();
          audio.setEnabled(enabled);
          // Visual feedback
          _showInputFeedback(enabled ? '🔊 Audio ON' : '🔇 Audio OFF');
        }
      }
      break;

    case 'Enter':
    case ' ':
      // Confirm focused button
      if (document.activeElement?.tagName === 'BUTTON') {
        e.preventDefault();
        document.activeElement.click();
      }
      break;
  }
}

function _onVisibilityChange() {
  import('./ui/ui.js').then(({ handleVisibilityChange }) => {
    handleVisibilityChange();
  }).catch(() => {});
}

function _onPopState() {
  // Mobile back button — do nothing (let browser handle)
}

/**
 * Show a brief input feedback message
 * @param {string} msg
 */
function _showInputFeedback(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: #E8D5B0;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    pointer-events: none;
    transition: opacity 0.3s;
  `;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; }, 1000);
  setTimeout(() => el.remove(), 1400);
}

/**
 * Add touch feedback ripple to a button
 * @param {HTMLElement} btn
 * @param {MouseEvent|TouchEvent} e
 */
export function addRipple(btn, e) {
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  const rect = btn.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left;
  const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

/**
 * Delegate ripple effect to all buttons in container
 * @param {HTMLElement} container
 */
export function delegateRipples(container) {
  container.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('button');
    if (btn) addRipple(btn, e);
  });
  container.addEventListener('touchstart', (e) => {
    const btn = e.target.closest('button');
    if (btn) addRipple(btn, e);
  }, { passive: true });
}

/**
 * Make element draggable (for slider touch enhancement)
 * @param {HTMLInputElement} slider
 */
export function enhanceSliderTouch(slider) {
  // HTML range inputs already handle touch on mobile
  // Add audio feedback on change
  slider.addEventListener('input', () => {
    getAudio()?.playSFX('slider_click');
  });
}
