/**
 * ui.js — HUD, pripremljenost meter, etapa progress, delta popup renderer
 * Sluša 'pdg:delta' event i renderuje floating popup.
 */

/** @typedef {{ pripremljenost: number, currentEtapa: number, scoreBucket: string|null }} UIState */

// ============================================================
// DOM refs (postavljaju se u init())
// ============================================================

/** @type {HTMLElement|null} */
let hudEl = null;
/** @type {HTMLElement|null} */
let barFillEl = null;
/** @type {HTMLElement|null} */
let barValueEl = null;
/** @type {HTMLElement|null} */
let progressDotsWrap = null;

const TOTAL_ETAPE = 5;

// ============================================================
// Init
// ============================================================

/**
 * Inicijalizuj HUD — kreiraj DOM, zakači na game-container.
 * @param {HTMLElement} container - #game-container
 * @param {{ pripremljenost: number, currentEtapa: number }} initialState
 */
export function initHUD(container, initialState) {
  // Kreiraj HUD wrapper
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.setAttribute('role', 'region');
  hud.setAttribute('aria-label', 'HUD — pripremljenost i napredak');

  hud.innerHTML = `
    <div id="hud-inner">
      <nav class="etapa-progress" aria-label="Etape"></nav>
      <div class="pripremljenost-wrap" aria-live="polite" aria-atomic="true">
        <div class="pripremljenost-label">Pripremljenost</div>
        <div class="pripremljenost-bar-track" role="progressbar"
             aria-valuemin="0" aria-valuemax="100"
             aria-valuenow="${initialState.pripremljenost}">
          <div class="pripremljenost-bar-fill"></div>
        </div>
        <div class="pripremljenost-value">${initialState.pripremljenost}%</div>
      </div>
    </div>
  `;

  container.prepend(hud);
  hudEl = hud;
  barFillEl    = hud.querySelector('.pripremljenost-bar-fill');
  barValueEl   = hud.querySelector('.pripremljenost-value');
  progressDotsWrap = hud.querySelector('.etapa-progress');

  // Kreiraj progress dots
  _renderProgressDots(initialState.currentEtapa);

  // Postavi inicijalni bar
  _updateBarDOM(initialState.pripremljenost);

  // Sluša delta event od pripremljenost.js
  window.addEventListener('pdg:delta', _onDeltaEvent);
}

/**
 * Ažuriraj HUD sa novim state-om.
 * @param {{ pripremljenost: number, currentEtapa: number }} newState
 */
export function updateHUD(newState) {
  if (!hudEl) return;
  _updateBarDOM(newState.pripremljenost);
  _updateProgressDots(newState.currentEtapa);
}

/**
 * Ukloni HUD event listener (cleanup na unmount).
 */
export function destroyHUD() {
  window.removeEventListener('pdg:delta', _onDeltaEvent);
  hudEl = null;
  barFillEl = null;
  barValueEl = null;
  progressDotsWrap = null;
}

// ============================================================
// Pripremljenost bar
// ============================================================

/**
 * @param {number} value - 0–100
 */
function _updateBarDOM(value) {
  if (!barFillEl || !barValueEl) return;
  const clamped = Math.max(0, Math.min(100, value));

  barFillEl.style.width = `${clamped}%`;
  barValueEl.textContent = `${Math.round(clamped)}%`;

  // Postavi level za boju
  let level;
  if (clamped < 40)      level = 'low';
  else if (clamped < 70) level = 'mid';
  else                    level = 'high';
  barFillEl.dataset.level = level;

  // ARIA
  const track = barFillEl.closest('[role="progressbar"]');
  if (track) track.setAttribute('aria-valuenow', String(Math.round(clamped)));

  // Boja teksta
  const color =
    level === 'low' ? 'var(--color-danger)' :
    level === 'mid' ? 'var(--color-warning)' :
                      'var(--color-success)';
  barValueEl.style.color = color;
}

// ============================================================
// Etapa progress dots
// ============================================================

/**
 * Renderuj N tačkica (jednom na init).
 * @param {number} currentEtapa - 1–5
 */
function _renderProgressDots(currentEtapa) {
  if (!progressDotsWrap) return;
  progressDotsWrap.innerHTML = '';
  for (let i = 1; i <= TOTAL_ETAPE; i++) {
    const dot = document.createElement('span');
    dot.className = 'etapa-progress__dot';
    dot.setAttribute('aria-label', `Etapa ${i}`);
    dot.dataset.etapa = String(i);
    if (i < currentEtapa)  dot.classList.add('done');
    if (i === currentEtapa) dot.classList.add('active');
    progressDotsWrap.appendChild(dot);
  }
}

/**
 * Ažuriraj progress dots (samo promijeni klase).
 * @param {number} currentEtapa
 */
function _updateProgressDots(currentEtapa) {
  if (!progressDotsWrap) return;
  progressDotsWrap.querySelectorAll('.etapa-progress__dot').forEach(dot => {
    const n = Number(dot.dataset.etapa);
    dot.classList.toggle('done',   n < currentEtapa);
    dot.classList.toggle('active', n === currentEtapa);
  });
}

// ============================================================
// Delta popup
// ============================================================

/**
 * Handler za 'pdg:delta' custom event.
 * @param {CustomEvent} e
 */
function _onDeltaEvent(e) {
  const { value, newTotal } = e.detail || {};
  if (typeof value !== 'number') return;

  // Ažuriraj bar odmah
  if (typeof newTotal === 'number') _updateBarDOM(newTotal);

  // Prikaz floating popup-a
  showDeltaPopup(value);
}

/**
 * Prikazuje floating +/- popup na poziciji HUD bara.
 * @param {number} delta - pozitivan ili negativan broj
 */
export function showDeltaPopup(delta) {
  if (delta === 0) return;

  const popup = document.createElement('div');
  popup.className = `delta-popup ${delta > 0 ? 'positive' : 'negative'}`;
  popup.textContent = delta > 0 ? `+${delta}` : `${delta}`;
  popup.setAttribute('aria-live', 'polite');

  // Pozicioniraj blizu bara (fallback: top-center)
  let top = 64;
  let left = window.innerWidth / 2;

  if (barValueEl) {
    const rect = barValueEl.getBoundingClientRect();
    top  = rect.top - 8;
    left = rect.left + rect.width / 2;
  }

  popup.style.top  = `${top}px`;
  popup.style.left = `${left}px`;
  popup.style.transform = 'translateX(-50%)';

  document.body.appendChild(popup);

  // Ukloni posle animacije (800ms animacija + buffer)
  setTimeout(() => {
    popup.remove();
  }, 900);
}

// ============================================================
// Pripremljenost meter helper (standalone, bez HUD)
// ============================================================

/**
 * Renderuj standalone meter u dati container (za end screen).
 * @param {HTMLElement} container
 * @param {number} value
 */
export function renderMiniMeter(container, value) {
  const clamped = Math.max(0, Math.min(100, value));
  const level =
    clamped < 40  ? 'low' :
    clamped < 70  ? 'mid' : 'high';
  const color =
    level === 'low'  ? 'var(--color-danger)'  :
    level === 'mid'  ? 'var(--color-warning)' :
                       'var(--color-success)';

  container.innerHTML = `
    <div class="pripremljenost-bar-track"
         role="progressbar"
         aria-valuemin="0" aria-valuemax="100"
         aria-valuenow="${Math.round(clamped)}">
      <div class="pripremljenost-bar-fill"
           data-level="${level}"
           style="width:${clamped}%; background:${color};">
      </div>
    </div>
  `;
}
