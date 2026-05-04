// src/profile.js — Profil sudnika template sistem (GDD §8)
// 25 template rečenica, 4 ose analize, closest-match algoritam.

import { PROFILE_TEMPLATES } from './config.js';

export { PROFILE_TEMPLATES };

/**
 * Izračunava kategoriju Strogosti na osnovu stats (GDD §8).
 * @param {Object} stats — state.stats
 * @returns {'milostiv'|'umeren'|'strog'|'nemilosrdan'}
 */
export function calcStrogostCategory(stats) {
  const pct = (stats.totalGuilty / 10) * 100;
  if (pct <= 30) return 'milostiv';
  if (pct <= 60) return 'umeren';
  if (pct <= 80) return 'strog';
  return 'nemilosrdan';
}

/**
 * Izračunava kategoriju Klasnog biasa (GDD §8).
 * @param {Object} stats — state.stats
 * @returns {'favorizuje_bogate'|'neutralan_klasa'|'kaznio_bogate'}
 */
export function calcKlasniCategory(stats) {
  const delta = (stats.guiltyByWealth.bogat ?? 0) - (stats.guiltyByWealth.siromasan ?? 0);
  if (delta <= -2) return 'favorizuje_bogate';
  if (delta >= +2) return 'kaznio_bogate';
  return 'neutralan_klasa';
}

/**
 * Izračunava kategoriju Starosnog biasa (GDD §8).
 * @param {Object} stats — state.stats
 * @returns {'strog_prema_starima'|'neutralan_starost'|'strog_prema_mladima'}
 */
export function calcStarosniCategory(stats) {
  const delta = (stats.guiltyByAge.mlad ?? 0) - (stats.guiltyByAge.star ?? 0);
  if (delta <= -2) return 'strog_prema_starima';
  if (delta >= +2) return 'strog_prema_mladima';
  return 'neutralan_starost';
}

/**
 * Izračunava kategoriju Recidivizma (GDD §8).
 * @param {Object} stats — state.stats
 * @returns {'bez_milosti_prema_recidivistima'|'neutralan_recidiv'|'veruje_u_rehabilitaciju'}
 */
export function calcRecidivCategory(stats) {
  const delta = (stats.guiltyRecidivists ?? 0) - (stats.freeRecidivists ?? 0);
  if (delta >= +2) return 'bez_milosti_prema_recidivistima';
  if (delta <= -2) return 'veruje_u_rehabilitaciju';
  return 'neutralan_recidiv';
}

/**
 * Bira najbliži profile template na osnovu stats (GDD §8 closest-match algoritam).
 * Score = broj osa koje se poklapaju (0–4). Uvek vraća nešto.
 *
 * @param {Object} stats — state.stats
 * @returns {Object} Najbliži PROFILE_TEMPLATES element
 */
export function selectProfileTemplate(stats) {
  const strogost = calcStrogostCategory(stats);
  const klasni   = calcKlasniCategory(stats);
  const starosni = calcStarosniCategory(stats);
  const recidiv  = calcRecidivCategory(stats);

  let best      = PROFILE_TEMPLATES[0];
  let bestScore = -1;

  for (const t of PROFILE_TEMPLATES) {
    let score = 0;
    if (t.strogost === strogost) score++;
    if (t.klasni   === klasni)   score++;
    if (t.starosni === starosni) score++;
    if (t.recidiv  === recidiv)  score++;
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }

  return best;
}

/**
 * Gradi clipboard tekst za PODELI dugme (GDD §10).
 * @param {Object} state — game state
 * @param {Object} profileTemplate — izabrani template
 * @returns {string}
 */
export function buildShareText(state, profileTemplate) {
  const totalCases = state.session?.totalCases ?? 10;
  const guiltyPct  = Math.round((state.stats.totalGuilty / totalCases) * 100);
  return [
    `"${profileTemplate.text}"`,
    `— Sudnik: Tribunal of Cards | Slučajevi: ${totalCases} | Kriv: ${guiltyPct}% | Masa: ${state.resources.masa} | Vlast: ${state.resources.vlast}`,
    'https://mkdsl.github.io/gari-daily-games/'
  ].join('\n');
}
