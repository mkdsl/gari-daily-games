/** Signal-drop logika, reroute/guraj-kroz odluka */
import { GAME_CONFIG, clamp } from '../config.js';
import { getDashboardState, updateDashboardState } from './dashboard-state.js';
import { emit, EVENTS } from '../events.js';
import { calcEffectiveSignalLevel, calcRerouteCost } from '../macro/equipment-shop.js';

/**
 * Triggeruje signal drop
 * @param {number} dropAmount - koliko pada signal (0-100)
 */
export function triggerSignalDrop(dropAmount) {
  const ds = getDashboardState();
  if (!ds) return;

  const newSignal = clamp(ds.signal - dropAmount, 0, 100);
  updateDashboardState({
    signal: newSignal,
    signalDropping: true,
  });

  emit(EVENTS.SIGNAL_DROP, { signal: newSignal, dropAmount });
}

/**
 * Popravlja signal (reroute ili push-through)
 * @param {'reroute'|'push'} action
 * @returns {{ success: boolean, signalGain: number, offgridCost: number }}
 */
export function resolveSignalAction(action) {
  const ds = getDashboardState();
  if (!ds) return { success: false };

  let signalGain = 0;
  let offgridCost = 0;

  if (action === 'reroute') {
    // Reroute — troši kapacitet, odmah oporavlja signal
    offgridCost = calcRerouteCost(ds.equipment);
    const newOffgrid = Math.max(0, ds.offgrid - offgridCost);
    signalGain = GAME_CONFIG.SIGNAL_REROUTE_RECOVER;
    const newSignal = clamp(ds.signal + signalGain, 0, 100);
    updateDashboardState({
      signal: newSignal,
      signalDropping: newSignal < 60,
      offgrid: newOffgrid,
    });
  } else {
    // Push through — postepen oporavak, nema offgrid cost
    signalGain = 20;
    const newSignal = clamp(ds.signal + signalGain, 0, 100);
    updateDashboardState({
      signal: newSignal,
      signalDropping: newSignal < 60,
    });
  }

  if (ds.signal >= 60) {
    updateDashboardState({ signalDropping: false });
    emit(EVENTS.SIGNAL_RECOVERED, { signal: ds.signal + signalGain });
  }

  return { success: true, signalGain, offgridCost };
}

/**
 * Recover signal pasivno (po tiku)
 * @param {number} recoverRate - po sekundi
 */
export function passiveSignalRecover(recoverRate) {
  const ds = getDashboardState();
  if (!ds || ds.signalDropping) return;

  const newSignal = clamp(ds.signal + recoverRate, 0, 100);
  if (newSignal !== ds.signal) {
    updateDashboardState({ signal: newSignal });
  }
}

/**
 * Signal quality label
 * @param {number} signal 0-100
 * @returns {{ label: string, cssClass: string }}
 */
export function getSignalQuality(signal) {
  if (signal >= 80) return { label: 'STABILAN', cssClass: 'ok' };
  if (signal >= 50) return { label: 'DEGRADIRAN', cssClass: 'warn' };
  if (signal >= 20) return { label: 'KRITIČAN', cssClass: 'critical' };
  return { label: 'IZGUBLJEN', cssClass: 'critical' };
}

/**
 * Je li signal u dobrom stanju?
 * @param {number} signal
 * @returns {boolean}
 */
export function isSignalOk(signal) {
  return signal >= 60;
}

/**
 * Formatira signal kao procenat
 * @param {number} signal 0-100
 * @returns {string}
 */
export function formatSignal(signal) {
  return `${Math.round(signal)}%`;
}
