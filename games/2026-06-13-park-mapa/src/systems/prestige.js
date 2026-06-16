/**
 * prestige.js — Sezonski ciklus, Renovacija logika, žig tracker, skin switching
 * Park Mapa | Jova jQuery
 *
 * NOTE: Prestige is DISABLED in V0.3 — logic implemented, UI shows hint but not active.
 */

import { CONFIG } from '../config.js';

// Prestige is DISABLED in V0.3 — logic implemented, UI shows hint but not active
export const PRESTIGE_ENABLED = false;

export const PRESTIGE_REQUIREMENTS = {
  minSeason: 1,           // must complete season 1
  minTotalPt: 5000,       // minimum total PT earned
  minZonesMax: 2,         // at least 2 zones at max level (5)
  minLogbookEntries: 30   // at least 30 logbook entries
};

export function canPrestige(state) {
  if (!PRESTIGE_ENABLED) return false;
  const allZones = CONFIG.ACTIVE_ZONES || ['pult', 'bina', 'suma'];
  const maxLevelZones = allZones.filter(z => state.zones[z]?.level >= 5).length;
  return (
    state.season >= PRESTIGE_REQUIREMENTS.minSeason &&
    state.totalPtEarned >= PRESTIGE_REQUIREMENTS.minTotalPt &&
    maxLevelZones >= PRESTIGE_REQUIREMENTS.minZonesMax &&
    state.logbook.length >= PRESTIGE_REQUIREMENTS.minLogbookEntries
  );
}

export function getPrestigeRequirementsStatus(state) {
  const allZones = CONFIG.ACTIVE_ZONES || ['pult', 'bina', 'suma'];
  const maxLevelZones = allZones.filter(z => state.zones[z]?.level >= 5).length;
  return [
    {
      label: 'Sezona završena',
      met: state.season >= PRESTIGE_REQUIREMENTS.minSeason,
      current: state.season,
      target: PRESTIGE_REQUIREMENTS.minSeason
    },
    {
      label: 'Ukupno PT',
      met: state.totalPtEarned >= PRESTIGE_REQUIREMENTS.minTotalPt,
      current: state.totalPtEarned,
      target: PRESTIGE_REQUIREMENTS.minTotalPt
    },
    {
      label: 'Zone na maks nivou',
      met: maxLevelZones >= PRESTIGE_REQUIREMENTS.minZonesMax,
      current: maxLevelZones,
      target: PRESTIGE_REQUIREMENTS.minZonesMax
    },
    {
      label: 'Logbook zapisi',
      met: state.logbook.length >= PRESTIGE_REQUIREMENTS.minLogbookEntries,
      current: state.logbook.length,
      target: PRESTIGE_REQUIREMENTS.minLogbookEntries
    }
  ];
}

export function doPrestige(state, chosenZone, emit) {
  // DISABLED in V0.3
  if (!PRESTIGE_ENABLED) {
    console.warn('[Prestige] Prestige is disabled in V0.3');
    return false;
  }
  if (!canPrestige(state)) return false;

  // Save prestige bonus from chosen zone before reset
  const bonusZone = chosenZone || 'pult';
  const bonusLevel = state.zones[bonusZone]?.level || 1;

  // Reset state partially
  state.season++;
  state.pt = Math.floor(state.pt * 0.1); // keep 10% of PT
  state.weeklyPtEarned = 0;
  state.weeklyPtSpent = 0;
  state.weekStart = null;

  // Reset zones but keep a bonus based on prestige zone
  const allZones = CONFIG.ACTIVE_ZONES || ['pult', 'bina', 'suma'];
  for (const z of allZones) {
    state.zones[z] = { level: 1, xp: 0, lastCheckin: null, storiesUnlocked: 0 };
  }
  // Chosen zone gets head start
  state.zones[bonusZone].level = Math.min(2, bonusLevel - 1);

  state.eggs = {};
  state.dailyLight = { date: null, zone: null, completed: false };
  state.npcMissions = {};
  state.npcWeekStart = null;

  if (emit) emit('prestige', { newSeason: state.season, bonusZone, bonusLevel });
  return true;
}

export function getPrestigeHintText() {
  return 'Prestige sistem dolazi u Sezoni 2. Skupljaj PT i rastiži zone do maksimuma!';
}
