// =============================================================================
// systems/pera-period.js — Aforizam picker (PLACEHOLDER bank, Pera ce zameniti)
// =============================================================================
import { selectAforizam } from '../data/aforizmi.js';

export function getPeraNudge(state, context) {
  const line = selectAforizam(state, context);
  state.pera_log.push({
    week: state.week,
    context,
    line,
    timestamp: Date.now()
  });
  return line;
}

export function getDrainNudges(state, deltas) {
  const nudges = [];
  if (state.sacrifice.health < 50 && state.sacrifice.health > 0) {
    nudges.push({ context: 'health_low', line: getPeraNudge(state, 'health_low') });
  }
  if (state.sacrifice.odnosi < 50 && state.sacrifice.odnosi > 0) {
    nudges.push({ context: 'odnosi_low', line: getPeraNudge(state, 'odnosi_low') });
  }
  if (state.sacrifice.normalnost < 50 && state.sacrifice.normalnost > 0) {
    nudges.push({ context: 'normalnost_low', line: getPeraNudge(state, 'normalnost_low') });
  }
  return nudges;
}
