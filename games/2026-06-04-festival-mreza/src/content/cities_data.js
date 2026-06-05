/** @module cities_data — statički podaci za 5 gradova turneje */

/** @type {Record<string, CityConfig>} */
export const CITIES = {
  nis: {
    id: 'nis',
    name: 'Niš',
    tutorial: true,
    waves: 4,
    duration: 180,
    waveInterval: 30,
    audioId: 'nis',
    color: '#1a1a2e',
    accentColor: '#c44dff',
    description: 'Podzemna scena. Stroga publika, niske tolerancije za greške.',
    maxWaveSize: 30,          // tutorial cap
    venueLabel: 'Klub Bulevar',
  },
  sarajevo: {
    id: 'sarajevo',
    name: 'Sarajevo',
    tutorial: false,
    waves: 6,
    duration: 240,
    waveInterval: 25,
    audioId: 'sarajevo',
    color: '#16213e',
    accentColor: '#ffb830',
    description: 'Nostalgična scena. Publika voli atmosferu i priču.',
    maxWaveSize: null,        // standard: venue_capacity * 0.17
    venueLabel: 'SKC Sarajevo',
  },
  strand: {
    id: 'strand',
    name: 'Štrand',
    tutorial: false,
    waves: 7,
    duration: 240,
    waveInterval: 22,
    audioId: 'strand',
    color: '#0f3460',
    accentColor: '#4df5ff',
    description: 'Letnji open-air. Publika ostaje do zore.',
    maxWaveSize: null,        // standard: venue_capacity * 0.19
    venueLabel: 'Štrand Plaža',
  },
  guncati: {
    id: 'guncati',
    name: 'Guncati',
    tutorial: false,
    waves: 7,
    duration: 240,
    waveInterval: 20,
    audioId: 'guncati',
    color: '#1a3a1a',
    accentColor: '#4a7c59',
    description: 'Tom Sawyer model. Zajednička energija, organsko iskustvo.',
    maxWaveSize: null,        // standard: venue_capacity * 0.20
    venueLabel: 'Guncatski Krug',
    unlockCondition: 'avala_completed',
  },
  avala: {
    id: 'avala',
    name: 'Avala',
    tutorial: false,
    waves: 8,
    duration: 300,
    waveInterval: 18,
    audioId: 'avala',
    color: '#1a0a2e',
    accentColor: '#c44dff',
    description: 'Grand finale. 20. jun. Sve vodi ovde.',
    maxWaveSize: null,        // standard: venue_capacity * 0.22
    venueLabel: 'Avala Rock Open Air',
  },
};

/** Redosled gradova po turneji */
export const CITY_ORDER = ['nis', 'sarajevo', 'strand', 'guncati', 'avala'];

/**
 * Venue kapacitet po reputaciji
 * @param {number} reputation 0-100
 * @returns {number} crowd capacity
 */
export function getVenueCapacity(reputation) {
  if (reputation < 20) return 200;
  if (reputation < 50) return 400;
  if (reputation < 80) return 800;
  return 1600;
}

/**
 * Venue tier label
 * @param {number} reputation
 * @returns {string}
 */
export function getVenueTierLabel(reputation) {
  if (reputation < 20) return 'Underground';
  if (reputation < 50) return 'Club';
  if (reputation < 80) return 'Venue';
  return 'Arena';
}

/**
 * Max wave size za grad
 * @param {string} cityId
 * @param {number} venueCapacity
 * @returns {number}
 */
export function getMaxWaveSize(cityId, venueCapacity) {
  const WAVE_FACTORS = { nis: 30, sarajevo: 0.17, strand: 0.19, guncati: 0.20, avala: 0.22 };
  const f = WAVE_FACTORS[cityId];
  if (cityId === 'nis') return f;
  return Math.floor(venueCapacity * f);
}
