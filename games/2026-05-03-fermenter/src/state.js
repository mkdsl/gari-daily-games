/**
 * @file state.js
 * Fermenter — Varenički Bunt
 * Game state shape, save/load, i računanje izvedenih statistika.
 */

import { CONFIG } from './config.js';

/**
 * Kreira svježe početno stanje igre.
 * @returns {GameState}
 */
export function createInitialState() {
  return {
    // ── Resursi ─────────────────────────────────────────────────────────────
    /** Šećerne jedinice — currency za kupovinu upgrada */
    sj: 0,
    /** Fermentacione jedinice — akumulirane (score / prestiže valuta) */
    fj: 0,

    // ── Fermentacija (izvedeno, refresh-uje computeDerivedStats) ────────────
    /** Trenutna FJ/s stopa (pasivna + upgrades + mutacije) */
    fermentRate: CONFIG.BASE_FERMENT_RATE,
    /** Trenutna snaga po kliku u SJ */
    clickPower: CONFIG.BASE_CLICK_POWER,

    // ── Pressure ─────────────────────────────────────────────────────────────
    /** Trenutni pritisak (0–100). Na 100 dostupan prestiže. */
    pressure: 0,
    /** Broj obavljenih prestiža */
    prestigeCount: 0,

    // ── Upgrades ─────────────────────────────────────────────────────────────
    /** Mapa upgradeId → trenutni nivo (0 = nije kupljen) */
    upgrades: {},

    // ── Mutacije ─────────────────────────────────────────────────────────────
    /** Lista ID-eva aktivnih mutacija (trajne, preživljavaju prestiže) */
    activeMutations: [],

    // ── Degradacija ──────────────────────────────────────────────────────────
    /** Timestamp poslednje aktivnosti igrača (klik / kupovina) */
    lastActivityTime: Date.now(),
    /** Da li je bure trenutno u degradiranom stanju */
    isDegraded: false,
    /**
     * Kumulativni multiplikator degradacije (počinje na 1.0, pada svakih 30s).
     * Efektivni fermentRate = fermentRate × degradationFactor
     */
    degradationFactor: 1.0,

    // ── Meta ─────────────────────────────────────────────────────────────────
    /** Timestamp startа sesije (ne resetuje se na prestiže) */
    gameStartTime: Date.now(),
    /** Ukupno vreme provedeno u igri (u sekundama, akumulira se) */
    totalTime: 0,

    // ── Mutation-specific state ───────────────────────────────────────────────
    mutationState: {
      /** M1: Termofilni Kvasac — trenutni stack multiplikator (1 = bez busta) */
      thermoClickStack: 1,
      /** M1: Timestamp poslednjeg klika za praćenje pauze */
      thermoLastClickTime: 0,
      /** M1: Akumulirano vreme aktivnog klika za napredak u stack-u */
      thermoActiveSeconds: 0,
      /** M4: Preostale sekunde head-start efekta posle prestiže */
      headStartRemaining: 0,
    },
  };
}

/**
 * Sačuva state u localStorage.
 * Gracefully ignorira greške (private mode, quota exceeded, itd.)
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    const payload = JSON.stringify({
      ...state,
      // Timestamp kad je sačuvano — za offline recovery
      _savedAt: Date.now(),
    });
    localStorage.setItem(CONFIG.SAVE_KEY, payload);
  } catch (_e) {
    // localStorage nije dostupan ili je pun — nastavljamo bez save-a
  }
}

/**
 * Učita state iz localStorage.
 * @returns {GameState|null} — null ako nema save-a ili je parsiranje propalo
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Merge s initial state-om da popunimo nova polja
    // koja možda ne postoje u starim save-ovima
    const initial = createInitialState();
    const merged = deepMerge(initial, parsed);

    // Sanitizacija: osiguraj da su kritična polja validna
    merged.sj = Math.max(0, Number(merged.sj) || 0);
    merged.fj = Math.max(0, Number(merged.fj) || 0);
    merged.pressure = Math.min(CONFIG.MAX_PRESSURE, Math.max(0, Number(merged.pressure) || 0));
    merged.prestigeCount = Math.max(0, Math.min(CONFIG.MAX_PRESTIGES, Number(merged.prestigeCount) || 0));
    merged.degradationFactor = Math.min(1.0, Math.max(0.01, Number(merged.degradationFactor) || 1.0));

    if (!Array.isArray(merged.activeMutations)) merged.activeMutations = [];
    if (!merged.upgrades || typeof merged.upgrades !== 'object') merged.upgrades = {};
    if (!merged.mutationState || typeof merged.mutationState !== 'object') {
      merged.mutationState = initial.mutationState;
    }

    // Rekalkuliši izvedene statistike na osnovu učitanog upgrade/mutation stanja
    computeDerivedStats(merged);

    return merged;
  } catch (_e) {
    return null;
  }
}

/**
 * Računa izvedene statistike (fermentRate, clickPower) iz upgrade nivoa i mutacija.
 * Uvek pozivati posle svake promene upgrade-a, mutacije ili degradationFactor-a.
 * @param {GameState} state — mutira se in-place
 */
export function computeDerivedStats(state) {
  // ── 1. Pasivna baza FJ/s ──────────────────────────────────────────────────
  let passiveFjPerSec = CONFIG.BASE_FERMENT_RATE;

  // mlecna_baza: +0.5 FJ/s po nivou
  const mlecnaLevel = state.upgrades['mlecna_baza'] || 0;
  const mlecnaUpgrade = CONFIG.UPGRADES.find(u => u.id === 'mlecna_baza');
  if (mlecnaLevel > 0 && mlecnaUpgrade) {
    passiveFjPerSec += mlecnaLevel * mlecnaUpgrade.effectValue;
  }

  // auto_ferment_1: +2.0 FJ/s po nivou
  const af1Level = state.upgrades['auto_ferment_1'] || 0;
  const af1Upgrade = CONFIG.UPGRADES.find(u => u.id === 'auto_ferment_1');
  if (af1Level > 0 && af1Upgrade) {
    passiveFjPerSec += af1Level * af1Upgrade.effectValue;
  }

  // auto_ferment_2: +5.0 FJ/s po nivou
  const af2Level = state.upgrades['auto_ferment_2'] || 0;
  const af2Upgrade = CONFIG.UPGRADES.find(u => u.id === 'auto_ferment_2');
  if (af2Level > 0 && af2Upgrade) {
    passiveFjPerSec += af2Level * af2Upgrade.effectValue;
  }

  // ── 2. Multiplikatori na pasivnu FJ/s ────────────────────────────────────
  let fermentMultiplier = 1.0;

  // micelij_mreza: ×1.5 po nivou (compounding)
  const micelLevel = state.upgrades['micelij_mreza'] || 0;
  const micelUpgrade = CONFIG.UPGRADES.find(u => u.id === 'micelij_mreza');
  if (micelLevel > 0 && micelUpgrade) {
    fermentMultiplier *= Math.pow(micelUpgrade.effectValue, micelLevel);
  }

  // M8 Bifidogena Sinerija: × (1.0 + 0.1 × broj aktivnih mutacija)
  if (state.activeMutations.includes('M8')) {
    const mutCount = state.activeMutations.length;
    fermentMultiplier *= (1.0 + 0.1 * mutCount);
  }

  passiveFjPerSec *= fermentMultiplier;

  // ── 3. Degradacija — primeni na pasivnu stopu ──────────────────────────────
  // M7 Endosporna Forma: nikad ne degradira
  const hasNoDegrade = state.activeMutations.includes('M7');
  let effectiveDegradation = hasNoDegrade ? 1.0 : state.degradationFactor;

  const minRate = CONFIG.BASE_FERMENT_RATE * CONFIG.MIN_FERMENT_RATE_FACTOR;
  const degradedRate = passiveFjPerSec * effectiveDegradation;
  state.fermentRate = Math.max(minRate, degradedRate);

  // M2 Etanol-Rezistentan: +15% fermentRate kad je SJ buffer >=90% kapaciteta
  if (state.activeMutations.includes('M2') && state.sj >= CONFIG.SJ_CAPACITY * 0.9) {
    state.fermentRate *= 1.15;
  }

  // ── 4. Click power ────────────────────────────────────────────────────────
  let cp = CONFIG.BASE_CLICK_POWER;

  // pojacana_membrana: +1.0 po nivou
  const membLevel = state.upgrades['pojacana_membrana'] || 0;
  const membUpgrade = CONFIG.UPGRADES.find(u => u.id === 'pojacana_membrana');
  if (membLevel > 0 && membUpgrade) {
    cp += membLevel * membUpgrade.effectValue;
  }

  // M1 Termofilni Kvasac: clickPower × thermoClickStack (1–4)
  if (state.activeMutations.includes('M1')) {
    cp *= Math.min(state.mutationState.thermoClickStack, CONFIG.THERMO_MAX_STACK);
  }

  state.clickPower = cp;
}

// ── Interni helper ──────────────────────────────────────────────────────────

/**
 * Rekurzivni deep merge: target se popunjava vrednostima iz source.
 * Source pobedi samo ako target nema ključ.
 * Za primitives i arrays — source uvek pobedi (override sačuvanim vrednostima).
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
