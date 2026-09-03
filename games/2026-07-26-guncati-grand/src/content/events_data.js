/** @fileoverview 10 Finale event definitions: trigger, options, effects */

/**
 * @typedef {Object} FinaleEvent
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {number} [triggerMin] - minute of game to trigger
 * @property {number[]} [triggerMinRange] - [min, max] random window
 * @property {string} [triggerCond] - condition string (evaluated at runtime)
 * @property {boolean} [periodic] - repeats on interval
 * @property {number} [everyMin] - interval for periodic
 * @property {boolean} [autoResolve] - auto-applies without player choice
 * @property {Object[]} [options]
 * @property {Object} [effect] - for autoResolve
 */

export const FINALE_EVENTS = [
  {
    id: 'crowd_surge',
    triggerMin: 3,
    triggerCond: 'crowd >= 0.8',
    title: 'Navala Publike!',
    description: 'Više publike nego što smo planirali. Šta radimo?',
    options: [
      {
        text: '🚪 Otvori kapiju',
        desc: 'Pusti sve unutra — prihodi rastu, vibe pada',
        revenueDelta: 0.15,
        moodDelta: -10
      },
      {
        text: '🔒 Zatvori kapiju',
        desc: 'Ostajemo na kapacitetu — stabilan vibe',
        revenueDelta: 0,
        moodDelta: 0
      }
    ]
  },
  {
    id: 'equipment_fail',
    triggerMinRange: [4, 8],
    random: true,
    title: 'PA Sistem Pao!',
    description: 'Zvuk je nestao. Publika negoduje. Brza odluka!',
    options: [
      {
        text: '🔊 Rezervni PA (-200 GC)',
        desc: 'Brz popravak, manji udar na raspoloženje',
        costDelta: 200,
        moodDelta: -5
      },
      {
        text: '⏸️ Pauza 2 min',
        desc: 'Čekamo tehničare — publika se ljuti',
        moodDelta: -15,
        revenueDelta: -0.08
      }
    ]
  },
  {
    id: 'vip_guest',
    triggerMin: 5,
    triggerCond: 'seasonMarketingSpent >= 80',
    title: 'VIP Gost!',
    description: 'Lokalna zvezda želi da prisustvuje. Marketing je radi!',
    options: [
      {
        text: '🌟 Backstage pristup',
        desc: 'Dobijamo prihod i reputaciju',
        gcDelta: 300,
        reputationDelta: 10
      },
      {
        text: '🙅 Ignorisi',
        desc: 'Ostajemo privatni',
        gcDelta: 0
      }
    ]
  },
  {
    id: 'rain_cloud',
    triggerMinRange: [6, 10],
    random: true,
    title: 'Oblak ide!',
    description: 'Kišni oblak se nadvio. Da li smo pripremljeni?',
    options: [
      {
        text: '⛺ Šatre (zahteva Šatre L1+)',
        desc: 'Publika je zaštićena — manji udar',
        moodDelta: -5,
        requiresBuilding: 'satre',
        requiresBuildingLevel: 1
      },
      {
        text: '☔ Kišobrani',
        desc: 'Improvizujemo — publika se rasipa',
        moodDelta: -15,
        revenueDelta: -0.1
      }
    ]
  },
  {
    id: 'bar_shortage',
    triggerMin: 7,
    triggerCond: 'buildings.bar < 2',
    title: 'Bar ostao bez zaliha!',
    description: 'Piće ponestalo. Publika je žedna i nezadovoljna.',
    options: [
      {
        text: '🚚 Hitna nabavka (-150 GC)',
        desc: 'Skupo ali rešava problem',
        costDelta: 150,
        moodDelta: 5
      },
      {
        text: '🤷 Nastavi bez pića',
        desc: 'Prihodi od bara padaju drastično',
        revenueDelta: -0.2
      }
    ]
  },
  {
    id: 'dj_transition',
    periodic: true,
    everyMin: 5,
    title: 'DJ Smena!',
    description: 'Klikni CUE NEXT DJ za savršen prelaz! (3 sec prozor)',
    isTransition: true,
    goodEffect: { hypeDelta: 20 },
    badEffect: { hypeDelta: -10 }
  },
  {
    id: 'mood_crash',
    triggerCond: 'crowdMood < 40',
    title: 'Publika se duri!',
    description: 'Raspoloženje pada. Nešto treba da se desi.',
    options: [
      {
        text: '🎵 DJ promena seta (gubi 1 slot)',
        desc: 'DJ improvizuje — raspoloženje skače',
        moodDelta: 25,
        costSlot: 1
      },
      {
        text: '🎪 Volonteri zabavljaju',
        desc: 'Zahteva prosečan Vibe >= 70',
        moodDelta: 15,
        requiresVibeAvg: 70
      }
    ]
  },
  {
    id: 'local_media',
    triggerMin: 10,
    triggerCond: 'reputation >= 50',
    title: 'Lokalni Mediji!',
    description: 'Novinar sa kamerom čeka te. Sjajno za brandiranje!',
    options: [
      {
        text: '🎤 Daj intervju (pauza 1 min)',
        desc: 'Reputacija raste, prihodi padaju kratko',
        reputationMult: 1.3,
        revenueDelta: -0.05
      },
      {
        text: '🚫 Odbij',
        desc: 'Fokus na finalu',
        gcDelta: 0
      }
    ]
  },
  {
    id: 'light_fail',
    triggerMinRange: [8, 12],
    random: true,
    title: 'Rasveta Pala!',
    description: 'Sve je tamno. Publika se zbunila.',
    options: [
      {
        text: '⚡ Backup generator (-100 GC)',
        desc: 'Brza rešenja skupo koštaju',
        costDelta: 100,
        moodDelta: 0
      },
      {
        text: '🕯️ Ambijentalna svetla',
        desc: 'Romantična atmosfera — neplanirano, ali radi',
        moodDelta: 5,
        costDelta: 0
      }
    ]
  },
  {
    id: 'spontaneous_community',
    triggerCond: 'communityVibe >= 80',
    title: 'Komšije pomažu!',
    description: 'Meštani spontano donose hranu i pomažu. Zajednica cveta!',
    autoResolve: true,
    effect: { wellbeingDelta: 20, moodDelta: 10 }
  }
];

/**
 * Venue skin configs for Kluboslavija 2026 tour stops.
 * Consumed by state.venueSkin (set before game start) — default 'guncati'.
 * @type {Record<string, { id: string, name: string, crowdCapMult: number, weatherProfile: { rainProbability: number }, brandTagline: string }>}
 */
export const VENUE_CONFIGS = {
  guncati: {
    id: 'guncati',
    name: 'Guncati Grand Finale',
    crowdCapMult: 1.0,
    weatherProfile: { rainProbability: 0.25 },
    brandTagline: 'Zabavni radni park povratka na selo — finalna scena sezone.'
  },
  strand: {
    id: 'strand',
    name: 'Štrand, Novi Sad',
    crowdCapMult: 1.25,
    weatherProfile: { rainProbability: 0.30 },
    brandTagline: 'Štrand reke nosi muziku dalje — voda, svetla, Kluboslavija.'
  },
  sarajevo: {
    id: 'sarajevo',
    name: 'Sarajevo',
    crowdCapMult: 0.90,
    weatherProfile: { rainProbability: 0.40 },
    brandTagline: 'Sarajevo nosi dah. Sve što se odigra ovde zvuči večito.'
  }
};

/**
 * Get venue config by id, fallback to 'guncati'
 * @param {string} [venueId]
 * @returns {Object}
 */
export function getVenueConfig(venueId) {
  return VENUE_CONFIGS[venueId] || VENUE_CONFIGS.guncati;
}

/**
 * Venue-specific event override texts — same events, different flavour per venue.
 * Returns an object keyed by event id, with fields to override (title, description).
 * @param {string} [venueId]
 * @returns {Record<string, Partial<FinaleEvent>>}
 */
export function getVenueEventOverrides(venueId) {
  if (venueId === 'strand') {
    return {
      rain_cloud: {
        title: 'Vojvodinska Grmljavina!',
        description: 'Letnja oluja ide prema Štrandu. Reka je blizu — publika se skuplja. Šta radiš?'
      },
      crowd_surge: {
        title: 'Štrand Se Puni!',
        description: 'Plažni kapacitet puca po šavovima. Dunavska obala privlači sve više posjetilaca.'
      },
      spontaneous_community: {
        title: 'Komšije sa Reke Pomažu!',
        description: 'Mještani Novog Sada spontano donose piće i osiguravaju ulaze. Štrand zajednica cveta!'
      }
    };
  }
  if (venueId === 'sarajevo') {
    return {
      rain_cloud: {
        title: 'Sarajevski Dažd!',
        description: 'Planinski oblak brzo dolazi. U Sarajevu kiša znači nešto — publika zna to.'
      },
      crowd_surge: {
        title: 'Sarajevo se Budi!',
        description: 'Manji prostor, veće srce. Više ljudi nego prostora — grad podržava.'
      },
      vip_guest: {
        title: 'Gost iz Regiona!',
        description: 'Poznato ime iz balkanskog muzičkog kruga želi da prisustvuje. Sarajevo ima domet.'
      }
    };
  }
  return {};
}

/**
 * Get event by ID
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getEventById(id) {
  return FINALE_EVENTS.find(e => e.id === id);
}

/**
 * Check if event should trigger based on game state
 * @param {Object} event
 * @param {Object} finaleState
 * @param {Object} gameState
 * @param {number} elapsedMin
 * @returns {boolean}
 */
export function shouldEventTrigger(event, finaleState, gameState, elapsedMin) {
  // Already triggered
  if (finaleState.triggeredEvents.includes(event.id) && !event.periodic) return false;

  // Periodic events
  if (event.periodic && event.everyMin) {
    const lastTrigger = finaleState.periodicTriggers?.[event.id] || 0;
    if (elapsedMin - lastTrigger >= event.everyMin && elapsedMin > 0) return true;
    return false;
  }

  // Fixed minute trigger
  if (event.triggerMin !== undefined) {
    if (Math.floor(finaleState.elapsed / 60) < event.triggerMin) return false;
  }

  // Random range trigger
  if (event.triggerMinRange) {
    const [minM, maxM] = event.triggerMinRange;
    const elapsed = Math.floor(finaleState.elapsed / 60);
    if (elapsed < minM || elapsed > maxM) return false;
    if (Math.random() > 0.15) return false; // 15% chance each tick in window
  }

  // Condition-based triggers (simplified evaluation)
  if (event.triggerCond) {
    return evalCondition(event.triggerCond, finaleState, gameState);
  }

  return true;
}

/**
 * Evaluate a condition string against game state
 * @param {string} cond
 * @param {Object} finaleState
 * @param {Object} gameState
 * @returns {boolean}
 */
function evalCondition(cond, finaleState, gameState) {
  const crowd = finaleState.crowdCurrent / Math.max(1, finaleState.crowdCap);
  const crowdMood = finaleState.crowdMood;
  const communityVibe = gameState.communityVibeAvg || 0;
  const seasonMarketingSpent = gameState.seasonMarketingSpent || 0;
  const reputation = gameState.reputation || 0;
  const buildings = gameState.buildings || {};

  try {
    // Safe subset eval
    return Function(
      'crowd', 'crowdMood', 'communityVibe', 'seasonMarketingSpent', 'reputation', 'buildings',
      `return ${cond};`
    )(crowd, crowdMood, communityVibe, seasonMarketingSpent, reputation, buildings);
  } catch {
    return false;
  }
}

/**
 * Apply event option effect to game state
 * @param {Object} option - selected option from event
 * @param {Object} finaleState - mutable
 * @param {Object} gameState - mutable (for gcDelta etc.)
 */
export function applyEventEffect(option, finaleState, gameState) {
  if (option.moodDelta) {
    finaleState.crowdMood = Math.max(0, Math.min(100, finaleState.crowdMood + option.moodDelta));
  }
  if (option.revenueDelta) {
    finaleState.revenue = Math.max(0, finaleState.revenue * (1 + option.revenueDelta));
  }
  if (option.costDelta) {
    gameState.gcBalance = Math.max(0, (gameState.gcBalance || 0) - option.costDelta);
  }
  if (option.gcDelta) {
    gameState.gcBalance = (gameState.gcBalance || 0) + option.gcDelta;
  }
  if (option.reputationDelta) {
    gameState.reputation = (gameState.reputation || 0) + option.reputationDelta;
  }
  if (option.hypeDelta) {
    finaleState.djHype = Math.max(0, Math.min(100, finaleState.djHype + option.hypeDelta));
  }
}
