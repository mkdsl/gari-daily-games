/**
 * @file events_data.js
 * 5 tour events for Kluboslavija 2026.
 * Consumed by systems/scoring.js, systems/deck.js, systems/grand_finale.js.
 */

/**
 * @typedef {Object} EventData
 * @property {string}       id
 * @property {string}       name
 * @property {number}       event_number       1-5
 * @property {string[]|null} preferred_tags    Tags audience favors (null = seeded at runtime for E5)
 * @property {number}       base_budget
 * @property {number}       difficulty_mod     Multiplier applied to conflict penalties
 * @property {boolean}      unlock_tags_revealed  Whether preferred tags are shown to player pre-draft
 * @property {string[]|null} [grand_finale_pool]  Available tags for seeded selection (E5 only)
 */

/** @type {EventData[]} */
export const EVENTS_DATA = [
  {
    id: 'strandE1',
    name: 'Štrand',
    event_number: 1,
    preferred_tags: ['hype', 'crowdread'],
    base_budget: 60,
    difficulty_mod: 1.0,
    unlock_tags_revealed: true,
  },
  {
    id: 'avalaE2',
    name: 'Avala',
    event_number: 2,
    preferred_tags: ['techno', 'easygoing'],
    base_budget: 65,
    difficulty_mod: 1.1,
    unlock_tags_revealed: true,
  },
  {
    id: 'nisE3',
    name: 'Niš',
    event_number: 3,
    preferred_tags: ['versatile', 'stamina'],
    base_budget: 70,
    difficulty_mod: 1.2,
    unlock_tags_revealed: true,
  },
  {
    id: 'sarajevoE4',
    name: 'Sarajevo',
    event_number: 4,
    preferred_tags: ['charisma', 'viralmoment'],
    base_budget: 75,
    difficulty_mod: 1.3,
    unlock_tags_revealed: true,
  },
  {
    id: 'finaleE5',
    name: 'Grand Finale',
    event_number: 5,
    preferred_tags: null,
    base_budget: 80,
    difficulty_mod: 1.5,
    unlock_tags_revealed: false,
    grand_finale_pool: ['hype', 'techno', 'precision', 'crowdread', 'versatile', 'magnet', 'charisma', 'stamina'],
  },
];

/**
 * Get event data by event number (1-indexed).
 * @param {number} eventNumber  1-5
 * @returns {EventData|undefined}
 */
export function getEventByNumber(eventNumber) {
  return EVENTS_DATA.find(e => e.event_number === eventNumber);
}

/**
 * Get event data by its string ID.
 * @param {string} id
 * @returns {EventData|undefined}
 */
export function getEventById(id) {
  return EVENTS_DATA.find(e => e.id === id);
}

/**
 * Get event data by 0-based index (matches state.current_event_index).
 * @param {number} index  0-4
 * @returns {EventData|undefined}
 */
export function getEventByIndex(index) {
  return EVENTS_DATA[index];
}
