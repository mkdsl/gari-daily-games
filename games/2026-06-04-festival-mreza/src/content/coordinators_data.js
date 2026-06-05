/** @module coordinators_data — statički podaci za koordinatore */

/** @type {Record<string, CoordinatorData>} */
export const COORDINATORS = {
  mileva: {
    id: 'mileva',
    name: 'Mileva Jovanović',
    city: 'nis',
    baseReach: 18,
    baseCostMultiplier: 2,    // 200 EUR base umesto 100
    cities: ['nis', 'sarajevo'],
    startTier: 1,
    tier1Ability: null,
    tier3Ability: 'underground_network',
    tier3AbilityDesc: 'Social Post: 50 EUR + half-life +1',
    unlockCondition: null,
    portrait: 'M',
    portraitColor: '#c44dff',
    dialogs: [
      {
        trigger: 'satisfaction_nis_75',
        text: 'Dobro si vodio. Niš ne prašta površnim promoterima — ali tebe su primili. To znači nešto.'
      }
    ],
  },

  igor: {
    id: 'igor',
    name: 'Igor Trifunović',
    city: 'sarajevo',
    baseReach: 30,
    baseCostMultiplier: 1,
    cities: ['sarajevo', 'strand', 'guncati', 'avala'],
    startTier: 1,
    tier1Ability: null,
    tier3Ability: 'media_blast',
    tier3AbilityDesc: 'Radio ×1.5 reach, 20% cold crowd bonus',
    unlockCondition: null,
    portrait: 'I',
    portraitColor: '#ffb830',
    dialogs: [
      {
        trigger: 'cold_groups_3',
        text: 'Znam, znam — publika nije baš naša... Ali jesi vidio koliko ih ima? Posao je posao, promotere.'
      }
    ],
  },

  marina: {
    id: 'marina',
    name: 'Marina Petrović',
    city: 'strand',
    baseReach: 22,
    baseCostMultiplier: 1,
    cities: ['strand', 'guncati', 'avala'],
    startTier: 1,
    tier1Ability: null,
    tier3Ability: 'festival_vibe',
    tier3AbilityDesc: 'Zone cap +15%, ali BPM>128 heat threshold -20%',
    unlockCondition: null,
    portrait: 'M',
    portraitColor: '#4df5ff',
    dialogs: [
      {
        trigger: 'strand_macro_start',
        text: 'Štrand je poseban. Ovde publika dolazi da OSTANE, ne da pobegne. Samo pazi na sunce i BPM — nije kao u clubu.'
      }
    ],
  },

  brana: {
    id: 'brana',
    name: 'Brana Barakonja',
    city: 'guncati',
    baseReach: 15,
    baseCostMultiplier: 2,
    cities: ['guncati'],
    startTier: 2,
    tier2Ability: 'guncati_koren',
    tier2AbilityDesc: '+10 buzz carry-over in all future cities',
    tier4Ability: 'mkdslend_mreza',
    tier4AbilityDesc: 'connections += floor(satisfaction × 0.2) per Guncati event',
    unlockCondition: 'avala_completed',
    portrait: 'B',
    portraitColor: '#4a7c59',
    dialogs: [
      {
        trigger: 'unlock',
        text: 'Čuo sam šta si uradio na Avali. Guncati te čeka. Ali evo — tamo igramo drugačija pravila. Nema bullshit-a, nema hype-a. Samo zajednica.'
      },
      {
        trigger: 'satisfaction_guncati_80',
        text: 'Ovo je ono što gradimo u Guncatiju. Ne event — memorija. Vidi ove ljude? Oni se vraćaju. I sledeće godine. I za deset godina.'
      }
    ],
  },

  deki: {
    id: 'deki',
    name: 'Dragan "Deki" Nikolić',
    city: 'avala',
    baseReach: 35,
    baseCostMultiplier: 4,    // starts at tier3, base 400 EUR
    cities: ['avala'],
    startTier: 3,
    tier3Ability: 'grand_finale_protocol',
    tier3AbilityDesc: 'No equipment_failure + satisfaction +8',
    tier5Ability: 'legenda_turneje_trigger',
    tier5AbilityDesc: 'If Avala >= 90, career_tier = legenda',
    unlockCondition: 'avala_completed_and_regional',
    portrait: 'D',
    portraitColor: '#ff8c42',
    dialogs: [
      {
        trigger: 'avala_macro',
        text: 'Znam koliko si radio da stigneš ovde. Avala ti nije nagrada — to je test. Ali imaš ko da te drži. Hajde.'
      }
    ],
  },
};

/**
 * Get coordinator cost by tier and data
 * @param {CoordinatorData} data
 * @param {number} tier 1-5
 * @returns {number} EUR cost
 */
export function getCoordinatorCost(data, tier) {
  const base = 100 * Math.pow(2, tier - 1);
  return Math.round(base * data.baseCostMultiplier);
}

/**
 * Get loyalty tier (1-5)
 * @param {number} loyalty 0-500+
 * @returns {number} 1-5
 */
export function getLoyaltyTier(loyalty) {
  if (loyalty < 40)  return 1;
  if (loyalty < 100) return 2;
  if (loyalty < 200) return 3;
  if (loyalty < 350) return 4;
  return 5;
}
