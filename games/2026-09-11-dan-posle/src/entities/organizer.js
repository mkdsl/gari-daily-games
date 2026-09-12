/**
 * organizer.js — Protagonist (ti, organizator) — profil, stanja, narativni identitet
 */

import { computeCS } from '../state.js';

/**
 * Organizatorov emotivni status na osnovu resursa
 * @param {GameState} state
 * @returns {{ label: string, description: string }}
 */
export function organizerMood(state) {
  const { energija, veze, secanja, nered } = state.resources;
  const cs = computeCS(state);

  if (energija <= 2) {
    return { label: 'Iscrpljen', description: 'Svaki korak je napor. Ali ideš dalje.' };
  }
  if (nered >= 8) {
    return { label: 'Preopterećen', description: 'Previše otvorenih petlji. Nešto mora da se zatvori.' };
  }
  if (veze >= 7) {
    return { label: 'Povezan', description: 'Osećaš da nisi sam u ovome.' };
  }
  if (secanja >= 6) {
    return { label: 'Prisutan', description: 'Ovaj dan ostaje.' };
  }
  if (cs >= 8) {
    return { label: 'Zadovoljan', description: 'Dobar dan. Pravi dobar dan.' };
  }
  return { label: 'U toku', description: 'Dan se odvija. Ti si tu.' };
}

/**
 * Kratki opis organizatora za ending/share
 * @param {GameState} state
 * @param {string} endingId
 * @returns {string}
 */
export function organizerEndingTag(state, endingId) {
  const tags = {
    zajednica: 'Nisi bio organizator. Bio si katalizator.',
    dobar:     'Odradio si dobar dan. To nije malo.',
    sledece:   'Nešto se završilo. Nešto počinje.',
    sagoreo:   'Dao si previše. Sledeći put — ostavi nešto i za sebe.'
  };
  return tags[endingId] || 'Dan je završen.';
}

/**
 * Inicijalna intro naracija
 */
export const INTRO_TEXT = `
Jutro je 07:00.

Festival na Guncati imanju je završen.
Sunce je tu, livada je ugažena, i ti si i dalje ovde.

Imaš 12 sati da zatvoriš dan — i odlučiš šta od juče gradi nešto, a šta nestaje.

Nisi sam. Ali na kraju — to je tvoja odluka.
`.trim();
