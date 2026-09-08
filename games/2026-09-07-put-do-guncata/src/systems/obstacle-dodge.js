/**
 * @module obstacle-dodge — etapa4 prepreke, ruta-zavisna šema
 */
import { ROUTE_CONFIG, OBSTACLE_TYPES } from '../config.js';

/**
 * @param {{
 *   route: 'brze'|'slikovitije'|'sigurnije',
 *   isNight: boolean,
 *   onObstacle: (obs: Object) => void,
 *   onObstacleResult: (avoided: boolean) => void,
 *   onProgress: (done: number, total: number) => void,
 *   onComplete: (data: {obstaclesTotal:number, obstaclesAvoided:number, hitRate:number}) => void
 * }} opts
 */
export function createObstacleDodge(opts) {
  const { route, onObstacle, onObstacleResult, onProgress, onComplete } = opts;
  const cfg = ROUTE_CONFIG[route] ?? ROUTE_CONFIG.sigurnije;

  let total = cfg.obstacles;
  let done = 0;
  let avoided = 0;
  let active = false;

  /** @type {{id:string, action:string, timeoutId:number}|null} */
  let _pending = null;
  let _spawnTimer = null;

  const baseInterval = Math.round(3500 / cfg.speedMult);

  function _spawn() {
    if (!active || done >= total) return;

    // Distractor (pejzaž) for slikovitije route — ~20% chance
    if (cfg.hasDistractor && Math.random() < 0.2) {
      onObstacle({ id: 'distractor', label: '🏞️ Pejzaž!', action: 'none', hint: '(pejzaž)', isDistractor: true });
      _spawnTimer = setTimeout(_spawn, Math.round(baseInterval * 0.7));
      return;
    }

    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    done++;
    onProgress(done, total);

    const tid = setTimeout(() => {
      if (_pending?.id === type.id) {
        _pending = null;
        onObstacleResult(false);
        if (done >= total) _finish();
        else if (active) _spawnTimer = setTimeout(_spawn, baseInterval);
      }
    }, cfg.reactionMs);

    _pending = { id: type.id, action: type.action, timeoutId: tid };
    onObstacle({ ...type, index: done, total });

    if (done < total) {
      _spawnTimer = setTimeout(_spawn, baseInterval + cfg.reactionMs);
    } else {
      setTimeout(() => { if (active) _finish(); }, cfg.reactionMs + 600);
    }
  }

  function _finish() {
    if (!active) return;
    active = false;
    const hitRate = total > 0 ? avoided / total : 0;
    onComplete({ obstaclesTotal: total, obstaclesAvoided: avoided, hitRate });
  }

  /**
   * Player response action.
   * @param {'tap'|'swipe-left'|'tap-down'|string} action
   * @returns {boolean} whether correct
   */
  function respond(action) {
    if (!_pending) return false;
    const correct = action === _pending.action;
    clearTimeout(_pending.timeoutId);
    _pending = null;
    if (correct) avoided++;
    onObstacleResult(correct);
    return correct;
  }

  function start() {
    active = true;
    _spawnTimer = setTimeout(_spawn, 1200);
  }

  function stop() {
    active = false;
    clearTimeout(_spawnTimer);
    if (_pending) { clearTimeout(_pending.timeoutId); _pending = null; }
  }

  return { start, stop, respond, getConfig: () => cfg };
}

/**
 * @param {number} hitRate 0–1
 * @returns {number} Δ4: -10..+20
 */
export function computeDelta4(hitRate) {
  return Math.round(Math.max(0, Math.min(1, hitRate)) * 30) - 10;
}
