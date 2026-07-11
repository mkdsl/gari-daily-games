import { formatDin } from '../economy/market.js';
import { getFishGrowthPerSec, getHarvestYieldKg, feedFish, harvestFish, switchFishType } from '../economy/fishpond.js';
import { GAME_CONFIG } from '../config.js';
import { updateUpgradesPanel } from './upgrades-panel.js';

let _gameRef = null;
let initialized = false;

export function initFishpondTab(gameRef) {
  _gameRef = gameRef;
}

export function updateFishpondTab(state) {
  const panel = document.getElementById('tab-fishpond');
  if (!panel) return;

  if (!state.fishpond.unlocked) {
    panel.innerHTML = `
      <div class="tab-locked">
        <div class="locked-icon">🐟</div>
        <div class="locked-title">Jezero nije otključano</div>
        <div class="locked-desc">Otključaj za ${formatDin(GAME_CONFIG.FISHPOND_UNLOCK_COST)} din iz Makro panela.</div>
      </div>
    `;
    return;
  }

  if (!initialized || panel.dataset.initialized !== 'fp1') {
    panel.innerHTML = buildFishpondLayout(state);
    panel.dataset.initialized = 'fp1';
    initialized = true;
    bindFishpondEvents(panel, state);
  }

  const fp = state.fishpond;
  const growthPct = fp.fishGrowth * 100;
  const yieldKg = getHarvestYieldKg(state);
  const canSmudj = state.purchasedUpgrades.includes('J2');

  // Growth bar
  const growthFill = panel.querySelector('#fish-growth-fill');
  const growthLabel = panel.querySelector('#fish-growth-label');
  if (growthFill) growthFill.style.width = `${growthPct.toFixed(1)}%`;
  if (growthLabel) {
    if (fp.fishGrowth >= 1.0) {
      growthLabel.textContent = '✅ Spremo za berbu!';
      growthLabel.className = 'progress-label label-success';
    } else {
      const growPerSec = getFishGrowthPerSec(state);
      const secsLeft = growPerSec > 0 ? ((1.0 - fp.fishGrowth) / growPerSec) : 0;
      growthLabel.textContent = `${growthPct.toFixed(0)}% — ${formatTime(secsLeft)} do berbe`;
      growthLabel.className = 'progress-label';
    }
  }

  // Feed button
  const feedBtn = panel.querySelector('#fish-feed-btn');
  if (feedBtn) {
    feedBtn.disabled = !fp.feedWindowActive;
    feedBtn.className = `action-btn feed-btn ${fp.feedWindowActive ? 'feed-window-open btn-ready' : ''}`;
    feedBtn.textContent = fp.feedWindowActive
      ? `🐟 Hrani! (${Math.ceil(fp.feedWindowTimer)}s)`
      : `🍞 Hranjenje za ${Math.ceil(fp.feedTimer)}s`;
  }

  // Feed bonus
  const feedBonusEl = panel.querySelector('#fish-feed-bonus');
  if (feedBonusEl) {
    feedBonusEl.textContent = `Akumulirani bonus: +${(fp.feedBonusAccumulated * 100).toFixed(0)}%`;
  }

  // Harvest button
  const harvestBtn = panel.querySelector('#fish-harvest-btn');
  if (harvestBtn) {
    harvestBtn.disabled = fp.fishGrowth < 1.0;
    harvestBtn.className = `action-btn harvest-btn ${fp.fishGrowth >= 1.0 ? 'btn-ready' : ''}`;
    harvestBtn.textContent = `🧺 Beri ${yieldKg.toFixed(1)} kg`;
  }

  // Stats
  const statsEl = panel.querySelector('#fish-stats');
  if (statsEl) {
    const price = fp.fishType === 'smudj' ? GAME_CONFIG.PRICE_SMUDJ : GAME_CONFIG.PRICE_SARAN;
    statsEl.innerHTML = `
      <span>Površina: <strong>${fp.areaM2}/${fp.maxAreaM2} m²</strong></span>
      <span>Tip: <strong>${fp.fishType === 'smudj' ? 'Smuđ (1.200 din/kg)' : 'Šaran (650 din/kg)'}</strong></span>
      <span>Prinos: <strong>${yieldKg.toFixed(1)} kg</strong></span>
      ${fp.ducks > 0 ? `<span>Patke: <strong>${fp.ducks} kom 🦆</strong></span>` : ''}
      <span>Prihod: <strong>${formatDin(fp.revenueEarned)}</strong></span>
    `;
  }

  // Ducks
  const ducksEl = panel.querySelector('#duck-info');
  if (ducksEl) {
    if (fp.ducks > 0) {
      const eggsPerDay = (fp.ducks * GAME_CONFIG.DUCK_EGGS_PER_YEAR / 365);
      ducksEl.innerHTML = `
        <div class="duck-card">
          🦆 ${fp.ducks} patki | ${eggsPerDay.toFixed(1)} jaja/dan | ${Math.ceil(fp.duckIncomeTimer)}s do prihoda
        </div>
      `;
      ducksEl.style.display = '';
    } else {
      ducksEl.style.display = 'none';
    }
  }

  // Upgrades
  const upgradesEl = panel.querySelector('#fishpond-upgrades');
  if (upgradesEl) updateUpgradesPanel(upgradesEl, state, 'fishpond', _gameRef);
}

function buildFishpondLayout(state) {
  const fp = state.fishpond;
  const canSmudj = state.purchasedUpgrades.includes('J2');
  return `
    <div class="tab-inner">
      <div class="tab-main">
        <div class="section-title">🐟 Jezero — Akvakultura</div>
        <div class="fish-type-selector">
          <button class="crop-btn ${fp.fishType === 'saran' ? 'active' : ''}" data-fish="saran">🐠 Šaran (650 din/kg)</button>
          <button class="crop-btn ${fp.fishType === 'smudj' ? 'active' : ''} ${canSmudj ? '' : 'locked'}"
            data-fish="smudj" ${canSmudj ? '' : 'disabled'} title="${canSmudj ? '' : 'Zahteva J2'}">
            🐡 Smuđ (1.200 din/kg)
          </button>
        </div>
        <div id="fish-stats" class="stats-row"></div>
        <div class="progress-bar large">
          <div id="fish-growth-fill" class="progress-fill fish-fill" style="width:0%"></div>
        </div>
        <div id="fish-growth-label" class="progress-label">0%</div>
        <div class="fish-actions">
          <button id="fish-feed-btn" class="action-btn feed-btn" disabled>🍞 Hranjenje...</button>
          <div id="fish-feed-bonus" class="small-text">Akumulirani bonus: +0%</div>
          <button id="fish-harvest-btn" class="action-btn harvest-btn" disabled>🧺 Beri</button>
        </div>
        <div id="duck-info"></div>
      </div>
      <aside class="tab-side">
        <div class="section-title">Upgradi</div>
        <div id="fishpond-upgrades"></div>
      </aside>
    </div>
  `;
}

function bindFishpondEvents(panel, state) {
  panel.addEventListener('click', (e) => {
    const audio = _gameRef?.audio;

    // Fish type selector
    const fishBtn = e.target.closest('[data-fish]');
    if (fishBtn && !fishBtn.disabled) {
      const fishType = fishBtn.getAttribute('data-fish');
      if (switchFishType(state, fishType)) {
        initialized = false;
        updateFishpondTab(state);
      }
      return;
    }

    // Feed
    if (e.target.closest('#fish-feed-btn')) {
      feedFish(state, audio);
      return;
    }

    // Harvest
    if (e.target.closest('#fish-harvest-btn')) {
      const rev = harvestFish(state, audio);
      if (rev > 0) {
        import('./modals.js').then(({ showToast }) => {
          showToast(`🐟 Berba: +${formatDin(rev)}`);
        });
      }
    }
  });
}

function formatTime(secs) {
  if (secs >= 3600) return `${(secs / 3600).toFixed(1)}h`;
  if (secs >= 60) return `${Math.floor(secs / 60)}m ${Math.floor(secs % 60)}s`;
  return `${Math.ceil(secs)}s`;
}
