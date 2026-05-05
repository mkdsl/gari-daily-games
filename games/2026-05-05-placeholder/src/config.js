/**
 * config.js — Sve tuning konstante za Bespuće
 * Fizika broda, brzine scrolla, chunk pacing, boje, checkpoint/meta troškovi.
 * Menjaj ovde, nigde drugde.
 */
export const CONFIG = {
  SAVE_KEY: 'bespouce-meta',
  SAVE_INTERVAL_SEC: 5,

  // Fizika broda
  GRAVITY: 0,           // px/s² — popuniti iz GDD-a
  THRUST: 0,            // px/s² uz os Y
  DRAG: 0,              // koeficijent otpora (0–1 multiplikator po framu)
  MAX_VY: 0,            // max vertikalna brzina px/s

  // Scroll
  SCROLL_SPEED_BASE: 0, // px/s na početku
  SCROLL_SPEED_MAX: 0,  // hard cap px/s
  SCROLL_ACCEL: 0,      // px/s² rast tokom runa

  // Hodnik
  CORRIDOR_MIN_HEIGHT: 0, // px — minimalna visina prolaza
  CHUNK_WIDTH: 0,          // px — širina jednog chunk-a
  CHUNK_QUEUE_SIZE: 5,

  // Kristali i score
  CRYSTAL_SCORE: 50,
  SCORE_DIVISOR: 10,       // score += distance / SCORE_DIVISOR

  // Checkpoint
  CHECKPOINT_INTERVAL: 0,  // distanca između checkpoint-a (px)
  POWERUP_CHOICES: 2,      // koliko se nudi na checkpoint-u

  // Meta upgrade
  META_MAX_LEVEL: 3,

  // Hitbox igrača
  PLAYER_RADIUS: 10,       // px

  // Magnet pickup
  MAGNET_RADIUS: 0,        // px — default attract range
  MAGNET_SPEED: 0,         // px/s privlačenja

  COLORS: {
    BG: '#0a0a0f',
    PRIMARY: '#e5e5e5',
    ACCENT: '#7ecfff',
    CRYSTAL: '#a8f0ff',
    WALL: '#2a2a3f',
    OBSTACLE: '#ff4d6d',
    RECORD_LINE: 'rgba(255,200,50,0.55)',
    DIM: '#555'
  }
};
