/**
 * planning-ui.js — Kompletan planning screen DOM
 * Season form, resource panel, curriculum builder, summary
 */

import { bus, EVT } from '../events.js';
import { getTema, getAvailableThemes, MASTERCLASS_CATALOG } from '../content/masterclass-catalog.js';
import { STAFF_LIST, getAvailableStaff } from './staff-roster.js';
import { generateDefaultPlan, generateOptimalPlan, validatePlan, scorePlan } from './curriculum-builder.js';
import { calcTicketPrice } from './pricing-engine.js';
import { calcCosts, calcProfit, calcSeasonBudget } from './budget.js';
import { rollWeather, getWeather, getCurrentSeason } from './weather.js';
import { formatEur, formatPct, el, clearEl, createEl } from '../utils.js';
import { ACTIVITY_TYPES, SESSION_SLOTS, MIN_PARTICIPANTS } from '../config.js';
import { getBrandLinkHTML } from '../content/brand-hooks.js';
import { generateApplicantPool } from './applicant-pool.js';
import { getSeasonLabel } from './calendar.js';

let _container = null;
let _state = null; // planning selections
let _meta = null;
let _macro = null;

/**
 * Mount planning screen
 * @param {HTMLElement} container
 * @param {Object} metaState
 * @param {Object} macroState
 */
export function mountPlanningUI(container, metaState, macroState) {
  _container = container;
  _meta = metaState;
  _macro = macroState;

  const rep = metaState.reputation || 0;
  const prestiz = metaState.prestigeLevel || 0;
  const maxParticipants = metaState.maxParticipants || MIN_PARTICIPANTS;
  const carryover = macroState.carryoverBudget || 0;
  const season = getCurrentSeason();
  const weatherId = rollWeather(season, Date.now());

  _state = {
    tema: null,
    participantCount: MIN_PARTICIPANTS,
    days: 1,
    hiredStaff: [],
    plan: generateDefaultPlan('suvozid'),
    weather: weatherId,
    candidates: generateApplicantPool(rep, maxParticipants, Date.now())
  };

  // Set first available tema
  const availableThemes = getAvailableThemes(rep, prestiz);
  if (availableThemes.length > 0) {
    _state.tema = availableThemes[0];
    _state.plan = generateDefaultPlan(_state.tema);
    _state.days = getTema(_state.tema)?.duration_days || 1;
  }

  render();
}

function render() {
  clearEl(_container);
  const rep = _meta.reputation || 0;
  const prestiz = _meta.prestigeLevel || 0;
  const availableThemes = getAvailableThemes(rep, prestiz);
  const seasonLabel = getSeasonLabel(_macro.currentSeason || 1, prestiz);

  const wrapper = createEl('div', 'planning-wrapper');
  wrapper.innerHTML = `
    <div class="planning-header">
      <h1 class="planning-title">Zemlja i Znanje</h1>
      <div class="planning-subtitle">${seasonLabel} — Planiranje masterclass-a</div>
      <div class="rep-display">Reputacija: <span class="rep-val">${Math.round(rep)}</span> / 1000</div>
    </div>
    <div class="planning-body">
      <div class="planning-left">
        ${renderThemeSelector(availableThemes, rep, prestiz)}
        ${renderParticipantSelector(rep)}
        ${renderStaffSelector(rep)}
        ${renderBudgetPreview(rep, prestiz)}
      </div>
      <div class="planning-right">
        ${renderCurriculumBuilder()}
        ${renderWeatherPanel()}
        <div class="planning-actions">
          <button id="btn-start-session" class="btn-primary btn-large">Pokreni Sesiju ▶</button>
          <button id="btn-planning-help" class="btn-secondary">Pomoć ?</button>
        </div>
        ${getBrandLinkHTML('small')}
      </div>
    </div>
  `;

  _container.appendChild(wrapper);
  bindEvents();
  refreshBudget();
}

function renderThemeSelector(availableThemes, rep, prestiz) {
  const themes = Object.values(MASTERCLASS_CATALOG);
  const items = themes.map(t => {
    const isAvailable = availableThemes.includes(t.id);
    const isSelected = _state.tema === t.id;
    const lockInfo = !isAvailable ? getLockInfo(t.unlock_rep) : '';
    return `<div class="theme-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'locked' : ''}"
               data-tema="${t.id}" ${!isAvailable ? 'title="' + lockInfo + '"' : ''}>
      <div class="theme-icon">${t.icon}</div>
      <div class="theme-info">
        <div class="theme-name">${t.name}</div>
        <div class="theme-desc">${t.description}</div>
        <div class="theme-meta">
          <span class="theme-days">📅 ${t.duration_days} ${t.duration_days === 1 ? 'dan' : 'dana'}</span>
          <span class="theme-complexity">${'★'.repeat(t.complexity)}</span>
        </div>
      </div>
      ${!isAvailable ? `<div class="theme-lock">🔒 ${lockInfo}</div>` : ''}
    </div>`;
  }).join('');

  return `<div class="section-card">
    <h3 class="section-title">Tema Masterclass-a</h3>
    <div class="theme-grid">${items}</div>
  </div>`;
}

function getLockInfo(unlock_rep) {
  if (typeof unlock_rep === 'number') return `${unlock_rep} rep`;
  if (unlock_rep === 'prestige_2') return 'Prestiž 2';
  if (unlock_rep === 'prestige_5') return 'Prestiž 5';
  return 'Zaključano';
}

function renderParticipantSelector(rep) {
  const max = _meta.maxParticipants || MIN_PARTICIPANTS;
  const count = _state.participantCount;

  const archetypeHTML = _state.candidates.slice(0, 8).map((p, i) => {
    const isSelected = i < count;
    return `<div class="candidate-card ${isSelected ? 'selected' : ''}" data-candidate="${i}">
      <span class="candidate-portrait">${p.portrait}</span>
      <span class="candidate-name">${p.name}</span>
      <div class="candidate-stats">
        <span title="Energija" class="mini-bar energy-bar" style="width:${p.energy}%"></span>
      </div>
    </div>`;
  }).join('');

  return `<div class="section-card">
    <h3 class="section-title">Polaznici <span class="count-badge">${count}/${max}</span></h3>
    <div class="participant-controls">
      <button class="btn-count" id="btn-dec-participants">−</button>
      <span class="count-display">${count}</span>
      <button class="btn-count" id="btn-inc-participants">+</button>
    </div>
    <div class="candidates-grid">${archetypeHTML}</div>
  </div>`;
}

function renderStaffSelector(rep) {
  const available = getAvailableStaff(_meta.unlockedStaff || ['alatko']);
  const items = available.map(s => {
    const isHired = _state.hiredStaff.includes(s.id);
    return `<div class="staff-card ${isHired ? 'hired' : ''}" data-staff="${s.id}">
      <span class="staff-emoji">${s.emoji}</span>
      <div class="staff-info">
        <div class="staff-name">${s.name}</div>
        <div class="staff-role">${s.role}</div>
        <div class="staff-desc">${s.description}</div>
        <div class="staff-cost">${formatEur(s.daily_cost)} / dan</div>
      </div>
      <div class="staff-toggle">${isHired ? '✓ Angažovan' : '+ Angažuj'}</div>
    </div>`;
  }).join('');

  return `<div class="section-card">
    <h3 class="section-title">Stručnjaci</h3>
    <div class="staff-list">${items}</div>
  </div>`;
}

function renderBudgetPreview() {
  return `<div class="section-card budget-preview" id="budget-preview">
    <h3 class="section-title">Finansijski pregled</h3>
    <div class="budget-rows" id="budget-rows">
      <!-- populated by refreshBudget() -->
    </div>
  </div>`;
}

function renderCurriculumBuilder() {
  const plan = _state.plan;
  const actTypes = Object.values(ACTIVITY_TYPES);

  const slots = plan.map((slot, i) => {
    const act = ACTIVITY_TYPES[slot.activity] || ACTIVITY_TYPES.teorija;
    const timeLabel = `${8 + i}:00`;
    return `<div class="timeline-slot${slot.locked ? ' locked' : ''}" data-slot="${i}"
                 draggable="${!slot.locked}" style="border-left-color:${act.color}">
      <div class="slot-time">${timeLabel}</div>
      <div class="slot-activity">
        <span class="slot-icon">${act.icon}</span>
        <span class="slot-name">${act.name}</span>
      </div>
      ${slot.locked ? '<span class="slot-lock">🔒</span>' : ''}
    </div>`;
  }).join('');

  const actButtons = actTypes.map(act =>
    `<button class="act-btn" data-activity="${act.id}" style="background:${act.bg}; border-color:${act.color}">
      ${act.icon} ${act.name}
    </button>`
  ).join('');

  return `<div class="section-card">
    <h3 class="section-title">Raspored Sesije</h3>
    <div class="curriculum-info">Klikni slot, pa odaberi aktivnost. Evaluacija je fiksirana na kraju.</div>
    <div class="timeline-builder" id="timeline-builder">${slots}</div>
    <div class="activity-palette" id="activity-palette">${actButtons}</div>
    <div class="plan-validation" id="plan-validation"></div>
  </div>`;
}

function renderWeatherPanel() {
  const w = getWeather(_state.weather);
  return `<div class="section-card weather-panel">
    <h3 class="section-title">Prognoza</h3>
    <div class="weather-display">
      <span class="weather-icon">${w.icon}</span>
      <span class="weather-name">${w.name}</span>
      <span class="weather-effect">${w.outdoor_bonus >= 0 ? '+' : ''}${w.outdoor_bonus} zadovoljstvo outdoor</span>
    </div>
  </div>`;
}

function bindEvents() {
  // Theme selection
  _container.querySelectorAll('.theme-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      const temaId = card.dataset.tema;
      _state.tema = temaId;
      const temaData = getTema(temaId);
      _state.days = temaData?.duration_days || 1;
      _state.plan = generateDefaultPlan(temaId);
      render();
    });
  });

  // Participant controls
  const btnDec = el('#btn-dec-participants', _container);
  const btnInc = el('#btn-inc-participants', _container);
  if (btnDec) btnDec.addEventListener('click', () => {
    _state.participantCount = Math.max(MIN_PARTICIPANTS, _state.participantCount - 1);
    render();
  });
  if (btnInc) btnInc.addEventListener('click', () => {
    const max = _meta.maxParticipants || MIN_PARTICIPANTS;
    _state.participantCount = Math.min(max, _state.participantCount + 1);
    render();
  });

  // Staff toggle
  _container.querySelectorAll('.staff-card').forEach(card => {
    card.addEventListener('click', () => {
      const staffId = card.dataset.staff;
      if (_state.hiredStaff.includes(staffId)) {
        _state.hiredStaff = _state.hiredStaff.filter(s => s !== staffId);
      } else {
        _state.hiredStaff.push(staffId);
      }
      render();
    });
  });

  // Timeline builder — click slot then activity
  let _selectedSlot = null;

  _container.querySelectorAll('.timeline-slot:not(.locked)').forEach(slot => {
    slot.addEventListener('click', () => {
      _container.querySelectorAll('.timeline-slot').forEach(s => s.classList.remove('active-slot'));
      slot.classList.add('active-slot');
      _selectedSlot = parseInt(slot.dataset.slot);
    });
  });

  _container.querySelectorAll('.act-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_selectedSlot === null) {
        bus.emit(EVT.TOAST, { msg: 'Klikni slot pa aktivnost.', type: 'info' });
        return;
      }
      const actId = btn.dataset.activity;
      const slot = _state.plan[_selectedSlot];
      if (slot && !slot.locked) {
        slot.activity = actId;
        refreshTimeline();
        refreshValidation();
        refreshBudget();
      }
      _selectedSlot = null;
    });
  });

  // Start session
  const btnStart = el('#btn-start-session', _container);
  if (btnStart) btnStart.addEventListener('click', () => {
    if (!_state.tema) {
      bus.emit(EVT.TOAST, { msg: 'Odaberi temu.', type: 'warning' });
      return;
    }
    const validation = validatePlan(_state.plan);
    if (!validation.valid) {
      bus.emit(EVT.TOAST, { msg: validation.errors[0], type: 'warning' });
      return;
    }
    bus.emit(EVT.MACRO_PLAN_CONFIRM, {
      tema: _state.tema,
      participantCount: _state.participantCount,
      days: _state.days,
      hiredStaff: _state.hiredStaff,
      plan: _state.plan,
      weather: _state.weather,
      candidates: _state.candidates.slice(0, _state.participantCount)
    });
  });

  // Help
  const btnHelp = el('#btn-planning-help', _container);
  if (btnHelp) btnHelp.addEventListener('click', () => {
    bus.emit(EVT.MODAL_OPEN, { type: 'help', title: 'Kako planirati sesiju?',
      content: `<p>1. Odaberi temu masterclass-a</p>
               <p>2. Postavi broj polaznika (4-${_meta.maxParticipants || 4})</p>
               <p>3. Angažuj stručnjake ako imaš budžet</p>
               <p>4. Složi raspored sesije — Evaluacija mora biti poslednji slot</p>
               <p>5. Pokreni sesiju!</p>` });
  });

  refreshValidation();
}

function refreshTimeline() {
  const builder = el('#timeline-builder', _container);
  if (!builder) return;

  builder.querySelectorAll('.timeline-slot:not(.locked)').forEach((slotEl, i) => {
    const slot = _state.plan[i];
    if (!slot || slot.locked) return;
    const act = ACTIVITY_TYPES[slot.activity] || ACTIVITY_TYPES.teorija;
    slotEl.style.borderLeftColor = act.color;
    const nameEl = slotEl.querySelector('.slot-name');
    const iconEl = slotEl.querySelector('.slot-icon');
    if (nameEl) nameEl.textContent = act.name;
    if (iconEl) iconEl.textContent = act.icon;
  });
}

function refreshValidation() {
  const validationEl = el('#plan-validation', _container);
  if (!validationEl) return;

  const { valid, errors } = validatePlan(_state.plan);
  if (valid) {
    const score = scorePlan(_state.plan);
    validationEl.innerHTML = `<span class="plan-ok">✓ Plan validan — Kvalitet: ${score}/100</span>`;
    validationEl.className = 'plan-validation valid';
  } else {
    validationEl.innerHTML = `<span class="plan-error">⚠ ${errors[0]}</span>`;
    validationEl.className = 'plan-validation invalid';
  }
}

function refreshBudget() {
  const rowsEl = el('#budget-rows', _container);
  if (!rowsEl || !_state.tema) return;

  const rep = _meta.reputation || 0;
  const prestiz = _meta.prestigeLevel || 0;
  const price = calcTicketPrice(_state.tema, rep, prestiz);
  const income = _state.participantCount * price;
  const hasCana = _state.hiredStaff.includes('cana');
  const costs = calcCosts({
    days: _state.days,
    participants: _state.participantCount,
    hasStaff: _state.hiredStaff.length > 0,
    staffCount: _state.hiredStaff.length,
    hasCana
  });
  const profit = income - costs.total;
  const carryover = Math.round(Math.max(0, profit * 0.30));
  const budgetAvailable = calcSeasonBudget(rep) + (_macro.carryoverBudget || 0);

  rowsEl.innerHTML = `
    <div class="budget-row"><span>Cena ulaznice:</span><span class="val">${formatEur(price)} / pers.</span></div>
    <div class="budget-row income"><span>Prihodi (${_state.participantCount}×):</span><span class="val positive">+ ${formatEur(income)}</span></div>
    <div class="budget-row"><span>Materijali:</span><span class="val negative">- ${formatEur(costs.materijali)}</span></div>
    <div class="budget-row"><span>Hrana:</span><span class="val negative">- ${formatEur(costs.hrana)}</span></div>
    ${costs.honorar ? `<div class="budget-row"><span>Honorari:</span><span class="val negative">- ${formatEur(costs.honorar)}</span></div>` : ''}
    <div class="budget-row total"><span>Profit:</span><span class="val ${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}${formatEur(profit)}</span></div>
    <div class="budget-row"><span>Carry-over:</span><span class="val">${formatEur(carryover)}</span></div>
    <div class="budget-row budget-available"><span>Budžet dostupan:</span><span class="val">${formatEur(budgetAvailable)}</span></div>
  `;
}
