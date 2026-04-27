/**
 * @file beatCircle.js
 * @description BeatCircle entitet — predstavlja jedan krug koji putuje ka timing liniji.
 *
 * Kreira se u beatScheduler.js i dodaje se u state.activeBeats[].
 * Render.js koristi visualProgress (0→1) za pozicioniranje na Canvas-u.
 * Scoring.js menja state i hitResult pri udaru.
 *
 * @module entities/beatCircle
 */

/**
 * @typedef {'active'|'hit'|'missed'} BeatState
 */

/**
 * @typedef {Object} BeatCircle
 * @property {number} id              - Monotoni jedinstven ID (state.nextBeatId++)
 * @property {number} lane            - 0 = levo | 1 = centar | 2 = desno
 * @property {number} scheduledTime   - AudioContext.currentTime kada beat treba da bude na timing liniji
 * @property {BeatState} state        - Trenutno stanje kruga
 * @property {'PERFECT'|'GOOD'|'MISS'|null} hitResult - Rezultat udara (null dok nije hit/missed)
 * @property {number} visualProgress  - 0 (spawn na vrhu) → 1 (timing linija)
 * @property {number} hitRingAge      - Sekunde protekle od hita za sonar animaciju; -1 = ne animira
 */

/**
 * Kreira novi BeatCircle objekat.
 *
 * @param {number} id            - Jedinstveni ID
 * @param {number} lane          - 0 | 1 | 2
 * @param {number} scheduledTime - AudioContext.currentTime ciljanog udarca
 * @returns {BeatCircle}
 */
export function createBeatCircle(id, lane, scheduledTime) {
  return {
    id,
    lane,
    scheduledTime,
    state: 'active',
    hitResult: null,
    visualProgress: 0,
    hitRingAge: -1
  };
}

/**
 * Ažurira visualProgress beat kruga na osnovu trenutnog AudioContext.currentTime.
 * Menja beat in-place.
 *
 * @param {BeatCircle} beat
 * @param {number} audioNow    - AudioContext.currentTime
 * @param {number} travelTime  - CONFIG.BEAT_TRAVEL_TIME (sekunde od spawna do timing linije)
 * @returns {void}
 */
export function updateBeatProgress(beat, audioNow, travelTime) {
  const remaining = (beat.scheduledTime - audioNow) / travelTime;
  const clamped = Math.max(0, Math.min(1, remaining));
  beat.visualProgress = 1 - clamped;
}

/**
 * Označava beat kao promašen (state = 'missed') ako je prošao timing window a nije udaren.
 * Menja beat in-place.
 *
 * @param {BeatCircle} beat
 * @param {number} audioNow      - AudioContext.currentTime
 * @param {number} missThreshold - Sekunde posle scheduledTime do kada se beat smatra aktivnim (CONFIG.TIMING_GOOD)
 * @returns {boolean} true ako je beat upravo postao 'missed'
 */
export function checkMissed(beat, audioNow, missThreshold) {
  if (beat.state === 'active' && audioNow > beat.scheduledTime + missThreshold) {
    beat.state = 'missed';
    beat.hitResult = 'MISS';
    return true;
  }
  return false;
}
