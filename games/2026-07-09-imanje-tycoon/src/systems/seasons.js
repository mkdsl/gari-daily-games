/**
 * systems/seasons.js — Season timer and transition handler.
 *
 * Season duration: 120s for S1-S4, 90s from S5+ (SEASON_LATE_THRESHOLD).
 * Random events: 8% chance from S3+, only when no active event.
 * Season end: records revenue, resets actions, clears/advances events.
 * Market forecast updates each season.
 */

import { GAME_CONFIG } from '../config.js';
import { updateMarketForecast } from '../economy/market.js';
import { resetDailyActions } from './workers.js';

// ─── Event definitions ────────────────────────────────────────────────────────

const EVENT_TYPES = [
  {
    type: 'suša',
    label: '☀️ Suša!',
    desc: 'Visoke temperature — Plastenik yield −30% ovu sezonu.',
    target: 'greenhouse',
    severity: 'negative',
    icon: '☀️',
  },
  {
    type: 'bolest',
    label: '🦠 Bolest pečuraka!',
    desc: 'Zaraza micelija — spawn ratio −25% ovu sezonu.',
    target: 'mushrooms',
    severity: 'negative',
    icon: '🦠',
  },
  {
    type: 'zaraza_ribe',
    label: '🐛 Zaraza ribe!',
    desc: 'Paraziti u ribnjaku — rast ribe −20% ovu sezonu.',
    target: 'fishpond',
    severity: 'negative',
    icon: '🐛',
  },
  {
    type: 'rekordna',
    label: '🌟 Rekordna sezona!',
    desc: 'Odlični uslovi — svi prihodi +15% ovu sezonu.',
    target: 'all',
    severity: 'positive',
    icon: '🌟',
  },
  {
    type: 'inspekcija',
    label: '🏛️ Sanitarna inspekcija!',
    desc: `Inspekcija — kazna ${GAME_CONFIG.INSPECTION_FINE.toLocaleString()} din.`,
    target: 'event',
    severity: 'negative',
    icon: '🏛️',
  },
  {
    type: 'trzisna_potraznja',
    label: '📈 Povećana tražnja!',
    desc: 'Lokalni restoran traži više — cene na pijaci +10% ovu sezonu.',
    target: 'market',
    severity: 'positive',
    icon: '📈',
  },
];

// ─── Season tick ──────────────────────────────────────────────────────────────

/**
 * Tick season timer by dt seconds.
 * @param {object} state
 * @param {number} dt
 * @returns {boolean} true if season ended this tick
 */
export function tickSeason(state, dt) {
  state.seasonTimer = Math.max(0, (state.seasonTimer || 0) - dt);
  return state.seasonTimer <= 0;
}

// ─── Season end handler ───────────────────────────────────────────────────────

/**
 * Handle end-of-season: advance season, reset timers, roll events, update forecast.
 * @param {object} state
 * @param {object|null} audio
 * @param {Function|null} onSeasonEnd - callback({ season, revenue, event, phase })
 */
export function handleSeasonEnd(state, audio, onSeasonEnd) {
  const endedSeason = state.season;

  // ── Record season revenue ────────────────────────────────────────────────
  state.monthlyRevenue = state.monthlyRevenue || [];
  const seasonRev = state.seasonRevenue || 0;
  state.monthlyRevenue.push(seasonRev);

  // Keep last 6 seasons in history
  if (state.monthlyRevenue.length > 6) {
    state.monthlyRevenue.shift();
  }

  // Check if this was "over target" for Faza C
  if (seasonRev >= GAME_CONFIG.PHASE_C_MONTHLY_SURPLUS) {
    state.consecutiveSeasonsOverTarget = (state.consecutiveSeasonsOverTarget || 0) + 1;
  } else {
    state.consecutiveSeasonsOverTarget = 0;
  }

  const seasonRevSummary = seasonRev;
  state.seasonRevenue = 0;

  // ── Strand operating costs (if prestige.scenario === 'strandG') ──────────
  if (state.prestige.scenario === 'strandG') {
    const opCost = state._strandGOperatingCost || 5000;
    if (state.capital >= opCost) {
      state.capital -= opCost;
    } else {
      state.capital = 0; // Can't go negative
    }
  }

  // ── Reset daily actions ──────────────────────────────────────────────────
  resetDailyActions(state);

  // ── Pijaca season tracking (for achievement A17) ─────────────────────────
  if (state.unlockedChannels.includes('pijaca') && (state.channels.pijaca || 0) > 0) {
    state.greenhouse.pijacaSeasons = (state.greenhouse.pijacaSeasons || 0) + 1;
  }

  // ── Active event countdown ───────────────────────────────────────────────
  let clearedEvent = null;
  if (state.activeEvent) {
    if (state.activeEvent.seasonsLeft !== undefined) {
      state.activeEvent.seasonsLeft--;
      if (state.activeEvent.seasonsLeft <= 0) {
        clearedEvent = state.activeEvent;
        clearEvent(state);
      }
    }
  }

  // ── Advance season counter ───────────────────────────────────────────────
  state.season++;

  // ── Season timer for next season ─────────────────────────────────────────
  const dur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
    : GAME_CONFIG.SEASON_DURATION_SEC;
  state.seasonTimer = dur;

  // ── Masterclass unlock at season 4 ──────────────────────────────────────
  if (state.season >= GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) {
    state.masterclassUnlocked = true;
  }

  // ── Random event roll ────────────────────────────────────────────────────
  let newEvent = null;
  if (state.season >= 3 && !state.activeEvent) {
    const roll = Math.random();
    // Štrand: inspekcija 12% base chance (instead of 8%)
    const eventChance = state.prestige.scenario === 'strandG' ? 0.12 : GAME_CONFIG.EVENT_CHANCE_PER_SEASON;
    if (roll < eventChance) {
      newEvent = triggerRandomEvent(state, audio);
    }
  }

  // ── Market forecast update ───────────────────────────────────────────────
  updateMarketForecast(state);

  if (audio) audio.playSfx('season_end');

  if (onSeasonEnd) {
    onSeasonEnd({
      season: endedSeason,
      revenue: seasonRevSummary,
      event: state.activeEvent || null,
      clearedEvent,
      averageRevenue: getAverageRevenue(state),
    });
  }
}

// ─── Event system ─────────────────────────────────────────────────────────────

/**
 * Roll and apply a random event.
 * @param {object} state
 * @param {object|null} audio
 * @returns {object|null} the event that was triggered
 */
function triggerRandomEvent(state, audio) {
  // Filter events based on unlocked branches
  const pool = EVENT_TYPES.filter(e => {
    if (e.target === 'greenhouse' && !state.greenhouse.unlocked) return false;
    if (e.target === 'fishpond' && !state.fishpond.unlocked) return false;
    // Inspekcija more likely in Štrand
    return true;
  });

  if (pool.length === 0) return null;

  // Weight positive events lower than negative
  const weighted = [];
  for (const ev of pool) {
    if (ev.severity === 'positive') {
      weighted.push(ev); // 1× weight
    } else {
      weighted.push(ev, ev); // 2× weight for negatives
    }
  }

  const ev = weighted[Math.floor(Math.random() * weighted.length)];
  applyEvent(state, ev);
  if (audio) audio.playSfx('event_alert');
  return ev;
}

/**
 * Apply an event to game state.
 * @param {object} state
 * @param {object} ev - event definition
 */
export function applyEvent(state, ev) {
  switch (ev.type) {
    case 'suša':
      state.greenhouse.suša = true;
      state.activeEvent = {
        type: ev.type, label: ev.label, desc: ev.desc,
        seasonsLeft: 1, severity: ev.severity, icon: ev.icon,
      };
      break;

    case 'bolest':
      state.mushrooms.spawnRatioBonus =
        (state.mushrooms.spawnRatioBonus || 0) - GAME_CONFIG.DISEASE_YIELD_PENALTY;
      state.activeEvent = {
        type: ev.type, label: ev.label, desc: ev.desc,
        seasonsLeft: 1, severity: ev.severity, icon: ev.icon,
        onClear: 'restore_spawn',
      };
      break;

    case 'zaraza_ribe':
      state._fishGrowthPenalty = GAME_CONFIG.MOLD_YIELD_PENALTY;
      state.activeEvent = {
        type: ev.type, label: ev.label, desc: ev.desc,
        seasonsLeft: 1, severity: ev.severity, icon: ev.icon,
      };
      break;

    case 'rekordna':
      state._recordSeasonBonus = GAME_CONFIG.RECORD_SEASON_BONUS;
      state.activeEvent = {
        type: ev.type, label: ev.label, desc: ev.desc,
        seasonsLeft: 1, severity: ev.severity, icon: ev.icon,
      };
      break;

    case 'inspekcija': {
      const fine = GAME_CONFIG.INSPECTION_FINE;
      state.capital = Math.max(0, state.capital - fine);
      state.activeEvent = {
        type: ev.type, label: ev.label, desc: ev.desc,
        seasonsLeft: 0, severity: ev.severity, icon: ev.icon,
      };
      // Clears immediately after application
      setTimeout(() => clearEvent(state), 200);
      break;
    }

    case 'trzisna_potraznja':
      // Boost market forecast prices
      if (state.marketForecast) {
        state.marketForecast.paradajz = Math.round(state.marketForecast.paradajz * 1.10);
        state.marketForecast.mikrobiljke = Math.round(state.marketForecast.mikrobiljke * 1.10);
      }
      state.activeEvent = {
        type: ev.type, label: ev.label, desc: ev.desc,
        seasonsLeft: 1, severity: ev.severity, icon: ev.icon,
      };
      break;

    default:
      break;
  }
}

/**
 * Clear the active event and revert its effects.
 * @param {object} state
 */
function clearEvent(state) {
  if (!state.activeEvent) return;
  const ev = state.activeEvent;

  switch (ev.type) {
    case 'suša':
      state.greenhouse.suša = false;
      break;
    case 'bolest':
      state.mushrooms.spawnRatioBonus =
        (state.mushrooms.spawnRatioBonus || 0) + GAME_CONFIG.DISEASE_YIELD_PENALTY;
      break;
    case 'zaraza_ribe':
      delete state._fishGrowthPenalty;
      break;
    case 'rekordna':
      delete state._recordSeasonBonus;
      break;
    case 'trzisna_potraznja':
      // Market forecast will naturally reset on next updateMarketForecast call
      break;
    default:
      break;
  }

  state.activeEvent = null;
}

// ─── Season helpers ───────────────────────────────────────────────────────────

/**
 * Get formatted season timer string (MM:SS).
 * @param {number} seconds
 * @returns {string}
 */
export function formatSeasonTimer(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Get average season revenue from recent history.
 * @param {object} state
 * @param {number} n - last N seasons (default 3)
 * @returns {number}
 */
export function getAverageRevenue(state, n = 3) {
  const recent = state.monthlyRevenue || [];
  if (recent.length === 0) return 0;
  const slice = recent.slice(-n);
  return slice.reduce((s, v) => s + v, 0) / slice.length;
}

/**
 * Get season trend (positive/negative/stable).
 * @param {object} state
 * @returns {'up'|'down'|'stable'}
 */
export function getSeasonTrend(state) {
  const recent = state.monthlyRevenue || [];
  if (recent.length < 2) return 'stable';
  const last = recent[recent.length - 1];
  const prev = recent[recent.length - 2];
  if (last > prev * 1.05) return 'up';
  if (last < prev * 0.95) return 'down';
  return 'stable';
}

/**
 * Get progress info for current season (for display).
 * @param {object} state
 * @returns {{ elapsed: number, total: number, pct: number, isLate: boolean }}
 */
export function getSeasonProgress(state) {
  const total = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
    : GAME_CONFIG.SEASON_DURATION_SEC;
  const elapsed = total - (state.seasonTimer || 0);
  const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
  return {
    elapsed: Math.max(0, elapsed),
    total,
    pct,
    isLate: state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD,
    timer: Math.max(0, state.seasonTimer || 0),
  };
}

/**
 * Get random event type for display.
 * @param {object} state
 * @returns {object|null}
 */
export function getRandomEvent(state) {
  const pool = EVENT_TYPES.filter(e => {
    if (e.target === 'greenhouse' && !state.greenhouse.unlocked) return false;
    if (e.target === 'fishpond' && !state.fishpond.unlocked) return false;
    return true;
  });
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
