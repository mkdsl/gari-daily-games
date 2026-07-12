import { formatDin } from '../economy/market.js';
import { PHASE_LABELS } from '../systems/phases.js';
import { formatSeasonTimer, getSeasonProgress } from '../systems/seasons.js';
import { getAchievementSummary } from '../systems/achievements.js';
import { GAME_CONFIG } from '../config.js';

// ─── State for rolling average ─────────────────────────────────────────────────

let lastCapital = 0;
let lastCapitalCheckTime = 0;
let incomePerSecEst = 0;
let incomeHistory = [];   // last 5 readings
const INCOME_SAMPLE_SEC = 5;

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize HUD — bind tooltip, info popover, and static elements.
 * @param {object} state
 */
export function initHUD(state) {
  lastCapital = state.capital;
  lastCapitalCheckTime = performance.now();

  // Actions tooltip on click
  const actionsEl = document.getElementById('actions-display');
  if (actionsEl) {
    actionsEl.style.cursor = 'help';
    actionsEl.title = buildActionsTooltip(state);
  }

  // Phase badge tooltip
  const phaseBadge = document.getElementById('phase-badge');
  if (phaseBadge) {
    phaseBadge.style.cursor = 'help';
  }

  // Season timer warning threshold label
  const timerEl = document.getElementById('season-timer');
  if (timerEl) timerEl.setAttribute('aria-label', 'Tajmer sezone');
}

// ─── Main update ──────────────────────────────────────────────────────────────

/**
 * Update the persistent HUD bar every tick.
 * @param {object} state
 */
export function updateHUD(state) {
  updateCapital(state);
  updatePhaseBadge(state);
  updateSeasonDisplay(state);
  updateActions(state);
  updateReputation(state);
  updateEventIndicator(state);
  updateIncomeEstimate(state);
}

// ─── Capital display ──────────────────────────────────────────────────────────

function updateCapital(state) {
  const capEl = document.getElementById('capital-amount');
  const trendEl = document.getElementById('capital-trend');

  if (capEl) {
    capEl.textContent = formatDin(state.capital);
  }

  if (trendEl) {
    const now = performance.now();
    const dt = (now - lastCapitalCheckTime) / 1000;

    if (dt >= INCOME_SAMPLE_SEC) {
      const diff = state.capital - lastCapital;
      const ratePerSec = diff / dt;

      incomeHistory.push(ratePerSec);
      if (incomeHistory.length > 5) incomeHistory.shift();
      incomePerSecEst = incomeHistory.reduce((s, v) => s + v, 0) / incomeHistory.length;

      lastCapital = state.capital;
      lastCapitalCheckTime = now;
    }

    if (state.capital > lastCapital + 50) {
      trendEl.textContent = '▲';
      trendEl.className = 'trend-up';
    } else if (state.capital < lastCapital - 50) {
      trendEl.textContent = '▼';
      trendEl.className = 'trend-down';
    }
  }
}

// ─── Phase badge ──────────────────────────────────────────────────────────────

function updatePhaseBadge(state) {
  const phaseBadge = document.getElementById('phase-badge');
  if (!phaseBadge) return;

  phaseBadge.textContent = `Faza ${state.phase}`;
  phaseBadge.className = `phase-badge phase-${state.phase.toLowerCase()}`;

  // Build tooltip with next-phase requirements
  const phaseDescs = {
    '0': 'Početna faza — zaradi 25.000 din ukupno za Fazu A',
    'A': 'Faza A — zaradi 100.000 din ukupno i otključaj Plastenik za Fazu B',
    'B': 'Faza B — zaradi 150.000+ din/sez u 3 uzastopne sezone + Jezero za Fazu C',
    'C': 'Faza C — pravo imanje! Otključaj Prestiž reset.',
  };
  phaseBadge.title = phaseDescs[state.phase] || PHASE_LABELS[state.phase] || '';
}

// ─── Season display ───────────────────────────────────────────────────────────

function updateSeasonDisplay(state) {
  const seasonEl = document.getElementById('season-num');
  const timerEl = document.getElementById('season-timer');
  const seasonBarFill = document.getElementById('season-progress-fill');

  if (seasonEl) seasonEl.textContent = state.season;

  if (timerEl) {
    timerEl.textContent = formatSeasonTimer(state.seasonTimer);
    const isWarning = state.seasonTimer < 15;
    timerEl.classList.toggle('season-timer-warning', isWarning);
    timerEl.classList.toggle('pulse', isWarning);
    timerEl.title = `Sezona ${state.season} — ${state.seasonTimer < 60 ? 'Kraj sezone!' : 'Vreme do kraja sezone'}`;
  }

  if (seasonBarFill) {
    const progress = getSeasonProgress(state);
    seasonBarFill.style.width = `${progress.pct.toFixed(1)}%`;
    if (progress.isLate) {
      seasonBarFill.classList.add('season-bar-late');
    } else {
      seasonBarFill.classList.remove('season-bar-late');
    }
  }
}

// ─── Daily actions ────────────────────────────────────────────────────────────

function updateActions(state) {
  const actionsEl = document.getElementById('actions-display');
  if (!actionsEl) return;

  const total = state.workers.dailyActionsTotal;
  const used = state.workers.dailyActionsUsed;
  const remaining = total - used;

  actionsEl.textContent = `${remaining}/${total}`;
  actionsEl.title = buildActionsTooltip(state);

  if (remaining === 0) {
    actionsEl.className = 'actions-depleted';
  } else if (remaining <= 2) {
    actionsEl.className = 'actions-low';
  } else {
    actionsEl.className = '';
  }

  // Fill pips if present
  const pipsEl = document.getElementById('action-pips');
  if (pipsEl) {
    let html = '';
    for (let i = 0; i < total; i++) {
      html += `<span class="action-pip ${i < remaining ? 'pip-filled' : 'pip-used'}"></span>`;
    }
    pipsEl.innerHTML = html;
  }
}

function buildActionsTooltip(state) {
  const base = GAME_CONFIG.BASE_DAILY_ACTIONS;
  const workerBonus = state.workers.hired * GAME_CONFIG.ACTIONS_PER_WORKER;
  const achBonus = state.achievementBonuses?.dailyActions || 0;
  const total = state.workers.dailyActionsTotal;
  const used = state.workers.dailyActionsUsed;
  return [
    `Dnevne akcije: ${total - used} / ${total}`,
    `  Osnova: ${base}`,
    workerBonus > 0 ? `  Radnici: +${workerBonus} (${state.workers.hired}×)` : null,
    achBonus > 0 ? `  Achievement: +${achBonus}` : null,
    `Akcije se resetuju svake sezone.`,
  ].filter(Boolean).join('\n');
}

// ─── Reputation ───────────────────────────────────────────────────────────────

function updateReputation(state) {
  const repEl = document.getElementById('rep-display');
  if (!repEl) return;

  repEl.textContent = state.reputation.toFixed(2) + '×';
  const cap = state.achievementBonuses?.reputationCap || GAME_CONFIG.REPUTATION_CAP;
  const pct = ((state.reputation - GAME_CONFIG.REPUTATION_BASE) / (cap - GAME_CONFIG.REPUTATION_BASE)) * 100;
  repEl.title = `Reputacija: ${state.reputation.toFixed(2)}× od max ${cap}×\n(${pct.toFixed(0)}% do cap-a)\nSvaki masterclass +${(GAME_CONFIG.REPUTATION_PER_MASTERCLASS * 100).toFixed(0)}%`;

  // Color gradient: gray → green
  if (state.reputation >= cap * 0.9) {
    repEl.style.color = 'var(--clr-zelena-light)';
  } else if (state.reputation >= cap * 0.6) {
    repEl.style.color = 'var(--clr-kapital)';
  } else {
    repEl.style.color = '';
  }
}

// ─── Event indicator ──────────────────────────────────────────────────────────

function updateEventIndicator(state) {
  const hudBar = document.getElementById('hud-bar');
  if (!hudBar) return;

  if (state.activeEvent) {
    hudBar.classList.add('hud-event-active');
    let evEl = document.getElementById('hud-event-label');
    if (!evEl) {
      evEl = document.createElement('span');
      evEl.id = 'hud-event-label';
      evEl.className = `hud-event-badge event-sev-${state.activeEvent.severity || 'neutral'}`;
      hudBar.appendChild(evEl);
    }
    evEl.textContent = state.activeEvent.label;
    evEl.title = state.activeEvent.desc;
  } else {
    hudBar.classList.remove('hud-event-active');
    const existing = document.getElementById('hud-event-label');
    if (existing) existing.remove();
  }
}

// ─── Income estimate ──────────────────────────────────────────────────────────

function updateIncomeEstimate(state) {
  const incomeEl = document.getElementById('income-estimate');
  if (!incomeEl) return;

  // Use season revenue averaged over season duration as estimate
  const seasonDur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
    : GAME_CONFIG.SEASON_DURATION_SEC;

  const elapsed = seasonDur - Math.max(0, state.seasonTimer);
  const ratePerSec = elapsed > 5 ? (state.seasonRevenue || 0) / elapsed : 0;

  if (ratePerSec > 0) {
    incomeEl.textContent = `~${formatDin(ratePerSec * 60)}/min`;
    incomeEl.title = `Procena prihoda bazirana na ovoj sezoni (${formatDin(ratePerSec)}/sec)`;
  } else {
    incomeEl.textContent = '';
  }
}

// ─── Achievement counter in HUD ───────────────────────────────────────────────

/**
 * Update achievement badge in HUD if element exists.
 * @param {object} state
 */
export function updateHUDAchievementBadge(state) {
  const achEl = document.getElementById('ach-count');
  if (!achEl) return;
  const { total, unlocked } = getAchievementSummary(state);
  achEl.textContent = `${unlocked}/${total}`;
  achEl.title = `Achievements: ${unlocked} od ${total} otključano`;
}
