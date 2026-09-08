/**
 * @module branching — etapa3 ruta tracking
 */

/** @type {'brze'|'slikovitije'|'sigurnije'|null} */
let _selected = null;

/** @type {Array<{route: string, timestamp: number}>} */
const _history = [];

/**
 * @param {'brze'|'slikovitije'|'sigurnije'} route
 */
export function selectRoute(route) {
  _selected = route;
  _history.push({ route, timestamp: Date.now() });
}

/** @returns {'brze'|'slikovitije'|'sigurnije'|null} */
export function getSelectedRoute() {
  return _selected;
}

/** @returns {Array<{route: string, timestamp: number}>} */
export function getHistory() {
  return [..._history];
}

export function resetBranching() {
  _selected = null;
  _history.length = 0;
}

/**
 * @param {'brze'|'slikovitije'|'sigurnije'} route
 * @returns {{label:string, desc:string, icon:string}|null}
 */
export function getRouteInfo(route) {
  const map = {
    brze:        { label: 'Brže',        desc: 'Autoput direktno — brže ali stresno', icon: '⚡' },
    slikovitije: { label: 'Slikovitije', desc: 'Kroz sela — lepše, ali sporije',       icon: '🌿' },
    sigurnije:   { label: 'Sigurnije',   desc: 'Manji putevi — konzistentno',          icon: '🛡️' }
  };
  return map[route] ?? null;
}

/** Δ3 is always 0 — route choice affects etapa4 difficulty only */
export function computeDelta3() {
  return 0;
}
