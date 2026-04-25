/**
 * config.js — Sve tuning konstante za Graviton.
 *
 * Ovaj modul ne zavisi ni od jednog drugog modula.
 * Svi magični brojevi iz GDD-a žive ovde — nigde drugde.
 * Implementatori: ne stavljaj magic numbers u druge module — dodaj konstantu ovde.
 */

export const CONFIG = {
  // --- Canvas / Layout ---
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 450,

  // --- Player pozicija ---
  PLAYER_X: 120,               // fiksirana X pozicija broda (px, 15% od 800)
  PLAYER_START_Y: 225,         // početna Y pozicija (sredina ekrana)
  PLAYER_HITBOX_RADIUS: 5,     // krug R=5px, koristi se za collision

  // --- Gravitacija i kretanje ---
  GRAVITY: 900,                // px/s², akceleracija
  VELOCITY_MAX: 500,           // px/s, clamp u oba smera
  FLIP_COOLDOWN: 0.2,          // sekunde cooldown-a između dva uzastopna flipa

  // --- Scroll ---
  SCROLL_BASE: 180,            // px/s pri speed level 0
  SCROLL_SPEED_PER_LEVEL: 18,  // px/s dodat po levelu
  SCROLL_MAX: 360,             // px/s hard cap (level 10)
  SPEED_LEVEL_INTERVAL: 60,    // sekunde preživljavanja po speed levelu

  // --- Pod i plafon ---
  FLOOR_Y: 420,                // Y od vrha gde pod počinje (hitbox gornja ivica)
  CEIL_Y: 30,                  // Y od vrha gde plafon završava (hitbox donja ivica)
  FLOOR_THICKNESS: 30,         // px visina pod trake
  CEIL_THICKNESS: 30,          // px visina plafon trake

  // --- G-Overload ---
  G_OVERLOAD_MAX_TIME: 4.0,              // sekunde do eksplozije bez flipa
  G_OVERLOAD_WARNING_THRESHOLD: 0.5,    // ratio (0.0–1.0) od kojeg počinje beep i crvenjenje
  G_OVERLOAD_ACTIVE_FROM_ZONE: 4,       // G-overload se aktivira tek od zone_index >= 4

  // --- Zone generator ---
  ZONE_WIDTH: 800,             // px, širina jedne zone (= 1 screen width)
  ZONE_LOOKAHEAD: 2,           // broj zona ispred broda koje se drže u baferu
  ZONE_POOL_SIZE: 100,         // ukupno zona generisanih na startu sesije
  ZONE_CALM_MIN_INTERVAL: 7,   // CALM_OPEN se insertuje svakih 7–10 zona (random)
  ZONE_CALM_MAX_INTERVAL: 10,

  // --- Prepreke ---
  BUZZSAW_HITBOX_RADIUS: 14,             // statičan krug (ne rotira sa vizuelom)
  BUZZSAW_ROTATION_SPEED: Math.PI * 2,  // rad/s (360°/s vizuelna rotacija)
  BUZZSAW_OSCILLATE_AMPLITUDE: 40,      // px ± vertikalna oscilacija
  BUZZSAW_OSCILLATE_PERIOD: 2.0,        // sekunde jednog ciklusa oscilacije
  SPIKE_BASE: 20,                        // px širina baze spike trougla
  SPIKE_HEIGHT: 28,                      // px visina spike trougla
  SPIKE_HITBOX_W: 14,                   // px AABB širina hitbox-a za spike
  SPIKE_HITBOX_H: 20,                   // px AABB visina hitbox-a za spike

  // --- Difficulty scaling ---
  GAP_WIDTH_BASE: 120,                  // px, podrazumevana veličina prolaza
  GAP_WIDTH_REDUCTION_PER_LEVEL: 4,    // px smanjenja gap-a po speed levelu
  GAP_WIDTH_MIN: 60,                    // px hard minimum za gap

  // --- Score / High Score ---
  SAVE_KEY: 'graviton_best',            // localStorage ključ za best time (integer sekundi)
  MILESTONE_GOLD: 300,                  // sekunde za zlatnu zvezdu na end screenu
  MILESTONE_PLATINUM: 600,             // sekunde za platinum na end screenu

  // --- Audio ---
  AUDIO_BEEP_BASE_INTERVAL: 800,       // ms, interval beep-ova pri g_overload_ratio = 0.5
                                        // interval = 800 * (1 - g_overload_ratio) ms

  // --- Animacija ---
  FLIP_ANIM_DURATION: 0.15,            // sekunde za 180° vizuelnu rotaciju trokuta
  DEATH_FADE_DURATION: 0.3,            // sekunde za fade-to-black overlay (0 → 0.8 alpha)
  DEATH_SCREEN_DELAY: 0.4,            // sekunde pre nego što se end screen prikaže

  // --- Brod vizualni ---
  PLAYER_VISUAL_SIZE: 16,              // px, sprite je 16×16

  // --- Boje ---
  COLORS: {
    BG: '#0D0D2B',                       // pozadina: duboki indigo
    FLOOR_CEIL: '#000000',              // pod/plafon traka boja
    NEON_EDGE: '#39FF14',               // neon zelena ivica poda/plafona (2px)
    OBSTACLE: '#FF6B2B',                // blokovi, šiljci, buzzsaw
    PLAYER_WHITE: '#FFFFFF',            // brod: g_overload 0.0–0.49
    PLAYER_YELLOW: '#FFD700',           // brod: g_overload 0.50–0.74
    PLAYER_ORANGE_RED: '#FF4500',       // brod: g_overload 0.75–0.99
    PLAYER_RED: '#FF0000',              // brod: g_overload 1.0 (smrt)
    HUD_TEXT: '#E5E5E5',                // HUD tekst boja
    CRASHED_TEXT: '#FF0000',            // "CRASHED AT" tekst na end screenu
    RECORD_TEXT: '#FFD700',             // "NEW RECORD!" tekst
    BEST_TEXT: '#E5E5E5',               // "BEST:" tekst
    STAR_BG: 'rgba(255,255,255,0.15)', // zvezde u pozadinskom layer-u
    NEBULA: 'rgba(80,30,120,0.12)',    // nebula sloj u pozadini
  },
};
