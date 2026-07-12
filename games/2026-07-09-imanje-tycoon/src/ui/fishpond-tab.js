import { formatDin } from '../economy/market.js';
import {
  getFishGrowthPerSec, getHarvestYieldKg, getFishRevenuePerHarvest,
  feedFish, harvestFish, switchFishType, getDuckIncomeInfo, getPolycultureStatus,
} from '../economy/fishpond.js';
import { GAME_CONFIG } from '../config.js';
import { updateUpgradesPanel } from './upgrades-panel.js';
import { spawnRevenueParticle } from '../render.js';

let _gameRef = null;
let initialized = false;

// ─── Init ──────────────────────────────────────────────────────────────────────

export function initFishpondTab(gameRef) {
  _gameRef = gameRef;
}

// ─── Main update ──────────────────────────────────────────────────────────────

/**
 * Render/update fishpond tab content.
 * @param {object} state
 */
export function updateFishpondTab(state) {
  const panel = document.getElementById('tab-fishpond');
  if (!panel) return;

  if (!state.fishpond.unlocked) {
    panel.innerHTML = buildLockedState(state);
    return;
  }

  if (!initialized || panel.dataset.initialized !== 'fp1') {
    panel.innerHTML = buildFishpondLayout(state);
    panel.dataset.initialized = 'fp1';
    initialized = true;
    bindFishpondEvents(panel, state);
  }

  const fp = state.fishpond;

  updateFishGrowth(panel, state, fp);
  updateFeedButton(panel, fp);
  updateFishStats(panel, state, fp);
  updateDuckSection(panel, state, fp);
  updatePolycultureSection(panel, state, fp);
  updateFishFeedQuality(panel, fp);

  // Upgrades
  const upgradesEl = panel.querySelector('#fishpond-upgrades');
  if (upgradesEl) updateUpgradesPanel(upgradesEl, state, 'fishpond', _gameRef);
}

// ─── Locked state ─────────────────────────────────────────────────────────────

function buildLockedState(state) {
  const canAfford = state.capital >= GAME_CONFIG.FISHPOND_UNLOCK_COST;
  return `
    <div class="tab-locked">
      <div class="locked-icon">🐟</div>
      <div class="locked-title">Jezero nije otključano</div>
      <div class="locked-desc">
        Otključaj za <strong>${formatDin(GAME_CONFIG.FISHPOND_UNLOCK_COST)}</strong> iz Makro panela.
        ${canAfford ? '<div class="can-afford-hint">💰 Imaš dovoljno kapitala!</div>' : ''}
      </div>
      <div class="locked-info">
        <div class="locked-info-item">🐠 Šaran (650 din/kg) — pasivan rast, biofiltracija</div>
        <div class="locked-info-item">🐡 Smuđ (1.200 din/kg) — zahteva J2 upgrade</div>
        <div class="locked-info-item">🦆 Patke — pasivni prihod od jaja</div>
        <div class="locked-info-item">💧 Mulj sinergija sa Plastenicima (+30% yield)</div>
      </div>
    </div>
  `;
}

// ─── Layout builder ───────────────────────────────────────────────────────────

function buildFishpondLayout(state) {
  const fp = state.fishpond;
  const canSmudj = state.purchasedUpgrades.includes('J2');
  return `
    <div class="tab-inner">
      <div class="tab-main">
        <div class="section-title">🐟 Jezero — Akvakultura</div>

        <div class="fish-type-selector">
          <button class="crop-btn ${fp.fishType === 'saran' ? 'active' : ''}" data-fish="saran">
            🐠 Šaran
            <small>${GAME_CONFIG.PRICE_SARAN} din/kg | Pouzdan rast</small>
          </button>
          <button class="crop-btn ${fp.fishType === 'smudj' ? 'active' : ''} ${canSmudj ? '' : 'locked'}"
            data-fish="smudj" ${canSmudj ? '' : 'disabled'}
            title="${canSmudj ? 'Smuđ — premium cena, gastro kanal' : 'Zahteva J2 upgrade (Smuđ bazen)'}">
            🐡 Smuđ
            <small>${GAME_CONFIG.PRICE_SMUDJ} din/kg${canSmudj ? '' : ' 🔒'}</small>
          </button>
        </div>

        <div id="fish-stats" class="stats-row"></div>

        <div class="progress-bar large fish-bar">
          <div id="fish-growth-fill" class="progress-fill fish-fill" style="width:0%"></div>
        </div>
        <div id="fish-growth-label" class="progress-label">0%</div>

        <div id="fish-feed-quality-row" class="feed-quality-row">
          <div class="feed-quality-label">Kvalitet ishrane:</div>
          <div class="feed-quality-bar-wrap">
            <div class="feed-quality-bar">
              <div id="feed-quality-fill" class="feed-quality-fill" style="width:0%"></div>
            </div>
            <span id="feed-quality-pct" class="feed-quality-pct">0%</span>
          </div>
        </div>

        <div class="fish-actions">
          <button id="fish-feed-btn" class="action-btn feed-btn" disabled>
            🍞 Hranjenje...
          </button>
          <span id="fish-feed-info" class="feed-info-text"></span>
          <button id="fish-harvest-btn" class="action-btn harvest-btn" disabled>
            🧺 Beri
          </button>
        </div>

        <div id="duck-info" class="duck-section"></div>
        <div id="polyculture-info" class="polyculture-section"></div>
        <div id="fishpond-edu" class="edu-fact"></div>
      </div>
      <aside class="tab-side">
        <div class="section-title">Upgradi</div>
        <div id="fishpond-upgrades"></div>
      </aside>
    </div>
  `;
}

// ─── Fish growth ──────────────────────────────────────────────────────────────

function updateFishGrowth(panel, state, fp) {
  const growthPct = fp.fishGrowth * 100;
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
      growthLabel.textContent = `${growthPct.toFixed(1)}% — ${formatTime(secsLeft)} do berbe`;
      growthLabel.className = 'progress-label';
    }
  }

  // Harvest button
  const harvestBtn = panel.querySelector('#fish-harvest-btn');
  if (harvestBtn) {
    const ready = fp.fishGrowth >= 1.0;
    harvestBtn.disabled = !ready;
    harvestBtn.className = `action-btn harvest-btn ${ready ? 'btn-ready' : ''}`;
    if (ready) {
      const kg = getHarvestYieldKg(state);
      const rev = getFishRevenuePerHarvest(state);
      harvestBtn.textContent = `🧺 Beri ${kg.toFixed(1)} kg (~${formatDin(rev)})`;
    } else {
      harvestBtn.textContent = `🧺 Beri`;
    }
  }
}

// ─── Feed button ──────────────────────────────────────────────────────────────

function updateFeedButton(panel, fp) {
  const feedBtn = panel.querySelector('#fish-feed-btn');
  const feedInfo = panel.querySelector('#fish-feed-info');

  if (!feedBtn) return;

  if (fp.feedWindowActive) {
    feedBtn.disabled = false;
    feedBtn.className = 'action-btn feed-btn feed-window-open btn-ready';
    feedBtn.textContent = `🐟 Hrani! (${Math.ceil(fp.feedWindowTimer)}s)`;
    feedBtn.title = `Hrani u roku od ${Math.ceil(fp.feedWindowTimer)}s za bonus rasta!`;
  } else {
    feedBtn.disabled = true;
    feedBtn.className = 'action-btn feed-btn';
    feedBtn.textContent = `🍞 Hranjenje za ${Math.ceil(fp.feedTimer)}s`;
    feedBtn.title = `Sledeći prozor hranjenja za ${Math.ceil(fp.feedTimer)}s`;
  }

  if (feedInfo) {
    const bonus = fp.feedBonusAccumulated;
    if (bonus > 0) {
      feedInfo.textContent = `Akumulirani bonus: +${(bonus * 100).toFixed(0)}% yield`;
      feedInfo.className = 'feed-info-text feed-bonus-active';
    } else {
      feedInfo.textContent = 'Hrani na vreme za kumulativni bonus!';
      feedInfo.className = 'feed-info-text';
    }
  }
}

// ─── Fish stats ───────────────────────────────────────────────────────────────

function updateFishStats(panel, state, fp) {
  const statsEl = panel.querySelector('#fish-stats');
  if (!statsEl) return;

  const price = fp.fishType === 'smudj' ? GAME_CONFIG.PRICE_SMUDJ : GAME_CONFIG.PRICE_SARAN;
  const kg = getHarvestYieldKg(state);
  const revPerHarvest = getFishRevenuePerHarvest(state);
  const growthSec = GAME_CONFIG.FISH_GROWTH_SEC / state.prestige.speedMultiplier;

  statsEl.innerHTML = `
    <span>Površina: <strong>${fp.areaM2}/${fp.maxAreaM2} m²</strong></span>
    <span>Tip: <strong>${fp.fishType === 'smudj' ? '🐡 Smuđ' : '🐠 Šaran'}</strong></span>
    <span>Cena: <strong>${price} din/kg</strong></span>
    <span>Prinos: <strong>${kg.toFixed(1)} kg</strong></span>
    <span>Prihod/berba: <strong>${formatDin(revPerHarvest)}</strong></span>
    <span>Ciklus: <strong>${formatTime(growthSec)}</strong></span>
    <span>Ukupno: <strong>${formatDin(fp.revenueEarned)}</strong></span>
    ${state.prestige.scenario === 'strandG' && fp.fishType === 'smudj'
      ? '<span class="prestige-badge">🏖️ Štrand: smuđ ×2.0</span>' : ''}
    ${state.purchasedUpgrades.includes('J8') && fp.fishType === 'smudj'
      ? '<span class="upgrade-badge">J8: restoran min</span>' : ''}
  `;
}

// ─── Duck section ─────────────────────────────────────────────────────────────

function updateDuckSection(panel, state, fp) {
  const ducksEl = panel.querySelector('#duck-info');
  if (!ducksEl) return;

  if (fp.ducks === 0) {
    ducksEl.innerHTML = '';
    return;
  }

  const duckInfo = getDuckIncomeInfo(state);
  ducksEl.innerHTML = `
    <div class="duck-card">
      <div class="duck-header">🦆 Patke: <strong>${fp.ducks} kom</strong></div>
      <div class="duck-stats">
        <span>Jaja/dan: <strong>${duckInfo.eggsPerDay}</strong></span>
        <span>Prihod/interval: <strong>${formatDin(duckInfo.incomePerInterval)}</strong></span>
        <span>Sledeći prihod: <strong>${duckInfo.nextIncomeSec}s</strong></span>
      </div>
      ${state.synergies.komposter
        ? '<div class="duck-synergy">♻️ Komposter sinergija aktivna — patke → kompost → pečurke</div>'
        : '<div class="duck-synergy-hint">Otključaj J3+P6 za Komposter sinergiju (+25% spawn ratio)</div>'
      }
    </div>
  `;
}

// ─── Polyculture section ──────────────────────────────────────────────────────

function updatePolycultureSection(panel, state, fp) {
  const polyEl = panel.querySelector('#polyculture-info');
  if (!polyEl) return;

  const status = getPolycultureStatus(state);
  if (!state.purchasedUpgrades.includes('J2')) {
    polyEl.innerHTML = '';
    return;
  }

  polyEl.innerHTML = `
    <div class="polyculture-card ${status.active ? 'poly-active' : ''}">
      ${status.active
        ? `<span class="poly-badge">✓ Polikultura +10% yield</span>`
        : `<span class="poly-hint">○ Polikultura</span>`
      }
      <span class="poly-desc">${status.desc}</span>
    </div>
  `;
}

// ─── Feed quality bar ─────────────────────────────────────────────────────────

function updateFishFeedQuality(panel, fp) {
  const fill = panel.querySelector('#feed-quality-fill');
  const pct = panel.querySelector('#feed-quality-pct');

  const bonusPct = Math.min(100, (fp.feedBonusAccumulated / 0.25) * 100);

  if (fill) {
    fill.style.width = `${bonusPct.toFixed(1)}%`;
    fill.className = `feed-quality-fill ${bonusPct >= 80 ? 'quality-high' : bonusPct >= 40 ? 'quality-mid' : 'quality-low'}`;
  }
  if (pct) {
    pct.textContent = `+${(fp.feedBonusAccumulated * 100).toFixed(0)}%`;
    pct.title = `Akumulirani bonus od ishrane (max +25%)`;
  }
}

// ─── Event binding ────────────────────────────────────────────────────────────

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
      const success = feedFish(state, audio);
      if (success) {
        import('./modals.js').then(({ showToast }) => {
          showToast(`🐟 Riba nahranjena! Bonus akumuliran: +${(state.fishpond.feedBonusAccumulated * 100).toFixed(0)}%`);
        });
      }
      return;
    }

    // Harvest
    if (e.target.closest('#fish-harvest-btn')) {
      const rev = harvestFish(state, audio);
      if (rev > 0) {
        const statsEl = panel.querySelector('#fish-stats');
        if (statsEl) spawnRevenueParticle(statsEl, rev);
        import('./modals.js').then(({ showToast }) => {
          showToast(`🐟 Berba ribe: +${formatDin(rev)}`);
        });
      }
    }
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs) {
  if (!isFinite(secs) || secs <= 0) return '0s';
  if (secs >= 3600) return `${(secs / 3600).toFixed(1)}h`;
  if (secs >= 60) return `${Math.floor(secs / 60)}m ${Math.floor(secs % 60)}s`;
  return `${Math.ceil(secs)}s`;
}
