/**
 * phase_display.js — Draft phase screen rendering za Ekipa Noći
 * Prikazuje aktivnu rolu, 3 karte u hand-u, Potvrdi dugme
 */

import { renderHand, updateSelectedCard } from '../render.js';

// Emoji mapa za role
const ROLE_ICONS = {
  DJ:       '🎵',
  Host:     '🎤',
  Sound:    '🔊',
  Video:    '📹',
  Security: '🛡'
};

// Role opisi za subtitle
const ROLE_DESCRIPTIONS = {
  DJ:       'Postavlja energiju večeri i bira muziku',
  Host:     'Vodi publiku i gradi atmosferu',
  Sound:    'Čisti mix, nema šanse za tehnički kiks',
  Video:    'Vizuelni spektakl na svim ekranima',
  Security: 'Drži sve pod kontrolom, ekipa je sigurna'
};

/**
 * Renderuje draft fazu — header sa rolom, 3 karte, Potvrdi dugme.
 *
 * @param {Object}   state             — game state
 * @param {string}   state.activeRole  — trenutna rola (DJ|Host|Sound|Video|Security)
 * @param {Array}    state.hand        — niz od 3 card objekta
 * @param {string}   state.eventName   — ime eventa
 * @param {number}   state.eventIndex  — 0-based index eventa
 * @param {Function} onCardSelected    — callback(cardId) kad igrač klikne kartu
 * @param {Function} onConfirm         — callback() kad potvrdi odabir
 */
export function renderDraftPhase(state, onCardSelected, onConfirm) {
  const screenEl = document.getElementById('screen-draft');
  if (!screenEl) return;

  const role        = state.activeRole || 'DJ';
  const hand        = state.hand || [];
  const eventName   = state.eventName || 'Event';
  const eventIndex  = (state.eventIndex ?? 0) + 1;
  const totalEvents = state.totalEvents || 5;

  // --- PHASE HEADER ---
  let headerEl = screenEl.querySelector('.draft-header');
  if (!headerEl) {
    headerEl = document.createElement('div');
    headerEl.classList.add('draft-header');
    screenEl.insertBefore(headerEl, screenEl.firstChild);
  }
  headerEl.innerHTML = '';

  const roleIconEl = document.createElement('span');
  roleIconEl.classList.add('draft-header__icon');
  roleIconEl.textContent = ROLE_ICONS[role] || '★';
  headerEl.appendChild(roleIconEl);

  const roleTitleEl = document.createElement('div');
  roleTitleEl.classList.add('draft-header__title');

  const roleNameEl = document.createElement('h2');
  roleNameEl.classList.add('draft-header__role-name');
  roleNameEl.textContent = role.toUpperCase();
  roleTitleEl.appendChild(roleNameEl);

  const roleDescEl = document.createElement('p');
  roleDescEl.classList.add('draft-header__role-desc');
  roleDescEl.textContent = ROLE_DESCRIPTIONS[role] || '';
  roleTitleEl.appendChild(roleDescEl);

  headerEl.appendChild(roleTitleEl);

  const eventBadgeEl = document.createElement('div');
  eventBadgeEl.classList.add('draft-header__event-badge');
  eventBadgeEl.innerHTML = `<span class="event-badge__name">${eventName}</span><span class="event-badge__progress">${eventIndex}/${totalEvents}</span>`;
  headerEl.appendChild(eventBadgeEl);

  // --- INSTRUCTION TEXT ---
  let instructionEl = screenEl.querySelector('.draft-instruction');
  if (!instructionEl) {
    instructionEl = document.createElement('p');
    instructionEl.classList.add('draft-instruction');
    const roleTabs = document.getElementById('role-tabs');
    if (roleTabs) {
      screenEl.insertBefore(instructionEl, roleTabs.nextSibling);
    } else {
      screenEl.appendChild(instructionEl);
    }
  }
  instructionEl.textContent = 'Odaberi jednog člana ekipe za ovu rolu:';

  // --- CARD HAND ---
  const handEl = document.getElementById('card-hand');
  if (!handEl) return;

  // Interno praćenje selekcije
  let currentSelectedId = state.selectedCardId || null;

  const wrappedOnCardSelected = (cardId) => {
    currentSelectedId = cardId;
    updateSelectedCard(handEl, cardId);
    _updateConfirmButton(cardId);
    if (onCardSelected) onCardSelected(cardId);
  };

  renderHand(handEl, hand, currentSelectedId, wrappedOnCardSelected);

  // --- CARD DETAILS PREVIEW ---
  let previewEl = screenEl.querySelector('.draft-preview');
  if (!previewEl) {
    previewEl = document.createElement('div');
    previewEl.classList.add('draft-preview');
    const handParent = handEl.parentElement || screenEl;
    handParent.insertBefore(previewEl, handEl.nextSibling);
  }

  // Ažuriraj preview kad se karta selektuje
  function showCardPreview(cardId) {
    const card = hand.find(c => String(c.id) === String(cardId));
    if (!card) { previewEl.innerHTML = ''; return; }

    previewEl.innerHTML = `
      <div class="preview__name">${(card.name || '').toUpperCase()}</div>
      <div class="preview__score-row">
        <span class="preview__label">Baza:</span>
        <span class="preview__value">${card.base_score ?? '?'}</span>
        <span class="preview__label">Cena:</span>
        <span class="preview__value">${card.cost ?? '?'} BP</span>
      </div>
      ${card.description ? `<p class="preview__desc">${card.description}</p>` : ''}
      ${card.synergy_tags && card.synergy_tags.length
        ? `<div class="preview__tags">${card.synergy_tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}</div>`
        : ''}
    `;
  }

  if (currentSelectedId) showCardPreview(currentSelectedId);

  // Override wrapped callback da i preview updateuje
  const originalWrapped = wrappedOnCardSelected;
  handEl.querySelectorAll('.card').forEach(cardEl => {
    cardEl.addEventListener('click', () => showCardPreview(cardEl.dataset.cardId));
  });

  // --- POTVRDI DUGME ---
  const btnConfirm = document.getElementById('btn-confirm');
  if (btnConfirm) {
    // Ukloni stare listenere kloniranjem
    const newBtn = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

    newBtn.disabled = !currentSelectedId;
    newBtn.classList.toggle('btn--disabled', !currentSelectedId);

    newBtn.addEventListener('click', () => {
      if (!currentSelectedId) return;
      newBtn.classList.add('btn--pulse');
      setTimeout(() => newBtn.classList.remove('btn--pulse'), 300);
      if (onConfirm) onConfirm(currentSelectedId);
    });
  }

  function _updateConfirmButton(cardId) {
    const btn = document.getElementById('btn-confirm');
    if (!btn) return;
    btn.disabled = !cardId;
    btn.classList.toggle('btn--disabled', !cardId);
  }

  _updateConfirmButton(currentSelectedId);
}

/**
 * Resetuje draft screen na početno stanje (brisanje preview-a itd.)
 */
export function clearDraftPhase() {
  const handEl = document.getElementById('card-hand');
  if (handEl) handEl.innerHTML = '';

  const previewEl = document.querySelector('.draft-preview');
  if (previewEl) previewEl.innerHTML = '';

  const btn = document.getElementById('btn-confirm');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('btn--disabled');
  }
}
