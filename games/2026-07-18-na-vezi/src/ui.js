/** Macro planning UI paneli, modali, meniji, dugmad */
import { getState, updateState } from './state.js';
import { formatCapital, formatAudience, FORMATS, EQUIPMENT } from './config.js';
import { showScreen, renderTopBar } from './render.js';
import { isTutorialMode, getTutorialBannerHtml, applyTutorialClasses } from './ui/tutorial-mode.js';
import { renderStaticCapacityPreview } from './ui/offgrid-meter.js';
import { getAvailableFormats, getFormatAffinity, formatAffinity } from './macro/format-selector.js';
import { getGuestBookingOptions, formatReliability } from './macro/guest-booking.js';
import { getEquipmentByCategory, previewEquipmentImpact } from './macro/equipment-shop.js';
import { validateAllocation } from './macro/platform-allocation.js';
import { getWeatherBandLabel } from './macro/offgrid-budget.js';
import { getNextUnlock } from './meta/unlock-manager.js';
import { getBriefingStats } from './meta/season-stats.js';
import { emit, EVENTS } from './events.js';

// ===================== ACHIEVEMENT TOAST =====================

/** @type {HTMLElement|null} */
let _achievementToast = null;
/** @type {NodeJS.Timeout|null} */
let _toastTimer = null;

/**
 * Inicijalizuje toast element
 */
export function initAchievementToast() {
  _achievementToast = document.createElement('div');
  _achievementToast.className = 'achievement-toast';
  _achievementToast.innerHTML = `
    <div class="achievement-icon" id="toast-icon">🏆</div>
    <div class="achievement-text">
      <div class="achievement-name" id="toast-name">Achievement</div>
      <div class="achievement-desc" id="toast-desc">Opis</div>
    </div>
  `;
  document.body.appendChild(_achievementToast);
}

/**
 * Prikazuje achievement toast
 * @param {Object} achievement
 */
export function showAchievementToast(achievement) {
  if (!_achievementToast) initAchievementToast();
  const icon = document.getElementById('toast-icon');
  const name = document.getElementById('toast-name');
  const desc = document.getElementById('toast-desc');
  if (icon) icon.textContent = achievement.icon || '🏆';
  if (name) name.textContent = `🔓 ${achievement.name}`;
  if (desc) desc.textContent = achievement.desc || '';

  _achievementToast.classList.add('visible');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    _achievementToast.classList.remove('visible');
  }, 4000);
}

// ===================== MAIN SCREEN =====================

/**
 * Renderuje main screen
 * @param {Function} onStart
 */
export function renderMainScreen(onStart) {
  const screen = document.getElementById('screen-main');
  if (!screen) return;
  const state = getState();
  const totalAud = state.audience.ig + state.audience.tiktok + state.audience.youtube;

  screen.innerHTML = `
    <div class="main-hero">
      <div class="main-logo">NA VEZI</div>
      <div class="main-subtitle">Guncati Televizija — Kontrolna Soba</div>
      <p class="main-desc">
        Vodi svoju TV emisiju sa off-grid imanja. Planiraj format, upravljaj platformama,
        reaguj na alarme u realnom vremenu — i gradi Guncati publiku nedelju po nedelju.
      </p>

      <div class="main-stats">
        <div class="main-stat">
          <div class="value-display">${formatCapital(state.capital)}</div>
          <div class="value-label">💰 Kapital</div>
        </div>
        <div class="main-stat">
          <div class="value-display">${formatAudience(totalAud)}</div>
          <div class="value-label">👥 Publika</div>
        </div>
        <div class="main-stat">
          <div class="value-display">S${state.prestige_count + 1}</div>
          <div class="value-label">📺 Sezona</div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" id="start-btn">
        📡 Nova Emisija →
      </button>

      ${state.emisije_u_sezoni > 0 ? `
        <div style="font-size:0.8rem; color:var(--color-text-muted);">
          Nedelja ${state.week} · ${state.emisije_u_sezoni}/${8} emisija ove sezone
          ${state.prestige_count > 0 ? ` · ×${state.season_multiplier.toFixed(2)} multiplier` : ''}
        </div>
      ` : ''}
    </div>
  `;

  const startBtn = screen.querySelector('#start-btn');
  if (startBtn) startBtn.addEventListener('click', () => {
    emit(EVENTS.AUDIO_PLAY, { type: 'ui_click' });
    onStart();
  });
}

// ===================== WEEKLY BRIEFING =====================

/**
 * Renderuje weekly briefing
 * @param {HTMLElement} screen
 * @param {Object} capacityResult
 * @param {Function} onContinue
 */
export function renderWeeklyBriefing(screen, capacityResult, onContinue) {
  const state = getState();
  const lastOutcome = state.last_week_outcome;
  const tutMode = isTutorialMode();

  const outcomeCardClass = lastOutcome
    ? lastOutcome.capitalDelta > 0 ? 'positive' : lastOutcome.capitalDelta < -20 ? 'negative' : 'neutral'
    : 'neutral';

  screen.innerHTML = `
    ${tutMode ? getTutorialBannerHtml() : ''}
    <div class="briefing-container scroll-area">
      <div class="briefing-header">
        <div>
          <div class="week-label">Nedelja ${state.week}</div>
          <h1 style="font-size:1.4rem; margin-top:4px;">Nedeljni Brifing</h1>
        </div>
        <div class="hud-item" style="text-align:right;">
          <span class="hud-value">${formatCapital(state.capital)}</span>
          <span class="hud-label">Kapital</span>
        </div>
      </div>

      ${lastOutcome ? `
        <div class="outcome-card ${outcomeCardClass}">
          <h3>Prošla nedelja</h3>
          <div class="outcome-metrics" style="margin-top:8px;">
            <div class="metric-cell">
              <div class="value" style="color:${lastOutcome.capitalDelta >= 0 ? 'var(--color-crt)' : 'var(--color-critical)'};">
                ${lastOutcome.capitalDelta >= 0 ? '+' : ''}${formatCapital(lastOutcome.capitalDelta)}
              </div>
              <div class="label">Kapital</div>
            </div>
            <div class="metric-cell">
              <div class="value">${Math.round((lastOutcome.overallEngagement || 0) * 100)}%</div>
              <div class="label">Engagement</div>
            </div>
            <div class="metric-cell">
              <div class="value">${Math.round((lastOutcome.signalUptime || 0) * 100)}%</div>
              <div class="label">Signal Uptime</div>
            </div>
          </div>
          ${lastOutcome.noShow ? '<p style="color:var(--color-warn); font-size:0.8rem; margin-top:8px;">😬 Gost nije stigao prošle nedelje.</p>' : ''}
          ${lastOutcome.tiktokSpike ? '<p style="color:var(--color-tiktok); font-size:0.8rem; margin-top:4px;">🚀 TikTok spike!' : ''}
        </div>
      ` : `
        <div class="outcome-card neutral">
          <p style="font-style:italic;">Dobrodošao u Guncati Televiziju! Prva emisija te čeka.</p>
        </div>
      `}

      <div id="capacity-preview-container"></div>

      <div class="panel">
        <h3 style="margin-bottom:8px;">Ova nedelja</h3>
        <div class="season-mini-stats">
          <div class="season-mini-stat">Nedelja <span>${state.week}</span></div>
          <div class="season-mini-stat">Emisije <span>${state.emisije_u_sezoni}/8</span></div>
          <div class="season-mini-stat">Streak <span>${state.signal_stabilan_streak}</span></div>
          ${state.prestige_count > 0 ? `<div class="season-mini-stat">×<span>${state.season_multiplier.toFixed(2)}</span></div>` : ''}
        </div>
      </div>

      <div class="panel" style="display:flex; gap:8px; align-items:center;">
        <div style="flex:1;">
          <div style="font-size:0.85rem; color:var(--color-text-dim);">IG: <b>${formatAudience(state.audience.ig)}</b></div>
          <div style="font-size:0.85rem; color:var(--color-text-dim);">TT: <b>${formatAudience(state.audience.tiktok)}</b></div>
          <div style="font-size:0.85rem; color:var(--color-text-dim);">YT: <b>${formatAudience(state.audience.youtube)}</b></div>
        </div>
        <div style="text-align:right;">
          <div class="value-label">Ukupna publika</div>
          <div class="value-display">${formatAudience(state.audience.ig + state.audience.tiktok + state.audience.youtube)}</div>
        </div>
      </div>

      <button class="btn btn-primary btn-full btn-lg" id="plan-btn">
        📋 Planiraj Nedelju →
      </button>

      <div style="height:16px;"></div>
    </div>
  `;

  // Kapacitet preview
  const capContainer = screen.querySelector('#capacity-preview-container');
  if (capContainer) {
    renderStaticCapacityPreview(capContainer, capacityResult.capacity, capacityResult.band);
  }

  const planBtn = screen.querySelector('#plan-btn');
  if (planBtn) planBtn.addEventListener('click', onContinue);
}

// ===================== MACRO PLANNING =====================

/**
 * Renderuje macro planning ekran
 * @param {HTMLElement} screen
 * @param {Object} draftPlan
 * @param {number} currentStep
 * @param {number} totalSteps
 * @param {Object} callbacks - { onNext, onPrev, onFormat, onAlloc, onEquip, onGuest, onLockIn }
 */
export function renderMacroPlanningScreen(screen, draftPlan, currentStep, totalSteps, callbacks) {
  const state = getState();
  const tutMode = isTutorialMode();

  const stepNames = ['Format', 'Platforme', 'Oprema', 'Gost', 'Off-grid'];

  screen.innerHTML = `
    ${tutMode ? getTutorialBannerHtml() : ''}
    <div class="macro-container scroll-area">
      <div class="flex-between" style="margin-bottom:var(--gap-md);">
        <h2>Planiranje Nedelje ${state.week}</h2>
        <div class="tutorial-step-indicator">
          ${stepNames.map((name, i) => `
            <div class="tooltip-wrapper">
              <div class="tutorial-step-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}"></div>
              <div class="tooltip-content">${name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div id="planning-step-content"></div>

      <div class="divider"></div>

      <div class="flex" style="gap:8px;">
        ${currentStep > 0 ? `<button class="btn btn-ghost" id="prev-step-btn">← Nazad</button>` : ''}
        <div class="flex-1"></div>
        ${currentStep < totalSteps - 1
          ? `<button class="btn btn-primary" id="next-step-btn">Dalje →</button>`
          : `<button class="btn btn-primary btn-lg" id="lockin-btn">🎬 ON AIR!</button>`
        }
      </div>
    </div>
  `;

  // Render step content
  const stepContent = screen.querySelector('#planning-step-content');
  if (stepContent) {
    _renderPlanningStep(stepContent, currentStep, draftPlan, state, tutMode, callbacks);
  }

  // Buttons
  const prevBtn = screen.querySelector('#prev-step-btn');
  if (prevBtn) prevBtn.addEventListener('click', callbacks.onPrev);

  const nextBtn = screen.querySelector('#next-step-btn');
  if (nextBtn) nextBtn.addEventListener('click', callbacks.onNext);

  const lockInBtn = screen.querySelector('#lockin-btn');
  if (lockInBtn) lockInBtn.addEventListener('click', callbacks.onLockIn);
}

/**
 * Renderuje sadržaj jednog koraka
 */
function _renderPlanningStep(container, step, draftPlan, state, tutMode, callbacks) {
  switch (step) {
    case 0: _renderFormatStep(container, draftPlan, state, tutMode, callbacks); break;
    case 1: _renderPlatformStep(container, draftPlan, state, tutMode, callbacks); break;
    case 2: _renderEquipmentStep(container, state, callbacks); break;
    case 3: _renderGuestStep(container, draftPlan, state, callbacks); break;
    case 4: _renderOffgridStep(container, draftPlan); break;
  }
}

function _renderFormatStep(container, draftPlan, state, tutMode, callbacks) {
  const formats = getAvailableFormats();
  container.innerHTML = `
    <div class="planning-step-header">
      <div class="step-number">1</div>
      <div class="step-title">Izaberi Format Emisije</div>
    </div>
    <div class="format-grid" style="margin-top:12px;">
      ${formats.map(f => `
        <div class="format-card ${draftPlan.format === f.id ? 'selected' : ''} ${!f.unlocked ? 'locked' : ''}"
             data-format="${f.id}">
          <span class="format-icon">${f.icon}</span>
          <div class="format-name">${f.name}</div>
          <div class="format-hint">${f.hint}</div>
          ${!f.unlocked ? '<div style="font-size:0.65rem; color:var(--color-text-muted); margin-top:4px;">🔒 Zaključano</div>' : ''}
          ${f.unlocked ? `
            <div style="margin-top:6px; display:flex; gap:4px; flex-wrap:wrap; justify-content:center;">
              ${Object.entries(f.platformAffinity).map(([p, v]) => `
                <span style="font-size:0.65rem; padding:1px 5px; background:var(--color-bg-input); border-radius:3px;
                      color:${v > 1 ? 'var(--color-crt)' : v < 1 ? 'var(--color-warn)' : 'var(--color-text-muted)'};">
                  ${p.toUpperCase()} ${formatAffinity(v)}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ${tutMode ? `<div class="tutorial-format-hint"><span class="tutorial-arrow">→</span> Tutorial: DJ Lajv je pre-podešen za tvoju prvu emisiju.</div>` : ''}
  `;

  container.querySelectorAll('.format-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      callbacks.onFormat(card.dataset.format);
      container.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

function _renderPlatformStep(container, draftPlan, state, tutMode, callbacks) {
  const alloc = draftPlan.platform_alloc;
  const validation = validateAllocation(alloc);

  container.innerHTML = `
    <div class="planning-step-header">
      <div class="step-number">2</div>
      <div class="step-title">Platform Alokacija</div>
    </div>
    <div style="margin-top:12px;">
      <p style="font-size:0.82rem; color:var(--color-text-dim); margin-bottom:12px;">
        Rasporedi 100% kapaciteta po platformama. Zbir mora biti tačno 100%.
      </p>

      <div class="platform-alloc-row ${tutMode ? 'tutorial-highlight' : ''}">
        <span class="platform-name ig">Instagram</span>
        <input type="range" class="alloc-slider" id="slider-ig" min="0" max="100" step="5" value="${alloc.ig}">
        <span class="alloc-value" id="val-ig">${alloc.ig}%</span>
      </div>

      <div class="platform-alloc-row ${tutMode ? 'dimmed-tutorial' : ''}" data-platform="tiktok">
        <span class="platform-name tiktok">TikTok</span>
        <input type="range" class="alloc-slider" id="slider-tiktok" min="0" max="100" step="5" value="${alloc.tiktok}" ${tutMode ? 'disabled' : ''}>
        <span class="alloc-value" id="val-tiktok">${alloc.tiktok}%</span>
      </div>

      <div class="platform-alloc-row ${tutMode ? 'dimmed-tutorial' : ''}" data-platform="youtube">
        <span class="platform-name youtube">YouTube</span>
        <input type="range" class="alloc-slider" id="slider-youtube" min="0" max="100" step="5" value="${alloc.youtube}" ${tutMode ? 'disabled' : ''}>
        <span class="alloc-value" id="val-youtube">${alloc.youtube}%</span>
      </div>

      <div style="margin-top:12px; display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.85rem; color:var(--color-text-dim);">Zbir:</span>
        <span id="alloc-total" class="alloc-total ${validation.status}" style="font-family:var(--font-mono); font-weight:700;">
          ${validation.total}%
        </span>
        ${validation.status !== 'exact' ? `<span style="font-size:0.75rem; color:var(--color-warn);">(mora biti 100%)</span>` : ''}
      </div>
    </div>
  `;

  // Slider handlers
  ['ig', 'tiktok', 'youtube'].forEach(p => {
    if (tutMode && p !== 'ig') return;
    const slider = container.querySelector(`#slider-${p}`);
    if (slider) {
      slider.addEventListener('input', () => {
        const newAlloc = callbacks.onAlloc(p, parseInt(slider.value));
        if (newAlloc) _updateAllocDisplay(container, newAlloc);
      });
    }
  });
}

function _updateAllocDisplay(container, alloc) {
  ['ig', 'tiktok', 'youtube'].forEach(p => {
    const valEl = container.querySelector(`#val-${p}`);
    const sliderEl = container.querySelector(`#slider-${p}`);
    if (valEl) valEl.textContent = `${alloc[p]}%`;
    if (sliderEl) sliderEl.value = alloc[p];
  });
  const totalEl = container.querySelector('#alloc-total');
  const validation = validateAllocation(alloc);
  if (totalEl) {
    totalEl.textContent = `${validation.total}%`;
    totalEl.className = `alloc-total ${validation.status}`;
  }
}

function _renderEquipmentStep(container, state, callbacks) {
  const grouped = getEquipmentByCategory();
  const categoryNames = { signal: '📡 Signal', audio: '🎙 Audio', lighting: '💡 Rasveta', link: '🌐 Link', offgrid: '🔋 Off-grid' };

  container.innerHTML = `
    <div class="planning-step-header">
      <div class="step-number">3</div>
      <div class="step-title">Oprema Shop</div>
    </div>
    <div style="margin:4px 0 8px; font-family:var(--font-mono); font-size:0.85rem; color:var(--color-signal);">
      💰 ${formatCapital(state.capital)} raspoloživo
    </div>
    <div style="overflow-y:auto; max-height:60vh; display:flex; flex-direction:column; gap:12px;">
      ${Object.entries(grouped).map(([cat, items]) => `
        <div>
          <div class="value-label" style="margin-bottom:6px;">${categoryNames[cat] || cat}</div>
          <div class="equipment-grid">
            ${items.map(eq => `
              <div class="equipment-item ${eq.owned ? 'owned' : ''} ${!eq.canAfford && !eq.owned ? 'cant-afford' : ''}"
                   data-equip="${eq.id}">
                <span class="equipment-icon">${eq.icon}</span>
                <div class="equipment-info">
                  <div class="equipment-name">${eq.name}</div>
                  <div class="equipment-effect">${eq.effect}</div>
                  ${eq.requires && !state.equipment[eq.requires] ? `
                    <div style="font-size:0.65rem; color:var(--color-warn);">Zahteva prethodnu</div>
                  ` : ''}
                </div>
                <div class="equipment-cost">
                  ${eq.owned ? '✅' : formatCapital(eq.cost)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:8px;">
      <button class="btn btn-ghost btn-sm btn-full" id="skip-equip-btn">Preskoči →</button>
    </div>
  `;

  container.querySelectorAll('.equipment-item:not(.owned):not(.cant-afford)').forEach(item => {
    item.addEventListener('click', () => {
      const result = callbacks.onEquip(item.dataset.equip);
      if (result?.ok) {
        item.classList.add('owned', 'just-purchased');
        item.querySelector('.equipment-cost').textContent = '✅';
        // Refresh kapital display
        const kapEl = container.querySelector('[style*="raspoloživo"]');
        const newState = getState();
        if (kapEl) kapEl.textContent = `💰 ${formatCapital(newState.capital)} raspoloživo`;
      }
    });
  });

  const skipBtn = container.querySelector('#skip-equip-btn');
  if (skipBtn) skipBtn.addEventListener('click', callbacks.onNext);
}

function _renderGuestStep(container, draftPlan, state, callbacks) {
  const guests = getGuestBookingOptions(draftPlan.format);

  container.innerHTML = `
    <div class="planning-step-header">
      <div class="step-number">4</div>
      <div class="step-title">Gost Booking</div>
    </div>
    <div style="margin-top:12px;">
      <div class="guest-grid">
        ${guests.map(g => {
          const rel = formatReliability(g.reliability);
          return `
            <div class="guest-card ${draftPlan.chosen_guest_id === g.id ? 'selected' : ''}"
                 data-guest="${g.id}">
              <div class="flex-between">
                <span style="font-size:1.2rem;">${g.icon}</span>
                <span class="guest-reliability" style="color:${rel.color};">${rel.text}</span>
              </div>
              <div class="guest-name" style="margin-top:4px;">${g.name}</div>
              <div class="guest-noshow">No-show: ${g.noShowPct}%</div>
              <div class="guest-bonus">+${Math.round((g.engagementBonus || 0) * 100)}% engagement</div>
              ${g.isSolo ? `<div style="font-size:0.65rem; color:var(--color-crt);">Sigurni fallback</div>` : ''}
              ${g.recommended ? `<div style="font-size:0.65rem; color:var(--color-signal);">⭐ Preporučen</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.guest-card').forEach(card => {
    card.addEventListener('click', () => {
      callbacks.onGuest(card.dataset.guest);
      container.querySelectorAll('.guest-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

function _renderOffgridStep(container, draftPlan) {
  const state = getState();
  const capacity = draftPlan.weekly_capacity;
  const band = draftPlan.weather_band;

  container.innerHTML = `
    <div class="planning-step-header">
      <div class="step-number">5</div>
      <div class="step-title">Off-grid Potvrda</div>
    </div>
    <div style="margin-top:12px;">
      <div id="offgrid-final-preview"></div>

      <div class="panel" style="margin-top:12px;">
        <h3>Plan Sažetak</h3>
        <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
          <div class="flex-between">
            <span style="color:var(--color-text-dim);">Format</span>
            <span style="font-weight:600;">${FORMATS[draftPlan.format]?.name || draftPlan.format}</span>
          </div>
          <div class="flex-between">
            <span style="color:var(--color-text-dim);">IG/TT/YT</span>
            <span style="font-family:var(--font-mono);">${draftPlan.platform_alloc.ig}%/${draftPlan.platform_alloc.tiktok}%/${draftPlan.platform_alloc.youtube}%</span>
          </div>
          <div class="flex-between">
            <span style="color:var(--color-text-dim);">Kapital pre</span>
            <span style="font-family:var(--font-mono); color:var(--color-signal);">${formatCapital(state.capital)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:12px; text-align:center;">
        <div class="onair-indicator" style="justify-content:center; font-size:0.9rem;">
          <div class="onair-dot"></div>
          Spreman za emisiju
        </div>
      </div>
    </div>
  `;

  const previewContainer = container.querySelector('#offgrid-final-preview');
  if (previewContainer) {
    renderStaticCapacityPreview(previewContainer, capacity, band);
  }
}

// ===================== PRESTIGE SCREEN =====================

/**
 * Renderuje prestige ekran
 * @param {HTMLElement} screen
 * @param {Object} prestigeResult
 * @param {Function} onContinue
 */
export function renderPrestigeScreen(screen, prestigeResult, onContinue) {
  screen.innerHTML = `
    <div class="prestige-content">
      <div class="prestige-title">🔄 NOVA SEZONA</div>
      <div style="color:var(--color-text-dim); font-size:0.9rem;">Prestige ${prestigeResult.prestigeCount}</div>
      <div class="prestige-mult">${prestigeResult.multiplier.toFixed(2)}×</div>
      <p style="color:var(--color-text-dim);">
        Publikta pada na ${Math.round(prestigeResult.loyalCore.ig + prestigeResult.loyalCore.tiktok + prestigeResult.loyalCore.youtube)} lojalni core.
        Oprema ostaje. Multiplikator raste.
      </p>
      ${prestigeResult.capitalBonus > 0 ? `
        <div style="color:var(--color-crt); font-family:var(--font-mono);">+${formatCapital(prestigeResult.capitalBonus)} kapital bonus</div>
      ` : ''}
      <button class="btn btn-primary btn-lg" id="prestige-continue-btn">
        Nastavi Sezonu ${prestigeResult.prestigeCount + 1} →
      </button>
    </div>
  `;

  const contBtn = screen.querySelector('#prestige-continue-btn');
  if (contBtn) contBtn.addEventListener('click', onContinue);
}
