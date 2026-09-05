/**
 * @module weather
 * Weather preset generation, forecast management, and per-week weather queries.
 *
 * 4 presets (chosen randomly each run):
 *   suva_jesen     — no rain, no frost, all weeks sunny ☀️
 *   kisna_jesen    — 3 consecutive rainy weeks in N1–N8 🌧️
 *   rani_mraz      — frost arrives N10, Micelij/Rezidba window truncated ❄️
 *   vatreno_lisce  — hot N1–N3, Ozimo +1 week, Kompost hot penalty 🍂
 */

import { WEATHER_PRESETS, FORECAST_VISIBLE_WEEKS, WEEKS } from '../config.js';

/**
 * @typedef {Object} WeatherState
 * @property {string} preset_id
 * @property {string} preset_name
 * @property {string} preset_emoji
 * @property {string} preset_description
 * @property {number[]} rain_weeks
 * @property {number|null} frost_week
 * @property {number[]} hot_weeks
 * @property {number[]} forecast_revealed
 */

/**
 * Generate a weather state for a new run.
 * @param {string|null} prestigeBonus
 * @returns {WeatherState}
 */
export function generateWeather(prestigeBonus) {
  const presetDef = WEATHER_PRESETS[Math.floor(Math.random() * WEATHER_PRESETS.length)];
  return buildWeatherState(presetDef, prestigeBonus);
}

/**
 * Generate a specific weather preset by id (for testing/debug)
 * @param {string} presetId
 * @param {string|null} prestigeBonus
 * @returns {WeatherState}
 */
export function generateWeatherById(presetId, prestigeBonus) {
  const presetDef = WEATHER_PRESETS.find((p) => p.id === presetId) ?? WEATHER_PRESETS[0];
  return buildWeatherState(presetDef, prestigeBonus);
}

/**
 * Build a WeatherState from a preset definition
 * @param {typeof WEATHER_PRESETS[0]} presetDef
 * @param {string|null} prestigeBonus
 * @returns {WeatherState}
 */
function buildWeatherState(presetDef, prestigeBonus) {
  let rain_weeks = [];
  let frost_week = null;
  let hot_weeks = [...(presetDef.hot_weeks || [])];

  if (presetDef.id === 'kisna_jesen') {
    // 3 consecutive rainy weeks starting in N1–N6 (so 3-week run fits in N1–N8)
    const start = Math.floor(Math.random() * 6) + 1; // 1, 2, 3, 4, 5, or 6
    rain_weeks = [start, start + 1, start + 2];
  } else {
    rain_weeks = [...(presetDef.rain_weeks || [])];
  }

  if (presetDef.id === 'rani_mraz') {
    frost_week = presetDef.frost_week ?? 10;
  }

  // full_forecast prestige: all 12 weeks revealed immediately
  const revealCount = prestigeBonus === 'full_forecast' ? WEEKS : FORECAST_VISIBLE_WEEKS;
  const forecast_revealed = Array.from({ length: revealCount }, (_, i) => i + 1);

  return {
    preset_id: presetDef.id,
    preset_name: presetDef.name,
    preset_emoji: presetDef.emoji,
    preset_description: presetDef.description,
    rain_weeks,
    frost_week,
    hot_weeks,
    forecast_revealed,
  };
}

/**
 * Reveal additional forecast weeks for the player to see.
 * Typically called when player makes progress or has a prestige bonus.
 * @param {WeatherState} weather
 * @param {number} count - additional weeks to reveal
 */
export function revealForecast(weather, count = 1) {
  const maxRevealed = weather.forecast_revealed.length > 0
    ? Math.max(...weather.forecast_revealed)
    : 0;

  for (let i = 1; i <= count; i++) {
    const next = maxRevealed + i;
    if (next <= WEEKS && !weather.forecast_revealed.includes(next)) {
      weather.forecast_revealed.push(next);
    }
  }
  weather.forecast_revealed.sort((a, b) => a - b);
}

/**
 * Reveal all forecast weeks (e.g., after prestige selection)
 * @param {WeatherState} weather
 */
export function revealAllForecast(weather) {
  weather.forecast_revealed = Array.from({ length: WEEKS }, (_, i) => i + 1);
}

/**
 * Check if a specific week has rain
 * @param {WeatherState} weather
 * @param {number} week
 * @returns {boolean}
 */
export function isRainWeek(weather, week) {
  return weather.rain_weeks.includes(week);
}

/**
 * Check if frost has arrived by a given week
 * @param {WeatherState} weather
 * @param {number} week
 * @returns {boolean}
 */
export function isFrostWeek(weather, week) {
  return weather.frost_week !== null && week >= weather.frost_week;
}

/**
 * Check if a specific week is in the hot period
 * @param {WeatherState} weather
 * @param {number} week
 * @returns {boolean}
 */
export function isHotWeek(weather, week) {
  return weather.hot_weeks.includes(week);
}

/**
 * Check if a task assignment is blocked by rain in a given week.
 * Only tasks with blocked_by_rain: true can be blocked.
 * @param {import('../content/tasks.js').Task} task
 * @param {number} week
 * @param {WeatherState} weather
 * @returns {boolean}
 */
export function isBlockedByRain(task, week, weather) {
  if (!task.blocked_by_rain) return false;
  return isRainWeek(weather, week);
}

/**
 * Get the effective scheduling window for a task given current weather.
 *
 * Weather modifiers:
 *   rani_mraz:     Micelij and Rezidba window_end capped to (frost_week - 1)
 *   vatreno_lisce: Ozimo window extended by 1 week
 *
 * @param {import('../content/tasks.js').Task} task
 * @param {WeatherState} weather
 * @returns {{ start: number, end: number }}
 */
export function getEffectiveWindow(task, weather) {
  let start = task.window_start;
  let end = task.window_end;

  if (weather.preset_id === 'rani_mraz' && weather.frost_week !== null) {
    if (task.id === 'micelij' || task.id === 'rezidba') {
      end = Math.min(end, weather.frost_week - 1);
      // Ensure end >= start (edge case if frost comes very early)
      end = Math.max(end, start);
    }
  }

  if (weather.preset_id === 'vatreno_lisce') {
    if (task.id === 'ozimo') {
      end = Math.min(end + 1, WEEKS);
    }
  }

  return { start, end };
}

/**
 * Check if a task placed in a given week is in-window (considering weather)
 * @param {import('../content/tasks.js').Task} task
 * @param {number} week
 * @param {WeatherState} weather
 * @returns {boolean}
 */
export function isInWindow(task, week, weather) {
  const { start, end } = getEffectiveWindow(task, weather);
  return week >= start && week <= end;
}

/**
 * Get the weather symbol for a given week (for forecast bar / header display)
 * Returns the most "severe" weather for that week.
 * @param {WeatherState} weather
 * @param {number} week
 * @returns {string} emoji
 */
export function getWeekWeatherEmoji(weather, week) {
  if (isFrostWeek(weather, week)) return '❄️';
  if (isRainWeek(weather, week)) return '🌧️';
  if (isHotWeek(weather, week)) return '🌡️';
  return '☀️';
}

/**
 * Check if a week's forecast is currently visible to the player
 * @param {WeatherState} weather
 * @param {number} week
 * @returns {boolean}
 */
export function isForecastVisible(weather, week) {
  return weather.forecast_revealed.includes(week);
}

/**
 * Get a full weather description for a week (for tooltip/aria)
 * @param {WeatherState} weather
 * @param {number} week
 * @returns {string}
 */
export function getWeekWeatherDescription(weather, week) {
  const visible = isForecastVisible(weather, week);
  if (!visible) return `N${week}: Prognoza nepoznata`;

  if (isFrostWeek(weather, week)) {
    return `N${week}: Mraz ❄️ — Micelij i Rezidba van prozora, ostale radnje neometane`;
  }
  if (isRainWeek(weather, week)) {
    return `N${week}: Kiša 🌧️ — Suvozid i tarabe blokirani, ostale radnje neometane`;
  }
  if (isHotWeek(weather, week)) {
    return `N${week}: Toplo 🌡️ — Kompost -10% poena, ostale radnje normalne`;
  }
  return `N${week}: Sunce ☀️ — Idealni uslovi za sve radove`;
}

/**
 * Get all blocked weeks for a specific task given current weather
 * @param {import('../content/tasks.js').Task} task
 * @param {WeatherState} weather
 * @returns {number[]}
 */
export function getBlockedWeeksForTask(task, weather) {
  const blocked = [];
  for (let week = 1; week <= WEEKS; week++) {
    if (isBlockedByRain(task, week, weather)) {
      blocked.push(week);
    }
  }
  return blocked;
}

/**
 * Get a summary of weather conditions for the UI header
 * @param {WeatherState} weather
 * @returns {{ emoji: string, name: string, description: string, warnings: string[] }}
 */
export function getWeatherSummary(weather) {
  const warnings = [];

  if (weather.rain_weeks.length > 0) {
    const weeks = weather.rain_weeks.map((w) => `N${w}`).join(', ');
    warnings.push(`Kiša u: ${weeks} — blokira gradilišne radove`);
  }

  if (weather.frost_week !== null) {
    warnings.push(`Mraz od N${weather.frost_week} — skraćuje prozore za Micelij i Rezidbu`);
  }

  if (weather.hot_weeks.length > 0) {
    const weeks = weather.hot_weeks.map((w) => `N${w}`).join(', ');
    warnings.push(`Toplo u: ${weeks} — Kompost -10% poena`);
  }

  return {
    emoji: weather.preset_emoji,
    name: weather.preset_name,
    description: weather.preset_description,
    warnings,
  };
}

/**
 * Get forecast display data for all 12 weeks
 * @param {WeatherState} weather
 * @returns {Array<{week: number, visible: boolean, emoji: string, description: string, classes: string[]}>}
 */
export function getForecastDisplayData(weather) {
  return Array.from({ length: WEEKS }, (_, i) => {
    const week = i + 1;
    const visible = isForecastVisible(weather, week);
    const emoji = visible ? getWeekWeatherEmoji(weather, week) : '❓';
    const description = getWeekWeatherDescription(weather, week);

    const classes = ['forecast-week'];
    if (!visible) classes.push('hidden');
    else {
      classes.push('visible');
      if (isRainWeek(weather, week)) classes.push('rain');
      if (isFrostWeek(weather, week)) classes.push('frost');
      if (isHotWeek(weather, week)) classes.push('hot');
    }

    return { week, visible, emoji, description, classes };
  });
}

/**
 * Describe how weather affects a specific task (for info tooltip)
 * @param {import('../content/tasks.js').Task} task
 * @param {WeatherState} weather
 * @returns {string|null} null if no special weather effect on this task
 */
export function getWeatherEffectOnTask(task, weather) {
  if (isBlockedByRain(task, /* any rain week */ weather.rain_weeks[0] ?? 0, weather) &&
      weather.rain_weeks.length > 0) {
    const weeks = weather.rain_weeks.map((w) => `N${w}`).join(', ');
    return `🌧️ Blokiran kišom u: ${weeks}`;
  }

  if ((task.id === 'micelij' || task.id === 'rezidba') && weather.frost_week !== null) {
    const { end } = getEffectiveWindow(task, weather);
    return `❄️ Mraz (N${weather.frost_week}) skratio prozor — novi kraj: N${end}`;
  }

  if (task.id === 'ozimo' && weather.preset_id === 'vatreno_lisce') {
    const { end } = getEffectiveWindow(task, weather);
    return `🌡️ Toplo vreme produžilo prozor do N${end}`;
  }

  if (task.id === 'kompost' && weather.preset_id === 'vatreno_lisce') {
    return `🌡️ Kompost u N1–N2: -10% poena zbog toplog vremena`;
  }

  return null;
}
