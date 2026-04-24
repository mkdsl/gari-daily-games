/**
 * config.js — Sve tuning konstante za Kartaški Front.
 * Svi magic brojevi žive ovde. Implementacioni fajlovi importuju samo CONFIG.
 */

export const CONFIG = {
  // ── Persistence ────────────────────────────────────────────────────────────
  SAVE_KEY: 'kartaski-front-save',

  // ── Igrač ──────────────────────────────────────────────────────────────────
  PLAYER_MAX_HP: 30,
  PLAYER_ENERGY_PER_TURN: 3,
  HAND_SIZE: 5,
  TOTAL_NODES: 4,

  // ── Boje (paleta) ──────────────────────────────────────────────────────────
  COLORS: {
    BG:            '#1a1a2e',
    BATTLEFIELD:   '#0f0f1f',
    CARD_BG:       '#16213e',
    CARD_BORDER:   '#e2b96f',
    CARD_ATTACK:   '#c0392b',
    CARD_BLOCK:    '#2980b9',
    CARD_EFFECT:   '#8e44ad',
    HP_PLAYER:     '#27ae60',
    HP_ENEMY:      '#e74c3c',
    SHIELD:        '#3498db',
    TEXT:          '#e5e5e5',
    TEXT_DIM:      '#888',
    ENEMY_GREMLIN: '#8888aa',
    ENEMY_RATNIK:  '#aa8844',
    ENEMY_CUVAR:   '#44aa88',
    ENEMY_BOSS:    '#cc3333',
    PLAYER_COLOR:  '#e2b96f',
  },

  // ── Phase enum vrijednosti ──────────────────────────────────────────────────
  PHASES: {
    PLAYER_TURN: 'PLAYER_TURN',
    RESOLVING:   'RESOLVING',
    ENEMY_TURN:  'ENEMY_TURN',
    REWARD:      'REWARD',
    MAP:         'MAP',
    GAME_OVER:   'GAME_OVER',
    VICTORY:     'VICTORY',
  },

  // ── Starter Deck definicije (10 karata) ────────────────────────────────────
  // Svaka karta: { id, name, type, cost, ...efekti }
  STARTER_DECK: [
    { id: 'samar',      name: 'Šamar',      type: 'attack', cost: 1, damage: 6 },
    { id: 'blok',       name: 'Blok',       type: 'block',  cost: 1, shield: 5 },
    { id: 'ubod',       name: 'Ubod',       type: 'attack', cost: 1, damage: 4 },
    { id: 'odupiranje', name: 'Odupiranje', type: 'block',  cost: 1, shield: 4 },
    { id: 'guranje',    name: 'Guranje',    type: 'attack', cost: 2, damage: 9 },
    { id: 'stit',       name: 'Štit',       type: 'block',  cost: 2, shield: 8 },
    { id: 'udar',       name: 'Udar',       type: 'attack', cost: 1, damage: 5 },
    { id: 'oprez',      name: 'Oprez',      type: 'block',  cost: 1, shield: 5 },
    { id: 'taktika',    name: 'Taktika',    type: 'effect', cost: 2, effect: 'next_attack_bonus', value: 4 },
    { id: 'odmor',      name: 'Odmor',      type: 'effect', cost: 0, effect: 'heal', value: 3 },
  ],

  // ── Reward karte biblioteka ─────────────────────────────────────────────────
  REWARD_CARDS: {
    'dvojni_udar':   { id: 'dvojni_udar',   name: 'Dvojni Udar',   type: 'attack', cost: 2, damage: 7, hits: 2 },
    'bled':          { id: 'bled',          name: 'Bled',          type: 'effect', cost: 1, effect: 'poison',  value: 2, duration: 3, target: 'enemy' },
    'regen_touch':   { id: 'regen_touch',   name: 'Regen Touch',   type: 'effect', cost: 1, effect: 'regen',   value: 2, duration: 2, target: 'player' },
    'gvozdeni_zid':  { id: 'gvozdeni_zid',  name: 'Gvozdeni Zid',  type: 'block',  cost: 2, shield: 12 },
    'burn_touch':    { id: 'burn_touch',    name: 'Burn Touch',    type: 'effect', cost: 1, effect: 'burn',    value: 2, duration: 3, target: 'enemy' },
    'slabost':       { id: 'slabost',       name: 'Slabost',       type: 'effect', cost: 1, effect: 'weak',    value: 0, duration: 2, target: 'enemy' },
    'oluja':         { id: 'oluja',         name: 'Oluja',         type: 'attack', cost: 3, damage: 25 },
    'celicni_oklop': { id: 'celicni_oklop', name: 'Čelični Oklop', type: 'block',  cost: 3, shield: 20 },
    'lancani_burn':  { id: 'lancani_burn',  name: 'Lančani Burn',  type: 'effect', cost: 2, effect: 'burn',    value: 3, duration: 4, target: 'enemy' },
    'vampirizam':    { id: 'vampirizam',    name: 'Vampirizam',    type: 'attack', cost: 2, damage: 10, lifesteal: 5 },
  },

  // ── Reward pool po čvoru (1-indexed) ───────────────────────────────────────
  REWARD_POOLS: {
    1: ['bled', 'regen_touch', 'dvojni_udar'],
    2: ['gvozdeni_zid', 'burn_touch', 'slabost', 'dvojni_udar'],
    3: ['oluja', 'celicni_oklop', 'lancani_burn', 'vampirizam'],
    4: [], // boss — nema reward
  },

  // ── Neprijatelji ────────────────────────────────────────────────────────────
  // intentPattern: niz objekata { type: 'attack'|'block'|'buff', value, effectName?, duration? }
  // Svaki čvor koristi neprijatelja po indeksu (1→Gremlin, 2→Ratnik, 3→Čuvar, 4→Boss)
  ENEMIES: {
    gremlin: {
      id: 'gremlin',
      name: 'Gremlin',
      hp: 20,
      color: '#8888aa',
      intentPattern: [
        { type: 'attack', value: 6 },
        { type: 'attack', value: 6 },
        { type: 'attack', value: 6 },
      ],
    },
    ratnik: {
      id: 'ratnik',
      name: 'Ratnik',
      hp: 35,
      color: '#aa8844',
      intentPattern: [
        { type: 'block',  value: 8 },
        { type: 'attack', value: 10 },
        { type: 'attack', value: 12 },
      ],
    },
    cuvar: {
      id: 'cuvar',
      name: 'Čuvar',
      hp: 45,
      color: '#44aa88',
      intentPattern: [
        { type: 'attack', value: 8 },
        { type: 'buff',   effectName: 'weak', duration: 2, target: 'player' },
        { type: 'attack', value: 14 },
      ],
    },
    boss: {
      id: 'boss',
      name: 'Boss Nekromajer',
      hp: 70,
      color: '#cc3333',
      intentPattern: [
        { type: 'attack', value: 12 },
        { type: 'attack', value: 8, effectName: 'burn', effectValue: 2, effectDuration: 2, target: 'player' },
        { type: 'block',  value: 10 },
        { type: 'attack', value: 18 }, // finali u rundi 4
      ],
    },
  },

  // ── Redosled neprijatelja po čvoru ─────────────────────────────────────────
  NODE_ENEMIES: ['gremlin', 'ratnik', 'cuvar', 'boss'],

  // ── UI dimenzije (relativne) ────────────────────────────────────────────────
  TOOLBAR_HEIGHT_VH: 10,
  BATTLEFIELD_HEIGHT_VH: 50,
  HAND_HEIGHT_VH: 40,
};
