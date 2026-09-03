// content/aforizmi.js — Pera Period mikro-aforizmi: 3 trigger pools (16 ukupno)

/** Synergy ≥ 4 pool — euphoric, team-energy (6) */
const AFORIZMI_SYNERGY = [
  'Kad svako zna šta mu je posao, zvuk se sam sređuje.',
  'Ekipa koja se čuje — publika koja ostaje.',
  'Sinergíja níje slučajnost. Slučajnost je kad je nema.',
  'Pravi tim ne pita "ko radi šta" — zna.',
  'Kada klupci rade zajedno, niko ne primeti napor.',
  'Dobra ekipa je nevidljiva. Loša — nažalost, nije.',
];

/** Crisis pool — Vibe < 30, Pera u padu: kratke, rezignirane, crnohumore (5) */
const AFORIZMI_CRISIS = [
  'Ekipa je tu. Ali vibe — vibe je negde otišao.',
  'Kad niko ne svira isto, ni gosti ne ostaju.',
  'Ovako se završavaju nastupe koji su počeli bez plana.',
  'Neki timovi se raspare pre nego što publika stigne.',
  'Rezignacija je tiha. Zvuči kao kraj bez aplauza.',
];

/** Finale pool — phase-6, high-vibe ton (Vibe ≥ 50) (3) */
const AFORIZMI_FINALE_HIGH = [
  'Vibe nije muzika. Vibe je sve između muzike.',
  'Nastup pamte sekunde. Te sekunde grade meseci pripreme.',
  'Ovo je ona noć koja se pamti — bez objašnjenja.',
];

/** Finale pool — phase-6, low-vibe ton (Vibe < 50) (2) */
const AFORIZMI_FINALE_LOW = [
  'Nije svaki nastup legenda. Ali svaki nastup nešto uči.',
  'Kraj je kraj — bez obzira na vibe.',
];

/**
 * Return a contextual aforizam based on trigger.
 * @param {'synergy'|'crisis'|'finale'} [context]
 * @param {number} [vibeScore] - used for finale pool selection (high ≥ 50 / low < 50)
 * @returns {string}
 */
export function getContextualAforizam(context, vibeScore = 50) {
  let pool;
  if (context === 'crisis') {
    pool = AFORIZMI_CRISIS;
  } else if (context === 'finale') {
    pool = vibeScore >= 50 ? AFORIZMI_FINALE_HIGH : AFORIZMI_FINALE_LOW;
  } else {
    pool = AFORIZMI_SYNERGY;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Return a random synergy aforizam (backward-compat alias).
 * @returns {string}
 */
export function getRandomAforizam() {
  return getContextualAforizam('synergy');
}
