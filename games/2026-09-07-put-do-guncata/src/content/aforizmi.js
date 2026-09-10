/**
 * aforizmi.js — Pera Period aforizam pool
 * Radio overlay (etapa 1-2) + etapa5 finale (po ruti/bucketu)
 */

/**
 * 12 radio aforizama za etapa1-2 overlay.
 * Ton: filozofski, urbano-seljački, DJ-life, share-friendly.
 * @type {string[]}
 */
export const RADIO_AFORIZMI = [
  'Put je uvek kraći kad se ne žuri, a uvek duži kad se kasni.',
  'Gorivo se prazni. Muzika ostaje.',
  'Kasnio na žurku, stigao na legendu.',
  'Svaki skretnik je bio jednom prava odluka.',
  'Autoput te ne vodi kući — vodi tamo gde si odlučio da ideš.',
  'Jutro miriše na benzin i mogućnosti. Uglavnom benzin.',
  'DJ-set bez zvučnika je samo playlist. Zvučnik si ti.',
  'Kilometri nemaju veze sa udaljenošću. Zavisi kuda se vozite.',
  'Svaka karaoke pesma je bila jednom bunt. Sada je tradicija.',
  'Kasno je termin za sunce, ne za ljude koji znaju kuda idu.',
  'Mapa laže. Instinkt kasni. A ipak stižemo.',
  'Seoska rasveta ne sija za turiste — sija jer neko čeka.'
];

/**
 * 6 finale aforizama — 1 po kombinaciji (ruta × bucket, samo 6, ne 9).
 * Koristi key format: "${route}_${bucket}"
 * Pokrivenost: sve 3 rute × green + 3 humor varijante (yellow deli sa green).
 * @type {Record<string, string>}
 */
export const FINALE_AFORIZMI = {
  brze_green:       'Brzina je alat. Znaš kada da pritisneš papučicu i kada da parkiraš.',
  brze_humor:       'Stigao si prvim. Mapa je bila opciona od početka.',
  slikovitije_green:'Ono što si video usput — to ne prodaje Google Maps.',
  slikovitije_humor:'Skrenuo si. Tamo gde si skrenuo bila je pola priče.',
  sigurnije_green:  'Polako i jasno — Guncati kaže da si stigao kao što je i trebalo.',
  sigurnije_humor:  'Stigao si. Niko ko stigne pogrešnim putem nije stvarno pogrešio.'
};

/**
 * Vraća finale aforizam za dati route i bucket.
 * Ako kombinacija ne postoji, vraća generički.
 * @param {string} route - 'brze'|'slikovitije'|'sigurnije'
 * @param {string} bucket - 'green'|'yellow'|'humor'
 * @returns {string}
 */
export function getFinaleAforizam(route, bucket) {
  // yellow deli aforizam sa green
  const effectiveBucket = bucket === 'yellow' ? 'green' : bucket;
  const key = `${route}_${effectiveBucket}`;
  return FINALE_AFORIZMI[key] || 'Svaki put koji si prošao bio je pravi put.';
}

/**
 * Event-tied aforizmi po Kluboslavija stanici — Pera Period edicija turneje 2026.
 * Svaka stanica ima 2-3 linije koje ulaze i u opšti radio pool.
 * @type {Record<string, string[]>}
 */
export const KLUBOSLAVIJA_AFORIZMI = {
  avala: [
    'Avala gleda sa vrha. DJ set, sat-dva. Sve ostalo je beg od rutine.',
    'Trčanje gore-dole je sport. Trčanje bez cilja je šetnja. Razlika je zvučnik.'
  ],
  strandFest: [
    'Štrand ne pravi pravila. Štrand čuva sećanja.',
    'Peščani sat se ne okreće na Štrandu — tamo vreme stoji i gleda u vodu.'
  ],
  sarajevo: [
    'Sarajevo pamti. Ne sve — ali dovoljno da te nauči nešto kad prođeš.',
    'Ćevap i muzika su isti jezik, samo drugačiji alfabet.'
  ],
  guncati: [
    'Guncati nije destinacija. Guncati je dokaz da si stigao.',
    'Jezero se ne otključava ključem — otključava se kilometrima.',
    'Na kraju svakog pravog puta čeka neko ko nije znao da te čeka.'
  ]
};

/** Svi event aforizmi spljošteni u jedan niz — za upadanje u radio pool */
const _EVENT_FLAT = Object.values(KLUBOSLAVIJA_AFORIZMI).flat();

/**
 * Vraća slučajni radio aforizam.
 * Može da isključi već prikazane (po indeksu).
 * @param {Set<number>} [shownIndices]
 * @returns {{ text: string, index: number }}
 */
export function getRandomRadioAforizam(shownIndices = new Set()) {
  const pool = [...RADIO_AFORIZMI, ..._EVENT_FLAT];
  const available = pool
    .map((text, index) => ({ text, index }))
    .filter(({ index }) => !shownIndices.has(index));

  if (available.length === 0) {
    // Sve prikazano — resetuj i kreni iznova
    const index = Math.floor(Math.random() * pool.length);
    return { text: pool[index], index };
  }

  const picked = available[Math.floor(Math.random() * available.length)];
  return picked;
}
