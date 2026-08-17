// entities/card.js — Card factory

let _cardIdCounter = 0;

/**
 * @typedef {Object} Card
 * @property {string} id       - Unique runtime ID
 * @property {string} defId    - Definition ID from content (stable)
 * @property {string} name     - Display name
 * @property {string} role     - 'tonac'|'host'|'content'|'logistika'|'obezbedjenje'
 * @property {number} power    - 1–5
 * @property {string} rarity   - 'common'|'rare'|'signature'
 * @property {string} flavor   - Short flavor text
 * @property {string} eventSet - 'klub'|'outdoor'|'intimate'
 */

/**
 * @param {{ defId: string, name: string, role: string, power: number, rarity: string, flavor: string, eventSet: string }} data
 * @returns {Card}
 */
export function createCard(data) {
  return {
    id:       `card-${_cardIdCounter++}`,
    defId:    data.defId,
    name:     data.name,
    role:     data.role,
    power:    data.power,
    rarity:   data.rarity,
    flavor:   data.flavor,
    eventSet: data.eventSet
  };
}

/** Reset counter (for testing) */
export function resetCardCounter() {
  _cardIdCounter = 0;
}
