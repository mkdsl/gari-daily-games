/**
 * branching-tree.js
 * Etapa3→4→5 grananje: definicije ruta, epilog matrica, tekst matrica
 */

/** @type {Record<string, { label: string, description: string, deltaHint: string, deltaValue: number, icon: string }>} */
export const ROUTES = {
  brze: {
    label: 'Brže',
    description: 'Autoput direktno. Brže, ali skuplje.',
    deltaHint: '+5 pripremljenosti (brzina), -3 (gorivo)',
    deltaValue: 2,
    icon: '⚡'
  },
  slikovitije: {
    label: 'Slikovitije',
    description: 'Seoskim putem kraj Branine farme.',
    deltaHint: '+8 pripremljenosti (iskustvo), -1 (vreme)',
    deltaValue: 7,
    icon: '🌿'
  },
  sigurnije: {
    label: 'Sigurnije',
    description: 'Zaobilazan put, bez rizika.',
    deltaHint: '+3 pripremljenosti (sigurnost)',
    deltaValue: 3,
    icon: '🛡️'
  }
};

// Bazni tekst po score bucketu
export const BASE_TEXTS = {
  green: {
    title: 'Stigao si spreman.',
    body: 'Guncati te čeka. Jezero blista, ribnjak zuri u nebo, i neko sa obale maše.',
    cta: 'Odigraj Guncati Grand →'
  },
  yellow: {
    title: 'Stigao si.',
    body: 'Odmori se malo. Jezero će biti tu i posle ručka. Nisi zakasnio — samo si putovao svog tempa.',
    cta: null
  },
  humor: {
    title: 'Sledećeg puta, možda mapa?',
    body: 'Stigao si. Pogrešnim putem, ali stigao. Jezero izgleda isto bez obzira na kojoj strani obale izađeš.',
    cta: null
  }
};

// Flavor rečenice po ruti (ubacuju se u bazni tekst, 1 rečenica pre body-ja)
export const ROUTE_FLAVORS = {
  brze: {
    green: 'Prošao si pored žitnog polja bez zastajanja — brzina kao plan koji je uspeo.',
    yellow: 'Brzina je koštala malo mira usput.',
    humor: 'Brzina bez plana — klasika.'
  },
  slikovitije: {
    green: 'Sećaš se glasa sa jezera — Brana te čeka na doku, kaže nešto o ribama i septembru.',
    yellow: 'Pejzaž je bio lep, ali si zakasnio na deo priče.',
    humor: 'Gledao si pejzaž umesto puta. Iskreno, vredelo je.'
  },
  sigurnije: {
    green: 'Bezbedno, korak po korak, stigao si tačno na vreme — kao što si i planirao.',
    yellow: 'Nije bilo brzo, ali jeste bilo mirno.',
    humor: 'Bezbedno vozio, bezbedno se izgubio. Nema ničeg lošeg u sigurnom zabludi.'
  }
};

// Night mode (prestige) zatvorna linija (zamenjuje poslednju rečenicu epiloga)
export const NIGHT_CLOSINGS = {
  green: 'Mesec je već visoko kad parkiraš. Odlično vreme za dolazak.',
  yellow: 'Mesec te prati ceo put. Ni on ne žuri.',
  humor: 'Bar zvezde su lepe. Niko ti ne može oduzeti zvezde.'
};

/**
 * Vraća kompletan epilog tekst za dati state.
 * @param {{ route: string, scoreBucket: string, isNightMode: boolean }} params
 * @returns {{ title: string, flavor: string, body: string, closing: string|null, cta: string|null }}
 */
export function buildEpilog({ route, scoreBucket, isNightMode }) {
  const base = BASE_TEXTS[scoreBucket] || BASE_TEXTS.humor;
  const flavors = ROUTE_FLAVORS[route] || ROUTE_FLAVORS.sigurnije;
  const flavor = flavors[scoreBucket] || flavors.humor;
  const closing = isNightMode ? (NIGHT_CLOSINGS[scoreBucket] || NIGHT_CLOSINGS.humor) : null;

  return {
    title: base.title,
    flavor,
    body: base.body,
    closing,
    cta: base.cta
  };
}

/**
 * Naknadne misli na ulasku u etapu 4 — direktno imenuju izabranu rutu iz etape 3.
 * Daju osećaj posledica pre nego što prepreke počnu.
 * @type {Record<string, string>}
 */
export const ETAPA4_INTRO_THOUGHTS = {
  brze:        'Brži put — ali niko nije rekao da je i ravniji.',
  slikovitije: 'Slikovitiji put — slike ostaju. Vreme ne čeka.',
  sigurnije:   'Sigurniji put — i dalje put. I dalje šuma.'
};

/**
 * Putničke beleške — zatvaraju narativni luk izabrane rute na kraju etape 4, pre epiloga.
 * 3 rute × 3 score bucket-a = 9 varijanti.
 * @type {Record<string, Record<string, string>>}
 */
export const PUTNICKE_BELEZKE = {
  brze: {
    green:  'Autoput je bio surov. I dalje si stigao prvi. Guncati to pamti.',
    yellow: 'Brzina te je koštala mira. Ali vremena ima — jezero čeka.',
    humor:  'Kamion, radovi, čekanje na pumpi. Ipak si tu. Nekako.'
  },
  slikovitije: {
    green:  'Brana te je pogledala s međe. Neke ljude vidiš jednom i zapamtiš. On je takav.',
    yellow: 'Sela si prolazio brže nego što bi trebalo. Sledeći put — stani.',
    humor:  'Krava, makadan, Brana koji nešto viče za tobom. Klasičan put do Guncatija.'
  },
  sigurnije: {
    green:  'Naplatna rampa, zaobilaznica, tišina. Plan je radio. Plan uvek radi kad mu veruješ.',
    yellow: 'Bezbedan put je i spor put. Stigao si — to je poenta.',
    humor:  'Zaobilazan put bez table. Kompas unutra govori gore. A ti si tu — nekako.'
  }
};

/**
 * Vraća putničku belešku za datu rutu i score bucket.
 * @param {string} route - 'brze'|'slikovitije'|'sigurnije'
 * @param {string} scoreBucket - 'green'|'yellow'|'humor'
 * @returns {string}
 */
export function getPutnickebelezke(route, scoreBucket) {
  const routeData = PUTNICKE_BELEZKE[route] || PUTNICKE_BELEZKE.sigurnije;
  return routeData[scoreBucket] || routeData.yellow;
}

/**
 * Etapa4 grananje — prepreke na putu po ruti
 * Svaka ruta ima drugačiji skup prepreka.
 * @type {Record<string, Array<{ id: string, label: string, deltaRange: [number, number], icon: string }>>}
 */
export const ETAPA4_OBSTACLES = {
  brze: [
    { id: 'autoput_radovi', label: 'Radovi na autoputu', deltaRange: [-8, -3], icon: '🚧' },
    { id: 'kamion_kolona', label: 'Kolona kamiona', deltaRange: [-6, -2], icon: '🚛' },
    { id: 'benzinska_ceka', label: 'Cekanje na benzinskoj', deltaRange: [-4, -1], icon: '⛽' }
  ],
  slikovitije: [
    { id: 'seoski_put', label: 'Makadamski put', deltaRange: [-5, -1], icon: '🪨' },
    { id: 'krava_na_putu', label: 'Krava na putu', deltaRange: [-3, 2], icon: '🐄' },
    { id: 'brana_susret', label: 'Susret sa Branom', deltaRange: [2, 8], icon: '🤝' }
  ],
  sigurnije: [
    { id: 'zaobilaznica', label: 'Zaobilaznica bez table', deltaRange: [-4, -1], icon: '🔄' },
    { id: 'naplatna_rampa', label: 'Naplatna rampa', deltaRange: [-2, 0], icon: '💶' },
    { id: 'miren_put', label: 'Mir otvorenog puta', deltaRange: [1, 4], icon: '🛤️' }
  ]
};

/**
 * Odabere slučajne prepreke za etapu4 na osnovu rute.
 * @param {string} route
 * @param {number} count - koliko prepreka (default 2)
 * @returns {Array}
 */
export function pickEtapa4Obstacles(route, count = 2) {
  const pool = ETAPA4_OBSTACLES[route] || ETAPA4_OBSTACLES.sigurnije;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
