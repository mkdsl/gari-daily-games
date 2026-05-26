// input.js — setupInput() — click/touch handlers za opcije
import { AudioManager } from './audio.js';
import { isCurrentlyTyping, skipTyping } from './render.js';

let choiceCallback = null;
let continueCallback = null;

export function setupInput() {
  // Global click/tap: skip typing
  document.addEventListener('click', (e) => {
    // Don't intercept choice buttons or continue button
    if (e.target.closest('.choice-btn') || e.target.closest('.continue-btn') || e.target.closest('.share-btn')) {
      return;
    }
    if (isCurrentlyTyping()) {
      AudioManager.resume();
      skipTyping();
    }
  });

  // Keyboard support for choices
  document.addEventListener('keydown', (e) => {
    if (isCurrentlyTyping()) {
      if (e.key === ' ' || e.key === 'Enter') {
        skipTyping();
        return;
      }
    }

    const key = e.key.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(key)) {
      const btn = document.querySelector(`.choice-btn[data-key="${key}"]`);
      if (btn && !btn.classList.contains('disabled')) {
        btn.click();
      }
    }

    if (e.key === 'Enter' || e.key === ' ') {
      const continueBtn = document.querySelector('.continue-btn');
      if (continueBtn) continueBtn.click();
    }
  });
}

export function onChoiceSelected(callback) {
  choiceCallback = callback;
}

export function onContinue(callback) {
  continueCallback = callback;
}

export function attachChoiceHandlers(buttons) {
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.classList.contains('disabled')) return;
      AudioManager.resume();
      AudioManager.playClick();
      // Disable all choices after selection
      buttons.forEach(b => b.classList.add('disabled'));
      const key = btn.dataset.key;
      if (choiceCallback) choiceCallback(key);
    });
  });
}

export function attachContinueHandler(btn, callback) {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    AudioManager.resume();
    AudioManager.playClick();
    if (callback) callback();
  });
}
