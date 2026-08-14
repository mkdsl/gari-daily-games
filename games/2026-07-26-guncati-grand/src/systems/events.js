/** @fileoverview Finale random event dispatcher, timing engine, effect application */

import { FINALE_EVENTS, shouldEventTrigger, applyEventEffect } from '../content/events_data.js';
import { getState, setState, setField } from '../state.js';

/**
 * Tick the event system — check for triggers and queue events
 * @param {Object} finaleState - mutable finale sub-state
 * @param {Object} gameState - full game state (for conditions)
 * @param {Function} onEventTriggered - callback(event)
 */
export function tickEventSystem(finaleState, gameState, onEventTriggered) {
  // Don't queue another event if one is pending
  if (finaleState.pendingEvent) return;

  const elapsedMin = Math.floor(finaleState.elapsed / 60);

  for (const event of FINALE_EVENTS) {
    if (event.isTransition) continue; // handled by DJ system

    if (shouldEventTrigger(event, finaleState, gameState, elapsedMin)) {
      if (event.autoResolve) {
        // Apply immediately
        const applied = applyAutoEvent(event, finaleState, gameState);
        markEventTriggered(finaleState, event.id);
        if (applied) {
          onEventTriggered({ ...event, autoResolved: true });
        }
      } else {
        // Queue for player decision
        finaleState.pendingEvent = {
          ...event,
          triggeredAt: finaleState.elapsed
        };
        markEventTriggered(finaleState, event.id);
        onEventTriggered(finaleState.pendingEvent);
        break; // one event at a time
      }
    }
  }
}

/**
 * Apply auto-resolve event effects
 * @param {Object} event
 * @param {Object} finaleState - mutable
 * @param {Object} gameState - mutable
 * @returns {boolean} was anything applied
 */
function applyAutoEvent(event, finaleState, gameState) {
  if (!event.effect) return false;
  const { wellbeingDelta, moodDelta, hypeDelta } = event.effect;
  if (moodDelta) finaleState.crowdMood = Math.max(0, Math.min(100, finaleState.crowdMood + moodDelta));
  if (hypeDelta) finaleState.djHype = Math.max(0, Math.min(100, finaleState.djHype + hypeDelta));
  if (wellbeingDelta) {
    // Apply to game state
    gameState.currentWB = Math.min(100, (gameState.currentWB || 50) + wellbeingDelta);
  }
  return true;
}

/**
 * Mark event as triggered so it doesn't fire again
 * @param {Object} finaleState - mutable
 * @param {string} eventId
 */
function markEventTriggered(finaleState, eventId) {
  if (!finaleState.triggeredEvents) finaleState.triggeredEvents = [];
  if (!finaleState.triggeredEvents.includes(eventId)) {
    finaleState.triggeredEvents.push(eventId);
  }
}

/**
 * Resolve player's choice for the pending event
 * @param {number} optionIndex
 * @param {Object} finaleState - mutable
 * @param {Object} gameState - mutable
 * @returns {{ result: string, effects: Object }}
 */
export function resolveEventChoice(optionIndex, finaleState, gameState) {
  const event = finaleState.pendingEvent;
  if (!event || !event.options) {
    finaleState.pendingEvent = null;
    return { result: 'no_event', effects: {} };
  }

  const option = event.options[optionIndex];
  if (!option) {
    finaleState.pendingEvent = null;
    return { result: 'invalid_option', effects: {} };
  }

  // Check requirements
  if (option.requiresBuilding) {
    const level = gameState.buildings?.[option.requiresBuilding] || 0;
    const required = option.requiresBuildingLevel || 1;
    if (level < required) {
      return {
        result: 'requirement_not_met',
        effects: {},
        reason: `Zahteva ${option.requiresBuilding} nivo ${required}`
      };
    }
  }

  if (option.requiresVibeAvg) {
    const vols = gameState.volunteers || [];
    if (vols.length === 0) {
      return { result: 'requirement_not_met', effects: {}, reason: 'Nema volontera' };
    }
    const avgVibe = vols.reduce((s, v) => s + v.vibe, 0) / vols.length;
    if (avgVibe < option.requiresVibeAvg) {
      return {
        result: 'requirement_not_met',
        effects: {},
        reason: `Prosečan Vibe premalo (${Math.floor(avgVibe)} < ${option.requiresVibeAvg})`
      };
    }
  }

  // Apply effects
  applyEventEffect(option, finaleState, gameState);

  // Handle DJ slot cost
  if (option.costSlot) {
    finaleState.totalSlots = Math.max(1, (finaleState.totalSlots || 1) - option.costSlot);
  }

  const effects = {
    moodDelta: option.moodDelta || 0,
    revenueDelta: option.revenueDelta || 0,
    costDelta: option.costDelta || 0,
    gcDelta: option.gcDelta || 0,
    reputationDelta: option.reputationDelta || 0
  };

  finaleState.pendingEvent = null;
  return { result: 'resolved', effects, optionText: option.text };
}

/**
 * Update periodic event tracking
 * @param {Object} finaleState - mutable
 * @param {string} eventId
 * @param {number} elapsedMin
 */
export function updatePeriodicTracker(finaleState, eventId, elapsedMin) {
  if (!finaleState.periodicTriggers) finaleState.periodicTriggers = {};
  finaleState.periodicTriggers[eventId] = elapsedMin;
}

/**
 * Generate event log entry for display
 * @param {Object} event
 * @param {Object} effects
 * @param {number} elapsedSeconds
 * @returns {Object}
 */
export function createEventLogEntry(event, effects, elapsedSeconds) {
  const min = Math.floor(elapsedSeconds / 60);
  const sec = Math.floor(elapsedSeconds % 60);
  const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  let summary = event.title;
  if (effects.moodDelta) summary += ` | Vibe ${effects.moodDelta > 0 ? '+' : ''}${effects.moodDelta}%`;
  if (effects.costDelta) summary += ` | -${effects.costDelta} GC`;
  if (effects.gcDelta) summary += ` | +${effects.gcDelta} GC`;

  return { id: event.id, time: timeStr, summary, effects };
}
