/**
 * systems/index.js — Wire-uje sve sisteme u jednu updateSystems funkciju.
 *
 * Poziva se iz main.js jednom po frame-u tokom PLAYING faze.
 * Redosled poziva je bitan:
 *   1. updatePlayer  (flip input, G-overload, flip animacija)
 *   2. updateGravity (velocity_y, brod.y)
 *   3. updateScroll  (pomeri zone/obstacles levo, ukloni prošle zone)
 *   4. updateBuzzsaws (rotacija + oscilacija)
 *   5. spawnZones    (dopuni active_zones iz pool-a)
 *   6. checkCollisions (vrati collision result)
 *   7. updateSpeedLevel (inkrementiraj speed_level)
 *
 * main.js posle ovoga:
 *   - Ako collision === 'obstacle' → triggerDeath('obstacle')
 *   - Ako overloadStatus === 'dead' → triggerDeath('G-OVERLOAD')
 *   - Ako collision === 'floor'/'ceil' → clampToBounds (nulira velocity)
 *   - Ako speedLevelUp → playMilestoneArpeggio()
 *   - Ako flipped → playFlip() + stopBeepWarning()
 *
 * NOTE: Ova funkcija se NE poziva za IDLE/DEAD/HIGH_SCORE_CHECK faze.
 */

export { updateGravity, updateScroll, updateSpeedLevel, updateBuzzsaws } from './physics.js';
export { checkCollisions, clampToBounds } from './collision.js';
export { spawnZones } from './generator.js';
