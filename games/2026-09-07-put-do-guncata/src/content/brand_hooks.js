/**
 * brand_hooks.js — Guncati × Kluboslavija brand sadržaj
 * Branine akvakulturne linije, Guncati Grand crosslink copy
 */

/** Kratki ambient poziv sa jezera — prikazuje se na svim rutama */
export const BRANA_AMBIENT = 'Neko sa jezera dovikuje nešto o ribama...';

/** Puna Branina scena — samo za 'slikovitije' rutu */
export const BRANA_FULL = [
  'Brana stoji pored ribnjaka i maše.',
  '»Septembarska šarana je najukusnija,« dovikuje. »Prirodna filtracija — patke, biljke, gravitacija.«',
  '»Dođi kad stigneš. Jezero nikud ne ide.«'
];

/** Link ka Guncati Grand igri */
export const GUNCATI_GRAND_LINK =
  'https://mkdsl.github.io/gari-daily-games/games/2026-07-26-guncati-grand/';

/** CTA tekst za Guncati Grand */
export const GUNCATI_GRAND_CTA = 'Odigraj Guncati Grand →';

/** Play URL ove igre (za share card i canonical ref) */
export const PLAY_URL =
  'https://mkdsl.github.io/gari-daily-games/games/2026-09-07-put-do-guncata/';

/**
 * Kratki opisi brend-specifičnih lokacija koje igrač prolazi.
 * Koriste se u dialogues.js i scene overlay-u.
 */
export const LOCATION_HOOKS = {
  beogradPolazak: {
    label: 'Beograd, 06:42',
    subtext: 'Grad još spava. Oprema u kamionu, set u glavi.'
  },
  autoputE75: {
    label: 'E75, sever Srbije',
    subtext: 'Ravnica, kamioni, jutro.'
  },
  seoska_raskrsnica: {
    label: 'Negde između',
    subtext: 'Tri table. Jedna odluka.'
  },
  guncati_ulaz: {
    label: 'Guncati',
    subtext: 'Jezero blista. Brana maše.'
  }
};

/**
 * Kluboslavija brand tagline za share card
 */
export const KLUBOSLAVIJA_TAGLINE = 'Turneja 2026 — na putu ka Guncatiju';

/**
 * Sezonski kontekst (septembar — Guncati Grand Finale)
 */
export const SEASONAL_CONTEXT = {
  event: 'Guncati Grand Finale',
  month: 'septembar',
  teaser: 'Grand finale turneja čeka — a ti si tek stigao.'
};

/**
 * Masterclass CTA per score bucket — celogodišnji Guncati funnel
 */
export const MASTERCLASS_CTA = {
  green: {
    text: 'Pripremi se za pravo putovanje — Guncati Masterclass →',
    url: 'https://guncati.rs/masterclass',
    label: 'Masterclass prijava'
  },
  yellow: {
    text: 'Sledeći put — bolje spreman. Guncati Masterclass →',
    url: 'https://guncati.rs/masterclass',
    label: 'Masterclass prijava'
  },
  humor: {
    text: 'Možda masterclass pomaže? Guncati te čeka →',
    url: 'https://guncati.rs/masterclass',
    label: 'Masterclass prijava'
  }
};
