import { formatDin } from '../economy/market.js';
import {
  getYieldPerM2, getCycleDuration, getHarvestYield,
  harvestGreenhouse, switchCrop, getProjectedRevenueSeason,
  getMicroHarvestWindowStatus, getTimeToHarvest, getCropDescription,
} from '../economy/greenhouse.js';
import { GAME_CONFIG } from '../config.js';
import { updateUpgradesPanel } from './upgrades-panel.js';
import { spawnRevenueParticle } from '../render.js';

let _gameRef = null;
let initialized = false;

// ─── Init ──────────────────────────────────────────────────────────────────────

export function initGreenhouseTab(gameRef) {
  _gameRef = gameRef;
}

// ─── Main update ──────────────────────────────────────────────────────────────

/**
 * Render/update greenhouse tab content.
 * @param {object} state
 */
export function updateGreenhouseTab(state) {
  const panel = document.getElementById('tab-greenhouse');
  if (!panel) return;

  if (!state.greenhouse.unlocked) {
    panel.innerHTML = buildLockedState(state);
    return;
  }

  if (!initialized || panel.dataset.initialized !== 'gh1') {
    panel.innerHTML = buildGreenhouseLayout(state);
    panel.dataset.initialized = 'gh1';
    initialized = true;
    bindGreenhouseEvents(panel, state);
  }

  updateCropProgress(panel, state);
  updateGreenhouseStats(panel, state);
  updateHarvestButton(panel, state);
  updateMicroWindow(panel, state);
  updateMarketForecastDisplay(panel, state);
  updateCropComparison(panel, state);

  // Upgrades
  const upgradesEl = panel.querySelector('#greenhouse-upgrades');
  if (upgradesEl) updateUpgradesPanel(upgradesEl, state, 'greenhouse', _gameRef);
}

// ─── Locked state ─────────────────────────────────────────────────────────────

function buildLockedState(state) {
  const canAfford = state.capital >= GAME_CONFIG.GREENHOUSE_UNLOCK_COST;
  return `
    <div class="tab-locked">
      <div class="locked-icon">🌱</div>
      <div class="locked-title">Plastenik nije otključan</div>
      <div class="locked-desc">
        Otključaj za <strong>${formatDin(GAME_CONFIG.GREENHOUSE_UNLOCK_COST)}</strong> iz Makro panela.
        ${canAfford ? '<div class="can-afford-hint">💰 Imaš dovoljno kapitala!</div>' : ''}
      </div>
      <div class="locked-info">
        <div class="locked-info-item">🌿 Uzgajaj paradajz (215 din/kg) ili mikrobiljke (1.000 din/kg)</div>
        <div class="locked-info-item">📐 Starter: ${GAME_CONFIG.PLASTENIK_STARTER_M2} m² — proširi upgradom T1</div>
        <div class="locked-info-item">⏱ Paradajz ciklus: 180s | Mikrobiljke: 14s</div>
      </div>
    </div>
  `;
}

// ─── Layout builder ───────────────────────────────────────────────────────────

function buildGreenhouseLayout(state) {
  const gh = state.greenhouse;
  const canMicro = state.purchasedUpgrades.includes('T3');
  return `
    <div class="tab-inner">
      <div class="tab-main">
        <div class="section-title">🌱 Plastenik — Uzgoj</div>
        <div class="crop-type-selector">
          <button class="crop-btn ${gh.currentCrop === 'paradajz' ? 'active' : ''}" data-crop="paradajz">
            🍅 Paradajz
            <small>${GAME_CONFIG.PRICE_PARADAJZ} din/kg | ${GAME_CONFIG.PLASTENIK_PARADAJZ_SEC}s ciklus</small>
          </button>
          <button class="crop-btn ${gh.currentCrop === 'mikrobiljke' ? 'active' : ''} ${canMicro ? '' : 'locked'}"
            data-crop="mikrobiljke" ${canMicro ? '' : 'disabled'}
            title="${canMicro ? 'Mikrobiljke — brzi ciklus, premium cena' : 'Zahteva upgrade T3 (Mikrobiljke licenca)'}">
            🌿 Mikrobiljke
            <small>${GAME_CONFIG.PRICE_MIKROBILJKE} din/kg | ${GAME_CONFIG.PLASTENIK_MICRO_SEC}s ciklus${canMicro ? '' : ' 🔒'}</small>
          </button>
        </div>

        <div id="gh-crop-card" class="crop-card">
          <div id="gh-stats" class="stats-row"></div>
          <div class="progress-bar large" id="gh-progress-bar">
            <div id="gh-progress-fill" class="progress-fill" style="width:0%"></div>
          </div>
          <div id="gh-progress-label" class="progress-label">0%</div>

          <div id="micro-window-display" class="micro-window-panel hidden">
            <div class="micro-window-timer" id="micro-window-timer">0s</div>
            <div class="micro-window-msg">⚡ Beri SADA za +${(GAME_CONFIG.MICRO_HARVEST_BONUS * 100).toFixed(0)}% bonus!</div>
          </div>

          <div class="gh-actions">
            <button id="gh-harvest-btn" class="action-btn harvest-btn" disabled>
              🧺 Beri prinos
            </button>
          </div>
        </div>

        <div id="gh-market-forecast" class="market-forecast-section"></div>
        <div id="gh-crop-comparison" class="crop-comparison-section"></div>
        <div id="gh-edu" class="edu-fact"></div>
      </div>
      <aside class="tab-side">
        <div class="section-title">Upgradi</div>
        <div id="greenhouse-upgrades"></div>
      </aside>
    </div>
  `;
}

// ─── Crop progress ────────────────────────────────────────────────────────────

function updateCropProgress(panel, state) {
  const gh = state.greenhouse;
  const progress = Math.min(1.0, gh.cropProgress) * 100;
  const progFill = panel.querySelector('#gh-progress-fill');
  const progLabel = panel.querySelector('#gh-progress-label');
  const progBar = panel.querySelector('#gh-progress-bar');

  if (progFill) progFill.style.width = `${progress.toFixed(1)}%`;

  // Color the bar by state
  if (progBar) {
    progBar.className = `progress-bar large ${
      gh.overripe ? 'bar-overripe' :
      gh.cropProgress >= 1.0 ? 'bar-ready' :
      progress > 75 ? 'bar-near' : ''
    }`;
  }

  if (progLabel) {
    if (gh.cropProgress >= 1.0) {
      if (gh.overripe) {
        const degradePct = Math.max(0, (gh.cropProgress - 0.5) / 0.5 * 100);
        progLabel.textContent = `⚠️ Prezrelo! Vrednost: ${degradePct.toFixed(0)}%`;
        progLabel.className = 'progress-label label-danger';
      } else {
        const graceLeft = Math.max(0, GAME_CONFIG.HARVEST_GRACE_SEC - gh.graceTimer);
        if (gh.currentCrop === 'mikrobiljke') {
          progLabel.textContent = gh.microReadyWindow
            ? `⚡ BERI! Window: ${Math.ceil(gh.microWindowTimer)}s`
            : '🌿 Spremo za berbu!';
        } else {
          progLabel.textContent = graceLeft > 0
            ? `🍅 Spremo! ${graceLeft.toFixed(0)}s do gubitka vrednosti`
            : '🍅 Spremo za berbu!';
        }
        progLabel.className = 'progress-label label-success';
      }
    } else {
      const cycleDur = getCycleDuration(state);
      const timeLeft = cycleDur * (1 - gh.cropProgress);
      progLabel.textContent = `${progress.toFixed(0)}% — ${formatTime(timeLeft)} preostalo`;
      progLabel.className = 'progress-label';
    }
  }
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function updateGreenhouseStats(panel, state) {
  const statsEl = panel.querySelector('#gh-stats');
  if (!statsEl) return;

  const gh = state.greenhouse;
  const yieldPerM2 = getYieldPerM2(state);
  const totalYield = getHarvestYield(state);
  const projRev = getProjectedRevenueSeason(state);

  statsEl.innerHTML = `
    <span>Površina: <strong>${gh.areaM2}/${gh.maxAreaM2} m²</strong></span>
    <span>Prinos/m²: <strong>${yieldPerM2.toFixed(3)} kg</strong></span>
    <span>Berba: <strong>${totalYield.toFixed(2)} kg</strong></span>
    <span>Proj. prihod/sez: <strong>${formatDin(projRev)}</strong></span>
    <span>Ukupno: <strong>${formatDin(gh.revenueEarned)}</strong></span>
    ${gh.suša ? '<span class="event-warning">☀️ SUŠA −30% prinos</span>' : ''}
    ${state.synergies.mulj ? '<span class="synergy-active-badge">💧 Mulj +30%</span>' : ''}
    ${state.prestige.scenario === 'avala' ? '<span class="prestige-badge">⛰️ Avala ×1.20</span>' : ''}
  `;
}

// ─── Harvest button ───────────────────────────────────────────────────────────

function updateHarvestButton(panel, state) {
  const gh = state.greenhouse;
  const harvestBtn = panel.querySelector('#gh-harvest-btn');
  if (!harvestBtn) return;

  const canHarvest = gh.cropProgress >= 1.0;
  harvestBtn.disabled = !canHarvest;

  if (canHarvest) {
    const totalYield = getHarvestYield(state);
    const priceKey = gh.currentCrop === 'mikrobiljke' ? 'mikrobiljke' : 'paradajz';
    const price = state.marketForecast?.[priceKey] || (gh.currentCrop === 'mikrobiljke' ? GAME_CONFIG.PRICE_MIKROBILJKE : GAME_CONFIG.PRICE_PARADAJZ);
    const estRev = totalYield * price * state.reputation;
    harvestBtn.textContent = `🧺 Beri ${totalYield.toFixed(2)} kg (~${formatDin(estRev)})`;
    harvestBtn.className = `action-btn harvest-btn btn-ready ${gh.microReadyWindow ? 'harvest-btn-bonus' : ''}`;
  } else {
    harvestBtn.textContent = '🧺 Beri prinos';
    harvestBtn.className = 'action-btn harvest-btn';
  }
}

// ─── Micro harvest window ─────────────────────────────────────────────────────

function updateMicroWindow(panel, state) {
  const windowDisplay = panel.querySelector('#micro-window-display');
  const timerEl = panel.querySelector('#micro-window-timer');
  const cropCard = panel.querySelector('#gh-crop-card');

  if (!windowDisplay) return;

  const status = getMicroHarvestWindowStatus(state);

  if (status.active) {
    windowDisplay.classList.remove('hidden');
    if (timerEl) timerEl.textContent = `${status.timerLeft}s`;
    if (cropCard) cropCard.classList.add('micro-ready-flash');
  } else {
    windowDisplay.classList.add('hidden');
    if (cropCard) cropCard.classList.remove('micro-ready-flash');
  }
}

// ─── Market forecast ──────────────────────────────────────────────────────────

function updateMarketForecastDisplay(panel, state) {
  const forecastEl = panel.querySelector('#gh-market-forecast');
  if (!forecastEl || !state.marketForecast) return;

  const baseP = GAME_CONFIG.PRICE_PARADAJZ;
  const baseM = GAME_CONFIG.PRICE_MIKROBILJKE;
  const forecastP = state.marketForecast.paradajz;
  const forecastM = state.marketForecast.mikrobiljke;
  const diffP = forecastP - baseP;
  const diffM = forecastM - baseM;

  forecastEl.innerHTML = `
    <div class="forecast-title">📊 Tržišna prognoza</div>
    <div class="forecast-grid">
      <div class="forecast-item ${diffP >= 0 ? 'forecast-up' : 'forecast-down'}">
        🍅 Paradajz: <strong>${forecastP} din/kg</strong>
        <span class="forecast-diff">(${diffP >= 0 ? '+' : ''}${diffP} din, ${((diffP/baseP)*100).toFixed(0)}%)</span>
      </div>
      <div class="forecast-item ${diffM >= 0 ? 'forecast-up' : 'forecast-down'}">
        🌿 Mikrobiljke: <strong>${forecastM} din/kg</strong>
        <span class="forecast-diff">(${diffM >= 0 ? '+' : ''}${diffM} din, ${((diffM/baseM)*100).toFixed(0)}%)</span>
      </div>
    </div>
    <div class="forecast-note">Prognoza se ažurira svake sezone (±15% varijacija)</div>
  `;
}

// ─── Crop comparison ──────────────────────────────────────────────────────────

function updateCropComparison(panel, state) {
  const compEl = panel.querySelector('#gh-crop-comparison');
  if (!compEl) return;

  // Only show if T3 is purchased (mikrobiljke available)
  if (!state.purchasedUpgrades.includes('T3')) {
    compEl.innerHTML = '';
    return;
  }

  const gh = state.greenhouse;
  const seasonDur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC : GAME_CONFIG.SEASON_DURATION_SEC;

  // Paradajz projection
  const pCycleDur = GAME_CONFIG.PLASTENIK_PARADAJZ_SEC / state.prestige.speedMultiplier *
    (state.purchasedUpgrades.includes('T5') ? 0.8 : 1.0);
  const pCycles = seasonDur / pCycleDur;
  const pYield = GAME_CONFIG.PLASTENIK_TOMATO_KG_M2 * gh.areaM2;
  const pPrice = state.marketForecast?.paradajz || GAME_CONFIG.PRICE_PARADAJZ;
  const pRev = pYield * pCycles * pPrice * state.reputation;

  // Mikrobiljke projection
  const mCycleDur = GAME_CONFIG.PLASTENIK_MICRO_SEC / state.prestige.speedMultiplier *
    (state.purchasedUpgrades.includes('T5') ? 0.8 : 1.0);
  const mCycles = Math.floor(seasonDur / mCycleDur);
  const mYield = GAME_CONFIG.PLASTENIK_MICRO_KG_M2_CYCLE * gh.areaM2;
  const mPrice = state.marketForecast?.mikrobiljke || GAME_CONFIG.PRICE_MIKROBILJKE;
  const mRev = mYield * mCycles * mPrice * state.reputation;

  const betterCrop = pRev > mRev ? 'paradajz' : 'mikrobiljke';
  const currentIsBetter = gh.currentCrop === betterCrop;

  compEl.innerHTML = `
    <div class="comparison-title">🔄 Poređenje useva (po sezoni)</div>
    <div class="comparison-grid">
      <div class="comp-item ${gh.currentCrop === 'paradajz' ? 'comp-active' : ''} ${betterCrop === 'paradajz' ? 'comp-winner' : ''}">
        <div class="comp-name">🍅 Paradajz</div>
        <div class="comp-stat">${pCycles.toFixed(1)} ciklusa × ${pYield.toFixed(1)} kg</div>
        <div class="comp-rev">${formatDin(pRev)}</div>
        ${betterCrop === 'paradajz' ? '<div class="comp-badge">✓ Bolje ovde</div>' : ''}
      </div>
      <div class="comp-item ${gh.currentCrop === 'mikrobiljke' ? 'comp-active' : ''} ${betterCrop === 'mikrobiljke' ? 'comp-winner' : ''}">
        <div class="comp-name">🌿 Mikrobiljke</div>
        <div class="comp-stat">${mCycles} ciklusa × ${mYield.toFixed(3)} kg</div>
        <div class="comp-rev">${formatDin(mRev)}</div>
        ${betterCrop === 'mikrobiljke' ? '<div class="comp-badge">✓ Bolje ovde</div>' : ''}
      </div>
    </div>
    ${!currentIsBetter ? `<div class="comp-hint">💡 Trenutno: ${gh.currentCrop === 'paradajz' ? '🍅 Paradajz' : '🌿 Mikrobiljke'} — ${betterCrop === 'paradajz' ? '🍅 Paradajz' : '🌿 Mikrobiljke'} daje više u ovoj sezoni</div>` : ''}
  `;
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindGreenhouseEvents(panel, state) {
  panel.addEventListener('click', (e) => {
    const audio = _gameRef?.audio;

    // Crop selector
    const cropBtn = e.target.closest('.crop-btn');
    if (cropBtn && !cropBtn.disabled) {
      const crop = cropBtn.getAttribute('data-crop');
      if (switchCrop(state, crop)) {
        initialized = false;
        updateGreenhouseTab(state);
      }
      return;
    }

    // Harvest
    if (e.target.closest('#gh-harvest-btn')) {
      const gh = state.greenhouse;
      if (gh.cropProgress >= 1.0) {
        const rev = harvestGreenhouse(state, audio);
        if (rev > 0) {
          const card = panel.querySelector('#gh-crop-card');
          if (card) spawnRevenueParticle(card, rev);
          import('./modals.js').then(({ showToast }) => {
            showToast(`🌱 Berba: +${formatDin(rev)}`);
          });
        }
      }
    }
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs) {
  if (secs >= 3600) return `${(secs / 3600).toFixed(1)}h`;
  if (secs >= 60) return `${Math.floor(secs / 60)}m ${Math.floor(secs % 60)}s`;
  return `${Math.ceil(secs)}s`;
}
