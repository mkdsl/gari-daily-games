// src/cases.js — Case generation system (GDD §4)
// Generiše proceduralne slučajeve za suđenje.
// Slučaj 1 (caseIndex 0) je uvek tutorijalni (fiksni atributi).
// Slučaj 10 (caseIndex 9) je uvek crimeType='pobuna'.
// Slučajevi 2-9 (caseIndex 1-8) su proceduralni ali pokrivaju sve crimeType-ove.

import { CONFIG } from './config.js';

/**
 * Svi mogući tipovi zločina (GDD §4).
 * @type {string[]}
 */
export const CRIME_TYPES = [
  'nasilje', 'krađa', 'korupcija', 'ubistvo',
  'prevara', 'nasilje u porodici', 'sitna krađa', 'pobuna'
];

/** Sve wealth opcije */
const WEALTH_OPTIONS = ['siromasan', 'srednji', 'bogat'];

/** Sve age opcije */
const AGE_OPTIONS = ['mlad', 'sredovecni', 'star'];

/**
 * Intro template rečenice po crimeType (GDD §4).
 * @type {Object.<string, string>}
 */
export const INTRO_TEMPLATES = {
  'nasilje':             'Optuženi je uhapšen posle tuče u kojoj je žrtva zadobila telesne povrede.',
  'krađa':               'Pronađen sa ukradenom robom vrednom 400 dinara u džepu.',
  'korupcija':           'Primio mito od službenika opštine u iznosu koji se nije moglo dokazati.',
  'ubistvo':             'Prisustvovao incidentu u kome je jedna osoba izgubila život — okolnosti sporne.',
  'prevara':             'Prodavao lažne dokumente građanima koji su tražili posao.',
  'nasilje u porodici':  'Supruga prijavila povrede. Optuženi tvrdi da je bila nesreća.',
  'sitna krađa':         'Zatečen kako iznosi hleb iz magacina fabrike gde radi.',
  'pobuna':              'Učestvovao u javnom skupu koji je vlast proglasila nelegalnim.'
};

/**
 * Suspect template rečenice po kombinaciji wealth+age (GDD §4).
 * Ključ: `${wealth}_${age}`
 * @type {Object.<string, string>}
 */
export const SUSPECT_TEMPLATES = {
  'siromasan_mlad':        'Optuženi: mladić bez posla, živi kod rodbine.',
  'siromasan_sredovecni':  'Optuženi: radnik koji nije primio platu tri meseca.',
  'siromasan_star':        'Optuženi: penzioner sa invaliditetom, sam živi.',
  'srednji_mlad':          'Optuženi: student, sin lokalnog trgovca.',
  'srednji_sredovecni':    'Optuženi: službenik, besprekoran dosije do sada.',
  'srednji_star':          'Optuženi: bivši profesor, dobro poznat u kvartu.',
  'bogat_mlad':            'Optuženi: sin uglednog gradskog savetnika.',
  'bogat_sredovecni':      'Optuženi: vlasnik fabrike sa vezama u upravi.',
  'bogat_star':            'Optuženi: penzionisani funkcioner sa još uvek aktivnim kontaktima.'
};

/**
 * Witness template rečenice (GDD §4).
 * Koristiti WITNESS_TEMPLATES[true] ili WITNESS_TEMPLATES[false].
 * @type {Object}
 */
export const WITNESS_TEMPLATES = {
  true:  'Jedan svedok je prisutan i spreman da svedoči.',
  false: 'Nema svedoka. Samo reč optuženog i reč tužioca.'
};

/**
 * Recidivist suffix rečenica (GDD §4).
 * @type {string}
 */
export const RECIDIVIST_SUFFIX = 'Ovo nije prvi put — optuženi ima prethodnu presudu.';

/**
 * Gradi description string za slučaj spajanjem template-a (GDD §4).
 *
 * @param {string} crimeType
 * @param {string} wealth — 'siromasan'|'srednji'|'bogat'
 * @param {string} age — 'mlad'|'sredovecni'|'star'
 * @param {boolean} hasWitness
 * @param {boolean} isRecidivist
 * @returns {string} Puni description tekst za prikaz
 */
export function buildCaseDescription(crimeType, wealth, age, hasWitness, isRecidivist) {
  const intro    = INTRO_TEMPLATES[crimeType] ?? '';
  const suspect  = SUSPECT_TEMPLATES[`${wealth}_${age}`] ?? '';
  const witness  = WITNESS_TEMPLATES[hasWitness] ?? '';
  const recidSfx = isRecidivist ? ` ${RECIDIVIST_SUFFIX}` : '';
  return `${intro} ${suspect} ${witness}${recidSfx}`.trim();
}

/**
 * Generiše slučaj za dati caseIndex.
 * Slučaj 0 (prvi): tutorijalni (fiksni atributi po GDD §9).
 * Slučaj 9 (deseti): uvek crimeType='pobuna', ostali atributi random.
 * Slučajevi 1-8: proceduralni iz state._casePool.
 *
 * Menja state._casePoolIndex za slučajeve 1-8.
 *
 * @param {Object} state — game state
 * @returns {Object} currentCase objekat spreman za state.currentCase
 */
export function generateCase(state) {
  const caseIndex = state.session.caseIndex;

  let crimeType, suspectWealth, suspectAge, isRecidivist, hasWitness;

  if (caseIndex === 0) {
    // Tutorijalni slučaj — uvek isti, predvidiv (GDD §9)
    crimeType     = 'krađa';
    suspectWealth = 'srednji';
    suspectAge    = 'sredovecni';
    isRecidivist  = false;
    hasWitness    = true;
  } else if (caseIndex === 9) {
    // Finale — uvek pobuna, ostalo random
    crimeType     = 'pobuna';
    suspectWealth = WEALTH_OPTIONS[Math.floor(Math.random() * WEALTH_OPTIONS.length)];
    suspectAge    = AGE_OPTIONS[Math.floor(Math.random() * AGE_OPTIONS.length)];
    isRecidivist  = Math.random() < CONFIG.RECIDIVIST_CHANCE;
    hasWitness    = Math.random() < CONFIG.WITNESS_CHANCE;
  } else {
    // Proceduralni slučajevi 1-8: vuci iz pool-a
    const poolIdx = state._casePoolIndex;
    crimeType = state._casePool[poolIdx] ?? CRIME_TYPES[Math.floor(Math.random() * (CRIME_TYPES.length - 1))];
    state._casePoolIndex = poolIdx + 1;

    suspectWealth = WEALTH_OPTIONS[Math.floor(Math.random() * WEALTH_OPTIONS.length)];
    suspectAge    = AGE_OPTIONS[Math.floor(Math.random() * AGE_OPTIONS.length)];
    isRecidivist  = Math.random() < CONFIG.RECIDIVIST_CHANCE;
    hasWitness    = Math.random() < CONFIG.WITNESS_CHANCE;
  }

  const description = buildCaseDescription(crimeType, suspectWealth, suspectAge, hasWitness, isRecidivist);

  return {
    id: `case-${caseIndex}-${Date.now()}`,
    crimeType,
    suspectWealth,
    suspectAge,
    isRecidivist,
    hasWitness,
    descriptionTemplate: description,
    balanceScore: 0,
    playedCards: [],
    discardUsed: false,
    verdict: null
  };
}

/**
 * Shuffle Fisher-Yates helper (za buildCasePool i createState).
 * @template T
 * @param {T[]} arr
 * @returns {T[]} Novi shufflovani niz (ne menja originalni)
 */
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
