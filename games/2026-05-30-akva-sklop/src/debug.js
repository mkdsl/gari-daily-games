/**
 * debug.js — Debug panel i in-game razvojni alati
 *
 * Keyboard shortcuts:
 *   D       → toggle debug panel (JSON state)
 *   Shift+W → skip na sledeću nedelju (samo dev/localhost)
 *   Shift+F → fill sva jezera na max level
 *   Shift+A → dodaj 5 AP
 *
 * Panel prikazuje: week, phase, ap, lakes, source, events, weeklyScores
 * Format po jezeru: DEBUG_LAKE_FORMAT iz config.js
 */

import { getState, setState } from './state.js';
import { toggleDebugPanel }   from './ui.js';
import {
  DEBUG_KEY,
  DEBUG_LAKE_FORMAT,
  LAKE_A_ORIGIN, LAKE_A_SIZE,
  LAKE_B_ORIGIN, LAKE_B_SIZE,
  LAKE_C_ORIGIN, LAKE_C_SIZE,
} from './config.js';

// Dev mode: aktivan samo na localhost ili ?debug query param
const IS_DEV =
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.search.includes('debug=1');

// ─── Inicijalizacija ──────────────────────────────────────────────────────────

export function initDebug() {
  document.addEventListener('keydown', handleKeyDown);

  if (IS_DEV) {
    console.info(
      '[Akva-Sklop DEBUG] Aktivan · D=panel · Shift+W=skip · Shift+F=fill · Shift+A=+5AP'
    );
  }
}

// ─── Keyboard handler ─────────────────────────────────────────────────────────

function handleKeyDown(e) {
  // Ignorišemo kad je fokus u input/textarea
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

  const key = e.key;

  // D → toggle debug panel
  if (key === DEBUG_KEY || key === DEBUG_KEY.toUpperCase()) {
    e.preventDefault();
    const state = getState();
    toggleDebugPanel(buildDebugData(state));
    return;
  }

  // Sledeće akcije samo u dev modu
  if (!IS_DEV) return;

  // Shift+W → skip nedelje
  if (e.shiftKey && key === 'W') {
    e.preventDefault();
    import('./main.js').then(m => {
      if (typeof m.triggerSimulation === 'function') {
        console.info('[DEBUG] Skip nedelje');
        m.triggerSimulation();
      }
    });
    return;
  }

  // Shift+F → fill jezera
  if (e.shiftKey && key === 'F') {
    e.preventDefault();
    const state = getState();
    if (!state.lakes) return;
    const filled = {};
    Object.entries(state.lakes).forEach(([id, lake]) => {
      filled[id] = { ...lake, level: lake.capacity };
    });
    setState({ lakes: filled });
    console.info('[DEBUG] Sva jezera popunjena');
    return;
  }

  // Shift+A → dodaj 5 AP
  if (e.shiftKey && key === 'A') {
    e.preventDefault();
    const state = getState();
    setState({ ap: (state.ap ?? 0) + 5 });
    console.info('[DEBUG] +5 AP dodato');
    return;
  }
}

// ─── Debug data builder ───────────────────────────────────────────────────────

function buildDebugData(state) {
  const lakesSummary = {};
  ['A', 'B', 'C'].forEach(id => {
    const lake = state.lakes?.[id];
    if (!lake) return;

    // Format po DEBUG_LAKE_FORMAT iz config.js
    const formatted = DEBUG_LAKE_FORMAT
      .replace('{id}',     id)
      .replace('{level}',  lake.level?.toFixed(1)       ?? '0')
      .replace('{cap}',    lake.capacity?.toFixed(0)    ?? '0')
      .replace('{ph}',     lake.pH?.toFixed(2)          ?? '?')
      .replace('{fish}',   lake.fishHealth?.toFixed(0)  ?? '?')
      .replace('{duck}',   lake.duckHealth?.toFixed(0)  ?? '?')
      .replace('{inflow}', lake.inflow?.toFixed(3)      ?? '0');

    lakesSummary[id] = {
      summary:   formatted,
      level:     lake.level,
      capacity:  lake.capacity,
      pH:        lake.pH,
      fishHealth:lake.fishHealth,
      duckHealth:lake.duckHealth,
      ducks:     lake.ducks,
      fish:      lake.fish,
      inflow:    lake.inflow,
    };
  });

  return {
    week:          state.week,
    phase:         state.phase,
    ap:            state.ap,
    apTimer:       Math.ceil(state.apTimer ?? 0),
    selectedTile:  state.selectedTile,
    difficulty:    state.difficulty,
    source: {
      rate:              state.source?.rate,
      droughtMultiplier: state.source?.droughtMultiplier ?? 1.0,
      droughtWeeksLeft:  state.source?.droughtWeeksLeft  ?? 0,
    },
    lakes:         lakesSummary,
    weeklyScores:  state.weeklyScores?.map(ws => ({
      week:  ws.week,
      score: ws.score?.toFixed(1),
      event: ws.event ?? null,
    })),
    events:        state.events ?? [],
    lakeOrigins: {
      A: LAKE_A_ORIGIN,
      B: LAKE_B_ORIGIN,
      C: LAKE_C_ORIGIN,
    },
    lakeSizes: {
      A: LAKE_A_SIZE,
      B: LAKE_B_SIZE,
      C: LAKE_C_SIZE,
    },
    isDev: IS_DEV,
    timestamp: new Date().toISOString(),
  };
}

// ─── Console helper (koristi main.js za logovanje) ────────────────────────────

export function debugLog(label, data) {
  if (!IS_DEV) return;
  console.groupCollapsed(`[Akva-Sklop] ${label}`);
  console.log(data);
  console.groupEnd();
}

export function debugWarn(msg) {
  if (!IS_DEV) return;
  console.warn(`[Akva-Sklop WARN] ${msg}`);
}
