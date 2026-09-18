/**
 * hud.js — HUD renderer: countdown, kasa, slots, forecast, bačva widget, passive jobs.
 */

import { GAME_DAYS, WEATHER_ICONS } from '../config.js';
import { capacityPercent, usedCapacity } from '../systems/capacity.js';

/**
 * Renderuje kompletan HUD i upisuje ga u container.
 * Briše prethodni sadržaj containera pre renderovanja.
 * @param {HTMLElement} container - Wrapper element (npr. div.hud)
 * @param {object} state
 */
export function renderHUD(container, state) {
  container.innerHTML = '';

  // Dan counter
  const countdown = buildCountdown(state.day);
  container.appendChild(countdown);

  // Slot dots
  const slots = buildSlots(state.slots, 4);
  container.appendChild(slots);

  // Kasa
  const kasa = buildKasa(state.kasa);
  container.appendChild(kasa);

  // Forecast
  const forecast = buildForecast(state.today_weather, state.tomorrow_weather);
  container.appendChild(forecast);

  // Tegle count
  const used = usedCapacity(state.tegle);
  const capPct = capacityPercent(state.tegle, state.shelf_level);
  const jarCount = buildJarCount(used, capPct);
  container.appendChild(jarCount);
}

/**
 * Builds the day countdown element.
 * @param {number} day
 * @returns {HTMLElement}
 */
function buildCountdown(day) {
  const el = document.createElement('div');
  el.className = 'hud-countdown';
  el.innerHTML = `Dan <span class="day-num">${day}</span><span class="text-muted">/${GAME_DAYS}</span>`;
  return el;
}

/**
 * Builds slot dots (● used / ○ available).
 * @param {number} slotsLeft
 * @param {number} totalSlots
 * @returns {HTMLElement}
 */
function buildSlots(slotsLeft, totalSlots) {
  const el = document.createElement('div');
  el.className = 'hud-slots';
  el.title = `Akcije: ${slotsLeft}/${totalSlots}`;
  for (let i = 0; i < totalSlots; i++) {
    const dot = document.createElement('span');
    dot.className = 'slot-dot' + (i >= slotsLeft ? ' used' : '');
    el.appendChild(dot);
  }
  return el;
}

/**
 * Builds kasa display.
 * @param {number} kasa
 * @returns {HTMLElement}
 */
function buildKasa(kasa) {
  const el = document.createElement('div');
  el.className = 'hud-kasa';
  el.textContent = `${kasa.toLocaleString('sr')} RSD`;
  return el;
}

/**
 * Builds the weather forecast strip.
 * @param {string} today
 * @param {string} tomorrow
 * @returns {HTMLElement}
 */
function buildForecast(today, tomorrow) {
  const el = document.createElement('div');
  el.className = 'hud-forecast';

  const todayEl = document.createElement('span');
  todayEl.title = `Danas: ${today}`;
  todayEl.textContent = WEATHER_ICONS[today] || '☀️';

  const arrow = document.createElement('span');
  arrow.className = 'forecast-label';
  arrow.textContent = '→';

  const tomEl = document.createElement('span');
  tomEl.title = `Sutra (prognoza): ${tomorrow}`;
  tomEl.textContent = WEATHER_ICONS[tomorrow] || '☀️';
  tomEl.style.opacity = '0.7';

  el.appendChild(todayEl);
  el.appendChild(arrow);
  el.appendChild(tomEl);
  return el;
}

/**
 * Builds jar count / capacity indicator.
 * @param {number} usedKg
 * @param {number} capPercent - 0 to 1
 * @returns {HTMLElement}
 */
function buildJarCount(usedKg, capPercent) {
  const el = document.createElement('div');
  el.className = 'hud-kasa';
  el.style.cssText = 'font-size:0.8rem;';
  const pct = Math.round(capPercent * 100);
  let color = 'var(--cool)';
  if (capPercent >= 0.9) color = 'var(--alert)';
  else if (capPercent >= 0.7) color = 'var(--warm)';
  el.innerHTML = `🫙 <span style="color:${color}">${pct}%</span>`;
  el.title = `Police: ${usedKg.toFixed(1)} kg`;
  return el;
}

/**
 * Renderuje countdown traku (standalone, za externe pozivaoce).
 * @param {HTMLElement} container
 * @param {number} day
 */
export function renderCountdown(container, day) {
  container.innerHTML = '';
  container.appendChild(buildCountdown(day));
}

/**
 * Renderuje prikaz kase (standalone).
 * @param {HTMLElement} container
 * @param {number} kasa
 */
export function renderKasa(container, kasa) {
  container.innerHTML = '';
  container.appendChild(buildKasa(kasa));
}

/**
 * Renderuje weather forecast strip (standalone).
 * @param {HTMLElement} container
 * @param {string} today
 * @param {string} tomorrow
 */
export function renderForecast(container, today, tomorrow) {
  container.innerHTML = '';
  container.appendChild(buildForecast(today, tomorrow));
}

/**
 * Renderuje action slot indikatore (standalone).
 * @param {HTMLElement} container
 * @param {number} slotsLeft
 * @param {number} totalSlots
 */
export function renderSlots(container, slotsLeft, totalSlots) {
  container.innerHTML = '';
  container.appendChild(buildSlots(slotsLeft, totalSlots));
}

/**
 * Renderuje bačva status widget i upisuje ga u container.
 * @param {HTMLElement} container
 * @param {string} bacvaStatus - 'unsalted'|'critical_window'|'fermenting'|'ready'|'failed'
 * @param {number} daysLeft
 */
export function renderBacvaWidget(container, bacvaStatus, daysLeft) {
  container.innerHTML = '';
  if (bacvaStatus === 'unsalted') return; // ne prikazuj dok nije inicijalizovana

  const el = document.createElement('div');
  el.className = `bacva-widget ${bacvaStatus}`;

  const statusMap = {
    critical_window: { icon: '🪣', label: 'BAČVA KO!' },
    fermenting:      { icon: '🥬', label: `Kiseli ${daysLeft}d` },
    ready:           { icon: '✅', label: 'Bačva gotova!' },
    failed:          { icon: '💀', label: 'Bačva propala' },
  };

  const info = statusMap[bacvaStatus] || { icon: '🪣', label: bacvaStatus };
  el.textContent = `${info.icon} ${info.label}`;
  container.appendChild(el);
}
