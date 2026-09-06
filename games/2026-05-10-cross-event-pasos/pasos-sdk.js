/**
 * pasos-sdk.js — Kluboslavija Pasoš SDK
 * GDG 2026 | v1.0
 *
 * Koristi ovaj modul u svakoj novoj GDG igri za automatsko upisivanje pečata.
 *
 * Primer:
 *   import { utisniPecat } from '../2026-05-10-cross-event-pasos/pasos-sdk.js';
 *   const result = utisniPecat('avala-run', { score: 4200 });
 *   if (result.success) { showPassportBanner(); }
 */

/** Kanonski slug whitelist — dodaj novi slug pri svakoj novoj igri */
export const SLUG_WHITELIST = [
  'avala-run',          // 2026-05-06, Avala Run (Endless Runner)
  'aforizam-generator', // 2026-05-08, Aforizam Generator (Generative text toy)
  'dj-za-pultom',       // 2026-05-09, DJ za Pultom (Idle/Incremental)
  'jesenji-tok',          // 2026-09-04, Jesenji Tok (Seasonal Scheduling Puzzle)
  // --- Dodaj sledeće slug-ove ovde ---
];

const SDK_VERSION = '1.0';
const STORAGE_PREFIX = 'pasos_stamp_';

/**
 * Utisni pečat u pasoš korisnika.
 *
 * @param {string} slug - Kanonski slug iz SLUG_WHITELIST
 * @param {Object} [options]
 * @param {number} [options.score] - Score postignut u igri (opciono)
 * @param {number} [options.level] - Level dostignut (opciono)
 * @param {string} [options.date] - ISO datum (default: today)
 * @returns {{ success: boolean, error?: string }}
 */
export function utisniPecat(slug, options = {}) {
  // Validacija slug-a
  if (!SLUG_WHITELIST.includes(slug)) {
    console.warn(`[pasos-sdk] UNKNOWN_SLUG: ${slug}`);
    return { success: false, error: `UNKNOWN_SLUG: ${slug}` };
  }

  // Provjeri je li već utisnut
  const existing = _safeGet(STORAGE_PREFIX + slug);
  if (existing && existing.claimed) {
    console.warn(`[pasos-sdk] ALREADY_CLAIMED: ${slug}`);
    return { success: false, error: `ALREADY_CLAIMED: ${slug}` };
  }

  // Kreiraj zapis
  const record = {
    slug,
    claimed: true,
    method: 'auto',
    date: options.date || new Date().toISOString().slice(0, 10),
    score: options.score ?? null,
    level: options.level ?? null,
    sdk_version: SDK_VERSION,
  };

  const saved = _safeSet(STORAGE_PREFIX + slug, record);
  if (!saved) {
    return { success: false, error: 'STORAGE_UNAVAILABLE' };
  }

  return { success: true };
}

/**
 * Provjeri da li korisnik ima određeni pečat.
 *
 * @param {string} slug
 * @returns {boolean}
 */
export function imaPecat(slug) {
  const record = _safeGet(STORAGE_PREFIX + slug);
  return !!(record && record.claimed);
}

/**
 * Provjeri da li je korisnik GDG Crew Member (7 pečata dostignuto).
 *
 * @returns {boolean}
 */
export function getCrew() {
  try {
    return localStorage.getItem('gdg_crew_member') === 'true';
  } catch {
    return false;
  }
}

// --- Interni helperi ---

function _safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
