/** @module content/cities — city flavor text, venue descriptions, aforizmi po gradu */

/** @type {Record<string, Object>} */
export const CITY_FLAVOR = {
  beograd: {
    tagline: 'Početak svega. Beograd ne prašta, ali pamti.',
    venue_desc: {
      klub: 'Splavovi uz Savu, underground bunker u Savamali.',
      open_air: 'Kalemegdan u vazduhu, ceo grad vidi.',
      imanje: 'Privatna vila na Senjaku — ekskluzivno.',
    },
    arrival_msg: 'Matični grad. Publika poznaje tvoje bugove.',
    win_msg: 'Beograd je tvoj.',
    atmosphere: 'Vreo, kritičan, glasan. Ništa ti ne prolazi.',
    aforizmi: [
      'U Beogradu svaki DJ misli da je Bog.',
      'Ovaj grad je radio i bez tebe.',
      'Partija ne prestaje — smenjuju se samo lideri.',
    ],
  },
  novi_sad: {
    tagline: 'Exit grad. Ovde su standardi visoki kao Exit lineup.',
    venue_desc: {
      klub: 'Skriveni haus klub u Petrovaradinu.',
      open_air: 'Tvrđava — istorija ispod, techno iznad.',
      imanje: 'Salaš u Vojvodini, čista akustika.',
    },
    arrival_msg: 'Vojvodina te gleda mirno. Pokaži šta znaš.',
    win_msg: 'Vojvođani te prihvatili. To nešto znači.',
    atmosphere: 'Profinjen, šarmantan, diskretno strog.',
    aforizmi: [
      'Novi Sad sluša srcem, a pamti umom.',
      'Na Tvrđavi svaka nuta ima eho.',
      'Vojvodina te ne voli brzo — ali zauvek, kad te zavoli.',
    ],
  },
  nis: {
    tagline: 'Jug koji ne laže. Iskren do bola.',
    venue_desc: {
      klub: 'Stari grad klub — zidovi Mediane još čuju.',
      open_air: 'Niška tvrđava pod zvezdama.',
      imanje: 'Komšijino dvorište, grill i techno.',
    },
    arrival_msg: 'Niš ne veruje reklami. Mora da čuje uživo.',
    win_msg: 'Jug te pozdravlja. Pravi posao.',
    atmosphere: 'Direktan, vruć, bez filtera.',
    aforizmi: [
      'Niš zna kad lažeš — čak i beat.',
      'Ovde aplauzu veruješ.',
      'Jug je uvek bio ispred.',
    ],
  },
  sarajevo: {
    tagline: 'Balkan srce. Energija koja se ne može objasniti.',
    venue_desc: {
      klub: 'Klub u starom Gradu, miris kahve i piva.',
      open_air: 'Baščaršija ili Skenderija — grad pleše.',
      imanje: 'Kuća u planini, zvuk se odbija od brda.',
    },
    arrival_msg: 'Carinski prelaz preživ. Sad mora da se svira.',
    win_msg: 'Sarajevo te zavolelo. Retko se dešava.',
    atmosphere: 'Bogat, topao, nepredvidiv.',
    aforizmi: [
      'Sarajevo te ne pita odakle si — samo da li igraš.',
      'Ovde svaki set nosi istoriju.',
      'Bosna ti daje više nego što uzima.',
    ],
  },
  guncati: {
    tagline: 'Finale. Tom Sawyer na selu. Authentično ili nikako.',
    venue_desc: {
      klub: 'Nema kluba — svi su napolju.',
      open_air: 'Livada kraj šume, zvezde bez svetlosnog zagađenja.',
      imanje: 'MKDSLend imanje — permakultura i bass.',
    },
    arrival_msg: 'Stigli ste. Guncati ne prašta lažni sjaj.',
    win_msg: 'Guncati grand finale. Ovo je bilo pravo.',
    atmosphere: 'Zemlja, vatru, iskrenost. Nije za slabog srca.',
    aforizmi: [
      'U Guncatima znaš ko si zaista.',
      'Šuma čuje sve — i što si sakrio u Beogradu.',
      'Povratak na selo nije korak unazad.',
    ],
  },
};

/**
 * Get a random aforizam for a city
 * @param {string} city_id
 * @returns {string}
 */
export function getCityAforizam(city_id) {
  const aforizmi = CITY_FLAVOR[city_id]?.aforizmi || ['...'];
  return aforizmi[Math.floor(Math.random() * aforizmi.length)];
}

/**
 * Get city arrival message
 * @param {string} city_id
 * @returns {string}
 */
export function getArrivalMsg(city_id) {
  return CITY_FLAVOR[city_id]?.arrival_msg || 'Stigli ste.';
}

/**
 * Get city tagline
 * @param {string} city_id
 * @returns {string}
 */
export function getCityTagline(city_id) {
  return CITY_FLAVOR[city_id]?.tagline || '';
}
