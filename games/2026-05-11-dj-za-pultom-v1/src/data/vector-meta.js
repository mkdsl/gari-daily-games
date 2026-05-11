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
    short: 'Insta, stori, reel.',
    long: 'Postovi i story-ji. Ad budzet ako hoces.',
    sub_choices: {
      frequency: { label: 'Frekvencija', options: [0, 1, 3, 5], unit: 'x/wk' },
      ad_money: { label: 'Ad budzet', min: 0, max: 50, unit: 'RSD' }
    }
  },
  music: {
    id: 'music',
    n: 'V2',
    label: 'Music nabavka',
    icon: 'disc',
    short: 'Kupuj, traži, razmenjuj.',
    long: 'Digital, vinyl, soundcloud, drug.',
    sub_choices: {
      source: { label: 'Izvor', options: ['digital', 'vinyl', 'soundcloud', 'friend'] },
      money_invested: { label: 'Budzet', min: 0, max: 300, unit: 'RSD' }
    }
  },
  knowledge: {
    id: 'knowledge',
    n: 'V3',
    label: 'Knowledge',
    icon: 'book',
    short: 'Citanje, podcast, mentorstvo.',
    long: 'Knjige, label deep dive, sesija sa mentorom.',
    sub_choices: {
      source: { label: 'Izvor', options: ['citanje', 'podcast', 'label', 'mentor'] },
      hours: { label: 'Sati', min: 0, max: 20, unit: 'h' }
    }
  },
  mixing: {
    id: 'mixing',
    n: 'V4',
    label: 'Mixing',
    icon: 'sliders',
    short: 'Vezba sa opremom.',
    long: 'Sesija — 30 min, 1h, 2h, 4h. Snimi mixtape ako vredi.',
    sub_choices: {
      session_length: { label: 'Sesija', options: [0, 30, 60, 120, 240], unit: 'min' },
      record_mixtape: { label: 'Snimi mixtape', type: 'bool' }
    }
  },
  visual: {
    id: 'visual',
    n: 'V5',
    label: 'Izgled',
    icon: 'shirt',
    short: 'Garderoba, fitnes, frizer.',
    long: 'Sta nosis, kako stojis, kako te slikaju.',
    sub_choices: {
      category: { label: 'Kategorija', options: ['none', 'garderoba', 'fitness', 'frizer', 'fotka'] }
    }
  },
  scene: {
    id: 'scene',
    n: 'V6',
    label: 'Scene Presence',
    icon: 'users',
    short: 'Mingling, druzenje, guest set.',
    long: 'Bar, crew, neciji rezidens.',
    sub_choices: {
      mingling_count: { label: 'Mingling izlazaka', min: 0, max: 5, unit: 'x/wk' },
      atmospheric_count: { label: 'Atmospheric hangouts', min: 0, max: 3, unit: 'x/wk' },
      guest_set: { label: 'Guest set ovaj put', type: 'bool' }
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
      sponsor_outreach: { label: 'Sponsor outreach', type: 'bool' },
      bookkeeping: { label: 'Bookkeeping', type: 'bool' }
    }
  },
  energy: {
    id: 'energy',
    n: 'V8',
    label: 'Energija',
    icon: 'moon',
    short: 'San, joga, hobi, porodica.',
    long: 'Sve sto te vraca u ovaj svet.',
    sub_choices: {
      san: { label: 'San +', type: 'bool' },
      joga: { label: 'Joga', type: 'bool' },
      setnja: { label: 'Setnja', type: 'bool' },
      hobi: { label: 'Hobby (knjiga, sport, kuvanje)', type: 'bool' },
      porodica: { label: 'Porodicni moment', type: 'bool' },
      mirna_nedelja: { label: 'Mirna nedelja (1x/sezona)', type: 'bool' }
    }
  },
  reckless: {
    id: 'reckless',
    n: 'V9',
    label: 'Reckless Selection',
    icon: 'star',
    short: 'Signature pick u zurci.',
    long: 'Kad pustis nesto sto ne pripada — ali pripadalo je.',
    locked_text: 'Zakljucano dok ne stignes Knowledge tier 2.',
    is_passive: true
  }
};
