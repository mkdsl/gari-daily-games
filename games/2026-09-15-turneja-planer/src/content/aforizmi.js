/** @module content/aforizmi — "noć u jednoj rečenici", Pera Period stil */

/**
 * Pool of 25 aforizmi tagged by resource profile.
 * Tags: high_reach, low_reach, high_mood, low_mood, high_rep, low_rep, high_budget, low_budget
 * @type {Array<{text: string, tags: string[]}>}
 */
const AFORIZAM_POOL = [
  { text: 'Svi su te videli. Niko nije spavao.',                      tags: ['high_reach', 'low_mood'] },
  { text: 'Pun džep, prazan plakat. Iduća noć.',                      tags: ['high_budget', 'low_reach'] },
  { text: 'Zvuk je bio tačan. Osećaj — nešto manje.',                 tags: ['low_mood'] },
  { text: 'Reputacija raste polako. Kao testo.',                      tags: ['high_rep'] },
  { text: 'Tri grada, jedno lice u publici koje sve pamti.',           tags: ['high_reach', 'high_rep'] },
  { text: 'Minus na budžetu. Plus na priči.',                         tags: ['low_budget', 'high_rep'] },
  { text: 'Crew je umoran. Muzika nije.',                             tags: ['low_mood', 'high_reach'] },
  { text: 'Nije bio savršen nastup. Bio je pravi.',                   tags: ['high_mood'] },
  { text: 'Novac dolazi i odlazi. Atmosfera ostaje.',                  tags: ['low_budget', 'high_mood'] },
  { text: 'Publika je pila, pevala, zaboravila brige. Posao urađen.', tags: ['high_reach', 'high_mood'] },
  { text: 'Budžet kaže ne. Vibe kaže još.',                          tags: ['low_budget', 'high_mood'] },
  { text: 'Reach bez duše. Svi gledaju, niko ne čuje.',               tags: ['high_reach', 'low_mood'] },
  { text: 'Reputacija je jedina valuta koja ne inflira.',             tags: ['high_rep'] },
  { text: 'Nijedan nastup nije zaista poslednji.',                    tags: ['low_budget', 'low_reach'] },
  { text: 'Crew peva na povratku. Dobar znak.',                       tags: ['high_mood'] },
  { text: 'Sponzor plati. Komad integriteta — ne.',                   tags: ['high_budget', 'low_rep'] },
  { text: 'Hladna dvorana, vruć set. Publika ne prašta kompromis.',   tags: ['low_rep'] },
  { text: 'Zora, parkiralište, tišina. Ovo je zanat.',                tags: ['low_mood', 'low_reach'] },
  { text: 'Svaki grad je sezona za sebe.',                            tags: [] },
  { text: 'Bass je memorija. Publika je ne zna, ali je nosi.',        tags: ['high_reach', 'high_mood', 'high_rep'] },
  { text: 'Nije poента biti poznat. Poenta je biti čuven.',           tags: ['low_reach', 'high_rep'] },
  { text: 'Budžet je prepolovljen. Priča nije.',                      tags: ['low_budget'] },
  { text: 'Mood 4. Muzika 9. Jaz koji se zaboravlja.',               tags: ['low_mood'] },
  { text: 'Gledali su screen, ne binu. Savremena publika.',           tags: ['high_reach', 'low_mood'] },
  { text: 'Jedna noć, jedan grad, jedan razlog zašto.',               tags: [] },
];

/**
 * Pick an aforizam based on current resource state.
 * Called once per city result screen.
 * @param {{ reach: number, crew_mood: number, reputation: number, budget: number }} resources
 * @returns {string}
 */
export function getCityAforizam(resources) {
  const { reach, crew_mood, reputation, budget } = resources;
  const active = new Set();
  if (reach >= 20) active.add('high_reach'); else active.add('low_reach');
  if (crew_mood >= 6) active.add('high_mood'); else if (crew_mood <= 3) active.add('low_mood');
  if (reputation >= 7) active.add('high_rep'); else if (reputation < 5) active.add('low_rep');
  if (budget >= 1000) active.add('high_budget'); else if (budget < 300) active.add('low_budget');

  const scored = AFORIZAM_POOL.map(a => ({
    ...a,
    score: a.tags.filter(t => active.has(t)).length,
  }));
  const maxScore = Math.max(...scored.map(s => s.score));
  const candidates = scored.filter(s => s.score === maxScore);
  return candidates[Math.floor(Math.random() * candidates.length)].text;
}
