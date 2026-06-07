/**
 * tool-inventory.js — Stanje alata, nabavka, habanje
 */

export const TOOL_CATALOG = [
  { id: 'basic_tools',   name: 'Osnovno oruđe',   quality: 0.7, cost: 80,  description: 'Lopatice, čekić, kliješta' },
  { id: 'hand_tools',    name: 'Ručni alat set',   quality: 1.0, cost: 150, description: 'Kvalitetni ručni alat za sve radove' },
  { id: 'power_tools',   name: 'Akumulatorski',    quality: 1.0, cost: 220, description: 'Akumulatorska bušilica i ugaona' },
  { id: 'premium_tools', name: 'Premium set',      quality: 1.2, cost: 400, description: 'Profesionalni alat — -20% vreme praktičnog rada' }
];

/**
 * Vraca efikasnost alata za sesiju
 * @param {string} toolId
 * @param {number} quality 0.5-1.2
 */
export function getToolEfficiency(toolId, quality = 1.0) {
  const base = TOOL_CATALOG.find(t => t.id === toolId);
  if (!base) return 1.0;
  return base.quality * quality;
}

/**
 * Procenjuje vreme aktivnosti s alatom
 */
export function getActivityTimeMod(toolId, quality) {
  const eff = getToolEfficiency(toolId, quality);
  // Vise efikasnosti = manje vremena
  return Math.max(0.7, 1.0 / eff);
}
