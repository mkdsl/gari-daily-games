/**
 * choice-prompt.js — etapa3 tri-table choice UI (overlay modul)
 * Prikazuje tri putokaza kao sign card-ove.
 */

import { ROUTES } from '../content/branching-tree.js';

/**
 * @typedef {{
 *   onChoice: (routeKey: string) => void
 * }} ChoicePromptOptions
 */

/**
 * Renderuje choice prompt overlay u containeru.
 * Igrač bira jednu od tri rute (brze/slikovitije/sigurnije).
 * Svaki izbor poziva onChoice(routeKey) i skida overlay.
 *
 * @param {HTMLElement} container - #scene-viewport ili #overlay-layer
 * @param {ChoicePromptOptions} opts
 * @returns {{ close: () => void, mount: () => void }}
 */
export function createChoicePrompt(container, opts) {
  const { onChoice } = opts;

  const el = document.createElement('div');
  el.className = 'choice-prompt';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Odaberi rutu');

  // Kreiraj kartice iz ROUTES definicije
  const cardsHTML = Object.entries(ROUTES)
    .map(([key, route]) => `
      <button
        class="sign-card"
        data-route="${key}"
        aria-label="${_escape(route.label)}: ${_escape(route.description)}"
      >
        <span class="sign-card__icon" aria-hidden="true">${route.icon}</span>
        <div class="sign-card__body">
          <div class="sign-card__label">${_escape(route.label)}</div>
          <div class="sign-card__desc">${_escape(route.description)}</div>
          <div class="sign-card__hint">${_escape(route.deltaHint)}</div>
        </div>
        <span class="sign-card__arrow" aria-hidden="true">›</span>
      </button>
    `).join('');

  el.innerHTML = `
    <p class="choice-prompt__title">Kuda ideš?</p>
    <div class="choice-prompt__cards">
      ${cardsHTML}
    </div>
  `;

  container.appendChild(el);

  // Activiraj overlay layer pointer-events
  const overlayLayer = el.closest('#overlay-layer') || container;
  overlayLayer.classList.add('has-overlay');

  // Keyboard trap — Tab ostaje unutar overlay-a
  const focusable = el.querySelectorAll('button');
  let trapEnabled = false;

  function handleKeydown(e) {
    if (!trapEnabled) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const els = Array.from(el.querySelectorAll('button'));
      const idx = els.indexOf(document.activeElement);
      const next = e.shiftKey
        ? (idx - 1 + els.length) % els.length
        : (idx + 1) % els.length;
      els[next].focus();
    }

    // Strelice gore/dole kao alternativa Tab-u
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const els = Array.from(el.querySelectorAll('button'));
      const idx = els.indexOf(document.activeElement);
      els[(idx + 1) % els.length].focus();
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const els = Array.from(el.querySelectorAll('button'));
      const idx = els.indexOf(document.activeElement);
      els[(idx - 1 + els.length) % els.length].focus();
    }
  }

  // Click handler
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-route]');
    if (!btn) return;
    const routeKey = btn.dataset.route;
    if (!ROUTES[routeKey]) return;
    close(routeKey);
  });

  document.addEventListener('keydown', handleKeydown);

  let closed = false;

  function close(routeKey = null) {
    if (closed) return;
    closed = true;
    trapEnabled = false;
    document.removeEventListener('keydown', handleKeydown);

    el.classList.remove('visible');
    overlayLayer.classList.remove('has-overlay');

    setTimeout(() => {
      el.remove();
      if (routeKey) onChoice(routeKey);
    }, 350);
  }

  function mount() {
    requestAnimationFrame(() => {
      el.classList.add('visible');
      trapEnabled = true;
      // Focus prvu karticu
      const firstBtn = el.querySelector('button');
      if (firstBtn) firstBtn.focus();
    });
  }

  return { close: () => close(null), mount };
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
