/**
 * @file systems/fermentation.js
 * Fermenter — Varenički Bunt
 * Logika fermentacije po tick-u, degradacija i oporavak.
 */

import { CONFIG } from '../config.js';
import { computeDerivedStats } from '../state.js';

/**
 * Obrađuje jedan tick fermentacije.
 * Pozivati iz glavne game loop-e sa dt u sekundama.
 * @param {GameState} state — mutira se in-place
 * @param {number} dt — delta vreme u sekundama
 */
export function tickFermentation(state, dt) {
  // ── 1. Head start (M4 Micelarna Mreža) ──────────────────────────────────────
  // Prvih N sekundi posle prestiže teče pasivna FJ/s bez potrebe za klikom.
  // headStartRemaining se odbrojava ovde i ne blokira normalnu fermentaciju.
  if (state.mutationState.headStartRemaining > 0) {
    state.mutationState.headStartRemaining = Math.max(
      0,
      state.mutationState.headStartRemaining - dt
    );
  }

  // ── 2. Generiši FJ pasivno ───────────────────────────────────────────────────
  // state.fermentRate je već izvedena vrednost (sa degradacijom i multiplikatorima)
  // računata u computeDerivedStats. Samo je primenimo.
  const fjGained = state.fermentRate * dt;
  state.fj += fjGained;

  // ── 3. Regeneriši SJ iz FJ ───────────────────────────────────────────────────
  // Svaka generisana FJ donosi CONFIG.FJ_TO_SJ_RATIO SJ, do SJ_CAPACITY.
  const sjGain = state.fermentRate * dt * CONFIG.FJ_TO_SJ_RATIO;
  state.sj = Math.min(state.sj + sjGain, CONFIG.SJ_CAPACITY);

  // ── 4. Akumuliraj pressure ───────────────────────────────────────────────────
  // Baza: fermentRate × PRESSURE_RATE_FACTOR
  let pressureGain = state.fermentRate * CONFIG.PRESSURE_RATE_FACTOR * dt;

  // presurni_katalizator: ×1.4 po nivou (compounding)
  const katalizatorLvl = state.upgrades['presurni_katalizator'] || 0;
  if (katalizatorLvl > 0) {
    pressureGain *= Math.pow(1.4, katalizatorLvl);
  }

  // M5 Pritisak Kaskada: ako pressure >= 50 i M5 aktivna → ×1.6
  if (
    state.activeMutations.includes('M5') &&
    state.pressure >= 50
  ) {
    pressureGain *= 1.6;
  }

  state.pressure = Math.min(
    state.pressure + pressureGain,
    CONFIG.MAX_PRESSURE
  );
}

/**
 * Provjeri i primeni degradaciju na osnovu vremena neaktivnosti.
 * @param {GameState} state — mutira se in-place
 * @param {number} now — trenutni timestamp u ms (Date.now())
 */
export function checkDegradation(state, now) {
  // M7 Endosporna Forma: degradacija je potpuno onemogućena
  if (state.activeMutations.includes('M7')) {
    state.isDegraded = false;
    state.degradationFactor = 1.0;
    return;
  }

  const timeSinceActivity = (now - state.lastActivityTime) / 1000;

  if (timeSinceActivity > CONFIG.DEGRADATION_TIMEOUT) {
    // Koliko kompletnih intervala je prošlo od početka degradacije
    const intervals = Math.floor(
      (timeSinceActivity - CONFIG.DEGRADATION_TIMEOUT) /
        CONFIG.DEGRADATION_INTERVAL
    );

    // termal_regulator poboljšava DEGRADATION_FACTOR:
    // base 0.95, +0.006 po nivou → na lvl 5 efektivno 0.95 + 0.030 = 0.98
    const termalLvl = state.upgrades['termal_regulator'] || 0;
    const effectiveFactor =
      CONFIG.DEGRADATION_FACTOR + termalLvl * 0.006;

    // Kumulativna degradacija: factor^intervals, zaštita od poda
    const rawFactor = Math.pow(effectiveFactor, intervals);
    const degradationFactor = Math.max(
      rawFactor,
      CONFIG.MIN_FERMENT_RATE_FACTOR
    );

    state.degradationFactor = degradationFactor;
    state.isDegraded = degradationFactor < 0.99;
  } else {
    // Igrač je aktivan — bez degradacije
    state.isDegraded = false;
    state.degradationFactor = 1.0;
  }

  // computeDerivedStats primenjuje degradationFactor na fermentRate
  computeDerivedStats(state);
}

/**
 * Oporavi bure od degradacije (pozivati na klik ili kupovinu).
 * Resetuje degradacioni faktor i timestamp aktivnosti.
 * @param {GameState} state — mutira se in-place
 */
export function recoverFromDegradation(state) {
  state.lastActivityTime = Date.now();
  state.degradationFactor = 1.0;
  state.isDegraded = false;
  computeDerivedStats(state);
}
