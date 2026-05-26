// state.js — createState(), saveToLocalStorage(), loadFromLocalStorage()
import { LS_KEYS, AFFINITY_CHARACTERS } from './config.js';

export function createState() {
  return {
    scene: 0,
    affinity: {
      gari:   0,
      mici:   0,
      brana:  0,
      tonket: 0,
      dule:   0,
      pera:   0,
    },
    flags: {
      predstavljanje_tip: null,    // "sistem" | "ljude" | "humorno" | "tiho"
      strana_konfrontacije: null,  // "brana" | "mici" | "neutralan" | "preusmeri"
      tonket_pitanje: null,        // "A" | "B" | "C"
      gari_finalni: null,          // "struktura" | "ljude" | "teren" | "jezik"
      dule_greska: false,          // true ako napravio fraze gresku
      scene0_choice: null,         // A/B/C/D — za callback u Scene 3
    },
    ending: null,
  };
}

export function saveToLocalStorage(state, endingId) {
  try {
    // Play count
    const playCount = parseInt(localStorage.getItem(LS_KEYS.playCount) || '0') + 1;
    localStorage.setItem(LS_KEYS.playCount, String(playCount));

    // Last ending
    if (endingId) {
      localStorage.setItem(LS_KEYS.lastEnding, String(endingId));
    }

    // Endings unlocked
    const unlocked = JSON.parse(localStorage.getItem(LS_KEYS.endingsUnlocked) || '[]');
    if (endingId && endingId !== 'lose' && !unlocked.includes(endingId)) {
      unlocked.push(endingId);
      localStorage.setItem(LS_KEYS.endingsUnlocked, JSON.stringify(unlocked));
    }

    // Highscore: total affinity
    const total = Object.values(state.affinity).reduce((a, b) => a + b, 0);
    const prev = parseInt(localStorage.getItem(LS_KEYS.highscore) || '0');
    if (total > prev) {
      localStorage.setItem(LS_KEYS.highscore, String(total));
    }

    // Flags history
    const history = JSON.parse(localStorage.getItem(LS_KEYS.flagsHistory) || '[]');
    history.push({ ...state.flags, ending: endingId });
    if (history.length > 10) history.shift();
    localStorage.setItem(LS_KEYS.flagsHistory, JSON.stringify(history));
  } catch (e) {
    // localStorage unavailable
  }
}

export function loadFromLocalStorage() {
  try {
    return {
      playCount:       parseInt(localStorage.getItem(LS_KEYS.playCount) || '0'),
      endingsUnlocked: JSON.parse(localStorage.getItem(LS_KEYS.endingsUnlocked) || '[]'),
      lastEnding:      localStorage.getItem(LS_KEYS.lastEnding),
      highscore:       parseInt(localStorage.getItem(LS_KEYS.highscore) || '0'),
    };
  } catch (e) {
    return { playCount: 0, endingsUnlocked: [], lastEnding: null, highscore: 0 };
  }
}
