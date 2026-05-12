// =============================================================================
// data/vector-meta.js — 9 macro vector metadata (UI labels + descriptions)
// =============================================================================

export const VECTOR_ORDER = [
  'promo', 'music', 'knowledge', 'mixing', 'visual',
  'scene', 'finance', 'energy', 'reckless'
];

export const VECTORS = {
  promo: {
    id: 'promo',
    n: 'V1',
    label: 'Promo',
    icon: 'megaphone',
    short: 'Insta, priča, reel.',
    long: 'Postovi i priče. Ad budžet ako hoćeš.',
    sub_choices: {
      frequency: { label: 'Frekvencija', options: [0, 1, 3, 5], unit: 'x ned.' },
      ad_money: { label: 'Ad budžet', min: 0, max: 50, unit: 'RSD' }
    }
  },
  music: {
    id: 'music',
    n: 'V2',
    label: 'Nabavka muzike',
    icon: 'disc',
    short: 'Kupuj, traži, razmenjuj.',
    long: 'Digital, vinyl, soundcloud, drug.',
    sub_choices: {
      source: { label: 'Izvor', options: ['digital', 'vinyl', 'soundcloud', 'friend'] },
      money_invested: { label: 'Budžet', min: 0, max: 300, unit: 'RSD' }
    }
  },
  knowledge: {
    id: 'knowledge',
    n: 'V3',
    label: 'Znanje',
    icon: 'book',
    short: 'Čitanje, podkast, mentorstvo.',
    long: 'Knjige, label deep dive, sesija sa mentorom.',
    sub_choices: {
      source: { label: 'Izvor', options: ['citanje', 'podcast', 'label', 'mentor'] },
      hours: { label: 'Sati', min: 0, max: 20, unit: 'h' }
    }
  },
  mixing: {
    id: 'mixing',
    n: 'V4',
    label: 'Miks',
    icon: 'sliders',
    short: 'Vežba sa opremom.',
    long: 'Sesija — 30 min, 1h, 2h, 4h. Snimi mikstejp ako vredi.',
    sub_choices: {
      session_length: { label: 'Sesija', options: [0, 30, 60, 120, 240], unit: 'min' },
      record_mixtape: { label: 'Snimi mikstejp', type: 'bool' }
    }
  },
  visual: {
    id: 'visual',
    n: 'V5',
    label: 'Izgled',
    icon: 'shirt',
    short: 'Garderoba, fitnes, frizer.',
    long: 'Šta nosiš, kako stojiš, kako te slikaju.',
    sub_choices: {
      category: { label: 'Kategorija', options: ['none', 'garderoba', 'fitness', 'frizer', 'fotka'] }
    }
  },
  scene: {
    id: 'scene',
    n: 'V6',
    label: 'Prisustvo na sceni',
    icon: 'users',
    short: 'Mingling, druženje, gostujući set.',
    long: 'Bar, krju, nečiji rezidens.',
    sub_choices: {
      mingling_count: { label: 'Mingling izlazaka', min: 0, max: 5, unit: 'x ned.' },
      atmospheric_count: { label: 'Atmospheric hangouts', min: 0, max: 3, unit: 'x ned.' },
      guest_set: { label: 'Gostujući set ovaj put', type: 'bool' }
    }
  },
  finance: {
    id: 'finance',
    n: 'V7',
    label: 'Finansije',
    icon: 'dollar',
    short: 'Pare, sponzor, knjige.',
    long: 'Side posao, subvencija, sponzor.',
    sub_choices: {
      sponsor_outreach: { label: 'Sponzor outreach', type: 'bool' },
      bookkeeping: { label: 'Knjigovodstvo', type: 'bool' }
    }
  },
  energy: {
    id: 'energy',
    n: 'V8',
    label: 'Energija',
    icon: 'moon',
    short: 'San, joga, hobi, porodica.',
    long: 'Sve što te vraća u ovaj svet.',
    sub_choices: {
      san: { label: 'San +', type: 'bool' },
      joga: { label: 'Joga', type: 'bool' },
      setnja: { label: 'Šetnja', type: 'bool' },
      hobi: { label: 'Hobi (knjiga, sport, kuvanje)', type: 'bool' },
      porodica: { label: 'Porodični trenutak', type: 'bool' },
      mirna_nedelja: { label: 'Mirna nedelja (1x po sezoni)', type: 'bool' }
    }
  },
  reckless: {
    id: 'reckless',
    n: 'V9',
    label: 'Prkosni izbor',
    icon: 'star',
    short: 'Signature pik u žurci.',
    long: 'Kad pustiš nešto što ne pripada — ali je pripadalo.',
    locked_text: 'Zaključano dok ne stigneš Znanje tier 2.',
    is_passive: true
  }
};
