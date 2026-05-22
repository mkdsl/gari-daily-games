// hud.js — DOM HUD manager
import { GAME_TIME_START, GAME_TIME_END, REAL_TO_GAME_RATIO } from '../config.js';

export function updateHUD(state) {
  // Game time display: 22:00 → 04:00
  const gameMinutes = GAME_TIME_START + state.gameTime * REAL_TO_GAME_RATIO;
  const totalMins = Math.floor(gameMinutes % (24 * 60));
  const hours = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  const timeEl = document.getElementById('hud-time');
  if (timeEl) timeEl.textContent = timeStr;

  // Happiness bar
  const fill = document.getElementById('happiness-bar-fill');
  const emoji = document.getElementById('happiness-emoji');
  if (fill) fill.style.width = `${state.happiness}%`;
  if (emoji) {
    if (state.happiness < 30) emoji.textContent = '😟';
    else if (state.happiness < 50) emoji.textContent = '😐';
    else if (state.happiness < 70) emoji.textContent = '🙂';
    else if (state.happiness < 85) emoji.textContent = '😊';
    else emoji.textContent = '🔥';
  }

  // Budget
  const budgetEl = document.getElementById('hud-budget');
  if (budgetEl) budgetEl.textContent = `💰 ${state.budget.toLocaleString()}`;

  // Reputation
  const repEl = document.getElementById('hud-rep');
  if (repEl) repEl.textContent = `⭐ ${state.reputation.audience}`;

  // Neighbor thermometer
  updateThermometer(state);
}

function updateThermometer(state) {
  const spl = state.neighborSPL || 0;
  const limit = 70;

  // Normalize: 50 dB = 0%, 80 dB = 100%
  const pct = Math.max(0, Math.min(100, ((spl - 50) / 30) * 100));

  const fill = document.getElementById('thermo-fill');
  const marker = document.getElementById('thermo-marker');
  const value = document.getElementById('thermo-value');

  if (fill) {
    fill.style.height = `${pct}%`;
    if (spl < 65) fill.style.background = 'var(--safe, #00ff88)';
    else if (spl < 70) fill.style.background = 'var(--warn, #ffaa00)';
    else fill.style.background = 'var(--danger, #ff2244)';
  }

  // Limit marker at 70 dB = 66.7% up
  const limitPct = ((limit - 50) / 30) * 100;
  if (marker) marker.style.bottom = `${limitPct}%`;

  if (value) {
    value.textContent = spl > 0 ? `${spl.toFixed(1)} dB` : '— dB';
    value.style.color = spl >= limit ? 'var(--danger, #ff2244)' : 'rgba(255,255,255,0.7)';
  }
}
