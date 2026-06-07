/**
 * weather.js — Weather sistem: poluslučajne prilike, season modifier
 */

import { WEATHER_TYPES, WEATHER_PROBABILITIES } from '../config.js';
import { createRng } from '../utils.js';

/**
 * Bira vreme za sesiju
 * @param {'spring'|'summer'|'autumn'|'winter'} season
 * @param {number} seed
 * @returns {string} weatherId
 */
export function rollWeather(season = 'summer', seed = Date.now()) {
  const rng = createRng(seed);
  const probs = WEATHER_PROBABILITIES[season] || WEATHER_PROBABILITIES.summer;

  let r = rng();
  let cumulative = 0;
  for (const [weatherId, prob] of Object.entries(probs)) {
    cumulative += prob;
    if (r < cumulative) return weatherId;
  }
  return 'sunny';
}

/**
 * Vraca Weather objekat
 * @param {string} weatherId
 * @returns {Object}
 */
export function getWeather(weatherId) {
  return WEATHER_TYPES[weatherId] || WEATHER_TYPES.sunny;
}

/**
 * Generise forecast za sezonu (n dana)
 * @param {number} days
 * @param {'spring'|'summer'|'autumn'|'winter'} season
 * @param {number} seed
 */
export function generateForecast(days, season = 'summer', seed = Date.now()) {
  const forecast = [];
  for (let i = 0; i < days; i++) {
    forecast.push(rollWeather(season, seed + i * 7));
  }
  return forecast;
}

/**
 * Vraca aktuelni season na osnovu meseca
 */
export function getCurrentSeason() {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * Modifikuje incident verovatnocu na osnovu vremena
 */
export function getWeatherIncidentMod(weatherId) {
  return (WEATHER_TYPES[weatherId] || WEATHER_TYPES.sunny).incident_mod;
}

/**
 * Modifikuje energiju polaznika
 */
export function getWeatherEnergyMod(weatherId) {
  return (WEATHER_TYPES[weatherId] || WEATHER_TYPES.sunny).energy_mod;
}

export function isRaining(weatherId) {
  return (WEATHER_TYPES[weatherId] || {}).rain === true;
}
