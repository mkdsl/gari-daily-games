// systems/index.js — re-export convenience (ne koristi main.js direktno, ali postoji za konzistentnost)
export { checkClick } from './collision.js';
export {
  calcHitScore,
  calcPerfectBonus,
  isLevelComplete,
  advanceLevel,
  isGameWon,
  isPerfectLevel,
} from './progression.js';
