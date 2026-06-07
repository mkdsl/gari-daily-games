/**
 * meta-state.js — Meta state management
 * Reputacija, prestiž level, career stats, achievements
 */

import { createMetaState } from '../state.js';
import { saveMeta, loadMeta } from '../save.js';
import { bus, EVT } from '../events.js';
import { MIN_PARTICIPANTS } from '../config.js';

let _meta = null;

export function initMeta() {
  const saved = loadMeta();
  if (saved) {
    _meta = saved;
  } else {
    _meta = createMetaState();
  }
  return _meta;
}

export function getMetaState() {
  return _meta;
}

export function saveMetaState() {
  if (_meta) saveMeta(_meta);
}

export function updateReputation(gained) {
  if (!_meta) return 0;
  const prev = _meta.reputation;
  _meta.reputation = Math.min(1000, Math.round(_meta.reputation + gained));
  bus.emit(EVT.REP_CHANGE, { prev, current: _meta.reputation, delta: gained });
  return _meta.reputation;
}

export function getReputation() {
  return _meta?.reputation || 0;
}

export function setMaxParticipants(max) {
  if (_meta) _meta.maxParticipants = max;
}

export function addToSeasonHistory(result) {
  if (!_meta) return;
  _meta.seasonHistory = [...(_meta.seasonHistory || []).slice(-9), result];
  _meta.totalSeasons++;
}

export function incrementTotalSessions() {
  if (_meta) _meta.totalSessions++;
}

export function addTotalParticipants(count) {
  if (_meta) _meta.totalParticipants += count;
}

export function addTotalRevenue(amount) {
  if (_meta) _meta.totalRevenue += amount;
}

export function getTotalSessions() {
  return _meta?.totalSessions || 0;
}

export function isFirstSession() {
  return (_meta?.totalSessions || 0) === 0;
}

export function isGuidedModeActive() {
  return (_meta?.totalSessions || 0) < 2;
}
