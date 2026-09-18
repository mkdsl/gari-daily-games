/**
 * barrel_init.js — Bačva KO: inicijacioni prozor (2 slota), BARREL_FAIL propagacija.
 * Kritičan prozor: bačva mora biti pokrenuta na Dan 1 ili Dan 2.
 */

import { BARREL_WINDOW_DAYS, FERMENTATION_DAYS, SLOT_COST } from '../config.js';
import { addLog } from '../state.js';
import { createJar } from '../entities/jar.js';

/**
 * Tikuje bačvu — poziva se jednom pri advanceDay.
 * @param {object} state
 * @returns {object} Ažurirani state
 */
export function tickBacva(state) {
  let s = { ...state };

  switch (s.bačva_status) {
    case 'fermenting': {
      const daysLeft = s.bačva_days_remaining - 1;
      if (daysLeft <= 0) {
        // Fermentacija završena!
        const kupusKg = s.sirovine.kupus || 0;
        const outputKg = kupusKg * 0.85; // 85% prinos
        const jar = createJar('kiseli_kupus', outputKg, s.day, 0);
        s = {
          ...s,
          bačva_status: 'ready',
          bačva_days_remaining: 0,
          tegle: [...s.tegle, jar]
        };
        s = addLog(s, `✅ Bačva gotova! +${outputKg.toFixed(1)} kg kiselog kupusa`, 'success');
      } else {
        s = { ...s, bačva_days_remaining: daysLeft };
      }
      break;
    }
    case 'critical_window': {
      if (s.day > BARREL_WINDOW_DAYS + 1) {
        s = { ...s, bačva_status: 'failed' };
        s = addLog(s, '💀 Bačva propala — prozor zatvoren!', 'warn');
      }
      break;
    }
  }

  return s;
}

/**
 * Inicira bačvu kupusom. Troši 2 action slota i kupus.
 * @param {object} state
 * @param {number} kupusKg - Kg kupusa za bačvu
 * @returns {{ state: object, error: string|null }}
 */
export function initBacva(state, kupusKg) {
  if (state.day > BARREL_WINDOW_DAYS + 1) {
    return { state, error: 'Inicijacioni prozor zatvoren — bačva nije moguća.' };
  }
  if (state.bačva_status === 'fermenting' || state.bačva_status === 'ready') {
    return { state, error: 'Bačva je već pokrenuta.' };
  }
  if (state.slots < SLOT_COST.bacva_init) {
    return { state, error: 'Nema dovoljno action slotova (potrebno 2).' };
  }
  if ((state.sirovine.kupus || 0) < kupusKg) {
    return { state, error: 'Nema dovoljno kupusa.' };
  }
  if (kupusKg < 5) {
    return { state, error: 'Minimum 5 kg kupusa za bačvu.' };
  }

  const newSirovine = { ...state.sirovine, kupus: state.sirovine.kupus - kupusKg };
  let s = {
    ...state,
    sirovine: newSirovine,
    slots: state.slots - SLOT_COST.bacva_init,
    bačva_status: 'fermenting',
    bačva_days_remaining: FERMENTATION_DAYS.bačva,
    bačva_init_day: state.day,
  };
  s = addLog(s, `🪣 Bačva pokrenuta! ${kupusKg} kg kupusa, fermentacija ${FERMENTATION_DAYS.bačva} dana.`, 'success');
  return { state: s, error: null };
}
