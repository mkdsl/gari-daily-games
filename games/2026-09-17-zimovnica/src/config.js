/**
 * config.js — Sve gameplay konstante za Zimovnicu.
 * Formule žive u systems/, brojčane vrednosti žive ovde.
 */

export const GAME_DAYS = 14;
export const SLOTS_PER_DAY = 4;

/** Minimalne garantovane kg za svaku sirovinu pri berbi */
export const HARVEST_FLOORS = {
  paprike: 25, paradajz: 15, jabuke: 0, sljive: 0,
  krastavci: 0, bostanusa: 0, kupus: 0
};

/** Maksimalne moguće kg pri berbi */
export const HARVEST_MAXES = {
  paprike: 80, paradajz: 60, jabuke: 40, sljive: 35,
  krastavci: 25, bostanusa: 15, kupus: 45
};

/** Verovatnoća pojave sirovine u danu (0–1) */
export const HARVEST_FREQ = {
  jabuke: 0.60, sljive: 0.50, krastavci: 0.40,
  bostanusa: 0.40, kupus: 0.30, paprike: 1.0, paradajz: 1.0
};

/** Prinos (output kg po input kg) za svaki recept */
export const YIELD = {
  ajvar: 0.18, sos: 0.22, pelat: 0.20, dzem: 0.25,
  pekmez: 0.28, tursija: 0.15, suseno: 0.30, rakija: 0.08
};

/** Prodajne cene tegli (din/kg ili din/L), i prestige multiplikatori */
export const JAR_PRICES = {
  ajvar: 850, sos: 450, pelat: 380, dzem: 520,
  pekmez: 690, tursija: 420, medenjaci: 1800,
  prestige_mult: {
    ajvar: 1400 / 850, sos: 700 / 450, pelat: 580 / 380,
    dzem: 850 / 520, pekmez: 1050 / 690, tursija: 640 / 420
  }
};

/** Dnevni decay rate po sirovini (proporcija gubitka kg/dan) */
export const DECAY_BASE = {
  jabuke: 0.12, paradajz: 0.10, paprike: 0.08, kupus: 0.06,
  sljive: 0.05, krastavci: 0.09, bostanusa: 0.07
};

/** Nivoi police — kapacitet, cost u dinaru, prestige_only flag */
export const SHELF_UPGRADES = [
  { shelves: 2, capacity: 40,  cost: 0,    kasa_req: 0,    prestige_only: false },
  { shelves: 3, capacity: 60,  cost: 500,  kasa_req: 300,  prestige_only: false },
  { shelves: 4, capacity: 80,  cost: 1500, kasa_req: 800,  prestige_only: false },
  { shelves: 5, capacity: 100, cost: 2500, kasa_req: 1500, prestige_only: false },
  { shelves: 6, capacity: 120, cost: 5000, kasa_req: 0,    prestige_only: true  },
];

/** Minimumi za prestige unlock na kraju runa */
export const PRESTIGE_THRESHOLDS = { min_jars: 120, min_kasa: 500 };

/** Dan od kog se rakija otključava */
export const RAKIJA_UNLOCK_DAY = 7;

/** Zakonski maksimum destilacije za domaću upotrebu (litara po runu) */
export const RAKIJA_LEGAL_CAP_L = 50;

/**
 * Inicijacioni prozor bačve — bačva MORA biti pokrenuta unutar ovih dana (dani 1–BARREL_WINDOW_DAYS).
 * Posle toga, inicijacija nije moguća i bačva prolazi u 'failed'.
 */
export const BARREL_WINDOW_DAYS = 2;

/** Trajanje fermentacije u danima */
export const FERMENTATION_DAYS = { bačva: 7, tursija: 3 };

/** Trajanje sušenja u danima */
export const DRYING_DAYS = { suseno: 2 };

/** Tačnost vremenskih prognoza (verovatnoća da je prognoza tačna) */
export const FORECAST_ACCURACY = 0.80;

/** Multiplikator berbe i sušenja po vremenskim uslovima */
export const WEATHER_MULT = { sunny: 1.0, cloudy: 0.85, rainy: 0.60 };

/** Ikone za vreme u UI-u */
export const WEATHER_ICONS = { sunny: '☀️', cloudy: '⛅', rainy: '🌧️' };

/** Bazna paleta boja igre */
export const THEME = {
  bg:      '#1A120B',
  warm:    '#E25822',
  cool:    '#4A7C59',
  neutral: '#C8A97E',
  text:    '#F5E6C8',
  alert:   '#D62828'
};

/** Startna kasa novog runa */
export const START_KASA = 500;

/** Akcioni slot cost po operaciji */
export const SLOT_COST = {
  berba: 1, kuvanje: 1, tursija_init: 1, bacva_init: 2,
  sušenje: 1, destilacija: 2, prodaja: 1, kupovina: 1,
  shelf_upgrade: 1
};

/** Broj dnevnih događaja */
export const EVENTS_PER_DAY = { min: 0, max: 2 };

/** Tegle ikone po tipu */
export const JAR_ICONS = {
  ajvar: '🫙', sos: '🍅', pelat: '🥫', dzem: '🍓',
  pekmez: '🫐', tursija: '🥒', medenjaci: '🍪',
  kiseli_kupus: '🥬', suseno_voce: '🍎', sušene_šljive: '🫐',
  rakija: '🫗'
};
