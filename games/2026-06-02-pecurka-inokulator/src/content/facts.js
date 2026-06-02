// content/facts.js — Guncati edukativni fakti za rotaciju

export const GUNCATI_FACTS_GAMEOVER = [
  'Micelij je mozak pečurke. Inokulacijom ubacuješ tu "misao" u supstrat.',
  'Kontaminacija se dešava u mikro-sekundama. Sterilnost nije hobij, to je zanat.',
  'Pleurotus raste za 10–14 dana od inokulacije. Ove pečurke su za ~ 12. jul.',
  'Na Guncati imanju, Alatko priprema prvu inokulacionu radionicu jesen 2026.',
];

export const GUNCATI_FACTS_LEVELCLEAR = [
  'Supstrat za Pleurotus je najčešće slama — pasterizovana, ne sterilizovana.',
  'Micelij može prekriti 1kg supstrata za 7–10 dana na 20°C.',
  'Ganoderma (Reishi) raste sporije — 3-4 meseca, ali vredi čekati.',
  'Svaki inokulant gradi sopstveni ritam. Tvoj je 220ms — majstor.',
];

/**
 * Vraća fakt iz niza, ciklično.
 * @param {Array<string>} arr
 * @param {number} index
 * @returns {string}
 */
export function getRandomFact(arr, index) {
  return arr[Math.abs(index) % arr.length];
}
