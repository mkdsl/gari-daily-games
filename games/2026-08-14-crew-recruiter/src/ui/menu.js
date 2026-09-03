// ui/menu.js — Main menu: visual event-type cards, HOF table, progress tracker

import { getUnlockedEventTypes } from '../systems/progression.js';
import { isHOFUnlocked, getHallOfFame } from '../systems/hall_of_fame.js';
import { EVENT_TYPE_CONFIGS } from '../config.js';

const EVENT_LABELS = {
  klub:     'Klub',
  outdoor:  'Outdoor',
  intimate: 'Intimate'
};

const EVENT_ICONS = {
  klub:     '🎛',
  outdoor:  '⛺',
  intimate: '🕯'
};

const EVENT_DESCRIPTIONS = {
  klub:     'Klasična klupska noć',
  outdoor:  'Festival pod otvorenim nebom',
  intimate: 'Intimni showcase nastup'
};

/**
 * Build a visual event-type card element (button-based for click handling).
 * Locked types get aria-disabled and a tooltip explaining unlock condition.
 * @param {{ type: string, unlocked: boolean, unlockAfter: number }} typeInfo
 * @param {string} selected - currently selected type
 * @returns {HTMLElement}
 */
function buildTypeCard(typeInfo, selected) {
  const { type, unlocked, unlockAfter } = typeInfo;
  const label       = EVENT_LABELS[type] || type;
  const icon        = EVENT_ICONS[type]  || '🎵';
  const description = EVENT_DESCRIPTIONS[type] || '';
  const isSelected  = type === selected;

  const card = document.createElement('button');
  card.className    = `event-type-card event-type-btn${isSelected ? ' selected' : ''}${!unlocked ? ' locked' : ''}`;
  card.dataset.type = type;
  card.dataset.locked = String(!unlocked);

  if (!unlocked) {
    card.setAttribute('aria-disabled', 'true');
    card.disabled = true;
    card.setAttribute('title', `Odigraj ${unlockAfter} ${unlockAfter === 1 ? 'partiju' : 'partija'} da otključaš`);
  }

  card.innerHTML = `
    <span class="event-card-icon" aria-hidden="true">${icon}</span>
    <span class="event-card-label">${label}</span>
    <span class="event-card-desc">${description}</span>
    ${!unlocked ? `
      <span class="event-card-lock" aria-label="Zaključano">🔒</span>
      <span class="lock-hint">${unlockAfter} igara</span>
    ` : ''}
  `;

  // Locked tooltip on click
  if (!unlocked) {
    card.addEventListener('click', () => {
      showLockedTooltip(card, `Otključava se posle ${unlockAfter} igara`);
    });
  }

  return card;
}

/**
 * Flash a temporary tooltip near a locked card.
 * @param {HTMLElement} target
 * @param {string} msg
 */
function showLockedTooltip(target, msg) {
  // Remove any existing tooltip
  document.querySelectorAll('.tooltip-locked').forEach(t => t.remove());

  const tip = document.createElement('div');
  tip.className   = 'tooltip-locked';
  tip.textContent = msg;
  tip.setAttribute('role', 'tooltip');

  target.parentElement?.appendChild(tip);
  requestAnimationFrame(() => tip.classList.add('tooltip-visible'));
  setTimeout(() => {
    tip.classList.remove('tooltip-visible');
    setTimeout(() => tip.remove(), 250);
  }, 1800);
}

/**
 * Build the Hall of Fame section (shown after 3+ completed runs).
 * @param {import('../state.js').GameState} state
 * @returns {string} HTML string
 */
function buildHOF(state) {
  const scores = getHallOfFame(state);
  if (!scores.length) return '';

  const medals = ['🥇', '🥈', '🥉'];
  const rows = scores.map((score, i) => `
    <tr class="hof-row">
      <td class="hof-rank">${medals[i] || `#${i + 1}`}</td>
      <td class="hof-score">${score}<span class="hof-max">/100</span></td>
      <td class="hof-grade">${scoreGrade(score)}</td>
    </tr>
  `).join('');

  return `
    <div class="hof-block">
      <h3 class="hof-title">🏆 Hall of Fame</h3>
      <table class="hof-table" aria-label="Tvoji top scorovi">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/**
 * Map a score to a letter grade label.
 * @param {number} score
 * @returns {string}
 */
function scoreGrade(score) {
  if (score >= 85) return 'Legendarno';
  if (score >= 70) return 'Sjajno';
  if (score >= 55) return 'Solidno';
  if (score >= 35) return 'Meh';
  return 'Katastrofa';
}

/**
 * Build the unlock progress tracker (next locked event type).
 * @param {number} completedRuns
 * @returns {string} HTML string or empty string if all unlocked
 */
function buildProgressTracker(completedRuns) {
  const types    = Object.keys(EVENT_TYPE_CONFIGS);
  const nextLocked = types.find(t => completedRuns < EVENT_TYPE_CONFIGS[t].unlockAfter);
  if (!nextLocked) return '';

  const needed  = EVENT_TYPE_CONFIGS[nextLocked].unlockAfter;
  const progress = Math.min(completedRuns / needed, 1);
  const pct      = Math.round(progress * 100);
  const label    = EVENT_LABELS[nextLocked] || nextLocked;
  const icon     = EVENT_ICONS[nextLocked]  || '';

  return `
    <div class="progress-tracker" aria-label="Napredak prema otključavanju ${label}">
      <div class="progress-tracker-label">
        Posle ${needed} igara: ${icon} ${label}
      </div>
      <div class="progress-bar-track" role="progressbar"
           aria-valuenow="${completedRuns}" aria-valuemin="0" aria-valuemax="${needed}"
           aria-label="${completedRuns} od ${needed} igara">
        <div class="progress-bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="progress-tracker-count">${completedRuns} / ${needed}</div>
    </div>
  `;
}

/**
 * MKDSLend "Pro Recruiter" brand block shown after 10+ completed runs.
 * @param {number} completedRuns
 * @returns {string} HTML string or empty
 */
function buildMKDSLendBlock(completedRuns) {
  if (completedRuns < 10) return '';
  return `
    <div class="mkdslend-block">
      <span class="mkdslend-badge">PRO RECRUITER</span>
      <p class="mkdslend-text">
        <a href="https://mkdslend.rs" target="_blank" rel="noopener">MKDSLend</a>
        — Zabavni radni park gde pro timovi grade stvari.
      </p>
    </div>
  `;
}

/**
 * Render the main menu screen.
 * @param {import('../state.js').GameState} state
 * @param {(eventType: string) => void} onPlay
 */
export function renderMenu(state, onPlay) {
  const screen = document.getElementById('menu-screen');
  if (!screen) return;

  const types       = getUnlockedEventTypes(state.completedRuns);
  let   selected    = 'klub';
  const hofHTML     = isHOFUnlocked(state) ? buildHOF(state) : '';
  const progressHTML = buildProgressTracker(state.completedRuns);
  const mkdslendHTML = buildMKDSLendBlock(state.completedRuns);

  // Clear and rebuild
  screen.innerHTML = `
    <div class="menu-inner">
      <div class="menu-header">
        <h1 class="menu-title">Crew Recruiter</h1>
        <p class="menu-sub">Popuni ekipu za jedan nastup.</p>
        <p class="menu-sub2">6 faza · 3 karte po rundi · skupi sinergiju</p>
      </div>

      <div class="event-type-selector" id="event-type-selector" role="group" aria-label="Tip eventa">
      </div>

      <button id="btn-play" class="btn btn-primary btn-play">
        Igraj
      </button>

      ${progressHTML}

      ${hofHTML}

      ${mkdslendHTML}
    </div>
  `;

  // Inject event type cards (avoid innerHTML overwrite losing event listeners)
  const selector = screen.querySelector('#event-type-selector');
  if (selector) {
    types.forEach(typeInfo => {
      const card = buildTypeCard(typeInfo, selected);
      selector.appendChild(card);
    });
  }

  screen.classList.remove('hidden');

  // Selection logic
  screen.querySelectorAll('.event-type-card').forEach(card => {
    if (card.dataset.locked === 'true') return;
    card.addEventListener('click', () => {
      screen.querySelectorAll('.event-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selected = card.dataset.type;
    });
  });

  // Pre-select klub
  screen.querySelector('[data-type="klub"]')?.classList.add('selected');

  document.getElementById('btn-play')?.addEventListener('click', () => {
    onPlay(selected);
  });
}

/** Hide menu. */
export function hideMenu() {
  const screen = document.getElementById('menu-screen');
  if (screen) screen.classList.add('hidden');
}
