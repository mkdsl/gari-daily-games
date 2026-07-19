/** CTA copy, brand linkovi — Guncati/MKDSLend/Kluboslavija hooks */

export const BRAND_HOOKS = {
  guncati: {
    name: 'Guncati',
    tagline: 'Zabavni Radni Park',
    ctaText: 'Poseti Guncati',
    // [PROVERI SA ŠEFOM] — pravi URL
    ctaUrl: 'https://guncati.rs',
    shareTag: '#GuncatiTvizija',
    description: 'Imanje gde se radi, igra i uči. Masterclass. Permakultura.',
  },
  mkdslend: {
    name: 'MKDSLend',
    tagline: 'Krovni brand — Zabavni Radni Park',
    ctaText: 'Otkrij MKDSLend',
    // [PROVERI SA ŠEFOM]
    ctaUrl: 'https://mkdsl.rs',
    shareTag: '#MKDSLend',
    description: 'Gde tehnologija susreće prirodu.',
  },
  kluboslavija: {
    name: 'Kluboslavija',
    tagline: 'Turneja 2026',
    ctaText: 'Prati Turneju',
    // [PROVERI SA ŠEFOM]
    ctaUrl: 'https://kluboslavija.rs',
    shareTag: '#Kluboslavija2026',
    description: 'Avala, Štrand, Sarajevo, Guncati grand finale.',
    events: ['Avala 20.06', 'Štrand', 'Sarajevo', 'Guncati (finale)'],
  },
};

/**
 * Builduje share tekst sa brand hook-om
 * @param {string} brand - 'guncati'|'mkdslend'|'kluboslavija'
 * @param {string} customText
 * @returns {string}
 */
export function buildBrandShare(brand, customText) {
  const hook = BRAND_HOOKS[brand] || BRAND_HOOKS.guncati;
  return `${customText}\n\n${hook.shareTag} | ${hook.ctaText}: ${hook.ctaUrl}`;
}

/**
 * Vraća CTA HTML element (inline)
 * @param {string} brand
 * @returns {string} HTML string
 */
export function getBrandCtaHtml(brand) {
  const hook = BRAND_HOOKS[brand] || BRAND_HOOKS.guncati;
  return `<a href="${hook.ctaUrl}" target="_blank" rel="noopener" class="brand-cta">
    ${hook.ctaText} →
  </a>`;
}

/**
 * Outcome-based motivational kopija koja navodi na brand
 * @param {number} engagement 0-1
 * @param {string} brand
 * @returns {string}
 */
export function getOutcomeBrandCopy(engagement, brand) {
  const hook = BRAND_HOOKS[brand] || BRAND_HOOKS.guncati;
  if (engagement >= 0.75) {
    return `Odlična emisija! Ovakav sadržaj gradi ${hook.name}. ${hook.shareTag}`;
  } else if (engagement >= 0.5) {
    return `Solid emisija. Nastavi da gradiš ${hook.name} publiku. ${hook.shareTag}`;
  } else {
    return `Svaka emisija gradi ${hook.name} brand. Ne odustaj. ${hook.shareTag}`;
  }
}
