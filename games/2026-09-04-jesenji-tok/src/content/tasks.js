/**
 * @module tasks
 * Task definitions for Jesenji Tok — 6 seasonal agricultural tasks.
 *
 * Calendar mapping:
 *   Week 1  = Aug 20
 *   Week 2  = Aug 27
 *   Week 3  = Sep 3
 *   Week 4  = Sep 10
 *   Week 5  = Sep 17
 *   Week 6  = Sep 24
 *   Week 7  = Oct 1
 *   Week 8  = Oct 8
 *   Week 9  = Oct 15
 *   Week 10 = Oct 22
 *   Week 11 = Oct 29
 *   Week 12 = Nov 5
 */

// ─── Typedef ───────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Task
 * @property {string}  id             - Unique task identifier
 * @property {string}  name           - Display name (Serbian)
 * @property {string}  parcel_type    - Parcel type this task applies to
 * @property {number}  window_start   - First optimal week (1-12)
 * @property {number}  window_end     - Last optimal week (1-12)
 * @property {number}  group_cost     - Radne grupe needed per week
 * @property {number}  base_score     - Points when assigned in window
 * @property {string}  color          - Card color (CSS hex)
 * @property {boolean} blocked_by_rain- Whether rain blocks this task
 * @property {string}  emoji          - Emoji icon
 * @property {string}  tooltip_edu    - Short educational blurb (for grid cell tooltip)
 * @property {string}  edu_deep_link  - Guncati blog/video URL for "Saznaj više →" tooltip CTA
 */

// ─── Task Definitions ─────────────────────────────────────────────────────────

/** @type {Task[]} */
export const TASKS = [
  {
    id: 'micelij',
    name: 'Micelij inokulacija',
    parcel_type: 'suma',
    window_start: 1,
    window_end: 7,
    group_cost: 2,
    base_score: 180,
    color: '#8b7355',
    blocked_by_rain: false,
    emoji: '🍄',
    tooltip_edu:
      'Bukovač inokulacija traži hlad i vreme za rast. Van avgusta–oktobra, micelijum ne stiže pre mraza. Berba novembar.',
    edu_deep_link: 'https://guncati.rs/blog/kako-inokulisem-bukovac',
  },
  {
    id: 'ozimo',
    name: 'Ozimo žito',
    parcel_type: 'otvorena',
    window_start: 1,
    window_end: 4,
    group_cost: 1,
    base_score: 150,
    color: '#c8a05a',
    blocked_by_rain: false,
    emoji: '🌾',
    tooltip_edu:
      'Seje se do 20. septembra — posle toga zemlja se hladi, klijanje kasni, prinos pada. Proleće žetva.',
    edu_deep_link: 'https://guncati.rs/blog/setva-ozimog-na-guncatiju',
  },
  {
    id: 'jezero',
    name: 'Jezero zimska priprema',
    parcel_type: 'vodena',
    window_start: 6,
    window_end: 11,
    group_cost: 1,
    base_score: 160,
    color: '#2c5f7a',
    blocked_by_rain: false,
    emoji: '🐟',
    tooltip_edu:
      'Ribe prezimljuju bolje uz oktobarska/novembarska aeracija. Bez pripreme, kiseonik pada pod ledom.',
    edu_deep_link: 'https://guncati.rs/blog/zimska-priprema-jezera-ribe-i-filtracija',
  },
  {
    id: 'graditeljski',
    name: 'Suvozid i tarabe',
    parcel_type: 'gradiliste',
    window_start: 1,
    window_end: 6,
    group_cost: 2,
    base_score: 170,
    color: '#6b4c3b',
    blocked_by_rain: true,
    emoji: '🪨',
    tooltip_edu:
      'Kamen i malta ne drže u vlazi. Suvi prozor avgusta–septembra je jedini pravi; dockan kišni rad pravi pukotine do proleća.',
    edu_deep_link: 'https://guncati.rs/blog/suvozid-zidamo-pre-kise',
  },
  {
    id: 'rezidba',
    name: 'Zimska rezidba',
    parcel_type: 'vocnjak',
    window_start: 4,
    window_end: 11,
    group_cost: 1,
    base_score: 130,
    color: '#4a7c59',
    blocked_by_rain: false,
    emoji: '✂️',
    tooltip_edu:
      'Reže se posle prvih mrazeva, pre dubokog mirovanja. Prozor sept 15 – okt 31. Ranije ili dockan = prinos −20% idućeg proleća.',
    edu_deep_link: 'https://guncati.rs/blog/vocnjak-posle-leta',
  },
  {
    id: 'kompost',
    name: 'Kompost zimski',
    parcel_type: 'kompost',
    window_start: 1,
    window_end: 8,
    group_cost: 1,
    base_score: 140,
    color: '#5a4e44',
    blocked_by_rain: false,
    emoji: '♻️',
    tooltip_edu:
      'Fermentacija je aktivna dok temperatura drži. Posle 20. oktobra mikrobi usporavaju — prolećno gnojivo gubi moć.',
    edu_deep_link: 'https://guncati.rs/blog/zimski-kompost-sta-bacam-sta-ne',
  },
];

// ─── Week Labels ──────────────────────────────────────────────────────────────

/**
 * Week number to human-readable date label.
 * Week 1 = Aug 20, Week 12 = Nov 5.
 * @param {number} week - 1-indexed week number
 * @returns {string}
 */
export function weekLabel(week) {
  const LABELS = [
    '',       // Index 0: unused (weeks are 1-indexed)
    '20 avg', // Week 1
    '27 avg', // Week 2
    '3 sep',  // Week 3
    '10 sep', // Week 4
    '17 sep', // Week 5
    '24 sep', // Week 6
    '1 okt',  // Week 7
    '8 okt',  // Week 8
    '15 okt', // Week 9
    '22 okt', // Week 10
    '29 okt', // Week 11
    '5 nov',  // Week 12
  ];
  return LABELS[week] ?? `N${week}`;
}

/**
 * Get a full date range label for a week.
 * @param {number} week
 * @returns {string} e.g. "N3 — 3 sep"
 */
export function weekFullLabel(week) {
  const label = weekLabel(week);
  return label ? `N${week} — ${label}` : `N${week}`;
}

/**
 * Get week number from calendar date approximation.
 * Returns the closest week for a date string like "10 sep".
 * @param {string} dateStr - e.g. "17 sep"
 * @returns {number|null}
 */
export function weekFromLabel(dateStr) {
  const LABELS = [
    '', '20 avg', '27 avg', '3 sep', '10 sep', '17 sep', '24 sep',
    '1 okt', '8 okt', '15 okt', '22 okt', '29 okt', '5 nov',
  ];
  const idx = LABELS.indexOf(dateStr);
  return idx > 0 ? idx : null;
}

// ─── Task Queries ─────────────────────────────────────────────────────────────

/**
 * Get task by ID.
 * @param {string} id
 * @returns {Task|undefined}
 */
export function getTask(id) {
  return TASKS.find((t) => t.id === id);
}

/**
 * Get task by parcel type.
 * @param {string} parcelType
 * @returns {Task|undefined}
 */
export function getTaskByParcel(parcelType) {
  return TASKS.find((t) => t.parcel_type === parcelType);
}

/**
 * Get all tasks sorted by window_start (ascending).
 * @returns {Task[]}
 */
export function getTasksByWindowOrder() {
  return [...TASKS].sort((a, b) => a.window_start - b.window_start);
}

/**
 * Get tasks that are active in a given week (window includes that week).
 * @param {number} week
 * @returns {Task[]}
 */
export function getTasksActiveInWeek(week) {
  return TASKS.filter((t) => week >= t.window_start && week <= t.window_end);
}

/**
 * Get the total base score if all tasks were assigned in-window.
 * @returns {number}
 */
export function getTotalBaseScore() {
  return TASKS.reduce((sum, t) => sum + t.base_score, 0);
}

/**
 * Get the maximum possible score (all in-window + ecosystem bonus).
 * Ecosystem bonus: Micelij + Jezero + Kompost get ×1.5
 * @returns {number}
 */
export function getTheoreticalMaxScore() {
  const base = getTotalBaseScore();
  // Eco bonus tasks: micelij (180), jezero (160), kompost (140) → total 480
  const ecoTasks = TASKS.filter((t) => ['micelij', 'jezero', 'kompost'].includes(t.id));
  const ecoBase = ecoTasks.reduce((sum, t) => sum + t.base_score, 0);
  // Eco bonus adds 50% on top of ecoBase
  return base + Math.round(ecoBase * 0.5);
}

/**
 * Get the total group cost for all tasks.
 * @returns {number}
 */
export function getTotalGroupCost() {
  return TASKS.reduce((sum, t) => sum + t.group_cost, 0);
}

/**
 * Check if a task is one of the ecosystem trio (micelij, jezero, kompost).
 * @param {string} taskId
 * @returns {boolean}
 */
export function isEcoTask(taskId) {
  return ['micelij', 'jezero', 'kompost'].includes(taskId);
}

/**
 * Get a short parcel label for a task.
 * @param {string} taskId
 * @returns {string}
 */
export function getParcelLabel(taskId) {
  const task = getTask(taskId);
  if (!task) return '';
  const parcel = PARCEL_TYPES.find((p) => p.id === task.parcel_type);
  return parcel ? `${parcel.emoji} ${parcel.label}` : task.parcel_type;
}

// ─── Parcel Types ─────────────────────────────────────────────────────────────

/**
 * All parcel type definitions.
 * Each task uses exactly one parcel type.
 */
export const PARCEL_TYPES = [
  { id: 'suma',      label: 'Šuma',       emoji: '🌲' },
  { id: 'otvorena',  label: 'Njiva',      emoji: '🌾' },
  { id: 'vodena',    label: 'Jezero',     emoji: '💧' },
  { id: 'gradiliste',label: 'Gradilište', emoji: '🔨' },
  { id: 'vocnjak',   label: 'Voćnjak',    emoji: '🍎' },
  { id: 'kompost',   label: 'Kompost',    emoji: '♻️' },
];
