/**
 * codex.js — Codex modal za Ekipa Noći
 * Prikazuje sve karte; zaključane imaju "🔒 Treba N XP" overlay
 */

import { createCardElement } from '../render.js';

// Referenca na modal element
let _modalEl = null;
let _backdropEl = null;

/**
 * Otvara Codex modal sa svim kartama.
 *
 * @param {Array}  allCards     — svih 25 karata iz game data
 * @param {Array}  unlockedIds  — niz ID-eva otključanih karata
 * @param {number} cumXP        — ukupno prikupljeni XP igrača
 */
export function openCodex(allCards, unlockedIds, cumXP) {
  // Kreiraj modal ako ne postoji
  if (!_modalEl) {
    _modalEl = document.getElementById('modal-codex');
  }
  if (!_modalEl) {
    _modalEl = document.createElement('div');
    _modalEl.id = 'modal-codex';
    _modalEl.classList.add('modal');
    document.getElementById('game-root')?.appendChild(_modalEl);
  }

  // Backdrop
  if (!_backdropEl) {
    _backdropEl = document.createElement('div');
    _backdropEl.classList.add('modal-backdrop');
    _backdropEl.addEventListener('click', closeCodex);
    document.getElementById('game-root')?.appendChild(_backdropEl);
  }

  // Build modal content
  _modalEl.innerHTML = '';
  _modalEl.classList.remove('hidden');
  _backdropEl.classList.remove('hidden');
  _backdropEl.classList.add('modal-backdrop--visible');

  // --- HEADER ---
  const header = document.createElement('div');
  header.classList.add('codex-header');

  const titleEl = document.createElement('h2');
  titleEl.classList.add('codex-header__title');
  titleEl.textContent = 'CODEX';
  header.appendChild(titleEl);

  const xpInfoEl = document.createElement('span');
  xpInfoEl.classList.add('codex-header__xp');
  xpInfoEl.textContent = `⭐ ${cumXP} XP ukupno`;
  header.appendChild(xpInfoEl);

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('codex-header__close', 'btn', 'btn--ghost');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Zatvori Codex');
  closeBtn.addEventListener('click', closeCodex);
  header.appendChild(closeBtn);

  _modalEl.appendChild(header);

  // --- FILTER TABS ---
  const filterBar = document.createElement('div');
  filterBar.classList.add('codex-filters');

  const roles = ['Sve', 'DJ', 'Host', 'Sound', 'Video', 'Security'];
  let activeFilter = 'Sve';

  roles.forEach(role => {
    const filterBtn = document.createElement('button');
    filterBtn.classList.add('codex-filter-btn');
    filterBtn.textContent = role;
    filterBtn.dataset.filter = role;
    if (role === activeFilter) filterBtn.classList.add('codex-filter-btn--active');

    filterBtn.addEventListener('click', () => {
      activeFilter = role;
      filterBar.querySelectorAll('.codex-filter-btn').forEach(b => {
        b.classList.toggle('codex-filter-btn--active', b.dataset.filter === role);
      });
      _renderCodexCards(gridEl, allCards, unlockedIds, cumXP, role);
    });

    filterBar.appendChild(filterBtn);
  });

  _modalEl.appendChild(filterBar);

  // --- STATS BAR ---
  const statsBar = document.createElement('div');
  statsBar.classList.add('codex-stats');
  const unlockedCount = allCards.filter(c => unlockedIds.includes(c.id)).length;
  statsBar.innerHTML = `
    <span class="codex-stats__item">Otključano: <strong>${unlockedCount}/${allCards.length}</strong></span>
    <span class="codex-stats__item">Zaključano: <strong>${allCards.length - unlockedCount}</strong></span>
  `;
  _modalEl.appendChild(statsBar);

  // --- CARD GRID ---
  const gridEl = document.createElement('div');
  gridEl.classList.add('codex-grid');
  _modalEl.appendChild(gridEl);

  _renderCodexCards(gridEl, allCards, unlockedIds, cumXP, 'Sve');

  // --- ESC KEY ---
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeCodex();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Renderuje karte u codex gridu po filteru.
 */
function _renderCodexCards(gridEl, allCards, unlockedIds, cumXP, filter) {
  gridEl.innerHTML = '';

  const filtered = filter === 'Sve'
    ? allCards
    : allCards.filter(c => c.role === filter);

  // Sortiraj: otključane prvo, pa locked po XP needed
  const sorted = [...filtered].sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id);
    const bUnlocked = unlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return (a.locked_until_xp || 0) - (b.locked_until_xp || 0);
  });

  sorted.forEach(card => {
    const isUnlocked = unlockedIds.includes(card.id);
    const wrapper = document.createElement('div');
    wrapper.classList.add('codex-card-wrapper');

    const cardEl = createCardElement(card, false, false, 0);
    cardEl.classList.add('codex-card');

    if (!isUnlocked) {
      cardEl.classList.add('card--locked');

      // Lock overlay
      const lockOverlay = document.createElement('div');
      lockOverlay.classList.add('card__lock-overlay');

      const xpNeeded = (card.locked_until_xp || 0) - cumXP;
      lockOverlay.innerHTML = `
        <span class="lock-overlay__icon">🔒</span>
        <span class="lock-overlay__text">Treba ${Math.max(0, xpNeeded)} XP</span>
      `;
      cardEl.appendChild(lockOverlay);
    }

    // Tooltip sa više info
    cardEl.title = isUnlocked
      ? `${card.name} — ${card.role} — Baza: ${card.base_score}`
      : `Zaključano — potrebno ${card.locked_until_xp || 0} XP`;

    wrapper.appendChild(cardEl);
    gridEl.appendChild(wrapper);
  });

  if (sorted.length === 0) {
    const emptyEl = document.createElement('p');
    emptyEl.classList.add('codex-empty');
    emptyEl.textContent = 'Nema karata za ovaj filter.';
    gridEl.appendChild(emptyEl);
  }
}

/**
 * Zatvara Codex modal.
 */
export function closeCodex() {
  if (_modalEl) {
    _modalEl.classList.add('hidden');
  }
  if (_backdropEl) {
    _backdropEl.classList.remove('modal-backdrop--visible');
    _backdropEl.classList.add('hidden');
  }
}
