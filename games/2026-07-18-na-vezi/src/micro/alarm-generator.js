/** Bira koji alarm (weighted po opremi/kapacitetu) — ODVOJEN od escalation */
import { GAME_CONFIG, clamp } from '../config.js';
import { getDashboardState, updateDashboardState } from './dashboard-state.js';
import { calcEffectiveSignalLevel } from '../macro/equipment-shop.js';
import { emit, EVENTS } from '../events.js';

let _alarmIdCounter = 0;

/**
 * Generiše jedinstveni alarm ID
 */
function nextAlarmId() {
  return `alarm_${++_alarmIdCounter}_${Date.now()}`;
}

/**
 * Izračunava šansu za alarm tip uzimajući u obzir opremu
 * @param {string} type
 * @param {Object} equipment
 * @param {Object} equipLevels
 * @param {number} weeklyCapacity
 * @returns {number} 0-1
 */
export function calcAlarmChance(type, equipment, equipLevels, weeklyCapacity) {
  let equipLevel = 0;

  switch (type) {
    case 'signal_drop':
      equipLevel = calcEffectiveSignalLevel(equipment, equipLevels);
      break;
    case 'feedback_glitch':
      equipLevel = equipLevels.audio || 0;
      break;
    case 'battery_critical':
      equipLevel = equipLevels.offgrid || 0;
      if (equipment.b4) equipLevel += 2;
      break;
    case 'platform_hiccup':
      equipLevel = equipLevels.link || 0;
      break;
    case 'hardware_fault':
      equipLevel = Math.min(
        (equipLevels.signal || 0) + (equipLevels.audio || 0),
        4
      );
      break;
    default:
      equipLevel = 0;
  }

  let chance = GAME_CONFIG.BASE_ALARM_CHANCE[type] * Math.pow(GAME_CONFIG.ALARM_DECAY, equipLevel);

  // Battery extra risk kada kapacitet nizak
  if (type === 'battery_critical' && weeklyCapacity < 60) {
    chance *= 1 + (60 - weeklyCapacity) / 100;
  }

  return Math.max(chance, GAME_CONFIG.MIN_ALARM_CHANCE[type] || 0.02);
}

/**
 * Proverava da li treba generisati alarm ovog tika
 * @param {Object} escalationBonuses - { alarmType: bonusChance }
 * @returns {Object|null} alarm ili null
 */
export function tryGenerateAlarm(escalationBonuses = {}) {
  const ds = getDashboardState();
  if (!ds) return null;

  // Ne možemo imati više od 3 istovremena alarma
  if (ds.activeAlarms.length >= 3) return null;

  const { equipment, plan } = ds;
  const equipLevels = _extractEquipLevels(equipment);
  const capacity = ds.offgrid;

  // Tutorial mode — samo feedback_glitch
  if (ds.plan && ds.plan.format === 'dj_lajv' && ds.elapsed < 60) {
    // Prvih 60s tutoriala — ograničeni alarmi
  }

  // Izračunaj šansu za svaki tip
  const types = ['signal_drop', 'feedback_glitch', 'battery_critical', 'platform_hiccup', 'hardware_fault'];
  const chances = {};
  for (const type of types) {
    chances[type] = calcAlarmChance(type, equipment, equipLevels, capacity);
    // Dodaj eskalacijski bonus ako postoji
    if (escalationBonuses[type]) {
      chances[type] = Math.min(chances[type] + escalationBonuses[type], 0.95);
    }
  }

  // Weighted random izbor
  const roll = Math.random();
  let cumulative = 0;
  for (const type of types) {
    cumulative += chances[type];
    if (roll < cumulative) {
      return _createAlarm(type, ds.elapsed);
    }
  }

  return null;
}

/**
 * Kreira alarm objekat
 * @param {string} type
 * @param {number} spawnedAt - sekundu
 * @returns {Object}
 */
function _createAlarm(type, spawnedAt) {
  const config = ALARM_CONFIGS[type];
  return {
    id: nextAlarmId(),
    type,
    title: config.title,
    desc: config.desc,
    severity: config.severity,
    actions: config.actions,
    spawnedAt,
    resolvedAt: null,
    missed: false,
    timeLimit: config.timeLimit,
    timeRemaining: config.timeLimit,
  };
}

/**
 * Dodaje alarm u aktivne
 * @param {Object} alarm
 */
export function addActiveAlarm(alarm) {
  const ds = getDashboardState();
  if (!ds) return;
  ds.activeAlarms.push(alarm);
  if (alarm.severity === 'critical') {
    updateDashboardState({ hasCriticalAlarm: true });
  }
  emit(EVENTS.ALARM_SPAWN, { alarm });
}

/**
 * Razrešava alarm
 * @param {string} alarmId
 * @param {string} action
 * @returns {Object|null}
 */
export function resolveAlarm(alarmId, action) {
  const ds = getDashboardState();
  if (!ds) return null;
  const idx = ds.activeAlarms.findIndex(a => a.id === alarmId);
  if (idx === -1) return null;

  const alarm = ds.activeAlarms[idx];
  alarm.resolvedAt = ds.elapsed;
  alarm.resolvedAction = action;
  ds.activeAlarms.splice(idx, 1);
  ds.alarmHistory.push(alarm);
  ds.alarmsResolved++;

  // Chain tracking za AC10
  if (ds.alarmChainCount > 0) {
    ds.alarmChainCount++;
  }

  emit(EVENTS.ALARM_RESOLVED, { alarm, action });
  return alarm;
}

/**
 * Markira alarm kao promašen (timeout)
 * @param {string} alarmId
 * @returns {Object|null}
 */
export function missAlarm(alarmId) {
  const ds = getDashboardState();
  if (!ds) return null;
  const idx = ds.activeAlarms.findIndex(a => a.id === alarmId);
  if (idx === -1) return null;

  const alarm = ds.activeAlarms[idx];
  alarm.missed = true;
  alarm.resolvedAt = ds.elapsed;
  ds.activeAlarms.splice(idx, 1);
  ds.alarmHistory.push(alarm);
  ds.alarmsMissed++;
  ds.alarmChainCount++;

  emit(EVENTS.ALARM_MISSED, { alarm });
  return alarm;
}

/**
 * Tick: ažurira time remaining za sve aktivne alarme
 * @param {number} dt
 * @returns {string[]} IDs alarma kojima je vreme isteklo
 */
export function tickAlarms(dt) {
  const ds = getDashboardState();
  if (!ds) return [];
  const expired = [];
  for (const alarm of ds.activeAlarms) {
    alarm.timeRemaining = Math.max(0, alarm.timeRemaining - dt);
    if (alarm.timeRemaining <= 0) {
      expired.push(alarm.id);
    }
  }
  return expired;
}

// ======= KONFIGURACIJA ALARMA =======
export const ALARM_CONFIGS = {
  signal_drop: {
    title: 'SIGNAL PAD',
    desc: 'Signal nestabilan — izaberite akciju',
    severity: 'warning',
    timeLimit: 15,
    actions: [
      { id: 'reroute', label: 'Reroute (-kapacitet)', key: 'R' },
      { id: 'push',    label: 'Guraj kroz',           key: 'P' },
    ],
  },
  feedback_glitch: {
    title: 'AUDIO FEEDBACK',
    desc: 'Glitch u audio signalu — EQ korekcija',
    severity: 'warning',
    timeLimit: 4,
    actions: [
      { id: 'eq',    label: 'EQ Minigame', key: 'E' },
      { id: 'mute',  label: 'Privremeni mute', key: 'M' },
    ],
  },
  battery_critical: {
    title: 'BATERIJA KRITIČNA',
    desc: 'Off-grid kapacitet ispod 25% — redukcija?',
    severity: 'critical',
    timeLimit: 20,
    actions: [
      { id: 'reduce', label: 'Redukcija platformi', key: 'Q' },
      { id: 'continue', label: 'Nastavi',            key: 'C' },
    ],
  },
  platform_hiccup: {
    title: 'PLATFORMA GREŠAKA',
    desc: 'Pad na platformi — restart stream?',
    severity: 'warning',
    timeLimit: 12,
    actions: [
      { id: 'restart', label: 'Restart stream', key: 'R' },
      { id: 'skip',    label: 'Preskoči',       key: 'S' },
    ],
  },
  hardware_fault: {
    title: 'HARDWARE GREŠKA',
    desc: 'Oprema daje grešku — diagnoza?',
    severity: 'critical',
    timeLimit: 25,
    actions: [
      { id: 'diagnose', label: 'Brza diagnoza', key: 'D' },
      { id: 'bypass',   label: 'Bypass',        key: 'B' },
    ],
  },
};

/**
 * Extraktuuje equipLevels iz equipment state
 * @param {Object} equipment
 * @returns {Object}
 */
function _extractEquipLevels(equipment) {
  let signal = 0, audio = 0, lighting = 0, link = 0, offgrid = 0;
  if (equipment.e4) signal = 4;
  else if (equipment.e3) signal = 3;
  else if (equipment.e2) signal = 2;
  else if (equipment.e1) signal = 1;

  if (equipment.a4) audio = 4;
  else if (equipment.a3) audio = 3;
  else if (equipment.a2) audio = 2;
  else if (equipment.a1) audio = 1;

  if (equipment.b4) offgrid = 2;
  return { signal, audio, lighting, link, offgrid };
}
