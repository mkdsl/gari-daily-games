/**
 * @module resource-balance — etapa2 fuel decay, random events, mood
 */
import { ETAPA2, DAY_EVENTS, NIGHT_EVENTS } from '../config.js';

/**
 * @param {{
 *   isNight: boolean,
 *   onFuelUpdate: (fuel: number) => void,
 *   onTimeUpdate: (secsLeft: number) => void,
 *   onEvent: (ev: {key:string, label:string, hint:string}) => void,
 *   onEventResult: (correct: boolean, delta: number) => void,
 *   onComplete: (data: {fuel:number, eventsCorrect:number, eventsTotal:number, moodChanged:boolean}) => void
 * }} opts
 */
export function createResourceBalance(opts) {
  const { isNight, onFuelUpdate, onTimeUpdate, onEvent, onEventResult, onComplete } = opts;
  const events = isNight ? NIGHT_EVENTS : DAY_EVENTS;
  const keys = Object.keys(events);

  let fuel = 100;
  let timeLeft = ETAPA2.DURATION_S;
  let eventsCorrect = 0;
  let eventsTotal = 0;
  let moodChanged = false;
  let active = false;

  let _tick = null;
  let _eventTimer = null;
  /** @type {string|null} */
  let _pendingKey = null;
  let _pendingTimeout = null;

  function _scheduleEvent() {
    const delay = (ETAPA2.EVENT_INTERVAL_MIN_S +
      Math.random() * (ETAPA2.EVENT_INTERVAL_MAX_S - ETAPA2.EVENT_INTERVAL_MIN_S)) * 1000;
    _eventTimer = setTimeout(_fireEvent, delay);
  }

  function _fireEvent() {
    if (!active) return;
    const key = keys[Math.floor(Math.random() * keys.length)];
    const ev = events[key];
    eventsTotal++;
    _pendingKey = key;
    onEvent({ key, ...ev });

    _pendingTimeout = setTimeout(() => {
      if (_pendingKey === key) _resolvePending(false);
    }, ETAPA2.EVENT_WINDOW_MS);
  }

  function _resolvePending(correct) {
    if (!_pendingKey) return;
    clearTimeout(_pendingTimeout);
    _pendingKey = null;
    const delta = correct ? ETAPA2.EVENT_CORRECT_SCORE : ETAPA2.EVENT_MISS_SCORE;
    if (correct) eventsCorrect++;
    onEventResult(correct, delta);
    if (active) _scheduleEvent();
  }

  /** Player taps the reaction button */
  function respondToEvent() {
    if (_pendingKey) _resolvePending(true);
  }

  /** @param {string} _genre */
  function changeMood(_genre) {
    moodChanged = true;
  }

  function start() {
    active = true;
    _scheduleEvent();
    _tick = setInterval(() => {
      timeLeft = Math.max(0, timeLeft - 1);
      fuel = Math.max(0, fuel - ETAPA2.FUEL_DECAY_PER_S);
      onFuelUpdate(fuel);
      onTimeUpdate(timeLeft);
      if (timeLeft <= 0) { stop(); onComplete({ fuel, eventsCorrect, eventsTotal, moodChanged }); }
    }, 1000);
  }

  function stop() {
    active = false;
    clearInterval(_tick);
    clearTimeout(_eventTimer);
    clearTimeout(_pendingTimeout);
    _tick = _eventTimer = _pendingTimeout = null;
    _pendingKey = null;
  }

  function forceComplete() {
    stop();
    onComplete({ fuel, eventsCorrect, eventsTotal, moodChanged });
  }

  return { start, stop, forceComplete, respondToEvent, changeMood };
}

/**
 * @param {{fuel:number, eventsCorrect:number, eventsTotal:number, moodChanged:boolean}} data
 * @returns {number} Δ2: -10..+25
 */
export function computeDelta2(data) {
  const { fuel, eventsCorrect, eventsTotal, moodChanged } = data;
  const eventsWrong = eventsTotal - eventsCorrect;
  const fuelScore   = Math.round((fuel / 100) * 15);
  const eventSum    = eventsCorrect * ETAPA2.EVENT_CORRECT_SCORE + eventsWrong * ETAPA2.EVENT_MISS_SCORE;
  const eventScore  = Math.max(-6, Math.min(9, eventSum));
  const moodBonus   = moodChanged ? 1 : 0;
  return Math.max(-10, Math.min(25, fuelScore + eventScore + moodBonus));
}
