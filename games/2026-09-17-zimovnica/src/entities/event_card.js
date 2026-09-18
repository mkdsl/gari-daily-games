/**
 * event_card.js — Event card shape: type, payload, choices, consequence.
 */

/**
 * @typedef {Object} EventCard
 * @property {string} id - Unique event id
 * @property {string} type - Kategorija: 'opportunity'|'risk'|'neutral'|'barrel_fail'
 * @property {string} title - Naslov događaja
 * @property {string} text - Opis situacije
 * @property {string} icon - Emoji
 * @property {Choice[]} choices - Opcije za igrača (1–3)
 * @property {boolean} [immediate] - Odmah se primenjuje bez izbora
 */

/**
 * @typedef {Object} Choice
 * @property {string} label - Tekst dugmeta
 * @property {Function} effect - (state, persistent) => {state, persistent}
 * @property {string} [tooltip] - Opis efekta
 */

/**
 * Kreira event card objekat.
 * @param {Partial<EventCard>} data
 * @returns {EventCard}
 */
export function createEventCard(data) {
  return {
    id: data.id || 'unknown',
    type: data.type || 'neutral',
    title: data.title || 'Događaj',
    text: data.text || '',
    icon: data.icon || '📋',
    choices: data.choices || [],
    immediate: data.immediate || false,
  };
}

/**
 * Primenjuje efekat odabranog izbora na state.
 * @param {EventCard} card
 * @param {number} choiceIdx - Index izabranog choice-a
 * @param {object} state
 * @param {object} persistent
 * @returns {{state: object, persistent: object}}
 */
export function applyEventChoice(card, choiceIdx, state, persistent) {
  const choice = card.choices[choiceIdx];
  if (!choice || !choice.effect) return { state, persistent };
  return choice.effect(state, persistent);
}
