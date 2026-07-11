import { GAME_CONFIG } from '../config.js';
import { updateMarketForecast } from '../economy/market.js';

const EVENT_TYPES = [
  { type: 'suša', label: '☀️ Suša!', desc: 'Visoke temperature — Plastenik yield −30% ovu sezonu.', target: 'greenhouse' },
  { type: 'bolest', label: '🦠 Bolest pečuraka!', desc: 'Zaraza micelija — spawn ratio −25% ovu sezonu.', target: 'mushrooms' },
  { type: 'zaraza_ribe', label: '🐛 Zaraza ribe!', desc: 'Paraziti u ribnjaku — rast ribe −20% ovu sezonu.', target: 'fishpond' },
  { type: 'rekordna', label: '🌟 Rekordna sezona!', desc: 'Odlični uslovi — svi prihodi +15% ovu sezonu.', target: 'all' },
  { type: 'inspekcija', label: '🏛️ Inspekcija!', desc: `Sanitarna inspekcija — kazna ${GAME_CONFIG.INSPECTION_FINE.toLocaleString()} din.`, target: 'event' },
];

/**
 * Tick season timer by dt seconds.
 * Returns true if season ended this tick.
 */
export function tickSeason(state, dt) {
  state.seasonTimer -= dt;
  if (state.seasonTimer <= 0) {
    return true;
  }
  return false;
}

/**
 * Handle end-of-season: advance season, reset timers, apply events, update forecast.
 */
export function handleSeasonEnd(state, audio, onSeasonEnd) {
  const endedSeason = state.season;

  // Record season revenue for phase C check
  state.monthlyRevenue = state.monthlyRevenue || [];
  state.monthlyRevenue.push(state.seasonRevenue || 0);
  if (state.monthlyRevenue.length > 6) state.monthlyRevenue.shift();

  // Reset season revenue
  const seasonRevSummary = state.seasonRevenue || 0;
  state.seasonRevenue = 0;

  // Reset daily actions
  state.workers.dailyActionsUsed = 0;

  // Clear previous season event
  if (state.activeEvent && state.activeEvent.seasonsLeft !== undefined) {
    state.activeEvent.seasonsLeft--;
    if (state.activeEvent.seasonsLeft <= 0) {
      clearEvent(state);
    }
  }

  // Advance season
  state.season++;

  // Update season duration (shorter from S5+)
  const dur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
    : GAME_CONFIG.SEASON_DURATION_SEC;
  state.seasonTimer = dur;

  // Masterclass unlock at season 4
  if (state.season >= GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) {
    state.masterclassUnlocked = true;
  }

  // Pijaca seasons tracking (for achievement)
  if (state.unlockedChannels.includes('pijaca') && (state.channels.pijaca || 0) > 0) {
    state.greenhouse.pijacaSeasons = (state.greenhouse.pijacaSeasons || 0) + 1;
  }

  // Random event roll (from season 3, 8% chance)
  if (state.season >= 3 && !state.activeEvent) {
    if (Math.random() < GAME_CONFIG.EVENT_CHANCE_PER_SEASON) {
      triggerRandomEvent(state, audio);
    }
  }

  // Update market forecast
  updateMarketForecast(state);

  if (audio) audio.playSfx('season_end');
  if (onSeasonEnd) {
    onSeasonEnd({
      season: endedSeason,
      revenue: seasonRevSummary,
      event: state.activeEvent,
    });
  }
}

function triggerRandomEvent(state, audio) {
  // Filter events: only fire relevant ones based on what's unlocked
  let pool = EVENT_TYPES.filter(e => {
    if (e.target === 'greenhouse' && !state.greenhouse.unlocked) return false;
    if (e.target === 'fishpond' && !state.fishpond.unlocked) return false;
    return true;
  });

  if (pool.length === 0) return;

  const ev = pool[Math.floor(Math.random() * pool.length)];
  applyEvent(state, ev);
  if (audio) audio.playSfx('event_alert');
}

function applyEvent(state, ev) {
  switch (ev.type) {
    case 'suša':
      state.greenhouse.suša = true;
      state.activeEvent = { type: ev.type, label: ev.label, desc: ev.desc, seasonsLeft: 1 };
      break;
    case 'bolest':
      state.mushrooms.spawnRatioBonus -= GAME_CONFIG.DISEASE_YIELD_PENALTY;
      state.activeEvent = { type: ev.type, label: ev.label, desc: ev.desc, seasonsLeft: 1,
        onClear: 'restore_spawn' };
      break;
    case 'zaraza_ribe':
      state._fishGrowthPenalty = GAME_CONFIG.MOLD_YIELD_PENALTY;
      state.activeEvent = { type: ev.type, label: ev.label, desc: ev.desc, seasonsLeft: 1 };
      break;
    case 'rekordna':
      state._recordSeasonBonus = GAME_CONFIG.RECORD_SEASON_BONUS;
      state.activeEvent = { type: ev.type, label: ev.label, desc: ev.desc, seasonsLeft: 1 };
      break;
    case 'inspekcija':
      state.capital = Math.max(0, state.capital - GAME_CONFIG.INSPECTION_FINE);
      state.activeEvent = { type: ev.type, label: ev.label, desc: ev.desc, seasonsLeft: 0 };
      // Clear immediately
      setTimeout(() => clearEvent(state), 100);
      break;
    default:
      break;
  }
}

function clearEvent(state) {
  if (!state.activeEvent) return;
  const ev = state.activeEvent;

  switch (ev.type) {
    case 'suša':
      state.greenhouse.suša = false;
      break;
    case 'bolest':
      state.mushrooms.spawnRatioBonus += GAME_CONFIG.DISEASE_YIELD_PENALTY;
      break;
    case 'zaraza_ribe':
      delete state._fishGrowthPenalty;
      break;
    case 'rekordna':
      delete state._recordSeasonBonus;
      break;
    default:
      break;
  }
  state.activeEvent = null;
}

/** Get formatted season timer string mm:ss */
export function formatSeasonTimer(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
