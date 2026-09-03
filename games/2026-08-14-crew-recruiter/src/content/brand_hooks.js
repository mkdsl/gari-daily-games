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
    text: 'Crew savršen za Guncati Grand — masterclass prijave: guncati.rs',
    url: 'https://guncati.rs'
  },
  legendary_default: {
    text: 'Pravi tim, pravi prostor. Guncati masterclass čeka — guncati.rs',
    url: 'https://guncati.rs'
  },
  solid_outdoor: {
    text: 'Skoro si tamo. Guncati teren pravi razliku — guncati.rs',
    url: 'https://guncati.rs'
  },
  solid_default: {
    text: 'Solidno! MKDSLend Zabavni radni park podiže timove — mkdslend.rs',
    url: 'https://mkdslend.rs'
  },
  weak_crash: {
    text: 'Crew se gradi vremenom — i na pravom terenu. Guncati čeka.',
    url: 'https://guncati.rs'
  }
};
