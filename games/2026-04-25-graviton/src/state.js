/**
 * state.js — Game state shape, factory funkcije i localStorage persistence.
 *
 * Jedini localStorage ključ koji se koristi je CONFIG.SAVE_KEY ('graviton_best').
 * Između sesija čuva se SAMO best time (integer sekundi) — ne ceo state.
 *
 * Game phase enum:
 *   'IDLE'             → start screen, čeka input
 *   'PLAYING'          → aktivan game loop (scroll, fizika, G-overload, collision)
 *   'DEAD'             → death animacija (fade to black, 300–400ms, sve staje)
 *   'HIGH_SCORE_CHECK' → end screen sa CRASHED AT / BEST / zvezda / RESTART
 */

import { CONFIG } from './config.js';

/**
 * @typedef {'IDLE' | 'PLAYING' | 'DEAD' | 'HIGH_SCORE_CHECK'} GamePhase
 */

/**
 * @typedef {Object} BrodState
 * @property {number} x               - Fiksirana X pozicija (= CONFIG.PLAYER_X)
 * @property {number} y               - Trenutna Y pozicija (px od vrha, menja se svaki frame)
 * @property {number} velocity_y      - Vertikalna brzina (px/s), pozitivno = dole
 * @property {number} gravity_dir     - +1 (gravitacija dole) ili -1 (gravitacija gore)
 * @property {number} flip_cooldown   - Preostalo vreme cooldown-a u sekundama (≥ 0)
 * @property {number} visual_angle    - Trenutni vizuelni ugao trokuta (radijani, 0 ili Math.PI)
 * @property {number} target_angle    - Ciljni ugao za flip animaciju (Math.PI ili 0)
 * @property {number} flip_anim_t     - Progres animacije 0.0 → 1.0 (1.0 = završena)
 * @property {boolean} flipping       - Da li je u toku flip animacija
 * @property {number} g_overload_timer  - Sekunde bez flipa (kontinuirano, resetuje pri flipu)
 * @property {number} g_overload_ratio  - 0.0–1.0 (= timer / G_OVERLOAD_MAX_TIME)
 */

/**
 * @typedef {Object} Obstacle
 * @property {'block' | 'spike' | 'buzzsaw'} type
 * @property {number} x            - Apsolutna X (gornji levi za block/spike, centar za buzzsaw)
 * @property {number} y            - Apsolutna Y (gornji levi za block/spike, centar za buzzsaw)
 * @property {number} w            - Širina (AABB, za block i spike)
 * @property {number} h            - Visina (AABB, za block i spike)
 * @property {boolean} [fromCeil]  - true ako spike visi sa plafona (orijentisan nadole)
 * @property {boolean} [oscillates]   - true ako buzzsaw osciluje vertikalno
 * @property {number}  [osc_phase]    - Početna faza oscilacije (0–2π)
 * @property {number}  [osc_y_center] - Y centar oscilacije
 * @property {number}  [rotation]     - Trenutni vizuelni ugao buzzsaw-a (radijani)
 */

/**
 * @typedef {Object} Zone
 * @property {number}     template_id  - Indeks šablona (0–9, ili -1/-2/-3 za tutorial)
 * @property {number}     x            - Apsolutna X leve ivice zone (pomera se scroll-om)
 * @property {Obstacle[]} obstacles    - Lista prepreka u apsolutnim koordinatama
 * @property {number}     gap_width    - Slobodan prolaz u px (60–200)
 */

/**
 * Kreira početni state za brod.
 * @returns {BrodState}
 */
export function createBrodState() {
  return {
    x: CONFIG.PLAYER_X,
    y: CONFIG.PLAYER_START_Y,
    velocity_y: 0,
    gravity_dir: 1,              // počinje DOWN (+1)
    flip_cooldown: 0,
    visual_angle: 0,             // 0 = trokut pokazuje gore (normalna gravitacija)
    target_angle: 0,
    flip_anim_t: 1.0,            // 1.0 = animacija završena
    flipping: false,
    g_overload_timer: 0,
    g_overload_ratio: 0,
  };
}

/**
 * Kreira svež game state za novu sesiju.
 * @returns {Object}
 */
export function createState() {
  return {
    // --- Game phase ---
    gamePhase: /** @type {GamePhase} */ ('IDLE'),

    // --- Timing ---
    survival_time: 0,           // sekunde preživljavanja (float, povećava se svaki frame)
    speed_level: 0,             // 0–10, = floor(survival_time / 60), cap 10

    // --- Zone tracking ---
    zone_index: 0,              // broj zona koje je brod "prošao" (napustile levo vidno polje)
    zone_pool: [],              // niz od 100 Zone objekata, generisan pri startu sesije
    active_zones: [],           // Zone trenutno vidljive/aktivne (max 3)
    next_zone_pool_idx: 0,      // sledeći indeks iz zone_pool za spawn

    // --- Brod ---
    brod: createBrodState(),

    // --- Death / overlay ---
    death_overlay_alpha: 0,     // 0.0–0.8, lerp tokom DEAD faze
    death_timer: 0,             // sekunde provedene u DEAD stanju
    death_reason: '',           // 'obstacle' | 'floor' | 'ceil' | 'G-OVERLOAD'

    // --- End screen ---
    current_score: 0,           // sekunde ovog run-a (kopira se iz survival_time pri smrti)
    best_score: loadBestScore(), // best time iz localStorage (sekunde, integer)
    new_record: false,          // true ako je current_score > best_score

    // --- Scroll pozadina ---
    scroll_x: 0,                // ukupno px scroll-ovano (za pozadinski parallax)
  };
}

/**
 * Resetuje state na početne vrednosti. Poziva se pri svakom restartu (IDLE).
 * Čuva best_score između restarta.
 * Zone se ne generišu ovde — to radi initGenerator() iz systems/generator.js.
 * @param {Object} state - Postojeći state objekat koji se mutira in-place
 */
export function resetState(state) {
  const savedBest = state.best_score;
  const fresh = createState();
  Object.assign(state, fresh);
  state.best_score = savedBest;
}

/**
 * Učitava best score iz localStorage.
 * @returns {number} Best time u sekundama (integer), ili 0 ako nema zapisa
 */
export function loadBestScore() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    return raw ? (parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

/**
 * Čuva novi best score u localStorage.
 * @param {number} seconds - Novi best time u sekundama (može biti float, čuva se kao floor)
 */
export function saveBestScore(seconds) {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, String(Math.floor(seconds)));
  } catch {
    // private mode ili storage quota — tiho ignoriši
  }
}
