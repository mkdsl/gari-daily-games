// ui/vibe-meter.js — Animated Vibe Score bar

import { VIBE_MAX } from '../config.js';

const barEl    = document.getElementById('vibe-bar');
const scoreEl  = document.getElementById('vibe-score-display');
const container = document.getElementById('vibe-container');

/**
 * Update the vibe meter display.
 * @param {number} vibeScore
 * @param {number} [delta] - positive or negative delta for bump animation
 */
export function updateVibeMeter(vibeScore, delta = 0) {
  const clamped = Math.max(0, Math.min(VIBE_MAX, vibeScore));
  const pct     = (clamped / VIBE_MAX) * 100;

  if (barEl) {
    barEl.style.width = `${pct}%`;

    // Color by range
    barEl.classList.remove('vibe-green', 'vibe-yellow', 'vibe-red');
    if (clamped >= 60)      barEl.classList.add('vibe-green');
    else if (clamped >= 30) barEl.classList.add('vibe-yellow');
    else                    barEl.classList.add('vibe-red');
  }

  if (scoreEl) {
    scoreEl.textContent = String(Math.round(clamped));
    scoreEl.setAttribute('aria-live', 'polite');
  }

  // Bump animation
  if (container && delta !== 0) {
    container.classList.remove('vibe-bump-up', 'vibe-bump-down');
    void container.offsetWidth; // reflow
    container.classList.add(delta > 0 ? 'vibe-bump-up' : 'vibe-bump-down');
    container.addEventListener('animationend', () => {
      container.classList.remove('vibe-bump-up', 'vibe-bump-down');
    }, { once: true });
  }
}
