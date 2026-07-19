/** Feedback/glitch 2-4s mini-fix ekran */
import { GAME_CONFIG } from '../config.js';
import { getState } from '../state.js';
import { emit, EVENTS } from '../events.js';

/** @type {Object|null} Aktivna EQ sesija */
let _session = null;

/** @type {Function|null} Callback */
let _onComplete = null;

/**
 * Pokretanje EQ minigame-a
 * @param {Function} onComplete - (success, closenessPct) => void
 * @returns {Object} session state
 */
export function startEqMinigame(onComplete) {
  const state = getState();

  // Window duration zavisi od opreme
  let windowDuration = GAME_CONFIG.EQ_WINDOW_DURATION;
  if (state.equipment.a3) windowDuration += GAME_CONFIG.EQ_WINDOW_BONUS_A3;
  else if (state.equipment.a1) windowDuration += GAME_CONFIG.EQ_WINDOW_BONUS_A1;

  // Target — nasumičan EQ vrednost 1-100
  const target = 20 + Math.floor(Math.random() * 60); // 20-80 da nije previše rubno

  _session = {
    target,
    currentValue: 50,  // Default pozicija slidera
    windowDuration,
    timeRemaining: windowDuration,
    completed: false,
    startedAt: Date.now(),
  };
  _onComplete = onComplete;

  emit(EVENTS.EQ_MINIGAME_START, { session: { ..._session } });
  return { ..._session };
}

/**
 * Ažurira vrednost slidera
 * @param {number} value 0-100
 */
export function updateEqValue(value) {
  if (!_session || _session.completed) return;
  _session.currentValue = Math.round(value);
}

/**
 * Potvrđuje EQ vrednost (klik Confirm)
 * @returns {{ success: boolean, closeness: number, score: number }}
 */
export function confirmEq() {
  if (!_session || _session.completed) return { success: false, closeness: 0, score: 0 };
  _session.completed = true;

  const diff = Math.abs(_session.currentValue - _session.target);
  const closeness = Math.max(0, 1 - diff / 30); // 30 je max razlika za 0 score
  const success = diff <= 15; // Unutar 15 poena = uspeh

  const result = { success, closeness, score: Math.round(closeness * 100) };
  emit(EVENTS.EQ_MINIGAME_END, result);

  if (_onComplete) {
    _onComplete(success, closeness);
    _onComplete = null;
  }
  return result;
}

/**
 * Tick: smanjuje vreme prozora
 * @param {number} dt sekunde
 * @returns {boolean} true ako je vreme isteklo
 */
export function tickEqWindow(dt) {
  if (!_session || _session.completed) return false;
  _session.timeRemaining = Math.max(0, _session.timeRemaining - dt);
  if (_session.timeRemaining <= 0 && !_session.completed) {
    // Auto-fail
    _session.completed = true;
    const result = { success: false, closeness: 0, score: 0 };
    emit(EVENTS.EQ_MINIGAME_END, { ...result, timeout: true });
    if (_onComplete) {
      _onComplete(false, 0);
      _onComplete = null;
    }
    return true;
  }
  return false;
}

/**
 * Vraća aktivnu sesiju (za UI render)
 * @returns {Object|null}
 */
export function getEqSession() {
  return _session ? { ..._session } : null;
}

/**
 * Je li EQ aktivan?
 * @returns {boolean}
 */
export function isEqActive() {
  return !!_session && !_session.completed;
}

/**
 * Reset sesije
 */
export function resetEqSession() {
  _session = null;
  _onComplete = null;
}

/**
 * Progress bar procenat (0-1)
 * @returns {number}
 */
export function getEqWindowProgress() {
  if (!_session) return 0;
  return _session.timeRemaining / _session.windowDuration;
}
