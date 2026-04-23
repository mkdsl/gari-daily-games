// src/systems/prestige.js — Prestige trigger, reset, bonus selekcija, meta win check

/**
 * @typedef {'BRZE_RADNICE'|'JACI_ZID'|'VISE_RESURSA'|'BRZE_KOPANJE'} PrestigeBonus
 */

/**
 * @typedef {{
 *   count: number,
 *   bonuses: PrestigeBonus[],
 *   metaWin: boolean
 * }} PrestigeState
 */

/**
 * Kreira inicijalni prestige state.
 * @returns {PrestigeState}
 */
export function createPrestigeState() {}

/**
 * Proverava da li su ispunjeni uslovi za prestige (pronađen kristal i dostignuta baza).
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function canPrestige(state) {}

/**
 * Izvršava prestige reset — čuva bonuse, resetuje grid/resurse/radnice/buru.
 * @param {import('../state.js').GameState} state
 * @param {PrestigeBonus} chosenBonus
 * @returns {void}
 */
export function doPrestige(state, chosenBonus) {}

/**
 * Vraća tri random opcije za prestige bonus (bez duplikata već uzetih).
 * @param {import('../state.js').GameState} state
 * @returns {PrestigeBonus[]}
 */
export function getPrestigeOptions(state) {}

/**
 * Proverava da li je igrač ispunio uslov za meta win (N prestige-a ili specifičan bonus combo).
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function checkMetaWin(state) {}

/**
 * Primenjuje aktivne prestige bonuse na state (multiplikatori, rate boost itd).
 * Poziva se jednom po tick-u pre ostalih sistema.
 * @param {import('../state.js').GameState} state
 * @returns {{ workerSpeedMult: number, wallBonus: number, resourceMult: number, digSpeedMult: number }}
 */
export function getPrestigeBonuses(state) {}
