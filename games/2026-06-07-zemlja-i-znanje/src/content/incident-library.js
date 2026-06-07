/**
 * incident-library.js — 15 incidenata sa weight, cooldown, options i efektima
 */

export const INCIDENTS = [
  {
    id: 'INC_01',
    name: 'Previše pitanja',
    description: 'Polaznici bombarduju pitanjima i sesija se usporava.',
    weight: 5,
    cooldown: 180,
    time_context: ['teorija', 'any'],
    options: [
      {
        text: 'Q&A 10 minuta',
        icon: '💬',
        effect: { satisfaction: +8, learned: +5, time_minutes: -10 }
      },
      {
        text: 'Odloži na kraj dana',
        icon: '⏰',
        effect: { satisfaction: -3 }
      },
      {
        text: 'Brana preuzima diskusiju',
        icon: '🤝',
        requires_staff: 'brana',
        effect: { satisfaction: +12, passive_bonus: true }
      }
    ]
  },
  {
    id: 'INC_02',
    name: 'Kiša počela',
    description: 'Nebo se naoblačilo i počela je kiša tokom outdoor aktivnosti.',
    weight: 3,
    cooldown: 300,
    time_context: ['any'],
    requires_weather: 'any',  // samo ako je outdoor_heavy tema
    options: [
      {
        text: 'Nastavi napolju',
        icon: '🌧️',
        effect: { satisfaction: -10, energy: -15 }
      },
      {
        text: 'Premesti se unutra',
        icon: '🏠',
        effect: { satisfaction: +5, time_minutes: -15 }
      },
      {
        text: '"Kiša je deo lekcije"',
        icon: '🌿',
        effect: { satisfaction: +15, achievement: 'kisa_ne_zaustavlja', archetype_bonus: { ekolog_aktivista: 20 } }
      }
    ]
  },
  {
    id: 'INC_03',
    name: 'Alat zaboravljen',
    description: 'Ključni alat nije pripremljen — neko mora da ga donese.',
    weight: 4,
    cooldown: 240,
    time_context: ['jutro'],
    options: [
      {
        text: 'Idi po alat (30min)',
        icon: '🏃',
        effect: { satisfaction: -5, time_minutes: -30 }
      },
      {
        text: 'Improvizuj sa čime ima',
        icon: '🔧',
        effect: { satisfaction_roll: { chance: 0.7, success: +8, fail: -15 } }
      },
      {
        text: 'Pozajmi od komšije',
        icon: '🤝',
        requires_reputation: 150,
        effect: { satisfaction: +3, time_minutes: -10 }
      }
    ]
  },
  {
    id: 'INC_04',
    name: 'Alergija sumnja',
    description: 'Jedan polaznik pokazuje simptome — možda alergija na materijal.',
    weight: 2,
    cooldown: 600,
    time_context: ['any'],
    options: [
      {
        text: 'Pauza i provera (10min)',
        icon: '🩺',
        effect: { satisfaction: -5, time_minutes: -10 }
      },
      {
        text: 'Nastavi uz oprez',
        icon: '⚠️',
        effect: { satisfaction: -2, risk: 'minor' }
      }
    ]
  },
  {
    id: 'INC_05',
    name: 'Polaznik povređen',
    description: 'Lakša povreda pri praktičnom radu — posekotina ili uganuo zglob.',
    weight: 1,
    cooldown: 900,
    time_context: ['prakticni_rad'],
    options: [
      {
        text: 'Pauza za prvu pomoć',
        icon: '🩹',
        effect: { satisfaction: -5, energy_group: +5, time_minutes: -10 }
      },
      {
        text: 'Nastavi — polaznik odlazi da odmori',
        icon: '➡️',
        effect: { satisfaction: -15, inc11_chance_bonus: 50 }
      }
    ]
  },
  {
    id: 'INC_06',
    name: 'Struja nestala',
    description: 'Nestalo struje — projektor i alati ne rade.',
    weight: 2,
    cooldown: 500,
    time_context: ['any'],
    options: [
      {
        text: 'Nastavi bez električne opreme',
        icon: '🕯️',
        effect: { satisfaction: -3, learned: -5 }
      },
      {
        text: 'Promeni na outdoor aktivnost',
        icon: '🌿',
        effect: { satisfaction: +2, time_minutes: -5 }
      }
    ]
  },
  {
    id: 'INC_07',
    name: 'Polaznik bez veština',
    description: 'Jedan polaznik daleko zaostaje za grupom — ne može da prati tempo.',
    weight: 4,
    cooldown: 200,
    time_context: ['prakticni_rad'],
    options: [
      {
        text: 'Spusti nivo demonstracije',
        icon: '📉',
        effect: { learned: -10, satisfaction: +5 }
      },
      {
        text: 'Upari sa iskusnijim polaznikom',
        icon: '👥',
        effect: { satisfaction: +8, time_minutes: -5 }
      },
      {
        text: 'Stručnjak demonstrira posebno',
        icon: '🎯',
        requires_staff: 'any',
        effect: { learned: +10, satisfaction: +12 }
      }
    ]
  },
  {
    id: 'INC_08',
    name: 'Stručnjak kasni',
    description: 'Angažovani stručnjak kasni 30 minuta — šta da radimo?',
    weight: 3,
    cooldown: 0,
    one_time: true,
    time_context: ['jutro'],
    requires_staff_hired: true,
    options: [
      {
        text: 'Počni bez njega',
        icon: '▶️',
        effect: { satisfaction: -8, time_delay: 0 }  // gubi se staff bonus za prvu aktivnost
      },
      {
        text: 'Sačekaj (diskusija u krugu)',
        icon: '⏳',
        effect: { satisfaction: -5, time_minutes: -20 }
      }
    ]
  },
  {
    id: 'INC_09',
    name: 'Hrana se pregrela',
    description: 'Ručak je pregrejan/zagoreo — potrebno improv rešenje.',
    weight: 2,
    cooldown: 0,
    one_time: true,
    time_context: ['podne'],
    options: [
      {
        text: 'Naruči dostavu',
        icon: '📦',
        effect: { satisfaction: -5, cost: 50 }
      },
      {
        text: 'Improvizuj salatu iz bašte',
        icon: '🥗',
        effect: { satisfaction: -10, energy: -5, archetype_penalty: { kuvar_u_tranziciji: -20 } }
      }
    ]
  },
  {
    id: 'INC_10',
    name: 'Fotograf/mediji stigli',
    description: 'Lokalni mediji ili blogger su se pojavili sa aparatom.',
    weight: 2,
    cooldown: 600,
    time_context: ['any'],
    options: [
      {
        text: 'Dozvoli snimanje',
        icon: '📸',
        effect: { satisfaction: +5, rep_bonus: 5, archetype_bonus: { mladi_preduzetnik: 2 } }
      },
      {
        text: 'Odbij — fokus na sesiji',
        icon: '🚫',
        effect: { satisfaction: 0 }
      }
    ]
  },
  {
    id: 'INC_11',
    name: 'Polaznik želi da ode',
    description: 'Jedan polaznik je umoran ili razočaran — razmišlja o odlasku.',
    weight: 1,
    cooldown: 1200,
    time_context: ['popodne'],
    options: [
      {
        text: 'Razgovor 1:1 (15min)',
        icon: '🫂',
        effect: { retain_chance: 0.8, satisfaction: +5, time_minutes: -15 }
      },
      {
        text: 'Pusti ga da ode',
        icon: '👋',
        effect: { participants_lost: 1, satisfaction_group: +3 }  // ostali su laknuli
      }
    ]
  },
  {
    id: 'INC_12',
    name: 'Vetar oborio konstrukciju',
    description: 'Jak vetar je srušio delimično gotovu suvozid/rammed earth sekciju.',
    weight: 2,
    cooldown: 0,
    one_time: true,
    time_context: ['any'],
    requires_outdoor: true,
    options: [
      {
        text: 'Popravi odmah zajedno',
        icon: '🔨',
        effect: { satisfaction: -5, time_minutes: -20, archetype_penalty: { ekolog_aktivista: -20 } }
      },
      {
        text: 'Ostavi, pređi na teoriju',
        icon: '📚',
        effect: { satisfaction: -12 }
      }
    ]
  },
  {
    id: 'INC_13',
    name: 'Nije jasna teorija',
    description: 'Više polaznika signalizira da nisu razumeli prethodni blok.',
    weight: 5,
    cooldown: 120,
    time_context: ['teorija', 'posle_teorije'],
    options: [
      {
        text: 'Pojasni dodatno (10min)',
        icon: '💡',
        effect: { learned: +10, satisfaction: +5, time_minutes: -10 }
      },
      {
        text: 'Nastavi napred',
        icon: '⏩',
        effect: { learned: -5, satisfaction: -3 }
      }
    ]
  },
  {
    id: 'INC_14',
    name: 'Problem sa opremom',
    description: 'Muzička/električna oprema ne radi u ključnom trenutku.',
    weight: 1,
    cooldown: 0,
    time_context: ['any'],
    options: [
      {
        text: 'Improvizuj akustično',
        icon: '🎸',
        effect: { satisfaction: -10 }
      },
      {
        text: 'Premesti aktivnost',
        icon: '🔄',
        effect: { satisfaction: +5, time_minutes: -10 }
      }
    ]
  },
  {
    id: 'INC_15',
    name: 'Susedi se žale na buku',
    description: 'Komšija je zakucao na kapiju — buka, rad, muzika.',
    weight: 1,
    cooldown: 0,
    time_context: ['posle_podne'],
    options: [
      {
        text: 'Smanji aktivnost/buku',
        icon: '🤫',
        effect: { satisfaction: -5, noise_reduced: true }
      },
      {
        text: 'Nastavi, objasni komšiji',
        icon: '👋',
        effect: { satisfaction: 0, rep_penalty: 3 }
      }
    ]
  }
];

// Index za brzi lookup
const INCIDENT_MAP = Object.fromEntries(INCIDENTS.map(i => [i.id, i]));

export function getIncident(id) {
  return INCIDENT_MAP[id] || null;
}

export function getIncidentsByTimeContext(context) {
  return INCIDENTS.filter(i => i.time_context.includes(context) || i.time_context.includes('any'));
}
