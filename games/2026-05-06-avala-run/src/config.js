export const CONFIG = {
  // Canvas
  LOGICAL_WIDTH: 480,
  LOGICAL_HEIGHT: 854,

  // Ground
  GROUND_RATIO: 0.82,  // groundY = canvas.height * 0.82

  // Player
  PLAYER_X: 80,
  PLAYER_MOVE_SPEED: 180,
  PLAYER_MIN_X: 20,
  PLAYER_MAX_X: 600,
  PLAYER_W: 40,
  PLAYER_H_RUN: 72,
  PLAYER_H_DUCK: 40,
  PLAYER_JUMP_VY: -620,
  GRAVITY: 1400,
  DUCK_DURATION: 0.6,  // sekunde
  FAST_FALL_BOOST: 2000,

  // Speed
  SPEED_BASE: 200,
  SPEED_GROWTH: 0.025,  // per pixel distance
  SPEED_MAX: 600,

  // Scoring
  TRASH_SCORE: 10,           // bodovi po komadu smeća
  DIST_SCORE_PER_100PX: 1,   // bodovi po 100px distance

  // Spawning
  SPAWN_MIN_GAP: 280,
  SPAWN_MAX_GAP: 520,
  TRASH_CHANCE: 0.55,    // šansa da spawn bude smeće
  // ostatak (0.45) je prepreka

  // Anti-abuse: svakih 30s random delay spawn
  ANTI_ABUSE_INTERVAL: 30,

  // Objects — format: { w, h, groundOffset } (groundOffset = koliko je od groundY gore, 0 = stoji na tlu)
  OBSTACLES: {
    bor:    { w: 28, h: 64, groundOffset: 64, hitW: 20, hitH: 36, reqJump: false, moveSpeed: 0 },
    kamen:  { w: 56, h: 36, groundOffset: 36, hitW: 48, hitH: 28, reqJump: true,  moveSpeed: 0 },
    kamion: { w: 80, h: 44, groundOffset: 44, hitW: 76, hitH: 42, reqJump: true,  moveSpeed: -80 },
    dron:   { w: 36, h: 16, groundOffset: 84, hitW: 34, hitH: 14, reqJump: false, moveSpeed: -100 }
  },
  COLLECTIBLES: {
    flasa: { w: 16, h: 24, groundOffset: 24, scoreType: 'trash', trashVal: 1, requireAction: 'grab_down' },
    kesa:  { w: 20, h: 18, groundOffset: 60, scoreType: 'trash', trashVal: 1, requireAction: 'grab_up' },
    logo:  { w: 28, h: 28, groundOffset: 50, scoreType: 'logo',  trashVal: 0, requireAction: null }
  },

  // Logo power-up
  LOGO_SCORE: 50,
  LOGO_CHANCE: 0.03,

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
  SAVE_KEY: 'avala-run-daily-v2',

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
