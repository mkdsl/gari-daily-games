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
    label: 'Promo (Insta + Stori)',
    icon: 'megaphone',
    short: 'Gradi RSVP + Recognizability',
    long: 'Insta postovi, story-ji, reel-ovi. Boost-uj sa ad money ako zelis.',
    sub_choices: {
      frequency: { label: 'Frekvencija', options: [0, 1, 3, 5], unit: 'x/wk' },
      ad_money: { label: 'Ad budzet', min: 0, max: 50, unit: 'RSD' }
    }
  },
  music: {
    id: 'music',
    n: 'V2',
    label: 'Music research (nabavka)',
    icon: 'disc',
    short: 'Music katalog rast + Knowledge baseline',
    long: 'Digital store, vinyl, soundcloud rip, friend trade. Razlicite brzine i dubina.',
    sub_choices: {
      source: { label: 'Izvor', options: ['digital', 'vinyl', 'soundcloud', 'friend'] },
      money_invested: { label: 'Budzet', min: 0, max: 300, unit: 'RSD' }
    }
  },
  knowledge: {
    id: 'knowledge',
    n: 'V3',
    label: 'Knowledge (čitanje, slušanje, mentorstvo)',
    icon: 'book',
    short: 'Knowledge tier 0-7. Gating za Reckless Selection.',
    long: 'Citanje, podcast, label deep dive, mentor session. Diminishing returns.',
    sub_choices: {
      source: { label: 'Izvor', options: ['citanje', 'podcast', 'label', 'mentor'] },
      hours: { label: 'Sati', min: 0, max: 20, unit: 'h' }
    }
  },
  mixing: {
    id: 'mixing',
    n: 'V4',
    label: 'Mixing skill (vežba, snimanje)',
    icon: 'sliders',
    short: 'Mixing tier 0-7. Glavni gating za set quality.',
    long: 'Vezba sa real opremom. Session intensity rast: 30min / 1h / 2h / 4h. Snimanje mixtape = bonus.',
    sub_choices: {
      session_length: { label: 'Sesija', options: [0, 30, 60, 120, 240], unit: 'min' },
      record_mixtape: { label: 'Snimi mixtape', type: 'bool' }
    }
  },
  visual: {
    id: 'visual',
    n: 'V5',
    label: 'Izgled (garderoba, fitnes, frizer)',
    icon: 'shirt',
    short: 'Visual tier 0-7. Showman path pristupacnost.',
    long: 'Garderoba (skupo), fitness (vreme, gratis), frizer, fotka. Klasa modifikuje cost.',
    sub_choices: {
      category: { label: 'Kategorija', options: ['none', 'garderoba', 'fitness', 'frizer', 'fotka'] }
    }
  },
  scene: {
    id: 'scene',
    n: 'V6',
    label: 'Scene Presence (composite)',
    icon: 'users',
    short: 'Mingling + Atmospheric + Guest sets. Gradi Network + Reputation.',
    long: 'Tab 1: Mingling (barovi). Tab 2: Atmospheric (crew bonding). Tab 3: Guest sets (booking).',
    sub_choices: {
      mingling_count: { label: 'Mingling izlazaka', min: 0, max: 5, unit: 'x/wk' },
      atmospheric_count: { label: 'Atmospheric hangouts', min: 0, max: 3, unit: 'x/wk' },
      guest_set: { label: 'Guest set ovaj put', type: 'bool' }
    }
  },
  finance: {
    id: 'finance',
    n: 'V7',
    label: 'Finansije (cash flow, sponzor)',
    icon: 'dollar',
    short: 'Bookkeeping, sponsor outreach, gig negotiation.',
    long: 'Side income (radna klasa sljakanje), Bogata deca subvencija, sponsor inflow.',
    sub_choices: {
      sponsor_outreach: { label: 'Sponsor outreach', type: 'bool' },
      bookkeeping: { label: 'Bookkeeping', type: 'bool' }
    }
  },
  energy: {
    id: 'energy',
    n: 'V8',
    label: 'Energija (odmor, hobby, porodica)',
    icon: 'moon',
    short: 'Recovery — Energy + Health regen + Hobby (Normalnost + Reckless buff).',
    long: 'San, joga, setnja, hobi, mirna nedelja, porodicni moment. Hobby = Reckless breakthrough buff.',
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
    label: 'Reckless Selection (passive)',
    icon: 'star',
    short: 'Signature music identity. Aktivira se u Micro layer-u (žurka).',
    long: 'Kad pustis track u Micro-u, oznaci ga kao "signature". Knowledge tier 2+ gating.',
    locked_text: 'Otkljucava se kad dostignes Knowledge tier 2.',
    is_passive: true
  }
};
