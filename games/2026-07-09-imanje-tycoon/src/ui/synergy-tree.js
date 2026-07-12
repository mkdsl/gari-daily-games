import { SYNERGY_DESCRIPTIONS, getSynergyProgress, getSynergyBonusBreakdown } from '../economy/synergies.js';
import { GAME_CONFIG } from '../config.js';

// ─── Main render ──────────────────────────────────────────────────────────────

/**
 * Render synergy tree into container element.
 * Shows active/locked state, progress toward unlock, and bonus descriptions.
 * @param {HTMLElement} container
 * @param {object} state
 */
export function updateSynergyTree(container, state) {
  const nodes = ['komposter', 'mulj', 'ekosistem'];
  const bonuses = getSynergyBonusBreakdown(state);

  let html = '<div class="synergy-tree">';
  html += `<div class="synergy-tree-header">
    <span class="synergy-title">🌿 Permakulturne Sinergije</span>
    <span class="synergy-count">${nodes.filter(k => state.synergies[k]).length}/${nodes.length} aktivno</span>
  </div>`;
  html += '<div class="synergy-nodes">';

  for (const key of nodes) {
    const info = SYNERGY_DESCRIPTIONS[key];
    const active = state.synergies[key];
    const progress = getSynergyProgress(state, key);
    const bonus = bonuses.find(b => b.id === key);
    const pct = progress.total > 0 ? Math.round((progress.met / progress.total) * 100) : 0;

    html += buildSynergyNode(key, info, active, progress, bonus, pct);
  }

  html += '</div>';

  // Summary row if all active
  if (state.synergies.komposter && state.synergies.mulj && state.synergies.ekosistem) {
    html += `<div class="synergy-all-active">
      🏆 Sve sinergije aktivne! Permakulturna zatvorena petlja ostvarena.
    </div>`;
  }

  // Ekosistem masterclass progress
  if (!state.synergies.ekosistem && state.masterclassCount > 0) {
    const needed = 3;
    const have = state.masterclassCount;
    if (have < needed) {
      html += `<div class="synergy-mc-progress">
        🎓 Ekosistem: ${have}/${needed} masterclass sesija (još ${needed - have} potrebno)
      </div>`;
    }
  }

  html += '</div>';
  container.innerHTML = html;
}

// ─── Node builder ─────────────────────────────────────────────────────────────

function buildSynergyNode(key, info, active, progress, bonus, pct) {
  const conditionsList = progress.conditions.map(c => `
    <li class="syn-cond ${c.met ? 'cond-met' : 'cond-unmet'}">
      ${c.met ? '✓' : '○'} ${c.label}
    </li>
  `).join('');

  const bonusText = bonus ? bonus.bonus : '';
  const bonusDesc = bonus ? bonus.desc : '';

  return `
    <div class="synergy-node ${active ? 'synergy-active' : 'synergy-locked'} synergy-${key}">
      <div class="syn-header">
        <span class="syn-icon">${info.icon}</span>
        <div class="syn-title-group">
          <div class="syn-name">${info.name}</div>
          <div class="syn-status-badge ${active ? 'status-active' : 'status-locked'}">
            ${active ? '✓ Aktivno' : `${progress.met}/${progress.total}`}
          </div>
        </div>
      </div>

      <div class="syn-desc">${info.desc}</div>

      ${active ? `
        <div class="syn-bonus-active">
          <span class="syn-bonus-label">Bonus:</span>
          <span class="syn-bonus-value">${bonusText}</span>
        </div>
        <div class="syn-bonus-desc">${bonusDesc}</div>
      ` : `
        <div class="syn-progress-row">
          <div class="syn-progress-bar">
            <div class="syn-progress-fill" style="width:${pct}%"></div>
          </div>
          <span class="syn-progress-pct">${pct}%</span>
        </div>
        <ul class="syn-conditions">${conditionsList}</ul>
      `}
    </div>
  `;
}

// ─── Compact view ─────────────────────────────────────────────────────────────

/**
 * Render compact synergy row (for HUD/header use).
 * @param {HTMLElement} container
 * @param {object} state
 */
export function updateSynergyCompact(container, state) {
  const nodes = [
    { key: 'komposter', icon: '♻️' },
    { key: 'mulj', icon: '💧' },
    { key: 'ekosistem', icon: '🌿' },
  ];

  let html = '<div class="synergy-compact">';
  for (const { key, icon } of nodes) {
    const active = state.synergies[key];
    html += `<span class="syn-compact-dot ${active ? 'dot-active' : 'dot-locked'}" title="${SYNERGY_DESCRIPTIONS[key].name}: ${active ? 'Aktivno' : 'Neaktivno'}">${icon}</span>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

// ─── Tooltip builder ──────────────────────────────────────────────────────────

/**
 * Build tooltip text for a synergy (for title attributes).
 * @param {string} key
 * @param {object} state
 * @returns {string}
 */
export function buildSynergyTooltip(key, state) {
  const info = SYNERGY_DESCRIPTIONS[key];
  const active = state.synergies[key];
  const progress = getSynergyProgress(state, key);
  const lines = [info.desc];
  if (!active) {
    lines.push(`Potrebno (${progress.met}/${progress.total}):`);
    progress.conditions.forEach(c => lines.push(`  ${c.met ? '✓' : '○'} ${c.label}`));
  } else {
    lines.push('Aktivno!');
  }
  return lines.join('\n');
}

// ─── Revenue bonus display ─────────────────────────────────────────────────────

/**
 * Get formatted synergy revenue bonus for display.
 * @param {object} state
 * @returns {string}
 */
export function getSynergyBonusText(state) {
  const bonuses = getSynergyBonusBreakdown(state);
  const activeBonuses = bonuses.filter(b => {
    if (b.id === 'komposter') return state.synergies.komposter;
    if (b.id === 'mulj') return state.synergies.mulj;
    if (b.id === 'ekosistem') return state.synergies.ekosistem;
    return false;
  });

  if (activeBonuses.length === 0) return 'Nema aktivnih sinergija';
  return activeBonuses.map(b => b.bonus).join(' + ');
}

/**
 * Get next synergy to unlock recommendation.
 * @param {object} state
 * @returns {{ key, name, icon, missing } | null}
 */
export function getNextSynergyToUnlock(state) {
  const order = ['mulj', 'komposter', 'ekosistem'];
  for (const key of order) {
    if (!state.synergies[key]) {
      const info = SYNERGY_DESCRIPTIONS[key];
      const progress = getSynergyProgress(state, key);
      const missing = progress.conditions.filter(c => !c.met).map(c => c.label);
      return { key, name: info.name, icon: info.icon, missing };
    }
  }
  return null; // All active
}
