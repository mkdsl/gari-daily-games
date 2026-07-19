/** Gost kasni/no-show runtime, banter/klip fallback */
import { getGostProfile } from '../content/gost-roster.js';
import { getDashboardState, updateDashboardState } from './dashboard-state.js';
import { emit, EVENTS } from '../events.js';
import { clamp } from '../config.js';

/** @type {boolean} Gost standout event već okidnut */
let _standoutTriggered = false;

/**
 * Reset za novu emisiju
 */
export function resetGuestRuntime() {
  _standoutTriggered = false;
}

/**
 * Procesira gost arrival (na početku emisije)
 * @param {Object} arrivalResult - { arrived, noShow } iz content/gost-roster
 */
export function handleGuestArrival(arrivalResult) {
  const ds = getDashboardState();
  if (!ds) return;

  if (arrivalResult.noShow) {
    emit(EVENTS.GUEST_NOSHOW, { gostId: ds.gostId });
  } else if (arrivalResult.arrived) {
    emit(EVENTS.GUEST_ARRIVED, { gostId: ds.gostId });
  }
}

/**
 * Tick: proverava da li gost ima standout momenat
 * @param {number} elapsed
 * @param {string} format
 * @returns {boolean} true ako je standout triggerovan
 */
export function tickGuestStandout(elapsed, format) {
  const ds = getDashboardState();
  if (!ds || !ds.gostArrived || _standoutTriggered) return false;
  if (ds.gostId === 'g8') return false; // Solo nema standout

  const profile = getGostProfile(ds.gostId);
  if (!profile) return false;

  // Standout se javlja između 2-5 minuta (120-300s), random
  if (elapsed >= 120 && elapsed <= 300) {
    const chancePerTick = 0.001; // Oko 10% po 100 sekundi
    if (Math.random() < chancePerTick) {
      _standoutTriggered = true;
      updateDashboardState({ gostStandout: true });
      return true;
    }
  }

  return false;
}

/**
 * Generiše banter tekst (kad gost nema standout, ali je tu)
 * @param {string} gostId
 * @returns {string}
 */
export function getGuestBanter(gostId) {
  const banters = {
    g1: 'Domaćin priča o imanju — publika sluša pažljivo.',
    g2: 'DJ Susedo pušta novi track — chat se budi.',
    g3: 'DJ iz Grada komentariše scenu — hype raste.',
    g4: 'Kum priča seoske priče — YouTube retencija raste.',
    g5: 'Stručnjak objašnjava — komentari teku.',
    g6: 'Sused donosi domaću hranu — lajkovi.',
    g7: 'DJ Prvi Put nervozno priprema setu — publika napeta.',
    g8: 'Vodiš sam — fokus na produkciji.',
  };
  return banters[gostId] || 'Gost je tu. Emisija teče.';
}

/**
 * Klip fallback tekst (kad gost nije stigao)
 * @param {string} format
 * @returns {string}
 */
export function getNoShowFallback(format) {
  const fallbacks = {
    dj_lajv: 'Puštamo stare setove — publika čeka novi materijal.',
    podkast: 'Solo epizoda — priče sa imanja bez gosta.',
    vlog_uzivo: 'Vlog bez gosta — obilaziš imanje sam.',
  };
  return fallbacks[format] || 'Nastavljamo bez gosta.';
}

/**
 * Standout momenat detalji
 * @param {string} gostId
 * @returns {Object}
 */
export function getStandoutMoment(gostId) {
  const profile = getGostProfile(gostId);
  if (!profile) return null;
  return {
    gostId,
    note: profile.standoutNote || 'Gost oduševljava publiku.',
    engagementBoost: 0.3,
  };
}
