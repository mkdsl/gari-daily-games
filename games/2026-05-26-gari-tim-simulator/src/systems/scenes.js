// scenes.js — loadScene(n, state) -> first node ID for scene
import { SCENE3_TIEBREAK } from '../config.js';
import { getLeader } from './affinity.js';

export function loadScene(n, state) {
  if (n === 3) {
    // Dynamičan — ko ima max affinity od [gari, mici, brana, tonket]
    const leader = getLeader(state.affinity, SCENE3_TIEBREAK);
    state.scene3_character = leader;
    state.scene3_q = 0;
    return `s3_${leader}_intro`;
  }
  const sceneStartMap = {
    0: 's0_naracija',
    1: 's1_naracija',
    2: 's2_naracija',
    4: 's4_naracija',
    5: 's5_naracija',
    6: 's6_naracija',
    7: 's7_resolution',
    8: 's8_share',
  };
  return sceneStartMap[n] || null;
}
