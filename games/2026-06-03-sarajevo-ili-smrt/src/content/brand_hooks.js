// ============================================================
//  content/brand_hooks.js — Sarajevo ili Smrt
//  Avala CTA string-ovi, Kluboslavija overlay data, share copy.
// ============================================================

// ----------------------------------------------------------------
//  Avala CTA — visible on share card (D2+) and win screen
// ----------------------------------------------------------------
export const AVALA_CTA = {
  visible_text: '🏔 Avala — Kluboslavija turneja, Jun 20, 2026',
  button_text: 'Rezerviši kartu →',
  button_url: 'https://app.bilet.rs/show/261',
  small_print: 'Pravo Sarajevo čeka na Avali.',
  d2_unlocked_text: 'Avala CTA je sada vidljiv na share kartici. Brend radi za tebe.'
};

// ----------------------------------------------------------------
//  Season 1 complete message (shown on season_end if P2-eligible)
// ----------------------------------------------------------------
export const SEASON1_COMPLETE_MSG =
  'Preživio si Sarajevo. Avala turneja: Jun 20 →';

// ----------------------------------------------------------------
//  Win screen content
// ----------------------------------------------------------------
export const WIN_SCREEN = {
  title: 'Sarajevo ili Smrt — ti si preživio.',
  subtitle: 'Avala Headliner. Gari ti čuva termin.',
  body: `Tri mahale, dva prestige-a, jedan cilj — Avala.
Jun 20, 2026. Kluboslavija turneja. Bit ćeš tu.`,
  cta_text: 'Rezerviši ulaz →',
  cta_url: 'https://app.bilet.rs/show/261',
  share_prompt: 'Podijeli rezultat i pozovi ekipu:'
};

// ----------------------------------------------------------------
//  Share card strings
// ----------------------------------------------------------------
export const SHARE_HASHTAGS = '#Kluboslavija #SarajevoIliSmrt #GariDailyGames';

export const SHARE_COPY = {
  default: 'Prošao sam Sarajevo. Ko je sljedeći?',
  legend: 'Legenda noći u Sarajevu! 🏆',
  prestige: 'Prestige I — Džabe-Konekti aktivirani. Opet na start.',
  win: 'Avala Headliner! Vidimo se Jun 20. 🏔',
  daily: 'Daily challenge — Sarajevo moja norma.'
};

// ----------------------------------------------------------------
//  Kluboslavija brand overlay (shown during Win screen + share)
// ----------------------------------------------------------------
export const KLUBOSLAVIJA_BRAND = {
  logo_text: 'KLUBOSLAVIJA',
  tagline: 'Turneja 2026',
  color: '#FF3366',
  dates: [
    { city: 'Avala',    date: 'Jun 20' },
    { city: 'Štrand',   date: 'Jul' },
    { city: 'Guncati',  date: 'Finale' }
  ]
};

// ----------------------------------------------------------------
//  Interstitial ad hook (shown after prestige, non-intrusive)
// ----------------------------------------------------------------
export const PRESTIGE_AD = {
  text: 'Gari Daily Games × Kluboslavija. Naredna igra izlazi sutra.',
  cta: 'Prati @mkdsl →',
  url: 'https://mkdsl.github.io/gari-daily-games/'
};
