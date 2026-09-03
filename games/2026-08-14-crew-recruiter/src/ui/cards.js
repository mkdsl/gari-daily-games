// ui/cards.js — Card DOM rendering, vintage concert flyer style

import { SLOT_DISPLAY_NAMES } from '../config.js';

/** @type {Object.<string, string>} */
const ROLE_EMOJIS = {
  tonac:        '🔊',
  host:         '🎙',
  content:      '📸',
  logistika:    '📦',
  obezbedjenje: '🔒'
};

/**
 * Build the rarity badge element (only for rare/signature).
 * @param {string} rarity
 * @returns {HTMLElement|null}
 */
function buildRarityBadge(rarity) {
  if (rarity !== 'rare' && rarity !== 'signature') return null;
  const badge = document.createElement('div');
  badge.className = `card-rarity-badge badge-${rarity}`;
  badge.textContent = rarity === 'signature' ? '✦ SIG' : '★ RARE';
  return badge;
}

/**
 * Build the translucent role background overlay.
 * @param {string} role
 * @returns {HTMLElement}
 */
function buildRoleBg(role) {
  const bg = document.createElement('div');
  bg.className = `card-role-bg role-bg-${role}`;
  bg.setAttribute('aria-hidden', 'true');
  return bg;
}

/**
 * Create a full card DOM element with vintage concert flyer styling.
 * @param {import('../entities/card.js').Card} card
 * @returns {HTMLElement}
 */
export function createCardElement(card) {
  const el = document.createElement('div');
  el.className   = `card card-rarity-${card.rarity} card-role-${card.role}`;
  el.dataset.cardId   = card.id;
  el.dataset.cardRole = card.role;
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label',
    `${card.name}, ${SLOT_DISPLAY_NAMES[card.role] || card.role}, power ${card.power}`
  );

  // Role-tinted translucent background overlay
  el.appendChild(buildRoleBg(card.role));

  // Rarity badge (top-right, visible only for rare/signature)
  const badge = buildRarityBadge(card.rarity);
  if (badge) el.appendChild(badge);

  // Role tag (top-left colored pill)
  const roleTag = document.createElement('div');
  roleTag.className   = `card-role-tag role-${card.role}`;
  const roleEmoji = ROLE_EMOJIS[card.role] || '';
  roleTag.textContent = `${roleEmoji} ${SLOT_DISPLAY_NAMES[card.role] || card.role}`;
  el.appendChild(roleTag);

  // Card name
  const nameEl = document.createElement('div');
  nameEl.className   = 'card-name';
  nameEl.textContent = card.name;
  el.appendChild(nameEl);

  // Power — large serif number, centrepiece
  const powerEl = document.createElement('div');
  powerEl.className   = 'card-power';
  powerEl.textContent = card.power;
  powerEl.setAttribute('aria-label', `Power: ${card.power}`);
  el.appendChild(powerEl);

  // Vintage divider line
  const divider = document.createElement('div');
  divider.className = 'card-divider';
  divider.setAttribute('aria-hidden', 'true');
  el.appendChild(divider);

  // Flavor text
  const flavorEl = document.createElement('div');
  flavorEl.className   = 'card-flavor';
  flavorEl.textContent = card.flavor;
  el.appendChild(flavorEl);

  // Keyboard: Enter/Space selects the card for click-to-slot assignment.
  // Uses the card's own center coords so drag tracking doesn't misfire at (0,0).
  el.addEventListener('keydown', e => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: cx, clientY: cy }));
      el.dispatchEvent(new PointerEvent('pointerup',   { bubbles: true, pointerId: 1, clientX: cx, clientY: cy }));
    }
  });

  return el;
}

/**
 * Mark a single card element as selected; deselects all others in hand.
 * @param {string} cardId
 */
export function selectCardElement(cardId) {
  document.querySelectorAll('#hand-container .card').forEach(el => {
    el.classList.toggle('card-selected', el.dataset.cardId === cardId);
  });
}

/**
 * Remove selection state from all hand cards.
 */
export function deselectAllCards() {
  document.querySelectorAll('#hand-container .card').forEach(el => {
    el.classList.remove('card-selected');
  });
}

/**
 * Set the dragging visual state on a card element.
 * @param {HTMLElement} el
 * @param {boolean} isDragging
 */
export function setCardDragging(el, isDragging) {
  el.classList.toggle('dragging', isDragging);
  // Disable pointer events on sibling cards while dragging
  document.querySelectorAll('#hand-container .card').forEach(c => {
    if (c !== el) c.style.pointerEvents = isDragging ? 'none' : '';
  });
}

/**
 * Render the hand array into #hand-container.
 * Applies staggered card-slide-in animation delays and synergy glow.
 * @param {import('../entities/card.js').Card[]} hand
 * @param {string[]} [activePairRoles] - roles with active synergy (get glow)
 */
export function renderHand(hand, activePairRoles = []) {
  const container = document.getElementById('hand-container');
  if (!container) return;
  container.innerHTML = '';

  hand.forEach((card, idx) => {
    const el = createCardElement(card);
    el.style.animationDelay = `${idx * 80}ms`;
    if (activePairRoles.includes(card.role)) {
      el.classList.add('synergy-glow');
    }
    container.appendChild(el);
  });

  // Update hand count badge in HUD if it exists
  const badge = document.getElementById('hand-count-badge');
  if (badge) badge.textContent = hand.length;
}

/**
 * Apply synergy-glow to cards in hand whose role is in the active pairs.
 * @param {string[]} roles
 */
export function highlightSynergyCards(roles) {
  document.querySelectorAll('#hand-container .card').forEach(el => {
    const role = el.dataset.cardRole;
    el.classList.toggle('synergy-glow', roles.includes(role));
  });
}

/**
 * Flash a specific card element with a brief "assigned" confirmation pulse.
 * @param {HTMLElement} el
 */
export function flashCardAssigned(el) {
  el.classList.add('card-assigned-flash');
  el.addEventListener('animationend', () => el.classList.remove('card-assigned-flash'), { once: true });
}
