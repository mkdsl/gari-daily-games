/**
 * @file config.js
 * Fermenter — Varenički Bunt
 * Sve tuning konstante za igru. Jedino mesto za "magic numbers".
 */

export const CONFIG = Object.freeze({
  // ── Fermentacija ────────────────────────────────────────────────────────────
  /** Pasivna FJ/s bez upgrada */
  BASE_FERMENT_RATE: 0.2,
  /** SJ dodato po kliku bez upgrada */
  BASE_CLICK_POWER: 1.0,
  /** Max SJ buffer koji kvasac može da drži */
  SJ_CAPACITY: 50,
  /** Koliko SJ se regeneriše po 1 FJ generisanoj (FJ → SJ kurs) */
  FJ_TO_SJ_RATIO: 2,

  // ── Pressure ─────────────────────────────────────────────────────────────────
  /** pressurePerSec = fermentRate × ovaj faktor */
  PRESSURE_RATE_FACTOR: 0.015,
  /** Maksimalni pritisak (pressure = 100 → prestiže se otključava) */
  MAX_PRESSURE: 100,
  /** Procenat pressure-a od kog pressure bar počinje da pulsira */
  PRESSURE_PULSE_THRESHOLD: 80,
  /** Koliko prestiža je potrebno za win state */
  MAX_PRESTIGES: 3,

  // ── Degradacija ──────────────────────────────────────────────────────────────
  /** Sekundi neaktivnosti pre nego što degradacija počne */
  DEGRADATION_TIMEOUT: 300,
  /** Per-interval multiplikator za fermentRate (0.95 = -5% svakih 30s) */
  DEGRADATION_FACTOR: 0.95,
  /** Interval degradacije u sekundama */
  DEGRADATION_INTERVAL: 30,
  /** Minimalni efektivni fermentRate kao faktor baze (10% od BASE_FERMENT_RATE) */
  MIN_FERMENT_RATE_FACTOR: 0.1,

  // ── Visual ───────────────────────────────────────────────────────────────────
  /** Broj čestica u prestiže particle explosion */
  PRESTIGE_PARTICLE_COUNT: 40,
  /** Maksimalan broj bubble animacija simultano na bureu */
  MAX_BUBBLES: 8,

  // ── Persisence ───────────────────────────────────────────────────────────────
  /** localStorage ključ za save */
  SAVE_KEY: 'fermenter_save_v1',
  /** Interval autosave-a u ms */
  AUTOSAVE_INTERVAL: 30000,

  // ── Upgrades ─────────────────────────────────────────────────────────────────
  /**
   * @type {Array<{
   *   id: string,
   *   name: string,
   *   baseCost: number,
   *   growthFactor: number,
   *   maxLevel: number,
   *   description: string,
   *   effectType: string,
   *   effectValue: number
   * }>}
   */
  UPGRADES: [
    {
      id: 'mlecna_baza',
      name: 'Mlečna Baza',
      baseCost: 10,
      growthFactor: 1.18,
      maxLevel: 20,
      description: '+0.5 FJ/s pasivno',
      effectType: 'fermentRate',
      effectValue: 0.5,
    },
    {
      id: 'pojacana_membrana',
      name: 'Pojačana Membrana',
      baseCost: 25,
      growthFactor: 1.22,
      maxLevel: 15,
      description: '+1.0 clickPower po kliku',
      effectType: 'clickPower',
      effectValue: 1.0,
    },
    {
      id: 'micelij_mreza',
      name: 'Micelij Mreža',
      baseCost: 80,
      growthFactor: 1.30,
      maxLevel: 10,
      description: '×1.5 na sve pasivne FJ/s',
      effectType: 'fermentMultiplier',
      effectValue: 1.5,
    },
    {
      id: 'auto_ferment_1',
      name: 'Auto-Ferment I',
      baseCost: 200,
      growthFactor: 1.35,
      maxLevel: 8,
      description: '+2.0 FJ/s + auto-klik/3s',
      effectType: 'autoFerment1',
      effectValue: 2.0,
    },
    {
      id: 'termal_regulator',
      name: 'Termal Regulator',
      baseCost: 350,
      growthFactor: 1.25,
      maxLevel: 5,
      description: 'Degradacija sporija (0.95→0.98)',
      effectType: 'degradationResist',
      effectValue: 0.03,
    },
    {
      id: 'presurni_katalizator',
      name: 'Presurni Katalizator',
      baseCost: 600,
      growthFactor: 1.40,
      maxLevel: 5,
      description: 'Pressure raste ×1.4 brže',
      effectType: 'pressureMultiplier',
      effectValue: 1.4,
    },
    {
      id: 'auto_ferment_2',
      name: 'Auto-Ferment II',
      baseCost: 1200,
      growthFactor: 1.50,
      maxLevel: 5,
      description: '+5.0 FJ/s + auto-klik/1s',
      effectType: 'autoFerment2',
      effectValue: 5.0,
    },
  ],

  // ── Mutations ────────────────────────────────────────────────────────────────
  /**
   * Pool od 8 mutacija. Svaki prestiže nudi 3 random iz tog pool-a,
   * filtrirane na one koje igrač još nema.
   * @type {Array<{id: string, name: string, badge: string, description: string, effectType: string}>}
   */
  MUTATIONS: [
    {
      id: 'M1',
      name: 'Termofilni Kvasac',
      badge: '♨',
      description: 'Šta se menja: clickPower se duplira svakih 30s aktivnog klika (max ×4, resetuje se na pauzu >10s)',
      effectType: 'thermoClick',
    },
    {
      id: 'M2',
      name: 'Etanol-Rezistentan',
      badge: '⚗',
      description: 'Šta se menja: fermentRate se ne smanjuje na visokim SJ nivoima',
      effectType: 'ethanolResist',
    },
    {
      id: 'M3',
      name: 'Sporo Sazrevanje',
      badge: '🍀',
      description: 'Šta se menja: 20% šansa da klik generiše +5 FJ instant umesto +SJ',
      effectType: 'luckyFerment',
    },
    {
      id: 'M4',
      name: 'Micelarna Mreža',
      badge: '∞',
      description: 'Šta se menja: pasivna FJ/s teče prvih 5s novog runa posle prestiže',
      effectType: 'headStart',
    },
    {
      id: 'M5',
      name: 'Pritisak Kaskada',
      badge: '↑↑',
      description: 'Šta se menja: posle 50% pressure, ostatak teče ×1.6 brže automatski',
      effectType: 'pressureCascade',
    },
    {
      id: 'M6',
      name: 'Osmofilna Adaptacija',
      badge: '◈',
      description: 'Šta se menja: Auto-Ferment upgejdi kostaju 30% manje permanentno',
      effectType: 'autoFermentDiscount',
    },
    {
      id: 'M7',
      name: 'Endosporna Forma',
      badge: '⬡',
      description: 'Šta se menja: bure nikad ne degradira, kontaminacija onemogućena',
      effectType: 'noDegrade',
    },
    {
      id: 'M8',
      name: 'Bifidogena Sinerija',
      badge: '✦',
      description: 'Šta se menja: sve FJ/s × (1.0 + 0.1 × broj_aktivnih_mutacija)',
      effectType: 'synergy',
    },
  ],

  // ── Auto-klik tajminzi ────────────────────────────────────────────────────────
  /** Interval auto-klika za Auto-Ferment I (u ms) */
  AUTO_FERMENT_1_INTERVAL: 3000,
  /** Interval auto-klika za Auto-Ferment II (u ms) */
  AUTO_FERMENT_2_INTERVAL: 1000,

  // ── M1 (Termofilni Kvasac) konstante ────────────────────────────────────────
  /** Svake ovih sekundi aktivnog klika clickPower se duplira */
  THERMO_STACK_INTERVAL: 30,
  /** Max stack za M1 (×4 = 4 duplikacije, clickPower × 2^4 = ×16... ali dizajn kaže ×4 ukupno) */
  THERMO_MAX_STACK: 4,
  /** Sekundi pauze posle kojih se M1 stack resetuje */
  THERMO_RESET_PAUSE: 10,

  // ── M4 (Micelarna Mreža) head start ─────────────────────────────────────────
  /** Sekundi head start-a posle prestiže za M4 */
  HEAD_START_DURATION: 5,

  // ── UI ───────────────────────────────────────────────────────────────────────
  /** Interval UI refresh-a u ms (ne svaki frame) */
  UI_UPDATE_INTERVAL: 100,
  /** Delta cap u ms — sprečava runaway loop posle tab switch */
  DELTA_CAP_MS: 250,
});
