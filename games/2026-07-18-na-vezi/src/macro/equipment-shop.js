/** Oprema kupovina, alarm % preview */
import { EQUIPMENT, GAME_CONFIG } from '../config.js';
import { getState, updateState, saveState } from '../state.js';
import { emit, EVENTS } from '../events.js';

/**
 * Vraća listu sve opreme sa statusima
 * @returns {Array}
 */
export function getEquipmentList() {
  const state = getState();
  return Object.values(EQUIPMENT).map(eq => ({
    ...eq,
    owned: !!state.equipment[eq.id],
    canAfford: state.capital >= eq.cost,
    requiresMet: !eq.requires || !!state.equipment[eq.requires],
  }));
}

/**
 * Kupuje opremu
 * @param {string} equipId
 * @returns {{ ok: boolean, reason?: string }}
 */
export function buyEquipment(equipId) {
  const state = getState();
  const eq = EQUIPMENT[equipId];
  if (!eq) return { ok: false, reason: 'Nepoznata oprema' };
  if (state.equipment[equipId]) return { ok: false, reason: 'Već posedujete' };
  if (state.capital < eq.cost) return { ok: false, reason: `Nedovoljno kapitala (${eq.cost} potrebno)` };
  if (eq.requires && !state.equipment[eq.requires]) {
    return { ok: false, reason: `Prvo kupite ${EQUIPMENT[eq.requires].name}` };
  }

  const newEquipment = { ...state.equipment, [equipId]: true };
  const newLevels = { ...state.equip_levels };

  // Ažuriraj nivo po kategoriji
  if (eq.decayLevel > 0) {
    const cat = eq.category;
    newLevels[cat] = Math.max(newLevels[cat] || 0, eq.decayLevel);
  }

  // Kapacitet bonusi
  let newBaseCapacity = state.base_offgrid_capacity;
  if (eq.capacityBonus) {
    newBaseCapacity += eq.capacityBonus;
  }

  const newCapital = state.capital - eq.cost;

  updateState({
    equipment: newEquipment,
    equip_levels: newLevels,
    capital: newCapital,
    base_offgrid_capacity: newBaseCapacity,
  });

  emit(EVENTS.EQUIPMENT_BOUGHT, { equipId, eq });
  return { ok: true, capitalSpent: eq.cost };
}

/**
 * Preview alarm % posle kupovine
 * @param {string} alarmType
 * @param {number} equipLevel - broj opreme tog tipa
 * @param {number|null} weeklyCapacity
 * @returns {number} 0-1
 */
export function previewAlarmChance(alarmType, equipLevel, weeklyCapacity = null) {
  let chance = GAME_CONFIG.BASE_ALARM_CHANCE[alarmType] * Math.pow(GAME_CONFIG.ALARM_DECAY, equipLevel);
  if (alarmType === 'battery_critical' && weeklyCapacity !== null && weeklyCapacity < 60) {
    chance *= 1 + (60 - weeklyCapacity) / 100;
  }
  return Math.max(chance, GAME_CONFIG.MIN_ALARM_CHANCE[alarmType]);
}

/**
 * Ukupni signal nivo (kombinuje signal + link opremu)
 * @param {Object} equipment
 * @param {Object} equipLevels
 * @returns {number}
 */
export function calcEffectiveSignalLevel(equipment, equipLevels) {
  let level = equipLevels.signal || 0;
  // L1 dodaje 2, L3 dodaje 3
  if (equipment.l1) level += 2;
  if (equipment.l3) level += 3;
  return Math.min(level, 8); // cap
}

/**
 * Reroute cost uzimajući u obzir opremu
 * @param {Object} equipment
 * @returns {number}
 */
export function calcRerouteCost(equipment) {
  let cost = GAME_CONFIG.REROUTE_COST;
  if (equipment.e4) cost *= 0.8;
  if (equipment.l1) cost *= 0.6;
  return Math.round(cost);
}

/**
 * Preview koliko bi smanjila alarm šansa kupovina nove opreme
 * @param {string} equipId
 * @returns {Object} { before: number, after: number }
 */
export function previewEquipmentImpact(equipId) {
  const state = getState();
  const eq = EQUIPMENT[equipId];
  if (!eq || !eq.alarmType) return null;

  const currentLevel = state.equip_levels[eq.category] || 0;
  const newLevel = Math.max(currentLevel, eq.decayLevel);

  const before = previewAlarmChance(eq.alarmType, currentLevel, state.weekly_plan.weekly_capacity);
  const after  = previewAlarmChance(eq.alarmType, newLevel, state.weekly_plan.weekly_capacity);

  return {
    alarmType: eq.alarmType,
    before: Math.round(before * 100),
    after: Math.round(after * 100),
    reduction: Math.round((before - after) * 100),
  };
}

/**
 * Grupiše opremu po kategoriji
 * @returns {Object}
 */
export function getEquipmentByCategory() {
  const list = getEquipmentList();
  const groups = { signal: [], audio: [], lighting: [], link: [], offgrid: [] };
  for (const eq of list) {
    if (groups[eq.category]) {
      groups[eq.category].push(eq);
    }
  }
  return groups;
}
