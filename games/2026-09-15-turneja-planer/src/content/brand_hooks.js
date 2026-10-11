/** @module content/brand_hooks — Kluboslavija/Guncati/MKDSLend copy, highlight lines */

/**
 * @typedef {Object} BrandHook
 * @property {string} brand
 * @property {string[]} taglines
 * @property {string[]} cta_lines
 * @property {string} color
 */

/** @type {BrandHook[]} */
export const BRAND_HOOKS = [
  {
    brand: 'kluboslavija',
    taglines: [
      'Kluboslavija 2026 Turneja — 5 gradova, 1 misija.',
      'Organizuj stvarnu turneju. Igraj Turneja Planer.',
      'Svaki grad ima svoju energiju. Planiraš ti.',
    ],
    cta_lines: [
      '🎵 Klupboslavija Turneja 2026 — avala 20.06, Štrand, Sarajevo, Guncati grand finale',
      'Probaj rutu koja ti donosi max reputaciju',
      'Share tvoj result i tag @kluboslavija',
    ],
    color: '#E63946',
  },
  {
    brand: 'guncati',
    taglines: [
      'Guncati — Tom Sawyer model. Povratak na selo.',
      'Grand finale turneje uvek završava u Šumadiji.',
      'MKDSLend Guncati: permakultura + bass = budućnost.',
    ],
    cta_lines: [
      '🌿 Guncati imanje — open air na livadi, zvuk u šumi',
      'Reputation gate ≥ 6.0 — zasluženo, ne poklonjeno',
      'Dođi na pravi Guncati event',
    ],
    color: '#52B788',
  },
  {
    brand: 'mkdslend',
    taglines: [
      'MKDSLend — Zabavni radni park.',
      'Kreativnost, zajednica, prostor za stvaranje.',
      'Svaka igra je MKDSLend iskustvo.',
    ],
    cta_lines: [
      '🏗️ MKDSLend — gde se grade ideje',
      'Turneja Planer je MKDSLend proizvod',
      'Sledi nas za sledeću igru iz Gari Daily Games',
    ],
    color: '#A8DADC',
  },
];

/** @type {Map<string, BrandHook>} */
export const BRAND_MAP = new Map(BRAND_HOOKS.map(b => [b.brand, b]));

/**
 * Get a random brand tagline for display
 * @param {string} brand_id
 * @returns {string}
 */
export function getBrandTagline(brand_id) {
  const hook = BRAND_MAP.get(brand_id);
  if (!hook) return '';
  const t = hook.taglines;
  return t[Math.floor(Math.random() * t.length)];
}

/**
 * Get share CTA line for ending screen
 * @param {string} brand_id
 * @returns {string}
 */
export function getBrandCTA(brand_id) {
  const hook = BRAND_MAP.get(brand_id);
  if (!hook) return '';
  const c = hook.cta_lines;
  return c[Math.floor(Math.random() * c.length)];
}

/**
 * Ending screen brand blocks (all brands)
 * @param {string} ending_id
 * @returns {string[]}
 */
export function getEndingBrandLines(ending_id) {
  const lines = [];
  if (ending_id === 'TURNEJA_LEGENDA' || ending_id === 'ZAVRSENO_I_PLACENO') {
    lines.push('🎵 ' + getBrandTagline('kluboslavija'));
    lines.push('🌿 ' + getBrandTagline('guncati'));
  }
  lines.push('🏗️ ' + getBrandTagline('mkdslend'));
  return lines;
}

/** City-specific Kluboslavija dates — Turneja 2026 */
export const KLUBOSLAVIJA_DATES = {
  beograd:  { label: 'Avala', date: '20. jun' },
  novi_sad: { label: 'Štrand Fest', date: '12. jul' },
  nis:      null,
  sarajevo: { label: 'Sarajevo Stop', date: '2. avg' },
  guncati:  { label: 'Grand Finale', date: '6. sep' },
};

/** Display names per city */
const CITY_DISPLAY = {
  beograd:  'Beogradu',
  novi_sad: 'Novom Sadu',
  nis:      'Nišu',
  sarajevo: 'Sarajevu',
  guncati:  'Guncatima',
};

/**
 * Get Kluboslavija live-event callout for city result screen
 * @param {string} city_id
 * @param {number} reputation
 * @returns {string|null} callout line or null if no event / rep too low
 */
export function getLiveEventCallout(city_id, reputation) {
  if (reputation < 6) return null;
  const ev = KLUBOSLAVIJA_DATES[city_id];
  if (!ev) return null;
  const city = CITY_DISPLAY[city_id] || city_id;
  return `🎪 Kluboslavija dolazi u ${city} — ${ev.label}, ${ev.date}. Stvarni datum, stvarni šou.`;
}
