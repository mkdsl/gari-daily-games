// ui/ending-screen.js — Ending screen: animated score, HOF best, legendary glow

import { getEndingType, getTagline, getCTA, getEndingEmoji } from '../systems/ending.js';
import { shareScore } from '../share.js';
import { BRAND } from '../content/brand_hooks.js';
import { loadPersistentState } from '../state.js';

/**
 * Animate a numeric counter from `from` to `to` in ~duration ms.
 * Updates `el.textContent` each frame. On completion, populates srOnly
 * with the final accessible label so screen readers announce once.
 * @param {HTMLElement} el
 * @param {number} from
 * @param {number} to
 * @param {number} duration
 * @param {HTMLElement|null} srOnly - hidden span for SR announcement
 */
function animateCounter(el, from, to, duration, srOnly) {
  const startTime = performance.now();

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(from + (to - from) * eased);
    el.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (srOnly) {
      srOnly.textContent = `Vibe Score: ${to} od 100`;
    }
  }

  requestAnimationFrame(step);
}

/**
 * Build the mini HOF "best score" line shown under the CTA.
 * Reads persistent state directly (no state param needed).
 * @param {number} currentScore - current run's score, used to highlight if new best
 * @returns {string} HTML fragment
 */
function buildBestScoreLine(currentScore) {
  const persistent = loadPersistentState();
  const hof        = persistent.hallOfFame ?? [];
  if (!hof.length) return '';

  const maxScore  = Math.max(...hof);
  const isNewBest = currentScore > maxScore || hof.length === 1;

  if (isNewBest && currentScore >= maxScore) {
    return `<p class="ending-best-score ending-new-best">🏆 Novi rekord!</p>`;
  }
  return `<p class="ending-best-score">Tvoj best: <strong>${maxScore}</strong>/100</p>`;
}

/**
 * Show the ending screen with animated score counter, HOF best, and type-based styling.
 * @param {number} vibeScore
 * @param {string} eventType
 * @param {boolean} crashed
 * @param {() => void} onRestart
 */
export function showEndingScreen(vibeScore, eventType, crashed, onRestart) {
  const screen = document.getElementById('ending-screen');
  if (!screen) return;

  const clampedScore = Math.max(0, vibeScore);
  const type         = getEndingType(vibeScore, crashed);
  const tagline      = getTagline(type);
  const cta          = getCTA(type, eventType);
  const emoji        = getEndingEmoji(type);
  const bestLine     = buildBestScoreLine(clampedScore);

  // Extra CSS class for crash and legendary endings
  const extraClass = crashed
    ? 'ending-crash'
    : clampedScore >= 85 ? 'ending-legendary' : '';

  screen.innerHTML = `
    <div class="ending-card ending-${type}${extraClass ? ' ' + extraClass : ''}">
      <div class="ending-label">Vibe Score</div>

      <div class="ending-score-wrap">
        <span class="ending-emoji" aria-hidden="true">${emoji}</span>
        <span class="ending-score-counter" id="score-counter">0</span>
        <span class="ending-max">/100</span>
        <span class="sr-only" id="score-sr-announce"></span>
      </div>

      <div class="ending-tagline">${tagline}</div>
      <div class="ending-cta"><a href="${cta.url}" target="_blank" rel="noopener">${cta.text}</a></div>

      ${bestLine}

      <div class="ending-actions">
        <button id="btn-share" class="btn btn-primary" aria-label="Podeli svoj Crew Recruiter score">
          Podeli score
        </button>
        <button id="btn-restart" class="btn btn-secondary">
          Igraj ponovo
        </button>
      </div>

      <div id="share-toast" class="toast hidden"></div>
      <div class="ending-play-url">
        Probaj: <a href="${BRAND.PLAY_URL}" target="_blank" rel="noopener">${BRAND.PLAY_URL}</a>
      </div>
    </div>
  `;

  screen.classList.remove('hidden');
  document.getElementById('game-screen')?.classList.add('hidden');

  // Start animated counter (0 → clampedScore in 1.5s)
  // srEl is populated on completion so screen readers announce once, not every frame
  const counterEl = document.getElementById('score-counter');
  const srEl      = document.getElementById('score-sr-announce');
  if (counterEl) {
    animateCounter(counterEl, 0, clampedScore, 1500, srEl);
  }

  // Share button
  document.getElementById('btn-share')?.addEventListener('click', () => {
    shareScore(
      clampedScore,
      (method) => {
        const msg = method === 'clipboard' ? 'Link kopiran, podeli ga!' : 'Podeljeno!';
        showLocalToast(msg);
      },
      () => showLocalToast('Deljenje nije uspelo.')
    );
  });

  document.getElementById('btn-restart')?.addEventListener('click', onRestart);
}

/**
 * Show toast inside the ending screen (different from global #toast).
 * @param {string} msg
 */
function showLocalToast(msg) {
  const t = document.getElementById('share-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('toast-visible');
  setTimeout(() => {
    t.classList.remove('toast-visible');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, 2500);
}

/** Hide ending screen. */
export function hideEndingScreen() {
  const screen = document.getElementById('ending-screen');
  if (screen) screen.classList.add('hidden');
}
