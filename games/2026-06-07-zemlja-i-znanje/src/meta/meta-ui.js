/**
 * meta-ui.js — Meta ekran: career overview, achievements grid, prestiž prompt
 */

import { bus, EVT } from '../events.js';
import { getCareerSummary } from './career-stats.js';
import { getUnlockedAchievements, getTotalAchievements, ACHIEVEMENTS_DEF } from './achievements.js';
import { isPrestigeAvailable, getPrestigeChoices, executePrestige } from './prestige.js';
import { getRepLabel, getRepProgress } from './reputation.js';
import { getMultiplierBreakdown } from './multipliers.js';
import { formatEur, formatPct, el, clearEl, createEl } from '../utils.js';
import { getBrandLinkHTML } from '../content/brand-hooks.js';
import { getCurrentEra } from './era-manager.js';
import { STAFF_LIST } from '../macro/staff-roster.js';

/**
 * Render meta ekran u container
 */
export function renderMetaScreen(container, metaState, macroState) {
  clearEl(container);

  const summary = getCareerSummary(metaState);
  const unlockedAch = getUnlockedAchievements(metaState);
  const totalAch = getTotalAchievements();
  const era = getCurrentEra(metaState.reputation || 0);
  const repProgress = getRepProgress(metaState.reputation || 0);
  const multipliers = getMultiplierBreakdown(metaState.prestigeLevel || 0, metaState.unlockedStaff || [], metaState.toolUpgrades || {});
  const canPrestige = isPrestigeAvailable(metaState.reputation || 0, metaState.totalSeasons || 0);

  container.innerHTML = `
    <div class="meta-screen">
      <div class="meta-header">
        <h2 class="meta-title">Karijera</h2>
        <div class="meta-era">${era.name}: ${era.description}</div>
      </div>

      <div class="meta-rep-section">
        <div class="meta-rep-label">${getRepLabel(metaState.reputation || 0)}</div>
        <div class="meta-rep-value">${Math.round(metaState.reputation || 0)} / 1000</div>
        <div class="meta-rep-bar">
          <div class="meta-rep-fill" style="width:${(repProgress.progress * 100).toFixed(1)}%"></div>
        </div>
        <div class="meta-rep-next">Do sledećeg: ${repProgress.remaining} rep</div>
      </div>

      <div class="meta-stats-grid">
        <div class="meta-stat"><span>Sesije:</span><strong>${summary.totalSessions}</strong></div>
        <div class="meta-stat"><span>Polaznici:</span><strong>${summary.totalParticipants}</strong></div>
        <div class="meta-stat"><span>Prihod:</span><strong>${formatEur(summary.totalRevenue)}</strong></div>
        <div class="meta-stat"><span>Prestiž:</span><strong>${metaState.prestigeLevel || 0}</strong></div>
        <div class="meta-stat"><span>Bez incidenta:</span><strong>${summary.sessionsWithoutIncident}</strong></div>
        <div class="meta-stat"><span>Achievements:</span><strong>${unlockedAch.length}/${totalAch}</strong></div>
      </div>

      ${multipliers.length ? `
        <div class="meta-multipliers">
          <h3>Aktivni multiplikatori</h3>
          ${multipliers.map(m => `<div class="mult-row"><span>${m.name}</span><span class="mult-val">${m.value}</span></div>`).join('')}
        </div>
      ` : ''}

      <div class="meta-achievements">
        <h3>Achievements (${unlockedAch.length}/${totalAch})</h3>
        <div class="ach-grid">
          ${Object.values(ACHIEVEMENTS_DEF).map(def => {
            const unlocked = metaState.achievements?.[def.id]?.unlocked;
            return `<div class="ach-item ${unlocked ? 'unlocked' : 'locked'}" title="${def.description}">
              <span class="ach-icon">${def.icon}</span>
              <span class="ach-name">${def.name}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      ${canPrestige ? renderPrestigePrompt(metaState, macroState) : ''}

      <div class="meta-actions">
        <button class="btn-primary" id="btn-meta-back">← Nazad</button>
      </div>

      ${getBrandLinkHTML('small')}
    </div>
  `;

  // Bind back
  const btnBack = el('#btn-meta-back', container);
  if (btnBack) btnBack.addEventListener('click', () => {
    bus.emit(EVT.SCREEN_CHANGE, { screen: 'planning' });
  });

  // Prestige
  const btnPrestige = el('#btn-do-prestige', container);
  if (btnPrestige) btnPrestige.addEventListener('click', () => {
    const keptStaff = el('#prestige-kept-staff', container)?.value || null;
    executePrestige(metaState, macroState, keptStaff, null);
    bus.emit(EVT.SCREEN_CHANGE, { screen: 'planning' });
  });
}

function renderPrestigePrompt(metaState, macroState) {
  const choices = getPrestigeChoices(metaState, macroState);
  const availableStaff = (metaState.unlockedStaff || []).filter(s => s !== 'alatko');

  return `
    <div class="prestige-prompt">
      <h3>✨ Prestiž Reset dostupan!</h3>
      <p>Multiplier: ${choices.multiplier.toFixed(2)}× | Start rep: ${choices.startRep}</p>
      <p>Odaberi stručnjaka za zadržati:</p>
      <select id="prestige-kept-staff">
        <option value="">Bez stručnjaka</option>
        ${availableStaff.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <button class="btn-prestige" id="btn-do-prestige">Pokreni Prestiž Reset</button>
    </div>
  `;
}
