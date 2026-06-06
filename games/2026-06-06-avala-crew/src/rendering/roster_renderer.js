/**
 * roster_renderer.js — Render roster screen
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { CREW_DATA, getMemberById } from '../content/crew_data.js';
import { SYNERGIES_DATA } from '../content/synergies_data.js';
import { detectSynergies, getNearbySynergies } from '../systems/synergy.js';
import { ROLE_LABELS, STAT_LABELS, STAT_ICONS } from '../config.js';

/**
 * Render the full roster screen into #screen-roster
 * @param {Object} state - Full game state
 * @param {Object} callbacks - {onCardClick, onRoleChange, onStartNight}
 */
export function renderRosterScreen(state, callbacks) {
  const screen = document.getElementById('screen-roster');
  if (!screen) return;

  const crewIds = state.activeCrew.map(c => c.memberId);
  const activeSynergies = detectSynergies(crewIds);
  const nearbySynergies = getNearbySynergies(crewIds);
  const canStart = state.activeCrew.length === 5;

  screen.innerHTML = `
    <div class="roster-container">
      ${renderRosterHeader(state)}
      <div class="roster-main">
        <div class="roster-left">
          ${renderAvailableCards(state, callbacks)}
        </div>
        <div class="roster-right">
          ${renderSelectedSlots(state, callbacks)}
          ${renderSynergyPanel(activeSynergies, nearbySynergies)}
        </div>
      </div>
      <div class="roster-footer">
        <button
          class="btn-start-night ${canStart ? 'btn-primary' : 'btn-disabled'}"
          id="btn-start-night"
          ${canStart ? '' : 'disabled'}
          data-action="start-night"
        >
          ${canStart ? '🌙 Kreni u noć!' : `Odaberi još ${5 - state.activeCrew.length} članova`}
        </button>
      </div>
    </div>
  `;

  // Attach button handler
  const startBtn = screen.querySelector('#btn-start-night');
  if (startBtn && canStart) {
    startBtn.addEventListener('click', () => callbacks.onStartNight && callbacks.onStartNight());
  }
}

/**
 * Render roster header with XP, prestige, completed nights
 */
function renderRosterHeader(state) {
  return `
    <div class="roster-header">
      <div class="roster-title">
        <h1>Avala Crew</h1>
        <div class="roster-subtitle">Sastavi ekipu za 20. jun</div>
      </div>
      <div class="roster-stats">
        <div class="stat-pill">
          <span class="stat-label">XP</span>
          <span class="stat-value">${state.crewXP}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">Noći</span>
          <span class="stat-value">${state.completedNights}</span>
        </div>
        ${state.prestigeLevel > 0 ? `
          <div class="stat-pill prestige-pill">
            <span class="stat-label">Prestige</span>
            <span class="stat-value">${state.prestigeLevel}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render all available (unlocked) crew cards
 */
function renderAvailableCards(state, callbacks) {
  const unlocked = state.unlockedMembers || [];
  const selectedIds = state.activeCrew.map(c => c.memberId);

  let html = '<div class="available-cards-header"><h2>Dostupni članovi</h2></div>';
  html += '<div class="available-cards-grid">';

  for (const member of Object.values(CREW_DATA)) {
    if (member.id === 'tonovic' && !unlocked.includes('tonovic')) {
      // Coming soon card
      html += renderComingSoonCard(member);
      continue;
    }
    if (!unlocked.includes(member.id)) {
      html += renderLockedCard(member, state);
      continue;
    }

    const isSelected = selectedIds.includes(member.id);
    const slotIndex = state.activeCrew.findIndex(c => c.memberId === member.id);
    html += renderCrewCard(member, isSelected, slotIndex, callbacks);
  }

  html += '</div>';
  return html;
}

/**
 * Render a single crew card (available/selected state)
 */
function renderCrewCard(member, isSelected, slotIndex, callbacks) {
  const stats = member.stats;
  const statBars = Object.entries(stats).map(([stat, val]) => `
    <div class="stat-bar-row">
      <span class="stat-icon">${STAT_ICONS[stat]}</span>
      <div class="stat-bar-track">
        <div class="stat-bar-fill stat-${stat.toLowerCase()}" style="width: ${val * 20}%"></div>
      </div>
      <span class="stat-num">${val}</span>
    </div>
  `).join('');

  return `
    <div class="crew-card ${isSelected ? 'crew-card--selected' : ''}"
         data-member-id="${member.id}"
         data-action="toggle-member"
         style="--card-color: ${member.portraitColor}"
         title="${member.flavorText}">
      <div class="crew-card-portrait" style="background-color: ${member.portraitColor}20; border-color: ${member.portraitColor}">
        <span class="crew-card-emoji">${member.portraitEmoji}</span>
        ${isSelected ? '<div class="crew-card-checkmark">✓</div>' : ''}
      </div>
      <div class="crew-card-info">
        <div class="crew-card-name">${member.name}</div>
        <div class="crew-card-archetype">${member.archetype}</div>
        <div class="crew-card-stats">${statBars}</div>
        <div class="crew-card-passive" title="${member.passiveTrait.desc}">
          💡 ${member.passiveTrait.name}
        </div>
        <div class="crew-card-ability" title="${member.activeAbility.desc}">
          ⚡ ${member.activeAbility.name}: ${member.activeAbility.desc}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render locked card (shows unlock condition)
 */
function renderLockedCard(member, state) {
  return `
    <div class="crew-card crew-card--locked" data-member-id="${member.id}">
      <div class="crew-card-portrait crew-card-portrait--locked">
        <span class="crew-card-emoji">🔒</span>
      </div>
      <div class="crew-card-info">
        <div class="crew-card-name">${member.name}</div>
        <div class="crew-card-archetype">${member.archetype}</div>
        <div class="crew-card-unlock-cond">
          Otključaj: ${member.unlockConditionLabel || member.unlockCondition}
        </div>
        <div class="crew-card-xp-progress">
          ${getUnlockProgress(member, state)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Tonović "coming soon" card
 */
function renderComingSoonCard(member) {
  return `
    <div class="crew-card crew-card--coming-soon" data-member-id="${member.id}">
      <div class="crew-card-portrait crew-card-portrait--coming-soon" style="border-color: ${member.portraitColor}">
        <span class="crew-card-emoji">${member.portraitEmoji}</span>
        <div class="coming-soon-badge">SOON</div>
      </div>
      <div class="crew-card-info">
        <div class="crew-card-name">${member.name}</div>
        <div class="crew-card-archetype">${member.archetype}</div>
        <div class="clubs-badge">🎵 Kluboslavija</div>
        <div class="crew-card-unlock-cond">Dostupan posle Legendary noći</div>
        <div class="coming-soon-desc">DJ sa Avala festivala 20. juna. Prava verzija stiže uskoro...</div>
      </div>
    </div>
  `;
}

/**
 * Render selected crew slots with role assignment
 */
function renderSelectedSlots(state, callbacks) {
  const roles = Object.keys(ROLE_LABELS);
  let html = '<div class="selected-slots">';
  html += '<h3>Moja ekipa (5/5)</h3>';
  html += `<div class="slots-progress">
    <div class="slots-bar">
      <div class="slots-bar-fill" style="width: ${(state.activeCrew.length / 5) * 100}%"></div>
    </div>
    <span class="slots-count">${state.activeCrew.length}/5</span>
  </div>`;

  for (let i = 0; i < 5; i++) {
    const slot = state.activeCrew[i];
    if (!slot) {
      html += `
        <div class="crew-slot crew-slot--empty" data-slot="${i}">
          <div class="slot-number">${i + 1}</div>
          <div class="slot-empty-text">Slobodan slot</div>
        </div>
      `;
    } else {
      const member = getMemberById(slot.memberId);
      if (!member) continue;
      const isPrimaryRole = member.primaryRole === slot.role;

      html += `
        <div class="crew-slot crew-slot--filled ${isPrimaryRole ? 'crew-slot--good-fit' : ''}" data-slot="${i}">
          <div class="slot-portrait" style="background-color: ${member.portraitColor}30; border-color: ${member.portraitColor}">
            <span class="slot-emoji">${member.portraitEmoji}</span>
            ${isPrimaryRole ? '<span class="good-fit-badge" title="Prirodna uloga +10%">✓</span>' : ''}
          </div>
          <div class="slot-info">
            <div class="slot-name">${member.name}</div>
            <select class="role-select" data-member-id="${slot.memberId}" data-action="change-role">
              ${roles.map(role => `
                <option value="${role}" ${slot.role === role ? 'selected' : ''}>
                  ${ROLE_LABELS[role]}${role === member.primaryRole ? ' ★' : ''}
                </option>
              `).join('')}
            </select>
          </div>
          <button class="slot-remove" data-member-id="${slot.memberId}" data-action="remove-member" title="Ukloni iz ekipe">×</button>
        </div>
      `;
    }
  }

  html += '</div>';
  return html;
}

/**
 * Render synergy preview panel
 */
function renderSynergyPanel(activeSynergies, nearbySynergies) {
  let html = '<div class="synergy-panel">';
  html += '<h3>🔗 Sinergije</h3>';

  if (activeSynergies.length === 0 && nearbySynergies.length === 0) {
    html += '<div class="synergy-empty">Odaberi članove koji se dopunjuju...</div>';
  }

  // Active synergies
  if (activeSynergies.length > 0) {
    html += '<div class="synergies-active">';
    html += '<div class="synergy-section-title">✨ Aktivne</div>';
    for (const syn of activeSynergies) {
      html += `
        <div class="synergy-tag synergy-tag--active">
          <span class="synergy-name">${syn.name}</span>
          <span class="synergy-desc">${syn.shortDesc}</span>
        </div>
      `;
    }
    html += '</div>';
  }

  // Nearby synergies (1 member away)
  if (nearbySynergies.length > 0) {
    html += '<div class="synergies-nearby">';
    html += '<div class="synergy-section-title">💡 Blizu</div>';
    for (const { synergy, missing } of nearbySynergies.slice(0, 3)) {
      html += `
        <div class="synergy-tag synergy-tag--nearby">
          <span class="synergy-name">${synergy.name}</span>
          <span class="synergy-missing">Fali: ${missing.join(', ')}</span>
        </div>
      `;
    }
    html += '</div>';
  }

  // All visible synergies reference
  const visibleSynergies = Object.values(SYNERGIES_DATA).filter(s => s.visible);
  html += '<details class="synergy-all">';
  html += '<summary class="synergy-all-toggle">Sve sinergije ▼</summary>';
  html += '<div class="synergy-list">';
  for (const syn of visibleSynergies) {
    const isActive = activeSynergies.some(a => a.synergyId === syn.id);
    html += `
      <div class="synergy-item ${isActive ? 'synergy-item--active' : ''}">
        <div class="synergy-item-header">
          <span class="synergy-item-name">${syn.name}</span>
          <span class="synergy-item-members">${syn.members.join(' + ')}</span>
        </div>
        <div class="synergy-item-effect">${syn.shortDesc}</div>
      </div>
    `;
  }
  html += '</div></details>';

  html += '</div>';
  return html;
}

/**
 * Get unlock progress text
 */
function getUnlockProgress(member, state) {
  if (!member.unlockCondition) return '';

  if (member.unlockCondition.startsWith('xp_')) {
    const needed = parseInt(member.unlockCondition.split('_')[1]);
    const current = state.crewXP || 0;
    const pct = Math.min(100, Math.round((current / needed) * 100));
    return `
      <div class="unlock-progress">
        <div class="unlock-bar">
          <div class="unlock-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="unlock-text">XP: ${current}/${needed}</span>
      </div>
    `;
  }

  if (member.unlockCondition.startsWith('nights_')) {
    const needed = parseInt(member.unlockCondition.split('_')[1]);
    const current = state.completedNights || 0;
    const pct = Math.min(100, Math.round((current / needed) * 100));
    return `
      <div class="unlock-progress">
        <div class="unlock-bar">
          <div class="unlock-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="unlock-text">Noći: ${current}/${needed}</span>
      </div>
    `;
  }

  return `<div class="unlock-condition">${member.unlockConditionLabel || member.unlockCondition}</div>`;
}
