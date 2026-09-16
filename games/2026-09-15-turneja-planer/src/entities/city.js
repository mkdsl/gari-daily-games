/** @module entities/city — definicija gradova i crowd parametara */

/**
 * @typedef {Object} City
 * @property {string} id
 * @property {string} name
 * @property {number} crowd_min
 * @property {number} crowd_max
 * @property {number} risk - 1=low, 2=med, 3=high
 * @property {number} rep_mult
 * @property {boolean} [border] - granični prelaz
 * @property {boolean} [is_final] - Guncati gate
 * @property {string} color
 * @property {string} emoji
 * @property {string} region
 */

/** @type {City[]} */
export const CITIES = [
  {
    id: 'beograd',
    name: 'Beograd',
    crowd_min: 800,
    crowd_max: 1200,
    risk: 1,
    rep_mult: 1.0,
    border: false,
    is_final: false,
    color: '#E63946',
    emoji: '🏙️',
    region: 'Srbija',
  },
  {
    id: 'novi_sad',
    name: 'Novi Sad',
    crowd_min: 600,
    crowd_max: 900,
    risk: 2,
    rep_mult: 1.1,
    border: false,
    is_final: false,
    color: '#2EC4B6',
    emoji: '🌊',
    region: 'Vojvodina',
  },
  {
    id: 'nis',
    name: 'Niš',
    crowd_min: 300,
    crowd_max: 600,
    risk: 1,
    rep_mult: 0.9,
    border: false,
    is_final: false,
    color: '#F77F00',
    emoji: '🔴',
    region: 'Srbija jug',
  },
  {
    id: 'sarajevo',
    name: 'Sarajevo',
    crowd_min: 400,
    crowd_max: 700,
    risk: 3,
    rep_mult: 1.3,
    border: true,
    is_final: false,
    color: '#A8DADC',
    emoji: '🕌',
    region: 'BiH',
  },
  {
    id: 'guncati',
    name: 'Guncati',
    crowd_min: 200,
    crowd_max: 400,
    risk: 2,
    rep_mult: 1.5,
    border: false,
    is_final: true,
    color: '#52B788',
    emoji: '🌿',
    region: 'Šumadija',
  },
];

/** @type {Map<string, City>} */
export const CITY_MAP = new Map(CITIES.map(c => [c.id, c]));

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function rollCrowd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns the non-final, non-start cities (available for routing)
 * @returns {City[]}
 */
export function getRoutableCities() {
  return CITIES.filter(c => !c.is_final && c.id !== 'beograd');
}

/**
 * @returns {City}
 */
export function getStartCity() {
  return CITY_MAP.get('beograd');
}

/**
 * @returns {City}
 */
export function getFinalCity() {
  return CITIES.find(c => c.is_final);
}
