// scenes.js — loadScene(n, state) → returns first node ID for scene
import { getScene3Leader } from './affinity.js';

export function loadScene(sceneIndex, state) {
  switch (sceneIndex) {
    case 0: return 'scene0_start';
    case 1: return 'scene1_start';
    case 2: return 'scene2_start';
    case 3: {
      const leader = getScene3Leader(state.affinity);
      return `scene3_${leader}_start`;
    }
    case 4: return 'scene4_start';
    case 5: return 'scene5_start';
    case 6: return 'scene6_start';
    case 7: return 'scene7_resolution';
    case 8: return 'scene8_share';
    default: return 'scene0_start';
  }
}
