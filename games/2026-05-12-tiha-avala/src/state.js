// state.js — centralni state

export const state = {
  scene: 'menu',          // 'menu' | 'level_select' | 'game' | 'win' | 'fail_inspection' | 'fail_crowd'
  current_level: 0,
  unlocked_levels: new Set([0]),

  // kontrole (standardni nivo)
  spl: 95,
  bass_ratio: 0.5,
  angle: 0,

  // dual speaker (nivo 6)
  spl_l: 95,
  spl_r: 95,
  angle_l: -25,
  angle_r: 25,

  // trenutni rezultati simulacije
  happiness: 0,
  neighbour_kdbs: [],   // array dB vrednosti za svaku kuću

  // simulacija
  sim_running: false,
  sim_start_time: null,
  win_start_time: null,       // kad su oba uslova prvi put ispunjena
  fail_crowd_start: null,     // kad je publika pala ispod 0.5
  sim_elapsed_ms: 0,

  // wind
  wind_delta: 0,

  // score
  solve_time_seconds: 0,
  final_score: 0,
  max_kdb_during_sim: -Infinity,

  // audio initialized
  audio_ready: false,

  // animation frame id
  raf_id: null,
  last_ts: 0
};

export function resetSimState() {
  state.sim_running = false;
  state.sim_start_time = null;
  state.win_start_time = null;
  state.fail_crowd_start = null;
  state.sim_elapsed_ms = 0;
  state.max_kdb_during_sim = -Infinity;
  state.solve_time_seconds = 0;
  state.final_score = 0;
}
