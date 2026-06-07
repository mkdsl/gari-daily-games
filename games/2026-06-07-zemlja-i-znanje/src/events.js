/**
 * events.js — Event bus za Canvas<->DOM komunikaciju
 * Koristi EventTarget API (nativni browser, bez zavisnosti)
 */

class EventBus extends EventTarget {
  /**
   * Emituje event sa optional data payload
   * @param {string} type
   * @param {*} detail
   */
  emit(type, detail = null) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  /**
   * Subscribuje listener
   * @param {string} type
   * @param {function} callback
   */
  on(type, callback) {
    this.addEventListener(type, (e) => callback(e.detail));
    return () => this.off(type, callback);
  }

  /**
   * Unsubscribes listener
   */
  off(type, callback) {
    this.removeEventListener(type, callback);
  }

  /**
   * One-time listener
   */
  once(type, callback) {
    const handler = (e) => {
      callback(e.detail);
      this.removeEventListener(type, handler);
    };
    this.addEventListener(type, handler);
  }
}

export const bus = new EventBus();

// === EVENT TYPE CONSTANTS ===
export const EVT = {
  // Render <-> Logic
  CANVAS_CLICK:         'canvas:click',
  CANVAS_DRAG_START:    'canvas:drag_start',
  CANVAS_DRAG_END:      'canvas:drag_end',

  // Incident
  INCIDENT_TRIGGER:     'incident:trigger',
  INCIDENT_RESOLVED:    'incident:resolved',
  INCIDENT_TIMEOUT:     'incident:timeout',

  // Sesija
  SESSION_START:        'session:start',
  SESSION_END:          'session:end',
  SESSION_PAUSE:        'session:pause',
  SESSION_RESUME:       'session:resume',
  SESSION_TICK:         'session:tick',
  SESSION_SLOT_ADVANCE: 'session:slot_advance',
  SESSION_SPEED_CHANGE: 'session:speed_change',

  // Macro
  MACRO_PLAN_CONFIRM:   'macro:plan_confirm',
  MACRO_SEASON_START:   'macro:season_start',
  MACRO_SEASON_END:     'macro:season_end',

  // Meta
  REP_CHANGE:           'meta:rep_change',
  UNLOCK:               'meta:unlock',
  ACHIEVEMENT:          'meta:achievement',
  PRESTIGE_PROMPT:      'meta:prestige_prompt',
  PRESTIGE_CONFIRM:     'meta:prestige_confirm',

  // UI
  SCREEN_CHANGE:        'ui:screen_change',
  TOAST:                'ui:toast',
  MODAL_OPEN:           'ui:modal_open',
  MODAL_CLOSE:          'ui:modal_close',
  AFORIZEM_SHOW:        'ui:aforizem',

  // Audio
  AUDIO_PLAY:           'audio:play',
  AUDIO_AMBIENT_START:  'audio:ambient_start',
  AUDIO_AMBIENT_STOP:   'audio:ambient_stop',

  // Timeline drag/drop
  TIMELINE_SLOT_DROP:   'timeline:slot_drop',
  TIMELINE_UPDATED:     'timeline:updated',

  // Game lifecycle
  GAME_INIT:            'game:init',
  GAME_SAVE:            'game:save',
  GAME_LOAD:            'game:load',
  GAME_RESET:           'game:reset',

  // Share
  SHARE_CAPTURE:        'share:capture',
  SHARE_DONE:           'share:done',

  // Particles
  PARTICLE_CONFETTI:    'particle:confetti',
  PARTICLE_GOLD:        'particle:gold',
  PARTICLE_ALERT:       'particle:alert',

  // Weather
  WEATHER_CHANGE:       'weather:change',
  RAIN_START:           'weather:rain_start',
  RAIN_STOP:            'weather:rain_stop'
};
