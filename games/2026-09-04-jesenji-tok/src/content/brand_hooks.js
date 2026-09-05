/**
 * @module brand_hooks
 * Brand configuration for Guncati and Kluboslavija.
 * Share card texts, CTAs, and event links.
 */

/**
 * Brand configuration object
 */
export const BRAND = {
  guncati_cta: 'Guncati Jesenji Masterclass — nauči planiranje imanja uživo',
  guncati_url: 'https://guncati.rs',
  guncati_tagline: 'Povratak na selo — aktivno, pametno, zajednički.',
  guncati_logo_emoji: '🌿',

  kluboslavija_event: 'Jesenji event Kluboslavija',
  kluboslavija_url: 'https://kluboslavija.rs',
  kluboslavija_tagline: 'Turneja 2026 — muzika, zemlja, zajednica.',
  kluboslavija_logo_emoji: '🎵',

  mkdslend_name: 'MKDSLend',
  mkdslend_tagline: 'Zabavni radni park',
  mkdslend_url: 'https://mkdslend.rs',

  /**
   * Build share text from score result
   * @param {string} rang - rank label
   * @param {number} score - numerical score
   * @param {string} weatherName - weather preset name
   * @returns {string}
   */
  share_text(rang, score, weatherName) {
    return `Moja jesenja sezona: ${rang} (${score} poena) 🌾 | Vreme: ${weatherName} | Igraj na Guncati Jesenji Tok`;
  },

  /**
   * Share URL for the game
   */
  share_url: 'https://mkdsl.github.io/gari-daily-games/games/2026-09-04-jesenji-tok/',

  /**
   * Hashtags for social media sharing
   */
  hashtags: ['#Guncati', '#JesenjiTok', '#Kluboslavija', '#MKDSLend'],
};

/**
 * Footer CTAs shown on the score screen
 * @type {Array<{label: string, url: string, emoji: string, primary: boolean}>}
 */
export const SCORE_CTAS = [
  {
    label: 'Guncati Masterclass',
    url: BRAND.guncati_url,
    emoji: '🌿',
    primary: true,
  },
  {
    label: 'Kluboslavija Turneja',
    url: BRAND.kluboslavija_url,
    emoji: '🎵',
    primary: false,
  },
];

/**
 * Educational content link shown after scoring
 * @type {{label: string, url: string}}
 */
export const EDU_LINK = {
  label: 'Nauči više o sezonskom planiranju imanja',
  url: BRAND.guncati_url,
};
