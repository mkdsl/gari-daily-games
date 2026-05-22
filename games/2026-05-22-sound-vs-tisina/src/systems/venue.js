// venue.js — venue loading system
import { AudioZone } from '../entities/zone.js';
import { VENUES } from '../content/venues.js';
import { resetSessionStats } from '../state.js';

export function loadVenue(venueIndex, state) {
  const venueCfg = VENUES[venueIndex];
  if (!venueCfg) return;

  state.currentVenue = { ...venueCfg };
  state.currentLevel = venueIndex;

  // Initialize zones from venue config
  state.zones = venueCfg.zones.map(zCfg => new AudioZone({
    id: zCfg.id,
    name: zCfg.name,
    pos: { ...zCfg.pos },
    defaultDb: zCfg.defaultDb,
    isControllable: zCfg.isControllable,
    isNeighbor: false
  }));

  // Apply upgrade bonuses to zones
  for (const upgradeId of state.upgrades) {
    applyUpgradeBonusToZones(upgradeId, state);
  }

  state.budget = venueCfg.budgetStart;

  resetSessionStats(state);
}

function applyUpgradeBonusToZones(upgradeId, state) {
  const UPGRADE_ZONE_MAP = {
    'subwoofer':    { zoneId: 'main',    dbBonus: 5 },
    'fill_speaker': { zoneId: 'fill',    dbBonus: 8 },
    'line_array':   { zoneId: 'main',    dbBonus: 4, maxDbBonus: 3 },
    'horn_tweeter': { zoneId: 'fill',    dbBonus: 3 },
    'monitor_wedge':{ zoneId: 'monitor', dbBonus: 6 },
    'delay_tower':  { zoneId: 'delay',   dbBonus: 7 },
    'cardioid_sub': { zoneId: 'main',    dbBonus: 2 },
    'amp_upgrade':  { zoneId: 'main',    dbBonus: 4, maxDbBonus: 4 },
    'line_array_v2':{ zoneId: 'main',    dbBonus: 6, maxDbBonus: 6 },
    'stage_monitor':{ zoneId: 'monitor', dbBonus: 5 }
  };
  const bonus = UPGRADE_ZONE_MAP[upgradeId];
  if (!bonus) return;
  const zone = state.zones.find(z => z.id === bonus.zoneId);
  if (!zone) return;
  if (bonus.maxDbBonus) zone.maxDb += bonus.maxDbBonus;
  zone.defaultDb = Math.min(zone.maxDb, zone.defaultDb + bonus.dbBonus);
  zone.db = Math.min(zone.maxDb, zone.db + bonus.dbBonus);
}

export function getVenueConfig(index) {
  return VENUES[index] || null;
}
