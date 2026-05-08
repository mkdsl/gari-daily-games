import { CONFIG } from './config.js';
import { isTransitioning } from './ui.js';

export function initInput(onNext, onCopy) {
  const btnNext = document.getElementById('btn-next');
  const btnCopy = document.getElementById('btn-copy');

  let lastNext = 0;

  btnNext.addEventListener('click', () => {
    if (isTransitioning()) return;
    const now = Date.now();
    if (now - lastNext < CONFIG.DEBOUNCE_MS) return;
    lastNext = now;
    onNext();
  });

  btnCopy.addEventListener('click', () => {
    onCopy();
  });
}
