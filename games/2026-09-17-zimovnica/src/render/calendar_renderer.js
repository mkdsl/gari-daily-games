/**
 * calendar_renderer.js — Renderuje 14-dnevni calendar strip sa statusom dana.
 * Horizontalni scroll na mobilnom, compact dizajn.
 */

import { GAME_DAYS, WEATHER_ICONS } from '../config.js';

/** Mapiranje recipe tipa na kratku ikonu za kalendar */
const JOB_ICONS = {
  tursija:       '🥒',
  kiseli_kupus:  '🥬',
  suseno:        '🍎',
  dzem:          '🍓',
  pekmez:        '🫐',
};

/**
 * Renderuje linearni kalendar strip (14 dana) u zadani container.
 * @param {HTMLElement} container
 * @param {number} currentDay - Trenutni dan (1–14)
 * @param {string} todayWeather - 'sunny'|'cloudy'|'rainy'
 * @param {string} tomorrowWeather
 * @param {object[]} [passiveJobs=[]] - Aktivni pasivni poslovi za vizualizaciju
 */
export function renderCalendar(container, currentDay, todayWeather, tomorrowWeather, passiveJobs = []) {
  container.innerHTML = '';
  container.className = 'calendar-strip';

  // Preračunaj koji dani imaju aktivne passive jobs
  /** @type {Map<number, string[]>} */
  const jobsByDay = new Map();
  for (const job of passiveJobs) {
    const endDay = job.end_day;
    if (!jobsByDay.has(endDay)) jobsByDay.set(endDay, []);
    const icon = JOB_ICONS[job.recipe] || JOB_ICONS[job.type] || '⏳';
    jobsByDay.get(endDay).push(icon);
  }

  for (let d = 1; d <= GAME_DAYS; d++) {
    const isPast = d < currentDay;
    const isToday = d === currentDay;
    // Prikaži vreme: danas = todayWeather, sutra = tomorrowWeather, ostalo = ''
    let weather = '';
    if (isToday) weather = todayWeather;
    else if (d === currentDay + 1) weather = tomorrowWeather;

    const jobIcons = jobsByDay.get(d) || [];
    const cell = buildDayCell(d, isPast, isToday, weather, jobIcons);
    container.appendChild(cell);
  }

  // Skroluj do danas
  const todayEl = container.querySelector('.cal-day.today');
  if (todayEl) {
    // Koristi requestAnimationFrame da scrollIntoView radi posle renderovanja
    requestAnimationFrame(() => {
      todayEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }
}

/**
 * Gradi jednu ćeliju kalendara.
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
    isPast  ? 'past'  : '',
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

  // Passive job dot (prikazuje koliko poslova završava taj dan)
  if (jobIcons.length > 0) {
    const dot = document.createElement('span');
    dot.className = 'cal-job-dot';
    dot.title = jobIcons.join(' ');
    cell.appendChild(dot);
  }

  return cell;
}
