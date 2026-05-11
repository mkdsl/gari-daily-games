// =============================================================================
// systems/origin.js — Origin Story creator orchestration
// =============================================================================
// MOBILE-FIRST (Jova 2026-05-11): bez keyword aproksimacije.
// Custom klasa koristi predefinisani preset (CUSTOM_PRESETS) sa direktnim
// stat distribucijama umesto teksta + word matching.
// =============================================================================
import { ORIGIN_QUESTIONS, applyOriginStatMods } from '../data/origin-questions.js';
import { CLASS_UI } from '../data/classes.js';
import { applyClassToState, applyOriginAnswers } from '../state.js';

export function processOriginCompletion(state, formAnswers) {
  state.origin.answers = { ...formAnswers };
  state.origin.custom_preset = formAnswers.custom_preset || null;

  // Class key: za custom uvek custom (preset modifikuje stat-ove kasnije)
  const classKey = formAnswers.q1_class;

  // Apply class baseline
  applyClassToState(state, classKey);

  // Apply Q5 origin choice
  applyOriginAnswers(state);

  // Apply Q2/Q3/Q4 stat mods + custom preset stat mods
  applyOriginStatMods(state, formAnswers);

  return state;
}

export function getOriginQuestions() {
  return ORIGIN_QUESTIONS;
}

export function getClassUI() {
  return CLASS_UI;
}
