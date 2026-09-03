// config.js — sve konstante za Crew Recruiter

export const VIBE_START = 30;
export const VIBE_MIN = 0;
export const VIBE_MAX = 100;

export const CHURN_PENALTY = 4;
export const EMPTY_SLOT_PENALTY = 2;
export const IMPATIENCE_PENALTY = 5;
export const MAX_SYNERGY_PER_ROUND = 12;
export const CARDS_DRAWN_PER_ROUND = 3;
export const TOTAL_ROUNDS = 6;

export const PHASES = ['setup', 'soundcheck', 'opening', 'climax', 'breakdown', 'recap'];

export const PHASE_DISPLAY_NAMES = {
  setup:      'Setup',
  soundcheck: 'Soundcheck',
  opening:    'Opening',
  climax:     'Climax',
  breakdown:  'Breakdown',
  recap:      'Recap'
};

export const PHASE_WEIGHTS = {
  setup:      0.5,
  soundcheck: 0.7,
  opening:    0.9,
  climax:     1.2,
  breakdown:  0.8,
  recap:      0.6
};

export const PHASE_THRESHOLDS = {
  setup:      4,
  soundcheck: 7,
  opening:    10,
  climax:     14,
  breakdown:  11,
  recap:      9
};

export const SLOT_ROLES = ['tonac', 'host', 'content', 'logistika', 'obezbedjenje'];

export const SLOT_DISPLAY_NAMES = {
  tonac:        'Tonac',
  host:         'Host',
  content:      'Content Creator',
  logistika:    'Logistika',
  obezbedjenje: 'Obezbeđenje'
};

/** @type {Object.<string, {name: string, bonus: number}>} */
export const SYNERGY_PAIRS = {
  'tonac-logistika':        { name: 'Sound Ready',   bonus: 5 },
  'host-content':           { name: 'Buzz',           bonus: 5 },
  'tonac-host':             { name: 'On Point',       bonus: 4 },
  'host-obezbedjenje':      { name: 'Crowd Control',  bonus: 4 },
  'logistika-obezbedjenje': { name: 'Site Secure',    bonus: 3 },
  'logistika-content':      { name: 'Content Flow',   bonus: 3 },
  'tonac-obezbedjenje':     { name: 'Clean Signal',   bonus: 3 },
  'tonac-content':          { name: 'Live Cut',       bonus: 3 },
  'logistika-host':         { name: 'Timing',         bonus: 2 },
  'content-obezbedjenje':   { name: 'Safe Shot',      bonus: 2 }
};

/** @type {Object.<string, {deckSize: number, unlockAfter: number, synergyOverrides?: Object, phaseWeightOverrides?: Object}>} */
export const EVENT_TYPE_CONFIGS = {
  klub: {
    deckSize: 30,
    unlockAfter: 0,
    synergyOverrides: {},
    phaseWeightOverrides: {}
  },
  outdoor: {
    deckSize: 35,
    unlockAfter: 5,
    synergyOverrides: {
      'logistika-obezbedjenje': { bonus: 6 },
      'host-content':           { bonus: 3 }
    },
    phaseWeightOverrides: {
      setup:  0.7,
      climax: 1.0
    }
  },
  intimate: {
    deckSize: 40,
    unlockAfter: 10,
    synergyOverrides: {
      'host-content':    { bonus: 8 },
      'tonac-logistika': { bonus: 3 }
    },
    phaseWeightOverrides: {
      climax: 0.9,
      recap:  0.9
    }
  }
};

export const RARITY = {
  COMMON: 'common',
  RARE:   'rare',
  SIGNATURE: 'signature'
};

/** Flavor sentence shown as 2.5s overlay at each phase transition (index = phaseIndex) */
export const PHASE_NARRATIVE = [
  'Ekipa se skuplja. Ko kasni, ko je već otišao.',
  'Zvuk se testira. Ovo je momenat istine za svaki kabl.',
  'Vrata su otvorena. Prvih 50 lica određuje energiju noći.',
  'Kulminacija. Svi su tu — ili nisu.',
  'Udarac je prošao. Ko opstaje, ko pada?',
  'Ovo je ona noć o kojoj pričaju godinama — ili ne.',
];

export const SAVE_KEY_PERSISTENT = 'crew-recruiter-persistent';
export const TUTORIAL_DONE_KEY   = 'crew-recruiter-tutorial-done';
