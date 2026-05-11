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
    tagline: 'Tvoj pocetak nije ni jedan od ova tri.',
    long: 'Izaberi put ispod. Svaki nosi drugi teret i drugi dar.',
    icon: 'edit'
  },
  bogata_deca: {
    label: 'Bogata deca',
    short: 'Privilegija',
    tagline: 'Imas pristup pre nego sto si trazio.',
    long: 'Pitanje je da li te scena prihvata. Autenticnost se dokazuje, ne kupuje.',
    icon: 'briefcase'
  },
  radnicka_klasa: {
    label: 'Radnicka klasa',
    short: 'Šljakanje',
    tagline: 'Posao prvo. Sta ostane, to je tvoje.',
    long: 'Manje vremena, manje para. Sve sto stignes nosi tezinu.',
    icon: 'tool'
  },
  posthumna_penzija: {
    label: 'Posthumna penzija + faks',
    short: 'Tikajuci budilnik',
    tagline: 'Imas vremena. Pitanje je da li previse.',
    long: 'Podrska je tu sad. Faks krece. Vec si na ivici monomania.',
    icon: 'clock'
  }
};

// Onboarding text (Dule Korekcija 2 — Mile sekcija 5.5)
export const CLASS_INTRO_TEXT =
  'Tvoj origin nije presuda. Sve klase imaju puteve do finala. Razliciti tempovi, ne razliciti ishodi.';
