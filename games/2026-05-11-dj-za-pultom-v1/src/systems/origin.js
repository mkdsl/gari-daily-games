// =============================================================================
// systems/origin.js — Origin Story creator orchestration (v2)
// =============================================================================
// V2 (Jova 2026-05-11):
//   - 9 preseta replaces "klasa + custom preset" tree
//   - preset.class_baseline mapira na CLASS_MODIFIERS config
//   - preset.substance_baseline puni state.substance.baseline (S2)
// =============================================================================
import {
  ORIGIN_QUESTIONS, ORIGIN_PRESETS, findPreset, applyOriginStatMods
} from '../data/origin-questions.js';
import { CLASS_UI } from '../data/classes.js';
import { applyClassToState, applyOriginAnswers } from '../state.js';

export function processOriginCompletion(state, formAnswers) {
  state.origin.answers = { ...formAnswers };
  state.origin.preset_key = formAnswers.preset_key || null;

  const preset = formAnswers.preset_key ? findPreset(formAnswers.preset_key) : null;
  state.origin.preset_label = preset?.label || null;

  // Class baseline iz preset.class_baseline (ili fallback custom)
  const classKey = preset?.class_baseline || 'custom';
  applyClassToState(state, classKey);

  // Apply Q5 origin choice
  applyOriginAnswers(state);

  // Apply Q2/Q3/Q4 stat mods + preset stat mods + substance baseline
  applyOriginStatMods(state, formAnswers);

  // Substance baseline: ovo postaju aktivne supstance ove sezone
  if (preset && preset.substance_baseline) {
    state.substance = state.substance || {};
    state.substance.baseline = [...preset.substance_baseline];
    state.substance.active_substances = [...preset.substance_baseline];
  }

  return state;
}

export function getOriginQuestions() {
  return ORIGIN_QUESTIONS;
}

export function getPresets() {
  return ORIGIN_PRESETS;
}

export function getClassUI() {
  return CLASS_UI;
}
