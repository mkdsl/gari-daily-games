/**
 * dialogues.js — Narativni tekst po etapi (5 etapa × varijante)
 * Ton: kratak, filmski, ne tutorial-ish.
 */

/**
 * Svaka etapa ima: intro tekst, opcioni outro/tip, opcioni ambient.
 * Etapa 5 ima 3 varijante (po score bucketu).
 */

export const ETAPA_DIALOGUES = {
  /** Etapa 1 — Beograd, parking */
  etapa1: {
    intro: [
      '06:42. Beograd spava.',
      'DJ kasni — naravno.',
      'Oprema čeka ispred kluba. Parkiranje na ulici je trik koji poznaješ.',
    ],
    tip: 'Nađi parking mesto pre nego što komšija izađe.',
    ambient: 'Negde u daljini, auto kreće.'
  },

  /** Etapa 2 — Autoput E75, gorivo i vreme */
  etapa2: {
    intro: [
      'E75. Ravnica se prostire do horizontaL.',
      'Rezervoar: 60%. Vreme do Guncatija: tri sata ako sve bude po planu.',
      'Ništa nikad nije po planu.'
    ],
    tip: 'Gorivo i vreme — pazi na oba.',
    ambient: 'Radio hvatata signal i gubi ga. Nešto se peva.'
  },

  /** Etapa 3 — Seoska raskrsnica, tri table */
  etapa3: {
    intro: [
      'Raskrsnica.',
      'Tri table, tri pravca.',
      'Svaka kaže "Guncati" na sebi na drugačiji način.'
    ],
    tip: null,
    ambient: null
  },

  /** Etapa 4 — Šuma, mrak, prepreke */
  etapa4: {
    intro: [
      'Put ulazi u šumu.',
      'Senci se menjaju, asfalt se lomi.',
      'Ovde se dešavaju stvari.'
    ],
    tip: null,
    ambient: 'Ptice. Grane. Tiho.'
  },

  /** Etapa 5 — Dolazak na jezero (varijante po score bucketu) */
  etapa5: {
    green: {
      intro: [
        'Jezero.',
        'Oduvek je tako izgledalo u tvojoj glavi.',
        'Stigao si.'
      ]
    },
    yellow: {
      intro: [
        'Jezero.',
        'Sunce je nisko. Vozio si duže nego što si planirao.',
        'Ali evo ga.'
      ]
    },
    humor: {
      intro: [
        'Jezero.',
        'Nije ovo strana na kojoj si planirao da stigneš.',
        'Ali jeste jezero.'
      ]
    }
  }
};

/**
 * Unutrašnje misli pred svaku tablu u etapi 3 — 3 table × 3 raspoloženja = 9 varijanti.
 * Raspoloženje se određuje po pripremljenosti: 'high' (>70), 'mid' (40-70), 'low' (<40).
 * Igrač oseća dramsku dilemu, ne samo UI labelu.
 * @type {Record<string, Record<string, string>>}
 */
export const ETAPA3_SIGN_THOUGHTS = {
  brze: {
    high: 'Stigao sam ovde dovoljno brzo. Zašto da sad usporem?',
    mid:  'Brža ruta. Ima smisla — ako gorivo drži.',
    low:  'Možda nije trenutak za eksperiment sa brzinom.'
  },
  slikovitije: {
    high: 'Ima još vremena. Zašto ne videti nešto usput?',
    mid:  'Sela imaju šta da kažu. Pitanje je da li ima uha za to.',
    low:  'Lepše, ali sporije. Imam li luksuz sporosti?'
  },
  sigurnije: {
    high: 'Zašto bezbednost kad sam spreman? Ali... šuma ne pita.',
    mid:  'Zaobilazan put. Manje rizika — manje priče.',
    low:  'Nije trenutak za junačenje. Sigurniji put.'
  }
};

/**
 * Vraća unutrašnju misao za dati znak i raspoloženje igrača.
 * @param {'brze'|'slikovitije'|'sigurnije'} sign
 * @param {number} score - trenutna pripremljenost
 * @returns {string}
 */
export function getEtapa3SignThought(sign, score) {
  const mood = score > 70 ? 'high' : score >= 40 ? 'mid' : 'low';
  const signData = ETAPA3_SIGN_THOUGHTS[sign];
  if (!signData) return '';
  return signData[mood] || signData.mid;
}

/**
 * Vraća intro linije za etapu.
 * Za etapu 5 — po score bucketu.
 * @param {number} etapa - 1–5
 * @param {{ scoreBucket?: string }} [opts]
 * @returns {string[]}
 */
export function getIntroLines(etapa, opts = {}) {
  const key = `etapa${etapa}`;
  const data = ETAPA_DIALOGUES[key];
  if (!data) return [];

  if (etapa === 5) {
    const bucket = opts.scoreBucket || 'green';
    return (data[bucket] || data.green).intro;
  }

  return data.intro || [];
}

/**
 * Vraća tip liniju za etapu (ako postoji).
 * @param {number} etapa
 * @returns {string|null}
 */
export function getTip(etapa) {
  const key = `etapa${etapa}`;
  const data = ETAPA_DIALOGUES[key];
  return data ? (data.tip || null) : null;
}

/**
 * Vraća ambient liniju za etapu (ako postoji).
 * @param {number} etapa
 * @returns {string|null}
 */
export function getAmbient(etapa) {
  const key = `etapa${etapa}`;
  const data = ETAPA_DIALOGUES[key];
  return data ? (data.ambient || null) : null;
}

/**
 * Etapa 2 — mid-journey unutrašnji monolog, aktivira se prvom promenom radio stanice.
 * Ton: introspekcija, kratko snimanje daha pre random eventa. Bez promene mehanike.
 * @type {string[]}
 */
export const ETAPA2_RADIO_MONOLOG = [
  'Promenio/la si stanicu.',
  'Nova melodija — isto nebo.',
  'Autoput je samo linija koja spaja dve odluke.',
  '...',
  'Vozi dalje.'
];

/**
 * Vraća monolog linije za etapa 2 radio break.
 * @returns {string[]}
 */
export function getEtapa2RadioMonolog() {
  return ETAPA2_RADIO_MONOLOG;
}

/**
 * Inline dialogue linije za ključne momente u igri.
 * Koriste se u scene overlay-u van etapa intro/outro.
 */
export const MOMENT_DIALOGUES = {
  parkingSuccess:   'Savršeno. Sat i pol do polaska.',
  parkingFail:      'Kasniš sat vremena. Pomeramo raspored.',
  gorivoCritical:   'Rezervoar treptavih. Sledeća stanica — nade.',
  gorivoOk:         'Goriva ima. Problemi dolaze posle.',
  kravaSusret:      'Krava na putu. Normalno za ovaj deo Srbije.',
  branaGreeting:    'Brana te vidi izdaleka i mahne.',
  obstacleCleared:  'Prošlo.',
  obstacleFailed:   'Nisi to video.',
  finalStretch:     'Još malo. Osećaš jezero pre nego što ga vidiš.'
};
