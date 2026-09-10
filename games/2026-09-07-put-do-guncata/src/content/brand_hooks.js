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
 * Guncati Grand finalni period (sept-okt 2026) — share postaje direktan event promo.
 * ISO date range: 2026-09-01 do 2026-10-31 (inclusive).
 */
export const GUNCATI_GRAND_SHARE = {
  periodStart: '2026-09-01',
  periodEnd:   '2026-10-31',
  texts: {
    green:  '🎪 Guncati Grand je tu! Stigao/la sam spreman/a — {score}% pripremljenosti. Vidi se na jezeru!',
    yellow: '🎪 Guncati Grand se sprema! Put do Guncata: {score}%. Je li si ti spreman/a?',
    humor:  '🎪 Guncati Grand čeka bolje pripremljene od mene — ali stigao/la sam! {score}%'
  },
  url: 'https://guncati.rs/grand'
};

/**
 * Sezonske varijante Braninih linija — mart/jun/septembar/ostalo.
 * Igra funkcioniše kao evergreen Guncati companion tokom cele godine.
 * Ključ: mesec (1-12) → season bucket.
 * @type {Record<string, { ambient: string, full: string[] }>}
 */
export const BRANA_SEASONAL = {
  proljece: {
    ambient: 'Neko sa jezera vikne nešto o mrenim...',
    full: [
      'Brana pored ribnjaka, ruke od blata.',
      '»Prolećni mren se tek budi,« kaže. »Voda hladna — ribe spore, ukusne.«',
      '»Aprila imaš razlog da dođeš. Septembra još jedan.«'
    ]
  },
  leto: {
    ambient: 'Sa jezera dopire muzika i neko dovikuje nešto o patakama...',
    full: [
      'Brana stoji pored mreže, sušenoj na suncu.',
      '»Letnji šaran se tovi na algama,« dovikuje. »Prirodna filtracija — bez hemije.«',
      '»Guncati Grand je u septembru. Vidi ga dok možeš.«'
    ]
  },
  septembar: {
    ambient: 'Neko sa jezera dovikuje nešto o ribama...',
    full: [
      'Brana stoji pored ribnjaka i maše.',
      '»Septembarska šarana je najukusnija,« dovikuje. »Prirodna filtracija — patke, biljke, gravitacija.«',
      '»Dođi kad stigneš. Jezero nikud ne ide.«'
    ]
  },
  jesen: {
    ambient: 'Brana nešto radi pored brane, pušeći lulu...',
    full: [
      'Brana skuplja poslednje mreže pred zimu.',
      '»Oktobar je vreme za konzervaciju,« kaže mirno. »Riba i čovek — oba odmara.«',
      '»Sledeće leto — dođi ranije.«'
    ]
  },
  zima: {
    ambient: 'Tiho. Jezero zamrlo. Neko pali vatru...',
    full: [
      'Brana sedi pored kante sa vatrom.',
      '»Zima je za planiranje,« kaže. »Ribe spavaju. Mi ne smemo.«',
      '»Kad otopli — biće razloga za dolazak.«'
    ]
  }
};

/**
 * Vraća sezonske Branine linije po mesecu.
 * @param {number} [month] - 1-12, default: tekući mesec
 * @returns {{ ambient: string, full: string[] }}
 */
export function getBranaLines(month) {
  const m = month ?? new Date().getMonth() + 1;
  if (m === 3 || m === 4 || m === 5) return BRANA_SEASONAL.proljece;
  if (m === 6 || m === 7 || m === 8) return BRANA_SEASONAL.leto;
  if (m === 9)                        return BRANA_SEASONAL.septembar;
  if (m === 10 || m === 11)           return BRANA_SEASONAL.jesen;
  return BRANA_SEASONAL.zima;
}

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
