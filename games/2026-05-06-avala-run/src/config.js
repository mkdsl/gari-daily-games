export const CONFIG = {
  // Canvas
  LOGICAL_WIDTH: 480,
  LOGICAL_HEIGHT: 854,

  // Ground
  GROUND_RATIO: 0.72,  // groundY = canvas.height * 0.72

  // Player
  PLAYER_X: 80,
  PLAYER_W: 20,
  PLAYER_H_RUN: 40,
  PLAYER_H_DUCK: 22,
  PLAYER_JUMP_VY: -420,
  GRAVITY: 900,
  DUCK_DURATION: 0.55,  // sekunde

  // Speed
  SPEED_BASE: 200,
  SPEED_GROWTH: 0.025,  // per pixel distance
  SPEED_MAX: 600,

  // Scoring
  CARD_SCORE: 10,
  DIST_SCORE_PER_100PX: 1,
  CARD_BOOST_SPEED: 80,   // bonus speed za 2s
  CARD_BOOST_DURATION: 2,

  // Spawning
  SPAWN_MIN_GAP: 280,    // minimalni pixel gap između objekata
  SPAWN_MAX_GAP: 520,
  TRASH_CHANCE: 0.45,    // šansa da spawn bude trash umesto prepreke
  CARD_CHANCE: 0.20,     // šansa da spawn bude karta
  // ostatak (0.35) je prepreka

  // Anti-abuse: svakih 30s random delay spawn
  ANTI_ABUSE_INTERVAL: 30,

  // Objects — format: { w, h, groundOffset } (groundOffset = koliko je od groundY gore, 0 = stoji na tlu)
  OBSTACLES: {
    bor:    { w: 28, h: 64, groundOffset: 64, hitW: 20, hitH: 36, reqJump: false },
    kamen:  { w: 36, h: 22, groundOffset: 22, hitW: 34, hitH: 20, reqJump: true  },
    kamion: { w: 80, h: 44, groundOffset: 44, hitW: 76, hitH: 42, reqJump: true  },
    dron:   { w: 36, h: 16, groundOffset: 52, hitW: 34, hitH: 14, reqJump: false }
  },
  COLLECTIBLES: {
    karta:   { w: 20, h: 28, groundOffset: 56, scoreType: 'card',  trashVal: 0  },
    limenka: { w: 16, h: 24, groundOffset: 24, scoreType: 'trash', trashVal: 1  },
    flasa:   { w: 12, h: 28, groundOffset: 28, scoreType: 'trash', trashVal: 1  },
    papir:   { w: 22, h: 16, groundOffset: 34, scoreType: 'trash', trashVal: 1  }
  },

  // Colors
  COLORS: {
    BG_TOP:      '#7a1a2e',
    BG_MID:      '#2d1244',
    BG_BOTTOM:   '#0a0d1a',
    GROUND:      '#1a0d06',
    GROUND_LINE: '#2d1b0e',
    PLAYER:      '#1a1a2e',
    PLAYER_HL:   '#4466AA',
    OBSTACLE:    '#1a0d06',
    KARTA:       '#FFD700',
    LIMENKA:     '#8899AA',
    FLASA:       '#7A5C3A',
    PAPIR:       '#D0D0C0',
    PINE_FAR:    '#0a1a0a',
    PINE_MID:    '#071407',
    BRANDING:    '#cc2244',
    HUD_TEXT:    '#FFFFFF',
    HUD_SCORE:   '#FFD700'
  },

  // Audio
  BEAT_INTERVAL: 0.5,   // sekunde između bass beat-ova

  // Daily highscore
  SAVE_KEY: 'avala-run-daily-v1',

  // Aforizmi
  AFORIZMI: [
    "Avala ne pita da li si spreman. Avala pita da li si tu.",
    "Smeće na putu ne priča o putu — priča o onom ko prolazi i ne zastane.",
    "DJ koji kasni donosi više energije nego onaj koji stiže na vreme.",
    "Šuma u 3 ujutru nije prepreka. Prepreka je misliti da ne možeš proći.",
    "Na Avalu se ne ide. Na Avalu se stiže."
  ],

  // Links
  TICKET_URL: 'https://app.bilet.rs/show/261'
};
