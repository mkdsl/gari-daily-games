/**
 * @module systems/index — System registry
 * All systems are imported directly in main.js and micro_engine.js.
 * This file exists as a compatibility shim.
 */

// Re-export key update functions for convenience
export { updateMicro } from './micro_engine.js';
export { getCurrentCityInfo, advanceToNextCity } from './macro_engine.js';
export { checkAchievements, checkCareerTierUpgrade } from './progression.js';
