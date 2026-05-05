/**
 * pickup.js — Kristal i checkpoint pickup entity za Bespuće
 * Kristali: sakupljiva meta valuta + score bonus.
 * Checkpoint marker: trigeruje CHECKPOINT_SELECT state.
 * Magnet privlačenje: ako je aktivna magnetna power-up, kristali lete ka igraču.
 * Eksportuje: createCrystal, createCheckpoint, updatePickups
 */
import { CONFIG } from '../config.js';

/**
 * Kreira kristal pickup.
 * @param {number} x
 * @param {number} y
 * @returns {object}
 */
export function createCrystal(x, y) {
  return {
    type: 'CRYSTAL',
    x,
    y,
    angle: 0,
    collected: false,
  };
}

/**
 * Kreira checkpoint marker.
 * @param {number} x  - Početni canvas X (scrolluje se)
 * @returns {object}
 */
export function createCheckpoint(x) {
  return {
    type: 'CHECKPOINT',
    x,
    triggered: false,
  };
}

/**
 * Ažuriraj sve pickupe: magnet privlačenje, animacija rotacije, scroll.
 * Checkpoint triggering (postavi triggered = true) — provjera u index.js.
 * @param {object[]} pickups
 * @param {object} player          - Player state (za poziciju i powerups)
 * @param {object} meta            - Meta state (za upgrades.magnet nivo)
 * @param {number} scrollSpeed     - px/s
 * @param {number} dt
 */
export function updatePickups(pickups, player, meta, scrollSpeed, dt) {
  if (!player || !player.alive) {
    // Samo skroluj
    for (const pu of pickups) {
      pu.x -= scrollSpeed * dt;
    }
    return;
  }

  // Izračunaj efektivni magnet radius
  let magnetR;
  if (player.powerups.magnetTemp > 0) {
    magnetR = 200;
  } else if (meta && meta.upgrades.magnet === 3) {
    magnetR = Infinity; // auto-collect
  } else {
    const magnetLevel = (meta && meta.upgrades.magnet) ? meta.upgrades.magnet : 0;
    magnetR = CONFIG.MAGNET_RADIUS_BASE + magnetLevel * 80;
  }

  for (const pu of pickups) {
    // Skroluj
    pu.x -= scrollSpeed * dt;

    if (pu.type === 'CRYSTAL' && !pu.collected) {
      // Animacija rotacije
      pu.angle += 2 * dt;

      // Magnet privlačenje
      const dx = player.x - pu.x;
      const dy = player.y - pu.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < magnetR && dist > 0) {
        const pull = CONFIG.MAGNET_SPEED * dt;
        const factor = Math.min(pull / dist, 1);
        pu.x += dx * factor;
        pu.y += dy * factor;
      }
    }

    if (pu.type === 'CHECKPOINT' && !pu.triggered) {
      // Trigger kad checkpoint marker prođe pored broda
      if (pu.x < player.x) {
        pu.triggered = true;
        // index.js proverava pu.triggered i menja state.screen
      }
    }
  }
}
