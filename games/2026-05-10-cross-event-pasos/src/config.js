// config.js — stamp registry i konstante

export const STAMPS = [
  {
    slug: 'avala-run',
    display_name: 'Avala Run',
    color: '#2D6A4F',
    claim_type: 'manual',
    game_url: 'https://mkdsl.github.io/gari-daily-games/games/2026-05-06-avala-run/',
    description: 'DJ kasni. Avala čeka. Sakupljao/la si smeće i karte kroz noćnu šumu.',
    event_date: '2026-05-06'
  },
  {
    slug: 'aforizam-generator',
    display_name: 'Aforizam Generator',
    color: '#1B3A6B',
    claim_type: 'manual',
    game_url: 'https://mkdsl.github.io/gari-daily-games/games/2026-05-08-aforizam-generator/',
    description: 'Kliknuo/la si. Dobio/la aforizam. Podelio/la za IG story.',
    event_date: '2026-05-08'
  },
  {
    slug: 'dj-za-pultom',
    display_name: 'DJ za Pultom',
    color: '#6B2FA0',
    claim_type: 'manual',
    game_url: 'https://mkdsl.github.io/gari-daily-games/games/2026-05-09-dj-za-pultom/',
    description: 'Vodio/la si pult 6 sati. Publika nije otišla kući.',
    event_date: '2026-05-09'
  },
  {
    slug: 'jesenji-tok',
    display_name: 'Jesenji Tok',
    color: '#C1440E',
    claim_type: 'manual',
    game_url: 'https://mkdsl.github.io/gari-daily-games/games/2026-09-04-jesenji-tok/',
    description: 'Ti si Brana. 12 nedelja pre zime, 6 parcela, radovi koji ne čekaju.',
    event_date: '2026-09-04'
  }
  // TODO: buduće igre — dodaj slug ovde I u pasos-sdk.js SLUG_WHITELIST
  // Format: { slug, display_name, color, claim_type: 'auto'|'manual', game_url, description, event_date }
];

export const REWARD_THRESHOLDS = {
  avatar_frame: 3,
  ekipni_covek: 5,
  crew_member: 7
};

export const REWARD_META = {
  avatar_frame: {
    label: 'Avatar Frame',
    icon: '🖼️',
    desc: 'Zlatni okvir za tvoj profil. Pravi Klubnik zna.'
  },
  ekipni_covek: {
    label: 'Ekipni Čovek',
    icon: '🤝',
    desc: '5 igara, 5 pečata. Ekipa te prepoznaje.'
  },
  crew_member: {
    label: 'Crew Member',
    icon: '⭐',
    desc: 'Sve igre. Sve pečate. Legenda GDG 2026.'
  }
};

export const STORAGE_PREFIX = 'pasos_stamp_';
export const STORAGE_PROFILE = 'gdg_pasos_profile';
export const STORAGE_REWARDS = 'gdg_pasos_rewards';
export const STORAGE_STATE   = 'gdg_pasos_state';
export const STORAGE_CREW    = 'gdg_crew_member';
