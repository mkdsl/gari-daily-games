/**
 * ui.js — Thin barrel entry point for UI layer.
 * Re-exports the two main functions imported by legacy code.
 *
 * Main.js imports initTabs and updateAllUI from here via:
 *   import { initTabs, updateAllUI } from './ui/tabs.js';
 * (direct import — this barrel exists for any third-party or old references)
 */

export { initTabs, updateAllUI, switchTab } from './ui/tabs.js';
export { updateHUD, initHUD } from './ui/hud.js';
export { showToast, showAchievementToast, showSeasonEndModal,
         showPhaseUnlockModal, showPrestigeModal, showEventModal,
         showProjectionModal } from './ui/modals.js';
export { updateChannelPanel } from './ui/channel-panel.js';
export { updateSynergyTree } from './ui/synergy-tree.js';
export { updateUpgradesPanel } from './ui/upgrades-panel.js';
export { initMacroPanel, updateMacroPanelUI } from './ui/macro-panel.js';
export { initMushroomTab, updateMushroomTab } from './ui/mushroom-tab.js';
export { initGreenhouseTab, updateGreenhouseTab } from './ui/greenhouse-tab.js';
export { initFishpondTab, updateFishpondTab } from './ui/fishpond-tab.js';
