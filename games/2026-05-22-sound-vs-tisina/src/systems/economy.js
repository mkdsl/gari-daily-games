// economy.js — budget, upgrades, reputation
import { UPGRADES } from '../content/upgrades.js';
import { NEIGHBOR_LIMIT_DB, COMPLAINT_THRESHOLD_DB, COMPLAINT_COOLDOWN_SEC } from '../config.js';

export function applyUpgrade(upgradeId, state) {
  const upgrade = UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return false;
  if (state.upgrades.has(upgradeId)) return false;
  if (upgrade.requires && !state.upgrades.has(upgrade.requires)) return false;
  if (state.budget < upgrade.cost) return false;

  state.budget -= upgrade.cost;
  state.upgrades.add(upgradeId);
  return true;
}

export function calculateReputation(state) {
  const h = state.sessionStats.maxHappiness;
  const complaints = state.sessionStats.complaints;
  const neighborScore = Math.max(0, 50 - complaints * 15);
  const audienceScore = Math.min(100, h);

  state.reputation.audience = Math.round((state.reputation.audience + audienceScore) / 2);
  state.reputation.neighbor = Math.round((state.reputation.neighbor + neighborScore) / 2);
}

export function checkComplaint(state) {
  const now = state.gameTime;
  if (now - state.lastComplaintTime < COMPLAINT_COOLDOWN_SEC) return false;
  if (state.neighborSPL >= COMPLAINT_THRESHOLD_DB) {
    state.lastComplaintTime = now;
    return true;
  }
  return false;
}

export function getEffectiveNeighborLimit(state) {
  let limit = NEIGHBOR_LIMIT_DB;
  for (const ev of state.dynamicEvents) {
    if (ev.neighborLimit) limit += ev.neighborLimit;
  }
  return limit;
}
