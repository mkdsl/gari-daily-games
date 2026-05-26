// config.js — Konstante, character colors, typing speed

export const TYPING_SPEED = 30; // ms per character
export const SCENE_FADE_DURATION = 300; // ms
export const CHOICE_REVEAL_DELAY = 200; // ms after typing completes

export const CHARACTER_COLORS = {
  gari:   { color: '#F5A623', cssClass: 'speaker-gari',   name: 'Gari' },
  mici:   { color: '#E91E8C', cssClass: 'speaker-mici',   name: 'Mici' },
  brana:  { color: '#4CAF50', cssClass: 'speaker-brana',  name: 'Brana' },
  tonket: { color: '#2196F3', cssClass: 'speaker-tonket', name: 'Tonket' },
  dule:   { color: '#9E9E9E', cssClass: 'speaker-dule',   name: 'Dule' },
  pera:   { color: '#D4AF37', cssClass: 'speaker-pera',   name: 'Pera Period' },
  player: { color: '#E8E8E8', cssClass: 'speaker-player', name: 'Ti' },
};

export const SCENE_LABELS = [
  'Ulaz',
  'Uvod',
  'Zadatak',
  '1-na-1',
  'Konfrontacija',
  'Tonketov test',
  'Garijev poziv',
  'Rezolucija',
  'Share',
];

export const CHOICE_KEYS = ['A', 'B', 'C', 'D'];

export const LS_PREFIX = 'gts_';
export const LS_KEYS = {
  highscore:       `${LS_PREFIX}highscore`,
  endingsUnlocked: `${LS_PREFIX}endings_unlocked`,
  playCount:       `${LS_PREFIX}play_count`,
  lastEnding:      `${LS_PREFIX}last_ending`,
  flagsHistory:    `${LS_PREFIX}flags_history`,
};

export const AFFINITY_CHARACTERS = ['gari', 'mici', 'brana', 'tonket', 'dule', 'pera'];
