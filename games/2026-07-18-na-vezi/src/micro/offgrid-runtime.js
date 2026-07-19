/** Battery drain/charge tokom emisije */
import { GAME_CONFIG, clamp } from '../config.js';
import { getDashboardState, updateDashboardState, tickOffgrid } from './dashboard-state.js';
import { emit, EVENTS } from '../events.js';
import { estimateDrain } from '../macro/platform-allocation.js';
import { updateBatteryPulse } from '../audio.js';

/** Da li je LOW notifikacija već poslata */
let _lowNotified = false;
/** Da li je CRITICAL notifikacija već poslata */
let _criticalNotified = false;

/**
 * Reset za novu emisiju
 */
export function resetOffgridRuntime() {
  _lowNotified = false;
  _criticalNotified = false;
}

/**
 * Izračunava drain rate za ovaj tik
 * @returns {number} kapacitet po sekundi
 */
export function calcCurrentDrain() {
  const ds = getDashboardState();
  if (!ds) return 0;
  return estimateDrain(ds.plan.platform_alloc, ds.plan.format, ds.equipment);
}

/**
 * Tick: drainuje i procesira battery evente
 * @param {number} dt sekunde
 * @param {number} drainPerSec
 * @returns {{ capacity: number, wasLow: boolean, wasCritical: boolean }}
 */
export function tickBattery(dt, drainPerSec) {
  const ds = getDashboardState();
  if (!ds) return { capacity: 0, wasLow: false, wasCritical: false };

  tickOffgrid(drainPerSec * dt);

  const capacity = ds.offgrid;
  let wasLow = false, wasCritical = false;

  // LOW event (< 35%)
  if (capacity < 35 && !_lowNotified) {
    _lowNotified = true;
    wasLow = true;
    emit(EVENTS.BATTERY_LOW, { capacity });
  }

  // CRITICAL event (< 25%)
  if (capacity < 25 && !_criticalNotified) {
    _criticalNotified = true;
    wasCritical = true;
    emit(EVENTS.BATTERY_CRITICAL, { capacity });
  }

  // Audio pulse — intenzitet raste kako kapacitet pada
  const pulseIntensity = capacity < 25
    ? clamp(1 - capacity / 25, 0, 1)
    : 0;
  updateBatteryPulse(pulseIntensity);

  return { capacity, wasLow, wasCritical };
}

/**
 * Reducira potrošnju platforme (akcija "Redukcija platformi")
 * @param {string} platform - platforma koja se reducira
 * @returns {number} novi drain rate
 */
export function reducePlatformDrain(platform) {
  const ds = getDashboardState();
  if (!ds) return 0;

  const alloc = { ...ds.plan.platform_alloc };
  // Smanji alokaciju za 50%, ostalo ide na ig
  const reduced = Math.floor(alloc[platform] * 0.5);
  const freed = alloc[platform] - reduced;
  alloc[platform] = reduced;
  alloc.ig = Math.min(100, (alloc.ig || 0) + freed);

  // Normalizuj na 100
  const total = alloc.ig + alloc.tiktok + alloc.youtube;
  if (total !== 100) {
    alloc.ig += 100 - total;
  }

  // Ažuriraj plan in-place
  ds.plan.platform_alloc = alloc;

  return estimateDrain(alloc, ds.plan.format, ds.equipment);
}

/**
 * Formatira kapacitet kao procenat + CSS klasu
 * @param {number} capacity 0-100
 * @returns {{ pct: number, label: string, cssClass: string }}
 */
export function formatCapacityInfo(capacity) {
  const pct = Math.round(capacity);
  let label, cssClass;
  if (capacity >= 50) {
    label = `${pct}% — OK`;
    cssClass = 'normal';
  } else if (capacity >= 25) {
    label = `${pct}% — PAZI`;
    cssClass = 'warn';
  } else {
    label = `${pct}% — KRITIČNO`;
    cssClass = 'critical';
  }
  return { pct, label, cssClass };
}

/**
 * Procenjuje preostalo vreme do prazne baterije
 * @param {number} capacity
 * @param {number} drainPerSec
 * @returns {number} sekunde
 */
export function estimateRemainingTime(capacity, drainPerSec) {
  if (drainPerSec <= 0) return Infinity;
  return Math.floor(capacity / drainPerSec);
}
