/**
 * atmosphere.js — Background boja i tekst tema po satu
 * iOS Safari workaround: instant swap bez CSS transition
 */

import { ATMOSPHERE } from './config.js';

/** Detektuj iOS Safari */
const IS_IOS = /iP(hone|ad)/.test(navigator.userAgent);

/**
 * Postavi atmosferu za dati sat
 * @param {number} hour - 7..19
 */
export function setAtmosphere(hour) {
  const atm = ATMOSPHERE[hour] || ATMOSPHERE[7];
  const root = document.documentElement;

  if (IS_IOS) {
    // Instant swap — bez transition-a (iOS bug sa color animations)
    root.classList.add('no-transition');
    applyAtmosphere(atm);
    // Force reflow
    void root.offsetHeight;
    root.classList.remove('no-transition');
  } else {
    applyAtmosphere(atm);
  }

  // Postavi label
  const labelEl = document.getElementById('atm-label');
  if (labelEl) labelEl.textContent = atm.label;
}

function applyAtmosphere(atm) {
  document.documentElement.style.setProperty('--atm-bg', atm.bg);
  document.documentElement.style.setProperty('--atm-text', atm.text);
  document.body.style.backgroundColor = atm.bg;
  document.body.style.color = atm.text;
}

/**
 * Vrati tekst boju za trenutni sat
 * @param {number} hour
 * @returns {string} CSS hex boja
 */
export function textColorForHour(hour) {
  return (ATMOSPHERE[hour] || ATMOSPHERE[7]).text;
}

/**
 * Vrati bg boju za trenutni sat
 */
export function bgColorForHour(hour) {
  return (ATMOSPHERE[hour] || ATMOSPHERE[7]).bg;
}

/**
 * Da li je dark atmosfera (tekst je svetli)
 */
export function isDarkAtmosphere(hour) {
  const atm = ATMOSPHERE[hour] || ATMOSPHERE[7];
  return atm.text === '#f5e6c8';
}

/**
 * Inicijalna atmosfera bez animacije
 */
export function initAtmosphere(hour) {
  const root = document.documentElement;
  root.classList.add('no-transition');
  setAtmosphere(hour);
  void root.offsetHeight;
  root.classList.remove('no-transition');
}
