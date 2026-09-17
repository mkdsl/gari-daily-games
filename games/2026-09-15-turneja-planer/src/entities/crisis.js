/** @module entities/crisis — crisis card defs (prestige-only hard events) */

/**
 * @typedef {Object} CrisisCard
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Array<{label:string, effects:Object}>} options
 * @property {number} prestige_min - min prestige level to draw this
 */

/** @type {CrisisCard[]} */
export const CRISIS_CARDS = [
  {
    id: 'C01',
    title: 'Medijski skandal',
    description: 'Novinari objavljuju negativnu priču tačno pre tvog headlining nastupa.',
    options: [
      { label: 'A: Press konferencija odmah', effects: { reputation: -0.5, reach: 2.0 } },
      { label: 'B: Pravni tim', effects: { budget: -500, reputation: 0.3 } },
      { label: 'C: Ćuti i sviraj', effects: { reputation: -1.5 } },
    ],
    prestige_min: 1,
  },
  {
    id: 'C02',
    title: 'Oprema ukradena',
    description: 'Sav sound equipment nestao iz vana tokom noći.',
    options: [
      { label: 'A: Kupi zamenu hitno', effects: { budget: -1200, cq_bonus: -0.5 } },
      { label: 'B: Pozajmi od lokalnih', effects: { cq_bonus: -1.5, reputation: -0.3 } },
      { label: 'C: Kanceli nastup', effects: { reputation: -3.0, budget: -300 } },
    ],
    prestige_min: 1,
  },
  {
    id: 'C03',
    title: 'DJ bolesni',
    description: 'Marko DJ ima temperaturu 39. Nastup za 6 sati.',
    options: [
      { label: 'A: Support DJ preuzima', effects: { cq_bonus: -1.0 } },
      { label: 'B: Marko svira bolesni', effects: { cq_bonus: -0.5, crew_mood: -2.0 } },
      { label: 'C: Guest DJ iz publike', effects: { reputation: 0.5, random: true } },
    ],
    prestige_min: 2,
  },
  {
    id: 'C04',
    title: 'Venue bankrotira',
    description: 'Klub je zatvoren dan pre nastupa — nema para, nema prostora.',
    options: [
      { label: 'A: Improvizirani outdoor', effects: { budget: -200, reach: 1.5, cq_bonus: -1.0 } },
      { label: 'B: Pronađi alternativu', effects: { budget: -400, cq_bonus: -0.5 } },
      { label: 'C: Otkazi', effects: { reputation: -2.0 } },
    ],
    prestige_min: 2,
  },
  {
    id: 'C05',
    title: 'Masovni odlazak fanova',
    description: 'Rival DJ najavljuje isti termin u istom gradu. 40% prodatih karata vraćeno.',
    options: [
      { label: 'A: Spusti cenu last-minute', effects: { budget: -300, reach: 2.0 } },
      { label: 'B: Ekskluzivni sadržaj', effects: { reputation: 1.0, crew_mood: -0.5 } },
      { label: 'C: Prihvati', effects: { cq_bonus: -1.0 } },
    ],
    prestige_min: 3,
  },
];

/**
 * Draw a crisis card appropriate for current prestige level
 * @param {number} prestige_level
 * @param {string[]} drawn_ids - already drawn IDs (no repeat)
 * @returns {CrisisCard|null}
 */
export function drawCrisisCard(prestige_level, drawn_ids) {
  const eligible = CRISIS_CARDS.filter(
    c => c.prestige_min <= prestige_level && !drawn_ids.includes(c.id)
  );
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}
