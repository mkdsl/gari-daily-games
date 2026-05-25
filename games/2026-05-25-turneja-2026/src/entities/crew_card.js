// crew_card.js — Card entity and DOM renderer

import { ROLE_ICONS, ROLE_DESCRIPTIONS } from '../config.js';
import { onTap } from '../input.js';

/**
 * Create a crew card data object
 * @param {string} role - one of DJ|Host|Tonac|Video|Security|MC
 * @returns {Object} card data
 */
export function createCard(role) {
  return {
    role,
    id: crypto.randomUUID(),
    selected: false,
    inSlot: false
  };
}

/**
 * Create the full starting deck (one of each role)
 * @returns {Array} 6 cards
 */
export function createFullDeck() {
  return ['DJ', 'Host', 'Tonac', 'Video', 'Security', 'MC'].map(createCard);
}

/**
 * Render a crew card as a DOM element
 * @param {Object} card - card data
 * @param {Function} onClick - tap handler receives (card)
 * @param {Object} opts - { selected, inSlot, highlight, size }
 * @returns {HTMLElement}
 */
export function renderCardDOM(card, onClick, opts = {}) {
  const el = document.createElement('div');
  el.className = 'crew-card';
  el.dataset.role = card.role;
  el.dataset.id = card.id;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', `${card.role} karta`);
  el.style.touchAction = 'manipulation';
  el.style.userSelect = 'none';
  el.style.webkitUserSelect = 'none';
  el.style.cursor = 'pointer';

  if (opts.selected) el.classList.add('selected');
  if (opts.inSlot) el.classList.add('in-slot');
  if (opts.highlight === 'synergy') el.classList.add('synergy-highlight');
  if (opts.highlight === 'contra') el.classList.add('contra-highlight');

  const roleClass = `card-role-${card.role.toLowerCase()}`;

  el.innerHTML = `
    <span class="card-icon">${ROLE_ICONS[card.role] || '🎵'}</span>
    <span class="card-role ${roleClass}">${card.role}</span>
  `;

  if (onClick && !opts.inSlot) {
    onTap(el, () => onClick(card));
  }

  return el;
}

/**
 * Update card highlight state without re-rendering
 */
export function updateCardHighlight(el, highlight) {
  el.classList.remove('synergy-highlight', 'contra-highlight');
  if (highlight === 'synergy') el.classList.add('synergy-highlight');
  if (highlight === 'contra') el.classList.add('contra-highlight');
}

/**
 * Set card selected state
 */
export function setCardSelected(el, selected) {
  if (selected) {
    el.classList.add('selected');
  } else {
    el.classList.remove('selected');
  }
}

/**
 * Get role display label (for tutorial)
 */
export function getRoleDescription(role) {
  return ROLE_DESCRIPTIONS[role] || '';
}
