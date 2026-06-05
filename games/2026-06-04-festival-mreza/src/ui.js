/** @module ui — DOM UI updates, macro/micro screen layout, layer switching */

import { CITIES, CITY_ORDER, getVenueCapacity, getVenueTierLabel } from './content/cities_data.js';
import { COORDINATORS } from './content/coordinators_data.js';
import { REDIRECT_PAIRS, getRedirectButtonStates } from './systems/routing_manager.js';
import { getUpgradeList } from './systems/upgrade_manager.js';
import { getCityBuzz } from './systems/promo_engine.js';
import { updateMicroHUD, updateMacroHUD, showTextCue } from './rendering/hud_renderer.js';
import { updateIncidentModal } from './rendering/incident_modal.js';
import { getCareerTierInfo } from './systems/progression.js';
import { VETERAN_INSIGHTS } from './systems/prestige_manager.js';
import { computeUpgradeEffects } from './systems/upgrade_manager.js';
import { getBPMSliderPct, getBPMColor } from './systems/bpm_controller.js';
import { shareResult } from './share.js';

/** @type {'macro'|'micro'|'meta'} */
let _currentLayer = 'macro';

/**
 * Show a specific screen, hide others
 * @param {'macro'|'micro'|'meta'|'victory'|'prestige'} screenId
 */
export function showScreen(screenId) {
  const screens = ['macro-screen', 'micro-screen', 'meta-screen', 'victory-screen', 'prestige-screen', 'loading-screen'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', id !== `${screenId}-screen`);
  });
  _currentLayer = screenId === 'macro' || screenId === 'micro' || screenId === 'meta' ? screenId : _currentLayer;
}

/**
 * Render macro screen
 * @param {import('./state.js').MacroState} macro
 * @param {import('./state.js').MetaState} meta
 */
export function renderMacroScreen(macro, meta) {
  updateMacroHUD(macro, meta);
  renderCityPanel(macro, meta);
  renderCoordinatorPanel(macro, meta);
  renderUpgradesPanel(macro);
  renderActionPanel(macro, meta);
}

/**
 * Render city panel (left of macro screen)
 */
function renderCityPanel(macro, meta) {
  const el = document.getElementById('city-panel');
  if (!el) return;

  const upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);
  const cityId = CITY_ORDER[macro.current_city_index] || 'avala';
  const city = CITIES[cityId];
  const rep = macro.reputation[cityId] || 0;
  const buzz = getCityBuzz(macro, cityId);
  const venueCapacity = getVenueCapacity(rep);
  const venueLabel = getVenueTierLabel(rep);
  const isLocked = cityId === 'guncati' && !meta.guncati_unlocked;

  el.innerHTML = `
    <div class="city-info-card">
      <div class="city-name" style="color:${city.accentColor}">${city.name}</div>
      <div class="city-desc">${city.description}</div>

      <div class="city-stat-row">
        <span class="label">Venue:</span>
        <span class="value">${venueLabel} (${venueCapacity} crowd)</span>
      </div>
      <div class="city-stat-row">
        <span class="label">Reputacija:</span>
        <div class="mini-bar">
          <div class="mini-bar-fill" style="width:${rep}%;background:${city.accentColor}"></div>
        </div>
        <span class="value">${rep}/100</span>
      </div>
      <div class="city-stat-row">
        <span class="label">Buzz:</span>
        <div class="mini-bar">
          <div class="mini-bar-fill" style="width:${(buzz / 70) * 100}%;background:#ffb830"></div>
        </div>
        <span class="value">${Math.round(buzz)}</span>
      </div>

      <div class="promo-section">
        <div class="section-title">Promo Investicija</div>
        <div class="promo-buttons">
          <button class="btn-promo" data-action="buy-promo" data-param="social">
            Social <span class="cost">80 EUR</span>
          </button>
          <button class="btn-promo" data-action="buy-promo" data-param="flyer">
            Flyer <span class="cost">40 EUR</span>
          </button>
          <button class="btn-promo" data-action="buy-promo" data-param="radio">
            Radio <span class="cost">200 EUR</span>
          </button>
          ${macro.upgrades_purchased.includes('P4') ? `
            <button class="btn-promo" data-action="buy-promo" data-param="influencer">
              Influencer <span class="cost">120 EUR</span>
            </button>
          ` : ''}
        </div>
      </div>

      ${macro.insurance_active ? `
        <div class="insurance-badge">✓ Osiguranje aktivno</div>
      ` : `
        <button class="btn-action" data-action="buy-insurance">
          Osiguranje <span class="cost">300 EUR</span>
        </button>
      `}

      <button class="btn-start-event" id="btn-start-event" ${isLocked ? 'disabled' : ''}>
        ${isLocked ? '🔒 Guncati Locked' : `Počni Event — ${city.name}`}
      </button>
    </div>
  `;
}

/**
 * Render coordinator panel
 */
function renderCoordinatorPanel(macro, meta) {
  const el = document.getElementById('coordinator-panel');
  if (!el) return;

  const upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);
  const currentCityId = CITY_ORDER[macro.current_city_index];

  // Available coordinators for this city
  const available = Object.values(COORDINATORS).filter(c => {
    if (macro.active_coordinators.find(a => a.id === c.id)) return false;
    return c.cities.includes(currentCityId) || c.cities.some(city =>
      CITY_ORDER.indexOf(city) >= macro.current_city_index
    );
  });

  const activeHtml = macro.active_coordinators.map(c => {
    const data = COORDINATORS[c.id];
    if (!data) return '';
    const loyalty = c.loyalty || 0;
    const tier = c.loyaltyTier || 1;
    return `
      <div class="coord-card active">
        <div class="coord-portrait" style="background:${data.portraitColor}">${data.portrait}</div>
        <div class="coord-info">
          <div class="coord-name">${data.name}</div>
          <div class="coord-tier">Tier ${tier} — Loyalty ${loyalty}</div>
        </div>
      </div>
    `;
  }).join('');

  const availableHtml = available.slice(0, 3).map(c => {
    const tier = 1;
    const cost = 100 * Math.pow(2, tier - 1) * c.baseCostMultiplier;
    const canAfford = macro.budget >= cost;
    return `
      <div class="coord-card available">
        <div class="coord-portrait" style="background:${c.portraitColor}">${c.portrait}</div>
        <div class="coord-info">
          <div class="coord-name">${c.name}</div>
          <div class="coord-reach">Reach +${c.baseReach}</div>
        </div>
        <button
          class="btn-hire ${!canAfford ? 'disabled' : ''}"
          data-action="hire-coordinator"
          data-param="${c.id}"
          ${!canAfford ? 'disabled' : ''}
        >${Math.round(cost)} EUR</button>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div class="section-title">Koordinatori</div>
    ${activeHtml || '<div class="empty-msg">Nema aktivnih</div>'}
    ${available.length > 0 ? `<div class="section-subtitle">Dostupni</div>${availableHtml}` : ''}
  `;
}

/**
 * Render upgrades panel
 */
export function renderUpgradesPanel(macro) {
  const el = document.getElementById('upgrades-panel');
  if (!el) return;

  const list = getUpgradeList(macro);
  const byCategory = {};
  for (const item of list) {
    const cat = item.upgrade.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  const catLabels = { promo: 'Promo', coordinator: 'Koordinatori', venue: 'Venue' };

  el.innerHTML = `
    <div class="panel-header">
      Nadogradnje
      <button class="btn-close" data-action="open-upgrades">✕</button>
    </div>
    ${Object.entries(byCategory).map(([cat, items]) => `
      <div class="upgrade-category">
        <div class="section-title">${catLabels[cat] || cat}</div>
        ${items.map(({ upgrade, currentLevel, cost, canBuy, reason }) => `
          <div class="upgrade-item ${upgrade.maxLevel === currentLevel ? 'maxed' : ''}">
            <div class="upgrade-info">
              <div class="upgrade-name">${upgrade.name} ${currentLevel > 0 ? `<span class="lvl">Lv${currentLevel}</span>` : ''}</div>
              <div class="upgrade-desc">${upgrade.desc}</div>
              ${reason ? `<div class="upgrade-reason">${reason}</div>` : ''}
            </div>
            ${currentLevel < upgrade.maxLevel ? `
              <button
                class="btn-upgrade ${!canBuy ? 'disabled' : ''}"
                data-action="buy-upgrade"
                data-param="${upgrade.id}"
                ${!canBuy ? 'disabled' : ''}
              >${cost} EUR</button>
            ` : '<span class="maxed-badge">MAX</span>'}
          </div>
        `).join('')}
      </div>
    `).join('')}
  `;
}

/**
 * Render micro screen DOM (BPM slider, redirect buttons, HUD bars)
 * @param {import('./state.js').MicroState} micro
 * @param {import('./state.js').MacroState} macro
 * @param {import('./state.js').MetaState} meta
 */
export function renderMicroScreen(micro, macro, meta) {
  updateMicroHUD(micro, macro);
  updateIncidentModal(micro, macro);
  updateRedirectButtons(micro, macro);
  updateBPMSlider(micro, macro);
}

/**
 * Update redirect buttons state
 */
function updateRedirectButtons(micro, macro) {
  const hasIncident = micro.incident_queue.some(i => !i.resolved);
  const states = getRedirectButtonStates(micro.zones || {}, hasIncident);

  states.forEach((state, i) => {
    const btn = document.getElementById(`redirect-btn-${i}`);
    if (!btn) return;
    btn.disabled = !state.enabled;
    btn.classList.toggle('disabled', !state.enabled);
    btn.title = state.reason || '';

    // Show visible reason text below button (mobile-friendly, title attr not shown on mobile)
    let reasonEl = btn.parentElement?.querySelector(`.redirect-reason-${i}`);
    if (!reasonEl) {
      reasonEl = document.createElement('span');
      reasonEl.className = `redirect-reason redirect-reason-${i}`;
      reasonEl.style.cssText = 'font-size:9px;color:#ffb830;display:none;position:absolute;bottom:-14px;left:0;right:0;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      if (btn.parentElement) {
        btn.parentElement.style.position = 'relative';
        btn.parentElement.appendChild(reasonEl);
      }
    }
    if (btn.disabled && state.reason) {
      reasonEl.textContent = state.reason;
      reasonEl.style.display = 'block';
    } else {
      reasonEl.textContent = '';
      reasonEl.style.display = 'none';
    }
  });
}

/**
 * Update BPM slider position
 */
function updateBPMSlider(micro, macro) {
  const fill = document.getElementById('bpm-slider-fill');
  if (!fill || !micro) return;
  const pct = getBPMSliderPct(micro.current_bpm);
  fill.style.width = `${pct * 100}%`;
  const upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);
  fill.style.background = getBPMColor(micro.current_bpm, upgradeEffects);
}

/**
 * Render macro action panel (right side)
 */
function renderActionPanel(macro, meta) {
  const el = document.getElementById('action-panel');
  if (!el) return;

  const tierInfo = getCareerTierInfo(meta.career_tier);
  const prestige = macro.tour_complete;

  el.innerHTML = `
    <div class="budget-display">
      <div class="budget-label">Budžet</div>
      <div class="budget-value">${Math.round(macro.budget)} EUR</div>
    </div>

    <div class="tour-progress">
      ${CITY_ORDER.map((cityId, i) => {
        const result = macro.event_results.find(r => r.cityId === cityId);
        const isCurrent = i === macro.current_city_index;
        const city = CITIES[cityId];
        return `
          <div class="progress-city ${isCurrent ? 'current' : ''} ${result ? 'done' : ''}">
            <span>${city.name.charAt(0)}</span>
            ${result ? `<span class="score">${Math.round(result.satisfactionScore)}%</span>` : ''}
          </div>
        `;
      }).join('')}
    </div>

    <div class="career-tier-badge" style="border-color:${tierInfo.color};color:${tierInfo.color}">
      ${tierInfo.label}
    </div>

    ${meta.prestige_count > 0 ? `
      <div class="prestige-info">✦ Prestige ×${meta.prestige_count}</div>
    ` : ''}

    <div class="action-buttons">
      <button class="btn-action" data-action="open-upgrades">Nadogradnje</button>
      ${prestige ? `<button class="btn-prestige" data-action="prestige">Prestige Reset</button>` : ''}
      ${macro.tour_complete ? `<button class="btn-share" data-action="share">Podeli Rezultat</button>` : ''}
    </div>
  `;
}

/**
 * Render victory screen
 * @param {import('./state.js').MacroState} macro
 * @param {import('./state.js').MetaState} meta
 */
export function renderVictoryScreen(macro, meta) {
  const el = document.getElementById('victory-screen');
  if (!el) return;

  const avalaResult = macro.event_results.find(r => r.cityId === 'avala');
  const avalaScore = avalaResult ? Math.round(avalaResult.satisfactionScore) : 0;
  const isGrand = avalaScore >= 90;
  const tierInfo = getCareerTierInfo(meta.career_tier);

  el.innerHTML = `
    <div class="victory-content">
      <div class="victory-title" style="color:${isGrand ? '#4df5ff' : '#ffb830'}">
        ${isGrand ? 'Grand Finale!' : 'Turneja Završena!'}
      </div>
      <div class="avala-score" style="color:${isGrand ? '#4df5ff' : '#ffb830'}">
        Avala: ${avalaScore}%
      </div>
      <div class="tier-unlocked" style="color:${tierInfo.color}">
        ${tierInfo.label}
      </div>
      <div class="city-results-list">
        ${macro.event_results.map(r => {
          const city = CITIES[r.cityId];
          const ok = r.satisfactionScore >= 70;
          return `<div class="result-row">
            <span>${city?.name || r.cityId}</span>
            <span style="color:${ok ? '#4a7c59' : '#ff4444'}">${Math.round(r.satisfactionScore)}%</span>
          </div>`;
        }).join('')}
      </div>
      <div class="victory-buttons">
        <button class="btn-share" data-action="share">Podeli Rezultat</button>
        <button class="btn-prestige" data-action="prestige">Prestige Reset</button>
        <button class="btn-restart" onclick="location.reload()">Nova Turneja</button>
      </div>
    </div>
  `;

  el.addEventListener('click', onMacroClick);
}

/**
 * Render prestige screen (insight selection)
 * @param {import('./state.js').MetaState} meta
 * @param {Function} onSelect callback({selectedIds})
 */
export function renderPrestigeScreen(meta, onSelect) {
  const el = document.getElementById('prestige-screen');
  if (!el) return;

  let selected = [...meta.veteran_insights];

  el.innerHTML = `
    <div class="prestige-content">
      <div class="prestige-title">Veteran Insights</div>
      <div class="prestige-desc">Izaberi 3 stečena znanja za sledeći run</div>
      <div class="insights-grid">
        ${VETERAN_INSIGHTS.map(vi => {
          const isSelected = selected.includes(vi.id);
          return `
            <div class="insight-card ${isSelected ? 'selected' : ''}" data-insight="${vi.id}">
              <div class="insight-id">${vi.id.replace('vi_', '').toUpperCase()}</div>
              <div class="insight-desc">${vi.desc}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="selected-count" id="insights-count">Izabrano: ${selected.length}/3</div>
      <button class="btn-confirm" id="btn-confirm-prestige" ${selected.length !== 3 ? 'disabled' : ''}>
        Potvrdi Prestige
      </button>
    </div>
  `;

  el.querySelectorAll('.insight-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.insight;
      if (selected.includes(id)) {
        selected = selected.filter(s => s !== id);
        card.classList.remove('selected');
      } else if (selected.length < 3) {
        selected.push(id);
        card.classList.add('selected');
      }
      document.getElementById('insights-count').textContent = `Izabrano: ${selected.length}/3`;
      document.getElementById('btn-confirm-prestige').disabled = selected.length !== 3;
    });
  });

  document.getElementById('btn-confirm-prestige')?.addEventListener('click', () => {
    if (selected.length === 3 && onSelect) onSelect(selected);
  });
}

/**
 * Show coordinator dialog
 * @param {string} name
 * @param {string} text
 * @param {string} portraitColor
 */
export function showCoordinatorDialog(name, text, portraitColor) {
  let dialog = document.getElementById('coord-dialog');
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = 'coord-dialog';
    dialog.className = 'coord-dialog';
    document.getElementById('game-root').appendChild(dialog);
  }

  dialog.innerHTML = `
    <div class="dialog-content">
      <div class="dialog-portrait" style="background:${portraitColor}">${name.charAt(0)}</div>
      <div class="dialog-body">
        <div class="dialog-name">${name}</div>
        <div class="dialog-text">"${text}"</div>
      </div>
      <button class="dialog-close">✕</button>
    </div>
  `;

  dialog.style.display = 'flex';
  dialog.querySelector('.dialog-close').addEventListener('click', () => {
    dialog.style.display = 'none';
  });

  setTimeout(() => { dialog.style.display = 'none'; }, 8000);
}

/**
 * Handle click in macro area (for dynamic buttons)
 */
function onMacroClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  // Action handled by input.js (event bubbles up)
}

/**
 * Show loading screen with aforizam
 * @param {string} aforizam
 */
export function showLoadingScreen(aforizam) {
  showScreen('loading');
  const el = document.getElementById('loading-aforizam');
  if (el) el.textContent = `"${aforizam}"`;
}

/**
 * Update the BPM slider label (cue text above slider)
 * @param {number} bpm
 * @param {string} range 'cool'|'warm'|'hot'
 */
export function updateBPMCueText(bpm, range) {
  const cues = {
    cool: 'Hladna atmosfera — idi toplije',
    warm: 'Savršen ritam',
    hot:  'Vrelo! Pazi na energiju',
  };
  showTextCue(cues[range] || '', range === 'warm' ? '#4a7c59' : range === 'hot' ? '#ff5500' : '#4df5ff');
}
