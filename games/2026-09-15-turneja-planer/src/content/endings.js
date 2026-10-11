/** @module content/endings — 4 ending narratives + prestige msgs */

/**
 * @typedef {Object} Ending
 * @property {string} id
 * @property {string} title
 * @property {string} emoji
 * @property {string} narrative
 * @property {string} prestige_msg
 * @property {string} color
 * @property {boolean} can_prestige
 */

/** @type {Record<string, Ending>} */
export const ENDINGS = {
  TURNEJA_LEGENDA: {
    id: 'TURNEJA_LEGENDA',
    title: 'TURNEJA LEGENDA',
    emoji: '🏆',
    color: '#FFD700',
    can_prestige: true,
    narrative: `Guncati grand finale. Dok bass udara kroz Šumadiju, ti stojis i gledaš
publiku koja peva tvoje pesme. Dosao si do kraja. Budžet pozitivan.
Reputacija u nebesa. Reach koji je regionalni fenomen.

Klub od Beograda do Sarajeva peva tvoje ime. Kluboslavija je sada više od
turneje — to je pokret. Guncati imanje vibrira, a Marko DJ gleda te s
poštovanjem koje retko daje.

Sledeće sezone — Budimpeštša? Istanbul? Svejo jedno.
Legenda ne staje.`,
    prestige_msg: 'Sezona završena kao LEGENDA. Fan baza raste. Sledeći run — viši cilj.',
  },

  ZAVRSENO_I_PLACENO: {
    id: 'ZAVRSENO_I_PLACENO',
    title: 'ZAVRŠENO I PLAĆENO',
    emoji: '✅',
    color: '#52B788',
    can_prestige: true,
    narrative: `Guncati pod zvezdama. Nije bilo savršeno — ali si stigao.
Kredit banka je pozitivan. Crew je umoran ali plakćen.
Publika je bila zadovoljna u svakom gradu.

To je posao. Ne mora svaka turneja biti legenda.
Sledeće sezone — učis iz ove. Šta bi drugačije?

Marko DJ već šalje poruke za sledeći ugovor.`,
    prestige_msg: 'Solidan run. Fan DB raste. Sledeći run sa bonus promo efikasnošću.',
  },

  POREZ_I_DUG: {
    id: 'POREZ_I_DUG',
    title: 'POREZ I DUG',
    emoji: '💸',
    color: '#E63946',
    can_prestige: true,
    narrative: `Guncati finale. Zvuci dobri. Publika srećna. Ali kad otvoriš banking app —
minus. Crew čeka plate. Venue hoće ostatak.
Ti čekaš da neko plati gas za povratak.

Ovo je bio rizičan rok i n'si prošao. Ali —
svaki iskusan promoter ima bar jednu katastrofičnu turneju.
Tvoja je iza tebe. Sledeća — pametnije.`,
    prestige_msg: 'Teška lekcija. Fan DB raste pomalko. Sledeći run — budžet disciplina.',
  },

  GUNCATI_ZATVOREN: {
    id: 'GUNCATI_ZATVOREN',
    title: 'GUNCATI ZATVOREN',
    emoji: '🚧',
    color: '#F77F00',
    can_prestige: false,
    narrative: `Stigli ste pred Guncati. Ali organizatori su proverili tvoje reference.
Reputacija ispod 6 — ulaz odbijen. Grand finale bez vas.

Crew sedi u kombiju, tišina. Marko gleda kroz prozor.
Ovo nije kraj — ali jeste poraz koji boli.

Sledeće sezone — reputacija se gradi pre turneje, ne tokom.`,
    prestige_msg: null,
  },
};

/**
 * Evaluate which ending the player gets
 * @param {{ budget: number, reputation: number, reach: number }} state
 * @returns {string} ending ID
 */
export function evaluateEnding(state) {
  if (state.reputation < 6.0) return 'GUNCATI_ZATVOREN';
  if (state.budget > 2000 && state.reputation >= 9.0 && state.reach >= 40) return 'TURNEJA_LEGENDA';
  if (state.budget > 500 && state.reputation >= 6.0) return 'ZAVRSENO_I_PLACENO';
  if (state.budget <= 0) return 'POREZ_I_DUG';
  if (state.budget > 0 && state.budget <= 500) return 'ZAVRSENO_I_PLACENO';
  return 'POREZ_I_DUG';
}

/**
 * Get ending object
 * @param {string} id
 * @returns {Ending}
 */
export function getEnding(id) {
  return ENDINGS[id] || ENDINGS.ZAVRSENO_I_PLACENO;
}

/**
 * Diagnose why GUNCATI_ZATVOREN happened and return a variant narrative.
 * @param {{ city_results: Array<{crowd_quality: number}>, resources: { crew_mood: number, budget: number } }} state
 * @returns {string} extra narrative line
 */
export function getGuncatiDiagnosis(state) {
  const results = state.city_results || [];
  const avgCQ = results.length
    ? results.reduce((s, r) => s + (r.crowd_quality || 5), 0) / results.length
    : 5;
  const mood = state.resources?.crew_mood ?? 5;
  const budget = state.resources?.budget ?? 500;

  if (mood <= 3 || budget < 200) {
    return 'Nisu došli glasni. Atmosfera ne laže — squeezovao/la si crew do granice i Guncati je to video.';
  }
  if (avgCQ < 5) {
    return 'Publika se pričala. Vijesti su male — loša crowd quality putuje do Guncata pre tebe.';
  }
  return 'Prilagodio/la si se svima. Guncati ne traži prilagodljive — traži ljude sa stavom.';
}

/**
 * Section label for "što si propustio" — null on wins (no regrets needed)
 * @param {string} id
 * @returns {string|null}
 */
export function getMissedLabel(id) {
  return id === 'TURNEJA_LEGENDA' ? null : 'Što si propustio:';
}

/**
 * Personalized cliffhanger line for ZAVRSENO_I_PLACENO ending.
 * Shows how close/far player was from TURNEJA_LEGENDA.
 * @param {{ budget: number, reputation: number, reach: number }} resources
 * @returns {string}
 */
export function getZavrsenaCliffhanger(resources) {
  const { budget, reputation, reach } = resources;
  const budgetGap = Math.max(0, 2001 - budget);
  const repGap = parseFloat(Math.max(0, 9.0 - reputation).toFixed(1));
  const reachGap = Math.max(0, 40 - reach);

  const gaps = [];
  if (budgetGap > 0) gaps.push(`${budgetGap} EUR`);
  if (repGap > 0) gaps.push(`${repGap} rep`);
  if (reachGap > 0) gaps.push(`${Math.round(reachGap)}k reach`);

  if (gaps.length === 0) return 'Solidno. Nisi legenda, ali si platio račune.';

  const close = budgetGap < 300 && repGap < 1.0 && reachGap < 5;
  if (close) {
    return `Falilo ti je ${gaps.join(' i ')}. Jedna sezona više. Sledeća?`;
  }
  return `Do Legende: ${gaps.join(', ')}. Solidno. Nisi legenda, ali si platio račune.`;
}
