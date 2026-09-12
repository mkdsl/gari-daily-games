/**
 * characters.js — Toma NPC i ostali likovi, statusi i arc tracking
 */

/**
 * Toma Pejović — susused/prijatelj, veteran imanja
 * @param {GameState} state
 * @returns {{ mood: string, description: string }}
 */
export function tomaStatus(state) {
  const tomaA = state.tomaChoicesA || [];
  const count = tomaA.length;

  if (count === 0) {
    return { mood: 'distantan', description: 'Toma je tu, ali ne razgovarate pravo.' };
  } else if (count === 1) {
    return { mood: 'prisutan', description: 'Toma prati dan od strane.' };
  } else if (count === 2) {
    return { mood: 'blizak', description: 'Toma i ti delite ovaj dan.' };
  } else {
    return { mood: 'porodica', description: 'Toma je deo ovoga. Uvek je bio.' };
  }
}

/**
 * Toma dijalog varijanta (prestige vs. normalni run)
 * Za N21
 * @param {boolean} isPrestige
 * @returns {string}
 */
export function tomaN21Question(isPrestige) {
  if (isPrestige) {
    return '"Rekao si isto prošle godine. Šta je drugačije ovog puta?"';
  }
  return '"Da li radimo sledeće leto?"';
}

/**
 * Likovi koji se mogu pojaviti u nodovima
 */
export const CHARACTERS = {
  toma: {
    id: 'toma',
    name: 'Toma Pejović',
    role: 'Prijatelj, veteran Guncati imanja',
    avatar: '👴'
  },
  slavko: {
    id: 'slavko',
    name: 'Slavko',
    role: 'Komšija',
    avatar: '🏠'
  },
  ana: {
    id: 'ana',
    name: 'Ana',
    role: 'Volonter',
    avatar: '🙋'
  },
  nikola: {
    id: 'nikola',
    name: 'Nikola',
    role: 'Bivši volonter, generacija 1',
    avatar: '📱'
  },
  novinarka: {
    id: 'novinarka',
    name: 'Novinarka',
    role: 'Mediji',
    avatar: '🎤'
  }
};
