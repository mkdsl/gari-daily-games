// input.js — setupInput, choice click/touch handlers
import { playClick } from './audio.js';

let _choiceCallback = null;
let _skipCallback = null;

export function setupInput() {
  // Choice delegation — na #choices containeru
  const choices = document.getElementById('choices');
  choices.addEventListener('click', (e) => {
    const btn = e.target.closest('.choice-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    playClick();
    if (_choiceCallback) _choiceCallback(idx);
  });

  // Skip typing — klik/tap na narration area
  const narration = document.getElementById('narration');
  narration.addEventListener('click', () => {
    if (_skipCallback) _skipCallback();
  });

  const dialogue = document.getElementById('dialogue');
  dialogue.addEventListener('click', () => {
    if (_skipCallback) _skipCallback();
  });
}

export function onChoice(cb) { _choiceCallback = cb; }
export function onSkip(cb)   { _skipCallback = cb; }
export function clearCallbacks() {
  _choiceCallback = null;
  _skipCallback = null;
}
