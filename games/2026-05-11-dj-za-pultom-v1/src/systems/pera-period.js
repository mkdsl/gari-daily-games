// =============================================================================
// systems/pera-period.js — Aforizam picker + overlay trigger (v2)
// =============================================================================
import { selectAforizam } from '../data/aforizmi.js';

export function getPeraNudge(state, context) {
  const line = selectAforizam(state, context);
  state.pera_log = state.pera_log || [];
  state.pera_log.push({
    week: state.week,
    context,
    line,
    timestamp: Date.now()
  });
  if (state.pera_log.length > 50) state.pera_log.shift();
  return line;
}

export function getDrainNudges(state, deltas) {
  const nudges = [];
  if (state.sacrifice.health < 50 && state.sacrifice.health > 0) {
    const ctx = state.sacrifice.health < 30 ? 'symptom_health_red' : 'symptom_health_yellow';
    nudges.push({ context: ctx, line: getPeraNudge(state, ctx) });
  }
  if (state.sacrifice.odnosi < 50 && state.sacrifice.odnosi > 0) {
    const ctx = state.sacrifice.odnosi < 30 ? 'symptom_odnosi_red' : 'symptom_odnosi_yellow';
    nudges.push({ context: ctx, line: getPeraNudge(state, ctx) });
  }
  if (state.sacrifice.normalnost < 50 && state.sacrifice.normalnost > 0) {
    const ctx = state.sacrifice.normalnost < 30 ? 'symptom_normalnost_red' : 'symptom_normalnost_yellow';
    nudges.push({ context: ctx, line: getPeraNudge(state, ctx) });
  }
  return nudges;
}
