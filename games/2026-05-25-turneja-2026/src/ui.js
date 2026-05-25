// ui.js — All DOM screen renderers

import { CITIES, ROLES, ROLE_ICONS, BOOKING_TIERS, PROMO_OPTIONS, CREW_ACTIONS } from './config.js';
import { renderCardDOM } from './entities/crew_card.js';
import { onTap, makeAllTapReady } from './input.js';
import { AVALA_CTA, CITY_FLAVOR, BLOCK_FLAVOR, TUTORIAL_STEPS, GAMEOVER_MESSAGES } from './content/brand_hooks.js';
import { createShareButton, openAvalaTickets } from './share.js';
import { loadDailyHighscore, formatScore } from './systems/highscore.js';

const app = document.getElementById('app');

function clearApp() {
  app.innerHTML = '';
}

function makeScreen(className) {
  const div = document.createElement('div');
  div.className = `screen ${className}`;
  const inner = document.createElement('div');
  inner.className = 'screen-inner';
  div.appendChild(inner);
  return { screen: div, inner };
}

// ===================== START SCREEN =====================
export function showStart(onNewGame, onContinue, hasSave) {
  clearApp();
  const hs = loadDailyHighscore();
  const el = document.createElement('div');
  el.className = 'start-screen';

  const cities = CITIES.map(c => `<span class="city-dot">${c.icon} ${c.name}</span>`).join('');

  el.innerHTML = `
    <div>
      <div class="start-logo">KLUBOSLAVIJA</div>
      <div style="color:var(--color-accent);font-size:var(--font-size-lg);margin-top:8px;letter-spacing:0.1em;">TURNEJA 2026</div>
    </div>
    <div class="start-tagline">Pet gradova. Jedan bus.<br>Ti si menadžer.</div>
    <div class="start-cities">${cities}</div>
    ${hs.score > 0 ? `<div class="start-highscore">🏆 BEST TODAY: ${formatScore(hs.score)} FANS ${hs.city ? `· ${hs.city}` : ''}</div>` : ''}
    <div class="start-actions" id="start-actions"></div>
    <div style="color:var(--color-text-muted);font-size:var(--font-size-xs);text-align:center;margin-top:8px;">
      Avala 20. jun 2026 · Kluboslavija
    </div>
  `;

  app.appendChild(el);

  const actions = el.querySelector('#start-actions');

  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn-primary btn-lg';
  newBtn.textContent = '▶ NOVA TURNEJA';
  onTap(newBtn, onNewGame);
  actions.appendChild(newBtn);

  if (hasSave) {
    const contBtn = document.createElement('button');
    contBtn.className = 'btn btn-accent';
    contBtn.textContent = '↩ NASTAVI';
    onTap(contBtn, onContinue);
    actions.appendChild(contBtn);
  }

  const ticketBtn = document.createElement('button');
  ticketBtn.className = 'btn btn-ghost btn-sm';
  ticketBtn.textContent = '🎟️ ' + AVALA_CTA.label;
  onTap(ticketBtn, openAvalaTickets);
  actions.appendChild(ticketBtn);

  makeAllTapReady(el);
}

// ===================== TUTORIAL =====================
export function showTutorial(step, deck, onNext, onSkip) {
  clearApp();
  const stepData = TUTORIAL_STEPS[step] || TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1];
  const isLast = step >= TUTORIAL_STEPS.length - 1;

  const overlay = document.createElement('div');
  overlay.className = 'screen';
  overlay.style.background = 'var(--color-bg)';
  overlay.style.overflowY = 'auto';

  const inner = document.createElement('div');
  inner.className = 'screen-inner';
  inner.style.paddingBottom = '160px';

  // Header
  const header = document.createElement('div');
  header.innerHTML = `
    <div style="text-align:center;padding:var(--spacing-md) 0;">
      <div style="color:var(--color-accent);font-size:var(--font-size-xs);text-transform:uppercase;letter-spacing:0.1em;">TUTORIAL — AVALA PROBA</div>
      <div style="color:var(--color-primary);font-size:var(--font-size-xl);margin-top:8px;">${stepData.title}</div>
    </div>
  `;
  inner.appendChild(header);

  // Progress dots
  const dotsEl = document.createElement('div');
  dotsEl.className = 'tutorial-progress';
  TUTORIAL_STEPS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `tutorial-dot ${i < step ? 'done' : i === step ? 'active' : ''}`;
    dotsEl.appendChild(dot);
  });
  inner.appendChild(dotsEl);

  // Card display (highlight relevant role)
  const cardGrid = document.createElement('div');
  cardGrid.className = 'deck-hand';
  cardGrid.style.maxWidth = '300px';
  cardGrid.style.margin = '0 auto';

  deck.forEach(card => {
    const isHighlighted = stepData.role && card.role === stepData.role;
    const cardEl = renderCardDOM(card, null, {
      highlight: isHighlighted ? 'synergy' : null
    });
    if (isHighlighted) {
      cardEl.style.transform = 'scale(1.1)';
    }
    cardGrid.appendChild(cardEl);
  });
  inner.appendChild(cardGrid);

  // Tooltip text
  const tooltip = document.createElement('div');
  tooltip.className = 'tutorial-tooltip';
  tooltip.style.margin = '0 auto';
  tooltip.style.maxWidth = '360px';
  tooltip.innerHTML = `
    <div class="tutorial-step-label">Korak ${step + 1} / ${TUTORIAL_STEPS.length}</div>
    <div class="tutorial-text">${stepData.text}</div>
  `;

  const nextBtn = document.createElement('button');
  nextBtn.className = `btn ${isLast ? 'btn-primary' : 'btn-accent'}`;
  nextBtn.textContent = isLast ? '🚀 KRENI NA AVALU!' : 'Sledeće →';
  onTap(nextBtn, onNext);
  tooltip.appendChild(nextBtn);

  if (!isLast && step === 0) {
    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn btn-ghost btn-sm';
    skipBtn.style.marginTop = '8px';
    skipBtn.textContent = 'Preskoči tutorial';
    onTap(skipBtn, onSkip || onNext);
    tooltip.appendChild(skipBtn);
  }

  inner.appendChild(tooltip);
  overlay.appendChild(inner);
  app.appendChild(overlay);
  makeAllTapReady(overlay);
}

// ===================== MACRO HQ =====================
export function showMacroHQ(state, offers, callbacks) {
  clearApp();
  const t = state.tourney;
  const cityIdx = t.current_city_index || 0;
  const nextCity = CITIES[Math.min(cityIdx, CITIES.length - 1)];
  const isFirst = t.completed_events.length === 0 && cityIdx === 0;

  const { screen, inner } = makeScreen('macro-screen');

  // HUD
  inner.appendChild(buildHud(t));

  // City banner for next event
  const banner = document.createElement('div');
  banner.className = 'city-banner';
  banner.innerHTML = `
    <div style="font-size:32px;">${nextCity.icon}</div>
    <div class="city-name">${nextCity.name}</div>
    <div class="city-date">${nextCity.date} 2026</div>
    <div class="city-modifier">+${nextCity.modifier.replace(/_/g, ' ')}</div>
  `;
  inner.appendChild(banner);

  // Booking section
  const bookingSect = document.createElement('div');
  bookingSect.innerHTML = `<div class="section-header">DJ Booking</div>`;
  inner.appendChild(bookingSect);

  const bookingList = document.createElement('div');
  bookingList.className = 'booking-list';
  let selectedBooking = state.macro_choices?.booking?.id || null;

  offers.forEach(offer => {
    const card = document.createElement('div');
    card.className = `booking-card ${selectedBooking === offer.id ? 'selected' : ''}`;
    card.dataset.id = offer.id;
    const affordable = t.budget >= offer.cost;

    card.innerHTML = `
      <div class="booking-tier">Tier ${offer.tier} ${['', '⭐', '⭐⭐', '⭐⭐⭐'][offer.tier]}</div>
      <div class="booking-name">${offer.offerName || offer.name}</div>
      <div class="booking-stats">
        <span class="booking-stat">Hype: <span>+${Math.round(offer.hypeBonus * 100)}%</span></span>
        <span class="booking-stat">Morale: <span>+${offer.moraleBonus}</span></span>
        <span class="booking-stat">Rizik: <span>${Math.round(offer.equipRisk * 100)}%</span></span>
      </div>
      <div class="booking-cost ${affordable ? 'affordable' : ''}">${affordable ? '' : '⚠ '}${offer.cost.toLocaleString()} RSD</div>
      <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:4px;">${offer.desc}</div>
    `;

    if (!affordable) card.style.opacity = '0.5';

    onTap(card, () => {
      if (!affordable) return;
      selectedBooking = offer.id;
      bookingList.querySelectorAll('.booking-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (callbacks.onBookingSelect) callbacks.onBookingSelect(offer);
      updateBudgetSummary();
      if (callbacks.audio) callbacks.audio.playDJ_booking();
    });

    bookingList.appendChild(card);
  });
  inner.appendChild(bookingList);

  // Promo section
  const promoSect = document.createElement('div');
  promoSect.innerHTML = `<div class="section-header">Promocija</div>`;
  inner.appendChild(promoSect);

  const promoGrid = document.createElement('div');
  promoGrid.className = 'promo-grid';
  let selectedPromo = 'none';

  PROMO_OPTIONS.forEach(promo => {
    const card = document.createElement('div');
    card.className = `promo-card ${selectedPromo === promo.id ? 'selected' : ''}`;
    card.dataset.id = promo.id;
    const affordable = t.budget >= promo.cost;

    card.innerHTML = `
      <div class="promo-name">${promo.name}</div>
      <div class="promo-cost">${promo.cost > 0 ? `-${promo.cost.toLocaleString()}` : 'Besplatno'}</div>
      ${promo.fanPre > 0 ? `<div class="promo-bonus">+${promo.fanPre} fans</div>` : ''}
      ${promo.mediaBonus > 0 ? `<div class="promo-bonus">+${Math.round(promo.mediaBonus*100)}% media</div>` : ''}
    `;

    if (promo.cost > 0 && !affordable) card.style.opacity = '0.5';

    onTap(card, () => {
      if (promo.cost > 0 && !affordable) return;
      selectedPromo = promo.id;
      promoGrid.querySelectorAll('.promo-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (callbacks.onPromoSelect) callbacks.onPromoSelect(promo);
      updateBudgetSummary();
    });

    promoGrid.appendChild(card);
  });
  inner.appendChild(promoGrid);

  // Crew actions
  const crewSect = document.createElement('div');
  crewSect.innerHTML = `<div class="section-header">Crew Akcija</div>`;
  inner.appendChild(crewSect);

  const crewGrid = document.createElement('div');
  crewGrid.className = 'crew-actions';
  let selectedCrew = 'none';

  CREW_ACTIONS.forEach(action => {
    const card = document.createElement('div');
    card.className = `crew-action-card ${selectedCrew === action.id ? 'selected' : ''}`;
    const affordable = t.budget >= action.cost;

    card.innerHTML = `
      <div style="font-size:var(--font-size-sm);color:var(--color-text);text-transform:uppercase;">${action.name}</div>
      <div style="font-size:var(--font-size-xs);color:var(--color-danger);">${action.cost > 0 ? `-${action.cost.toLocaleString()}` : 'Besplatno'}</div>
      <div style="font-size:var(--font-size-xs);color:var(--color-success);">${action.moraleBonus ? `+${action.moraleBonus} morale` : action.revenueBonus ? `+${Math.round(action.revenueBonus*100)}% revenue` : ''}</div>
    `;

    if (action.cost > 0 && !affordable) card.style.opacity = '0.5';

    onTap(card, () => {
      if (action.cost > 0 && !affordable) return;
      selectedCrew = action.id;
      crewGrid.querySelectorAll('.crew-action-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (callbacks.onCrewAction) callbacks.onCrewAction(action);
      updateBudgetSummary();
    });

    crewGrid.appendChild(card);
  });
  inner.appendChild(crewGrid);

  // Budget summary
  const budgetWrap = document.createElement('div');
  budgetWrap.id = 'budget-summary';
  inner.appendChild(budgetWrap);

  function updateBudgetSummary() {
    const booking = BOOKING_TIERS.find(b => b.id === selectedBooking) || { cost: 0 };
    const promo = PROMO_OPTIONS.find(p => p.id === selectedPromo) || { cost: 0 };
    const crew = CREW_ACTIONS.find(a => a.id === selectedCrew) || { cost: 0 };
    const totalCost = (booking.cost || 0) + (promo.cost || 0) + (crew.cost || 0);
    const after = t.budget - totalCost;

    const cls = after < 2000 ? 'danger' : after < 5000 ? 'warn' : '';

    budgetWrap.innerHTML = `
      <div class="budget-summary">
        <div class="budget-row"><span>Budžet pre</span><span>${t.budget.toLocaleString()} RSD</span></div>
        ${booking.cost ? `<div class="budget-row"><span>DJ booking</span><span style="color:var(--color-danger)">-${booking.cost.toLocaleString()}</span></div>` : ''}
        ${promo.cost ? `<div class="budget-row"><span>Promo</span><span style="color:var(--color-danger)">-${promo.cost.toLocaleString()}</span></div>` : ''}
        ${crew.cost ? `<div class="budget-row"><span>Crew akcija</span><span style="color:var(--color-danger)">-${crew.cost.toLocaleString()}</span></div>` : ''}
        <div class="budget-row"><span>Posle HQ</span><span class="budget-after ${cls}">${after.toLocaleString()} RSD</span></div>
      </div>
    `;
  }
  updateBudgetSummary();

  // Confirm button
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary btn-lg';
  confirmBtn.textContent = `▶ KRENI NA ${nextCity.name.toUpperCase()}`;
  onTap(confirmBtn, () => {
    if (!selectedBooking) {
      showToast('Izaberi DJ booking!');
      return;
    }
    const booking = BOOKING_TIERS.find(b => b.id === selectedBooking);
    const promo = PROMO_OPTIONS.find(p => p.id === selectedPromo);
    const crewAction = CREW_ACTIONS.find(a => a.id === selectedCrew);
    if (callbacks.onConfirm) callbacks.onConfirm({ booking, promo, crewAction });
  });
  inner.appendChild(confirmBtn);

  app.appendChild(screen);
  makeAllTapReady(screen);
}

// ===================== EVENT INTRO =====================
export function showEventIntro(city, preboostFans, onStart) {
  clearApp();
  const { screen, inner } = makeScreen('');

  const cont = document.createElement('div');
  cont.className = 'event-intro';

  const flavor = CITY_FLAVOR[city.id] || city.name;

  cont.innerHTML = `
    <div style="text-align:center;color:var(--color-text-muted);font-size:var(--font-size-xs);text-transform:uppercase;letter-spacing:0.1em;">Sledeći event</div>
    <div class="event-city-card">
      <span class="event-city-icon">${city.icon}</span>
      <div class="event-city-title">${city.name}</div>
      <div class="event-city-subtitle">${city.date} 2026</div>
      <div style="height:1px;background:rgba(255,255,255,0.1);margin:12px 0;"></div>
      <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);text-align:left;line-height:1.6;">${flavor}</div>
      <div class="event-bonus-list">
        <div class="event-bonus-item">❆ ${city.modifier.replace(/_/g, ' ')}</div>
        ${preboostFans > 0 ? `<div class="event-bonus-item">❆ +${preboostFans} fans (promo preboost)</div>` : ''}
      </div>
    </div>
    <div style="text-align:center;">
      <div style="color:var(--color-text-muted);font-size:var(--font-size-xs);margin-bottom:8px;">3 BLOKA · OPEN · PEAK · CLOSE</div>
    </div>
  `;

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-primary btn-lg';
  startBtn.style.width = '100%';
  startBtn.style.maxWidth = '320px';
  startBtn.textContent = `▶ POČNI EVENT`;
  onTap(startBtn, onStart);
  cont.appendChild(startBtn);

  inner.appendChild(cont);
  app.appendChild(screen);
  makeAllTapReady(screen);
}

// ===================== BLOCK PHASE =====================
export function showBlockPhase(blockIndex, state, callbacks) {
  clearApp();
  const t = state.tourney;
  const es = state.event_state;
  const city = CITIES.find(c => c.id === t.current_city) || CITIES[0];

  const BLOCK_NAMES = ['OPEN', 'PEAK', 'CLOSE'];
  const BLOCK_TIMES = ['22:00', '01:00', '04:00'];
  const BPM_PER_BLOCK = [90, 115, 130];

  const blockEl = document.createElement('div');
  blockEl.className = 'block-screen screen';
  blockEl.id = 'block-screen';

  // Block header
  const headerEl = document.createElement('div');
  headerEl.className = 'block-header';
  headerEl.innerHTML = `
    <div>
      <div class="block-title">${BLOCK_NAMES[blockIndex]} SET</div>
      <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${city.icon} ${city.name}</div>
    </div>
    <div>
      <div class="block-time">${BLOCK_TIMES[blockIndex]}</div>
      <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">BPM ${BPM_PER_BLOCK[blockIndex]}</div>
    </div>
  `;
  blockEl.appendChild(headerEl);

  // Block progress pips
  const pipsEl = document.createElement('div');
  pipsEl.className = 'block-progress-bar';
  for (let i = 0; i < 3; i++) {
    const pip = document.createElement('div');
    pip.className = `block-pip ${i < blockIndex ? 'done' : i === blockIndex ? 'active' : ''}`;
    pipsEl.appendChild(pip);
  }
  blockEl.appendChild(pipsEl);

  // Canvas
  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'game-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.id = 'block-canvas';
  canvas.style.width = '100%';
  canvas.style.display = 'block';
  canvasWrap.appendChild(canvas);
  blockEl.appendChild(canvasWrap);

  // Fan meter
  const fanMeter = document.createElement('div');
  fanMeter.className = 'fan-meter-wrap';
  const fanScore = es.fan_score || 0;
  const maxFans = 2000;
  const fanRatio = Math.min(fanScore / maxFans, 1);
  const fanClass = fanRatio < 0.3 ? 'low' : fanRatio < 0.6 ? 'med' : fanRatio < 0.9 ? 'high' : 'max';
  fanMeter.innerHTML = `
    <div class="fan-meter-header">
      <span class="fan-meter-label">Fans total</span>
      <span class="fan-meter-value">${(t.fan_base + fanScore).toLocaleString()}</span>
    </div>
    <div class="fan-meter-track">
      <div class="fan-meter-fill ${fanClass}" style="width:${fanRatio * 100}%;"></div>
    </div>
  `;
  blockEl.appendChild(fanMeter);

  // Deck area
  const deckArea = document.createElement('div');
  deckArea.className = 'deck-area';

  // Slot area (selected cards go here)
  const slotLabel = document.createElement('div');
  slotLabel.className = 'deck-label';
  slotLabel.textContent = `Blok ${BLOCK_NAMES[blockIndex]}: izaberi 1-3 karte`;
  deckArea.appendChild(slotLabel);

  // Synergy display
  const synergyDisplay = document.createElement('div');
  synergyDisplay.id = 'synergy-display';
  synergyDisplay.style.minHeight = '24px';
  deckArea.appendChild(synergyDisplay);

  // Hand
  const handLabel = document.createElement('div');
  handLabel.className = 'deck-label';
  handLabel.style.marginTop = '8px';
  handLabel.textContent = 'Tvoja ruka:';
  deckArea.appendChild(handLabel);

  const hand = document.createElement('div');
  hand.className = 'deck-hand';
  deckArea.appendChild(hand);

  // Selection state
  let selectedCards = [];
  const deck = state.event_state.deck || [];

  function updateSynergyDisplay() {
    if (selectedCards.length < 2) {
      synergyDisplay.innerHTML = '';
      return;
    }
    // Inline synergy check to avoid circular import in ui
    if (callbacks.getSynergies) {
      const result = callbacks.getSynergies(selectedCards);
      let html = '';
      result.bonuses.forEach(b => {
        html += `<div class="synergy-info">${b.key}: ${b.desc}</div>`;
      });
      result.penalties.forEach(p => {
        html += `<div class="contra-info">${p.key}: ${p.desc}</div>`;
      });
      synergyDisplay.innerHTML = html || '';
      if (result.bonuses.length > 0 && callbacks.onSynergySound) callbacks.onSynergySound();
    }
  }

  function renderHand() {
    hand.innerHTML = '';
    deck.forEach(card => {
      const isSelected = selectedCards.some(c => c.id === card.id);
      const cardEl = renderCardDOM(card, (c) => {
        if (isSelected) {
          selectedCards = selectedCards.filter(sc => sc.id !== c.id);
        } else if (selectedCards.length < 3) {
          selectedCards.push(c);
        } else {
          showToast('Max 3 karte po bloku');
          return;
        }
        renderHand();
        updateSynergyDisplay();
        updatePlayBtn();
      }, { selected: isSelected });
      hand.appendChild(cardEl);
    });
  }

  renderHand();

  // Selection count
  const countEl = document.createElement('div');
  countEl.className = 'selection-count';
  countEl.id = 'selection-count';
  countEl.innerHTML = `Izabrano: <span>0</span>/3`;
  deckArea.appendChild(countEl);

  // Play button
  const playBtn = document.createElement('button');
  playBtn.className = 'btn btn-primary btn-lg';
  playBtn.id = 'play-btn';
  playBtn.textContent = `▶ ODIGRAJ ${BLOCK_NAMES[blockIndex]}`;
  playBtn.disabled = true;
  onTap(playBtn, () => {
    if (selectedCards.length === 0) {
      showToast('Izaberi barem 1 kartu!');
      return;
    }
    if (callbacks.onPlay) callbacks.onPlay(selectedCards, blockIndex);
  });
  deckArea.appendChild(playBtn);

  function updatePlayBtn() {
    const countSpan = countEl.querySelector('span');
    if (countSpan) countSpan.textContent = selectedCards.length;
    playBtn.disabled = selectedCards.length === 0;
    playBtn.textContent = selectedCards.length > 0
      ? `▶ ODIGRAJ ${BLOCK_NAMES[blockIndex]} (${selectedCards.length})`
      : `▶ ODIGRAJ ${BLOCK_NAMES[blockIndex]}`;
  }

  blockEl.appendChild(deckArea);

  // HUD mini (morale)
  const moraleWrap = document.createElement('div');
  moraleWrap.style.padding = '8px 16px 16px';
  moraleWrap.innerHTML = buildMoraleBar(t.crew_morale);
  blockEl.appendChild(moraleWrap);

  app.appendChild(blockEl);

  // Init canvas
  const W = blockEl.clientWidth || 375;
  canvas.width = W;
  canvas.height = 140;

  if (callbacks.onCanvasReady) callbacks.onCanvasReady(canvas, blockIndex);

  makeAllTapReady(blockEl);
  return blockEl;
}

// ===================== RISK WARNING =====================
export function showRiskWarning(riskInfo, onContinue) {
  clearApp();
  const el = document.createElement('div');
  el.className = 'screen';
  el.style.background = 'var(--color-bg)';

  const inner = document.createElement('div');
  inner.className = 'risk-overlay';
  inner.style.position = 'relative';
  inner.style.inset = 'auto';
  inner.style.minHeight = '100vh';

  inner.innerHTML = `
    <div class="risk-icon">${riskInfo.icon || '⚠️'}</div>
    <div class="risk-type-label">RIZIK: ${riskInfo.label || 'Nepoznato'}</div>
    <div class="risk-description">Event rizik je otkriven. Prilagodi svoju ruku pre bloka.</div>
    <div class="risk-tip">💡 Mitiga: ${riskInfo.mitigates || '?'} karta</div>
    <div class="risk-countdown" id="risk-countdown">5</div>
  `;

  let count = 5;
  const countdownEl = inner.querySelector('#risk-countdown');
  const interval = setInterval(() => {
    count--;
    if (countdownEl) countdownEl.textContent = String(count);
    if (count <= 0) {
      clearInterval(interval);
      onContinue();
    }
  }, 1000);

  const skipBtn = document.createElement('button');
  skipBtn.className = 'btn btn-accent';
  skipBtn.textContent = 'Razumeo — NASTAVI';
  onTap(skipBtn, () => {
    clearInterval(interval);
    onContinue();
  });
  inner.appendChild(skipBtn);

  el.appendChild(inner);
  app.appendChild(el);
  makeAllTapReady(el);
}

// ===================== BLOCK RESULT =====================
export function showBlockResult(blockIndex, score, synergies, eventResult, onNext) {
  clearApp();
  const BLOCK_NAMES = ['OPEN', 'PEAK', 'CLOSE'];
  const { screen, inner } = makeScreen('');

  const cont = document.createElement('div');
  cont.className = 'block-result';

  let html = `
    <div style="text-align:center;color:var(--color-text-muted);font-size:var(--font-size-xs);text-transform:uppercase;">Blok rezultat — ${BLOCK_NAMES[blockIndex]}</div>
    <div>
      <div class="result-score">+${score.fan_gain.toLocaleString()}</div>
      <div class="result-score-label">novih fanova</div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Fans</div><div class="stat-value" style="color:var(--color-primary);">+${score.fan_gain}</div></div>
      <div class="stat-card"><div class="stat-label">Revenue</div><div class="stat-value" style="color:var(--color-success);">+${score.revenue_gain}</div></div>
      <div class="stat-card"><div class="stat-label">Media</div><div class="stat-value" style="color:var(--color-accent);">+${score.media_gain}</div></div>
      <div class="stat-card"><div class="stat-label">Morale</div><div class="stat-value" style="color:${score.morale_delta >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${score.morale_delta >= 0 ? '+' : ''}${score.morale_delta}</div></div>
    </div>
  `;
  cont.innerHTML = html;

  // Synergies display
  if (synergies && (synergies.bonuses.length > 0 || synergies.penalties.length > 0)) {
    const synergyWrap = document.createElement('div');
    synergyWrap.className = 'synergy-badges';
    synergies.bonuses.forEach(b => {
      const badge = document.createElement('div');
      badge.className = 'synergy-badge';
      badge.textContent = `${b.key} ${b.desc}`;
      synergyWrap.appendChild(badge);
    });
    synergies.penalties.forEach(p => {
      const badge = document.createElement('div');
      badge.className = 'contra-badge';
      badge.textContent = `${p.key} ${p.desc}`;
      synergyWrap.appendChild(badge);
    });
    cont.appendChild(synergyWrap);
  }

  // Event result
  if (eventResult) {
    const evBadge = document.createElement('div');
    evBadge.className = `event-badge ${eventResult.mitigated ? 'mitigated' : ''}`;
    evBadge.innerHTML = `
      <div class="event-badge-label">Random event</div>
      <div class="event-badge-name">${eventResult.event.icon} ${eventResult.event.label}</div>
      <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:4px;">
        ${eventResult.mitigated ? '✓ Mitigovan!' : '✗ Pogodio!'}
      </div>
    `;
    cont.appendChild(evBadge);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = `btn btn-primary btn-lg`;
  nextBtn.textContent = blockIndex < 2 ? `→ SLEDEĆI BLOK` : '✓ ZAVRŠI EVENT';
  onTap(nextBtn, onNext);
  cont.appendChild(nextBtn);

  inner.appendChild(cont);
  app.appendChild(screen);
  makeAllTapReady(screen);
}

// ===================== EVENT RESULT =====================
export function showEventResult(state, isAvalaEvent, onNext) {
  clearApp();
  const t = state.tourney;
  const es = state.event_state;
  const city = CITIES.find(c => c.id === t.current_city) || CITIES[0];

  const { screen, inner } = makeScreen('');
  const cont = document.createElement('div');
  cont.className = 'event-result';

  const totalFans = es.blocks_results ? es.blocks_results.reduce((s, b) => s + b.fan_gain, 0) : es.fan_score;

  cont.innerHTML = `
    <div style="color:var(--color-text-muted);font-size:var(--font-size-xs);text-transform:uppercase;">${city.icon} ${city.name} — Event završen</div>
    <div class="event-result-title">+${totalFans.toLocaleString()} FANS</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Fans noć</div><div class="stat-value">${totalFans.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Revenue</div><div class="stat-value" style="color:var(--color-success);">${(es.revenue || 0).toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Media</div><div class="stat-value" style="color:var(--color-accent);">${(es.media_coverage || 0)}</div></div>
      <div class="stat-card"><div class="stat-label">Ukupno</div><div class="stat-value" style="color:var(--color-primary);">${t.fan_base.toLocaleString()}</div></div>
    </div>
  `;

  // Avala CTA
  if (isAvalaEvent) {
    const cta = document.createElement('div');
    cta.className = 'avala-cta';
    cta.innerHTML = `
      <div class="avala-cta-label">🎟️ PRAVI EVENT</div>
      <div class="avala-cta-title">${AVALA_CTA.sublabel}</div>
    `;
    const ctaBtn = document.createElement('a');
    ctaBtn.href = AVALA_CTA.url;
    ctaBtn.target = '_blank';
    ctaBtn.rel = 'noopener noreferrer';
    ctaBtn.className = 'btn btn-primary';
    ctaBtn.style.display = 'flex';
    ctaBtn.textContent = '🎟️ ' + AVALA_CTA.label;
    cta.appendChild(ctaBtn);
    cont.appendChild(cta);
  }

  // Share button
  cont.appendChild(createShareButton(state, null));

  const nextBtn = document.createElement('button');
  const nextCity = CITIES[Math.min((t.current_city_index || 0) + 1, CITIES.length - 1)];
  const isLast = t.completed_events.length >= CITIES.length - 1;
  nextBtn.className = 'btn btn-accent btn-lg';
  nextBtn.textContent = isLast ? '🏆 KRAJ TURNEJE' : `→ ${nextCity.name.toUpperCase()}`;
  onTap(nextBtn, onNext);
  cont.appendChild(nextBtn);

  inner.appendChild(cont);
  app.appendChild(screen);
  makeAllTapReady(screen);
}

// ===================== GAMEOVER =====================
export function showGameOver(reason, state, onRestart) {
  clearApp();
  const t = state.tourney;
  const msg = GAMEOVER_MESSAGES[reason] || 'Turneja je gotova.';

  const { screen, inner } = makeScreen('');
  const cont = document.createElement('div');
  cont.className = 'gameover-screen';
  cont.style.position = 'relative';
  cont.style.zIndex = '1';

  cont.innerHTML = `
    <div class="gameover-title">GAME OVER</div>
    <div class="gameover-reason">${msg}</div>
    <div class="stats-grid" style="max-width:280px;">
      <div class="stat-card"><div class="stat-label">Fans</div><div class="stat-value">${t.fan_base.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Gradovi</div><div class="stat-value">${t.completed_events.length}/5</div></div>
      <div class="stat-card"><div class="stat-label">Budžet</div><div class="stat-value" style="color:var(--color-danger);">${t.budget.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Morale</div><div class="stat-value" style="color:var(--color-danger);">${t.crew_morale}</div></div>
    </div>
  `;

  cont.appendChild(createShareButton(state, null));

  const restartBtn = document.createElement('button');
  restartBtn.className = 'btn btn-primary btn-lg';
  restartBtn.textContent = '↩ NOVA TURNEJA';
  onTap(restartBtn, onRestart);
  cont.appendChild(restartBtn);

  inner.appendChild(cont);
  app.appendChild(screen);
  makeAllTapReady(screen);
}

// ===================== WIN SCREEN =====================
export function showWin(state, onRestart) {
  clearApp();
  const t = state.tourney;
  const hs = loadDailyHighscore();
  const isRecord = t.fan_base >= hs.score;

  const { screen, inner } = makeScreen('');
  const cont = document.createElement('div');
  cont.className = 'win-screen';

  const isLegendary = t.fan_base >= 10000;

  cont.innerHTML = `
    <div class="win-title">${isLegendary ? 'LEGENDARNO' : 'TURNEJA ZAVRŠENA'}</div>
    ${isRecord ? `<div class="win-highscore-badge">🏆 NOVI REKORD DANAS!</div>` : ''}
    <div class="win-score">${t.fan_base.toLocaleString()} FANOVA</div>
    <div class="stats-grid" style="max-width:320px;">
      <div class="stat-card"><div class="stat-label">Gradovi</div><div class="stat-value">${t.completed_events.length}/5</div></div>
      <div class="stat-card"><div class="stat-label">Budžet</div><div class="stat-value" style="color:var(--color-success);">${t.budget.toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Reputacija</div><div class="stat-value" style="color:var(--color-accent);">${t.reputation}</div></div>
      <div class="stat-card"><div class="stat-label">Morale</div><div class="stat-value">${t.crew_morale}</div></div>
    </div>
    <div class="avala-cta" style="max-width:320px;">
      <div class="avala-cta-label">🎟️ PRAVI EVENT</div>
      <div class="avala-cta-title">Avala · 20. jun 2026</div>
    </div>
  `;

  const ctaBtn = document.createElement('a');
  ctaBtn.href = AVALA_CTA.url;
  ctaBtn.target = '_blank';
  ctaBtn.rel = 'noopener noreferrer';
  ctaBtn.className = 'btn btn-primary btn-lg';
  ctaBtn.textContent = '🎟️ ' + AVALA_CTA.label;
  const ctaDiv = cont.querySelector('.avala-cta');
  ctaDiv.appendChild(ctaBtn);

  cont.appendChild(createShareButton(state, null));

  const restartBtn = document.createElement('button');
  restartBtn.className = 'btn btn-ghost';
  restartBtn.textContent = '↩ NOVA TURNEJA';
  onTap(restartBtn, onRestart);
  cont.appendChild(restartBtn);

  inner.appendChild(cont);
  app.appendChild(screen);
  makeAllTapReady(screen);
}

// ===================== HELPERS =====================
function buildHud(tourney) {
  const t = tourney;
  const moraleClass = t.crew_morale > 50 ? 'good' : t.crew_morale > 20 ? 'warn' : 'crit';
  const budgetClass = t.budget > 5000 ? 'good' : t.budget > 2000 ? 'warn' : 'crit';

  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-stat">
      <span class="hud-label">Budžet</span>
      <span class="hud-value ${budgetClass}">${formatCompact(t.budget)}</span>
    </div>
    <div class="hud-stat">
      <span class="hud-label">Fans</span>
      <span class="hud-value good">${formatCompact(t.fan_base)}</span>
    </div>
    <div class="hud-stat">
      <span class="hud-label">Rep</span>
      <span class="hud-value">${t.reputation}</span>
    </div>
    <div class="hud-stat">
      <span class="hud-label">Morale</span>
      <span class="hud-value ${moraleClass}">${t.crew_morale}</span>
    </div>
    <div class="hud-stat">
      <span class="hud-label">Grad</span>
      <span class="hud-value">${t.completed_events.length}/5</span>
    </div>
  `;
  return hud;
}

function buildMoraleBar(morale) {
  const cls = morale > 50 ? '' : morale > 20 ? 'warn' : 'danger';
  return `
    <div class="morale-bar-wrap">
      <span class="morale-bar-label">Morale</span>
      <div class="morale-bar-track">
        <div class="morale-bar-fill ${cls}" style="width:${morale}%;"></div>
      </div>
      <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);min-width:24px;text-align:right;">${morale}</span>
    </div>
  `;
}

function formatCompact(n) {
  if (n >= 10000) return `${Math.floor(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ===================== TOAST =====================
export function showToast(msg, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  if (type === 'error') toast.style.borderColor = 'var(--color-danger)';
  if (type === 'success') toast.style.borderColor = 'var(--color-success)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
