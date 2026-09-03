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
 * Volunteer-specific crisis events triggered when a volunteer's WB < 30% during the finale.
 * Each event is personal — the volunteer is named, the moment is theirs.
 * These are dynamic events; the runtime generates them from getVolunteerCrisisEvent().
 *
 * @type {Record<string, FinaleEvent>}
 */
export const VOLUNTEER_CRISIS_EVENTS = {
  ana: {
    id: 'crisis_ana',
    title: 'Ana se povlači',
    description: 'Ana sedi u uglu šatora, ne odgovara na pozive. Previše je traženo od nje tokom sezone. Šta radiš?',
    options: [
      {
        text: '🫂 Sedi s njom (5 min)',
        desc: 'Ana se vraća u igru — WB +20, ali ti gubiš 5 minuta nadzora',
        volunteerWbDelta: 20,
        moodDelta: -5,
        targetVolunteerId: 'ana'
      },
      {
        text: '➡️ Nastavi bez nje',
        desc: 'Ana ostaje u šatoru. Niko ne preuzima njen zadatak.',
        volunteerWbDelta: 0,
        moodDelta: -3
      }
    ]
  },
  mika: {
    id: 'crisis_mika',
    title: 'Mika ne može više',
    description: 'Mika sedi na kamenu, ruke na kolenima. Ne diže sanduke. Pravi fizikalac — ali telo ima granicu.',
    options: [
      {
        text: '🍲 Hitna hrana i odmor',
        desc: 'Mika se oporavlja — WB +25, ali gradnja staje na 10 min',
        volunteerWbDelta: 25,
        moodDelta: 0,
        targetVolunteerId: 'mika'
      },
      {
        text: '💪 Neka izdrži još malo',
        desc: 'Mika pokušava — ali efikasnost pada na nulu',
        volunteerWbDelta: -5,
        moodDelta: -5
      }
    ]
  },
  jovana: {
    id: 'crisis_jovana',
    title: 'Jovana pravi praznu čorbu',
    description: 'Kuhinja je tiha. Jovana meša lonac bez recepta, bez ideja. Kad kuvarica izgubi vibe — ekipa to oseća.',
    options: [
      {
        text: '🎵 Pusti muziku u kuhinji',
        desc: 'Jovana se budi — WB +15, hrana ima dušu ponovo',
        volunteerWbDelta: 15,
        moodDelta: 5,
        targetVolunteerId: 'jovana'
      },
      {
        text: '🤐 Ostavi je na miru',
        desc: 'Čorba je prazna, ekipa jede bez osmeha',
        volunteerWbDelta: 0,
        moodDelta: -8
      }
    ]
  },
  dragan: {
    id: 'crisis_dragan',
    title: 'Dragan odlaže kameru',
    description: 'Kamera visi o vratu, prst ne pritiska okidač. Dragan gleda finale — ali ga ne dokumentuje.',
    options: [
      {
        text: '📸 Podseti ga zašto je tu',
        desc: 'Dragan počinje da snima — WB +15, finale dobija vizuelnu priču',
        volunteerWbDelta: 15,
        reputationDelta: 5,
        targetVolunteerId: 'dragan'
      },
      {
        text: '🎭 Finale bez fotografa',
        desc: 'Guncati Grand nema vizuelni trag ove noći',
        reputationDelta: -5
      }
    ]
  },
  djule: {
    id: 'crisis_djule',
    title: 'Đule sedi na kamenu',
    description: 'Mišići miruju. Đule koji nikad ne seda — sada sedi. Gradnja staje, terenska logistika puca.',
    options: [
      {
        text: '🍲 Hrana odmah, odmor 5 min',
        desc: 'Đule ustaje spremniji — WB +20, logistika se vraća',
        volunteerWbDelta: 20,
        moodDelta: 0,
        targetVolunteerId: 'djule'
      },
      {
        text: '🏗️ Podeli njegov posao ekipi',
        desc: 'Gradnja kasni, ekipa je opterećena',
        moodDelta: -10,
        volunteerWbDelta: 0
      }
    ]
  },
  maja: {
    id: 'crisis_maja',
    title: 'Maja stišava volume',
    description: 'Playlist radi automatski, ali Maja nije za pultom. Muzika je tu — ali DJ nije. Publika to oseća.',
    options: [
      {
        text: '🎧 Povedi je iza pulta',
        desc: 'Maja se vraća — DJ hype +15, publika se budi',
        djHypeDelta: 15,
        volunteerWbDelta: 10,
        targetVolunteerId: 'maja'
      },
      {
        text: '🤖 Playlist radi sam',
        desc: 'Automatski set nema soul — hype polako pada',
        djHypeDelta: -10
      }
    ]
  },
  biljana: {
    id: 'crisis_biljana',
    title: 'Biljana ostavlja listu',
    description: 'Lista je polu-prazna. Biljana sedi, olovka na stolu. Raspored koji stane — festival koji ne zna šta sledi.',
    options: [
      {
        text: '📋 Nastavi listu zajedno',
        desc: 'Biljana se vraća — logistika je pod kontrolom, WB +15',
        volunteerWbDelta: 15,
        moodDelta: 5,
        targetVolunteerId: 'biljana'
      },
      {
        text: '🤷 Improvizuj bez rasporeda',
        desc: 'Narednih 5 minuta nema koordinacije — haos je moguć',
        moodDelta: -12
      }
    ]
  }
};

/**
 * Get the crisis event for a specific volunteer type, or null if none defined.
 * @param {string} typeId
 * @returns {FinaleEvent|null}
 */
export function getVolunteerCrisisEvent(typeId) {
  return VOLUNTEER_CRISIS_EVENTS[typeId] || null;
}

/**
 * Cross-event decision callbacks — extra options that unlock in later events
 * based on how the player resolved an earlier event.
 *
 * Runtime requirement: finale.js must populate `finaleState.decisions`
 * as `{ [eventId]: chosenOptionIndex }` when a player picks an option.
 *
 * @type {Record<string, Array<Object & { requiresDecision: { eventId: string, chosenOptionIndex: number } }>>}
 */
export const CROSS_EVENT_CALLBACKS = {
  /** bar_shortage (Min 7): if player opened the gate in crowd_surge (Min 3),
   *  prihodi od kapije cover restock — free restock instead of -150 GC */
  bar_shortage: [
    {
      text: '🍺 Prihodi od kapije pokrivaju (0 GC)',
      desc: 'Otvorena kapija u Min 3 donela je dovoljno — zalihe se dopunjuju odmah',
      costDelta: 0,
      moodDelta: 8,
      requiresDecision: { eventId: 'crowd_surge', chosenOptionIndex: 0 }
    }
  ],
  /** light_fail (Min 8-12): if player paid for rezervni PA in equipment_fail (Min 4-8),
   *  same tech crew is already on site — cheaper and faster light fix */
  light_fail: [
    {
      text: '⚡ Isti tim, ista rešenja (-50 GC)',
      desc: 'PA ekipa je već na terenu od popravke — rasveta ide brže i jeftinije',
      costDelta: 50,
      moodDelta: 3,
      requiresDecision: { eventId: 'equipment_fail', chosenOptionIndex: 0 }
    }
  ],
  /** local_media (Min 10): if player gave backstage access in vip_guest (Min 5),
   *  VIP opens the media doors — interview in motion, no revenue pause */
  local_media: [
    {
      text: '🌟 VIP otvara medije (bez pauze)',
      desc: 'Gost iz backstage-a privlači kamere — intervju se daje u hodu, nema pauze',
      reputationMult: 1.2,
      revenueDelta: 0,
      requiresDecision: { eventId: 'vip_guest', chosenOptionIndex: 0 }
    }
  ]
};

/**
 * Get available options for an event, prepending any cross-event callbacks
 * unlocked by past player decisions.
 *
 * @param {FinaleEvent} event
 * @param {Record<string, number>} decisions - finaleState.decisions: { [eventId]: chosenOptionIndex }
 * @returns {Object[]} augmented option list (callbacks first, then base options)
 */
export function getAvailableOptions(event, decisions = {}) {
  const base = event.options || [];
  const callbacks = CROSS_EVENT_CALLBACKS[event.id] || [];

  const unlocked = callbacks
    .filter(cb => decisions[cb.requiresDecision.eventId] === cb.requiresDecision.chosenOptionIndex)
    .map(({ requiresDecision, ...rest }) => ({ ...rest, isCallback: true }));

  return [...unlocked, ...base];
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
