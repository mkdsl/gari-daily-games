/**
 * @file synergy_data.js
 * 12 synergy/conflict entries for the Ekipa Noći synergy matrix.
 * Consumed by systems/synergy.js to evaluate a 5-card team.
 */

/**
 * @typedef {Object} SynergyEntry
 * @property {string}  id
 * @property {string}  condition_type   'trait_pair' | 'tag_pair' | 'trait_count' | 'tag_count' | 'tag_combo'
 * @property {string}  condition        Human-readable condition string
 * @property {string}  category         'production' | 'conflict' | 'vibe' | 'logistics' | 'audience_match' | 'mentorship' | 'total' | 'mixed'
 * @property {number}  [effect]         Flat score delta (positive = bonus, negative = penalty)
 * @property {number}  [effect_vibe]    Vibe sub-score delta
 * @property {number}  [effect_logistics] Logistics sub-score delta
 * @property {number}  [effect_crowd]   Crowd sub-score delta
 * @property {number}  [effect_reach]   Reach sub-score delta
 * @property {string}  flavor
 * // Matching data for synergy.js evaluation:
 * @property {string}  [trait_a]        First trait for trait_pair checks
 * @property {string}  [trait_b]        Second trait for trait_pair checks
 * @property {string}  [tag_a]          First tag for tag_pair / tag_combo checks
 * @property {string}  [tag_b]          Second tag for tag_pair / tag_combo checks
 * @property {string}  [tag_or_a]       For OR-based tag count checks
 * @property {string}  [tag_or_b]       For OR-based tag count checks
 * @property {number}  [min_count]      Minimum number of matches required
 */

/** @type {SynergyEntry[]} */
export const SYNERGY_DATA = [
  {
    id: 'vet_vet',
    condition_type: 'trait_count',
    condition: 'Veteran+Veteran (any 2 cards)',
    category: 'production',
    effect: 10,
    trait_a: 'Veteran',
    min_count: 2,
    flavor: 'Rutina gradi čudo.',
  },
  {
    id: 'wild_intro',
    condition_type: 'trait_pair',
    condition: 'Wildcard+Introvert (same team)',
    category: 'conflict',
    effect: -8,
    trait_a: 'Wildcard',
    trait_b: 'Introvert',
    flavor: 'Previše tišine — previše haosa.',
  },
  {
    id: 'extro_x3',
    condition_type: 'trait_count',
    condition: '3+ Ekstrovert in team',
    category: 'mixed',
    effect_vibe: 8,
    effect_logistics: -4,
    trait_a: 'Ekstrovert',
    min_count: 3,
    flavor: 'Svi pričaju, niko ne sluša.',
  },
  {
    id: 'heavy_x2',
    condition_type: 'trait_count',
    condition: '2+ HeavyHitter in team',
    category: 'mixed',
    effect_vibe: 12,
    effect_crowd: -6,
    trait_a: 'HeavyHitter',
    min_count: 2,
    flavor: 'Eksplozija na sve strane.',
  },
  {
    id: 'burnout_x2',
    condition_type: 'tag_count',
    condition: '2+ cards with burnout tag',
    category: 'total',
    effect: -10,
    tag_a: 'burnout',
    min_count: 2,
    flavor: 'Ekipa je sagorela pre ponoći.',
  },
  {
    id: 'lowmaint_x2',
    condition_type: 'tag_count',
    condition: '2+ cards with lowmaintenance tag',
    category: 'logistics',
    effect: 6,
    tag_a: 'lowmaintenance',
    min_count: 2,
    flavor: 'Sami se snalaze — menadžer diše.',
  },
  {
    id: 'crowdread_hype',
    condition_type: 'tag_combo',
    condition: 'crowdread+hype (any 2 cards)',
    category: 'audience_match',
    effect: 8,
    tag_a: 'crowdread',
    tag_b: 'hype',
    flavor: 'Znaju tačno šta publika hoće.',
  },
  {
    id: 'rookie_vet',
    condition_type: 'trait_pair',
    condition: 'Rookie+Veteran (different roles)',
    category: 'mentorship',
    effect: 5,
    trait_a: 'Rookie',
    trait_b: 'Veteran',
    flavor: 'Stariji uči mlađeg uživo.',
  },
  {
    id: 'risky_crowdcontrol',
    condition_type: 'tag_combo',
    condition: 'risky+crowdcontrol tag combo',
    category: 'conflict',
    effect: -6,
    tag_a: 'risky',
    tag_b: 'crowdcontrol',
    flavor: 'Vatrogasac gasi požar koji je sam zapalio.',
  },
  {
    id: 'wild_vet',
    condition_type: 'trait_pair',
    condition: 'Wildcard+Veteran (any in team)',
    category: 'mixed',
    effect_vibe: 15,
    effect_logistics: -5,
    trait_a: 'Wildcard',
    trait_b: 'Veteran',
    flavor: 'Veteran drži kaos pod kontrolom — nekako.',
  },
  {
    id: 'precision_techno',
    condition_type: 'tag_count',
    condition: '2+ cards with precision OR techno tag',
    category: 'production',
    effect: 10,
    tag_a: 'precision',
    tag_or_b: 'techno',
    min_count: 2,
    flavor: 'Sve sinhronizovano do milisekunde.',
  },
  {
    id: 'magnet_viral',
    condition_type: 'tag_combo',
    condition: 'magnet+viralmoment tag combo',
    category: 'mixed',
    effect_vibe: 9,
    effect_reach: 3,
    tag_a: 'magnet',
    tag_b: 'viralmoment',
    flavor: 'Event se sam šeruje.',
  },
];

/**
 * Get a synergy entry by ID.
 * @param {string} id
 * @returns {SynergyEntry|undefined}
 */
export function getSynergyById(id) {
  return SYNERGY_DATA.find(s => s.id === id);
}
