// =============================================================================
// data/classes.js — Class background templates (UI labels + narrative copy)
// =============================================================================
// Brojevi i mehanika u config.js CLASS_MODIFIERS. Ovde samo narrative + UI.

export const CLASSES_UI_ORDER = [
  'custom',              // Custom DEFAULT (Dule Korekcija 2 — gore na ekranu)
  'bogata_deca',
  'radnicka_klasa',
  'posthumna_penzija'
];

export const CLASS_UI = {
  custom: {
    label: 'Tvoja prica',
    short: 'Custom',
    tagline: 'Napisi je svojim recima. Sistem ce aproksimirati.',
    long: 'Default origin. Tvoja prica nije ni jedna od ova tri. Sistem cita keywords i raspodeljuje stat-ove. Ako si nesiguran, probaj ovo prvo.',
    icon: 'edit'
  },
  bogata_deca: {
    label: 'Bogata deca',
    short: 'Privilegija',
    tagline: 'Roditeljska subvencija, oprema, mentorske sesije.',
    long: 'Imas pristup. Pitanje je da li te scene prihvata kao jednog od svojih. Underground autenticnost je dokazivanje, ne preuzimanje.',
    icon: 'briefcase'
  },
  radnicka_klasa: {
    label: 'Radnicka klasa',
    short: 'Šljakanje',
    tagline: 'Drugi posao prvo. Šta ostane vremena, to je tvoje.',
    long: 'Manje vremena, manje novca. Ali sve sto stignes da uradis ima vise tezine. Music dev efikasnost ti je vise — radis teze, vidi te.',
    icon: 'tool'
  },
  posthumna_penzija: {
    label: 'Posthumna penzija + faks',
    short: 'Tikajuci budilnik',
    tagline: 'Imas vremena. Pitanje je da li ti je previse.',
    long: 'Penzija/porodicna podrska je tu sad. Faks tek krece. Vec si na monomania pragu — to ti je prednost i opasnost.',
    icon: 'clock'
  }
};

// Onboarding text (Dule Korekcija 2 — Mile sekcija 5.5)
export const CLASS_INTRO_TEXT =
  'Tvoj origin nije presuda. Sve klase imaju puteve do finala. Razliciti tempovi, ne razliciti ishodi.';
