/**
 * @file patterns.js
 * @description Setlist: 4 kluba × 5 noći × 3 pesme sa beat pattern podacima.
 *
 * Struktura pesme:
 *   { bpm: number, duration: number, beats: Array<{time: number, lane: number}> }
 *
 * "time" je sekunde od početka pesme do trenutka kada beat stigne na timing liniju.
 * "lane" je 0 (levo) | 1 (centar) | 2 (desno).
 *
 * PODRUM (klub 0): 110 BPM — potpuno implementirano
 * KROV / METRO / ORBITA: TODO stubs
 *
 * @module levels/patterns
 */

// ─── Pomoćna funkcija ────────────────────────────────────────────────────────

/**
 * Generiše ravnomerno raspoređene beatove na zadatom BPM-u.
 *
 * @param {number} bpm
 * @param {number} count      - Broj beatova
 * @param {number} startBeat  - Koji otkucaj je prvi (1-based, npr. 1 = odmah)
 * @param {number} lane       - Lane za sve beatove
 * @returns {Array<{time: number, lane: number}>}
 */
function _uniform(bpm, count, startBeat, lane) {
  const beatInterval = 60 / bpm;
  const beats = [];
  for (let i = 0; i < count; i++) {
    beats.push({
      time: (startBeat - 1 + i) * beatInterval,
      lane
    });
  }
  return beats;
}

/**
 * Generiše beatove sa zadatim rasporedom lanova (rotira kroz lanes niz).
 *
 * @param {number} bpm
 * @param {number} count
 * @param {number} startBeat  - 1-based
 * @param {number[]} lanes    - Niz lanova koji se rotira
 * @returns {Array<{time: number, lane: number}>}
 */
function _rotating(bpm, count, startBeat, lanes) {
  const beatInterval = 60 / bpm;
  return Array.from({ length: count }, (_, i) => ({
    time: (startBeat - 1 + i) * beatInterval,
    lane: lanes[i % lanes.length]
  }));
}

// ─── KLUB 0: PODRUM — 110 BPM ────────────────────────────────────────────────
// Noć 1: Uvod, samo centar, 16 ravnomernih beatova
// Noć 2: Uvod levog i desnog, alternacija L/D
// Noć 3: Trojni ritam L/C/D
// Noć 4: Dupli udari (dve lane gotovo istovremeno, razlika 0.1s)
// Noć 5: Mešani pattern, sve tri lane, pauze

const BPM_PODRUM = 110;

/** @type {import('./patterns.js').Song[]} */
const podrum_noc1 = [
  // Pesma 1 — 16 udara, samo centar, 110 BPM, jedna svakih ~0.545s
  {
    bpm: BPM_PODRUM,
    duration: 16 * (60 / BPM_PODRUM) + 2,
    beats: _uniform(BPM_PODRUM, 16, 1, 1)
  },
  // Pesma 2 — 16 udara, samo centar, malo brže pauza između
  {
    bpm: BPM_PODRUM,
    duration: 16 * (60 / BPM_PODRUM) + 2,
    beats: _uniform(BPM_PODRUM, 16, 1, 1)
  },
  // Pesma 3 — 16 udara, samo centar
  {
    bpm: BPM_PODRUM,
    duration: 16 * (60 / BPM_PODRUM) + 2,
    beats: _uniform(BPM_PODRUM, 16, 1, 1)
  }
];

const podrum_noc2 = [
  // Pesma 1 — 16 udara, alternacija levo/desno
  {
    bpm: BPM_PODRUM,
    duration: 16 * (60 / BPM_PODRUM) + 2,
    beats: _rotating(BPM_PODRUM, 16, 1, [0, 2])
  },
  // Pesma 2 — 16 udara, alternacija levo/centar
  {
    bpm: BPM_PODRUM,
    duration: 16 * (60 / BPM_PODRUM) + 2,
    beats: _rotating(BPM_PODRUM, 16, 1, [0, 1])
  },
  // Pesma 3 — 16 udara, alternacija centar/desno
  {
    bpm: BPM_PODRUM,
    duration: 16 * (60 / BPM_PODRUM) + 2,
    beats: _rotating(BPM_PODRUM, 16, 1, [1, 2])
  }
];

const podrum_noc3 = [
  // Pesma 1 — 18 udara, trojni ritam L/C/D
  {
    bpm: BPM_PODRUM,
    duration: 18 * (60 / BPM_PODRUM) + 2,
    beats: _rotating(BPM_PODRUM, 18, 1, [0, 1, 2])
  },
  // Pesma 2 — 18 udara, trojni ritam D/C/L
  {
    bpm: BPM_PODRUM,
    duration: 18 * (60 / BPM_PODRUM) + 2,
    beats: _rotating(BPM_PODRUM, 18, 1, [2, 1, 0])
  },
  // Pesma 3 — 18 udara, trojni L/D/C
  {
    bpm: BPM_PODRUM,
    duration: 18 * (60 / BPM_PODRUM) + 2,
    beats: _rotating(BPM_PODRUM, 18, 1, [0, 2, 1])
  }
];

// Noć 4: dupli udari — iste pozicije po paru u razmakom od 0.18s
function _doublePair(bpm, pairCount, lane1, lane2) {
  const beatInterval = 60 / bpm;
  const beats = [];
  for (let i = 0; i < pairCount; i++) {
    const t = i * beatInterval * 2; // jedan par svakih 2 otkucaja
    beats.push({ time: t, lane: lane1 });
    beats.push({ time: t + 0.18, lane: lane2 });
  }
  return beats.sort((a, b) => a.time - b.time);
}

const podrum_noc4 = [
  // Pesma 1 — 8 parova L+D (brzo tapuj oba)
  {
    bpm: BPM_PODRUM,
    duration: 8 * 2 * (60 / BPM_PODRUM) + 2,
    beats: _doublePair(BPM_PODRUM, 8, 0, 2)
  },
  // Pesma 2 — 8 parova L+C
  {
    bpm: BPM_PODRUM,
    duration: 8 * 2 * (60 / BPM_PODRUM) + 2,
    beats: _doublePair(BPM_PODRUM, 8, 0, 1)
  },
  // Pesma 3 — 8 parova C+D
  {
    bpm: BPM_PODRUM,
    duration: 8 * 2 * (60 / BPM_PODRUM) + 2,
    beats: _doublePair(BPM_PODRUM, 8, 1, 2)
  }
];

// Noć 5: mešani pattern sa pauzama — visoka kompleksnost
const podrum_noc5 = [
  // Pesma 1 — 20 udara, mešani sve lane, pauze na mestima 4, 8, 12
  {
    bpm: BPM_PODRUM,
    duration: 20 * (60 / BPM_PODRUM) + 2,
    beats: (() => {
      const bi = 60 / BPM_PODRUM;
      const pattern = [0,1,2,  1,  0,2,1,  2,  0,1,2,1,  0,  2,1,0,  1,2,0,1];
      return pattern.map((lane, i) => ({ time: i * bi, lane }));
    })()
  },
  // Pesma 2 — 20 udara, D-heavy mešani
  {
    bpm: BPM_PODRUM,
    duration: 20 * (60 / BPM_PODRUM) + 2,
    beats: (() => {
      const bi = 60 / BPM_PODRUM;
      const pattern = [2,0,2,1,2,  0,2,1,2,  0,1,2,0,2,  1,2,0,1,2,0];
      return pattern.map((lane, i) => ({ time: i * bi, lane }));
    })()
  },
  // Pesma 3 — boss night finisher, 22 udara sa svim lane kombinacijama
  {
    bpm: BPM_PODRUM,
    duration: 22 * (60 / BPM_PODRUM) + 2,
    beats: (() => {
      const bi = 60 / BPM_PODRUM;
      const pattern = [0,2,1,0,2,1,2,0,1,2,0,  1,0,2,1,0,2,1,0,2,1,0];
      return pattern.map((lane, i) => ({ time: i * bi, lane }));
    })()
  }
];

// ─── TODO KLUBI ──────────────────────────────────────────────────────────────

// TODO: implementirati KROV (klub 1) — 120 BPM, 5 noći × 3 pesme
// Uvesti: offbeat syncopation, brže pattern rotacije, duple udare od noći 3
const krov = null;

// TODO: implementirati METRO (klub 2) — 130 BPM, 5 noći × 3 pesme
// Uvesti: tripletni ritam, ghost note (dummy beat bez hita na 0.15 pre pravog), dense finale
const metro = null;

// TODO: implementirati ORBITA (klub 3) — 140 BPM, 5 noći × 3 pesme
// Uvesti: poliritam L3/R2, reverse sweep (D→C→L brzo), prestige unlock sequence
const orbita = null;

// ─── Export ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Song
 * @property {number} bpm
 * @property {number} duration    - Trajanje u sekundama (posle poslednjeg beata)
 * @property {Array<{time: number, lane: number}>} beats
 */

/**
 * @typedef {Object} Night
 * @property {Song[]} songs       - Tačno 3 pesme
 */

/**
 * @typedef {Object} Club
 * @property {string} name
 * @property {number} bpm
 * @property {Night[]} nights     - Tačno 5 noći
 */

/**
 * Setlist za sve klubove.
 * Indeks odgovara CONFIG.CLUB_BPM indeksu: 0=Podrum, 1=Krov, 2=Metro, 3=Orbita.
 *
 * @type {Club[]}
 */
export const CLUBS = [
  {
    name: 'Podrum',
    bpm: BPM_PODRUM,
    nights: [
      { songs: podrum_noc1 },
      { songs: podrum_noc2 },
      { songs: podrum_noc3 },
      { songs: podrum_noc4 },
      { songs: podrum_noc5 }
    ]
  },
  // TODO: Krov
  // TODO: Metro
  // TODO: Orbita
];

/**
 * Vraća pesmu za zadati klub/noć/indeks pesme.
 * Vraća null ako klub nije implementiran.
 *
 * @param {number} clubIndex  - 0–3
 * @param {number} nightIndex - 0–4
 * @param {number} songIndex  - 0–2
 * @returns {Song|null}
 */
export function getSong(clubIndex, nightIndex, songIndex) {
  const club = CLUBS[clubIndex];
  if (!club) return null;
  return club.nights[nightIndex]?.songs[songIndex] ?? null;
}
