// content/aforizmi.js — 8 Pera Period mikro-aforizmi za sinergija momente

/** @type {string[]} */
export const AFORIZMI = [
  'Kad svako zna šta mu je posao, zvuk se sam sređuje.',
  'Ekipa koja se čuje — publika koja ostaje.',
  'Sinergíja níje slučajnost. Slučajnost je kad je nema.',
  'Pravi tim ne pita "ko radi šta" — zna.',
  'Kada klupci rade zajedno, niko ne primeti napor.',
  'Dobra ekipa je nevidljiva. Loša — nažalost, nije.',
  'Vibe nije muzika. Vibe je sve između muzike.',
  'Nastup pamte sekunde. Te sekunde grade meseci pripreme.'
];

/**
 * Return a random aforizam.
 * @returns {string}
 */
export function getRandomAforizam() {
  return AFORIZMI[Math.floor(Math.random() * AFORIZMI.length)];
}
