/** @module rendering/incident_modal — turn-based incident modal */

import { getActiveIncident, resolveIncident } from '../systems/incident_manager.js';
import { computeUpgradeEffects } from '../systems/upgrade_manager.js';

/** @type {HTMLElement|null} */
let _modalEl = null;
/** @type {Function|null} */
let _onResolveCallback = null;

/**
 * Initialize modal element reference
 */
export function initIncidentModal() {
  _modalEl = document.getElementById('incident-modal');
}

/**
 * Set callback for when incident is resolved
 * @param {Function} cb
 */
export function setOnResolveCallback(cb) {
  _onResolveCallback = cb;
}

/**
 * Update incident modal visibility and content
 * @param {import('../state.js').MicroState} micro
 * @param {import('../state.js').MacroState} macro
 */
export function updateIncidentModal(micro, macro) {
  if (!_modalEl) return;

  const incident = getActiveIncident(micro);
  if (!incident) {
    _modalEl.classList.add('hidden');
    return;
  }

  _modalEl.classList.remove('hidden');
  const upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);

  const options = getIncidentOptions(incident, macro, upgradeEffects);
  const severityColor = getSeverityColor(incident.severity);

  _modalEl.innerHTML = `
    <div class="incident-content">
      <div class="incident-severity" style="color: ${severityColor}; border-color: ${severityColor}">
        ${incident.severity}
      </div>
      <h2 class="incident-title">${getIncidentTitle(incident.type)}</h2>
      <p class="incident-desc">${getIncidentDescription(incident)}</p>
      <div class="incident-options">
        ${options.map((opt, i) => `
          <button
            class="incident-option ${!opt.available ? 'disabled' : ''}"
            data-index="${i}"
            ${!opt.available ? 'disabled' : ''}
          >
            <span class="opt-label">${opt.label}</span>
            <span class="opt-cost" style="color: ${opt.costColor}">${opt.costText}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Bind option clicks
  _modalEl.querySelectorAll('.incident-option:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const outcome = resolveIncident(micro, macro, incident.id, idx,
        micro.crowd_groups, micro.zones, upgradeEffects);
      if (_onResolveCallback) _onResolveCallback(outcome);
      updateIncidentModal(micro, macro);
    });
  });
}

/**
 * Get incident options for display
 */
function getIncidentOptions(incident, macro, upgradeEffects) {
  switch (incident.type) {
    case 'CROWD_OVERFLOW':
      return [
        {
          label: 'Otvori rezervni izlaz',
          costText: '-80 EUR',
          costColor: macro.budget >= 80 ? '#ffb830' : '#ff4444',
          available: macro.budget >= 80,
        },
        {
          label: 'DJ najava',
          costText: 'Besplatno (60% follow, 10s delay)',
          costColor: '#4a7c59',
          available: true,
        },
        {
          label: 'Ignoriši',
          costText: 'Mood -0.1/s',
          costColor: '#ff4444',
          available: true,
        },
      ];

    case 'FLOOR_TOO_COLD':
      return [
        {
          label: 'Spotlight moment',
          costText: '-120 EUR, mood +0.25, BPM→108',
          costColor: macro.budget >= 120 ? '#ffb830' : '#ff4444',
          available: macro.budget >= 120,
        },
        {
          label: 'Runda za kuću (Bar)',
          costText: '-60 EUR, bar mood +0.2',
          costColor: macro.budget >= 60 ? '#ffb830' : '#ff4444',
          available: macro.budget >= 60,
        },
        {
          label: 'Čekaj',
          costText: 'Ništa se ne dešava',
          costColor: '#6a6a9a',
          available: true,
        },
      ];

    case 'EQUIPMENT_FAILURE': {
      const freeTech = upgradeEffects.free_technician;
      const techCost = freeTech ? 0 : 200;
      return [
        {
          label: 'Tehničar na licu mesta',
          costText: freeTech ? 'Besplatno (V5)' : `-${techCost} EUR, 15s repair`,
          costColor: macro.budget >= techCost ? '#ffb830' : '#ff4444',
          available: macro.budget >= techCost,
        },
        {
          label: 'Improvizovani DJ set',
          costText: 'BPM=100 za 30s, mood -0.15',
          costColor: '#ffb830',
          available: true,
        },
        {
          label: 'Pauza eventa',
          costText: '45s freeze',
          costColor: '#6a6a9a',
          available: true,
        },
      ];
    }

    default:
      return [{ label: 'OK', costText: '', costColor: '#f0f0f5', available: true }];
  }
}

function getIncidentTitle(type) {
  const TITLES = {
    CROWD_OVERFLOW: 'Prepuna Zona!',
    FLOOR_TOO_COLD: 'Mrtva Atmosfera',
    EQUIPMENT_FAILURE: 'Oprema Otkazala!',
  };
  return TITLES[type] || 'Incident';
}

function getIncidentDescription(incident) {
  switch (incident.type) {
    case 'CROWD_OVERFLOW':
      return `${(incident.zoneId || 'zona').replace(/_/g, ' ')} je prepuna. Publika se gomila i gubi strpljenje.`;
    case 'FLOOR_TOO_COLD':
      return 'Više od 60% publike je hladna. Atmosfera polako umire.';
    case 'EQUIPMENT_FAILURE':
      return 'Zvučni sistem je otkazao! Publika se nervozi. Brzo reaguj.';
    default:
      return 'Nešto nije u redu.';
  }
}

function getSeverityColor(severity) {
  switch (severity) {
    case 'CRITICAL': return '#ff0022';
    case 'HIGH':     return '#ff4444';
    case 'MEDIUM':   return '#ffb830';
    default:         return '#4df5ff';
  }
}
