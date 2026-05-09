// state.js — singleton state, save/load u localStorage, offline formula
import {
  ZONES,
  UPGRADES,
  INITIAL_ENERGY,
  PASSIVE_COINS_PER_S,
  OFFLINE_CAP_S,
} from './config.js';

// ---------------------------------------------------------------------------
// Pomoćne funkcije (ne exportuju se — interno)
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'dj-za-pultom';

/** Clamp float u [min, max] */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ---------------------------------------------------------------------------
// Default state — koristi se pri prvom pokretanju
// ---------------------------------------------------------------------------

function defaultState() {
  return {
    crowd_energy:  INITIAL_ENERGY,
    music_coins:   0,
    elapsed_s:     0,
    purchased:     [],          // string[] — ID-ovi kupljenih upgrades
    last_save_ts:  Date.now(),
    phase:         'menu',      // 'menu' | 'playing' | 'win' | 'fail'
  };
}

// ---------------------------------------------------------------------------
// Interni singleton
// ---------------------------------------------------------------------------

let _state = defaultState();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Vraća kopiju trenutnog statea.
 * Kopija — ne mutiraj direktno, koristi setState().
 * @returns {typeof _state}
 */
export function getState() {
  return { ..._state, purchased: [..._state.purchased] };
}

/**
 * Shallow merge parcijalnog objekta u state.
 * @param {Partial<typeof _state>} partial
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
  const toSave = { ..._state, last_save_ts: Date.now() };
  _state.last_save_ts = toSave.last_save_ts;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (_e) {
    // localStorage nedostupan (private mode itd.) — tiho nastavi
  }
}

/**
 * Učitava state iz localStorage i primjenjuje offline formulu.
 * Ako nema sačuvanog statea, postavlja default.
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

  // Validacija — ako fale ključni fieldi, resetuj
  if (
    typeof parsed.crowd_energy !== 'number' ||
    typeof parsed.elapsed_s    !== 'number' ||
    !Array.isArray(parsed.purchased)
  ) {
    _state = defaultState();
    return;
  }

  // Postavi učitani state kao osnovu
  _state = {
    ...defaultState(),
    ...parsed,
  };

  // --- Offline formula ---
  // Primjenjuje se samo ako je igra bila u toku
  if (_state.phase === 'playing') {
    const now              = Date.now();
    const raw_offline_s    = (now - _state.last_save_ts) / 1000;
    const offline_s        = Math.min(raw_offline_s, OFFLINE_CAP_S);

    if (offline_s > 0) {
      // MC zarađeni pasivno
      const mc_earned = PASSIVE_COINS_PER_S * offline_s;

      // Pasivna retencija od kupljenih upgrades
      const passive_ret = _getPassiveRetentionFromPurchased(_state.purchased);

      // Neto promjena energije (može biti negativna)
      const zone_drain_rate = _getZoneDrainAtTime(_state.elapsed_s);
      const energy_delta    = (passive_ret - zone_drain_rate) * offline_s;

      // Primijeni — offline mod ne može uzrokovati FAIL, clamp na 0
      _state.music_coins  = _state.music_coins + mc_earned;
      _state.crowd_energy = clamp(_state.crowd_energy + energy_delta, 0.0, 100.0);

      // Napredak vremena u offline modu — skalje tick
      // (tempo igre traje dok si offline, ali ne smije prekoračiti kraj)
      const new_elapsed = Math.min(
        _state.elapsed_s + offline_s,
        21600
      );
      _state.elapsed_s = new_elapsed;
    }
  }

  _state.last_save_ts = Date.now();
}

// ---------------------------------------------------------------------------
// State helper funkcije — koriste se iz main.js i systems/
// ---------------------------------------------------------------------------

/**
 * Vraća sumu pasivnih retention efekata svih kupljenih upgrades.
 * @returns {number} energy/s
 */
export function getPassiveRetention() {
  return _getPassiveRetentionFromPurchased(_state.purchased);
}

/**
 * Vraća zonu koja odgovara trenutnom elapsed_s iz statea.
 * @returns {import('./config.js').Zone}
 */
export function getCurrentZone() {
  return _getZoneAtTime(_state.elapsed_s);
}

/**
 * Vraća efektivni drain (drain * mult) za trenutnu zonu.
 * @returns {number} energy/s
 */
export function getZoneDrain() {
  return _getZoneDrainAtTime(_state.elapsed_s);
}

// ---------------------------------------------------------------------------
// Interni helperi (ne exportuju se)
// ---------------------------------------------------------------------------

/**
 * @param {string[]} purchased
 * @returns {number}
 */
function _getPassiveRetentionFromPurchased(purchased) {
  return UPGRADES
    .filter(u => purchased.includes(u.id))
    .reduce((sum, u) => sum + u.effect, 0);
}

/**
 * @param {number} elapsed_s
 * @returns {import('./config.js').Zone}
 */
function _getZoneAtTime(elapsed_s) {
  // Pronađi zonu čiji interval pokriva elapsed_s
  // Zadnja zona je fallback (after hours pokriva do kraja)
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (elapsed_s >= ZONES[i].start_s) {
      return ZONES[i];
    }
  }
  return ZONES[0];
}

/**
 * @param {number} elapsed_s
 * @returns {number} efektivni drain /s
 */
function _getZoneDrainAtTime(elapsed_s) {
  const zone = _getZoneAtTime(elapsed_s);
  return zone.drain * zone.mult;
}
