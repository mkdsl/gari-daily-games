/**
 * scenario_renderer.js — Render scenario screen
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { getMemberById } from '../content/crew_data.js';
import { STAT_ICONS, SCENARIO_TYPE_LABELS, SCENARIO_TYPE_ICONS, PHASE_LABELS, PHASE_ICONS } from '../config.js';
import { getAftermathSummary } from '../systems/aftermath.js';
import { getTopContributor } from '../entities/crewMember.js';

/**
 * Render the scenario screen
 * @param {Object} scenario - Scenario instance
 * @param {Object} state - Game state
 * @param {import('../entities/crewMember.js').CrewMember[]} crew - Built crew objects
 * @param {Object} callbacks - {onResolve, onUseAbility, onChoiceSelect}
 */
export function renderScenarioScreen(scenario, state, crew, callbacks) {
  const screen = document.getElementById('screen-scenario');
  if (!screen) return;

  const topContributor = getTopContributor(crew, scenario.type);
  const aftermathSummary = getAftermathSummary(state.aftermathStack);
  const currentPhaseLabel = PHASE_LABELS[state.currentPhase] || state.currentPhase;
  const scenarioNumber = state.currentScenarioIndex + 1;
  const totalScenarios = 10;

  screen.innerHTML = `
    <div class="scenario-container">
      ${renderPhaseTimeline(state.currentPhase, state.currentScenarioIndex)}
      ${renderNightScoreHUD(state.nightScore)}
      ${renderScenarioCard(scenario, state.currentPhase)}
      ${renderAftermathBar(aftermathSummary)}
      ${renderCrewBar(crew, topContributor, scenario.type, state)}
      ${scenario.hasChoices ? renderChoiceButtons(scenario, callbacks) : ''}
      ${renderAbilityButtons(crew, state, callbacks)}
      ${renderResolveButton(scenario, state, callbacks)}
    </div>
  `;
}

/**
 * Render phase timeline progress bar
 * @param {string} currentPhase
 * @param {number} scenarioIndex - 0-based
 */
function renderPhaseTimeline(currentPhase, scenarioIndex) {
  const phases = [
    { id: 'gathering', label: 'Sabiranje', icon: '🌅', start: 0, end: 2 },
    { id: 'peak', label: 'Vrh', icon: '🔥', start: 3, end: 6 },
    { id: 'departure', label: 'Rastanak', icon: '🌙', start: 7, end: 9 }
  ];

  const phasesHtml = phases.map(phase => {
    const isActive = currentPhase === phase.id;
    const isDone = (
      (phase.id === 'gathering' && scenarioIndex >= 3) ||
      (phase.id === 'peak' && scenarioIndex >= 7)
    );
    const scenariosInPhase = phase.end - phase.start + 1;
    let progress = 0;
    if (isActive) {
      const relativeIndex = scenarioIndex - phase.start;
      progress = Math.round((relativeIndex / scenariosInPhase) * 100);
    } else if (isDone) {
      progress = 100;
    }

    return `
      <div class="phase-block ${isActive ? 'phase-block--active' : ''} ${isDone ? 'phase-block--done' : ''}">
        <div class="phase-icon">${phase.icon}</div>
        <div class="phase-label">${phase.label}</div>
        <div class="phase-progress-bar">
          <div class="phase-progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
  }).join('<div class="phase-separator">›</div>');

  return `
    <div class="phase-timeline">
      ${phasesHtml}
    </div>
  `;
}

/**
 * Render Night Score HUD
 */
function renderNightScoreHUD(nightScore) {
  const scoreClass = nightScore >= 85 ? 'score-legendary' :
                     nightScore >= 60 ? 'score-good' :
                     nightScore >= 35 ? 'score-survived' : 'score-kaos';

  return `
    <div class="night-score-hud">
      <div class="score-label">Night Score</div>
      <div class="score-value ${scoreClass}">${nightScore}</div>
      <div class="score-bar">
        <div class="score-bar-fill ${scoreClass}" style="width: ${Math.min(nightScore, 100)}%"></div>
      </div>
    </div>
  `;
}

/**
 * Render scenario card
 */
function renderScenarioCard(scenario, currentPhase) {
  const typeIcon = SCENARIO_TYPE_ICONS[scenario.type] || '?';
  const typeLabel = SCENARIO_TYPE_LABELS[scenario.type] || scenario.type;

  return `
    <div class="scenario-card">
      <div class="scenario-card-header">
        <div class="scenario-type-badge type-${scenario.type.toLowerCase()}">
          ${typeIcon} ${typeLabel}
        </div>
        <div class="scenario-base-score">Base: +${scenario.baseScore}</div>
      </div>
      <div class="scenario-name">${scenario.name}</div>
      <div class="scenario-text">${scenario.text}</div>
      <div class="scenario-requirements">
        <span class="req-label">Prag pobede:</span>
        <span class="req-value">${scenario.successThreshold}</span>
        <span class="req-label">Delimično:</span>
        <span class="req-value">${scenario.partialThreshold}</span>
      </div>
    </div>
  `;
}

/**
 * Render aftermath bar (max 3 icons)
 */
function renderAftermathBar(aftermathSummary) {
  if (aftermathSummary.length === 0) {
    return '<div class="aftermath-bar aftermath-bar--empty"><span class="aftermath-empty-label">Nema aftermath efekata</span></div>';
  }

  const iconsHtml = aftermathSummary.map(a => `
    <div class="aftermath-icon aftermath-icon--${a.type}" title="${a.label}">
      <span class="aftermath-arrow">${a.type === 'buff' ? '↑' : a.type === 'debuff' ? '↓' : '—'}</span>
      <span class="aftermath-stat">${STAT_ICONS[a.statAffected] || a.statAffected}</span>
      <span class="aftermath-duration">${a.remainingDuration}</span>
      <div class="aftermath-tooltip">${a.label} (${a.remainingDuration} scen.)</div>
    </div>
  `).join('');

  return `
    <div class="aftermath-bar">
      <span class="aftermath-bar-label">Aftermath:</span>
      <div class="aftermath-icons">${iconsHtml}</div>
    </div>
  `;
}

/**
 * Render crew bar (5 mini-portraits)
 */
function renderCrewBar(crew, topContributor, scenarioType, state) {
  const crewHtml = crew.map(member => {
    const isTop = topContributor && topContributor.id === member.id;
    const contribution = Math.round(member.getContribution(scenarioType) * 10) / 10;
    const isExhausted = member.isExhausted;
    const abilitySpent = state.spentAbilities && state.spentAbilities[member.id];

    return `
      <div class="crew-mini ${isTop ? 'crew-mini--top' : ''} ${isExhausted ? 'crew-mini--exhausted' : ''}">
        <div class="crew-mini-portrait" style="background-color: ${getMemberById(member.id)?.portraitColor || '#888'}40; border-color: ${getMemberById(member.id)?.portraitColor || '#888'}">
          ${getMemberById(member.id)?.portraitEmoji || '?'}
        </div>
        <div class="crew-mini-contribution">+${contribution}</div>
        ${abilitySpent ? '<div class="crew-mini-spent">💤</div>' : ''}
        ${isTop ? '<div class="crew-mini-crown">★</div>' : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="crew-bar">
      <div class="crew-bar-label">Ekipa</div>
      <div class="crew-bar-members">${crewHtml}</div>
    </div>
  `;
}

/**
 * Render choice buttons (if scenario has choices)
 */
function renderChoiceButtons(scenario, callbacks) {
  const choices = scenario.choices;
  if (!choices) return '';

  const choicesHtml = Object.entries(choices).map(([key, choice]) => `
    <button class="choice-btn" data-choice="${key}" data-action="select-choice">
      <div class="choice-text">${choice.text}</div>
      <div class="choice-bonuses">
        ${Object.entries(choice.statBonus || {}).map(([s, v]) => `
          <span class="choice-bonus">+${v} ${STAT_ICONS[s] || s}</span>
        `).join('')}
        ${Object.entries(choice.statPenalty || {}).map(([s, v]) => `
          <span class="choice-penalty">${v} ${STAT_ICONS[s] || s}</span>
        `).join('')}
      </div>
    </button>
  `).join('');

  return `
    <div class="choices-container">
      <div class="choices-label">Odluka:</div>
      <div class="choices-grid">${choicesHtml}</div>
    </div>
  `;
}

/**
 * Render ability buttons for crew
 */
function renderAbilityButtons(crew, state, callbacks) {
  const buttonsHtml = crew.map(member => {
    const memberData = getMemberById(member.id);
    if (!memberData || !memberData.activeAbility) return '';
    const isSpent = state.spentAbilities && state.spentAbilities[member.id];

    return `
      <button
        class="ability-btn ${isSpent ? 'ability-btn--spent' : 'ability-btn--ready'}"
        data-member-id="${member.id}"
        data-action="use-ability"
        ${isSpent ? 'disabled' : ''}
        title="${memberData.activeAbility.desc}"
      >
        <span class="ability-portrait" style="color: ${memberData.portraitColor}">${memberData.portraitEmoji}</span>
        <span class="ability-name">${memberData.activeAbility.name}</span>
        <span class="ability-status">${isSpent ? '(potrošeno)' : '1× po noći'}</span>
      </button>
    `;
  }).filter(Boolean).join('');

  return `
    <div class="abilities-panel">
      <div class="abilities-label">Sposobnosti</div>
      <div class="abilities-grid">${buttonsHtml}</div>
    </div>
  `;
}

/**
 * Render resolve button
 */
function renderResolveButton(scenario, state, callbacks) {
  return `
    <div class="resolve-section">
      <button class="btn-resolve btn-primary" id="btn-resolve" data-action="resolve-scenario">
        🎲 Rešavamo!
      </button>
    </div>
  `;
}

/**
 * Show scenario resolution result (overlay)
 * @param {Object} result - Resolution result from resolveScenario()
 * @param {Object} scenario - Scenario object
 * @param {Function} onContinue - Callback when player continues
 */
export function showResolutionResult(result, scenario, onContinue) {
  const { outcome, scoreGained, crewScore, passiveBonuses, abilityBonuses, synergyBonuses } = result;

  const outcomeText = scenario.getOutcomeText(outcome);
  const outcomeClass = `outcome-${outcome}`;
  const outcomeLabel = { win: 'WIN! 🎉', partial: 'PARTIAL 👍', fail: 'FAIL 💀' }[outcome] || outcome;

  const allBonuses = [...passiveBonuses, ...abilityBonuses, ...synergyBonuses].filter(Boolean);

  const overlay = document.createElement('div');
  overlay.className = `resolution-overlay ${outcomeClass}`;
  overlay.innerHTML = `
    <div class="resolution-content">
      <div class="resolution-badge ${outcomeClass}">${outcomeLabel}</div>
      <div class="resolution-score">+${scoreGained} poena</div>
      <div class="resolution-text">${outcomeText}</div>
      ${allBonuses.length > 0 ? `
        <div class="resolution-bonuses">
          ${allBonuses.map(b => `<div class="resolution-bonus-line">${b}</div>`).join('')}
        </div>
      ` : ''}
      ${result.newAftermath ? `
        <div class="resolution-aftermath ${result.newAftermath.type}">
          Aftermath: ${result.newAftermath.label}
        </div>
      ` : ''}
      <button class="btn-continue btn-primary" id="btn-continue">Nastavljamo →</button>
    </div>
  `;

  document.body.appendChild(overlay);
  // Animate in
  requestAnimationFrame(() => overlay.classList.add('resolution-overlay--visible'));

  overlay.querySelector('#btn-continue').addEventListener('click', () => {
    overlay.remove();
    onContinue && onContinue();
  });
}

/**
 * Show phase transition overlay
 * @param {string} nextPhase
 * @param {number} phaseScore
 * @param {Function} onContinue
 */
export function showPhaseTransition(nextPhase, phaseScore, onContinue) {
  const labels = { gathering: 'Sabiranje završeno!', peak: 'Vrh završen!', departure: 'Rastanak završen!', outro: 'Noć je gotova!' };
  const icons = { gathering: '🌅', peak: '🔥', departure: '🌙', outro: '⭐' };

  const overlay = document.createElement('div');
  overlay.className = 'phase-transition-overlay';
  overlay.innerHTML = `
    <div class="phase-transition-content">
      <div class="phase-transition-icon">${icons[nextPhase] || '→'}</div>
      <div class="phase-transition-label">${labels[nextPhase] || `Prelaz u ${nextPhase}`}</div>
      ${phaseScore > 0 ? `<div class="phase-transition-bonus">+${phaseScore} bonus poena!</div>` : ''}
      <button class="btn-continue btn-primary" id="btn-phase-continue">Nastavljamo...</button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('phase-transition-overlay--visible'));

  overlay.querySelector('#btn-phase-continue').addEventListener('click', () => {
    overlay.remove();
    onContinue && onContinue();
  });
}
