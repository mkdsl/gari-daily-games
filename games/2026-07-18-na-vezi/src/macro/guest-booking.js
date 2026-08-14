/** Gost izbor, reliability-aware no-show preview */
import { GOST_ROSTER, getGostProfile, calcNoShowChance, getCompatibleGuests } from '../content/gost-roster.js';
import { getState } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { updateDraftPlan, getDraftPlan } from './planning-session.js';

/**
 * Vraća listu gostiju sa preview no-show šansama
 * @param {string} format - trenutno odabrani format
 * @returns {Array}
 */
export function getGuestBookingOptions(format) {
  const state = getState();
  const compatible = getCompatibleGuests(format);

  return compatible.map(g => {
    const profile = getGostProfile(g.id);
    if (!profile) return null;
    const noShowChance = calcNoShowChance(profile);
    const bookingHistory = state.guest_bookings[g.id] || 0;
    return {
      ...profile,
      noShowChance,
      noShowPct: Math.round(noShowChance * 100),
      bookingHistory,
      recommended: noShowChance < 0.12 && (profile.engagementBonus || 0) > 0.05,
    };
  }).filter(Boolean);
}

/**
 * Bira gosta
 * @param {string} gostId
 * @returns {{ ok: boolean }}
 */
export function bookGuest(gostId) {
  updateDraftPlan({ chosen_guest_id: gostId });
  emit(EVENTS.GUEST_BOOKED, { gostId });
  return { ok: true };
}

/**
 * Preview: koliki engagement boost donosi gost
 * @param {string} gostId
 * @param {string} format
 * @returns {{ low: number, high: number }}
 */
export function previewGuestEngagement(gostId, format) {
  const profile = getGostProfile(gostId);
  if (!profile || profile.isSolo) return { low: 0, high: 0 };
  const base = profile.formatBonus?.[format] ?? profile.engagementBonus;
  return {
    low: Math.round(base * 100),
    high: Math.round(base * 1.4 * 100), // standout case
  };
}

/**
 * Vraća profil izabranog gosta iz drafta
 */
export function getSelectedGuest() {
  const draft = getDraftPlan();
  if (!draft?.chosen_guest_id) return null;
  return getGostProfile(draft.chosen_guest_id);
}

/**
 * Formatira reliability kao tekst + boja hint
 * @param {number} reliability 0-100
 * @returns {{ text: string, color: string }}
 */
export function formatReliability(reliability) {
  if (reliability >= 80) return { text: 'Pouzdan', color: 'var(--color-crt)' };
  if (reliability >= 60) return { text: 'Solidan', color: 'var(--color-signal)' };
  if (reliability >= 40) return { text: 'Rizičan', color: 'var(--color-warn)' };
  return { text: 'Nepouzdan', color: 'var(--color-critical)' };
}
