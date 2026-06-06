/**
 * render.js — Card DOM element creator, CSS pixel art portraits, phase visualization
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { getMemberById } from './content/crew_data.js';
import { STAT_ICONS, STAT_LABELS, ROLE_LABELS } from './config.js';

/**
 * Create a crew card DOM element with CSS pixel art portrait
 * @param {Object} member - Member data from CREW_DATA
 * @param {Object} [state] - Optional game state (for selected/spent state)
 * @param {Object} [options] - {interactive, showAbility, showPassive, showStats, size}
 * @returns {HTMLElement}
 */
export function createCrewCard(member, state = {}, options = {}) {
  const {
    interactive = true,
    showAbility = true,
    showPassive = true,
    showStats = true,
    size = 'normal' // 'small'|'normal'|'large'
  } = options;

  const isSelected = state.activeCrew && state.activeCrew.some(c => c.memberId === member.id);
  const abilitySpent = state.spentAbilities && state.spentAbilities[member.id];
  const isLocked = state.unlockedMembers && !state.unlockedMembers.includes(member.id);

  const card = document.createElement('div');
  card.className = `crew-card crew-card--${size} ${isSelected ? 'crew-card--selected' : ''} ${isLocked ? 'crew-card--locked' : ''}`;
  card.dataset.memberId = member.id;
  if (interactive) card.dataset.action = 'toggle-member';
  card.style.setProperty('--card-color', member.portraitColor);

  card.innerHTML = `
    ${createPortraitHTML(member, { isSelected, abilitySpent })}
    <div class="crew-card-body">
      <div class="crew-card-name">${member.name}</div>
      <div class="crew-card-archetype">${member.archetype}</div>
      ${showStats ? createStatBarsHTML(member.stats) : ''}
      ${showPassive && member.passiveTrait ? `
        <div class="crew-card-passive" title="${member.passiveTrait.desc}">
          💡 <strong>${member.passiveTrait.name}</strong>
        </div>
      ` : ''}
      ${showAbility && member.activeAbility ? `
        <div class="crew-card-ability ${abilitySpent ? 'crew-card-ability--spent' : ''}" title="${member.activeAbility.desc}">
          ⚡ <strong>${member.activeAbility.name}</strong>${abilitySpent ? ' (potrošeno)' : ''}
        </div>
      ` : ''}
      ${isLocked ? `<div class="crew-card-locked-overlay"><span>🔒</span></div>` : ''}
    </div>
  `;

  return card;
}

/**
 * Create CSS pixel art portrait HTML
 * Uses box-shadow trick to create pixel art feel from emoji + border
 * @param {Object} member
 * @param {Object} options
 * @returns {string}
 */
function createPortraitHTML(member, options = {}) {
  const { isSelected = false, abilitySpent = false } = options;
  const color = member.portraitColor;

  // Generate CSS pixel art background using box-shadow grid
  const pixelStyle = generatePixelPortraitStyle(member.id, color);

  return `
    <div class="crew-card-portrait"
         style="border-color: ${color}; background: ${color}15; ${pixelStyle}"
         title="${member.flavorText || member.name}">
      <div class="portrait-pixel-art" style="--portrait-color: ${color}">
        <span class="portrait-emoji">${member.portraitEmoji}</span>
      </div>
      ${isSelected ? '<div class="portrait-selected-ring" style="border-color: ' + color + '"></div>' : ''}
      ${abilitySpent ? '<div class="portrait-spent-indicator">💤</div>' : ''}
    </div>
  `;
}

/**
 * Generate CSS pixel art style for portrait
 * Creates a distinctive pixel pattern per member ID
 * @param {string} memberId
 * @param {string} color - hex color
 * @returns {string} CSS box-shadow value as inline style string
 */
function generatePixelPortraitStyle(memberId, color) {
  // Create a deterministic pixel pattern from memberId hash
  const hash = memberId.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // Lighten for pixel art accent
  const accent = `rgba(${Math.min(r + 60, 255)}, ${Math.min(g + 60, 255)}, ${Math.min(b + 60, 255)}, 0.3)`;

  return `--pixel-accent: ${accent}`;
}

/**
 * Create stat bars HTML
 * @param {{E: number, S: number, P: number, L: number}} stats
 * @returns {string}
 */
function createStatBarsHTML(stats) {
  const maxStat = 5;
  const barsHtml = Object.entries(stats).map(([stat, val]) => {
    const pct = Math.round((val / maxStat) * 100);
    return `
      <div class="stat-bar-row">
        <span class="stat-bar-icon" title="${STAT_LABELS[stat] || stat}">${STAT_ICONS[stat]}</span>
        <div class="stat-bar-track">
          <div class="stat-bar-fill stat-bar-${stat.toLowerCase()}" style="width: ${pct}%"></div>
        </div>
        <span class="stat-bar-num">${val}</span>
      </div>
    `;
  }).join('');

  return `<div class="crew-card-stats">${barsHtml}</div>`;
}

/**
 * Create a phase timeline bar element
 * @param {string} currentPhase - 'gathering'|'peak'|'departure'
 * @param {number} scenarioIndex - 0-based (0-9)
 * @returns {HTMLElement}
 */
export function createPhaseTimeline(currentPhase, scenarioIndex) {
  const phases = [
    { id: 'gathering', label: 'Sabiranje', icon: '🌅', count: 3 },
    { id: 'peak', label: 'Vrh', icon: '🔥', count: 4 },
    { id: 'departure', label: 'Rastanak', icon: '🌙', count: 3 }
  ];

  const el = document.createElement('div');
  el.className = 'phase-timeline';

  let scenarioOffset = 0;
  phases.forEach((phase, idx) => {
    const isActive = currentPhase === phase.id;
    const isDone = (idx === 0 && scenarioIndex >= 3) || (idx === 1 && scenarioIndex >= 7);

    const block = document.createElement('div');
    block.className = `phase-block ${isActive ? 'phase-block--active' : ''} ${isDone ? 'phase-block--done' : ''}`;
    block.innerHTML = `
      <span class="phase-block-icon">${phase.icon}</span>
      <span class="phase-block-label">${phase.label}</span>
    `;
    el.appendChild(block);

    if (idx < phases.length - 1) {
      const sep = document.createElement('div');
      sep.className = 'phase-sep';
      sep.textContent = '›';
      el.appendChild(sep);
    }

    scenarioOffset += phase.count;
  });

  return el;
}

/**
 * Create a mini crew portrait for crew bar
 * @param {Object} member - Member data
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function createMiniPortrait(member, options = {}) {
  const { isTop = false, isExhausted = false, contribution = 0 } = options;

  const el = document.createElement('div');
  el.className = `crew-mini ${isTop ? 'crew-mini--top' : ''} ${isExhausted ? 'crew-mini--exhausted' : ''}`;
  el.style.setProperty('--card-color', member.portraitColor);
  el.innerHTML = `
    <div class="crew-mini-face" style="border-color: ${member.portraitColor}">
      ${member.portraitEmoji}
    </div>
    <div class="crew-mini-label">${contribution > 0 ? '+' + Math.round(contribution * 10) / 10 : ''}</div>
  `;

  return el;
}

/**
 * Create aftermath icon element
 * @param {Object} aftermath - {type, label, statAffected, magnitude, remainingDuration}
 * @returns {HTMLElement}
 */
export function createAftermathIcon(aftermath) {
  const el = document.createElement('div');
  el.className = `aftermath-icon aftermath-icon--${aftermath.type}`;
  el.title = `${aftermath.label} (${aftermath.remainingDuration} scen.)`;

  const arrow = aftermath.type === 'buff' ? '↑' : aftermath.type === 'debuff' ? '↓' : '—';
  const statIcon = STAT_ICONS[aftermath.statAffected] || aftermath.statAffected;

  el.innerHTML = `
    <span class="aftermath-arrow">${arrow}</span>
    <span class="aftermath-stat">${statIcon}</span>
    <span class="aftermath-duration">${aftermath.remainingDuration}</span>
  `;

  return el;
}

/**
 * Create score popup element (+N)
 * @param {number} scoreGained
 * @param {string} outcome
 * @returns {HTMLElement}
 */
export function createScorePopup(scoreGained, outcome) {
  const el = document.createElement('div');
  el.className = `score-popup score-popup--${outcome}`;
  el.textContent = scoreGained > 0 ? `+${scoreGained}` : '0';

  // Self-removing animation
  el.addEventListener('animationend', () => el.remove());

  return el;
}

/**
 * Create scenario outcome badge
 * @param {'win'|'partial'|'fail'} outcome
 * @returns {HTMLElement}
 */
export function createOutcomeBadge(outcome) {
  const labels = { win: 'WIN! 🎉', partial: 'PARTIAL', fail: 'FAIL 💀' };
  const el = document.createElement('div');
  el.className = `outcome-badge outcome-badge--${outcome}`;
  el.textContent = labels[outcome] || outcome;
  return el;
}

/**
 * Generate intro screen HTML
 * @returns {string}
 */
export function renderIntroScreen() {
  return `
    <div class="intro-container">
      <div class="intro-logo">
        <div class="intro-logo-text">AVALA CREW</div>
        <div class="intro-logo-sub">festival crew builder</div>
      </div>
      <div class="intro-description">
        Sastaviš ekipu od 5 ljudi za Avala festival noć.<br>
        Biraš ko ide, dodeliš uloge, i vodiš ekipu kroz 10 scenarija.<br>
        Sinergije, Aftermath efekti, i share karta na kraju.
      </div>
      <div class="intro-festival-info">
        <div class="intro-festival-date">🎉 20. jun 2026</div>
        <div class="intro-festival-name">Kluboslavija na Avali</div>
      </div>
      <button class="btn-start btn-primary" id="btn-intro-start" data-action="start-game">
        ⚡ Sastavi ekipu!
      </button>
      <div class="intro-credits">
        <span>Gari Daily Games</span> · <span>2026-06-06</span>
      </div>
    </div>
  `;
}
