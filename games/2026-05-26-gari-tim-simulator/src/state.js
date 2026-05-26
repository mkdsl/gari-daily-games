// state.js — createState, save/load localStorage
import { LS_KEYS, AFFINITY_KEYS } from './config.js';

export function createState() {
  return {
    scene: 0,
    affinity: { gari: 0, mici: 0, brana: 0, tonket: 0, dule: 0, pera: 0 },
    flags: {
      predstavljanje_tip: null,
      strana_konfrontacije: null,
      tonket_pitanje: null,
      gari_finalni: null,
      dule_greska: false,
    },
    ending: null,
    scene3_character: null,
    scene3_q: 0,
    micro_dule_done: false,
  };
}

export function saveToLocalStorage(state) {
  try {
    const count = getPlayCount() + (state.ending !== null ? 1 : 0);
    if (state.ending !== null && state.ending !== 'lose') {
      // save highscore
      const total = AFFINITY_KEYS.reduce((s, k) => s + state.affinity[k], 0);
      const hs = parseInt(localStorage.getItem(LS_KEYS.highscore) || '0', 10);
      if (total > hs) localStorage.setItem(LS_KEYS.highscore, String(total));

      // save endings unlocked
      let endings = JSON.parse(localStorage.getItem(LS_KEYS.endingsUnlocked) || '[]');
      if (!endings.includes(state.ending)) {
        endings.push(state.ending);
        localStorage.setItem(LS_KEYS.endingsUnlocked, JSON.stringify(endings));
      }

      localStorage.setItem(LS_KEYS.lastEnding, String(state.ending));

      // flags history
      let hist = JSON.parse(localStorage.getItem(LS_KEYS.flagsHistory) || '[]');
      hist.push({ ...state.flags, ts: Date.now() });
      if (hist.length > 20) hist = hist.slice(-20);
      localStorage.setItem(LS_KEYS.flagsHistory, JSON.stringify(hist));
    }
    localStorage.setItem(LS_KEYS.playCount, String(count));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

export function getPlayCount() {
  return parseInt(localStorage.getItem(LS_KEYS.playCount) || '0', 10);
}

export function getEndingsUnlocked() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.endingsUnlocked) || '[]');
  } catch { return []; }
}
