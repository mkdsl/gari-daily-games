import { formatDin } from '../economy/market.js';
import { getYieldPerM2, getCycleDuration, harvestGreenhouse, switchCrop } from '../economy/greenhouse.js';
import { GAME_CONFIG } from '../config.js';
import { updateUpgradesPanel } from './upgrades-panel.js';

let _gameRef = null;
let initialized = false;

export function initGreenhouseTab(gameRef) {
  _gameRef = gameRef;
}

export function updateGreenhouseTab(state) {
  const panel = document.getElementById('tab-greenhouse');
  if (!panel) return;

  if (!state.greenhouse.unlocked) {
    panel.innerHTML = `
      <div class="tab-locked">
        <div class="locked-icon">🌱</div>
        <div class="locked-title">Plastenik nije otključan</div>
        <div class="locked-desc">Otključaj za ${formatDin(GAME_CONFIG.GREENHOUSE_UNLOCK_COST)} din iz Makro panela.</div>
      </div>
    `;
    return;
  }

  if (!initialized || panel.dataset.initialized !== 'gh1') {
    panel.innerHTML = buildGreenhouseLayout(state);
    panel.dataset.initialized = 'gh1';
    initialized = true;
    bindGreenhouseEvents(panel, state);
  }

  const gh = state.greenhouse;
  const progress = Math.min(1.0, gh.cropProgress) * 100;
  const yieldPerM2 = getYieldPerM2(state);
  const totalYield = yieldPerM2 * gh.areaM2;
  const cycleLen = getCycleDuration(state);

  // Update progress bar
  const progFill = panel.querySelector('#gh-progress-fill');
  const progLabel = panel.querySelector('#gh-progress-label');
  if (progFill) progFill.style.width = `${progress.toFixed(1)}%`;
  if (progLabel) {
    if (gh.cropProgress >= 1.0) {
      if (gh.overripe) {
        progLabel.textContent = `⚠️ Prezrelo! Gubi vrednost...`;
        progLabel.className = 'progress-label label-danger';
      } else {
        const graceLeft = Math.max(0, GAME_CONFIG.HARVEST_GRACE_SEC - gh.graceTimer);
        progLabel.textContent = `🌿 Spremo! ${graceLeft.toFixed(0)}s do gubitka`;
        progLabel.className = 'progress-label label-warning';
      }
    } else {
      progLabel.textContent = `${progress.toFixed(0)}% — ${(cycleLen * (1 - gh.cropProgress)).toFixed(0)}s preostalo`;
      progLabel.className = 'progress-label';
    }
  }

  // Stats
  const statsEl = panel.querySelector('#gh-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <span>Površina: <strong>${gh.areaM2}/${gh.maxAreaM2} m²</strong></span>
      <span>Prinos/m²: <strong>${yieldPerM2.toFixed(2)} kg</strong></span>
      <span>Berba: <strong>${totalYield.toFixed(1)} kg</strong></span>
      <span>Prihod: <strong>${formatDin(gh.revenueEarned)}</strong></span>
      ${gh.suša ? '<span class="event-warning">☀️ SUŠA aktivan</span>' : ''}
    `;
  }

  // Harvest button
  const harvestBtn = panel.querySelector('#gh-harvest-btn');
  if (harvestBtn) {
    harvestBtn.disabled = gh.cropProgress < 1.0;
    harvestBtn.className = `action-btn harvest-btn ${gh.cropProgress >= 1.0 ? 'btn-ready' : ''}`;
  }

  // Mikrobiljke window flash
  if (gh.currentCrop === 'mikrobiljke' && gh.microReadyWindow) {
    const card = panel.querySelector('#gh-crop-card');
    if (card) card.classList.add('micro-ready-flash');
  }

  // Upgrades
  const upgradesEl = panel.querySelector('#greenhouse-upgrades');
  if (upgradesEl) updateUpgradesPanel(upgradesEl, state, 'greenhouse', _gameRef);
}

function buildGreenhouseLayout(state) {
  const gh = state.greenhouse;
  const canMicro = state.purchasedUpgrades.includes('T3');
  return `
    <div class="tab-inner">
      <div class="tab-main">
        <div class="section-title">🌱 Plastenik — Uzgoj</div>
        <div id="gh-crop-card" class="crop-card">
          <div class="crop-type-selector">
            <button class="crop-btn ${gh.currentCrop === 'paradajz' ? 'active' : ''}"
              data-crop="paradajz">🍅 Paradajz (215 din/kg)</button>
            <button class="crop-btn ${gh.currentCrop === 'mikrobiljke' ? 'active' : ''} ${canMicro ? '' : 'locked'}"
              data-crop="mikrobiljke" ${canMicro ? '' : 'disabled'} title="${canMicro ? '' : 'Zahteva T3'}">
              🌿 Mikrobiljke (1.000 din/kg)
            </button>
          </div>
          <div id="gh-stats" class="stats-row"></div>
          <div class="progress-bar large">
            <div id="gh-progress-fill" class="progress-fill" style="width:0%"></div>
          </div>
          <div id="gh-progress-label" class="progress-label">0%</div>
          <button id="gh-harvest-btn" class="action-btn harvest-btn" disabled>
            🧺 Beri prinos
          </button>
        </div>
      </div>
      <aside class="tab-side">
        <div class="section-title">Upgradi</div>
        <div id="greenhouse-upgrades"></div>
      </aside>
    </div>
  `;
}

function bindGreenhouseEvents(panel, state) {
  panel.addEventListener('click', (e) => {
    const audio = _gameRef?.audio;

    // Crop selector
    const cropBtn = e.target.closest('.crop-btn');
    if (cropBtn && !cropBtn.disabled) {
      const crop = cropBtn.getAttribute('data-crop');
      if (switchCrop(state, crop)) {
        // Re-render
        initialized = false;
        updateGreenhouseTab(state);
      }
      return;
    }

    // Harvest
    if (e.target.closest('#gh-harvest-btn')) {
      const rev = harvestGreenhouse(state, audio);
      if (rev > 0) {
        import('./modals.js').then(({ showToast }) => {
          showToast(`🌱 Berba: +${formatDin(rev)}`);
        });
      }
    }
  });
}
