/** @fileoverview Weekly budget panel: 4 category sliders, GC counter, building upgrade panel */

import { getState, setState } from '../state.js';
import { CONFIG } from '../config.js';
import { validateAllocation, calcRemainingBudget, projectAllocationEffects, getMacroHints } from '../systems/macro.js';
import { isBuildingUnlocked, getBuildingInfo, describeBuildingLevel } from '../entities/building.js';
import { resolveBuildingUpgrade } from '../systems/progression.js';
import { formatGC } from '../systems/economy.js';
import { CATEGORY_TOOLTIPS, BUILDING_BRAND_HOOKS } from '../content/brand_hooks.js';
import { showHUDToast } from './hud.js';
import { showConfirm } from './modals.js';

/** @type {Function|null} onConfirmAllocation callback */
let _onConfirmAllocation = null;

/**
 * Render the Macro screen
 * @param {HTMLElement} container
 * @param {Function} onConfirmAllocation - called when player confirms allocation
 */
export function renderMacro(container, onConfirmAllocation) {
  _onConfirmAllocation = onConfirmAllocation;
  const state = getState();

  container.innerHTML = buildMacroHTML(state);
  bindMacroEvents(container, state);
  updateMacroTotals(container, state);
}

function buildMacroHTML(state) {
  const week = state.week;
  const hints = getMacroHints(week, state.currentWB);
  const isEarlyWeek = week <= 2;

  const sliderHTML = Object.entries(CONFIG.CATEGORIES).map(([cat, config]) => {
    const disabled = isEarlyWeek && (cat === 'marketing' || cat === 'zajednica');
    const tip = CATEGORY_TOOLTIPS[cat];
    const currentVal = state.allocation[cat] || 0;
    return `
      <div class="slider-group ${disabled ? 'slider-disabled' : ''}" data-cat="${cat}">
        <div class="slider-header">
          <label class="slider-label" title="${tip?.desc || ''}">${tip?.title || cat}</label>
          <div class="slider-value-wrap">
            <span class="slider-value" id="val-${cat}">${currentVal}</span>
            <span class="slider-gc">GC</span>
          </div>
        </div>
        <input type="range" class="slider" id="slider-${cat}"
          min="0" max="${config.cap}" step="5"
          value="${currentVal}"
          ${disabled ? 'disabled' : ''}
          aria-label="${tip?.title || cat}">
        <div class="slider-labels">
          <span>0</span><span>${config.cap} max</span>
        </div>
        ${disabled ? `<div class="slider-locked-msg">🔒 Otključava se u nedelji 3</div>` : ''}
        <div class="slider-preview" id="preview-${cat}"></div>
      </div>
    `;
  }).join('');

  const buildingsHTML = buildBuildingPanel(state);

  const hintsHTML = hints.map(h => `<div class="hint-item">${h}</div>`).join('');

  return `
    <div class="screen-header">
      <h2 class="screen-title">Nedelja ${week} — Budžet Alokacija</h2>
      <p class="screen-subtitle">Raspodeli ${state.gcBalance} GC ovonedeljnog budžeta</p>
    </div>

    <div class="macro-layout">
      <div class="macro-left">
        <div class="budget-panel panel">
          <div class="budget-total-row">
            <span>Budžet:</span>
            <span class="budget-total" id="budget-display">500 GC</span>
            <span>Preostalo:</span>
            <span class="budget-remaining" id="budget-remaining">500 GC</span>
          </div>
          <div class="sliders-container">
            ${sliderHTML}
          </div>
        </div>

        <div class="hints-panel panel" id="hints-panel">
          <h4>💡 Saveti</h4>
          ${hintsHTML}
        </div>
      </div>

      <div class="macro-right">
        <div class="projection-panel panel">
          <h3>Projekcija efekata</h3>
          <div id="projection-content">
            <div class="proj-row"><span>WB promena</span><span id="proj-wb">+0%</span></div>
            <div class="proj-row"><span>Marketing bonus</span><span id="proj-mkt">0</span></div>
            <div class="proj-row"><span>Kapacitet publike</span><span id="proj-crowd">0</span></div>
            <div class="proj-row highlight"><span>Tom Sawyer uštevina</span><span id="proj-ts">0 GC</span></div>
          </div>
        </div>

        <div class="buildings-panel panel">
          <h3>🏗️ Zgrade (max 2 upgrade/nedelja)</h3>
          <div id="buildings-list">
            ${buildingsHTML}
          </div>
        </div>

        <div class="actions-panel">
          <button class="btn-primary btn-large" id="btn-confirm-macro">
            ✅ Potvrdi alokaciju → Micro
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildBuildingPanel(state) {
  return Object.entries(CONFIG.BUILDINGS).map(([id, bConfig]) => {
    const currentLevel = state.buildings[id] || 0;
    const info = getBuildingInfo(id, currentLevel);
    if (!info) return '';

    const { unlocked, reason } = isBuildingUnlocked(id, currentLevel, state);
    const canBuy = unlocked && !info.isMaxed;
    const upgradeCount = state.buildingUpgradesThisWeek || 0;
    const slotsFull = upgradeCount >= CONFIG.MAX_BUILDING_UPGRADES_PER_WEEK;

    const levelDots = Array.from({ length: info.maxLevel }, (_, i) =>
      `<span class="level-dot ${i < currentLevel ? 'filled' : ''}"></span>`
    ).join('');

    const nextEffects = !info.isMaxed && info.nextLevelDef
      ? describeBuildingLevel(id, currentLevel).join(' · ')
      : '';

    const brandHook = BUILDING_BRAND_HOOKS[id] || '';

    return `
      <div class="building-card ${currentLevel > 0 ? 'built' : 'unbuilt'}" data-building="${id}">
        <div class="building-header">
          <span class="building-emoji">${bConfig.emoji || '🏗️'}</span>
          <div class="building-info">
            <span class="building-name">${bConfig.name}</span>
            <div class="building-levels">${levelDots}</div>
          </div>
          <div class="building-actions">
            ${info.isMaxed
              ? '<span class="badge-maxed">MAX</span>'
              : canBuy
                ? `<button class="btn-upgrade ${slotsFull ? 'btn-disabled' : ''}"
                     data-building="${id}"
                     ${slotsFull ? 'disabled' : ''}
                     title="${nextEffects}">
                     ${info.nextCost} GC
                   </button>`
                : `<span class="upgrade-locked" title="${reason}">🔒 ${reason}</span>`
            }
          </div>
        </div>
        ${nextEffects ? `<div class="building-next-effect">→ ${nextEffects}</div>` : ''}
        <div class="building-hook">${brandHook}</div>
      </div>
    `;
  }).join('');
}

function bindMacroEvents(container, state) {
  // Slider events
  for (const cat of Object.keys(CONFIG.CATEGORIES)) {
    const slider = container.querySelector(`#slider-${cat}`);
    if (!slider) continue;
    slider.addEventListener('input', () => {
      onSliderChange(container, cat, parseInt(slider.value));
    });
  }

  // Building upgrade buttons
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-upgrade');
    if (btn && !btn.disabled) {
      const buildingId = btn.dataset.building;
      onBuildingUpgrade(container, buildingId);
    }
  });

  // Confirm button
  const confirmBtn = container.querySelector('#btn-confirm-macro');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => onConfirmMacro(container));
  }
}

function onSliderChange(container, cat, value) {
  const state = getState();
  const newAlloc = { ...state.allocation, [cat]: value };

  // Validate
  const { clamped } = validateAllocation(newAlloc, state.gcBalance);

  // If over budget, clamp this slider
  const remaining = calcRemainingBudget(clamped, state.gcBalance);
  if (remaining < 0) {
    clamped[cat] = Math.max(0, value + remaining);
  }

  // Update display
  const valEl = container.querySelector(`#val-${cat}`);
  if (valEl) valEl.textContent = clamped[cat];

  // Update slider to clamped value
  const slider = container.querySelector(`#slider-${cat}`);
  if (slider) slider.value = clamped[cat];

  setState({ allocation: clamped });
  updateMacroTotals(container, getState());
}

function onBuildingUpgrade(container, buildingId) {
  const state = getState();
  const currentLevel = state.buildings[buildingId] || 0;
  const bConfig = CONFIG.BUILDINGS[buildingId];
  if (!bConfig) return;

  const levelDef = bConfig.levels[currentLevel];
  if (!levelDef) return;

  if (state.gcBalance < levelDef.cost) {
    showHUDToast(`Nedostaje ${levelDef.cost - state.gcBalance} GC`, 'error');
    return;
  }

  if ((state.buildingUpgradesThisWeek || 0) >= CONFIG.MAX_BUILDING_UPGRADES_PER_WEEK) {
    showHUDToast('Maksimum 2 upgrade-a po nedelji', 'warning');
    return;
  }

  const result = resolveBuildingUpgrade(buildingId);
  if (result.success) {
    showHUDToast(`${bConfig.emoji} ${bConfig.name} → Nivo ${result.newLevel}!`, 'success');
    // Re-render buildings panel
    const bldList = container.querySelector('#buildings-list');
    if (bldList) bldList.innerHTML = buildBuildingPanel(getState());
    updateMacroTotals(container, getState());
  } else {
    showHUDToast(result.reason || 'Upgrade nije moguć', 'error');
  }
}

function onConfirmMacro(container) {
  const state = getState();
  const remaining = calcRemainingBudget(state.allocation, state.gcBalance);

  if (remaining > 50) {
    showConfirm(
      `Ostaje ${remaining} GC neiskorišćeno. Da li si siguran?`,
      () => {
        applyAndContinue(state);
      }
    );
  } else {
    applyAndContinue(state);
  }
}

function applyAndContinue(state) {
  // Deduct allocation from GC balance
  const spent = Object.values(state.allocation).reduce((a, b) => a + b, 0);
  setState({ gcBalance: Math.max(0, state.gcBalance - spent) });

  _onConfirmAllocation?.(state.allocation);
}

function updateMacroTotals(container, state) {
  const remaining = calcRemainingBudget(state.allocation, state.gcBalance);
  const remainEl = container.querySelector('#budget-remaining');
  if (remainEl) {
    remainEl.textContent = formatGC(remaining);
    remainEl.classList.toggle('remaining-low', remaining < 50);
    remainEl.classList.toggle('remaining-zero', remaining === 0);
  }

  const effects = projectAllocationEffects(state.allocation, state);

  // Update projections
  const updateProj = (id, text) => {
    const el = container.querySelector(id);
    if (el) el.textContent = text;
  };

  const wbSign = effects.wbGain >= 0 ? '+' : '';
  updateProj('#proj-wb', `${wbSign}${effects.wbGain}%`);
  updateProj('#proj-mkt', `+${effects.marketingBonus.toFixed(1)} GC/ticket`);
  updateProj('#proj-crowd', `+${effects.crowdCapGain} cap`);
  updateProj('#proj-ts', `${effects.volunteerSavings} GC`);

  const tsEl = container.querySelector('#proj-ts');
  if (tsEl) {
    tsEl.parentElement?.classList.toggle('ts-active', effects.tomSawyerActive);
  }
}
