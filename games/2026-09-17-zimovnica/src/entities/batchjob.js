/**
 * batchjob.js — Active batch: recipe, start_day, action_slots_spent, passive_timer.
 * Prati pasivne poslove (fermentacija, sušenje).
 */

/**
 * @typedef {Object} BatchJob
 * @property {string} id - Unique job id
 * @property {string} recipe - Recipe id
 * @property {number} start_day - Dan pokretanja
 * @property {number} end_day - Dan završetka
 * @property {number} input_qty - Kg sirovine
 * @property {number} output_qty - Očekivani output kg
 * @property {string} input_type - Tip sirovine
 * @property {boolean} done - Da li je završen
 */

let _jobCounter = 0;

/**
 * Kreira novi batch job za pasivnu operaciju.
 * @param {string} recipe
 * @param {number} startDay
 * @param {number} passiveDays
 * @param {number} inputQty
 * @param {number} outputQty
 * @param {string} inputType
 * @returns {BatchJob}
 */
export function createBatchJob(recipe, startDay, passiveDays, inputQty, outputQty, inputType) {
  return {
    id: `job_${++_jobCounter}_${Date.now()}`,
    recipe,
    start_day: startDay,
    end_day: startDay + passiveDays,
    input_qty: inputQty,
    output_qty: outputQty,
    input_type: inputType,
    done: false,
  };
}

/**
 * Kreira pasivni posao (simplified interface za task brief).
 * @param {string} type - Recipe id
 * @param {number} start_day
 * @param {number} end_day
 * @param {number} input_qty
 * @returns {BatchJob}
 */
export function createPassiveJob(type, start_day, end_day, input_qty) {
  const passiveDays = end_day - start_day;
  const outputQty = input_qty; // caller sets actual output in createBatchJob
  return createBatchJob(type, start_day, passiveDays, input_qty, outputQty, type);
}

/**
 * Proverava koji job-ovi su završeni za dati dan.
 * @param {BatchJob[]} jobs
 * @param {number} currentDay
 * @returns {{ done: BatchJob[], active: BatchJob[] }}
 */
export function partitionJobs(jobs, currentDay) {
  const done = jobs.filter(j => j.end_day <= currentDay);
  const active = jobs.filter(j => j.end_day > currentDay);
  return { done, active };
}
