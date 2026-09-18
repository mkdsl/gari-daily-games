/**
 * fermentation.js — Fermentation progress: turšija 3 dana, barrel state machine.
 * Also handles processPassiveJobs for sušenje, turšija, rakija passive batches.
 */

import { FERMENTATION_DAYS, YIELD } from '../config.js';
import { createJar } from '../entities/jar.js';

/**
 * @typedef {'unsalted'|'critical_window'|'fermenting'|'ready'|'failed'} BacvaStatus
 */

/**
 * Vraća broj preostalih dana fermentacije bačve.
 * @param {number} initDay - Dan inicijacije
 * @param {number} currentDay
 * @returns {number}
 */
export function bacvaDaysRemaining(initDay, currentDay) {
  const endDay = initDay + FERMENTATION_DAYS.bačva;
  return Math.max(0, endDay - currentDay);
}

/**
 * Proverava da li je turšija batch završen.
 * @param {number} startDay
 * @param {number} currentDay
 * @returns {boolean}
 */
export function isTursijaReady(startDay, currentDay) {
  return currentDay >= startDay + FERMENTATION_DAYS.tursija;
}

/**
 * Procesira sve završene passive jobs za trenutni dan.
 * Poziva se iz state.js/advanceDay.
 * @param {object} state
 * @returns {object} Ažurirani state sa novim teglarama / rezervama
 */
export function processPassiveJobs(state) {
  const done = state.passive_jobs.filter(j => j.end_day <= state.day);
  const active = state.passive_jobs.filter(j => j.end_day > state.day);

  let newTegle = [...state.tegle];
  let newLog = [...state.log];
  let rakija_L = state.rakija_reserve_L || 0;

  for (const job of done) {
    switch (job.recipe) {
      case 'tursija': {
        // floor(input_qty * 0.15)
        const output = job.output_qty ?? Math.floor(job.input_qty * YIELD.tursija);
        newTegle.push(createJar('tursija', output, state.day));
        newLog.push({ day: state.day, text: `✅ Turšija gotova! +${output.toFixed(1)} kg`, type: 'success' });
        break;
      }
      case 'suseno_voce': {
        const output = job.output_qty ?? Math.floor(job.input_qty * YIELD.suseno);
        newTegle.push(createJar('suseno_voce', output, state.day));
        newLog.push({ day: state.day, text: `✅ Sušeno voće gotovo! +${output.toFixed(1)} kg`, type: 'success' });
        break;
      }
      case 'sušene_šljive': {
        const output = job.output_qty ?? Math.floor(job.input_qty * 0.35);
        newTegle.push(createJar('sušene_šljive', output, state.day));
        newLog.push({ day: state.day, text: `✅ Sušene šljive gotove! +${output.toFixed(1)} kg`, type: 'success' });
        break;
      }
      case 'rakija': {
        const liters = job.output_qty ?? Math.floor(job.input_qty * YIELD.rakija);
        rakija_L += liters;
        newLog.push({ day: state.day, text: `🫗 Rakija gotova! +${liters.toFixed(1)} L`, type: 'success' });
        break;
      }
      default: {
        // Generic: add as jar with job.recipe as type
        const output = job.output_qty ?? 0;
        if (output > 0) newTegle.push(createJar(job.recipe, output, state.day));
        newLog.push({ day: state.day, text: `✅ ${job.recipe} gotov! +${(output || 0).toFixed(1)}`, type: 'success' });
      }
    }
  }

  return {
    ...state,
    tegle: newTegle,
    passive_jobs: active,
    rakija_reserve_L: rakija_L,
    log: newLog.slice(-50),
  };
}

/**
 * Vraća opisni tekst statusa bačve.
 * @param {BacvaStatus} status
 * @param {number} daysRemaining
 * @returns {string}
 */
export function bacvaStatusText(status, daysRemaining) {
  switch (status) {
    case 'unsalted':        return 'Bačva — čeka inicijaciju';
    case 'critical_window': return '⚠️ Bačva — pokrenuti odmah!';
    case 'fermenting':      return `🪣 Bačva — još ${daysRemaining} dan(a)`;
    case 'ready':           return '✅ Bačva gotova — kiseli kupus spreman!';
    case 'failed':          return '💀 Bačva — propuštena inicijacija';
    default:                return 'Bačva — nepoznat status';
  }
}
