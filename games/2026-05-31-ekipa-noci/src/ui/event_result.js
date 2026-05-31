/**
 * event_result.js — Event Result screen za Ekipa Noći
 * Prikazuje score breakdown, synergy log, ko ostaje/odlazi
 */

import { createCardElement } from '../render.js';

/**
 * Renderuje result screen posle eventa.
 *
 * @param {Object}   eventResult               — rezultat eventa
 * @param {string}   eventResult.event_name
 * @param {number}   eventResult.base_total     — suma base_score odabranih karata
 * @param {number}   eventResult.synergy_total  — bonus od synergy matcheva
 * @param {number}   eventResult.conflict_total — kazna od konflikata (negativan)
 * @param {number}   eventResult.audience_match — audience bonus
 * @param {number}   eventResult.event_score    — finalni score
 * @param {number}   eventResult.xp_earned
 * @param {number}   eventResult.budget_bonus
 * @param {Array}    eventResult.synergy_log    — niz stringa sa opisima synergy-ja
 *
 * @param {Object}   crewChanges
 * @param {Array}    crewChanges.staying        — Card[] koji ostaju
 * @param {Array}    crewChanges.leaving        — Card[] koji odlaze
 *
 * @param {Function} onNext                     — callback za "Nastavi" dugme
 */
export function renderEventResult(eventResult, crewChanges, onNext) {
  const screenEl = document.getElementById('screen-resolve');
  if (!screenEl) return;

  screenEl.innerHTML = '';

  // --- NASLOV ---
  const header = document.createElement('div');
  header.classList.add('result-header');

  const titleEl = document.createElement('h2');
  titleEl.classList.add('result-header__title');
  titleEl.textContent = eventResult.event_name || 'Event';
  header.appendChild(titleEl);

  const scoreLabel = document.createElement('p');
  scoreLabel.classList.add('result-header__label');
  scoreLabel.textContent = 'Event Score';
  header.appendChild(scoreLabel);

  const scoreBigEl = document.createElement('div');
  scoreBigEl.classList.add('result-header__score');
  const finalScore = eventResult.event_score ?? 0;
  scoreBigEl.textContent = '0';

  // Boja po score-u
  if (finalScore >= 60) scoreBigEl.classList.add('score--great');
  else if (finalScore >= 31) scoreBigEl.classList.add('score--ok');
  else scoreBigEl.classList.add('score--bad');

  header.appendChild(scoreBigEl);
  screenEl.appendChild(header);

  // Animiran count-up
  _animateCountUp(scoreBigEl, 0, finalScore, 1000);

  // --- SCORE BREAKDOWN TABLE ---
  const breakdownSection = document.createElement('div');
  breakdownSection.classList.add('result-breakdown');

  const breakdownTitle = document.createElement('h3');
  breakdownTitle.classList.add('result-breakdown__title');
  breakdownTitle.textContent = 'Breakdown';
  breakdownSection.appendChild(breakdownTitle);

  const table = document.createElement('table');
  table.classList.add('breakdown-table');

  const rows = [
    { label: 'Baza ekipe',        value: eventResult.base_total     ?? 0, type: 'neutral' },
    { label: 'Synergy bonus',     value: eventResult.synergy_total  ?? 0, type: 'positive' },
    { label: 'Konflikt',          value: eventResult.conflict_total ?? 0, type: 'negative' },
    { label: 'Audience match',    value: eventResult.audience_match ?? 0, type: 'positive' },
    { label: 'EVENT SCORE',       value: finalScore,                       type: 'total' }
  ];

  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.classList.add('breakdown-row', `breakdown-row--${row.type}`);

    const tdLabel = document.createElement('td');
    tdLabel.classList.add('breakdown-row__label');
    tdLabel.textContent = row.label;

    const tdValue = document.createElement('td');
    tdValue.classList.add('breakdown-row__value');
    const prefix = row.type === 'negative' && row.value > 0 ? '-' :
                   row.type === 'positive' && row.value > 0 ? '+' : '';
    tdValue.textContent = `${prefix}${row.value}`;

    tr.appendChild(tdLabel);
    tr.appendChild(tdValue);
    table.appendChild(tr);
  });

  breakdownSection.appendChild(table);

  // XP i budget bonus
  const bonusRow = document.createElement('div');
  bonusRow.classList.add('result-bonuses');
  bonusRow.innerHTML = `
    <span class="bonus-chip bonus-chip--xp">+${eventResult.xp_earned ?? 0} XP</span>
    <span class="bonus-chip bonus-chip--budget">+${eventResult.budget_bonus ?? 0} BP</span>
  `;
  breakdownSection.appendChild(bonusRow);
  screenEl.appendChild(breakdownSection);

  // --- SYNERGY LOG ---
  if (eventResult.synergy_log && eventResult.synergy_log.length > 0) {
    const synergySection = document.createElement('div');
    synergySection.classList.add('result-synergy');

    const synergyTitle = document.createElement('h3');
    synergyTitle.classList.add('result-synergy__title');
    synergyTitle.textContent = 'Synergy Log';
    synergySection.appendChild(synergyTitle);

    const logList = document.createElement('ul');
    logList.classList.add('synergy-list');

    eventResult.synergy_log.forEach(entry => {
      const li = document.createElement('li');
      li.classList.add('synergy-list__item');
      li.textContent = entry;
      logList.appendChild(li);
    });

    synergySection.appendChild(logList);
    screenEl.appendChild(synergySection);
  }

  // --- CREW CHANGES ---
  const crewSection = document.createElement('div');
  crewSection.classList.add('result-crew');

  const crewTitle = document.createElement('h3');
  crewTitle.classList.add('result-crew__title');
  crewTitle.textContent = 'Promene u ekipi';
  crewSection.appendChild(crewTitle);

  const crewColumns = document.createElement('div');
  crewColumns.classList.add('crew-columns');

  // Ko ostaje
  const stayingCol = document.createElement('div');
  stayingCol.classList.add('crew-column', 'crew-column--staying');
  const stayingTitle = document.createElement('h4');
  stayingTitle.classList.add('crew-column__title');
  stayingTitle.textContent = '✓ Ostaju';
  stayingCol.appendChild(stayingTitle);

  (crewChanges.staying || []).forEach(card => {
    const mini = _createMiniCard(card, 'staying');
    stayingCol.appendChild(mini);
  });

  // Ko odlazi
  const leavingCol = document.createElement('div');
  leavingCol.classList.add('crew-column', 'crew-column--leaving');
  const leavingTitle = document.createElement('h4');
  leavingTitle.classList.add('crew-column__title');
  leavingTitle.textContent = '✗ Odlaze';
  leavingCol.appendChild(leavingTitle);

  (crewChanges.leaving || []).forEach(card => {
    const mini = _createMiniCard(card, 'leaving');
    leavingCol.appendChild(mini);
  });

  crewColumns.appendChild(stayingCol);
  crewColumns.appendChild(leavingCol);
  crewSection.appendChild(crewColumns);
  screenEl.appendChild(crewSection);

  // --- NASTAVI DUGME ---
  const btnNext = document.createElement('button');
  btnNext.classList.add('btn', 'btn--primary', 'btn--next');
  btnNext.textContent = 'Nastavi →';
  btnNext.addEventListener('click', () => {
    btnNext.disabled = true;
    if (onNext) onNext();
  });
  screenEl.appendChild(btnNext);
}

/**
 * Kreira mini card prikaz za crew changes sekciju.
 */
function _createMiniCard(card, variant) {
  const el = document.createElement('div');
  el.classList.add('mini-card', `mini-card--${variant}`);
  el.innerHTML = `
    <span class="mini-card__role">${card.role || ''}</span>
    <span class="mini-card__name">${(card.name || '').toUpperCase()}</span>
    <span class="mini-card__score">${card.base_score ?? ''}</span>
  `;
  return el;
}

/**
 * Animira count-up broj od start do end za duration ms.
 */
function _animateCountUp(el, start, end, duration) {
  const startTime = performance.now();
  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased   = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
