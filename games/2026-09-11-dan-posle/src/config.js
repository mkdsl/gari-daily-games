/**
 * config.js — Sve konstante za Dan Posle
 */

/** Satovi igre: 07:00 → 19:00 */
export const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

/** Resurs početni/min/max */
export const RESOURCES = {
  energija:  { label: 'Energija',  start: 6, min: 0, max: 10, color: '#4a7c59', icon: '⚡' },
  veze:      { label: 'Veze',      start: 3, min: 0, max: 10, color: '#3a6a9e', icon: '🤝' },
  secanja:   { label: 'Sećanja',   start: 2, min: 0, max: 10, color: '#c8820a', icon: '📸' },
  nered:     { label: 'Nered',     start: 10, min: 0, max: 10, color: '#b03030', icon: '🗑️', inverted: true }
};

/** Atmosfera: sat → boja pozadine */
export const ATMOSPHERE = {
  7:  { bg: '#f5e6c8', text: '#2a1a0e', label: 'Zora' },
  8:  { bg: '#f2d9a8', text: '#2a1a0e', label: 'Jutro' },
  9:  { bg: '#f0d090', text: '#2a1a0e', label: 'Rano jutro' },
  10: { bg: '#efd67a', text: '#2a1a0e', label: 'Predpodne' },
  11: { bg: '#f5e84e', text: '#2a1a0e', label: 'Vreli pre-podne' },
  12: { bg: '#f7f2a0', text: '#2a1a0e', label: 'Podne' },
  13: { bg: '#e8e87a', text: '#2a1a0e', label: 'Popodne' },
  14: { bg: '#d4e088', text: '#2a1a0e', label: 'Toplo popodne' },
  15: { bg: '#c8d898', text: '#2a1a0e', label: 'Hlađenje počinje' },
  16: { bg: '#b8c8b0', text: '#2a1a0e', label: 'Zelenkasto popodne' },
  17: { bg: '#e8c880', text: '#2a1a0e', label: 'Zlatni sat' },
  18: { bg: '#d47050', text: '#f5e6c8', label: 'Sumrak' },
  19: { bg: '#804050', text: '#f5e6c8', label: 'Mrak' }
};

/** Nodovi po satu (broj koji treba da se prikaže — shuffled iz pool-a) */
export const NODES_PER_HOUR = {
  7: 3,
  8: 3,
  9: 2,
  10: 3,
  11: 2,
  12: 3,
  13: 2,
  14: 3,
  15: 2,
  16: 2,
  17: 2,  // N26 + N27 (N26B_PRESTIGE replace u prestige)
  18: 2,
  19: 3
};

/** Audio: sat → parametri */
export const AUDIO_CONFIG = {
  7:  { freq: 220,  type: 'sine',     lfo: 4,    vol: 0.08, noise: 'pink',  noiseVol: 0.06, bpm: 0   },
  8:  { freq: 440,  type: 'sine',     lfo: 0,    vol: 0.06, noise: 'brown', noiseVol: 0.05, bpm: 60  },
  9:  { freq: 330,  type: 'triangle', lfo: 0,    vol: 0.07, noise: null,    noiseVol: 0,    bpm: 0   },
  10: { freq: 220,  type: 'sine',     lfo: 72,   vol: 0.08, noise: null,    noiseVol: 0,    bpm: 72  },
  11: { freq: 110,  type: 'sine',     lfo: 3,    vol: 0.07, noise: null,    noiseVol: 0,    bpm: 0   },
  12: { freq: 180,  type: 'sine',     lfo: 0.2,  vol: 0.09, noise: null,    noiseVol: 0,    bpm: 0   },
  13: { freq: 160,  type: 'triangle', lfo: 0,    vol: 0.07, noise: null,    noiseVol: 0,    bpm: 60  },
  14: { freq: 200,  type: 'sawtooth', lfo: 0,    vol: 0.06, noise: 'band',  noiseVol: 0.03, bpm: 90  },
  15: { freq: 220,  type: 'sine',     lfo: 0,    vol: 0.05, noise: null,    noiseVol: 0,    bpm: 70  },
  16: { freq: 200,  type: 'sine',     lfo: 0,    vol: 0.07, noise: 'band',  noiseVol: 0.04, bpm: 80  },
  17: { freq: 320,  type: 'sine',     lfo: 0,    vol: 0.08, noise: null,    noiseVol: 0,    bpm: 55  },
  18: { freq: 160,  type: 'sine',     lfo: 0,    vol: 0.06, noise: null,    noiseVol: 0,    bpm: 40  },
  19: { freq: 80,   type: 'sine',     lfo: 0,    vol: 0.07, noise: null,    noiseVol: 0,    bpm: 30  }
};

/** Ending thresholds */
export const ENDINGS = {
  ZAJEDNICA: { id: 'zajednica', label: 'Zajednica nastaje', condition: 'veze>=8 AND secanja>=5' },
  DOBAR:     { id: 'dobar',     label: 'Dobar posao',       condition: 'cs_6_10' },
  SLEDECE:   { id: 'sledece',   label: 'Sledeće leto',      condition: 'cs<6 AND energija>3', prestigeUnlock: true },
  SAGOREO:   { id: 'sagoreo',   label: 'Sagoreo si',        condition: 'cs<6 AND energija<=3' }
};

/** Achievement definicije */
export const ACHIEVEMENTS_DEF = {
  A1: { id: 'A1', title: 'Zajednica nastaje',   icon: '🌱', desc: 'Dobij ending "Zajednica nastaje"' },
  A2: { id: 'A2', title: 'Toma bi bio ponosan', icon: '📓', desc: 'Sve Toma interakcije — opcija A' },
  A3: { id: 'A3', title: 'Kluboslavija bašta',  icon: '🎵', desc: 'Pomeni turneju novinarki (N7A)' },
  A4: { id: 'A4', title: 'Sve pospremljeno',    icon: '✨', desc: 'Nered ≤ 2 na kraju igre' },
  A5: { id: 'A5', title: 'Aforist',             icon: '✍️', desc: 'Pošalji aforizam za Instagram (N22B)' },
  A6: { id: 'A6', title: 'Solo artist',         icon: '🦅', desc: 'Energija ≥ 7, bez V+2 odluka' },
  A7: { id: 'A7', title: 'Sledeće leto, zaista', icon: '🔄', desc: 'Prestige unlock + završen 2. playthrough' },
  A8: { id: 'A8', title: 'Fondaš',              icon: '💛', desc: 'Novčanicu daj u fond festivala (N25C)' }
};

/** localStorage ključevi */
export const STORAGE_KEYS = {
  GAME_STATE:   'danposle_state',
  ACHIEVEMENTS: 'danposle_achievements',
  PRESTIGE:     'danposle_prestige',
  AUDIO_MUTED:  'danposle_muted'
};

/** Boje resursa za dark mode */
export const RESOURCE_DARK = {
  energija: '#6ab87a',
  veze:     '#5a9abe',
  secanja:  '#e8a030',
  nered:    '#d05050'
};
