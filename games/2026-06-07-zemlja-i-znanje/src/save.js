/**
 * save.js — localStorage wrapper sa SAVE_KEYS
 * Atomarna sesija + macro state persist
 */

import { SAVE_KEYS } from './config.js';
import { bus, EVT } from './events.js';

// === MACRO STATE ===
export function saveMacro(macroState) {
  try {
    localStorage.setItem(SAVE_KEYS.MACRO, JSON.stringify({ ...macroState, version: 1 }));
    return true;
  } catch (e) {
    console.warn('[save] macro save failed:', e.message);
    return false;
  }
}

export function loadMacro() {
  try {
    const raw = localStorage.getItem(SAVE_KEYS.MACRO);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    // Restore Set from array
    if (data.unlockedFeatures && Array.isArray(data.unlockedFeatures)) {
      // na metaState, ne macro
    }
    return data;
  } catch (e) {
    console.warn('[save] macro load failed:', e.message);
    return null;
  }
}

export function clearMacro() {
  localStorage.removeItem(SAVE_KEYS.MACRO);
}

// === MICRO TEMP STATE (atomarna sesija) ===
export function saveMicro(microState) {
  try {
    localStorage.setItem(SAVE_KEYS.MICRO, JSON.stringify({ ...microState, version: 1 }));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadMicro() {
  try {
    const raw = localStorage.getItem(SAVE_KEYS.MICRO);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearMicro() {
  localStorage.removeItem(SAVE_KEYS.MICRO);
}

// === SESSION RESULTS ===
export function saveResult(result) {
  try {
    const existing = loadResults();
    existing.push(result);
    // Cuva samo poslednjih 50
    const trimmed = existing.slice(-50);
    localStorage.setItem(SAVE_KEYS.RESULTS, JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
}

export function loadResults() {
  try {
    const raw = localStorage.getItem(SAVE_KEYS.RESULTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// === META STATE ===
export function saveMeta(metaState) {
  try {
    // Set nije JSON-serializable, convert to array
    const serializable = {
      ...metaState,
      unlockedFeatures: Array.from(metaState.unlockedFeatures || [])
    };
    localStorage.setItem(SAVE_KEYS.META, JSON.stringify(serializable));
    return true;
  } catch (e) {
    console.warn('[save] meta save failed:', e.message);
    return false;
  }
}

export function loadMeta() {
  try {
    const raw = localStorage.getItem(SAVE_KEYS.META);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    // Restore Set
    data.unlockedFeatures = new Set(data.unlockedFeatures || []);
    return data;
  } catch (e) {
    console.warn('[save] meta load failed:', e.message);
    return null;
  }
}

export function clearMeta() {
  localStorage.removeItem(SAVE_KEYS.META);
}

// === FULL RESET ===
export function clearAll() {
  Object.values(SAVE_KEYS).forEach(k => localStorage.removeItem(k));
  bus.emit(EVT.GAME_RESET);
}

// === AUTO-SAVE SETUP ===
let _macroInterval = null;
let _microInterval = null;

export function startAutoSave(getMacro, getMicro, macroIntervalMs = 30000, microIntervalMs = 10000) {
  stopAutoSave();

  _macroInterval = setInterval(() => {
    const state = getMacro();
    if (state) {
      saveMacro(state);
      bus.emit(EVT.GAME_SAVE, { type: 'macro' });
    }
  }, macroIntervalMs);

  _microInterval = setInterval(() => {
    const state = getMicro();
    if (state) {
      saveMicro(state);
    }
  }, microIntervalMs);
}

export function stopAutoSave() {
  if (_macroInterval) clearInterval(_macroInterval);
  if (_microInterval) clearInterval(_microInterval);
  _macroInterval = null;
  _microInterval = null;
}

// === AUTO-RESOLVE ON BROWSER CLOSE ===
/**
 * Ako browser zatvorim usred sesije, auto-resolve sa reducenim satisfaction
 * @param {function} getMicro - getter za micro state
 * @param {function} onResolve - callback sa rezultatom
 */
export function registerAutoResolve(getMicro, onResolve) {
  window.addEventListener('beforeunload', () => {
    const micro = getMicro();
    if (micro && !micro.sessionEnded && micro.gameMinute > 0) {
      const progressRatio = micro.gameMinute / 480;
      const partialSatisfaction = micro.satisfactionSamples > 0
        ? (micro.totalSatisfaction / micro.satisfactionSamples) * progressRatio * 0.75
        : 0;

      const result = {
        completedAt: Date.now(),
        tema: micro.tema,
        participants: micro.participants.length,
        avgSatisfaction: partialSatisfaction,
        totalLearned: Math.round(micro.totalLearned * progressRatio * 0.75),
        incidentCount: micro.incidentCount,
        weatherDuringSession: micro.weather,
        endReason: 'auto_resolve'
      };

      saveResult(result);
      clearMicro();
      if (onResolve) onResolve(result);
    }
  });
}
