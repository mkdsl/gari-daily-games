/**
 * config.js — Akva-Sklop
 * Sve konstante i tuning vrednosti. Bez hardcodiranih magičnih brojeva u logici.
 * Referenca: GDD v1.0, 2026-05-30
 */

// =============================================================================
// GRID
// =============================================================================

export const GRID_COLS = 20;
export const GRID_ROWS = 15;
export const TILE_SIZE = 48; // px — Apple HIG minimum 44px za touch

/** Ukupna canvas dimenzija (desktop) */
export const CANVAS_WIDTH  = GRID_COLS * TILE_SIZE; // 960
export const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE; // 720

// =============================================================================
// HEIGHT MAP — 20×15 array (row-major, [row][col])
// Visina 3 = gornje (Jezero A zona, gornji-desni ugao)
// Visina 2 = srednje (Jezero B, centar-desno)
// Visina 1 = donje  (Jezero C, donji-levi ugao)
// Visina 0 = ravničarska zona / neprohodna planinska padina
// Gravity rule: voda teče samo ka nižoj visini
// =============================================================================

export const HEIGHT_MAP = [
  // col:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
  /* r0 */ [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
  /* r1 */ [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
  /* r2 */ [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  /* r3 */ [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2],
  /* r4 */ [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2],
  /* r5 */ [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  /* r6 */ [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  /* r7 */ [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  /* r8 */ [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
  /* r9 */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1],
  /* r10*/[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
  /* r11*/[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  /* r12*/[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  /* r13*/[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  /* r14*/[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// =============================================================================
// LAKE POSITIONS — fiksne pozicije prema GDD sekcija 2.2
// =============================================================================

/** Jezero A — gornje, visina 3, zona 4×3 tile-ova od (14,1) */
export const LAKE_A_ORIGIN = { col: 14, row: 1 };
export const LAKE_A_SIZE   = { cols: 4, rows: 3 };

/** Jezero B — srednje, visina 2, zona 4×3 tile-ova od (10,6) */
export const LAKE_B_ORIGIN = { col: 10, row: 6 };
export const LAKE_B_SIZE   = { cols: 4, rows: 3 };

/** Jezero C — donje, visina 1, zona 4×3 tile-ova od (3,10) */
export const LAKE_C_ORIGIN = { col: 3, row: 10 };
export const LAKE_C_SIZE   = { cols: 4, rows: 3 };

/** Izvor — fiksan, ne može se ukloniti */
export const SOURCE_POS    = { col: 17, row: 0 };

// =============================================================================
// TILE TYPES
// =============================================================================

export const TILE_TYPES = {
  EMPTY:    'empty',
  SOURCE:   'source',    // pre-placed, ne može se ukloniti
  DRAINAGE: 'drainage',
  BIOFILTER:'biofilter',
  WETLAND:  'wetland',
  LAKE_1:   'lake1',
  LAKE_2:   'lake2',
  DAM:      'dam',
  TERRAIN:  'terrain',   // neprohodna zona
  REMOVE:   'remove',    // akcija uklanjanja
};

// =============================================================================
// TILE CONFIG — AP cena, protok, efekat, vizual
// =============================================================================

export const TILE_CONFIG = {
  [TILE_TYPES.DRAINAGE]: {
    apCost:      1,
    flowBonus:   0.08,   // l/s kapaciteta prema nižem jezeru
    pHBonus:     0,
    duckCapBonus:0,
    storageBonus:0,
    blocksFlow:  false,
    emoji:       '〜',
    label:       'Drenaža',
    color:       '#4ecdc4',
    description: 'Usmerava tok između jezera (0.08 l/s po tile-u)',
  },
  [TILE_TYPES.BIOFILTER]: {
    apCost:      2,
    flowBonus:   0,
    pHBonus:     0.1,    // pH += 0.1 po biofilter-u po sim koraku; cap 8.5
    duckCapBonus:0,
    storageBonus:0,
    blocksFlow:  false,
    emoji:       '🌿',
    label:       'Biofilter',
    color:       '#2d8a4e',
    description: 'pH +0.1 po nedelji; bez njega kiša acidifikuje jezero',
  },
  [TILE_TYPES.WETLAND]: {
    apCost:      1,
    flowBonus:   0,
    pHBonus:     0,
    duckCapBonus:4,      // +4 ducks kapacitet jezera
    storageBonus:0,
    blocksFlow:  false,
    emoji:       '🌾',
    label:       'Močvara',
    color:       '#8BC34A',
    description: '+4 kapaciteta za patke; duck health +10% ako postoji',
  },
  [TILE_TYPES.LAKE_1]: {
    apCost:      2,
    flowBonus:   0,
    pHBonus:     0,
    duckCapBonus:0,
    storageBonus:0,
    capacity:    50,     // L
    blocksFlow:  false,
    emoji:       '💧',
    label:       'Jezero Nivo 1',
    color:       '#1a6fa0',
    description: 'Kapacitet 50L; domaćin životinja',
  },
  [TILE_TYPES.LAKE_2]: {
    apCost:      3,
    flowBonus:   0,
    pHBonus:     0,
    duckCapBonus:0,
    storageBonus:0,
    capacity:    100,    // L (zahteva lake_1 na istoj poziciji)
    blocksFlow:  false,
    emoji:       '💧',
    label:       'Jezero Nivo 2',
    color:       '#0d5280',
    description: 'Kapacitet 100L; zahteva Lake Nivo 1 na toj poziciji',
  },
  [TILE_TYPES.DAM]: {
    apCost:      2,
    flowBonus:   0,
    pHBonus:     0,
    duckCapBonus:0,
    storageBonus:20,     // L akumulira u gornje jezero
    blocksFlow:  true,
    emoji:       '▪️',
    label:       'Brana',
    color:       '#5D4037',
    description: 'Blokira gravitacioni tok; akumulira +20L u gornje jezero',
  },
  [TILE_TYPES.REMOVE]: {
    apCost:      1,
    flowBonus:   0,
    pHBonus:     0,
    duckCapBonus:0,
    storageBonus:0,
    blocksFlow:  false,
    emoji:       '✖️',
    label:       'Ukloni',
    color:       '#e53935',
    description: 'Uklanja tile s pozicije (AP original tile-a nije vraćen)',
  },
};

// =============================================================================
// HYDRAULICS
// =============================================================================

/** Maksimalni protok iz izvora u normalnim uslovima (l/s) */
export const SOURCE_MAX_FLOW     = 0.4;

/** Gubitak vode na putu između jezera (10%) */
export const FLOW_PATH_LOSS      = 0.10;

/** Evaporacija po jezeru po nedelji (l/s ekvivalent) */
export const EVAPORATION_RATE    = 0.02;

/** Podrazumevani pH pri inicijalizaciji */
export const PH_DEFAULT          = 7.0;

/** pH pad od kiše ako nema biofiltara (po nedelji) */
export const PH_RAIN_EFFECT      = -0.05;

/** pH uticaj jedne patke po nedelji (organski otpad) */
export const DUCK_WASTE_PH       = -0.01; // GDD sekcija 4 Step 2: 0.01 per patka

/** Minimalni i maksimalni pH u sistemu */
export const PH_MIN              = 5.0;
export const PH_MAX              = 9.0;

/** pH cap za biofilter efekat (ne može ići iznad) */
export const PH_BIOFILTER_CAP    = 8.5;

// =============================================================================
// SPECIES
// =============================================================================

/** pH opseg u kome su ribe zdrave */
export const FISH_PH_MIN         = 6.5;
export const FISH_PH_MAX         = 8.5;

/** Minimalan nivo vode (L) da bi patke bile OK */
export const DUCK_MIN_LEVEL      = 20;

/** Oporavak health-a riba po nedelji u OK uslovima */
export const FISH_HEALTH_RECOVERY    = 10;

/** Pad health-a riba po nedelji van pH opsega */
export const FISH_HEALTH_DAMAGE      = 30;

/** Oporavak health-a pataka po nedelji u OK uslovima */
export const DUCK_HEALTH_RECOVERY    = 5;

/** Pad health-a pataka po nedelji (premalo vode ili previše pataka) */
export const DUCK_HEALTH_DAMAGE      = 20;

/** Duck health bonus (%) kad postoji wetland */
export const DUCK_WETLAND_HEALTH_BONUS = 10;

/** Broj uzastopnih nedelja fishHealth=0 koji trigguje Game Over */
export const FISH_DEATH_CONSECUTIVE = 2;

/** Penali na score (za UI prikaz / logovanje, ne menjaju game over logiku) */
export const FISH_DEATH_PENALTY  = -30;
export const DUCK_DEATH_PENALTY  = -15;

// =============================================================================
// PROGRESSION
// =============================================================================

export const TOTAL_WEEKS         = 12;

/** AP po nedelji prema fazi igre */
export const AP_EARLY            = 5;   // nedelja 1–3 (tutorial)
export const AP_MID              = 3;   // nedelja 4–8
export const AP_LATE             = 2;   // nedelja 9–12

/** Trajanje Planning Phase (sekunde) — po isteku simulacija se pokreće automatski */
export const PLAN_TIMER_SEC      = 45;

/** Trajanje Simulation Phase animacije (sekunde) */
export const SIM_ANIM_SEC        = 4;

/** Granice faza za AP kalkulaciju */
export const PHASE_EARLY_END     = 3;   // nedelje 1–3
export const PHASE_MID_END       = 8;   // nedelje 4–8
// nedelje 9–12 = LATE

// =============================================================================
// DIFFICULTY
// =============================================================================

export const DIFFICULTY = {
  faza0: {
    id:            'faza0',
    label:         'Faza 0 — Tutorial',
    sourceRate:    0.5,   // l/s (blago lakše)
    startDucks:    2,     // samo Jezero B
    startFish:     0,
    maxEvents:     0,
    winThreshold:  60,    // Eco Score %
    multiplier:    0.7,
    apEarly:       5,
    apMid:         3,
    apLate:        2,
    prePlaced:     ['source', 'lake_B'], // izvor + Jezero B pre-placed
  },
  fazaA: {
    id:            'fazaA',
    label:         'Faza A — Standard',
    sourceRate:    0.4,
    startDucks:    4,     // B i C jezero
    startFish:     2,     // Jezero A
    maxEvents:     2,
    winThreshold:  80,
    multiplier:    1.0,
    apEarly:       5,
    apMid:         3,
    apLate:        2,
    prePlaced:     ['source'],
  },
  fazaB: {
    id:            'fazaB',
    label:         'Faza B — Komercijalno',
    sourceRate:    0.4,
    startDucks:    8,     // sva tri jezera
    startFish:     6,     // A i B jezero
    maxEvents:     4,
    winThreshold:  85,
    multiplier:    1.4,
    apEarly:       4,
    apMid:         2,
    apLate:        1,
    prePlaced:     ['source'],
  },
};

/** Podrazumevani difficulty za novi run */
export const DEFAULT_DIFFICULTY  = 'fazaA';

// =============================================================================
// EVENTS
// =============================================================================

export const EVENT_TYPES = {
  DROUGHT: {
    id:          'drought',
    label:       'Suša',
    minWeek:     4,
    maxWeek:     8,
    weight:      25,
    duration:    2,        // nedelje
    description: 'Izvor na 50% kapaciteta (0.2 l/s) tokom 2 nedelje',
    apply: (state) => {
      state.source.droughtMultiplier = 0.5;
      state.source.droughtWeeksLeft  = 2;
    },
  },
  DROUGHT_BREAK: {
    id:           'drought_break',
    label:        'Kraj suše',
    triggeredBy:  'drought',
    delay:        2,       // nedelje posle DROUGHT
    weight:       100,     // uvek se desi
    duration:     1,
    description:  'Izvor se vraća na normalan protok',
    apply: (state) => {
      state.source.droughtMultiplier = 1.0;
      state.source.droughtWeeksLeft  = 0;
    },
  },
  DUCK_MIGRATION: {
    id:          'duck_migration',
    label:       'Jato pataka',
    minWeek:     4,
    maxWeek:     8,
    weight:      20,
    duration:    0,        // trajno (patke ostaju)
    duckBonus:   6,
    description: '+6 pataka u random jezero (ponderisano prema kapacitetu)',
    apply: null,           // implementira events.js uz RNG
  },
  FOREST_RUNOFF: {
    id:          'forest_runoff',
    label:       'Šumska kontaminacija',
    minWeek:     7,
    maxWeek:     12,
    weight:      15,
    duration:    1,
    pHDelta:     -0.8,
    targetLake:  'C',
    description: 'pH Jezera C pada za 0.8 ovu nedelju',
    apply: null,           // implementira events.js
  },
  HEAVY_RAIN: {
    id:          'heavy_rain',
    label:       'Jak kiša',
    minWeek:     6,
    maxWeek:     12,
    difficulty:  'fazaB',  // samo Faza B
    weight:      30,
    duration:    1,
    levelBonus:  30,       // L instant u svim jezerima (može overflow)
    description: 'Sva jezera +30L instant; overflow = gubitak vode',
    apply: null,           // implementira events.js
  },
};

/** Max 1 event po nedelji (DROUGHT_BREAK se ne računa u limit) */
export const MAX_EVENTS_PER_WEEK = 1;

// =============================================================================
// SCORING
// =============================================================================

/** Rank labels za finalni rezultat (opadajući min prag) */
export const RANK_LABELS = [
  { min: 100, label: 'Perfektna sezona',    emoji: '🌟' },
  { min: 85,  label: 'Guncati Faza 0: Uspeh', emoji: '🏆' },
  { min: 70,  label: 'Balans uspostavljen', emoji: '✅' },
  { min: 50,  label: 'Ekosistem niče',      emoji: '⚠️' },
  { min: 0,   label: 'Izvor presušuje',     emoji: '💀' },
];

/**
 * Soft-fail cap: nedelja bez pataka ne može dostići score iznad ovog
 * (GDD sekcija 6.3)
 */
export const SCORE_NO_DUCKS_CAP  = 70;

// Opsezi za pH score (koristi scoring.js)
export const PH_SCORE_IDEAL_MIN  = 6.5;
export const PH_SCORE_IDEAL_MAX  = 8.5;
export const PH_SCORE_OK_LOW_MIN = 6.0;
export const PH_SCORE_OK_LOW_MAX = 6.5;
export const PH_SCORE_OK_HI_MIN  = 8.5;
export const PH_SCORE_OK_HI_MAX  = 9.0;
export const PH_SCORE_IDEAL_VAL  = 100;
export const PH_SCORE_OK_VAL     = 60;
export const PH_SCORE_BAD_VAL    = 0;

// =============================================================================
// COLORS — Guncati brand paleta (mirror od theme.css za Canvas 2D)
// =============================================================================

export const COLORS = {
  bg:           '#1a2e1a',   // tamno zelena pozadina
  terrain:      '#2d4a2d',   // planinska zona
  empty:        '#3a5a3a',   // prazno polje
  source:       '#FFD700',   // izvor — zlatna
  drainage:     '#4ecdc4',   // drenaža — teal
  biofilter:    '#2d8a4e',   // biofilter — tamno zelena
  wetland:      '#8BC34A',   // močvara — svetlo zelena
  lake:         '#1a6fa0',   // jezero Nivo 1 — plava
  lakeDeep:     '#0d5280',   // jezero Nivo 2 — tamno plava
  dam:          '#5D4037',   // brana — smeđa
  water:        '#4fc3f7',   // voda u toku animacije — svetlo plava
  waterFlow:    '#4ecdc4',   // čestice toka
  duck:         '#ff6b35',   // patke — narandžasta
  fish:         '#a8d8ea',   // ribe — svetlo plava/srebrna
  hudBg:        'rgba(0,0,0,0.75)',
  panelBg:      'rgba(26,46,26,0.92)',
  healthy:      '#4CAF50',   // ok indikator
  warning:      '#FF9800',   // upozorenje
  critical:     '#f44336',   // kritično
  text:         '#ffffff',
  textMuted:    '#b0bec5',
  gridLine:     'rgba(255,255,255,0.08)',
  selectedTile: 'rgba(255,255,255,0.35)',
  invalidTile:  'rgba(244,67,54,0.45)',
  previewValid: 'rgba(76,175,80,0.35)',
};

// =============================================================================
// AUDIO
// =============================================================================

export const AUDIO_ENABLED       = true;

/** Frekfencija bass huma za water ambient (Hz) */
export const AMBIENT_FREQ        = 80;

/** Frekfencija tile-place ding-a (Hz) */
export const TILE_PLACE_FREQ     = 440;

/** Trajanje tile-place zvuka (ms) */
export const TILE_PLACE_DURATION = 200;

/** pH alarm: frekvencija prvog tona (Hz) */
export const PH_ALARM_FREQ_1     = 220;

/** pH alarm: frekvencija drugog tona (Hz) */
export const PH_ALARM_FREQ_2     = 165;

/** pH alarm: period ponavljanja (ms) */
export const PH_ALARM_INTERVAL   = 3000;

/** Trajanje simulacione animacije (ms) = SIM_ANIM_SEC × 1000 */
export const SIM_AUDIO_DURATION  = 4000;

// =============================================================================
// GUNCATI KNOWS kartice
// [pending Brana verification] — placeholder tekst je u igri dok review ne završi
// =============================================================================

export const GUNCATI_CARDS = [
  {
    id:       1,
    title:    'Izvor',
    text:     'Guncati izvor daje maksimalno 0.4 l/s — jednako 24 litara po satu, ili oko 576 litara dnevno. Prosečna porodica od 4 osobe troši 400–600L/dan. Guncati izvor pokriva tačno tu potrebu.',
    verified: false, // [pending Brana verification — tražiti: stvarni flow-rate merenja po mesecima]
    pinnable: true,
  },
  {
    id:       2,
    title:    'Biofilm',
    text:     'Biofilm filter u jezeru može da poveća pH vode za 0.1 do 0.3 po sezoni. Bez njega, kišnica (pH ~5.6) prirodno acidifikuje stajačicu tokom leta.',
    verified: false, // [pending Brana verification — tražiti: koji tip biofiltarskog materijala Guncati koristi]
    pinnable: true,
  },
  {
    id:       3,
    title:    'Patke',
    text:     'Patke filtriraju sitne alge i insekte iz vode, ali izlučuju azotne spojeve koji blago acidifikuju jezero. Više od 6 pataka po 50L bez biofiltera — pH pada brže nego raste.',
    verified: false, // [pending Brana verification — tražiti: stvaran broj pataka na Guncati i jezero koje koriste]
    pinnable: true,
  },
  {
    id:       4,
    title:    'Gravitacija',
    text:     'Gravitacioni tok ne troši energiju. Guncati nema pumpe u Fazi 0 — samo visinska razlika između izvora i jezera obezbeđuje pasivni protok. Pad od 1m na 10m horizontalne dužine daje dovoljan pritisak.',
    verified: false, // [pending Brana verification — tražiti: stvarne kotne razlike između izvora i jezera]
    pinnable: true,
  },
  {
    id:       5,
    title:    'Plan',
    text:     'Guncati planira tri jezera do 2027: jedno primarno za akumulaciju i navodnjavanje, jedno za ribolov i biofiltaciju, jedno kao plivački/rekreativni bazen. Sve tri funkcionišu gravitaciono — bez pumpi, bez električne energije.',
    verified: false, // [pending Brana verification — tražiti: aktuelni plan imanja, ne concept iz 2024]
    pinnable: true,
  },
];

/** Ukupan broj Guncati Knows kartica */
export const TOTAL_CARDS = GUNCATI_CARDS.length;

// =============================================================================
// BRAND / LINKS
// =============================================================================

/** CTA link na kraju svakog runa */
export const GUNCATI_URL = 'https://guncati.rs';

/** localStorage ključevi */
export const LS_KEY_CARDS    = 'akva_sklop_cards';
export const LS_KEY_RUNS     = 'akva_sklop_runs';
export const LS_KEY_SETTINGS = 'akva_sklop_settings';

// =============================================================================
// DEBUG
// =============================================================================

/** Keyboard key za toggle debug panela */
export const DEBUG_KEY       = 'd';

/** Format template za debug ispis po jezeru */
export const DEBUG_LAKE_FORMAT = '[Jezero {id}] level: {level}L / {cap}L | pH: {ph} | fish: {fish}% | duck: {duck}% | inflow: {inflow} l/s';
