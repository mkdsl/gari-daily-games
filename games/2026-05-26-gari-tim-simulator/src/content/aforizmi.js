// aforizmi.js — Kratki citati po liku za flavor text
import { CHARACTERS } from './characters.js';

export const AFORIZMI = {
  gari: CHARACTERS.gari.aforizmi,
  mici: CHARACTERS.mici.aforizmi,
  brana: CHARACTERS.brana.aforizmi,
  tonket: CHARACTERS.tonket.aforizmi,
  dule: CHARACTERS.dule.aforizmi,
  pera: CHARACTERS.pera.aforizmi,
};

export function getRandomAforizm(characterKey) {
  const list = AFORIZMI[characterKey];
  if (!list || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
}
