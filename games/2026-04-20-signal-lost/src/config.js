/**
 * config.js — sve konstante za Signal Lost.
 * Jova: menjaj samo ove vrednosti za balans — ostali moduli ih referenciraju.
 */

export const CONFIG = {
  // --- Persistence ---
  SAVE_KEY: 'signal-lost-2026-04-20',
  SAVE_INTERVAL_SEC: 5,

  // --- Grid dimenzije po grupi nivoa ---
  // levels 1-5  → 5×5, levels 6-10 → 6×6, levels 11-15 → 7×7
  GRID_SIZE: [null, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7],

  // --- Distribucija čvorova po nivou (index 0 = nekorišćen) ---
  // Svaki red: [relay, gate, scrambler, orSplitter]
  NODE_DISTRIBUTION: [
    null,
    [16, 6, 1, 0],  // nivo 1
    [14, 7, 2, 0],  // nivo 2
    [13, 7, 2, 1],  // nivo 3
    [12, 8, 2, 1],  // nivo 4
    [11, 8, 3, 1],  // nivo 5
    [22, 9, 3, 1],  // nivo 6
    [20, 10, 3, 2], // nivo 7
    [18, 11, 4, 2], // nivo 8
    [17, 11, 4, 3], // nivo 9
    [15, 12, 5, 3], // nivo 10
    [28, 13, 5, 3], // nivo 11
    [26, 14, 5, 4], // nivo 12
    [24, 15, 6, 4], // nivo 13
    [22, 16, 6, 5], // nivo 14
    [20, 17, 7, 5], // nivo 15
  ],

  // --- Signal brzina: ms između koraka po čvoru ---
  // formula: max(400, 1600 - level * 80)
  SIGNAL_BASE_MS: 1600,
  SIGNAL_STEP_MS: 80,
  SIGNAL_MIN_MS: 400,

  // --- Visibility pravila ---
  // Nivoi 1-5: sve vidljivo; 6-10: OR-Splitter skriven; 11-15: sve osim Relay skriveno
  VISIBILITY: {
    FULL: [1, 2, 3, 4, 5],
    PARTIAL: [6, 7, 8, 9, 10],   // OR-Splitter = '?'
    MINIMAL: [11, 12, 13, 14, 15] // Gate/Scrambler/OR = '?'
  },

  // --- Checkpoint nivoi ---
  CHECKPOINTS: [6, 11],

  // --- Power-up nivoi (posle kojih se nudi izbor) ---
  POWERUP_OFFER_AFTER: [3, 6, 9, 12],

  // --- Power-up definicije ---
  POWERUPS: {
    SLOW_SIGNAL: {
      id: 'SLOW_SIGNAL',
      label: 'Slow Signal',
      desc: '+600ms po čvoru, narednih 5 čvorova',
      bonusMs: 600,
      durationNodes: 5,
    },
    REVEAL: {
      id: 'REVEAL',
      label: 'Reveal',
      desc: 'Svi čvorovi vidljivi 4 sekunde',
      durationSec: 4,
    },
    FREEZE: {
      id: 'FREEZE',
      label: 'Freeze',
      desc: 'Signal pauziraj 2 sekunde',
      durationSec: 2,
    },
    TIME_BUBBLE: {
      id: 'TIME_BUBBLE',
      label: 'Time Bubble',
      desc: 'Sve interakcije 2× brže, 6 sekundi',
      speedMultiplier: 2,
      durationSec: 6,
    },
    ECHO: {
      id: 'ECHO',
      label: 'Echo',
      desc: 'Duplicira efekat sledećeg aktiviranog power-up-a',
      durationNodes: 1,
    },
  },

  // --- Ukupan broj nivoa ---
  MAX_LEVELS: 15,

  // --- Score formula ---
  SCORE_PER_LEVEL: 100,
  SCORE_TIME_MULTIPLIER: 5,
  SCORE_TARGET_SEC_PER_LEVEL: 20,
  SCORE_POWERUP_LEFT: 75,

  // --- Blueprint boje ---
  COLORS: {
    BG:            '#0a0a0f',
    GRID_LINE:     '#1f2937',
    NODE_DEFAULT:  '#1a2a4a',
    NODE_ACTIVE:   '#00e5ff',
    NODE_GATE_OFF: '#1a2a4a',
    NODE_GATE_ON:  '#00e5ff',
    NODE_SCRAMBLER:'#7c3aed',
    NODE_OR:       '#f59e0b',
    NODE_UNKNOWN:  '#374151',
    SIGNAL:        '#ff6b2b',
    SIGNAL_GLOW:   'rgba(255, 107, 43, 0.4)',
    TEXT:          '#e5e5e5',
    TEXT_DIM:      '#6b7280',
    SUCCESS:       '#10b981',
    FAIL:          '#ef4444',
    CYAN:          '#00e5ff',
    ORANGE:        '#ff6b2b',
  },

  // --- Render tuning ---
  NODE_RADIUS: 22,          // px (logiche koordinate, ne DPR)
  NODE_PADDING: 20,         // min razmak između ivice čvora i linije
  SIGNAL_RADIUS: 8,
  GLOW_BLUR: 18,

  // --- Flash efekti ---
  FLASH_SUCCESS_MS: 400,
  FLASH_FAIL_MS: 300,
  CHECKPOINT_PULSE_MS: 500,
};

/**
 * Izračunaj signal brzinu (ms/čvor) za dati nivo.
 * @param {number} level - 1-15
 * @returns {number} ms po čvoru
 */
export function signalSpeedMs(level) {
  return Math.max(CONFIG.SIGNAL_MIN_MS, CONFIG.SIGNAL_BASE_MS - level * CONFIG.SIGNAL_STEP_MS);
}

/**
 * Izračunaj finalni skor.
 * @param {number} level - broj završenih nivoa
 * @param {number} actualTimeSec - ukupno vreme u sekundama
 * @param {number} powerupsLeft - broj neiskorišćenih power-up-ova
 * @returns {number} skor
 */
export function calcScore(level, actualTimeSec, powerupsLeft) {
  const targetTime = level * CONFIG.SCORE_TARGET_SEC_PER_LEVEL;
  const timeBonus = Math.max(0, (targetTime - actualTimeSec) * CONFIG.SCORE_TIME_MULTIPLIER);
  return Math.floor(level * CONFIG.SCORE_PER_LEVEL + timeBonus + powerupsLeft * CONFIG.SCORE_POWERUP_LEFT);
}
