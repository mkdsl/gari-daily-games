// input.js — setupInput() — click/touch handlers
import { AudioManager } from './audio.js';
import { isCurrentlyTyping, skipTyping } from './render.js';

export function setupInput() {
  // Global click/tap: skip typing (if not on a button)
  document.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (isCurrentlyTyping()) {
      AudioManager.resume();
      skipTyping();
    }
  });

  document.addEventListener('touchstart', (e) => {
    if (e.target.closest('button')) return;
    if (isCurrentlyTyping()) {
      AudioManager.resume();
      skipTyping();
    }
  }, { passive: true });

  // Keyboard: A/B/C/D for choices, Space/Enter for continue
  document.addEventListener('keydown', (e) => {
    // Skip typing
    if (isCurrentlyTyping()) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        skipTyping();
        return;
      }
    }

    const key = e.key.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(key)) {
      const btn = document.querySelector(`.choice-btn[data-key="${key}"]:not(.disabled)`);
      if (btn) {
        e.preventDefault();
        btn.click();
      }
    }

    if ((e.key === 'Enter' || e.key === ' ') && !isCurrentlyTyping()) {
      const continueBtn = document.querySelector('.continue-btn');
      if (continueBtn) {
        e.preventDefault();
        continueBtn.click();
      }
    }
  });
}

// attachChoiceHandlers: adds keyboard accessibility class, no global callback needed
// ui.js handles click events directly
export function attachChoiceHandlers(buttons) {
  // Add role and tabindex for accessibility
  buttons.forEach((btn, i) => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', String(i === 0 ? 0 : -1));
  });

  // Arrow key navigation between buttons
  buttons.forEach((btn, i) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && buttons[i + 1]) {
        e.preventDefault();
        buttons[i + 1].focus();
      }
      if (e.key === 'ArrowUp' && buttons[i - 1]) {
        e.preventDefault();
        buttons[i - 1].focus();
      }
    });
  });
}

export function attachContinueHandler(btn, callback) {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    AudioManager.resume();
    AudioManager.playClick();
    if (callback) callback();
  }, { once: true });
}
