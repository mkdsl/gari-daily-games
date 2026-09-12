/**
 * narrative_state.js — Tracking narativnih elemenata, Toma arc, seen nodes
 */

/**
 * Registruj viđen nod
 * @param {GameState} state
 * @param {string} nodeId
 */
export function markNodeSeen(state, nodeId) {
  if (!state.seenNodes.includes(nodeId)) {
    state.seenNodes.push(nodeId);
  }
}

/**
 * Da li je nod viđen?
 */
export function isNodeSeen(state, nodeId) {
  return state.seenNodes.includes(nodeId);
}

/**
 * Registruj izabranu opciju
 * @param {GameState} state
 * @param {string} optionId
 */
export function recordChoice(state, optionId) {
  state.chosenOptions[optionId] = true;
}

/**
 * Da li je opcija izabrana?
 */
export function wasChosen(state, optionId) {
  return !!state.chosenOptions[optionId];
}

/**
 * Prati Toma A-opcije za A2 achievement
 * @param {GameState} state
 * @param {DecisionOption} option
 */
export function trackTomaChoice(state, option) {
  if (option.tomaA) {
    if (!state.tomaChoicesA.includes(option.id)) {
      state.tomaChoicesA.push(option.id);
    }
  }
}

/**
 * Proveri da li su sve Toma A opcije izabrane (za A2)
 * Toma A opcije: N3A, N9A ili N9bA, N21A, N15A
 * @param {GameState} state
 * @returns {boolean}
 */
export function allTomaChoicesA(state) {
  const required = ['N3A', 'N15A', 'N21A'];
  const n9options = ['N9A', 'N9bA']; // jedno od dva
  const hasN9 = n9options.some(id => state.tomaChoicesA.includes(id));
  const hasRequired = required.every(id => state.tomaChoicesA.includes(id));
  return hasN9 && hasRequired;
}

/**
 * Tracking za A6 (Solo artist): da li je ikad uzeta V+2 "traži pomoć" opcija
 * Ove opcije su: N5B (V+1, E-1), N23A (V+2, E-1), N28B (V+1, E-1)
 * A6 zahteva: energija >= 7 na kraju, bez V+2 opcija koje traže pomoć
 * @param {GameState} state
 * @param {DecisionOption} option
 */
export function trackHelpUsage(state, option) {
  // Opcije koje se broje kao "traženje pomoći" za A6
  const HELP_OPTIONS_V2 = ['N5B', 'N23A', 'N28B', 'N14C', 'N23B'];
  if (HELP_OPTIONS_V2.includes(option.id)) {
    const v = option.delta?.v || 0;
    if (v >= 2) {
      state.achievements.usedV2Help = true;
    }
  }
}

/**
 * Narativni komentar za resurs promenu (flavor text)
 * @param {string} resource
 * @param {number} delta
 * @returns {string|null}
 */
export function narrativeComment(resource, delta) {
  if (delta === 0) return null;
  const comments = {
    energija: {
      up: ['Udahneš.', 'Malo lakše.', 'Nešto te napuni.'],
      down: ['Umor je tu.', 'Telo zapamti.', 'Korak teži od prethodnog.']
    },
    veze: {
      up: ['Neko ostaje.', 'Veza se zateze u dobrom smislu.', 'Nije bio samo festival.'],
      down: ['Nešto se tanja.', 'Razdaljina raste.', 'Priča ostaje neispisana.']
    },
    secanja: {
      up: ['To ostaje.', 'Slike se talože.', 'Nešto za pamtiti.'],
      down: ['Prolazi kao voda.', 'Biće zaboravljeno.', '']
    },
    nered: {
      up: ['Gomila se.', 'Nered se ne rešava sam.', 'Dodaje se na listu.'],
      down: ['Livada diše.', 'Red vraća mir.', 'Jedno manje na listi.']
    }
  };
  const pool = delta > 0 ? (comments[resource]?.up || []) : (comments[resource]?.down || []);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}
