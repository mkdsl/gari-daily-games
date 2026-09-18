/**
 * brand_hooks.js — Masterclass facts po receptu (MKDSLend), Guncati branding hooks.
 * Veze između igre i brendova za share/ending screen.
 */

/** @type {Object.<string, string[]>} */
export const MASTERCLASS_FACTS = {
  ajvar: [
    'Guncati Masterclass: Pravi ajvar peče se na drva, ne na plin. Dim daje dušu.',
    'MKDSLend radionice: Ajvar od domaće paprike vs. uvozne — razlika je vidljiva na boji.',
    'Tom Sawyer model: Zajedničko pravljenje ajvara gradi zajednicu. Pozovi komšije.',
  ],
  tursija: [
    'Guncati: Turšija u kamenim posudama vs. plastici — mikrobiom nije isti.',
    'MKDSLend: Fermentisana hrana je probiotik koji naši preci nisu morali da kupuju.',
  ],
  rakija: [
    'Guncati legat: Do 50L domaće rakije godišnje — legalno, lokalno, autentično.',
    'MKDSLend Distillery: Šljiva sa imanja, destilacija na imanju. Spiritus loci.',
  ],
  kiseli_kupus: [
    'Bačva kiselog kupusa: Tradicija koja briše granicu između prehrambene industrije i doma.',
    'Guncati: Kiseli kupus sa sopstvenom pH vrednošću — svaka bačva je drugačija.',
  ],
  pekmez: [
    'Pekmez od šljive kuvao se nekad po 4 sata uz mešanje. Strpljenje je recept.',
    'MKDSLend: Bez pektina, bez konzervansa — samo šljiva i vreme.',
  ],
  default: [
    'Zimovnica nije samo hrana. Zimovnica je nezavisnost.',
    'Guncati — Zabavni radni park. Naučiti raditi rukom ponovo.',
    'MKDSLend: Sve što se može napraviti kod kuće — napravimo kod kuće.',
  ],
};

/** @type {Object} */
export const GUNCATI_HOOKS = {
  events: [
    { id: 'masterclass_promo', text: 'Guncati Masterclass: Pravljenje ajvara — prijavi se na mkdslend.rs' },
    { id: 'imanje_visit', text: 'Poseti Guncati imanje i pravi zimovnicu sa lokalnom zajednicom.' },
  ],
  share_text: 'Napravio/la sam zimovnicu! 🫙 Guncati x MKDSLend #zimovnica #guncati #domaće',
};

/**
 * Vraća masterclass fact za dati recept.
 * @param {string} recipeId
 * @returns {string}
 */
export function getMasterclassFact(recipeId) {
  const pool = MASTERCLASS_FACTS[recipeId] || MASTERCLASS_FACTS.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generiše share tekst za ending.
 * @param {string} endingId
 * @param {object} state
 * @returns {string}
 */
export function getEndingShareText(endingId, state) {
  const jarCount = state.tegle.reduce((s, j) => s + j.qty, 0).toFixed(0);
  return `Zimovnica: ${jarCount} kg zasnovano za zimu! ${GUNCATI_HOOKS.share_text}`;
}
