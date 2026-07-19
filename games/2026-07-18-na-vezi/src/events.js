/** Event bus za macro↔micro↔meta komunikaciju */

/** @type {Map<string, Set<Function>>} */
const _listeners = new Map();

/**
 * Registruje listener za event tip
 * @param {string} eventType
 * @param {Function} handler
 * @returns {Function} unsubscribe
 */
export function on(eventType, handler) {
  if (!_listeners.has(eventType)) {
    _listeners.set(eventType, new Set());
  }
  _listeners.get(eventType).add(handler);
  return () => off(eventType, handler);
}

/**
 * Uklanja listener
 * @param {string} eventType
 * @param {Function} handler
 */
export function off(eventType, handler) {
  const set = _listeners.get(eventType);
  if (set) set.delete(handler);
}

/**
 * Emituje event
 * @param {string} eventType
 * @param {*} data
 */
export function emit(eventType, data) {
  const set = _listeners.get(eventType);
  if (!set || set.size === 0) return;
  for (const handler of set) {
    try {
      handler(data);
    } catch (e) {
      console.error(`Event handler error [${eventType}]:`, e);
    }
  }
}

/**
 * Uklanja sve listenere (reset za novu sesiju)
 */
export function clearAll() {
  _listeners.clear();
}

// ======= TIPIZIRANI EVENT NAZIVI =======
export const EVENTS = {
  // Makro layer
  MACRO_PLAN_COMPLETE:   'macro:plan_complete',
  FORMAT_SELECTED:       'macro:format_selected',
  PLATFORM_ALLOC_CHANGE: 'macro:platform_alloc_change',
  EQUIPMENT_BOUGHT:      'macro:equipment_bought',
  GUEST_BOOKED:          'macro:guest_booked',
  OFFGRID_CONFIRMED:     'macro:offgrid_confirmed',

  // Micro layer
  EMISIJA_START:         'micro:emisija_start',
  EMISIJA_END:           'micro:emisija_end',
  ALARM_SPAWN:           'micro:alarm_spawn',
  ALARM_RESOLVED:        'micro:alarm_resolved',
  ALARM_MISSED:          'micro:alarm_missed',
  ALARM_ESCALATED:       'micro:alarm_escalated',
  SIGNAL_DROP:           'micro:signal_drop',
  SIGNAL_RECOVERED:      'micro:signal_recovered',
  BATTERY_LOW:           'micro:battery_low',
  BATTERY_CRITICAL:      'micro:battery_critical',
  GUEST_NOSHOW:          'micro:guest_noshow',
  GUEST_ARRIVED:         'micro:guest_arrived',
  TIKTOK_SPIKE:          'micro:tiktok_spike',
  CHAT_MOMENTUM_CHANGE:  'micro:chat_momentum_change',
  HIGHLIGHT_SCORED:      'micro:highlight_scored',
  EQ_MINIGAME_START:     'micro:eq_minigame_start',
  EQ_MINIGAME_END:       'micro:eq_minigame_end',

  // Meta layer
  ACHIEVEMENT_UNLOCKED:  'meta:achievement_unlocked',
  FORMAT_UNLOCKED:       'meta:format_unlocked',
  PRESTIGE_TRIGGERED:    'meta:prestige_triggered',
  SEASON_END:            'meta:season_end',

  // UI
  SCREEN_CHANGE:         'ui:screen_change',
  AUDIO_PLAY:            'ui:audio_play',
  RENDER_UPDATE:         'ui:render_update',
};
