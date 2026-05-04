// src/precedents.js — Presedant sistem (GDD §3)
// Definiše listu presedant efekata, generisanje presedant karte posle presude,
// primenu automatskih efekata na početku slučaja, countdown i uklanjanje.

import { CONFIG } from './config.js';

/**
 * Tabela: koja presedant karta se generiše za kombinaciju presude + crimeType (GDD §3).
 * Ključ: `${verdict}_${crimeType}` (verdict: 'guilty' | 'free')
 * @type {Object.<string, {type: string, value: number}>}
 */
export const PRECEDENT_GENERATION_TABLE = {
  'guilty_nasilje':            { type: 'zakon',    value: +2 },
  'guilty_krađa':              { type: 'dokaz',    value: +2 },
  'guilty_korupcija':          { type: 'zakon',    value: +3 },
  'guilty_ubistvo':            { type: 'zakon',    value: +4 },
  'guilty_prevara':            { type: 'svedok',   value: +2 },
  'guilty_nasilje u porodici': { type: 'karakter', value: +2 },
  'guilty_sitna krađa':        { type: 'dokaz',    value: +1 },
  'guilty_pobuna':             { type: 'zakon',    value: +3 },

  'free_nasilje':              { type: 'karakter', value: -2 },
  'free_krađa':                { type: 'zakon',    value: -2 },
  'free_korupcija':            { type: 'karakter', value: -3 },
  'free_ubistvo':              { type: 'zakon',    value: -3 },
  'free_prevara':              { type: 'svedok',   value: -2 },
  'free_nasilje u porodici':   { type: 'karakter', value: -2 },
  'free_sitna krađa':          { type: 'dokaz',    value: -1 },
  'free_pobuna':               { type: 'zakon',    value: -2 }
};

/**
 * Lista svih mogućih presedant efekata (p01–p15) (GDD §3).
 * @type {Object[]}
 */
export const PRECEDENT_EFFECTS = [
  {
    id: 'p01', name: 'Posedovanje = dokaz',
    description: 'Automatski: balance +2 na početku slučaja.',
    effect: { target: 'balance', delta: +2, condition: null }
  },
  {
    id: 'p02', name: 'Mladi su nevinost',
    description: 'Ako je optuženi mlad: balance -2.',
    effect: { target: 'balance', delta: -2, condition: 'age_mlad' }
  },
  {
    id: 'p03', name: 'Bogatstvo = sumnja',
    description: 'Ako je optuženi bogat: balance +2.',
    effect: { target: 'balance', delta: +2, condition: 'wealth_bogat' }
  },
  {
    id: 'p04', name: 'Recidiv = nemilosrdno',
    description: 'Ako je recidivist: balance +3.',
    effect: { target: 'balance', delta: +3, condition: 'isRecidivist' }
  },
  {
    id: 'p05', name: 'Svedok = sveto',
    description: 'Sve svedok karte: value × 1.5 (zaokruženo).',
    effect: { target: 'card_multiplier', cardType: 'svedok', multiplier: 1.5, condition: null }
  },
  {
    id: 'p06', name: 'Zakon se tumači',
    description: 'Sve zakon karte: value × 0.5 (zaokruženo).',
    effect: { target: 'card_multiplier', cardType: 'zakon', multiplier: 0.5, condition: null }
  },
  {
    id: 'p07', name: 'Vlast prašta bogatima',
    description: 'Ako je optuženi bogat: balance -2.',
    effect: { target: 'balance', delta: -2, condition: 'wealth_bogat' }
  },
  {
    id: 'p08', name: 'Masa traži pravdu',
    description: 'KRIV: masa +5. SLOBODAN: masa -5.',
    effect: { target: 'masa_on_verdict', guiltyDelta: +5, freeDelta: -5, condition: null }
  },
  {
    id: 'p09', name: 'Bez svedoka = sumnja',
    description: 'Ako nema svedoka: balance +1.',
    effect: { target: 'balance', delta: +1, condition: 'noWitness' }
  },
  {
    id: 'p10', name: 'Karakter govori',
    description: 'Sve karakter karte: value × 2.',
    effect: { target: 'card_multiplier', cardType: 'karakter', multiplier: 2, condition: null }
  },
  {
    id: 'p11', name: 'Žrtva je sistem',
    description: 'Automatski: balance -1 na početku slučaja.',
    effect: { target: 'balance', delta: -1, condition: null }
  },
  {
    id: 'p12', name: 'Nulta tolerancija',
    description: 'Automatski: balance +1 na početku slučaja.',
    effect: { target: 'balance', delta: +1, condition: null }
  },
  {
    id: 'p13', name: 'Vlast voli red',
    description: 'KRIV: vlast +5. SLOBODAN: vlast -5.',
    effect: { target: 'vlast_on_verdict', guiltyDelta: +5, freeDelta: -5, condition: null }
  },
  {
    id: 'p14', name: 'Starci su mudri',
    description: 'Ako je optuženi star: balance -2.',
    effect: { target: 'balance', delta: -2, condition: 'age_star' }
  },
  {
    id: 'p15', name: 'Siromašni su nevini',
    description: 'Ako je optuženi siromašan: balance -2.',
    effect: { target: 'balance', delta: -2, condition: 'wealth_siromasan' }
  }
];

/** Interni brojač za jedinstvene ID-jeve presedant karata */
let _precedentCardCounter = 0;

/**
 * Generiše novu presedant kartu posle presude i dodaje je u state.deck i state.precedents.
 * Presedant karta se ne igra iz ruke — njen efekat se primenjuje automatski.
 *
 * @param {Object} state — game state (currentCase.verdict, currentCase.crimeType)
 * @returns {Object|null} Generisani presedant objekat, ili null ako nije moguće generisati
 */
export function generatePrecedent(state) {
  const verdict   = state.currentCase.verdict;
  const crimeType = state.currentCase.crimeType;

  // Pretvori 'guilty'/'free' u ključ sa engleskim prefiksom + crimeType
  const tableKey = `${verdict}_${crimeType}`;
  const cardSpec = PRECEDENT_GENERATION_TABLE[tableKey];
  if (!cardSpec) {
    console.warn(`[precedents] Nema tabele za: ${tableKey}`);
    return null;
  }

  // Nasumično izaberi presedant efekat
  const effectTemplate = PRECEDENT_EFFECTS[Math.floor(Math.random() * PRECEDENT_EFFECTS.length)];

  // Jedinstven ID za presedant i karticu
  _precedentCardCounter++;
  const uniqueId = `prec_${state.session.caseIndex}_${_precedentCardCounter}`;

  // Kreiraj presedant objekat koji se upisuje u state.precedents
  const precedent = {
    id:              uniqueId,
    name:            effectTemplate.name,
    description:     effectTemplate.description,
    effect:          effectTemplate.effect,
    casesRemaining:  CONFIG.PRECEDENT_DURATION,
    cardId:          uniqueId  // referenca na odgovarajuću karticu u deck-u
  };

  // Kreiraj karticu koja se ubacuje u state.deck
  const precedentCard = {
    id:             uniqueId,
    name:           `Presedant: ${effectTemplate.name}`,
    type:           cardSpec.type,
    value:          cardSpec.value,
    effect:         'precedent',
    precedentId:    uniqueId,
    precedentEffect: effectTemplate.effect,
    casesRemaining: CONFIG.PRECEDENT_DURATION
  };

  // Ubaci kartu na nasumičnu poziciju u deck-u (da se ne pojavi uvek prva/poslednja)
  const insertIdx = Math.floor(Math.random() * (state.deck.length + 1));
  state.deck.splice(insertIdx, 0, precedentCard);

  // Dodaj presedant u aktivne presedante
  state.precedents.push(precedent);

  // Zabeleži u stats
  state.stats.precedentsCreated.push(effectTemplate.name);

  return precedent;
}

/**
 * Primenjuje automatske efekte aktivnih presedanata na currentCase.balanceScore.
 * Poziva se na POČETKU slučaja, pre vuče karata (GDD §3, §5).
 * Efekti tipa 'balance' se primenjuju odmah; 'card_multiplier' se primenjuje pri igranju karte.
 *
 * @param {Object} state — game state (menja state.currentCase.balanceScore)
 */
export function applyPrecedentEffectsOnCaseOpen(state) {
  for (const precedent of state.precedents) {
    const eff = precedent.effect;

    // Primenjujemo samo 'balance' efekte — ostali tipovi se primenjuju drugde
    if (eff.target !== 'balance') continue;

    if (checkPrecedentCondition(eff.condition, state.currentCase)) {
      state.currentCase.balanceScore += eff.delta;
    }
  }
}

/**
 * Vraća efektivnu vrednost karte uzimajući u obzir aktivne presedante (p05, p06, p10).
 * Poziva se u trenutku igranja karte.
 *
 * @param {Object} card — karta koja se igra
 * @param {Object[]} precedents — state.precedents
 * @returns {number} Efektivna value karte (zaokružena na ceo broj)
 */
export function getEffectiveCardValue(card, precedents) {
  let value = card.value;

  for (const precedent of precedents) {
    const eff = precedent.effect;
    if (eff.target === 'card_multiplier' && eff.cardType === card.type) {
      value = Math.round(value * eff.multiplier);
    }
  }

  return value;
}

/**
 * Smanjuje casesRemaining svim aktivnim presedantima za 1.
 * Uklanja presedante sa casesRemaining <= 0 iz state.precedents
 * i premešta njihove karte u discardPile (ili uklanja iz deck-a/ruke).
 * Poziva se POSLE presude, u fazi 'reputation'.
 *
 * @param {Object} state — game state
 */
export function tickPrecedents(state) {
  const expired = [];
  const active  = [];

  for (const precedent of state.precedents) {
    precedent.casesRemaining--;
    if (precedent.casesRemaining <= 0) {
      expired.push(precedent);
    } else {
      active.push(precedent);
    }
  }

  // Ukloni istekle presedante
  state.precedents = active;

  // Za svaki istekli presedant — pronađi kartu u deck-u ili ruci i premesti u discard
  for (const precedent of expired) {
    const cardId = precedent.cardId ?? precedent.id;

    // Traži u deck-u
    const deckIdx = state.deck.findIndex(c => c.id === cardId);
    if (deckIdx !== -1) {
      const [card] = state.deck.splice(deckIdx, 1);
      state.discardPile.push(card);
      continue;
    }

    // Traži u ruci
    const handIdx = state.hand.findIndex(c => c.id === cardId);
    if (handIdx !== -1) {
      const [card] = state.hand.splice(handIdx, 1);
      state.discardPile.push(card);
      continue;
    }

    // Karta je već u discardPile (odigrana ili odbačena) — nema akcije
  }

  // Ažuriraj casesRemaining na karticama u deck-u koje su još aktivne
  for (const precedent of active) {
    const cardId = precedent.cardId ?? precedent.id;
    const card = state.deck.find(c => c.id === cardId)
              ?? state.hand.find(c => c.id === cardId);
    if (card) {
      card.casesRemaining = precedent.casesRemaining;
    }
  }
}

/**
 * Proverava uslov presedant efekta u odnosu na currentCase.
 * Pomoćna funkcija za applyPrecedentEffectsOnCaseOpen.
 *
 * @param {string|null} condition — string condition iz effect objekta
 * @param {Object} caseObj — state.currentCase
 * @returns {boolean} Da li se uslov ispunjava
 */
export function checkPrecedentCondition(condition, caseObj) {
  if (condition === null) return true;
  switch (condition) {
    case 'age_mlad':         return caseObj.suspectAge    === 'mlad';
    case 'age_star':         return caseObj.suspectAge    === 'star';
    case 'wealth_bogat':     return caseObj.suspectWealth === 'bogat';
    case 'wealth_siromasan': return caseObj.suspectWealth === 'siromasan';
    case 'isRecidivist':     return caseObj.isRecidivist  === true;
    case 'noWitness':        return caseObj.hasWitness    === false;
    default:
      console.warn(`[precedents] Nepoznat condition: ${condition}`);
      return false;
  }
}
