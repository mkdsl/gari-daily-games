// entities/slot.js — Slot model

/**
 * @typedef {Object} Slot
 * @property {string} role         - 'tonac'|'host'|'content'|'logistika'|'obezbedjenje'
 * @property {import('./card.js').Card|null} card
 */

/**
 * Create a new empty slot for a given role.
 * @param {string} role
 * @returns {Slot}
 */
export function createSlot(role) {
  return { role, card: null };
}

/**
 * @param {Slot} slot
 * @returns {boolean}
 */
export function isEmpty(slot) {
  return slot.card === null;
}

/**
 * Assign a card to a slot. Returns the previously held card (or null) so
 * the caller can handle churn.
 * @param {Slot} slot
 * @param {import('./card.js').Card} card
 * @returns {import('./card.js').Card|null} displaced card
 */
export function assignCard(slot, card) {
  const displaced = slot.card;
  slot.card = card;
  return displaced;
}

/**
 * Remove card from slot.
 * @param {Slot} slot
 * @returns {import('./card.js').Card|null} removed card
 */
export function clearCard(slot) {
  const removed = slot.card;
  slot.card = null;
  return removed;
}
