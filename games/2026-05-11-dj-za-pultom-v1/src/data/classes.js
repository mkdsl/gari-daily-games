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
    label: 'Tvoja priča',
    short: 'Custom',
    tagline: 'Tvoj početak nije ni jedan od ova tri.',
    long: 'Izaberi put ispod. Svaki nosi drugi teret i drugi dar.',
    icon: 'edit'
  },
  bogata_deca: {
    label: 'Bogata deca',
    short: 'Privilegija',
    tagline: 'Imaš pristup pre nego što si tražio.',
    long: 'Pitanje je da li te scena prihvata. Autentičnost se dokazuje, ne kupuje.',
    icon: 'briefcase'
  },
  radnicka_klasa: {
    label: 'Radnička klasa',
    short: 'Šljakanje',
    tagline: 'Posao prvo. Šta ostane, to je tvoje.',
    long: 'Manje vremena, manje para. Sve što stigneš nosi težinu.',
    icon: 'tool'
  },
  posthumna_penzija: {
    label: 'Posthumna penzija + faks',
    short: 'Kucajući budilnik',
    tagline: 'Imaš vremena. Pitanje je da li previše.',
    long: 'Podrška je tu sad. Faks kreće. Već si na ivici monomanije.',
    icon: 'clock'
  }
};

// Onboarding text (Dule Korekcija 2 — Mile sekcija 5.5)
export const CLASS_INTRO_TEXT =
  'Tvoj origin nije presuda. Sve klase imaju puteve do finala. Različiti tempovi, ne različiti ishodi.';
