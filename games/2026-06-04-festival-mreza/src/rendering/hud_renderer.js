/** @module rendering/hud_renderer — DOM HUD updates for micro screen */

import { getBPMColor, getBPMSliderPct } from '../systems/bpm_controller.js';
import { getSatisfactionColor } from '../systems/satisfaction_tracker.js';
import { getActiveIncident } from '../systems/incident_manager.js';
import { getPerformanceInfo } from '../systems/performance_monitor.js';
import { computeUpgradeEffects } from '../systems/upgrade_manager.js';

/**
 * Update micro screen HUD elements
 * @param {import('../state.js').MicroState} micro
 * @param {import('../state.js').MacroState} macro
 */
export function updateMicroHUD(micro, macro) {
  if (!micro) return;
  const upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);

  updateSatisfactionBar(micro, upgradeEffects);
  updateEnergyDebtBar(micro, macro);
  updateBPMIndicator(micro, upgradeEffects);
  updateFloorTempIndicator(micro);
  updateTimerDisplay(micro);
  updateIncidentIndicator(micro);
  updateCrowdCountDisplay(micro);
}

function updateSatisfactionBar(micro, upgradeEffects) {
  const el = document.getElementById('hud-satisfaction-bar');
  const pctEl = document.getElementById('hud-satisfaction-pct');
  if (!el) return;

  const eventDuration = micro.event_duration || 180;
  const raw = (micro.satisfaction_points / eventDuration) * 100;
  const pct = Math.min(100, Math.max(0, raw));
  el.style.width = `${pct}%`;
  el.style.background = getSatisfactionColor(pct);
  if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
}

function updateEnergyDebtBar(micro, macro) {
  const el = document.getElementById('hud-energy-debt-bar');
  const pctEl = document.getElementById('hud-energy-debt-pct');
  if (!el) return;

  const maxDebt = 50 + (macro.active_coordinators.length * 5);
  const pct = Math.min(100, (micro.energy_debt / maxDebt) * 100);
  el.style.width = `${pct}%`;
  el.style.background = pct > 70 ? '#ff4444' : pct > 40 ? '#ffb830' : '#4a7c59';
  if (pctEl) pctEl.textContent = `${Math.round(micro.energy_debt)}`;
}

function updateBPMIndicator(micro, upgradeEffects) {
  const el = document.getElementById('hud-bpm-value');
  const rangeEl = document.getElementById('hud-bpm-range');
  if (!el) return;

  el.textContent = micro.current_bpm;
  el.style.color = getBPMColor(micro.current_bpm, upgradeEffects);
  if (rangeEl) {
    const bpmPct = getBPMSliderPct(micro.current_bpm);
    rangeEl.style.width = `${bpmPct * 100}%`;
  }
}

function updateFloorTempIndicator(micro) {
  const el = document.getElementById('hud-floor-temp');
  if (!el) return;

  const temp = micro.floor_temperature || 0;
  const pct = Math.round(temp * 100);
  el.textContent = `${pct}°`;
  if (temp >= 0.85) el.style.color = '#ff0022';
  else if (temp >= 0.65) el.style.color = '#ff5500';
  else if (temp >= 0.45) el.style.color = '#ff8c42';
  else el.style.color = '#4df5ff';
}

function updateTimerDisplay(micro) {
  const el = document.getElementById('hud-timer');
  if (!el) return;

  const remaining = Math.max(0, micro.event_duration - micro.event_time_elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  el.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

  // Color timer red in last 30s
  el.style.color = remaining < 30 ? '#ff4444' : '#f0f0f5';
}

function updateIncidentIndicator(micro) {
  const el = document.getElementById('hud-incident-indicator');
  if (!el) return;

  const active = getActiveIncident(micro);
  el.textContent = active ? `⚠ ${active.type.replace(/_/g, ' ')}` : '';
  el.style.color = active ? (active.severity === 'HIGH' || active.severity === 'CRITICAL' ? '#ff4444' : '#ffb830') : '';
  el.style.display = active ? 'block' : 'none';
}

function updateCrowdCountDisplay(micro) {
  const el = document.getElementById('hud-crowd-total');
  if (!el) return;

  const total = (micro.crowd_groups || []).reduce((s, g) => s + g.size, 0);
  el.textContent = total;
}

/**
 * Update macro screen HUD (budget, round info)
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 */
export function updateMacroHUD(macro, meta) {
  const budgetEl = document.getElementById('hud-budget');
  if (budgetEl) budgetEl.textContent = `${Math.round(macro.budget)} EUR`;

  const tierEl = document.getElementById('hud-career-tier');
  if (tierEl) tierEl.textContent = meta.career_tier.replace(/_/g, ' ').toUpperCase();

  const cityEl = document.getElementById('hud-current-city');
  if (cityEl) {
    const cityNames = ['Niš', 'Sarajevo', 'Štrand', 'Guncati', 'Avala'];
    cityEl.textContent = cityNames[macro.current_city_index] || 'Kraj turneje';
  }
}

/**
 * Show a transient text cue (4s display)
 * @param {string} text
 * @param {string} [color]
 */
export function showTextCue(text, color = '#f0f0f5') {
  let el = document.getElementById('hud-text-cue');
  if (!el) return;

  el.textContent = text;
  el.style.color = color;
  el.style.opacity = '1';
  clearTimeout(el._hideTimeout);
  el._hideTimeout = setTimeout(() => {
    el.style.opacity = '0';
  }, 4000);
}
