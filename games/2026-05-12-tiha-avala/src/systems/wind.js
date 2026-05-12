// wind.js — sinus wind oscillator

import { WIND_PERIOD_MS, WIND_AMPLITUDE } from '../config.js';

let wind_time = 0;

export function resetWind() {
  wind_time = 0;
}

export function updateWind(dt_ms) {
  wind_time += dt_ms;
  // Sinus oscillacija: vraca delta u dB
  const phase = (wind_time / WIND_PERIOD_MS) * 2 * Math.PI;
  return Math.sin(phase) * WIND_AMPLITUDE;
}

export function getWindDelta(t_ms) {
  const phase = (t_ms / WIND_PERIOD_MS) * 2 * Math.PI;
  return Math.sin(phase) * WIND_AMPLITUDE;
}
