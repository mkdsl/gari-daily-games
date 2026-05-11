// =============================================================================
// systems/origin.js — Origin Story creator orchestration
// =============================================================================
import { ORIGIN_QUESTIONS, applyOriginStatMods } from '../data/origin-questions.js';
import { CLASS_UI } from '../data/classes.js';
import { approximateClassFromText } from '../data/keywords.js';
import { applyClassToState, applyOriginAnswers } from '../state.js';

export function processOriginCompletion(state, formAnswers) {
  state.origin.answers = { ...formAnswers };
  state.origin.custom_text = formAnswers.custom_text || '';

  // Determine class
  let classKey = formAnswers.q1_class;
  if (classKey === 'custom') {
    const taste = formAnswers.q3_signature_taste || '';
    const customText = formAnswers.custom_text || '';
    const merged = (taste + ' ' + customText).trim();
    if (merged.length > 0) {
      const approx = approximateClassFromText(merged);
      // Note: per Mile 5.5 fallback — ako nema dovoljno matches, ostaje custom
      // ako ima match, biramo hint as a stat tweak ne kao class override
      // Za S1 V1 — custom ostaje custom, ali se primenjuju side flags
      if (approx.flags.apstinent_hint) state.apstinent = true;
    }
    classKey = 'custom';
  }

  // Apply class
  applyClassToState(state, classKey);

  // Apply Q5 origin choice
  applyOriginAnswers(state);

  // Apply Q2/Q4 stat mods
  applyOriginStatMods(state, formAnswers);

  return state;
}

export function getOriginQuestions() {
  return ORIGIN_QUESTIONS;
}

export function getClassUI() {
  return CLASS_UI;
}
