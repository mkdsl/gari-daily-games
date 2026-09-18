/**
 * barrel_init.js — Bačva KO: inicijacioni prozor (2 slota), BARREL_FAIL propagacija.
 * Kritičan prozor: bačva mora biti pokrenuta na Dan 1 ili Dan 2.
 *
 * Exports (task brief names):
 *   startBarrel(state, kupus_kg) — transition unsalted → critical_window
 *   checkBarrelWindow(state) — tick called from advanceDay
 *   utisniKupus(state) — transition critical_window → fermenting
 *   tickBacva(state) — full tick (wraps checkBarrelWindow + fermenting tick)
 *   initBacva(state, kupusKg) — start with slot cost (used by time_system)
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

// ─── Task-brief named exports ─────────────────────────────────────────────

/**
 * Inicira bačvu — transition unsalted → critical_window.
 * Rezerviše kupus (skida iz sirovine), NE troši action slotove.
 * Slotove troši initBacva (koji odmah prelazi u fermenting).
 * @param {object} state
 * @param {number} kupus_kg
 * @returns {object} Ažurirani state
 */
export function startBarrel(state, kupus_kg) {
  if (state.bačva_status !== 'unsalted') return state;
  if ((state.sirovine.kupus || 0) < kupus_kg) return state;
  const newSirovine = { ...state.sirovine, kupus: state.sirovine.kupus - kupus_kg };
  let s = {
    ...state,
    sirovine: newSirovine,
    bačva_status: 'critical_window',
    bačva_window_deadline: state.day + BARREL_WINDOW_DAYS,
    bačva_kupus_kg: kupus_kg,
  };
  s = addLog(s, `🪣 Kupus spreman (${kupus_kg} kg). Utisni bačvu do Dana ${s.bačva_window_deadline}!`, 'warn');
  return s;
}

/**
 * Proverava bačva window — zove se pri advanceDay.
 * @param {object} state
 * @returns {object} Ažurirani state
 */
export function checkBarrelWindow(state) {
  let s = { ...state };
  if (s.bačva_status === 'critical_window') {
    const deadline = s.bačva_window_deadline ?? (s.bačva_init_day ? s.bačva_init_day + BARREL_WINDOW_DAYS : BARREL_WINDOW_DAYS + 1);
    if (s.day > deadline) {
      s = { ...s, bačva_status: 'failed' };
      s = addLog(s, '💀 Bačva propala — prozor zatvoren!', 'warn');
    }
  } else if (s.bačva_status === 'fermenting') {
    const daysLeft = s.bačva_days_remaining - 1;
    if (daysLeft <= 0) {
      const kupusKg = s.bačva_kupus_kg || s.sirovine.kupus || 20;
      const outputKg = kupusKg * 0.85;
      const jar = createJar('kiseli_kupus', outputKg, s.day, 0);
      s = { ...s, bačva_status: 'ready', bačva_days_remaining: 0, tegle: [...s.tegle, jar] };
      s = addLog(s, `✅ Bačva gotova! +${outputKg.toFixed(1)} kg kiselog kupusa.`, 'success');
    } else {
      s = { ...s, bačva_days_remaining: daysLeft };
    }
  }
  return s;
}

/**
 * Utisni kupus — transition critical_window → fermenting.
 * @param {object} state
 * @returns {object} Ažurirani state
 */
export function utisniKupus(state) {
  if (state.bačva_status !== 'critical_window') return state;
  let s = {
    ...state,
    bačva_status: 'fermenting',
    bačva_days_remaining: FERMENTATION_DAYS.bačva,
    bačva_init_day: state.day,
  };
  s = addLog(s, `🧂 Kupus utisnut u bačvu! Fermentacija ${FERMENTATION_DAYS.bačva} dana.`, 'success');
  return s;
}

// ─── Existing functions ────────────────────────────────────────────────────

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
