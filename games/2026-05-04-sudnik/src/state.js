// src/state.js — Game state shape, createState, loadState, saveState, resetState
// State shape je definisan u GDD §1.

import { CONFIG } from './config.js';
import { buildStarterDeck, shuffle } from './deck.js';
import { shuffleArray } from './cases.js';

/** Trenutna verzija state schema — incrementovati pri breaking promenama */
const STATE_VERSION = 2;

/**
 * Kreira novi, svež game state za početak sesije.
 * Starter deck se generiše i shuffluje ovde.
 *
 * usedCasePool pokriće svih 7 non-pobuna crimeType-ova u slučajevima 2–8
 * (caseIndex 1–7, tj. 7 slučajeva), plus jedan ekstra za caseIndex 8 (9. slučaj),
 * što daje 8 pool elemenata za caseIndex 1–8.
 * CaseIndex 0 je fiksni tutorijal, caseIndex 9 je uvek 'pobuna'.
 *
 * @returns {Object} Inizijalni state objekat
 */
export function createState() {
  const deck = buildStarterDeck();
  shuffle(deck);

  // 7 non-pobuna tipova — pokrivaju slučajeve 2-8 (caseIndex 1-7)
  const nonPobunaCrimes = [
    'nasilje', 'krađa', 'korupcija', 'ubistvo',
    'prevara', 'nasilje u porodici', 'sitna krađa'
  ];

  // Shuffluj 7 tipova, pa dodaj 8. element za caseIndex 8
  const casePool = shuffleArray(nonPobunaCrimes);
  casePool.push(nonPobunaCrimes[Math.floor(Math.random() * nonPobunaCrimes.length)]);

  return {
    version: STATE_VERSION,
    session: {
      caseIndex: 0,
      totalCases: CONFIG.TOTAL_CASES,
      phase: 'draw'
    },
    resources: {
      masa: CONFIG.STARTING_MASA,
      vlast: CONFIG.STARTING_VLAST
    },
    deck,
    hand: [],
    discardPile: [],
    precedents: [],
    currentCase: null,
    // Pool crimeType-ova za slučajeve caseIndex 1-8 (8 elemenata)
    // caseIndex 0 = tutorijal (fiksan), caseIndex 9 = 'pobuna' (fiksan)
    _casePool: casePool,
    _casePoolIndex: 0,
    stats: {
      totalGuilty: 0,
      totalFree: 0,
      guiltyByWealth: { siromasan: 0, srednji: 0, bogat: 0 },
      guiltyByAge: { mlad: 0, sredovecni: 0, star: 0 },
      guiltyByCrime: {},
      guiltyRecidivists: 0,
      freeRecidivists: 0,
      precedentsCreated: []
    }
  };
}

/**
 * Učitava sačuvani state iz localStorage.
 * Vraća null ako nema sačuvanog state-a ili je verzija nekompatibilna.
 * @returns {Object|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION) return null;
    // Ne učitavaj završene igre — neka počnu iznova
    if (parsed.session.phase === 'summary' || parsed.session.phase === 'gameover') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Snima state u localStorage.
 * Tiho ignoriše greške (quota exceeded, private mode).
 * @param {Object} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota ili private mode — ignorisati
  }
}

/**
 * Briše sačuvani state iz localStorage (za restart).
 */
export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
