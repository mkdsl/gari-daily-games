/**
 * staff-roster.js — Prikaz dostupnosti stručnjaka, kapacitet
 */

import { STAFF_BONUSES } from '../config.js';

export const STAFF_LIST = [
  {
    id: 'alatko',
    name: 'Alatko Alatničić',
    emoji: '🔧',
    role: 'Majstor alata',
    description: 'Stručnjak za ručni alat. Ubrzava praktični rad za 15%.',
    daily_cost: 80,
    unlock_rep: 0,
    available: true
  },
  {
    id: 'brana',
    name: 'Brana Barakonja',
    emoji: '🌊',
    role: 'Permakulturni strateg',
    description: 'Ekspert za jezera i biofiltraciju. +5 zadovoljstvo na svim sesijama.',
    daily_cost: 80,
    unlock_rep: 50,
    available: false
  },
  {
    id: 'cana',
    name: 'Cana Ćup',
    emoji: '🫙',
    role: 'Tradicija hrane',
    description: 'Konzervira hranu iz prethodne sezone. Pauze daju +5 energije, -25% troškovi hrane.',
    daily_cost: 80,
    unlock_rep: 125,
    available: false
  },
  {
    id: 'zemljan',
    name: 'Zemljan Zidović',
    emoji: '🏠',
    role: 'Prirodna gradnja',
    description: 'Stručnjak za rammed earth i ćerpič. +15 learned za rammed_earth temu.',
    daily_cost: 80,
    unlock_rep: 200,
    available: false
  }
];

const STAFF_MAP = Object.fromEntries(STAFF_LIST.map(s => [s.id, s]));

export function getStaff(id) {
  return STAFF_MAP[id] || null;
}

export function getAvailableStaff(unlockedStaffIds) {
  return STAFF_LIST.filter(s => unlockedStaffIds.includes(s.id));
}

export function getStaffBonus(staffId) {
  return STAFF_BONUSES[staffId] || null;
}

/**
 * Vraca ukupan trošak za hired staff
 */
export function calcStaffCost(hiredStaffIds, days) {
  return hiredStaffIds.reduce((total, id) => {
    const s = STAFF_MAP[id];
    return total + (s ? s.daily_cost * days : 0);
  }, 0);
}

/**
 * Check da li staff zadovoljava requirements incidenta
 */
export function staffSatisfiesRequirement(hiredStaffIds, requirement) {
  if (!requirement) return true;
  if (requirement === 'any') return hiredStaffIds.length > 0;
  if (requirement === 'brana') return hiredStaffIds.includes('brana');
  return hiredStaffIds.includes(requirement);
}
