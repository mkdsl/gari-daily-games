// src/config.js — Sve konstante: grid dimenzije, resource rate-ovi, bura timing, prestige config

export const CONFIG = {
  SAVE_KEY: 'kolonija-7',
  SAVE_INTERVAL_SEC: 5,

  // --- Grid ---
  GRID_COLS: 16,
  GRID_ROWS: 20,
  CELL_SIZE: 40,           // px, prilagodi u render-u za ekran

  // --- Resursi ---
  FOOD_BASE_RATE: 0.5,     // hrane/sec po radnici (base, bez soba)
  MINERAL_BASE_RATE: 0.2,  // minerala/sec po radnici
  RESOURCE_CAP_BASE: 200,  // max resursa bez Magacin soba

  // --- Radnice ---
  WORKER_START: 3,
  WORKER_CAP_BASE: 20,
  WORKER_COST_BASE: 30,    // hrana za prvu radnicu
  WORKER_COST_GROWTH: 1.5, // eksponencijalni rast cene

  // --- Sobe ---
  ROOM_COSTS: {
    MAGACIN:  { food: 50,  minerals: 20  },  // level 0→1
    LEGLO:    { food: 40,  minerals: 10  },
    ZID:      { food: 20,  minerals: 60  },
    LAB:      { food: 80,  minerals: 80  }
  },
  ROOM_UPGRADE_MULT: 2.0,   // svaki sledeći level košta 2x više
  ROOM_MAX_LEVEL: 3,

  // --- Bura ---
  STORM_INTERVAL_SEC: 90,      // vreme između bura (mirna faza)
  STORM_TELEGRAPH_SEC: 15,     // koliko traje upozorenje
  STORM_ACTIVE_SEC: 10,        // koliko traje aktivan damage
  STORM_CALM_SEC: 5,           // smiruje se
  STORM_DAMAGE_BASE: 0.15,     // % radnica koji ginu od prve bure
  STORM_DAMAGE_SCALE: 0.05,    // + po svakoj narednoj buri

  // --- Kopanje ---
  DIG_FOOD_MIN: 2,
  DIG_FOOD_MAX: 8,
  DIG_MINERAL_MIN: 1,
  DIG_MINERAL_MAX: 5,
  DIG_FOOD_CHANCE: 0.55,      // šansa da ćelija sadrži hranu
  DIG_MINERAL_CHANCE: 0.35,   // šansa za mineral
  DIG_EMPTY_CHANCE: 0.10,     // prazna

  // --- Kristal ---
  CRYSTAL_DEPTH_MIN: 14,      // min row gde može biti kristal
  FOG_REVEAL_RADIUS: 1,       // ćelija koje se otkriju oko iskopane

  // --- Prestige ---
  PRESTIGE_META_WIN_COUNT: 5, // prestige-a potrebno za meta win

  // --- Boje (Pera Piksel paleta — pustinjska kolona) ---
  COLORS: {
    BG:              '#1a1208',  // tamna zemlja
    ZEMLJA:          '#3d2b1a',  // neistražena ćelija
    TUNEL:           '#c2a57a',  // iskopan tunel
    SOBA_MAGACIN:    '#8b6914',
    SOBA_LEGLO:      '#5a3e28',
    SOBA_ZID:        '#607080',
    SOBA_LAB:        '#2e4a5c',
    KRISTAL:         '#00ffdd',
    FOG:             '#0f0a05',  // neotkriven prostor
    FOOD:            '#d4a832',  // žuto-narandžasta
    MINERAL:         '#7eb8c9',  // plavo-siva
    STORM_SAND:      '#c8a45a',
    WORKER:          '#ff9933',
    TEXT:            '#e8dcc8',
    ACCENT:          '#ff6b35',
    DIM:             '#5c4a33'
  }
};
