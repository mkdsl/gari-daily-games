/**
 * masterclass-catalog.js — 9 tema sa svim metapodacima
 */

export const MASTERCLASS_CATALOG = {
  suvozid: {
    id: 'suvozid',
    name: 'Suvozid',
    description: 'Stara veština slaganja kamena bez maltera — živi zidovi koji dišu.',
    duration_days: 1,
    complexity: 2,
    unlock_rep: 0,
    outdoor_heavy: true,
    requires_staff: null,
    incident_bias: ['INC_03', 'INC_12', 'INC_07'],
    icon: '🪨',
    color: '#E8E0D0',
    learn_topics: ['Geologija kamena', 'Fundament priprema', 'Slaganje tehnika', 'Drenaža']
  },
  inokulacija: {
    id: 'inokulacija',
    name: 'Inokulacija pečurki',
    description: 'Od supstrata do micelijuma — kultivacija jestivih gljiva u prirodnim uslovima.',
    duration_days: 1,
    complexity: 3,
    unlock_rep: 50,
    outdoor_heavy: false,
    requires_staff: 'brana',
    incident_bias: ['INC_07', 'INC_13', 'INC_04'],
    icon: '🍄',
    color: '#8B7355',
    learn_topics: ['Micelijum osnove', 'Sterilizacija', 'Inokulacija tehnika', 'Praćenje rasta']
  },
  rammed_earth: {
    id: 'rammed_earth',
    name: 'Rammed Earth',
    description: 'Nabijanje zemlje za debele termalne zidove koji regulišu temperaturu.',
    duration_days: 2,
    complexity: 3,
    unlock_rep: 100,
    outdoor_heavy: true,
    requires_staff: 'alatko',
    incident_bias: ['INC_12', 'INC_05', 'INC_07'],
    icon: '🏗️',
    color: '#A0522D',
    learn_topics: ['Testiranje tla', 'Mešanje materijala', 'Nabijanje tehnika', 'Stabilizacija', 'Finiš']
  },
  permakultura: {
    id: 'permakultura',
    name: 'Permakultura Dizajn',
    description: 'Projektovanje živih sistema koji se sami hrane — principi PDC u praksi.',
    duration_days: 2,
    complexity: 4,
    unlock_rep: 200,
    outdoor_heavy: true,
    requires_staff: null,
    incident_bias: ['INC_13', 'INC_01', 'INC_10'],
    icon: '🌿',
    color: '#4A6741',
    learn_topics: ['Etika permakulture', 'Posmatranje terena', 'Zone dizajn', 'Voda upravljanje', 'Godišnja biljna cikličnost', 'Gild biljke']
  },
  akvakultura: {
    id: 'akvakultura',
    name: 'Akvakultura',
    description: 'Uzgoj ribe, patki i vodenih biljaka — biofiltracija i prirodni balansi.',
    duration_days: 3,
    complexity: 4,
    unlock_rep: 400,
    outdoor_heavy: true,
    requires_staff: 'brana',
    incident_bias: ['INC_04', 'INC_09', 'INC_10'],
    icon: '🐟',
    color: '#2C5F6E',
    learn_topics: ['Jezero ekosistem', 'Selekcija vrsta', 'Ishrana i biofiltri', 'Biofiltracija', 'Berba i čuvanje', 'Legalni aspekti']
  },
  kombinovani: {
    id: 'kombinovani',
    name: 'Kombinovani Modul',
    description: 'Suvozid + Rammed Earth + mini permakultura — kompletna slika prirodne gradnje.',
    duration_days: 3,
    complexity: 5,
    unlock_rep: 600,
    outdoor_heavy: true,
    requires_staff: 'alatko',
    incident_bias: ['INC_07', 'INC_12', 'INC_05', 'INC_08'],
    icon: '🏡',
    color: '#C4956A',
    learn_topics: ['Suvozid osnove', 'Rammed Earth intro', 'Permakultura integracija', 'Site visit analiza', 'Projektni rad', 'Prezentacija grupe']
  },
  prirodna_gradnja: {
    id: 'prirodna_gradnja',
    name: 'Prirodna Gradnja',
    description: 'Ćerpič, slama-bal, blato — najstariji materijali za moderni dom.',
    duration_days: 2,
    complexity: 4,
    unlock_rep: 'prestige_2',
    outdoor_heavy: true,
    requires_staff: 'zemljan',
    incident_bias: ['INC_05', 'INC_12', 'INC_07'],
    icon: '🏠',
    color: '#D2691E',
    learn_topics: ['Ćerpič pravljenje', 'Slama-bal osnove', 'Blato malter', 'Termička izolacija']
  },
  muzika_prostor: {
    id: 'muzika_prostor',
    name: 'Muzika i Prostor',
    description: 'Akustika terena, ambijentalna muzika na otvorenom — soundscape design na imanju.',
    duration_days: 1,
    complexity: 3,
    unlock_rep: 900,
    outdoor_heavy: true,
    requires_staff: null,
    incident_bias: ['INC_14', 'INC_15', 'INC_10'],
    icon: '🎵',
    color: '#7B68EE',
    learn_topics: ['Site akustika', 'Prirodni amplituda', 'Improvizacija u prostoru', 'Zajednički performance']
  },
  akvakultura_napredna: {
    id: 'akvakultura_napredna',
    name: 'Napredna Akvakultura',
    description: 'Integracija ribnjak-vrt — zatvoreni krug vode i hranjivih materija.',
    duration_days: 3,
    complexity: 5,
    unlock_rep: 'prestige_5',
    outdoor_heavy: true,
    requires_staff: 'brana',
    incident_bias: ['INC_04', 'INC_05', 'INC_09', 'INC_12'],
    icon: '🌊',
    color: '#1E90FF',
    learn_topics: ['Aquaponics sistem', 'pH i kiseonik kontrola', 'Riblje disease prevention', 'Integracija sa vrtom', 'Komercijalizacija']
  }
};

/**
 * Vraca katalog sa filterom za dostupne teme po reputaciji
 * @param {number} reputation
 * @param {number} prestigeLevel
 * @returns {string[]} array dostupnih tema ID-eva
 */
export function getAvailableThemes(reputation, prestigeLevel = 0) {
  return Object.values(MASTERCLASS_CATALOG)
    .filter(tema => {
      const req = tema.unlock_rep;
      if (typeof req === 'number') return reputation >= req;
      if (req === 'prestige_2') return prestigeLevel >= 2;
      if (req === 'prestige_5') return prestigeLevel >= 5;
      return false;
    })
    .map(t => t.id);
}

export function getTema(id) {
  return MASTERCLASS_CATALOG[id] || null;
}
