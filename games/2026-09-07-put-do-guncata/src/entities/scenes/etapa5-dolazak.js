/**
 * etapa5-dolazak.js — jezero epilog DOM, score reveal animacija, share trigger
 * Mount/unmount pattern, poziva end-screen.js za kompletan end flow.
 */

import { buildEpilog } from '../../content/branching-tree.js';
import { getFinaleAforizam } from '../../content/aforizmi.js';
import { BRANA_AMBIENT, BRANA_FULL } from '../../content/brand_hooks.js';
import { mountEndScreen, unmountEndScreen } from '../../ui/end-screen.js';
import { playEffect, playAmbient } from '../../audio.js';

/**
 * @typedef {{
 *   pripremljenost: number,
 *   scoreBucket: 'green'|'yellow'|'humor',
 *   route: 'brze'|'slikovitije'|'sigurnije',
 *   isNightMode: boolean,
 *   completedRuns: number
 * }} Etapa5State
 */

/**
 * @typedef {{
 *   onShareRequested?: () => void,
 *   onPlayAgain: () => void,
 *   onGuncatiGrand?: () => void
 * }} Etapa5Callbacks
 */

// ============================================================
// Mount
// ============================================================

/**
 * Montira etapa5 scenu u container.
 * Sekvenca:
 *  1. Prikaži jezero ambient vizual (lake-surface, ripples)
 *  2. Pauza 0.8s
 *  3. Prikaži dolazak tekst (3 linije, 0.6s gap)
 *  4. Brana ambient (samo za 'slikovitije' rutu: BRANA_FULL)
 *  5. Pauza za atmosferu
 *  6. Mountuj end-screen overlay
 *
 * @param {HTMLElement} container - #scene-viewport
 * @param {Etapa5State} state
 * @param {Etapa5Callbacks} callbacks
 * @returns {{ unmount: () => void }}
 */
export function mount(container, state, callbacks = {}) {
  const {
    pripremljenost = 50,
    scoreBucket = 'green',
    route = 'sigurnije',
    isNightMode = false,
    completedRuns = 0
  } = state;

  const {
    onShareRequested,
    onPlayAgain = () => {},
    onGuncatiGrand
  } = callbacks;

  let mounted = true;
  const timers = [];

  // Postavi data-stage="5" na body
  document.body.dataset.stage = '5';
  if (isNightMode) document.body.classList.add('night-mode');

  // Pokreni jezero ambient
  playAmbient(isNightMode ? 'lake_night' : 'lake');

  // === Kreiraj scene DOM ===
  const sceneEl = document.createElement('div');
  sceneEl.className = 'etapa5-scene stage-enter';
  sceneEl.setAttribute('aria-label', 'Jezero — dolazak na Guncati');

  // Pozadinski vizual
  const sceneBg = document.createElement('div');
  sceneBg.id = 'scene-bg';
  sceneEl.appendChild(sceneBg);

  // Jezero površina
  const lakeEl = document.createElement('div');
  lakeEl.className = 'lake-surface';
  lakeEl.innerHTML = `
    <div class="lake-ripple"></div>
    <div class="lake-ripple"></div>
    <div class="lake-ripple"></div>
  `;
  sceneEl.appendChild(lakeEl);

  // Zvezdano nebo (night mode)
  if (isNightMode) {
    sceneEl.appendChild(_makeStarField(24));
  }

  // Narativni tekst container
  const narrativeEl = document.createElement('div');
  narrativeEl.className = 'etapa5-narrative';
  narrativeEl.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    text-align: center;
    gap: 10px;
    z-index: 10;
    pointer-events: none;
  `;
  sceneEl.appendChild(narrativeEl);

  container.appendChild(sceneEl);

  // Epilog za pripremu teksta
  const epilog = buildEpilog({ route, scoreBucket, isNightMode });

  // === Narativna sekvenca ===
  const ARRIVE_LINES = _getArriveLines(scoreBucket);

  // Linije se pojavljuju jedna po jedna
  ARRIVE_LINES.forEach((line, i) => {
    const lineEl = document.createElement('p');
    lineEl.style.cssText = `
      font-size: 20px;
      font-weight: 500;
      color: var(--color-text-primary);
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.5s ease, transform 0.5s ease;
      margin: 0;
      line-height: 1.5;
    `;
    lineEl.textContent = line;
    narrativeEl.appendChild(lineEl);

    const t = setTimeout(() => {
      if (!mounted) return;
      lineEl.style.opacity = '1';
      lineEl.style.transform = 'translateY(0)';
      if (i === 0) playEffect('ding');
    }, 400 + i * 700);
    timers.push(t);
  });

  // Brana linija (po ruti)
  const branaDelay = 400 + ARRIVE_LINES.length * 700 + 400;
  const branaT = setTimeout(() => {
    if (!mounted) return;
    _showBranaLine(narrativeEl, route);
  }, branaDelay);
  timers.push(branaT);

  // Pokreni end-screen posle atmosfere
  const endDelay = branaDelay + 1800;
  const endT = setTimeout(() => {
    if (!mounted) return;
    // Fade out narativni tekst
    sceneEl.classList.add('stage-exit');

    setTimeout(() => {
      if (!mounted) return;
      playEffect('whoosh');

      mountEndScreen({
        score: pripremljenost,
        scoreBucket,
        route,
        isNightMode,
        completedRuns,
        onPlayAgain: () => {
          unmountEndScreen();
          if (onPlayAgain) onPlayAgain();
        },
        onGuncatiGrand: () => {
          if (onGuncatiGrand) {
            onGuncatiGrand();
          } else {
            window.open(
              'https://mkdsl.github.io/gari-daily-games/games/2026-07-26-guncati-grand/',
              '_blank',
              'noopener'
            );
          }
        }
      });
    }, 450);
  }, endDelay);
  timers.push(endT);

  // ============================================================
  // Unmount
  // ============================================================

  function unmount() {
    mounted = false;
    timers.forEach(clearTimeout);
    sceneEl.remove();
    unmountEndScreen();
  }

  return { unmount };
}

/**
 * Uklanja scenu (alias za unmount iz return-a mount-a).
 * Poziva se ako je potrebno izvana (cleanup).
 * @param {HTMLElement} container
 */
export function unmount(container) {
  container.innerHTML = '';
  unmountEndScreen();
}

// ============================================================
// Helpers
// ============================================================

/**
 * Dolazne linije po score bucketu.
 * @param {string} bucket
 * @returns {string[]}
 */
function _getArriveLines(bucket) {
  switch (bucket) {
    case 'green':  return ['Jezero.', 'Oduvek je tako izgledalo u tvojoj glavi.', 'Stigao si.'];
    case 'yellow': return ['Jezero.', 'Sunce je nisko.', 'Ali evo ga.'];
    case 'humor':  return ['Jezero.', 'Nije ovo strana na kojoj si planirao da stigneš.', 'Ali jeste jezero.'];
    default:       return ['Jezero.', 'Stigao si.'];
  }
}

/**
 * Prikazuje Braninu liniju u narativnom elementu.
 * @param {HTMLElement} parent
 * @param {string} route
 */
function _showBranaLine(parent, route) {
  const el = document.createElement('p');
  el.style.cssText = `
    font-size: 14px;
    font-style: italic;
    color: var(--color-text-muted);
    opacity: 0;
    transition: opacity 0.6s ease;
    margin-top: 12px;
    margin-bottom: 0;
    line-height: 1.5;
    max-width: 280px;
  `;

  const text = route === 'slikovitije' && BRANA_FULL.length > 0
    ? BRANA_FULL[1]  // druga rečenica — najatmosferskija
    : BRANA_AMBIENT;

  el.textContent = text;
  parent.appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
}

/**
 * Kreira zvezde za night mode.
 * @param {number} count
 * @returns {HTMLElement}
 */
function _makeStarField(count) {
  const field = document.createElement('div');
  field.className = 'star-field';
  field.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left   = `${Math.random() * 100}%`;
    star.style.top    = `${Math.random() * 60}%`;  // samo gornja polovina
    star.style.setProperty('--twinkle-dur',   `${2 + Math.random() * 3}s`);
    star.style.setProperty('--twinkle-delay', `${Math.random() * 3}s`);
    const size = 1 + Math.random() * 2;
    star.style.width  = `${size}px`;
    star.style.height = `${size}px`;
    field.appendChild(star);
  }

  return field;
}
