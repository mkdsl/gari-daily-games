/**
 * EventBus.js — Publish/subscribe inter-module komunikacija
 * Omogućava loose coupling između engine, UI i scene modula
 * @module EventBus
 */

class EventBusClass {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._handlers = new Map();
    /** @type {Array<{event: string, data: any, ts: number}>} */
    this._log = [];
    this._debug = false;
  }

  /**
   * Subscribe to an event
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} unsubscribe function
   */
  on(event, handler) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set());
    }
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Subscribe once
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} unsubscribe
   */
  once(event, handler) {
    const wrapped = (data) => {
      handler(data);
      this.off(event, wrapped);
    };
    return this.on(event, wrapped);
  }

  /**
   * Unsubscribe from event
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    this._handlers.get(event)?.delete(handler);
  }

  /**
   * Emit an event to all subscribers
   * @param {string} event
   * @param {any} [data]
   */
  emit(event, data) {
    if (this._debug) {
      this._log.push({ event, data, ts: Date.now() });
      if (this._log.length > 200) this._log.shift();
    }

    const handlers = this._handlers.get(event);
    if (!handlers || handlers.size === 0) return;

    for (const handler of handlers) {
      try {
        handler(data);
      } catch (e) {
        console.error(`[EventBus] Error in handler for "${event}":`, e);
      }
    }
  }

  /**
   * Remove all handlers for an event
   * @param {string} event
   */
  clear(event) {
    if (event) {
      this._handlers.delete(event);
    } else {
      this._handlers.clear();
    }
  }

  enableDebug() {
    this._debug = true;
  }

  getLog() {
    return [...this._log];
  }
}

export const EventBus = new EventBusClass();

// ---- Event name constants ----
export const EVENTS = {
  // Scene lifecycle
  SCENE_LOAD: 'scene:load',
  SCENE_READY: 'scene:ready',
  SCENE_TRANSITION_START: 'scene:transition:start',
  SCENE_TRANSITION_END: 'scene:transition:end',

  // Dialog
  DIALOG_START: 'dialog:start',
  DIALOG_NODE: 'dialog:node',
  DIALOG_CHOICE_HOVER: 'dialog:choice:hover',
  DIALOG_CHOICE_SELECT: 'dialog:choice:select',
  DIALOG_END: 'dialog:end',

  // Resources
  RESOURCE_CHANGED: 'resource:changed',
  RESOURCE_CRITICAL: 'resource:critical',

  // Hotspots
  HOTSPOT_HOVER: 'hotspot:hover',
  HOTSPOT_CLICK: 'hotspot:click',
  HOTSPOT_FLAVOR: 'hotspot:flavor',

  // Achievements
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',

  // Audio
  AUDIO_AMBIENT_CHANGE: 'audio:ambient:change',
  AUDIO_SFX_PLAY: 'audio:sfx:play',

  // UI
  UI_TOAST_SHOW: 'ui:toast:show',
  UI_MENU_OPEN: 'ui:menu:open',
  UI_MENU_CLOSE: 'ui:menu:close',

  // Game flow
  GAME_START: 'game:start',
  GAME_ENDING: 'game:ending',
  GAME_RESTART: 'game:restart'
};

export default EventBus;
