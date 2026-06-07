/**
 * macro-state.js — Macro state management
 * Sezona, resursi, stručnjaci, reputacija, prestiž
 */

import { createMacroState, createDefaultPlan } from '../state.js';
import { saveMacro, loadMacro } from '../save.js';
import { bus, EVT } from '../events.js';
import { BASE_BUDGET, MIN_PARTICIPANTS, SEASON_MULTIPLIERS, PRESTIGE_SEASONS_REQUIRED } from '../config.js';
import { getAvailableThemes } from '../content/masterclass-catalog.js';
import { createParticipant, ARCHETYPE_IDS } from '../content/participant-archetypes.js';
import { randomInt, pick, createRng } from '../utils.js';

let _state = null;

export function initMacro(metaState) {
  const saved = loadMacro();
  if (saved) {
    _state = saved;
  } else {
    _state = createMacroState();
    // Apply meta overrides
    if (metaState) {
      _state.budget = BASE_BUDGET + (metaState.reputation * 0.5);
      _state.maxParticipants = metaState.maxParticipants || MIN_PARTICIPANTS;
      _state.availableStaff = [...metaState.unlockedStaff];
      _state.guidedModeActive = metaState.totalSessions < 2;
    }
  }
  return _state;
}

export function getMacroState() {
  return _state;
}

export function saveMacroState() {
  if (_state) saveMacro(_state);
}

// === SEASON SETUP ===
export function startNewSeason(options) {
  const { tema, participantCount, days, hiredStaff, sessionPlan } = options;

  _state.selectedTema = tema;
  _state.participantCount = participantCount;
  _state.sessionDays = days || 1;
  _state.hiredStaff = hiredStaff || [];
  _state.sessionPlan = sessionPlan || createDefaultPlan();
  _state.completedSessions = [];
  _state.seasonStarted = true;
  _state.seasonCompleted = false;

  // Generiši polaznike
  _state.participants = generateParticipants(participantCount, _state.currentSeason);

  bus.emit(EVT.MACRO_SEASON_START, { season: _state.currentSeason, tema });
  saveMacroState();
}

function generateParticipants(count, seasonSeed) {
  const rng = createRng(seasonSeed * 1000 + Date.now() % 1000);
  const participants = [];
  const archetypes = [...ARCHETYPE_IDS];

  for (let i = 0; i < count; i++) {
    const archetypeId = archetypes[Math.floor(rng() * archetypes.length)];
    participants.push(createParticipant(archetypeId, i, rng));
  }
  return participants;
}

// === SEASON END ===
export function completeSeason(sessionResults, reputation) {
  const profitData = calculateSeasonProfit(sessionResults);

  _state.completedSessions = sessionResults;
  _state.seasonCompleted = true;
  _state.totalEarned += profitData.income;
  _state.totalSpent += profitData.costs;

  // Carry-over
  const profit = profitData.income - profitData.costs;
  const carryover = Math.max(0, profit * 0.30);
  _state.carryoverBudget = carryover;

  // Tool wear
  _state.toolInventory.quality = Math.max(0.5, _state.toolInventory.quality - 0.1);

  // Advance season counter
  _state.totalSeasonsCompleted++;
  _state.currentSeason = (_state.currentSeason % PRESTIGE_SEASONS_REQUIRED) + 1;

  // Reset for next season
  _state.selectedTema = null;
  _state.participants = [];
  _state.seasonStarted = false;

  bus.emit(EVT.MACRO_SEASON_END, { profitData, carryover });
  saveMacroState();

  return profitData;
}

export function calculateSeasonProfit(sessionResults) {
  if (!_state) return { income: 0, costs: 0 };

  const tema = _state.selectedTema;
  const participants = _state.participantCount;
  const days = _state.sessionDays;
  const rep = _state.currentReputation || 0;

  // Sync basePrices (no async import needed)
  const basePrices = {
    suvozid: 80, inokulacija: 100, rammed_earth: 120,
    permakultura: 130, akvakultura: 150, kombinovani: 200,
    prirodna_gradnja: 140, muzika_prostor: 120, akvakultura_napredna: 180
  };
  const basePrice = basePrices[tema] || 100;
  const price = Math.min(basePrice * (1 + rep / 200), basePrice * 6);

  const materijali = 60 * days;
  const hrana = 15 * participants * days;
  const honorar = _state.hiredStaff.length > 0 ? 80 * days : 0;

  const foodDiscount = _state.hiredStaff.includes('cana') ? 0.25 : 0;
  const toolDiscount = _state.toolInventory.discount || 0;

  const income = Math.round(participants * price);
  const costs = Math.round(
    (materijali * (1 - toolDiscount)) +
    (hrana * (1 - foodDiscount)) +
    honorar
  );

  return { income, costs, price, materijali, hrana, honorar };
}

// Sync version of calculateSeasonProfit
export function calcProfit(tema, participants, days, rep, staff, toolDiscount = 0, foodDiscount = 0) {
  const basePrices = {
    suvozid: 80, inokulacija: 100, rammed_earth: 120,
    permakultura: 130, akvakultura: 150, kombinovani: 200,
    prirodna_gradnja: 140, muzika_prostor: 120, akvakultura_napredna: 180
  };
  const basePrice = basePrices[tema] || 100;
  const price = Math.min(basePrice * (1 + rep / 200), basePrice * 6);

  const materijali = 60 * days;
  const hrana = 15 * participants * days;
  const honorar = staff && staff.length > 0 ? 80 * days * staff.length : 0;

  const income = Math.round(participants * price);
  const costs = Math.round(
    (materijali * (1 - toolDiscount)) +
    (hrana * (1 - foodDiscount)) +
    honorar
  );

  return { income, costs, price: Math.round(price), profit: income - costs };
}

export function setCurrentReputation(rep) {
  if (_state) _state.currentReputation = rep;
}

export function updateMaxParticipants(max) {
  if (_state) _state.maxParticipants = max;
}

export function unlockStaff(staffId) {
  if (_state && !_state.availableStaff.includes(staffId)) {
    _state.availableStaff.push(staffId);
  }
}
