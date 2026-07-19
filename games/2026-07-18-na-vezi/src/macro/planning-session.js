/** Orkestrira 5 nedeljnih odluka, lock-in flow */
import { getState, updateState, saveState } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { rollWeeklyCapacity } from './offgrid-budget.js';

/** Redosled koraka */
const STEPS = ['format', 'platform', 'equipment', 'guest', 'offgrid'];

/** @type {number} Trenutni korak */
let _currentStep = 0;

/** @type {Object} Planirani podaci koji se grade tokom sesije */
let _draftPlan = null;

/**
 * Pokretanje planning sesije
 * Resetuje draft plan iz trenutnog state-a
 */
export function startPlanningSession() {
  const state = getState();
  _currentStep = 0;

  // Roluj nedeljni kapacitet
  const capacityResult = rollWeeklyCapacity(
    state.base_offgrid_capacity,
    state.equipment.b2
  );

  _draftPlan = {
    format: state.weekly_plan.format || 'dj_lajv',
    platform_alloc: { ...state.weekly_plan.platform_alloc },
    chosen_guest_id: state.weekly_plan.chosen_guest_id || 'g8',
    weekly_capacity: capacityResult.capacity,
    weather_band: capacityResult.band,
  };

  // Sačuvaj capacity u state odmah
  updateState({
    weekly_plan: {
      ...state.weekly_plan,
      weekly_capacity: capacityResult.capacity,
      weather_band: capacityResult.band,
    },
  });

  return {
    step: STEPS[_currentStep],
    draftPlan: { ..._draftPlan },
    capacityResult,
  };
}

/**
 * Vraća trenutni korak
 */
export function getCurrentStep() {
  return { index: _currentStep, name: STEPS[_currentStep] };
}

/**
 * Napreduje na sledeći korak
 */
export function nextStep() {
  _currentStep = Math.min(_currentStep + 1, STEPS.length - 1);
  return { index: _currentStep, name: STEPS[_currentStep] };
}

/**
 * Ide na prethodni korak
 */
export function prevStep() {
  _currentStep = Math.max(_currentStep - 1, 0);
  return { index: _currentStep, name: STEPS[_currentStep] };
}

/**
 * Ažurira draft plan
 * @param {Partial<Object>} patch
 */
export function updateDraftPlan(patch) {
  if (!_draftPlan) return;
  Object.assign(_draftPlan, patch);
}

/**
 * Vraća draft plan
 */
export function getDraftPlan() {
  return _draftPlan ? { ..._draftPlan } : null;
}

/**
 * Finalizuje plan i zaključava u state
 * @returns {{ ok: boolean, reason?: string }}
 */
export function lockInPlan() {
  if (!_draftPlan) return { ok: false, reason: 'Nema plana' };

  const state = getState();
  const total = Object.values(_draftPlan.platform_alloc).reduce((s, v) => s + v, 0);
  if (total !== 100) {
    return { ok: false, reason: `Alokacija mora biti 100% (trenutno ${total}%)` };
  }

  updateState({ weekly_plan: { ..._draftPlan } });
  emit(EVENTS.MACRO_PLAN_COMPLETE, { plan: { ..._draftPlan } });

  return { ok: true };
}

/**
 * Je li na zadnjem koraku?
 */
export function isLastStep() {
  return _currentStep >= STEPS.length - 1;
}

/**
 * Ukupan broj koraka
 */
export function getTotalSteps() {
  return STEPS.length;
}

/**
 * Vraća naziv koraka po indexu
 * @param {number} idx
 */
export function getStepName(idx) {
  return STEPS[idx] || null;
}
