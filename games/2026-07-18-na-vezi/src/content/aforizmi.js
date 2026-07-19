/** Mikro-aforizmi za emisija outcome ekran (inner monologue) */

/** Aforizmi po tipu ishoda */
export const AFORIZMI = {
  great: [
    'Signal stabilan. Srce takođe.',
    'Kad se sve posloži, zvuči kao muzika.',
    'Nije tehnika pobedila. Bila je to strpljivost.',
    'Guncati diše. Mi snimamo dah.',
    'Svaki rešen alarm je mala pobeda nad haosom.',
    'Emisija je gotova. Publika ostaje.',
    'Baterija puna. Ideje isto.',
    'TikTok je uhvatio. Instagram je zadržao.',
    'Tri platforme, jedan ritam.',
    'Kad sve radi, nema šta da se kaže. Samo se osmehneš.',
  ],
  good: [
    'Nije savršeno, ali je iskreno.',
    'Neke greške su dokaz da smo živi.',
    'Bitno je da signal nije pao zauvek.',
    'Guncati televizija uči u hodu.',
    'Svaka emisija je vežba za sledeću.',
    'Nije alarm problem — problem je kad ga ne rešiš.',
    'Publika zna kad si prisutan, čak i kad laguje.',
    'Uptime je mišić. Trenira se emisijom.',
    'Polako je tempo iskusnih.',
    'Stabilnost dolazi posle nestabilnosti.',
  ],
  ok: [
    'Moglo je bolje. Ali moglo je i gore.',
    'Signal je pao. Ustao je.',
    'Baterija je upozorila. Nismo slušali. Sad znamo.',
    'Svaki lajv je lekcija.',
    'Chat je bio sporiji danas. Publika vidi sve.',
    'Nije bio naš dan, ali dan je prošao.',
    'Gost nije stigao. Nastup je.',
    'Bez savršene emisije nema ni prave emisije.',
    'Povratna informacija boli kratko. Pomaže dugo.',
    'Sledećeg puta — bolje.',
  ],
  poor: [
    'Signal je pao. Ostalo je iskustvo.',
    'Baterija je praznija. Lekcija je punija.',
    'Nije bila naša nedelja. Biće nas.',
    'Kad sve puca, pamtiš šta je važno.',
    'Gost nije stigao. Mi jesmo.',
    'Tehnički problemi nisu kraj. Predaja jeste.',
    'Ovakve emisije grade izdržljivost.',
    'Nije broj pratilaca. Broj pokušaja.',
    'Svaki pad signala je test karaktera.',
    'Danas je bio težak. Sutra je nova šansa.',
  ],
};

/**
 * Vraća nasumični aforizam za tip ishoda
 * @param {'great'|'good'|'ok'|'poor'} outcomeType
 * @returns {string}
 */
export function getAforizam(outcomeType) {
  const pool = AFORIZMI[outcomeType] || AFORIZMI.ok;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Određuje tip ishoda na osnovu engagement-a
 * @param {number} engagement 0-1
 * @returns {'great'|'good'|'ok'|'poor'}
 */
export function getOutcomeType(engagement) {
  if (engagement >= 0.75) return 'great';
  if (engagement >= 0.55) return 'good';
  if (engagement >= 0.35) return 'ok';
  return 'poor';
}
