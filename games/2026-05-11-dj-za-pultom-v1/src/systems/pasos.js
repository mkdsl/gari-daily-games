// =============================================================================
// systems/pasos.js — Pasoš pečat sistem (Mile sekcija 4.4)
// =============================================================================
import { PASOS } from '../config.js';
import { clamp } from '../util.js';

export function addPecat(state) {
  if (state.pecati >= PASOS.cap_per_season) return false;
  state.pecati += 1;
  state.crew_loyalty = clamp(
    state.crew_loyalty + PASOS.crew_loyalty_per_pecat,
    0,
    PASOS.max_crew_loyalty_boost + 0.5
  );
  return true;
}

export function getPecatStatus(state) {
  return {
    count: state.pecati,
    cap: PASOS.cap_per_season,
    crew_boost: state.crew_loyalty,
    pct: state.pecati / PASOS.cap_per_season
  };
}
