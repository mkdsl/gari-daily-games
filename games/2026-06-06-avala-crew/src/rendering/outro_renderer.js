/**
 * outro_renderer.js — Render outro/results screen
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { getMemberById } from '../content/crew_data.js';
import { OUTCOME_LABELS, OUTCOME_COLORS, SCENARIO_OUTCOME_LABELS, TICKETING_URL, STAT_ICONS } from '../config.js';
import { CREW_DATA } from '../content/crew_data.js';

/**
 * Render the full outro screen
 * @param {Object} state - Game state
 * @param {string} nightOutcome - 'legendary'|'good'|'survived'|'kaos'
 * @param {string[]} newUnlocks - Newly unlocked member IDs
 * @param {Object} callbacks - {onShare, onCTA, onNextNight, onPrestige}
 */
export function renderOutroScreen(state, nightOutcome, newUnlocks, callbacks) {
  const screen = document.getElementById('screen-outro');
  if (!screen) return;

  const outcomeLabel = OUTCOME_LABELS[nightOutcome] || nightOutcome;
  const outcomeColor = OUTCOME_COLORS[nightOutcome] || '#fff';

  screen.innerHTML = `
    <div class="outro-container">
      ${renderOutroHeader(state.nightScore, outcomeLabel, outcomeColor, state.completedNights)}
      ${renderCrewSummary(state)}
      ${renderScenarioSummary(state)}
      ${renderWhatIfPanel(state)}
      ${newUnlocks.length > 0 ? renderUnlockBanner(newUnlocks) : ''}
      ${renderShareSection(state, nightOutcome, callbacks)}
      ${renderCTASection(state, callbacks)}
      <div class="outro-footer">
        <button class="btn-next-night btn-primary" id="btn-next-night" data-action="next-night">
          🌙 Sledeća noć
        </button>
      </div>
    </div>
  `;

  // Animate Night Score from 0 to final
  animateScoreTick(state.nightScore, outcomeColor);
}

/**
 * Render outro header with animated score
 */
function renderOutroHeader(nightScore, outcomeLabel, outcomeColor, completedNights) {
  return `
    <div class="outro-header">
      <div class="outro-night-num">Noć ${completedNights}</div>
      <div class="night-score-display" id="outro-score" style="color: ${outcomeColor}">0</div>
      <div class="night-score-sublabel">Night Score</div>
      <div class="outcome-label" style="color: ${outcomeColor}">${outcomeLabel}</div>
    </div>
  `;
}

/**
 * Animate score from 0 to final value
 */
function animateScoreTick(finalScore, color) {
  const el = document.getElementById('outro-score');
  if (!el) return;

  let current = 0;
  const duration = 1500;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * finalScore);
    el.textContent = current;
    el.classList.toggle('score-tick', progress < 1);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = finalScore;
    }
  }

  requestAnimationFrame(tick);
}

/**
 * Render crew summary cards
 */
function renderCrewSummary(state) {
  const crewHtml = state.activeCrew.map(({ memberId, role }) => {
    const member = getMemberById(memberId);
    if (!member) return '';

    const scenarioResults = state.scenarioResults || [];
    const memberContributions = scenarioResults
      .filter(r => r.contributions && r.contributions.find(c => c.memberId === memberId))
      .map(r => r.contributions.find(c => c.memberId === memberId).contribution);

    const totalContribution = memberContributions.reduce((s, c) => s + c, 0);
    const hadBestMoment = scenarioResults.some(r =>
      r.contributions && r.contributions.length > 0 &&
      r.contributions.reduce((best, c) => c.contribution > best.contribution ? c : best).memberId === memberId
    );

    const isExhausted = state.spentAbilities && state.spentAbilities[memberId];

    return `
      <div class="outro-crew-card ${hadBestMoment ? 'outro-crew-card--mvp' : ''}">
        <div class="outro-crew-portrait" style="background-color: ${member.portraitColor}20; border-color: ${member.portraitColor}">
          <span>${member.portraitEmoji}</span>
          ${hadBestMoment ? '<div class="mvp-badge">★ MVP</div>' : ''}
          ${isExhausted ? '<div class="exhausted-badge">💤</div>' : ''}
        </div>
        <div class="outro-crew-info">
          <div class="outro-crew-name">${member.name}</div>
          <div class="outro-crew-role">${role}</div>
          <div class="outro-crew-contrib">Doprinos: ${Math.round(totalContribution * 10) / 10}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="outro-section">
      <h3>Tvoja ekipa</h3>
      <div class="outro-crew-grid">${crewHtml}</div>
    </div>
  `;
}

/**
 * Render scenario-by-scenario summary
 */
function renderScenarioSummary(state) {
  const results = state.scenarioResults || [];
  if (results.length === 0) return '';

  const itemsHtml = results.map((r, i) => {
    const outcomeClass = `outcome-${r.outcome}`;
    const outcomeIcon = { win: '✓', partial: '~', fail: '✗' }[r.outcome] || '?';

    return `
      <div class="scenario-result-item ${outcomeClass}">
        <span class="result-num">${i + 1}</span>
        <span class="result-icon">${outcomeIcon}</span>
        <span class="result-name">${r.scenarioName || `Scenario ${i + 1}`}</span>
        <span class="result-score">+${r.scoreGained}</span>
      </div>
    `;
  }).join('');

  const wins = results.filter(r => r.outcome === 'win').length;
  const partials = results.filter(r => r.outcome === 'partial').length;
  const fails = results.filter(r => r.outcome === 'fail').length;

  return `
    <div class="outro-section">
      <h3>Scenariji (${wins}W / ${partials}P / ${fails}F)</h3>
      <div class="scenario-results-list">${itemsHtml}</div>
    </div>
  `;
}

/**
 * Render "what if" alternative suggestion panel
 */
function renderWhatIfPanel(state) {
  const suggestion = generateWhatIfSuggestion(state);
  if (!suggestion) return '';

  return `
    <div class="outro-section what-if-panel">
      <h3>💭 Šta bi bilo da...</h3>
      <div class="what-if-text">${suggestion}</div>
    </div>
  `;
}

/**
 * Generate a what-if suggestion based on failed scenarios
 * @param {Object} state
 * @returns {string|null}
 */
function generateWhatIfSuggestion(state) {
  const results = state.scenarioResults || [];
  const fails = results.filter(r => r.outcome === 'fail');
  if (fails.length === 0) return null;

  const worstFail = fails[0];
  const crewIds = state.activeCrew.map(c => c.memberId);

  // Find crew member not in crew with high relevant stat
  const allMembers = Object.values(CREW_DATA);
  const notInCrew = allMembers.filter(m => !crewIds.includes(m.id) && m.starterUnlocked);

  if (notInCrew.length > 0 && worstFail.scenarioType) {
    const type = worstFail.scenarioType;
    const statMap = { E: 'E', S: 'S', P: 'P', L: 'L' };
    const relevantStat = statMap[type];
    if (relevantStat) {
      const best = notInCrew.sort((a, b) => b.stats[relevantStat] - a.stats[relevantStat])[0];
      if (best) {
        return `Da je ${best.name} bio u ekipi, scenario "${worstFail.scenarioName}" mogao je da se završi drugačije — ima ${STAT_ICONS[relevantStat]} ${relevantStat}: ${best.stats[relevantStat]}.`;
      }
    }
  }

  if (fails.length >= 3) {
    return `Sa drugačijim sastavom ekipe i pažljivijim izborom uloga, noć je mogla biti znatno bolja. Istraži sinergije između članova.`;
  }

  return `Jedna drugačija odluka u klj. scenariju bi mogla promeniti celu noć. Sledeći put!`;
}

/**
 * Render unlock banner for new unlocks
 */
function renderUnlockBanner(newUnlocks) {
  const unlocksHtml = newUnlocks.map(id => {
    const member = getMemberById(id);
    if (!member) return '';
    return `
      <div class="unlock-item">
        <span class="unlock-emoji">${member.portraitEmoji}</span>
        <span class="unlock-name">${member.name}</span>
        <span class="unlock-archetype">${member.archetype}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="outro-section unlock-banner">
      <h3>🔓 Novo otključano!</h3>
      <div class="unlock-list">${unlocksHtml}</div>
    </div>
  `;
}

/**
 * Render share section
 */
function renderShareSection(state, nightOutcome, callbacks) {
  return `
    <div class="outro-section share-section">
      <div class="share-preview" id="share-preview-area">
        <div class="share-card-placeholder">
          <div class="share-card-header">#AvalaCrew — 20. jun 2026</div>
          <div class="share-card-crew">
            ${state.activeCrew.map(({ memberId, role }) => {
              const m = getMemberById(memberId);
              return m ? `<span class="share-crew-pill">${m.portraitEmoji} ${m.name}</span>` : '';
            }).join('')}
          </div>
          <div class="share-card-score" style="color: ${OUTCOME_COLORS[nightOutcome] || '#fff'}">
            ${state.nightScore}/100 — ${OUTCOME_LABELS[nightOutcome] || nightOutcome}
          </div>
        </div>
      </div>
      <button class="btn-share btn-secondary" id="btn-share" data-action="share">
        📤 Podeli moju ekipu
      </button>
    </div>
  `;
}

/**
 * Render CTA (Avala ticket button)
 */
function renderCTASection(state, callbacks) {
  return `
    <div class="outro-section cta-section">
      <div class="cta-text">
        Prava Avala ekipa je 20. juna. Sastavi pravu ekipu — karte dostupne →
      </div>
      <a class="btn-cta btn-primary" href="${TICKETING_URL}" target="_blank" rel="noopener" data-action="cta-click">
        🎟️ Avala 20. jun — Karte
      </a>
    </div>
  `;
}
