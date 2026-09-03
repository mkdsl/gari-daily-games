/** @fileoverview Grand Finale real-time 15-min simulation loop, event timing, DJ hype */

import { CONFIG } from '../config.js';
import { getState, setState, setField, saveState } from '../state.js';
import { calcFinaleInitialCrowd, calcCrowdMood, calcFinaleRevenueTick } from '../entities/crowd.js';
import {
  buildDJSlots,
  calculateHypeDelta,
  applyGoodTransition,
  applyBadTransition,
  isTransitionWindowExpired,
  shouldTriggerTransition
} from '../entities/dj.js';
import { tickEventSystem, updatePeriodicTracker } from './events.js';
import { getBuildingEffects } from '../entities/building.js';

/** @type {number|null} RAF id */
let _rafId = null;

/** @type {Function|null} */
let _onTick = null;
let _onEvent = null;
let _onTransition = null;
let _onFinaleEnd = null;

/** @type {DJSlot[]} */
let _djSlots = [];

/** @type {Object[]} event log */
let _eventLog = [];

/**
 * Initialize and start the Grand Finale simulation
 * @param {Object} callbacks - { onTick, onEvent, onTransition, onFinaleEnd }
 */
export function startFinale(callbacks) {
  const state = getState();
  _onTick = callbacks.onTick || null;
  _onEvent = callbacks.onEvent || null;
  _onTransition = callbacks.onTransition || null;
  _onFinaleEnd = callbacks.onFinaleEnd || null;
  _eventLog = [];

  // Calculate finale parameters
  const effects = getBuildingEffects(state.buildings);
  const totalSlots = Math.max(1, effects.djSlots || 1);
  const hasMaja = state.volunteers.some(v => v.typeId === 'maja');
  _djSlots = buildDJSlots(totalSlots, hasMaja);

  const initialCrowd = calcFinaleInitialCrowd(state);

  // Initialize finale state
  setState({
    finale: {
      active: true,
      elapsed: 0,
      crowdMood: CONFIG.FINALE_BASE_MOOD +
        (state.currentWB >= CONFIG.TOM_SAWYER_THRESHOLD ? 10 : 0),
      crowdCurrent: initialCrowd,
      crowdCap: state.seasonCrowdCap,
      djHype: 50,
      currentSlot: 0,
      totalSlots,
      revenue: 0,
      triggeredEvents: [],
      periodicTriggers: {},
      pendingEvent: null,
      pendingTransition: false,
      transitionWindowStart: null,
      lastTickTime: Date.now()
    }
  });

  _tick();
}

/**
 * Main game tick — called each animation frame
 */
function _tick() {
  const state = getState();
  const { finale } = state;

  if (!finale.active) return;

  const now = Date.now();
  const dt = Math.min((now - (finale.lastTickTime || now)) / 1000, 0.1); // cap at 100ms
  const newElapsed = finale.elapsed + dt;

  // Check if finale is over
  if (newElapsed >= CONFIG.FINALE_DURATION_SEC) {
    endFinale();
    return;
  }

  // Update elapsed
  const fin = { ...finale, elapsed: newElapsed, lastTickTime: now };

  // DJ Hype ramp
  const hypeDelta = calculateHypeDelta(_djSlots, fin.currentSlot, dt);
  fin.djHype = Math.max(0, Math.min(100, fin.djHype + hypeDelta));

  // Crowd mood update
  fin.crowdMood = calcCrowdMood(fin, state.currentWB);

  // Revenue tick
  const effects = getBuildingEffects(state.buildings);
  const revTick = calcFinaleRevenueTick(
    fin.crowdCurrent,
    state.seasonTicketRate,
    effects.revenuePct,
    fin.elapsed,
    CONFIG.FINALE_DURATION_SEC
  );
  fin.revenue = (fin.revenue || 0) + revTick * dt;

  // Check DJ transition window expiry
  if (fin.pendingTransition && fin.transitionWindowStart) {
    if (isTransitionWindowExpired(fin.transitionWindowStart)) {
      // Missed window — bad transition
      const result = applyBadTransition(fin, _djSlots);
      fin.pendingTransition = false;
      fin.transitionWindowStart = null;
      if (_onTransition) _onTransition({ success: false, ...result });
    }
  }

  // Check if new DJ transition should trigger
  if (!fin.pendingTransition) {
    const elapsedMin = Math.floor(fin.elapsed / 60);
    if (shouldTriggerTransition(fin.elapsed, fin.currentSlot, fin.totalSlots, false)) {
      fin.pendingTransition = true;
      fin.transitionWindowStart = Date.now();
      if (_onTransition) _onTransition({ pending: true });
    }
  }

  // Tick event system
  tickEventSystem(fin, state, (event) => {
    if (event.isTransition) return;
    _eventLog.push({ event, time: fin.elapsed });
    if (_onEvent) _onEvent(event);
  });

  // Update state
  setState({ finale: fin });

  // Notify UI
  if (_onTick) _onTick(fin);

  _rafId = requestAnimationFrame(_tick);
}

/**
 * Player clicks the CUE NEXT DJ button
 * @returns {{ success: boolean }}
 */
export function playerDJTransition() {
  const state = getState();
  const fin = { ...state.finale };

  if (!fin.pendingTransition) {
    return { success: false, reason: 'Nema aktivne smene' };
  }

  if (isTransitionWindowExpired(fin.transitionWindowStart)) {
    const result = applyBadTransition(fin, _djSlots);
    setState({ finale: fin });
    return { success: false, ...result };
  }

  const result = applyGoodTransition(fin, _djSlots);
  setState({ finale: fin });

  if (_onTransition) _onTransition({ success: true, ...result });
  return { success: true, ...result };
}

/**
 * Resolve the pending event with player's choice
 * @param {number} optionIndex
 */
export function resolveFinaleEvent(optionIndex) {
  const state = getState();
  const fin = { ...state.finale };

  if (!fin.pendingEvent) return null;

  const event = fin.pendingEvent;
  const option = event.options?.[optionIndex];
  if (!option) return null;

  // Check requirements
  if (option.requiresBuilding) {
    const level = state.buildings?.[option.requiresBuilding] || 0;
    const required = option.requiresBuildingLevel || 1;
    if (level < required) {
      return { success: false, reason: `Zahteva ${option.requiresBuilding} nivo ${required}` };
    }
  }

  // Apply effects to finale state
  if (option.moodDelta)     fin.crowdMood = Math.max(0, Math.min(100, fin.crowdMood + option.moodDelta));
  if (option.hypeDelta)     fin.djHype = Math.max(0, Math.min(100, fin.djHype + option.hypeDelta));
  if (option.revenueDelta)  fin.revenue = Math.max(0, fin.revenue * (1 + option.revenueDelta));
  if (option.costSlot)      fin.totalSlots = Math.max(1, fin.totalSlots - option.costSlot);

  _eventLog.push({ event, optionText: option.text, effects: option, time: fin.elapsed });

  fin.pendingEvent = null;
  setState({ finale: fin });

  // Apply state-level effects
  if (option.costDelta && option.costDelta > 0) {
    const s = getState();
    setState({ gcBalance: Math.max(0, s.gcBalance - option.costDelta) });
  }
  if (option.gcDelta) {
    const s = getState();
    setState({ gcBalance: s.gcBalance + option.gcDelta });
  }
  if (option.reputationDelta) {
    const s = getState();
    setState({ reputation: (s.reputation || 0) + option.reputationDelta });
  }

  return { success: true, optionText: option.text, effects: option };
}

/**
 * End the finale and compute final revenue
 */
export function endFinale() {
  if (_rafId) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }

  const state = getState();
  const fin = state.finale;

  // Apply finale revenue to total
  const finaleRevenue = Math.floor(fin.revenue);
  setState({
    finale: { ...fin, active: false },
    totalRevenue: (state.totalRevenue || 0) + finaleRevenue,
    screen: 'SCORE'
  });

  saveState();

  if (_onFinaleEnd) {
    _onFinaleEnd({
      revenue: finaleRevenue,
      crowdMood: fin.crowdMood,
      djHype: fin.djHype,
      eventLog: _eventLog
    });
  }
}

/**
 * Pause/resume finale (for mobile focus loss)
 */
export function pauseFinale() {
  if (_rafId) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
  const state = getState();
  setState({ finale: { ...state.finale, lastTickTime: null } });
}

export function resumeFinale() {
  const state = getState();
  if (!state.finale.active) return;
  setState({ finale: { ...state.finale, lastTickTime: Date.now() } });
  _tick();
}

/**
 * Get current event log
 * @returns {Object[]}
 */
export function getEventLog() {
  return _eventLog;
}
