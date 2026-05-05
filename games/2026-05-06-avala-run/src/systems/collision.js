import { CONFIG } from '../config.js';
import { objScreenX } from './spawner.js';

/**
 * Proverava AABB koliziju između igrača i svih objekata.
 * Kolektibli imaju 1.3x tolerantniji hitbox za lakše skupljanje.
 * @returns {{ hit: boolean, obj: object|null }}
 */
export function checkCollisions(state, groundY) {
  const p = state.player;
  const ph = p.isDucking ? CONFIG.PLAYER_H_DUCK : CONFIG.PLAYER_H_RUN;
  const pw = CONFIG.PLAYER_W;

  // Player hitbox
  const px1 = p.x - pw / 2;
  const py1 = p.y;
  const px2 = px1 + pw;
  const py2 = py1 + ph;

  for (const obj of state.objects) {
    if (obj.collected) continue;

    const sx = objScreenX(obj, state.world.scrollX);
    const sy = groundY - obj.groundOffset;

    // Kolektibli imaju širi hitbox za lakše skupljanje
    const toleranceMul = obj.type === 'collectible' ? 1.3 : 1.0;
    const hitW = obj.hitW * toleranceMul;
    const hitH = obj.hitH * toleranceMul;

    const ox1 = sx - hitW / 2 + obj.w / 2;
    const oy1 = sy - (hitH - obj.hitH) / 2;
    const ox2 = ox1 + hitW;
    const oy2 = oy1 + hitH;

    const overlap = px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1;
    if (overlap) {
      // Collectibles with requireState only collect in the right pose
      if (obj.type === 'collectible' && obj.requireState) {
        if (obj.requireState === 'jumping' && !state.player.isJumping) continue;
        if (obj.requireState === 'ducking' && !state.player.isDucking) continue;
      }
      return { hit: true, obj };
    }
  }
  return { hit: false, obj: null };
}
