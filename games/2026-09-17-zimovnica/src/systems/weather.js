/**
 * weather.js — Weather forecast: generiše sutrašnje vreme, utiče na sušenje.
 */

import { FORECAST_ACCURACY, WEATHER_MULT } from '../config.js';

/** @type {('sunny'|'cloudy'|'rainy')[]} */
const WEATHER_TYPES = ['sunny', 'cloudy', 'rainy'];

/** Verovatnoće po tipu (mora sumirati na 1.0) */
const WEATHER_PROBS = { sunny: 0.50, cloudy: 0.30, rainy: 0.20 };

/**
 * Generiše vreme za sledeći dan na osnovu trenutne prognoze.
 * @param {string} currentForecast - Prognoza koja se realizuje kao današnje vreme
 * @returns {{ today: string, tomorrow: string }}
 */
export function generateWeather(currentForecast) {
  // Prognoza se realizuje sa FORECAST_ACCURACY
  const actualToday = Math.random() < FORECAST_ACCURACY
    ? currentForecast
    : randomWeather();

  // Generiši novu prognozu za sutra
  const tomorrow = randomWeather();

  return { today: actualToday, tomorrow };
}

/**
 * Generiše nasumično vreme prema raspodeli.
 * @returns {'sunny'|'cloudy'|'rainy'}
 */
export function randomWeather() {
  const r = Math.random();
  let cum = 0;
  for (const [type, prob] of Object.entries(WEATHER_PROBS)) {
    cum += prob;
    if (r < cum) return type;
  }
  return 'sunny';
}

/**
 * Vraća multiplikator za dati tip vremena.
 * @param {string} weather
 * @returns {number}
 */
export function getWeatherMult(weather) {
  return WEATHER_MULT[weather] ?? 1.0;
}

/**
 * Da li je vreme povoljno za outdoor sušenje?
 * @param {string} weather
 * @returns {boolean}
 */
export function isSuitableForDrying(weather) {
  return weather === 'sunny';
}
