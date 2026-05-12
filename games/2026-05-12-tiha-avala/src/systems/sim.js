// sim.js — simulation runner

import { state } from '../state.js';
import { LEVELS } from '../levels/level_data.js';
import { compute_Kdb, compute_Hs } from './acoustics.js';
import { updateWind, resetWind } from './wind.js';
import {
  WIN_DURATION_MS, FAIL_CROWD_DURATION_MS,
  SPL_FAIL_THRESHOLD, HAPPINESS_WIN_THRESHOLD, HAPPINESS_FAIL_THRESHOLD
} from '../config.js';
import { calcScore } from './score.js';

export function computeCurrentValues() {
  const level = LEVELS[state.current_level];

  if (level.dual_speakers) {
    return computeDualValues(level);
  }

  const wind_delta = level.has_wind ? state.wind_delta : 0;

  const kdbs = level.neighbours.map(n =>
    compute_Kdb(
      state.spl,
      state.angle,
      n,
      wind_delta,
      state.bass_ratio,
      level.bass_asphalt_effect
    )
  );

  const hs = compute_Hs(state.spl, state.angle, state.bass_ratio, level);

  return { kdbs, hs };
}

function computeDualValues(level) {
  // Nivo 6: dual speakers
  // bass je 0.5 fixed
  const bass_ratio = 0.5;
  const wind_delta = 0;

  const kdbs = level.neighbours.map(n => {
    const kdb_l = compute_Kdb(state.spl_l, state.angle_l, n, wind_delta, bass_ratio, false);
    const kdb_r = compute_Kdb(state.spl_r, state.angle_r, n, wind_delta, bass_ratio, false);
    return Math.max(kdb_l, kdb_r);
  });

  // Hs = prosek oba zvucnika
  const hs_l = compute_Hs(state.spl_l, state.angle_l, bass_ratio, level);
  const hs_r = compute_Hs(state.spl_r, state.angle_r, bass_ratio, level);
  const hs = (hs_l + hs_r) / 2;

  return { kdbs, hs };
}

export function startSimulation(now) {
  const level = LEVELS[state.current_level];
  state.sim_running = true;
  state.sim_start_time = now;
  state.win_start_time = null;
  state.fail_crowd_start = null;
  state.max_kdb_during_sim = -Infinity;
  state.sim_elapsed_ms = 0;
  if (level.has_wind) resetWind();
}

export function stopSimulation() {
  state.sim_running = false;
  state.sim_start_time = null;
  state.win_start_time = null;
  state.fail_crowd_start = null;
}

/**
 * Tick simulacije. Vraca:
 *   null        — simulacija još teče
 *   'win'       — uspeh
 *   'fail_inspection' — Kdb >= 70dB
 *   'fail_crowd'      — publika predugo ispod 0.5
 */
export function tickSim(now, dt_ms) {
  if (!state.sim_running) return null;

  const level = LEVELS[state.current_level];
  state.sim_elapsed_ms = now - state.sim_start_time;

  // Update wind
  if (level.has_wind) {
    state.wind_delta = updateWind(dt_ms);
  }

  const { kdbs, hs } = computeCurrentValues();
  state.happiness = hs;
  state.neighbour_kdbs = kdbs;

  const max_kdb = Math.max(...kdbs);
  if (max_kdb > state.max_kdb_during_sim) {
    state.max_kdb_during_sim = max_kdb;
  }

  // Fail: inspekcija
  if (max_kdb >= SPL_FAIL_THRESHOLD) {
    stopSimulation();
    return 'fail_inspection';
  }

  // Fail: publika
  if (hs < HAPPINESS_FAIL_THRESHOLD) {
    if (!state.fail_crowd_start) {
      state.fail_crowd_start = now;
    } else if (now - state.fail_crowd_start >= FAIL_CROWD_DURATION_MS) {
      stopSimulation();
      return 'fail_crowd';
    }
  } else {
    state.fail_crowd_start = null;
  }

  // Win condition
  if (hs >= HAPPINESS_WIN_THRESHOLD && max_kdb < SPL_FAIL_THRESHOLD) {
    if (!state.win_start_time) {
      state.win_start_time = now;
    } else if (now - state.win_start_time >= WIN_DURATION_MS) {
      const solve_time = (now - state.sim_start_time) / 1000;
      state.solve_time_seconds = solve_time;
      state.final_score = calcScore(solve_time, state.max_kdb_during_sim);
      stopSimulation();
      return 'win';
    }
  } else {
    state.win_start_time = null;
  }

  return null;
}
