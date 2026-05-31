/**
 * @file cards_data.js
 * All 25 cards for Ekipa Noći.
 * Each entry matches the CardData typedef from entities/card.js.
 * Import CARDS_DATA in deck.js and anywhere else that needs the full pool.
 */

/**
 * @typedef {Object} CardData
 * @property {string}   id
 * @property {string}   role           'dj' | 'host' | 'sound' | 'video' | 'security'
 * @property {string}   name
 * @property {string[]} traits
 * @property {string[]} tags
 * @property {number}   base_score
 * @property {number}   cost
 * @property {number}   tier           1 | 2 | 3
 * @property {string}   special        Human-readable description of special ability
 * @property {number}   locked_until_xp  0 = available from start
 */

/** @type {CardData[]} */
export const CARDS_DATA = [
  // -------------------------------------------------------------------------
  // DJ (5 cards)
  // -------------------------------------------------------------------------
  {
    id: 'dj_drazen',
    role: 'dj',
    name: 'Dražen Bura',
    traits: ['Veteran', 'Introvert'],
    tags: ['techno', 'precision', 'lowmaintenance'],
    base_score: 22,
    cost: 14,
    tier: 2,
    special: 'plus4 if Sound.tags includes precision OR techno',
    locked_until_xp: 0,
  },
  {
    id: 'dj_lena',
    role: 'dj',
    name: 'Lena Voltage',
    traits: ['Rookie', 'Ekstrovert'],
    tags: ['hype', 'risky', 'crowdread'],
    base_score: 17,
    cost: 9,
    tier: 2,
    special: 'if midpoint_score>50 +6 else -3',
    locked_until_xp: 0,
  },
  {
    id: 'dj_phantom',
    role: 'dj',
    name: 'MC Phantom',
    traits: ['Wildcard', 'HeavyHitter'],
    tags: ['unpredictable', 'magnet', 'burnout'],
    base_score: 26,
    cost: 18,
    tier: 3,
    special: 'reroll 1 conflict to 0, adds burnout effect',
    locked_until_xp: 0,
  },
  {
    id: 'dj_toni',
    role: 'dj',
    name: 'Toni Groove',
    traits: ['Veteran', 'Ekstrovert'],
    tags: ['versatile', 'easygoing', 'stamina'],
    base_score: 20,
    cost: 13,
    tier: 2,
    special: 'plus3 if team has 3+ Veteran cards',
    locked_until_xp: 0,
  },
  {
    id: 'dj_zara',
    role: 'dj',
    name: 'Zara Static',
    traits: ['Rookie', 'Introvert'],
    tags: ['underground', 'purist', 'growthpotential'],
    base_score: 13,
    cost: 7,
    tier: 1,
    special: 'plus5 score NEXT event if retained (loyalty trigger)',
    locked_until_xp: 40,
  },

  // -------------------------------------------------------------------------
  // Host (5 cards)
  // -------------------------------------------------------------------------
  {
    id: 'host_filip',
    role: 'host',
    name: 'Filip Sena',
    traits: ['Veteran', 'Ekstrovert'],
    tags: ['charisma', 'crowdcontrol', 'expensive'],
    base_score: 24,
    cost: 19,
    tier: 3,
    special: 'negates 1 impulsive or controversy penalty in team',
    locked_until_xp: 0,
  },
  {
    id: 'host_mia',
    role: 'host',
    name: 'Mia Flare',
    traits: ['Rookie', 'Ekstrovert'],
    tags: ['energy', 'impulsive', 'viralmoment'],
    base_score: 18,
    cost: 10,
    tier: 2,
    special: 'if audience_match_bonus>=1 add +4 vibe',
    locked_until_xp: 0,
  },
  {
    id: 'host_darko',
    role: 'host',
    name: 'Darko Mirni',
    traits: ['Veteran', 'Introvert'],
    tags: ['calm', 'organizer', 'backstageleader'],
    base_score: 21,
    cost: 12,
    tier: 2,
    special: 'reduce all conflict penalties by 2 in event',
    locked_until_xp: 0,
  },
  {
    id: 'host_sasha',
    role: 'host',
    name: 'Sasha Bold',
    traits: ['Wildcard', 'HeavyHitter'],
    tags: ['controversy', 'memeable', 'polarizing'],
    base_score: 25,
    cost: 17,
    tier: 3,
    special: 'plus10 if DJ is HeavyHitter; -10 if DJ is Introvert',
    locked_until_xp: 80,
  },
  {
    id: 'host_ana',
    role: 'host',
    name: 'Ana Tiha',
    traits: ['Rookie', 'Introvert'],
    tags: ['warm', 'reliable', 'undertheradar'],
    base_score: 14,
    cost: 6,
    tier: 1,
    special: 'no conflict penalty with any Security card',
    locked_until_xp: 0,
  },

  // -------------------------------------------------------------------------
  // Sound (5 cards)
  // -------------------------------------------------------------------------
  {
    id: 'sound_boro',
    role: 'sound',
    name: 'Boro Bas',
    traits: ['Veteran', 'Introvert'],
    tags: ['precision', 'technical', 'lowmaintenance'],
    base_score: 21,
    cost: 13,
    tier: 2,
    special: 'plus5 if DJ has techno or precision tag',
    locked_until_xp: 0,
  },
  {
    id: 'sound_nina',
    role: 'sound',
    name: 'Nina Fx',
    traits: ['Rookie', 'Ekstrovert'],
    tags: ['experimental', 'hype', 'risky'],
    base_score: 15,
    cost: 8,
    tier: 1,
    special: 'reroll 1 sound-related synergy once per event',
    locked_until_xp: 0,
  },
  {
    id: 'sound_marko',
    role: 'sound',
    name: 'Marko Loud',
    traits: ['Wildcard', 'HeavyHitter'],
    tags: ['heavy', 'magnet', 'burnout'],
    base_score: 24,
    cost: 16,
    tier: 3,
    special: 'plus8 if Grand Finale (E5); adds burnout',
    locked_until_xp: 60,
  },
  {
    id: 'sound_petra',
    role: 'sound',
    name: 'Petra Soft',
    traits: ['Veteran', 'Introvert'],
    tags: ['ambient', 'easygoing', 'stamina'],
    base_score: 19,
    cost: 11,
    tier: 2,
    special: 'reduce burnout effects in team by 1 point',
    locked_until_xp: 0,
  },
  {
    id: 'sound_luka',
    role: 'sound',
    name: 'Luka Sync',
    traits: ['Rookie', 'Ekstrovert'],
    tags: ['versatile', 'crowdread', 'growthpotential'],
    base_score: 12,
    cost: 6,
    tier: 1,
    special: 'plus3 for each Ekstrovert member in team',
    locked_until_xp: 0,
  },

  // -------------------------------------------------------------------------
  // Video (5 cards)
  // -------------------------------------------------------------------------
  {
    id: 'video_vuk',
    role: 'video',
    name: 'Vuk Frame',
    traits: ['Veteran', 'Introvert'],
    tags: ['cinematic', 'purist', 'precision'],
    base_score: 20,
    cost: 12,
    tier: 2,
    special: 'plus4 if Sound has technical or ambient tag',
    locked_until_xp: 0,
  },
  {
    id: 'video_ela',
    role: 'video',
    name: 'Ela Vizual',
    traits: ['Rookie', 'Ekstrovert'],
    tags: ['viralmoment', 'energy', 'impulsive'],
    base_score: 16,
    cost: 9,
    tier: 2,
    special: 'if audience preferred tag is viralmoment, +7 instead of +5',
    locked_until_xp: 0,
  },
  {
    id: 'video_rex',
    role: 'video',
    name: 'Rex Glitch',
    traits: ['Wildcard', 'HeavyHitter'],
    tags: ['unpredictable', 'memeable', 'burnout'],
    base_score: 23,
    cost: 15,
    tier: 3,
    special: 'plus5 vibe, -3 logistics; has burnout',
    locked_until_xp: 100,
  },
  {
    id: 'video_soma',
    role: 'video',
    name: 'Soma Still',
    traits: ['Veteran', 'Introvert'],
    tags: ['calm', 'organizer', 'lowmaintenance'],
    base_score: 18,
    cost: 10,
    tier: 2,
    special: 'blocks burnout effect from 1 Wildcard in team',
    locked_until_xp: 0,
  },
  {
    id: 'video_kika',
    role: 'video',
    name: 'Kika Motion',
    traits: ['Rookie', 'Ekstrovert'],
    tags: ['crowdread', 'versatile', 'growthpotential'],
    base_score: 11,
    cost: 5,
    tier: 1,
    special: 'plus2 for each audience_match_bonus point earned',
    locked_until_xp: 0,
  },

  // -------------------------------------------------------------------------
  // Security (5 cards)
  // -------------------------------------------------------------------------
  {
    id: 'sec_zoran',
    role: 'security',
    name: 'Zoran Zid',
    traits: ['Veteran', 'Introvert'],
    tags: ['crowdcontrol', 'reliable', 'stamina'],
    base_score: 20,
    cost: 11,
    tier: 2,
    special: 'reduce risky conflict penalties by 3 per event',
    locked_until_xp: 0,
  },
  {
    id: 'sec_branka',
    role: 'security',
    name: 'Branka Štit',
    traits: ['Veteran', 'Ekstrovert'],
    tags: ['charisma', 'crowdcontrol', 'easygoing'],
    base_score: 19,
    cost: 12,
    tier: 2,
    special: 'plus5 if Host has charisma or crowdcontrol tag',
    locked_until_xp: 0,
  },
  {
    id: 'sec_simo',
    role: 'security',
    name: 'Simo Hajduk',
    traits: ['Wildcard', 'HeavyHitter'],
    tags: ['heavy', 'polarizing', 'burnout'],
    base_score: 22,
    cost: 14,
    tier: 3,
    special: 'plus10 if conflict_total=0; -5 if conflict_total>=10',
    locked_until_xp: 120,
  },
  {
    id: 'sec_tara',
    role: 'security',
    name: 'Tara Senka',
    traits: ['Rookie', 'Introvert'],
    tags: ['underground', 'reliable', 'undertheradar'],
    base_score: 13,
    cost: 6,
    tier: 1,
    special: 'no conflict penalty regardless of traits',
    locked_until_xp: 0,
  },
  {
    id: 'sec_boban',
    role: 'security',
    name: 'Boban Grom',
    traits: ['Rookie', 'HeavyHitter'],
    tags: ['hype', 'magnet', 'risky'],
    base_score: 17,
    cost: 10,
    tier: 2,
    special: 'plus6 if DJ or Host has hype tag; -4 if neither',
    locked_until_xp: 0,
  },
];

/**
 * Get all cards for a specific role.
 * @param {string} role
 * @returns {CardData[]}
 */
export function getCardsByRole(role) {
  return CARDS_DATA.filter(c => c.role === role);
}

/**
 * Get a card by ID.
 * @param {string} id
 * @returns {CardData|undefined}
 */
export function getCardById(id) {
  return CARDS_DATA.find(c => c.id === id);
}
