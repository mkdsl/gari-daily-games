/**
 * end-screen.js — epilog varijanta prikaz, score reveal animacija, Guncati Grand crosslink
 * Poziva se iz etapa5-dolazak.js; može i direktno.
 */

import { buildEpilog } from '../content/branching-tree.js';
import { getFinaleAforizam } from '../content/aforizmi.js';
import { GUNCATI_GRAND_LINK, GUNCATI_GRAND_CTA, MASTERCLASS_CTA } from '../content/brand_hooks.js';
import { mountShareWidget } from './share-card.js';
import { trackCompletedRoute, getVariantsRemaining } from '../systems/prestige.js';

/**
 * @typedef {{
 *   score: number,
 *   scoreBucket: 'green'|'yellow'|'humor',
 *   route: 'brze'|'slikovitije'|'sigurnije',
 *   isNightMode: boolean,
 *   completedRuns: number,
 *   onPlayAgain: () => void,
 *   onGuncatiGrand: () => void
 * }} EndScreenOptions
 */

const BUCKET_ICONS = {
  green:  '🌿',
  yellow: '⏰',
  humor:  '🗺️'
};

const BUCKET_NAMES = {
  green:  'Spreman putnik',
  yellow: 'Zamišljeni putnik',
  humor:  'Slobodni putnik'
};

// ============================================================
// Mount / unmount
// ============================================================

/** @type {HTMLElement|null} */
let endScreenEl = null;

/**
 * Mountuje end screen overlay na body.
 * Animira score count-up, prikazuje epilog, share dugme i CTA.
 *
 * @param {EndScreenOptions} opts
 */
export function mountEndScreen(opts) {
  const {
    score,
    scoreBucket = 'green',
    route = 'sigurnije',
    isNightMode = false,
    completedRuns = 0,
    onPlayAgain,
    onGuncatiGrand
  } = opts;

  // Ukloni ako postoji
  unmountEndScreen();

  const epilog = buildEpilog({ route, scoreBucket, isNightMode });
  const aforizam = getFinaleAforizam(route, scoreBucket);
  const bucketIcon = BUCKET_ICONS[scoreBucket] || '🌿';
  const bucketName = BUCKET_NAMES[scoreBucket] || 'Putnik';
  const masterclass = MASTERCLASS_CTA[scoreBucket] || MASTERCLASS_CTA.green;

  trackCompletedRoute(route, isNightMode);
  const variantsLeft = getVariantsRemaining();

  // Postavi data-bucket na body za CSS tokene
  document.body.dataset.bucket = scoreBucket;

  const el = document.createElement('div');
  el.className = 'end-screen';
  el.setAttribute('role', 'main');
  el.setAttribute('aria-label', 'Kraj putovanja');
  el.setAttribute('tabindex', '-1');

  el.innerHTML = `
    <div class="end-screen__inner">
      <!-- Bucket ikonica -->
      <div class="end-screen__bucket-icon" aria-hidden="true">${bucketIcon}</div>

      <!-- Score -->
      <div class="end-screen__score-wrap">
        <div class="end-screen__score-label">Pripremljenost</div>
        <div class="end-screen__score-value" id="es-score-value">0<span class="end-screen__score-suffix">%</span></div>
      </div>

      <!-- Bucket naziv -->
      <div class="end-screen__score-label">${_escape(bucketName)}</div>

      <!-- Epilog tekst -->
      <h1 class="end-screen__title">${_escape(epilog.title)}</h1>
      <p class="end-screen__flavor">${_escape(epilog.flavor)}</p>
      <p class="end-screen__body">${_escape(epilog.body)}</p>
      ${epilog.closing ? `<p class="end-screen__closing">${_escape(epilog.closing)}</p>` : ''}

      <!-- Aforizam -->
      <blockquote class="end-screen__aforizam">„${_escape(aforizam)}"</blockquote>

      <!-- Share card -->
      <div id="es-share-wrap"></div>

      <!-- Replay hook — neistražene varijante -->
      ${variantsLeft.length > 0 ? `
      <div class="end-screen__variants-hint" aria-label="Neistražene varijante puta">
        🗺️ Ostale ti ${_escape(variantsLeft.join(' + '))}
      </div>` : ''}

      <!-- Akcijski dugmad -->
      <div class="end-screen__actions">
        <a class="btn-primary" id="es-btn-masterclass" href="${_escape(masterclass.url)}" target="_blank" rel="noopener" aria-label="${_escape(masterclass.label)}">
          🌱 ${_escape(masterclass.text)}
        </a>
        <button class="btn-primary" id="es-btn-grand" type="button" style="margin-top:0.5rem">
          🎮 ${_escape(GUNCATI_GRAND_CTA)}
        </button>
        <button class="btn-secondary" id="es-btn-again" type="button">
          🔄 Odigraj ponovo${completedRuns > 0 ? ` (${completedRuns}. put)` : ''}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(el);
  endScreenEl = el;

  // Fade in
  requestAnimationFrame(() => {
    el.classList.add('visible');
    el.focus();
  });

  // Score count-up animacija (0 → score, 1.5s)
  _animateScore(el, score, 1500);

  // Mount share widget
  const shareWrap = el.querySelector('#es-share-wrap');
  if (shareWrap) {
    mountShareWidget(shareWrap, { score, scoreBucket, route });
  }

  // Event listeners
  el.querySelector('#es-btn-grand').addEventListener('click', () => {
    if (onGuncatiGrand) onGuncatiGrand();
    else window.open(GUNCATI_GRAND_LINK, '_blank', 'noopener');
  });

  const btnAgain = el.querySelector('#es-btn-again');
  if (btnAgain) {
    btnAgain.addEventListener('click', () => {
      unmountEndScreen();
      if (onPlayAgain) onPlayAgain();
    });
  }

  // Keyboard: Escape = odigraj ponovo
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      unmountEndScreen();
      if (onPlayAgain) onPlayAgain();
    }
  });
}

/**
 * Uklanja end screen sa body-ja.
 */
export function unmountEndScreen() {
  if (!endScreenEl) return;
  endScreenEl.classList.remove('visible');
  const el = endScreenEl;
  endScreenEl = null;
  delete document.body.dataset.bucket;
  setTimeout(() => el.remove(), 550);
}

// ============================================================
// Score count-up animacija
// ============================================================

/**
 * Animira score od 0 do target vrednosti.
 * @param {HTMLElement} container
 * @param {number} target
 * @param {number} duration - ms
 */
function _animateScore(container, target, duration) {
  const el = container.querySelector('#es-score-value');
  if (!el) return;

  const clamped = Math.max(0, Math.min(100, Math.round(target)));
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * clamped);

    el.innerHTML = `${current}<span class="end-screen__score-suffix">%</span>`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.innerHTML = `${clamped}<span class="end-screen__score-suffix">%</span>`;
    }
  }

  requestAnimationFrame(tick);
}

// ============================================================
// Utility
// ============================================================

/**
 * @param {string} str
 * @returns {string}
 */
function _escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
