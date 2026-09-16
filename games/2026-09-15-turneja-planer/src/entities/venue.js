/** @module entities/venue — venue types, capacity, and characteristics */

/**
 * @typedef {Object} VenueType
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {number} capacity_mult - multiplier na crowd_max
 * @property {number} cq_bonus - bonus na crowd quality
 * @property {number} cost - base cost EUR
 * @property {string} description
 */

/** @type {VenueType[]} */
export const VENUE_TYPES = [
  {
    id: 'klub',
    name: 'Klub',
    emoji: '🏢',
    capacity_mult: 1.0,
    cq_bonus: 0.5,
    cost: 200,
    description: 'Klasičan noćni klub — intimate vibes, dobra akustika.',
  },
  {
    id: 'open_air',
    name: 'Open Air',
    emoji: '🌙',
    capacity_mult: 1.5,
    cq_bonus: -0.3,
    cost: 100,
    description: 'Na otvorenom — više sveta, ali manje kontrole.',
  },
  {
    id: 'imanje',
    name: 'Imanje',
    emoji: '🌿',
    capacity_mult: 0.7,
    cq_bonus: 1.2,
    cost: 350,
    description: 'Privatno imanje — ekskluzivno, intimno, premium vibe.',
  },
];

/** @type {Map<string, VenueType>} */
export const VENUE_MAP = new Map(VENUE_TYPES.map(v => [v.id, v]));

/**
 * Pick a venue type for a city based on city risk and randomness
 * @param {import('./city.js').City} city
 * @returns {VenueType}
 */
export function pickVenueForCity(city) {
  if (city.id === 'guncati') return VENUE_MAP.get('imanje');
  const roll = Math.random();
  if (city.risk >= 3) {
    // High risk city → prefer klub (safer) or open_air
    return roll < 0.6 ? VENUE_MAP.get('klub') : VENUE_MAP.get('open_air');
  }
  if (roll < 0.5) return VENUE_MAP.get('klub');
  if (roll < 0.8) return VENUE_MAP.get('open_air');
  return VENUE_MAP.get('imanje');
}
