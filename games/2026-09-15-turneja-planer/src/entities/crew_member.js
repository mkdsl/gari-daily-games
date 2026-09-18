/** @module entities/crew_member — crew stats, skills, daily_rate, resilience */

/**
 * @typedef {'high'|'med'|'low'} Resilience
 * @typedef {Object} Skills
 * @property {number} [djing]
 * @property {number} [visual]
 * @property {number} [promo]
 * @property {number} [social]
 * @property {number} [tech]
 * @property {number} [logistics]
 * @property {number} [reputation]
 */

/**
 * @typedef {Object} CrewMember
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {number} daily_rate - EUR/dan
 * @property {Skills} skills
 * @property {Resilience} resilience
 * @property {string} emoji
 * @property {boolean} required - djing je obavezan
 */

/** @type {CrewMember[]} */
export const ALL_CREW = [
  {
    id: 'marko',
    name: 'Marko DJ',
    role: 'DJ',
    daily_rate: 300,
    skills: { djing: 3, promo: 1 },
    resilience: 'high',
    emoji: '🎧',
    required: true,
  },
  {
    id: 'ana',
    name: 'Ana V',
    role: 'Visual',
    daily_rate: 180,
    skills: { visual: 3, social: 2 },
    resilience: 'med',
    emoji: '🎨',
    required: false,
  },
  {
    id: 'bojan',
    name: 'Bojan P',
    role: 'Promo',
    daily_rate: 150,
    skills: { promo: 3, logistics: 1 },
    resilience: 'high',
    emoji: '📢',
    required: false,
  },
  {
    id: 'ivana',
    name: 'Ivana S',
    role: 'Social',
    daily_rate: 120,
    skills: { social: 3, visual: 1 },
    resilience: 'low',
    emoji: '📱',
    required: false,
  },
  {
    id: 'nikola',
    name: 'Nikola T',
    role: 'Sound Tech',
    daily_rate: 200,
    skills: { tech: 3, djing: 1 },
    resilience: 'high',
    emoji: '🔊',
    required: false,
  },
  {
    id: 'milena',
    name: 'Milena G',
    role: 'Support DJ',
    daily_rate: 160,
    skills: { djing: 2, visual: 1 },
    resilience: 'med',
    emoji: '🎵',
    required: false,
  },
  {
    id: 'dragan',
    name: 'Dragan L',
    role: 'Driver',
    daily_rate: 100,
    skills: { logistics: 3 },
    resilience: 'high',
    emoji: '🚗',
    required: false,
  },
  {
    id: 'sara',
    name: 'Sara K',
    role: 'Merch',
    daily_rate: 110,
    skills: { social: 2 },
    resilience: 'med',
    emoji: '👕',
    required: false,
  },
  {
    id: 'petar',
    name: 'Petar M',
    role: 'Streamer',
    daily_rate: 190,
    skills: { tech: 2, social: 2 },
    resilience: 'low',
    emoji: '📡',
    required: false,
  },
  {
    id: 'jovana',
    name: 'Jovana R',
    role: 'PR',
    daily_rate: 170,
    skills: { promo: 2, reputation: 3 },
    resilience: 'med',
    emoji: '🌟',
    required: false,
  },
];

/** @type {Map<string, CrewMember>} */
export const CREW_MAP = new Map(ALL_CREW.map(c => [c.id, c]));

/**
 * @param {CrewMember} member
 * @param {string} skillKey
 * @returns {number} total skill rank (0 if missing)
 */
export function getSkillRank(member, skillKey) {
  return member.skills[skillKey] || 0;
}

/**
 * Total daily cost for selected crew
 * @param {CrewMember[]} crew
 * @returns {number}
 */
export function totalDailyRate(crew) {
  return crew.reduce((sum, m) => sum + m.daily_rate, 0);
}

/**
 * @param {CrewMember[]} crew
 * @param {string} skillKey
 * @returns {number} total rank across crew
 */
export function crewSkillTotal(crew, skillKey) {
  return crew.reduce((sum, m) => sum + (m.skills[skillKey] || 0), 0);
}

/**
 * Validation — must have at least 1 djing skill in crew
 * @param {CrewMember[]} crew
 * @returns {boolean}
 */
export function hasDJing(crew) {
  return crew.some(m => (m.skills.djing || 0) > 0);
}
