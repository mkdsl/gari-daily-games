/** Dedicated off-grid traka — DOMINANTNA vizuelno (25%+ dashboard-a) */
import { formatCapacityInfo } from '../micro/offgrid-runtime.js';
import { GAME_CONFIG } from '../config.js';

/** @type {HTMLElement|null} */
let _container = null;

/**
 * Inicijalizuje offgrid meter DOM
 * @param {HTMLElement} container
 */
export function initOffgridMeter(container) {
  _container = container;
  _container.id = 'offgrid-meter-container';

  _container.innerHTML = `
    <div class="offgrid-meter-label">
      <span class="offgrid-meter-title">📡 OFF-GRID KAPACITET</span>
      <span id="offgrid-weather-badge" class="badge badge-signal">⛅ --</span>
    </div>
    <div class="offgrid-meter-value">
      <div style="display:flex; align-items:baseline; gap:8px;">
        <span id="offgrid-number" class="value-display" style="font-size:3.5rem; color:var(--color-offgrid);">--</span>
        <span style="font-size:1rem; color:var(--color-text-muted); font-family:var(--font-mono);">%</span>
      </div>
    </div>
    <div>
      <div class="offgrid-bar-outer" style="height:24px;">
        <div id="offgrid-bar-fill" class="offgrid-bar-fill normal" style="width:100%;"></div>
      </div>
    </div>
    <div class="flex-between" style="margin-top:4px;">
      <span id="offgrid-status-label" class="value-label" style="color:var(--color-offgrid);">NORMALNO</span>
      <span id="offgrid-drain-label" class="value-label">--/s drain</span>
    </div>
  `;
}

/**
 * Ažurira prikaz
 * @param {number} capacity 0-100
 * @param {number} maxCapacity 0-100
 * @param {number} drainPerSec
 * @param {string} weatherBand
 */
export function updateOffgridMeter(capacity, maxCapacity, drainPerSec, weatherBand) {
  if (!_container) return;

  const pct = Math.round(capacity);
  const { label, cssClass } = formatCapacityInfo(capacity);
  const fillPct = maxCapacity > 0 ? (capacity / maxCapacity) * 100 : 0;

  const numEl = _container.querySelector('#offgrid-number');
  const fillEl = _container.querySelector('#offgrid-bar-fill');
  const statusEl = _container.querySelector('#offgrid-status-label');
  const drainEl = _container.querySelector('#offgrid-drain-label');
  const weatherEl = _container.querySelector('#offgrid-weather-badge');

  if (numEl) {
    numEl.textContent = pct;
    numEl.style.color = cssClass === 'normal' ? 'var(--color-offgrid)'
                      : cssClass === 'warn'   ? 'var(--color-warn)'
                      : 'var(--color-critical)';
  }

  if (fillEl) {
    fillEl.style.width = `${Math.max(0, fillPct)}%`;
    fillEl.className = `offgrid-bar-fill ${cssClass}`;
  }

  if (statusEl) {
    statusEl.textContent = label;
    statusEl.style.color = cssClass === 'normal' ? 'var(--color-offgrid)'
                         : cssClass === 'warn'   ? 'var(--color-warn)'
                         : 'var(--color-critical)';
  }

  if (drainEl) {
    drainEl.textContent = drainPerSec > 0 ? `${drainPerSec.toFixed(2)}/s drain` : '';
  }

  if (weatherEl && weatherBand) {
    const weatherLabels = { oblacno: '☁ Oblačno', prosecno: '⛅ Prosečno', suncano: '☀ Sunčano' };
    weatherEl.textContent = weatherLabels[weatherBand] || '';
  }

  // Container breathing animacija klasa
  if (_container) {
    _container.classList.remove('warn', 'critical');
    if (cssClass === 'warn') _container.classList.add('warn');
    if (cssClass === 'critical') _container.classList.add('critical');
  }
}

/**
 * Statički prikaz za macro/briefing (ne micro)
 * @param {HTMLElement} container
 * @param {number} capacity
 * @param {string} weatherBand
 */
export function renderStaticCapacityPreview(container, capacity, weatherBand) {
  const { label, cssClass } = formatCapacityInfo(capacity);
  const weatherLabels = { oblacno: '☁ Oblačno', prosecno: '⛅ Prosečno', suncano: '☀ Sunčano' };

  container.innerHTML = `
    <div class="offgrid-preview">
      <div class="weather-icon">${weatherBand === 'oblacno' ? '☁' : weatherBand === 'suncano' ? '☀' : '⛅'}</div>
      <div class="offgrid-cap-bar" style="flex:1;">
        <div class="flex-between" style="margin-bottom:6px;">
          <span class="value-label">Kapacitet ove nedelje</span>
          <span class="offgrid-cap-number" style="color:${
            cssClass === 'normal' ? 'var(--color-offgrid)' :
            cssClass === 'warn'   ? 'var(--color-warn)' :
            'var(--color-critical)'
          };">${Math.round(capacity)}%</span>
        </div>
        <div class="progress-bar-container" style="height:10px;">
          <div class="progress-bar-fill" style="width:${capacity}%; background:${
            cssClass === 'normal' ? 'var(--color-offgrid)' :
            cssClass === 'warn'   ? 'var(--color-warn)' :
            'var(--color-critical)'
          };"></div>
        </div>
        <div style="margin-top:4px;">
          <small>${weatherLabels[weatherBand] || ''} · ${label}</small>
        </div>
      </div>
    </div>
  `;
}
