// state.js — singleton state, save/load u localStorage, offline formula
import {
  ZONES,
  UPGRADES,
  INITIAL_ENERGY,
  PASSIVE_COINS_PER_S,
  OFFLINE_CAP_S,
} from './config.js';

// ---------------------------------------------------------------------------
// Konstante
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'dj-za-pultom';

// ---------------------------------------------------------------------------
// Interni helperi
// ---------------------------------------------------------------------------

/** Clamp float u [min, max] */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ---------------------------------------------------------------------------
// Default state — koristi se pri prvom pokretanju ili nevaljanom save-u
// ---------------------------------------------------------------------------

function defaultState() {
  return {
    crowd_energy: INITIAL_ENERGY,  // 50.0
    music_coins:  0,
    elapsed_s:    0,
    purchased:    [],              // string[] — ID-ovi kupljenih upgrades
    last_save_ts: Date.now(),
    phase:        'menu',          // 'menu' | 'playing' | 'win' | 'fail'
  };
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _state = defaultState();

// ---------------------------------------------------------------------------
// Public API — getState / setState
// ---------------------------------------------------------------------------

/**
 * Vraća shallow kopiju trenutnog statea.
 * Ne mutiraj direktno — koristi setState().
 * @returns {ReturnType<typeof defaultState>}
 */
export function getState() {
  return { ..._state, purchased: [..._state.purchased] };
}

/**
 * Shallow merge parcijalnog objekta u state.
 * @param {Partial<ReturnType<typeof defaultState>>} partial
 */
export function setState(partial) {
  _state = { ..._state, ...partial };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/**
 * Serijalizuje state u localStorage.
 * Ažurira last_save_ts na trenutni timestamp.
 */
export function saveState() {
  _state.last_save_ts = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (_e) {
    // localStorage nedostupan (private mode, quota) — tiho nastavi
  }
}

/**
 * Učitava state iz localStorage i primjenjuje offline formulu.
 * Ako nema sačuvanog statea ili je nevaljan, postavlja default.
 */
export function loadState() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (_e) {
    // nedostupan storage
  }

  if (!raw) {
    _state = defaultState();
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_e) {
    _state = defaultState();
    return;
  }

  // Validacija obaveznih polja
  if (
    typeof parsed.crowd_energy !== 'number' ||
    typeof parsed.elapsed_s    !== 'number' ||
    !Array.isArray(parsed.purchased)
  ) {
    _state = defaultState();
    return;
  }

  // Merge sa defaultom — zaštita od novih polja koja ne postoje u starom save-u
  _state = { ...defaultState(), ...parsed };

  // --- Offline formula ---
  // Primjenjuje se samo kada je igra bila aktivno u toku
  if (_state.phase === 'playing') {
    const now           = Date.now();
    const raw_offline_s = (now - _state.last_save_ts) / 1000;

    // Korak 1: cap na 1800s
    const offline_s = Math.min(raw_offline_s, OFFLINE_CAP_S);

    if (offline_s > 0) {
      // Korak 2: pasivni MC
      const mc_earned = PASSIVE_COINS_PER_S * offline_s;

      // Korak 3: energija — (retencija - drain) * offline_s
      const passive_ret    = _calcPassiveRetention(_state.purchased);
      const zone_drain_ps  = _calcZoneDrainAtTime(_state.elapsed_s);
      const energy_delta   = (passive_ret - zone_drain_ps) * offline_s;

      // Korak 4: clamp — offline FAIL nije moguć
      _state.crowd_energy = clamp(_state.crowd_energy + energy_delta, 0.0, 100.0);
      _state.music_coins  = _state.music_coins + mc_earned;

      // Napredi elapsed (ne smije preći kraj igre)
      _state.elapsed_s = Math.min(_state.elapsed_s + offline_s, 21600);
    }
  }

  _state.last_save_ts = Date.now();
}

// ---------------------------------------------------------------------------
// State helper funkcije — exportuju se za main.js i systems/
// ---------------------------------------------------------------------------

/**
 * Suma pasivnih retention efekata svih kupljenih upgrades.
 * @returns {number} energy/s
 */
export function getPassiveRetention() {
  return _calcPassiveRetention(_state.purchased);
}

/**
 * Zona koja odgovara trenutnom elapsed_s.
 * @returns {import('./config.js').Zone}
 */
export function getCurrentZone() {
  return _getZoneAtTime(_state.elapsed_s);
}

/**
 * Efektivni drain (drain * mult) za trenutnu zonu.
 * @returns {number} energy/s
 */
export function getZoneDrain() {
  return _calcZoneDrainAtTime(_state.elapsed_s);
}

// ---------------------------------------------------------------------------
// Privatni kalkulatori (ne exportuju se)
// ---------------------------------------------------------------------------

/**
 * @param {string[]} purchased
 * @returns {number}
 */
function _calcPassiveRetention(purchased) {
  return UPGRADES
    .filter(u => purchased.includes(u.id))
    .reduce((sum, u) => sum + u.effect, 0);
}

/**
 * Pronalazi zonu za dato vrijeme.
 * Iterira od zadnje zone prema prvoj — zadnja zona je fallback.
 * @param {number} elapsed_s
 * @returns {import('./config.js').Zone}
 */
function _getZoneAtTime(elapsed_s) {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (elapsed_s >= ZONES[i].start_s) {
      return ZONES[i];
    }
  }
  return ZONES[0];
}

/**
 * @param {number} elapsed_s
 * @returns {number} efektivni drain/s
 */
function _calcZoneDrainAtTime(elapsed_s) {
  const zone = _getZoneAtTime(elapsed_s);
  return zone.drain * zone.mult;
}
