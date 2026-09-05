/**
 * @module tasks
 * Task definitions for Jesenji Tok — 6 seasonal agricultural tasks
 * Each task maps to a parcel type and a scheduling window (week numbers 1-12)
 * Week 1 = Aug 20, Week 12 = Nov 5
 */

/** @typedef {{ id: string, name: string, parcel_type: string, window_start: number, window_end: number, group_cost: number, base_score: number, color: string, blocked_by_rain: boolean, tooltip_edu: string, emoji: string }} Task */

/** @type {Task[]} */
export const TASKS = [
  {
    id: 'micelij',
    name: 'Micelij inokulacija',
    parcel_type: 'suma',
    window_start: 1,
    window_end: 7,
    group_cost: 2,
    base_score: 180,
    color: '#8b7355',
    blocked_by_rain: false,
    emoji: '🍄',
    tooltip_edu:
      'Bukovač inokulacija traži hlad i vreme za rast. Van avgusta–oktobra, micelijum ne stiže pre mraza. Berba novembar.',
  },
  {
    id: 'ozimo',
    name: 'Ozimo žito',
    parcel_type: 'otvorena',
    window_start: 1,
    window_end: 4,
    group_cost: 1,
    base_score: 150,
    color: '#c8a05a',
    blocked_by_rain: false,
    emoji: '🌾',
    tooltip_edu:
      'Seje se do 20. septembra — posle toga zemlja se hladi, klijanje kasni, prinos pada. Proleće žetva.',
  },
  {
    id: 'jezero',
    name: 'Jezero zimska priprema',
    parcel_type: 'vodena',
    window_start: 6,
    window_end: 11,
    group_cost: 1,
    base_score: 160,
    color: '#2c5f7a',
    blocked_by_rain: false,
    emoji: '🐟',
    tooltip_edu:
      'Ribe prezimljuju bolje uz oktobarska/novembarska aeracija. Bez pripreme, kiseonik pada pod ledom.',
  },
  {
    id: 'graditeljski',
    name: 'Suvozid i tarabe',
    parcel_type: 'gradiliste',
    window_start: 1,
    window_end: 6,
    group_cost: 2,
    base_score: 170,
    color: '#6b4c3b',
    blocked_by_rain: true,
    emoji: '🪨',
    tooltip_edu:
      'Kamen i malta ne drže u vlazi. Suvi prozor avgusta–septembra je jedini pravi; dockan kišni rad pravi pukotine do proleća.',
  },
  {
    id: 'rezidba',
    name: 'Zimska rezidba',
    parcel_type: 'vocnjak',
    window_start: 4,
    window_end: 11,
    group_cost: 1,
    base_score: 130,
    color: '#4a7c59',
    blocked_by_rain: false,
    emoji: '✂️',
    tooltip_edu:
      'Reže se posle prvih mrazeva, pre dubokog mirovanja. Prozor sept 15 – okt 31. Ranije ili dockan = prinos −20% idućeg proleća.',
  },
  {
    id: 'kompost',
    name: 'Kompost zimski',
    parcel_type: 'kompost',
    window_start: 1,
    window_end: 8,
    group_cost: 1,
    base_score: 140,
    color: '#5a4e44',
    blocked_by_rain: false,
    emoji: '♻️',
    tooltip_edu:
      'Fermentacija je aktivna dok temperatura drži. Posle 20. oktobra mikrobi usporavaju — prolećno gnojivo gubi moć.',
  },
];

/**
 * Week number to human-readable date label
 * Week 1 = Aug 20, Week 12 = Nov 5
 * @param {number} week 1-indexed week number
 * @returns {string}
 */
export function weekLabel(week) {
  const LABELS = [
    '', // padding, index 0 unused
    '20 avg',
    '27 avg',
    '3 sep',
    '10 sep',
    '17 sep',
    '24 sep',
    '1 okt',
    '8 okt',
    '15 okt',
    '22 okt',
    '29 okt',
    '5 nov',
  ];
  return LABELS[week] ?? `N${week}`;
}

/**
 * Get task by id
 * @param {string} id
 * @returns {Task|undefined}
 */
export function getTask(id) {
  return TASKS.find((t) => t.id === id);
}

/**
 * Parcel types that exist in the game
 * Each task uses exactly one parcel type
 */
export const PARCEL_TYPES = [
  { id: 'suma', label: 'Šuma', emoji: '🌲' },
  { id: 'otvorena', label: 'Njiva', emoji: '🌾' },
  { id: 'vodena', label: 'Jezero', emoji: '💧' },
  { id: 'gradiliste', label: 'Gradilište', emoji: '🔨' },
  { id: 'vocnjak', label: 'Voćnjak', emoji: '🍎' },
  { id: 'kompost', label: 'Kompost', emoji: '♻️' },
];
