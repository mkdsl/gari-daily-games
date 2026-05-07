// state.js — Quiz state mašina
// GDD: Mile Mehanika | 2026-05-07 | v1.0

import { QUESTIONS } from './config.js';

/**
 * Centralni state objekat.
 * - currentQ: indeks trenutnog pitanja (0–7 tokom quiza, 8 = završen)
 * - scores: akumulirani bodovi po arhetip
 * - answers: niz objekata { questionId, chosenIndex, scores } — za tiesbreak
 */
export const state = {
  currentQ: 0,
  scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0 },
  answers: []
};

/**
 * recordAnswer — beleži odgovor i ažurira state.
 * @param {string} questionId — npr. 'Q1'
 * @param {object} scores — { DJ:0, PK:1, ... } iz config.js
 * @param {number} chosenIndex — indeks odabranog odgovora (0, 1 ili 2)
 */
export function recordAnswer(questionId, scores, chosenIndex) {
  // Akumuliraj bodove
  for (const key of Object.keys(scores)) {
    state.scores[key] += scores[key];
  }

  // Zapamti odgovor za tiesbreak
  state.answers.push({ questionId, chosenIndex, scores });

  // Pomeri na sledeće pitanje
  state.currentQ += 1;
}

/**
 * calculateResult — vraća ključ pobedničkog arhetipa.
 *
 * Tiesbreak procedura (GDD §5):
 * 1. Ako postoji jedinstven maksimum → taj arhetip pobeđuje.
 * 2. Ako tie → proveri Q8: pobednik je onaj od kandidata koji je bodovan na Q8.
 * 3. Ako Q8 ne razrešava → proveri Q7.
 * 4. Ako Q7 ne razrešava → proveri Q6.
 * 5. Hard fallback → 'DJ' (GDD §5, dizajnerska odluka Mile Mehanika)
 *
 * Edge case — svi skorovi 0 (korumpirani state u dev/test modu):
 * Vraća 'SE' — semantički najispravniji fallback (GDD §8, Edge case 1).
 */
export function calculateResult() {
  const { scores, answers } = state;

  // Edge case: svi skorovi su 0
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return 'SE';
  }

  const max = Math.max(...Object.values(scores));
  const tied = Object.keys(scores).filter(k => scores[k] === max);

  // Jedinstven pobednik
  if (tied.length === 1) {
    return tied[0];
  }

  // Tiesbreak: Q8 → Q7 → Q6
  // answersMap: { Q1: archKey, Q2: archKey, ... } — koji arhetip je dobio bod na tom pitanju
  const answersMap = {};
  for (const ans of answers) {
    // Pronađi arhetip koji je bodovan na ovom pitanju
    const scoredArch = Object.keys(ans.scores).find(k => ans.scores[k] > 0);
    if (scoredArch) {
      answersMap[ans.questionId] = scoredArch;
    }
  }

  for (const qId of ['Q8', 'Q7', 'Q6']) {
    const winner = answersMap[qId];
    if (winner && tied.includes(winner)) {
      // Tačno jedan od tiesbreak kandidata je bodovan na ovom pitanju
      const scoredOnQ = tied.filter(arch => arch === winner);
      if (scoredOnQ.length === 1) {
        return scoredOnQ[0];
      }
    }
  }

  // FALLBACK: Ultra-rare tie koji sekundarni skor ne razrešava.
  // DJ je default po dizajnerskoj odluci (ne po poziciji u nizu).
  // Ver. 1.0 — Mile Mehanika, 2026-05-07
  return 'DJ';
}

/**
 * resetState — vraća state na početak.
 * Poziva se na "Igraj ponovo".
 */
export function resetState() {
  state.currentQ = 0;
  state.scores = { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0 };
  state.answers = [];
}
