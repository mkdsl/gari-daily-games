/**
 * GameState.js — Centralni state kontejner za Niš Fuga
 * Drži resurse, flagove, progres scena, achievements
 * @module GameState
 */

export const RESOURCE_CAPS = {
  time: 60,
  patience: 5,
  morale: 4,
  reputation: 5
};

export const RESOURCE_MINS = {
  time: 0,
  patience: 0,
  morale: 0,
  reputation: 0
};

export const INITIAL_STATE = {
  resources: {
    time: 60,
    patience: 4,
    morale: 3,
    reputation: 0
  },
  flags: {
    setlista_printovana: false,
    tonika_potvrdjeno: false,
    bojan_happy: false
  },
  currentScene: 'bulevar',
  sceneHistory: [],
  visitedHotspots: {},
  dialogProgress: {},
  achievements: [],
  analyticsEvents: [],
  gameComplete: false,
  ending: null,
  soundcheckExplainStep: 0,
  scene3ComplikacijaAdded: false,
  started: false,
  startTime: null
};

class GameStateClass {
  constructor() {
    this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this._listeners = [];
  }

  /** @returns {object} Deep copy of current state */
  get() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /** Raw reference — use only for reads in hot paths */
  raw() {
    return this._state;
  }

  /** Apply resource delta — respects caps and minimums */
  applyResourceDelta(deltas) {
    const changed = {};
    for (const [key, delta] of Object.entries(deltas)) {
      if (!(key in this._state.resources)) continue;
      const prev = this._state.resources[key];
      const next = Math.max(
        RESOURCE_MINS[key] ?? 0,
        Math.min(RESOURCE_CAPS[key] ?? 99, prev + delta)
      );
      this._state.resources[key] = next;
      changed[key] = { from: prev, to: next, delta };
    }
    this._emit('resources_changed', changed);
    return changed;
  }

  getResource(key) {
    return this._state.resources[key] ?? 0;
  }

  /** Set a boolean flag */
  setFlag(name, value = true) {
    if (name in this._state.flags) {
      const prev = this._state.flags[name];
      this._state.flags[name] = value;
      if (prev !== value) {
        this._emit('flag_changed', { name, value });
      }
    }
  }

  getFlag(name) {
    return this._state.flags[name] ?? false;
  }

  /** Mark a hotspot as visited */
  visitHotspot(sceneId, hotspotId) {
    const key = `${sceneId}:${hotspotId}`;
    this._state.visitedHotspots[key] = true;
    this._emit('hotspot_visited', { sceneId, hotspotId });
  }

  isHotspotVisited(sceneId, hotspotId) {
    return !!this._state.visitedHotspots[`${sceneId}:${hotspotId}`];
  }

  /** Progress dialog node tracking */
  setDialogNode(nodeId) {
    this._state.dialogProgress.currentNode = nodeId;
  }

  /** Unlock achievement */
  unlockAchievement(id) {
    if (!this._state.achievements.includes(id)) {
      this._state.achievements.push(id);
      this._emit('achievement_unlocked', { id });
      return true;
    }
    return false;
  }

  hasAchievement(id) {
    return this._state.achievements.includes(id);
  }

  /** Move to next scene */
  goToScene(sceneId) {
    const prev = this._state.currentScene;
    this._state.sceneHistory.push(prev);
    this._state.currentScene = sceneId;
    this._emit('scene_changed', { from: prev, to: sceneId });
  }

  /** Record soundcheck explain step (Scena 3) */
  advanceSoundcheckStep() {
    this._state.soundcheckExplainStep++;
  }

  getSoundcheckStep() {
    return this._state.soundcheckExplainStep;
  }

  /** Add time complication for scene 5 */
  addScene3Complication(minutes) {
    if (!this._state.scene3ComplikacijaAdded) {
      this._state.scene3KomplikacijaMinutes = (this._state.scene3KomplikacijaMinutes ?? 0) + minutes;
      this._state.scene3ComplikacijaAdded = true;
    }
  }

  getScene3Complication() {
    return this._state.scene3KomplikacijaMinutes ?? 0;
  }

  setEnding(ending) {
    this._state.ending = ending;
    this._state.gameComplete = true;
    this._emit('game_complete', { ending });
  }

  addAnalyticsEvent(event) {
    this._state.analyticsEvents.push({
      ...event,
      ts: Date.now()
    });
  }

  markStarted() {
    if (!this._state.started) {
      this._state.started = true;
      this._state.startTime = Date.now();
    }
  }

  /** Subscribe to state events */
  on(event, fn) {
    this._listeners.push({ event, fn });
    return () => {
      this._listeners = this._listeners.filter(l => l.fn !== fn);
    };
  }

  _emit(event, data) {
    for (const l of this._listeners) {
      if (l.event === event || l.event === '*') {
        try { l.fn(data); } catch (e) { console.error('GameState listener error:', e); }
      }
    }
  }

  /** Serialize to plain object for save */
  serialize() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /** Restore from plain object */
  deserialize(obj) {
    this._state = Object.assign(JSON.parse(JSON.stringify(INITIAL_STATE)), obj);
    this._emit('state_loaded', {});
  }

  reset() {
    this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this._emit('state_reset', {});
  }
}

export const GameState = new GameStateClass();
export default GameState;
