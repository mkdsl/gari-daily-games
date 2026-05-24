// ui.js — DOM screens: start, HUD, diagnosis, correction, result, game-over, win
import { buildOptionButtons, onTap } from './input.js';
import { getRank } from './state.js';
import { loadHighscores } from './systems/highscore.js';
import { GLOSSARY } from './content/eq_bank.js';
import { getAvalaCountdown } from './content/brand_hooks.js';

// Screen management
const screens = {};
let activeScreen = null;

export function initUI() {
  ['start', 'game', 'gameover', 'win'].forEach(id => {
    screens[id] = document.getElementById(`screen-${id}`);
  });

  // Avala countdown
  const countdownEl = document.getElementById('avala-countdown');
  if (countdownEl) countdownEl.textContent = getAvalaCountdown();

  // Populate waveform bars
  document.querySelectorAll('.waveform-anim').forEach(el => {
    el.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
  });
}

export function showScreen(name) {
  Object.values(screens).forEach(s => s && s.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
  activeScreen = name;
}

// HUD update
export function updateHUD(state) {
  const roundEl = document.getElementById('hud-round');
  const scoreEl = document.getElementById('hud-score');
  const livesEl = document.getElementById('hud-lives');
  const streakEl = document.getElementById('streak-display');
  const zoneEl = document.getElementById('zone-label');

  if (roundEl) roundEl.textContent = `${state.round + 1}/10`;
  if (scoreEl) {
    scoreEl.textContent = state.score;
    scoreEl.classList.remove('score-flash');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('score-flash');
  }
  if (livesEl) livesEl.textContent = '❤️'.repeat(state.lives) || '💀';

  if (streakEl) {
    if (state.streak >= 10) {
      streakEl.textContent = `🔥×${state.streak}`;
      streakEl.className = 'streak-display legendary';
    } else if (state.streak >= 5) {
      streakEl.textContent = `⚡×${state.streak}`;
      streakEl.className = 'streak-display sparkle';
    } else if (state.streak >= 2) {
      streakEl.textContent = `×${state.streak}`;
      streakEl.className = 'streak-display';
    } else {
      streakEl.textContent = '';
      streakEl.className = 'streak-display';
    }
  }

  if (zoneEl && state.currentRoundData) {
    const { config } = state.currentRoundData;
    let label = config.zone;
    if (config.boss) label += ' <span class="boss-badge">BOSS</span>';
    zoneEl.innerHTML = label;
  }
}

// Timer bar
export function updateTimerBar(fraction, urgent, warn) {
  const bar = document.getElementById('timer-bar');
  const label = document.getElementById('timer-label');
  if (!bar) return;
  bar.style.transform = `scaleX(${fraction})`;
  bar.classList.remove('warn', 'urgent');
  if (urgent) bar.classList.add('urgent');
  else if (warn) bar.classList.add('warn');
  if (label) label.textContent = Math.ceil(fraction * (state_ref?.timerDuration ?? 8000) / 1000) + 's';
}

let state_ref = null;
export function setStateRef(s) { state_ref = s; }

// Phase: listening
export function showListening(text = 'Slušaj pažljivo...') {
  hideAllPhases();
  const el = document.getElementById('phase-listening');
  const textEl = document.getElementById('listening-text');
  if (textEl) textEl.textContent = text;
  if (el) el.classList.remove('hidden');
}

// Phase: diagnosis
export function showDiagnosis(options, onSelect) {
  hideAllPhases();
  const el = document.getElementById('phase-diagnosis');
  const container = document.getElementById('diagnosis-options');
  if (el) el.classList.remove('hidden');
  buildOptionButtons(container, options, (i, text, btn) => {
    // Mark selected
    container.querySelectorAll('.btn-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    onSelect(i, text);
  });
}

// Phase: correction
export function showCorrection(axes, onSelect) {
  // axes: [{id, label}]
  hideAllPhases();
  const el = document.getElementById('phase-correction');
  const container = document.getElementById('correction-axes');
  if (!el || !container) return;
  el.classList.remove('hidden');
  container.innerHTML = '';

  axes.forEach(axis => {
    const row = document.createElement('div');
    row.className = 'correction-axis';

    const axisLabel = document.createElement('span');
    axisLabel.className = 'correction-axis-label';
    axisLabel.textContent = axis.label;
    row.appendChild(axisLabel);

    const btnGroup = document.createElement('div');
    btnGroup.className = 'correction-btn-group';

    const directions = [
      { dir: 'smanjiti', label: '◀ Smanjiti' },
      { dir: 'ok',       label: '● OK' },
      { dir: 'pojacati', label: '▶ Pojačati' },
    ];

    directions.forEach(({ dir, label }) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-correction';
      btn.dataset.axis = axis.id;
      btn.dataset.dir = dir;
      btn.textContent = label;
      btn.setAttribute('aria-label', `${axis.label}: ${label}`);
      onTap(btn, () => {
        // Deselect same axis buttons
        btnGroup.querySelectorAll('.btn-correction').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        onSelect(axis.id, dir);
      });
      btnGroup.appendChild(btn);
    });

    row.appendChild(btnGroup);
    container.appendChild(row);
  });
}

// Phase: verify
export function showVerify() {
  hideAllPhases();
  const el = document.getElementById('phase-verify');
  if (el) el.classList.remove('hidden');
}

function hideAllPhases() {
  ['phase-listening', 'phase-diagnosis', 'phase-correction', 'phase-verify'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

// Round result overlay
// Bug 4 fix: save the timeout ID onto state_ref so restartGame() can clear it
export function showRoundResult({ correct, points, breakdown, callback, delay = 1800 }) {
  const overlay = document.getElementById('round-result');
  const iconEl = document.getElementById('result-icon');
  const pointsEl = document.getElementById('result-points');
  const breakdownEl = document.getElementById('result-breakdown');
  if (!overlay) return;

  iconEl.textContent = correct ? '✅' : '❌';
  pointsEl.textContent = correct ? `+${points}` : '0';
  breakdownEl.textContent = breakdown;
  overlay.classList.remove('hidden');

  if (state_ref) {
    state_ref.roundResultTimeout = setTimeout(() => {
      overlay.classList.add('hidden');
      callback && callback();
    }, delay);
  } else {
    setTimeout(() => {
      overlay.classList.add('hidden');
      callback && callback();
    }, delay);
  }
}

// Glossary bubble
let glossaryTimeout = null;
const glossaryShownTerms = new Set();

export function maybeShowGlossary(terms) {
  if (!terms || terms.length === 0) return;
  const term = terms.find(t => !glossaryShownTerms.has(t) && GLOSSARY[t]);
  if (!term) return;

  glossaryShownTerms.add(term);
  if (glossaryTimeout) clearTimeout(glossaryTimeout);

  glossaryTimeout = setTimeout(() => {
    const bubble = document.getElementById('glossary-bubble');
    const termEl = document.getElementById('glossary-term');
    const defEl = document.getElementById('glossary-def');
    if (!bubble || !termEl || !defEl) return;
    termEl.textContent = term;
    defEl.textContent = GLOSSARY[term];
    bubble.classList.remove('hidden');

    const closeBtn = document.getElementById('glossary-close');
    const close = () => bubble.classList.add('hidden');
    if (closeBtn) {
      closeBtn.onclick = null;
      onTap(closeBtn, close);
    }

    // Auto-hide after 4 seconds
    setTimeout(close, 4000);
  }, 500);
}

// End screens
export function showGameOver(state) {
  const statsEl = document.getElementById('gameover-stats');
  const rankEl = document.getElementById('gameover-rank');
  const hsEl = document.getElementById('gameover-highscores');
  if (statsEl) statsEl.innerHTML = buildStatsHTML(state);
  if (rankEl) rankEl.innerHTML = buildRankHTML(state.score);
  if (hsEl) hsEl.innerHTML = buildHighscoreHTML(state.score, state.maxStreak);
  showScreen('gameover');
}

export function showWin(state) {
  const statsEl = document.getElementById('win-stats');
  const rankEl = document.getElementById('win-rank');
  const hsEl = document.getElementById('win-highscores');
  if (statsEl) statsEl.innerHTML = buildStatsHTML(state);
  if (rankEl) rankEl.innerHTML = buildRankHTML(state.score);
  if (hsEl) hsEl.innerHTML = buildHighscoreHTML(state.score, state.maxStreak);
  showScreen('win');
}

function buildStatsHTML(state) {
  const rounds = state.roundsData || [];
  const correct = rounds.filter(r => r.correct).length;
  return `
    <div class="stat-row"><span class="stat-label">Score</span><span class="stat-value highlight">${state.score} / 3000</span></div>
    <div class="stat-row"><span class="stat-label">Runde tačno</span><span class="stat-value">${correct} / ${rounds.length}</span></div>
    <div class="stat-row"><span class="stat-label">Max streak</span><span class="stat-value">${state.maxStreak}</span></div>
  `;
}

function buildRankHTML(score) {
  const rank = getRank(score);
  return `<div class="rank-label">Rang</div><div class="rank-name">${rank}</div>`;
}

function buildHighscoreHTML(currentScore, currentStreak) {
  const hs = loadHighscores();
  let html = '<h4>Dnevni Top 3 Score</h4>';
  hs.scores.forEach((s, i) => {
    const isCurrent = s === currentScore;
    html += `<div class="hs-row${isCurrent ? ' current' : ''}"><span class="hs-pos">${i+1}.</span><span class="hs-score">${s}</span></div>`;
  });
  html += '<h4>Dnevni Top 3 Streak</h4>';
  hs.streaks.forEach((s, i) => {
    const isCurrent = s === currentStreak;
    html += `<div class="hs-row${isCurrent ? ' current' : ''}"><span class="hs-pos">${i+1}.</span><span class="hs-score">×${s}</span></div>`;
  });
  return html;
}

// Start screen highscore preview
export function renderStartHighscore() {
  const el = document.getElementById('highscore-preview');
  if (!el) return;
  const hs = loadHighscores();
  if (hs.scores.length === 0) {
    el.innerHTML = '<span style="opacity:0.5">Nema dnevnih rezultata.</span>';
    return;
  }
  el.innerHTML = `Dnevni rekord: <strong style="color:var(--amber)">${hs.scores[0]}</strong> | Streak: <strong style="color:var(--blue)">×${hs.streaks[0] || 0}</strong>`;
}
