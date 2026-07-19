/** Real-time tick state tokom emisije */
import { GAME_CONFIG, clamp } from '../config.js';

/** @type {Object} Tick state — resetuje se na početku svake emisije */
let _tickState = null;

/**
 * Inicijalizuje ticker state
 * @param {Object} plan - weekly_plan
 * @param {Object} equipment - state.equipment
 * @param {Object} gostInfo - { arrived, gostId }
 * @param {number} weeklyCapacity
 * @returns {Object}
 */
export function initDashboardState(plan, equipment, gostInfo, weeklyCapacity) {
  const emisijaCapacity = weeklyCapacity;
  _tickState = {
    // Timing
    elapsed: 0,           // sekunde
    duration: GAME_CONFIG.EMISIJA_DURATION,
    running: false,

    // Signal (0-100)
    signal: 100,
    signalDropping: false,
    uptimeSeconds: 0,     // koliko sekundi signal > 50

    // Off-grid (0-100)
    offgrid: emisijaCapacity,
    offgridMax: emisijaCapacity,
    offgridCritical: false,

    // Engagement po platformi (0-1)
    engagement: { ig: 0.5, tiktok: 0.3, youtube: 0.2 },

    // Chat momentum po platformi (0-1)
    chatMomentum: { ig: 0.4, tiktok: 0.2, youtube: 0.1 },

    // Alarmi
    activeAlarms: [],     // { id, type, spawnedAt, resolvedAt, missed }
    alarmHistory: [],
    alarmsResolved: 0,
    alarmsMissed: 0,
    alarmChainCount: 0,   // za AC10

    // Gost
    gostArrived: gostInfo.arrived,
    gostId: gostInfo.gostId,
    gostStandout: false,  // triggeruje se random tokom emisije

    // TikTok spike
    tiktokSpike: false,
    tiktokSpikeEarly: false,  // uhvaćen u prvih 2 min (AC6)

    // Highlights
    highlightCandidates: [],
    highlights: [],

    // Flags
    hasCriticalAlarm: false,
    batteryLowNotified: false,
    noShowFlag: !gostInfo.arrived,

    // Plan reference
    plan,
    equipment,
  };
  return _tickState;
}

/**
 * Vraća trenutni tick state
 * @returns {Object}
 */
export function getDashboardState() {
  return _tickState;
}

/**
 * Ažurira tick state (parcijalno)
 * @param {Partial<Object>} patch
 */
export function updateDashboardState(patch) {
  if (!_tickState) return;
  Object.assign(_tickState, patch);
}

/**
 * Bezbedno čita property iz tick state
 * @param {string} key
 * @returns {*}
 */
export function getDashboardValue(key) {
  return _tickState?.[key];
}

/**
 * Tick: napreduje vreme za dt sekundi
 * @param {number} dt - delta time u sekundama
 */
export function tickTime(dt) {
  if (!_tickState || !_tickState.running) return;
  _tickState.elapsed = Math.min(_tickState.elapsed + dt, _tickState.duration);
}

/**
 * Tick: drainuje offgrid kapacitet
 * @param {number} drainPerSec
 */
export function tickOffgrid(drainPerSec) {
  if (!_tickState) return;
  const newOffgrid = Math.max(0, _tickState.offgrid - drainPerSec);
  const wasOk = _tickState.offgrid > 25;
  const nowCritical = newOffgrid < 25;
  _tickState.offgrid = newOffgrid;
  _tickState.offgridCritical = nowCritical;
  if (wasOk && nowCritical) {
    _tickState.batteryLowNotified = false; // reset za notify
  }
}

/**
 * Tick: ažurira signal
 * @param {number} recoverRate - % oporavka po sekundi
 */
export function tickSignal(recoverRate) {
  if (!_tickState) return;
  if (!_tickState.signalDropping && _tickState.signal < 100) {
    _tickState.signal = Math.min(100, _tickState.signal + recoverRate);
  }
  if (_tickState.signal > 50) {
    _tickState.uptimeSeconds++;
  }
}

/**
 * Tick: ažurira chat momentum (gradijentni decay)
 * @param {Object} newMessages - { ig: count, tiktok: count, youtube: count }
 */
export function tickChatMomentum(newMessages) {
  if (!_tickState) return;
  const decay = 0.98; // 2% decay po tick-u
  for (const p of ['ig', 'tiktok', 'youtube']) {
    const msgs = newMessages[p] || 0;
    const gain = msgs * 0.05;
    _tickState.chatMomentum[p] = clamp(
      _tickState.chatMomentum[p] * decay + gain,
      0, 1
    );
  }
}

/**
 * Vraća engagement kao kombinovani score
 * @returns {number} 0-1
 */
export function calcOverallEngagement() {
  if (!_tickState) return 0;
  const { signal, chatMomentum, plan, gostArrived, gostStandout } = _tickState;

  const signalFactor = signal / 100;
  const chatAvg = (chatMomentum.ig + chatMomentum.tiktok + chatMomentum.youtube) / 3;

  let gostFactor = 0;
  if (gostArrived) gostFactor = gostStandout ? 0.4 : 0.2;

  return clamp(
    signalFactor * GAME_CONFIG.ENGAGEMENT_SIGNAL_WEIGHT +
    chatAvg      * GAME_CONFIG.ENGAGEMENT_CHAT_WEIGHT +
    gostFactor   * GAME_CONFIG.ENGAGEMENT_GUEST_WEIGHT,
    0, 1
  );
}

/**
 * Je li emisija završena?
 * @returns {boolean}
 */
export function isEmisijaOver() {
  return _tickState && _tickState.elapsed >= _tickState.duration;
}

/**
 * Reset (između emisija)
 */
export function resetDashboardState() {
  _tickState = null;
}
