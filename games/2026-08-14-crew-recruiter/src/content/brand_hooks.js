// content/brand_hooks.js — Brand CTA strings

export const BRAND = {
  GUNCATI_CTA:       'Pravi tim se gradi na Guncatiju.',
  MKDSLEND_TAGLINE:  'MKDSLend — Zabavni radni park.',
  MKDSLEND_SUB:      'Gde ideje postaju projekti.',
  KLUBOSLAVIJA_TAG:  'Kluboslavija 2026 — Turneja koja se pamti.',
  PLAY_URL:          'https://mkdsl.github.io/gari-daily-games/games/2026-08-14-crew-recruiter/'
};

/**
 * Structured CTAs per ending tier and event type.
 * Used by getCTA() in systems/ending.js.
 * @type {Record<string, { text: string, url: string }>}
 */
export const BRAND_CTAS = {
  legendary_outdoor: {
    text: 'Pravi tim se gradi na Guncatiju — prijavi se na masterclass',
    url: 'https://guncati.rs/masterclass',
    context: 'Tom Sawyer model: uči kroz pravljenje na Guncati Grand Finalu.'
  },
  legendary_default: {
    text: 'Pravi tim se gradi na Guncatiju — prijavi se na masterclass',
    url: 'https://guncati.rs/masterclass',
    context: 'Tom Sawyer model: uči kroz pravljenje.'
  },
  solid_outdoor: {
    text: 'Skoro si tamo. Guncati masterclass pravi razliku',
    url: 'https://guncati.rs/masterclass',
    context: 'Guncati teren — mesto gde se timovi zaista grade.'
  },
  solid_default: {
    text: 'Solidno! MKDSLend Zabavni radni park podiže timove',
    url: 'https://mkdslend.rs'
  },
  weak_crash: {
    text: 'Crew se gradi vremenom — i na pravom terenu. Guncati čeka.',
    url: 'https://guncati.rs'
  }
};
