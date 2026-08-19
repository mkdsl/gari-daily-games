// ui/slots.js — Slot DOM rendering, drop zones, synergy indicators, churn flash

import { SLOT_DISPLAY_NAMES } from '../config.js';
import { handleSlotClick } from '../input.js';

/** Role emoji hints shown in empty slots */
const ROLE_EMOJIS = {
  tonac:        '🔊',
  host:         '🎙',
  content:      '📸',
  logistika:    '📦',
  obezbedjenje: '🔒'
};

/** Short rarity labels for slot display */
const RARITY_LABELS = {
  common:    '',
  rare:      '★',
  signature: '✦'
};

/**
 * Build the content area for a filled slot.
 * @param {import('../entities/slot.js').Slot} slot
 * @param {boolean} isSynergyActive
 * @returns {HTMLElement}
 */
function buildFilledContent(slot, isSynergyActive) {
  const content = document.createElement('div');
  content.className = 'slot-content';

  const nameEl = document.createElement('div');
  nameEl.className   = 'slot-card-name';
  nameEl.textContent = slot.card.name;

  const powerEl = document.createElement('div');
  powerEl.className   = 'slot-card-power';
  powerEl.textContent = slot.card.power;

  const rarityLabel = RARITY_LABELS[slot.card.rarity] || '';
  if (rarityLabel) {
    const rarityEl = document.createElement('div');
    rarityEl.className   = `slot-card-rarity rarity-${slot.card.rarity}`;
    rarityEl.textContent = rarityLabel;
    content.appendChild(rarityEl);
  }

  content.appendChild(nameEl);
  content.appendChild(powerEl);

  if (isSynergyActive) {
    const dot = document.createElement('div');
    dot.className = 'slot-synergy-dot';
    dot.title     = 'Sinergija aktivna';
    dot.setAttribute('aria-label', 'Sinergija aktivna');
    content.appendChild(dot);
  }

  return content;
}

/**
 * Build the content area for an empty slot.
 * @param {string} role
 * @returns {HTMLElement}
 */
function buildEmptyContent(role) {
  const content = document.createElement('div');
  content.className = 'slot-content slot-empty-content';

  const emojiEl = document.createElement('span');
  emojiEl.className   = 'slot-role-emoji';
  emojiEl.textContent = ROLE_EMOJIS[role] || '?';
  emojiEl.setAttribute('aria-hidden', 'true');

  const hintEl = document.createElement('span');
  hintEl.className   = 'slot-empty-hint';
  hintEl.textContent = 'Dovuci';

  content.appendChild(emojiEl);
  content.appendChild(hintEl);
  return content;
}

/**
 * Render all 5 slots into #slots-container.
 * @param {import('../entities/slot.js').Slot[]} slots
 * @param {number} [churnCount]
 * @param {string[]} [activeRoles] - roles that are part of an active synergy pair
 */
export function renderSlots(slots, churnCount = 0, activeRoles = []) {
  const container = document.getElementById('slots-container');
  if (!container) return;
  container.innerHTML = '';

  for (const slot of slots) {
    const isFilled        = !!slot.card;
    const isSynergyActive = activeRoles.includes(slot.role);

    const el = document.createElement('div');
    el.className      = `slot slot-${slot.role}${isFilled ? ' slot-filled' : ' slot-empty'}`;
    el.dataset.slotRole = slot.role;
    el.setAttribute('aria-label',
      `${SLOT_DISPLAY_NAMES[slot.role] || slot.role} slot${isFilled ? ': ' + slot.card.name : ' — lepo prazno'}`
    );

    // Synergy ring on outer element
    if (isSynergyActive) {
      el.classList.add('slot-synergy-active');
    }

    // Role-colored top label
    const label = document.createElement('div');
    label.className   = `slot-label role-${slot.role}`;
    label.textContent = SLOT_DISPLAY_NAMES[slot.role] || slot.role;
    el.appendChild(label);

    // Content area
    const content = isFilled
      ? buildFilledContent(slot, isSynergyActive)
      : buildEmptyContent(slot.role);
    el.appendChild(content);

    // Click-to-slot handler (for selected card assignment)
    el.addEventListener('click', () => handleSlotClick(slot.role));

    container.appendChild(el);
  }
}

/**
 * Flash churn indicator on a slot (after card displacement).
 * @param {string} role
 */
export function flashChurnIndicator(role) {
  const el = document.querySelector(`[data-slot-role="${role}"]`);
  if (!el) return;
  el.classList.add('slot-churn');
  el.addEventListener('animationend', () => el.classList.remove('slot-churn'), { once: true });
}

/**
 * Add drag-over visual state to a slot element.
 * @param {string} role
 */
export function setSlotDragOver(role, active) {
  const el = document.querySelector(`[data-slot-role="${role}"]`);
  if (!el) return;
  el.classList.toggle('drag-over', active);
}
