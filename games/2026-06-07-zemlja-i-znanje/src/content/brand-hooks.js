/**
 * brand-hooks.js — Guncati i MKDSLend brand integracija
 */

export const BRAND = {
  name: 'Guncati',
  tagline: 'Živa škola prirodnih zanata',
  link: 'https://guncati.rs',
  cta: 'Ovo nije samo igra — Guncati radi ovo u stvarnosti. Javi se.',
  cta_short: 'Poseti Guncati →',
  mkdslend_secret: 'Zabavni radni park — MKDSLend model u akciji.',
  mkdslend_link: 'https://mkdslend.rs',

  // Shown na season end screen
  season_end_message: 'Svaka sezona u igri odgovara pravom masterclass-u na Guncati imanju.',

  // Shown u pauzi
  pause_message: 'Guncati organizuje prave masterclass sesije. Zemlja i alat čekaju.',

  // Shown na prestiž
  prestige_message: 'Reputacija raste sa svakim ciklusom — kao i na pravom imanju.',

  // Shown na achievement "Živo Učilište"
  living_school_message: '1000 reputacije. U igri si dostigao ono što Guncati gradi u stvarnosti: živu školu.'
};

/**
 * Vraca poruku za kontekst
 * @param {'season_end'|'pause'|'prestige'|'living_school'} context
 */
export function getBrandMessage(context) {
  const msgs = {
    season_end:    BRAND.season_end_message,
    pause:         BRAND.pause_message,
    prestige:      BRAND.prestige_message,
    living_school: BRAND.living_school_message
  };
  return msgs[context] || BRAND.cta;
}

/**
 * HTML link element za brand display
 * @param {'small'|'full'} style
 */
export function getBrandLinkHTML(style = 'small') {
  if (style === 'full') {
    return `<div class="brand-hook">
      <span class="brand-tagline">${BRAND.tagline}</span>
      <a href="${BRAND.link}" target="_blank" rel="noopener" class="brand-link">${BRAND.cta_short}</a>
    </div>`;
  }
  return `<a href="${BRAND.link}" target="_blank" rel="noopener" class="brand-link-small">${BRAND.tagline} • ${BRAND.cta_short}</a>`;
}
