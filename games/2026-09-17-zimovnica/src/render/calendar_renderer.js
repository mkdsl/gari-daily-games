/**
 * calendar_renderer.js — Renderuje 14-dnevni calendar strip sa statusom dana.
 */

import { GAME_DAYS, WEATHER_ICONS } from '../config.js';

/**
 * Renderuje linearni kalendar strip (14 dana).
 * @param {HTMLElement} container
 * @param {number} currentDay - Trenutni dan (1–14)
 * @param {string} todayWeather - 'sunny'|'cloudy'|'rainy'
 * @param {string} tomorrowWeather
 * @param {object[]} [passiveJobs=[]] - Aktivni pasivni poslovi za vizualizaciju
 */
export function renderCalendar(container, currentDay, todayWeather, tomorrowWeather, passiveJobs = []) {}

/**
 * Gradi jedan ćeliju kalendara.
 * @param {number} dayNum
 * @param {boolean} isPast
 * @param {boolean} isToday
 * @param {string} [weather='']
 * @param {string[]} [jobIcons=[]]
 * @returns {HTMLElement}
 */
function buildDayCell(dayNum, isPast, isToday, weather = '', jobIcons = []) {
  const cell = document.createElement('div');
  cell.className = [
    'cal-day',
    isPast ? 'past' : '',
    isToday ? 'today' : '',
  ].filter(Boolean).join(' ');
  cell.dataset.day = dayNum;

  const num = document.createElement('span');
  num.className = 'cal-day-num';
  num.textContent = dayNum;
  cell.appendChild(num);

  if (weather) {
    const wx = document.createElement('span');
    wx.className = 'cal-weather';
    wx.textContent = WEATHER_ICONS[weather] || '';
    cell.appendChild(wx);
  }

  return cell;
}
