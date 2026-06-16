import { CONFIG } from './config.js';

// ─── Initial state factory ────────────────────────────────────────────────────

/**
 * Returns a fresh, fully-typed state object.
 * All callers should use this so shape stays consistent.
 * @returns {GameState}
 */
export function createInitialState() {
  return {
    version: 3,

    // ── Currency ──────────────────────────────────────────────────────────────
    pt:              0,   // current spendable Park Points
    totalPtEarned:   0,   // lifetime earned (used for rank calculation)
    weeklyPtEarned:  0,   // resets each Monday
    weeklyPtSpent:   0,
    weekStart:       null, // ISO date string of Monday that started current week

    // ── Zone progression ──────────────────────────────────────────────────────
    // Only active zones are tracked here; locked zones have no state entry.
    zones: {
      pult: { level: 1, xp: 0, lastCheckin: null, storiesUnlocked: 0 },
      bina: { level: 1, xp: 0, lastCheckin: null, storiesUnlocked: 0 },
      suma: { level: 1, xp: 0, lastCheckin: null, storiesUnlocked: 0 },
    },

    // ── Egg hunt ──────────────────────────────────────────────────────────────
    // Keys are egg instance IDs (e.g. "lampion_03"), values are ISO timestamps.
    eggs: {},

    // ── Daily Light quest ─────────────────────────────────────────────────────
    dailyLight: {
      date:      null,   // ISO date of current assignment (YYYY-MM-DD)
      zone:      null,   // assigned zone id
      completed: false,
    },

    // ── Logbook ───────────────────────────────────────────────────────────────
    // Array of { ts, type, text } entries, newest-first order kept by callers.
    logbook: [],

    // ── NPC missions ──────────────────────────────────────────────────────────
    // Keys are npc ids; values are { missionId, assignedTs, completedTs|null, ptAwarded|null }
    npcMissions: {},
    npcWeekStart: null, // ISO Monday date; missions reset weekly

    // ── Park Projects (community milestones) ──────────────────────────────────
    // Array of { id, unlockedTs, completedTs|null }
    parkProjects: [],

    // ── Session meta ──────────────────────────────────────────────────────────
    lastSplashDate: null,  // ISO date of last "welcome back" splash shown

    // ── Season ────────────────────────────────────────────────────────────────
    season:      1,
    seasonStart: null,     // ISO date when season 1 began for this player

    // ── Visit tracking ────────────────────────────────────────────────────────
    totalDaysVisited: 0,
    lastVisitDate:    null, // ISO date
  };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

/**
 * Load state from localStorage. Returns null if nothing saved or version mismatch.
 * Caller is responsible for merging with createInitialState() for forward-compat.
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Version mismatch → treat as no save (migration not implemented yet)
    if (parsed.version !== 3) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist state to localStorage. Silent fail on quota / private mode.
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private browsing — silently swallow
  }
}

/**
 * Wipe saved state from localStorage.
 */
export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}

/**
 * Merge a persisted state with the current initial shape so newly-added fields
 * are always present even for returning players with older saves.
 * @param {Partial<GameState>} saved
 * @returns {GameState}
 */
export function hydrateState(saved) {
  const fresh = createInitialState();
  if (!saved) return fresh;

  return {
    ...fresh,
    ...saved,
    // Deep-merge zones so new zone keys survive
    zones: {
      ...fresh.zones,
      ...(saved.zones ?? {}),
    },
    // Keep logbook from save, fall back to empty
    logbook: Array.isArray(saved.logbook) ? saved.logbook : [],
    npcMissions:  (saved.npcMissions  && typeof saved.npcMissions  === 'object') ? saved.npcMissions  : {},
    eggs:         (saved.eggs         && typeof saved.eggs         === 'object') ? saved.eggs         : {},
    parkProjects: Array.isArray(saved.parkProjects) ? saved.parkProjects : [],
  };
}

// ─── Event bus ───────────────────────────────────────────────────────────────

/**
 * Lightweight pub/sub for decoupled module communication.
 * Usage:
 *   const bus = createEventBus();
 *   const unsub = bus.on('pt:earned', ({ amount }) => console.log(amount));
 *   bus.emit('pt:earned', { amount: 15 });
 *   unsub(); // or bus.off('pt:earned', handler)
 *
 * @returns {{ on: Function, off: Function, emit: Function }}
 */
export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} cb
   * @returns {Function} unsubscribe function
   */
  function on(event, cb) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(cb);
    // Return a convenience unsubscribe
    return () => off(event, cb);
  }

  /**
   * Unsubscribe a previously registered callback.
   * @param {string} event
   * @param {Function} cb
   */
  function off(event, cb) {
    const set = listeners.get(event);
    if (set) {
      set.delete(cb);
      if (set.size === 0) listeners.delete(event);
    }
  }

  /**
   * Emit an event, calling all registered callbacks with data.
   * Errors in individual callbacks are caught and logged so one bad subscriber
   * cannot break the rest.
   * @param {string} event
   * @param {*} [data]
   */
  function emit(event, data) {
    const set = listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        cb(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[EventBus] Error in handler for "${event}":`, err);
      }
    }
  }

  return { on, off, emit };
}

/**
 * @typedef {Object} GameState
 * @property {number} version
 * @property {number} pt
 * @property {number} totalPtEarned
 * @property {number} weeklyPtEarned
 * @property {number} weeklyPtSpent
 * @property {string|null} weekStart
 * @property {{ pult: ZoneState, bina: ZoneState, suma: ZoneState }} zones
 * @property {Object.<string, string>} eggs
 * @property {{ date: string|null, zone: string|null, completed: boolean }} dailyLight
 * @property {Array<{ts: number, type: string, text: string}>} logbook
 * @property {Object.<string, NpcMission>} npcMissions
 * @property {string|null} npcWeekStart
 * @property {Array<{id: string, unlockedTs: number, completedTs: number|null}>} parkProjects
 * @property {string|null} lastSplashDate
 * @property {number} season
 * @property {string|null} seasonStart
 * @property {number} totalDaysVisited
 * @property {string|null} lastVisitDate
 */

/**
 * @typedef {Object} ZoneState
 * @property {number} level           1-indexed; max 5 (4 upgrades)
 * @property {number} xp              XP within current level
 * @property {number|null} lastCheckin  Timestamp of last successful check-in
 * @property {number} storiesUnlocked  Count of mini-stories unlocked in this zone
 */

/**
 * @typedef {Object} NpcMission
 * @property {string} missionId
 * @property {number} assignedTs
 * @property {number|null} completedTs
 * @property {number|null} ptAwarded
 */
