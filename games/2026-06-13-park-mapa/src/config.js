export const CONFIG = {
  // ─── Persistence ───────────────────────────────────────────────────────────
  SAVE_KEY: 'parkMapa_v1',
  SAVE_INTERVAL_SEC: 30,

  // ─── Canvas ────────────────────────────────────────────────────────────────
  CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 540,

  // ─── Zone tile dimensions (px) ─────────────────────────────────────────────
  ZONE_TILE_W: 160,
  ZONE_TILE_H: 100,

  // ─── Grid layout ───────────────────────────────────────────────────────────
  GRID_COLS: 3,
  GRID_ROWS: 3,
  GRID_PAD_X: 20,
  GRID_PAD_Y: 20,

  // ─── Color palette ─────────────────────────────────────────────────────────
  COLORS: {
    BG:          '#0D1B2A',
    PULT_ACCENT: '#BF5FFF',
    BINA_ACCENT: '#FFB830',
    SUMA_ACCENT: '#40C87E',
    LOCKED_GRAY: '#2A3040',
    GOLD:        '#FFD700',
    TEXT:        '#E8DCC8',
  },

  // ─── Park Point rewards ────────────────────────────────────────────────────
  PT_REWARDS: {
    ZONE_CHECKIN:             15,
    ZONE_CHECKIN_DAILY_LIGHT: 25,
    EGG_MIN:                   5,
    EGG_MAX:                  10,
    MINI_STORY:                5,
    NPC_MISSION_MIN:          30,
    NPC_MISSION_MAX:          50,
    DAILY_CLOSURE:            10,
  },

  // ─── Zone upgrade costs [level 1→2, 2→3, 3→4, 4→5] in PT ─────────────────
  ZONE_LEVEL_COSTS: [50, 150, 400, 1000],

  // ─── Check-in cooldown: 23 h in ms ────────────────────────────────────────
  CHECKIN_COOLDOWN_MS: 23 * 60 * 60 * 1000,

  // ─── Egg hunt ──────────────────────────────────────────────────────────────
  EGGS_PER_DAY: 7,
  EGG_HOTSPOTS: 40,

  // ─── Rank thresholds (total PT earned) ────────────────────────────────────
  PARK_RANKS: [
    { name: 'Izletnik',          min:    0 },
    { name: 'Poznavalac',        min:  300 },
    { name: 'Domaćin',           min:  900 },
    { name: 'Legenda',           min: 2500 },
    { name: 'MKDSLend Original', min: 6000 },
  ],

  // ─── NPC definitions ───────────────────────────────────────────────────────
  NPC_DEFINITIONS: [
    {
      id:     'vlado',
      name:   'Vlado',
      title:  'Kurator',
      zone:   'pult',
      avatar: '🧑‍💼',
      flavor: 'Vlado zna sve o istoriji parka. Pita te uvek nešto neočekivano.',
    },
    {
      id:     'mara',
      name:   'Mara',
      title:  'Park Ranger',
      zone:   'suma',
      avatar: '🌿',
      flavor: 'Mara zna gde raste svaka biljka. I gde se kriju jaja.',
    },
    {
      id:     'ace',
      name:   'Ace',
      title:  'DJ',
      zone:   'bina',
      avatar: '🎧',
      flavor: 'Ace sluša sve žanrove. Ali samo jedan pušta kad se sprema Bina.',
    },
    {
      id:     'djordje',
      name:   'Đorđe',
      title:  'Biljkar',
      zone:   null,   // luta između Pulta i Šume — bez fiksne zone
      avatar: '🌱',
      flavor: 'Đorđe luta između Pulta i Šume. Nosi uvek neku semenku u džepu.',
    },
  ],

  // ─── Zone sets ─────────────────────────────────────────────────────────────
  ACTIVE_ZONES: ['pult', 'bina', 'suma'],

  LOCKED_ZONES: ['jezero', 'kafana', 'arene', 'staklenici', 'cuvarica', 'biblioteka'],

  // ─── Grid positions (col, row) in 3×3 grid, 0-indexed left→right, top→down
  ZONE_GRID_POSITIONS: {
    pult:       { col: 0, row: 0 },
    bina:       { col: 1, row: 0 },
    suma:       { col: 2, row: 0 },
    jezero:     { col: 0, row: 1 },
    kafana:     { col: 1, row: 1 },
    arene:      { col: 2, row: 1 },
    staklenici: { col: 0, row: 2 },
    cuvarica:   { col: 1, row: 2 },
    biblioteka: { col: 2, row: 2 },
  },

  // ─── Display names ─────────────────────────────────────────────────────────
  ZONE_DISPLAY_NAMES: {
    pult:       'Pult',
    bina:       'Bina',
    suma:       'Šuma',
    jezero:     'Jezero',
    kafana:     'Kafana',
    arene:      'Arene',
    staklenici: 'Staklenici',
    cuvarica:   'Čuvarica',
    biblioteka: 'Biblioteka',
  },

  // ─── Easter-egg collectible types ──────────────────────────────────────────
  EGG_TYPES: [
    {
      id:   'lampion',
      name: 'Čudni Lampion',
      desc: 'Lampion koji gori drugačijom bojom od ostalih. Niko ne zna ko ga pali.',
    },
    {
      id:   'klupa',
      name: 'Zarđala Klupa',
      desc: 'Oslonjen na ivicu puta, čeka. Natpis na naslonu je izbledeleo.',
    },
    {
      id:   'poster',
      name: 'Tajanstveni Poster',
      desc: 'Nalepljeno na drvo. Bez datuma, bez potpisa. Samo datum — pogrešna godina.',
    },
    {
      id:   'torba',
      name: 'Zaboravljena Torba',
      desc: 'Otvorena. Unutra: beležnica, olovka, i karta MKDSLend-a od pre svega ovoga.',
    },
    {
      id:   'knjiga',
      name: 'Otvorena Knjiga',
      desc: 'Ostavljena otvorena na klupi. Čita se o teoriji zvuka i pejzažu.',
    },
    {
      id:   'foto',
      name: 'Stara Fotografija',
      desc: 'Crno-bela. Park izgleda isto. Samo nema nikog na slici.',
    },
    {
      id:   'vinil',
      name: 'Vinilna Ploča',
      desc: 'Bez kutije, bez etikete. Stoji naslonjena na drvo. Igla je i dalje na njoj.',
    },
  ],

  // ─── Season schedule ───────────────────────────────────────────────────────
  SEASON_START: '2026-06-13',
  SEASON_DAYS:  28,

  // ─── Proximity audio base tones (Hz) per active zone ──────────────────────
  ZONE_PROXIMITY_TONES: {
    pult: 185,
    bina: 196,
    suma: 147,
  },
};
