import { CONFIG } from '../config.js';
import { objScreenX } from './spawner.js';

export function checkCollisions(state, groundY) {
  const p = state.player;
  const ph = p.isDucking ? CONFIG.PLAYER_H_DUCK : CONFIG.PLAYER_H_RUN;
  const pw = CONFIG.PLAYER_W;

  const px1 = p.x - pw / 2;
  const py1 = p.y;
  const px2 = px1 + pw;
  const py2 = py1 + ph;

  for (const obj of state.objects) {
    if (obj.collected) continue;

    const sx = objScreenX(obj, state.world.scrollX);
    const sy = groundY - obj.groundOffset;

    const isCollectible = obj.type === 'collectible';
    const toleranceMul = isCollectible ? 1.3 : 0.75;
    const hitW = obj.hitW * toleranceMul;
    const hitH = obj.hitH * toleranceMul;

    const ox1 = sx - hitW / 2 + obj.w / 2;
    const oy1 = sy - (hitH - obj.hitH) / 2;
    const ox2 = ox1 + hitW;
    const oy2 = oy1 + hitH;

    const overlap = px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1;
    if (overlap) {
      if (isCollectible && obj.requireAction) {
        if (obj.requireAction === 'grab_down') {
          if (!p.isDucking || p.grabAnim !== 'down') continue;
        } else if (obj.requireAction === 'grab_up') {
          if (!p.isJumping || p.grabAnim !== 'up') continue;
        }
      }
      return { hit: true, obj };
    }
  }
  return { hit: false, obj: null };
}
