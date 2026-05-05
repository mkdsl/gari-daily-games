/**
 * config.js — Sve tuning konstante za Bespuće
 * Fizika broda, brzine scrolla, chunk pacing, boje, checkpoint/meta troškovi.
 * Menjaj ovde, nigde drugde.
 */
export const CONFIG = {
  SAVE_KEY: 'bespouce-meta',
  SAVE_INTERVAL_SEC: 5,

  // Fizika broda
  GRAVITY: 648,             // px/s² (0.18 × 60²)
  THRUST_UP: -1512,         // px/s² (-0.42 × 60²), negativno = gore
  THRUST_HORIZ: 1080,       // px/s² (0.30 × 60²)
  MAX_VY: 420,              // max vertikalna brzina px/s (7.0 × 60)
  MAX_VX: 300,              // max horizontalna brzina px/s (5.0 × 60)
  DRAG_FRAME: 0.92,         // primeni kao v *= Math.pow(0.92, dt*60) u physics.js

  // Scroll
  SCROLL_SPEED_BASE: 180,   // px/s na početku (3.0 × 60)
  SCROLL_SPEED_MAX: 720,    // hard cap px/s (12.0 × 60)
  SCROLL_ACCEL: 1.8,        // px/s² rast tokom runa

  // Hodnik
  CORRIDOR_MIN_HEIGHT: 160,   // px — minimalna visina prolaza
  CORRIDOR_START_HEIGHT: 300, // px — početna visina prolaza
  CHUNK_WIDTH: 600,           // px — širina jednog chunk-a
  CHUNK_QUEUE_SIZE: 5,

  // Kristali i score
  CRYSTAL_SCORE: 50,
  SCORE_DIVISOR: 10,          // score += distance / SCORE_DIVISOR
  MULTIPLIER_GROWTH_SEC: 30,  // svake 30s raste multiplier za MULTIPLIER_STEP
  MULTIPLIER_STEP: 0.1,
  MULTIPLIER_CAP: 5.0,

  // Checkpoint
  CHECKPOINT_INTERVAL: 400,         // distanca između checkpoint-a (px)
  POWERUP_CHOICES: 2,               // koliko se nudi na checkpoint-u
  POWERUP_SELECT_TIMEOUT: 3,        // sekunde, onda autoselect
  CHECKPOINT_CLOSE_CALL_DIST: 20,   // px od zida za close-call nagradu
  CHECKPOINT_BONUS_CRYSTALS: 2,     // bonus kristali za close-call

  // Igrač
  PLAYER_RADIUS: 14,          // px — hitbox krug
  PLAYER_X: 200,              // px — fiksna X pozicija broda

  // Magnet pickup
  MAGNET_RADIUS_BASE: 120,    // px — default attract range
  MAGNET_SPEED: 180,          // px/s privlačenja
  PICKUP_COLLECT_RADIUS: 20,  // px — radius za instant pickup

  // Eksplozija
  EXPLOSION_PARTICLES: 20,
  EXPLOSION_SPEED_MAX: 200,   // px/s
  PARTICLE_LIFETIME: 1.5,     // sekunde

  // Meta upgrade
  UPGRADE_COSTS: {
    speed:  [15, 35, 70],
    shield: [20, 50],
    magnet: [25, 60, 120],
  },

  COLORS: {
    BG: '#0a0a0f',
    WALL: '#1a1a2e',
    WALL_STROKE: '#4a9eff',
    SHIP: '#ffffff',
    SHIP_THRUSTER: '#c244ff',
    OBSTACLE_FILL: 'rgba(255,77,110,0.15)',
    OBSTACLE_STROKE: '#ff4d6d',
    CRYSTAL: '#ffe066',
    CRYSTAL_GLOW: 'rgba(255,224,102,0.4)',
    CHECKPOINT_LINE: '#00ff88',
    RECORD_LINE: '#c244ff',
    HUD_TEXT: '#e5e5e5',
    POWERUP_A: '#4a9eff',
    POWERUP_B: '#ff9f43',
    PARTICLE: '#ff6b6b',
  }
};
