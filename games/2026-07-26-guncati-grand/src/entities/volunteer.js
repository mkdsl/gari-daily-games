/** @fileoverview 7 volunteer types: stats, task matrix, energija/glad/vibe decay */

/**
 * @typedef {Object} VolunteerType
 * @property {string} name
 * @property {number} energija - base energy (1-10)
 * @property {number} glad - base hunger satisfaction (1-10)
 * @property {number} vibe - base mood (1-10)
 * @property {number} gladDecay - hunger drop per task assigned
 * @property {Object} tasks - task multipliers keyed by task id
 * @property {boolean} [vibeContagion]
 * @property {number} [djBonus]
 */

export const VOLUNTEER_TYPES = {
  mika: {
    name: 'Stolar Mika',
    emoji: '🪵',
    energija: 8, glad: 6, vibe: 6,
    gladDecay: 3,
    bio: 'Jak ko bik, ali ne voli kamere.',
    tasks: { kopanje: 1.25, tesanje: 1.25, kuvanje: 0.7, foto: 0.7, bar: 1.0, admin: 1.0 }
  },
  jovana: {
    name: 'Kulinar Jovana',
    emoji: '🍳',
    energija: 6, glad: 9, vibe: 9,
    gladDecay: 1,
    bio: 'Uvek sita i nasmejana. Kuhinja je njen teren.',
    tasks: { kopanje: 0.6, tesanje: 0.7, kuvanje: 1.35, foto: 1.0, bar: 1.1, admin: 1.0 }
  },
  dragan: {
    name: 'Fotograf Dragan',
    emoji: '📷',
    energija: 5, glad: 5, vibe: 10,
    gladDecay: 2,
    bio: 'Uhvati trenutak, propusti ručak. Vibe za sve pare.',
    tasks: { kopanje: 0.5, tesanje: 0.6, kuvanje: 0.7, foto: 1.40, bar: 0.8, admin: 1.0 }
  },
  ana: {
    name: 'Sveznalica Ana',
    emoji: '⭐',
    energija: 7, glad: 7, vibe: 7,
    gladDecay: 2,
    bio: 'Radi sve podjednako dobro. Nezaobilazna prvog dana.',
    tasks: { kopanje: 1.1, tesanje: 1.1, kuvanje: 1.1, foto: 1.1, bar: 1.1, admin: 1.1 }
  },
  djule: {
    name: 'Pendžerović Đule',
    emoji: '💪',
    energija: 10, glad: 4, vibe: 4,
    gladDecay: 4,
    bio: 'Mašina za rad, ali loš vibe kosi drugima nivo ako ga ne hraniš.',
    tasks: { kopanje: 1.30, tesanje: 1.30, kuvanje: 0.8, foto: 0.4, bar: 0.8, admin: 1.0 },
    vibeContagion: true // ako vibe < 3, susedni volonter -1 vibe
  },
  maja: {
    name: 'DJ Student Maja',
    emoji: '🎧',
    energija: 6, glad: 9, vibe: 8,
    gladDecay: 1,
    bio: 'Za pultom je u svom elementu. Hype×1.2 na Grand Finalu.',
    tasks: { kopanje: 0.55, tesanje: 0.7, kuvanje: 0.8, foto: 0.9, bar: 1.0, admin: 1.0 },
    djBonus: 1.2 // Grand Finale crowd hype mult
  },
  biljana: {
    name: 'Organizatorka Biljana',
    emoji: '📋',
    energija: 7, glad: 7, vibe: 8,
    gladDecay: 2,
    bio: 'Lista posla, čekirana. Admin je njena supermoć.',
    tasks: { kopanje: 0.8, tesanje: 0.8, kuvanje: 0.9, foto: 1.0, bar: 0.8, admin: 1.20 }
  }
};

/**
 * Energy cost per task type
 * @type {Object<string, number>}
 */
export const TASK_ENERGY_COST = {
  kopanje: 4,
  tesanje: 4,
  kuvanje: 2,
  foto: 2,
  bar: 2,
  admin: 2,
  rest: 0,
  hrana_r: 0
};

/**
 * Create a volunteer instance from a type ID
 * @param {string} typeId
 * @returns {Object}
 */
export function createVolunteer(typeId) {
  const type = VOLUNTEER_TYPES[typeId];
  if (!type) throw new Error(`Unknown volunteer type: ${typeId}`);
  return {
    id: typeId + '_' + Date.now(),
    typeId,
    name: type.name,
    emoji: type.emoji,
    energija: type.energija * 10,    // 0-100
    glad: type.glad * 10,            // 0-100
    vibe: type.vibe * 10,            // 0-100
    // Base values for reset
    baseEnergija: type.energija * 10,
    baseGlad: type.glad * 10,
    baseVibe: type.vibe * 10,
    hasMemory: false,
    memoryWeeks: 0,
    joinedWeek: 1,
    tasksCompletedTotal: 0
  };
}

/**
 * Get task effectiveness for a volunteer
 * @param {string} typeId
 * @param {string} taskId
 * @returns {number} multiplier (0.4 - 1.4)
 */
export function getTaskEffectiveness(typeId, taskId) {
  const type = VOLUNTEER_TYPES[typeId];
  if (!type || !type.tasks) return 1.0;
  return type.tasks[taskId] || 1.0;
}

/**
 * Get effectiveness rating label
 * @param {number} mult
 * @returns {{ label: string, className: string }}
 */
export function getEffectivenessLabel(mult) {
  if (mult >= 1.3) return { label: '++', className: 'eff-great' };
  if (mult >= 1.1) return { label: '+', className: 'eff-good' };
  if (mult >= 0.9) return { label: '=', className: 'eff-neutral' };
  if (mult >= 0.7) return { label: '-', className: 'eff-bad' };
  return { label: '--', className: 'eff-terrible' };
}

/**
 * Apply task decay to volunteer stats
 * @param {Object} volunteer - mutable volunteer object
 * @param {string} taskId
 * @param {string} typeId
 */
export function applyTaskDecay(volunteer, taskId, typeId) {
  const type = VOLUNTEER_TYPES[typeId];
  if (!type) return;

  const energyCost = TASK_ENERGY_COST[taskId] || 2;
  volunteer.energija = Math.max(0, volunteer.energija - energyCost * 10);

  // Glad decay
  volunteer.glad = Math.max(0, volunteer.glad - type.gladDecay * 10);

  // Vibe decay: -1 za suboptimalan, -2 za pogrešan + glad<30
  const eff = getTaskEffectiveness(typeId, taskId);
  if (eff < 0.8) {
    const vibeDrop = volunteer.glad < 30 ? 20 : 10;
    volunteer.vibe = Math.max(0, volunteer.vibe - vibeDrop);
  } else if (eff < 1.0) {
    volunteer.vibe = Math.max(0, volunteer.vibe - 10);
  }
}

/**
 * Apply rest recovery to volunteer
 * @param {Object} volunteer
 */
export function applyRest(volunteer) {
  volunteer.energija = Math.min(100, volunteer.energija + 40);
}

/**
 * Apply food recovery to volunteer
 * @param {Object} volunteer
 * @param {boolean} hasBarL1 - whether bar is level 1+
 */
export function applyFoodRecovery(volunteer, hasBarL1) {
  volunteer.glad = Math.min(100, volunteer.glad + 50);
  volunteer.vibe = Math.min(100, volunteer.vibe + 10);
  if (hasBarL1) {
    volunteer.vibe = Math.min(100, volunteer.vibe + 30); // bar bonus 1x/week
  }
}

/**
 * Check if Đule's vibe contagion should apply
 * @param {Object} djule - Đule volunteer instance
 * @returns {boolean}
 */
export function isDjuleContagious(djule) {
  if (!djule) return false;
  const type = VOLUNTEER_TYPES[djule.typeId];
  return type && type.vibeContagion && djule.vibe < 30;
}
