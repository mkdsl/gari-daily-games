// ============================================================
//  systems/session.js — Sarajevo ili Smrt
//  Slider fizika, vibe wave oscillation, crowd mechanics,
//  session scoring, start/end helpers.
// ============================================================

import {
  BASE_LP,
  PRESTIGE_MULTIPLIER,
  WAVE_PERIOD_SECONDS,
  WAVE_AMPLITUDE,
  VIBE_ZONE_MIN,
  VIBE_ZONE_MAX,
  CROWD_DECAY_PER_TICK,
  SESSION_DURATION_SEC,
  CROWD_FAIL_THRESHOLD,
  CROWD_TICK_MS
} from '../config.js';
import { getCrowdCap, getCrowdFloor, getBGenreBonus, getGrbavicaFailChance } from '../state.js';
import { getBascarsijaMods } from './kvartovi/bascarsija.js';
import { getMarijinDvorMods } from './kvartovi/marijin_dvor.js';
import { getGrbavicaMods } from './kvartovi/grbavica.js';
import { CROWD_REACTIONS } from '../content/aforizmi.js';

const KVART_MODS = {
  bascarsija:   getBascarsijaMods,
  marijin_dvor: getMarijinDvorMods,
  grbavica:     getGrbavicaMods
};

// ----------------------------------------------------------------
//  startSession
// ----------------------------------------------------------------
/**
 * Begin a new session for the given kvart.
 * @param {object} state
 * @param {string} kvart
 * @param {boolean} is_daily_challenge
 * @param {number}  daily_lp_multiplier
 */
export function startSession(state, kvart, is_daily_challenge = false, daily_lp_multiplier = 1.0) {
  const crowd_floor = getCrowdFloor(state);
  const initial_crowd = Math.max(30, crowd_floor);

  state.active_session = {
    kvart,
    start_time_ms: Date.now(),
    elapsed_sec: 0,
    slider_pos: 0,
    wave_pos: 0,
    wave_time: 0,
    crowd_level: initial_crowd,
    seconds_in_vibe: 0,
    lp_earned: 0,
    failed: false,
    is_daily_challenge,
    daily_lp_multiplier,
    last_tick_ms: Date.now(),
    // Per-session tracking for Marijin Dvor bonus
    crowd_peak_over_70_triggered: false,
    // Accumulated fractional crowd for smooth float math
    _crowd_frac: initial_crowd,
    // Reaction text
    reaction_text: null,
    reaction_timer: 0,
    // Canvas particles
    particles: []
  };

  // Reset per-session kvart flags
  const ks = state.kvartovi[kvart];
  ks.clean_tech_triggered_this_session = false;
  ks.max_crowd_this_session = initial_crowd;

  state.current_screen = 'session';
}

// ----------------------------------------------------------------
//  updateSession  — called every frame (dt in seconds)
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {object} input  — from readInput()
 * @param {number} dt     — seconds
 */
export function updateSession(state, input, dt) {
  const sess = state.active_session;
  if (!sess || sess.failed || sess.done) return;

  const now = Date.now();
  sess.elapsed_sec += dt;
  sess.last_tick_ms = now;

  // --- Session timeout ---
  if (sess.elapsed_sec >= SESSION_DURATION_SEC) {
    endSession(state, false);
    return;
  }

  // --- Slider input ---
  _updateSlider(state, sess, input, dt);

  // --- Wave oscillation ---
  const kvart = sess.kvart;
  const mods = KVART_MODS[kvart]?.(state) ?? { wave_speed_factor: 1.0, lp_modifier: 1.0 };
  const wave_speed = mods.wave_speed_factor ?? 1.0;

  sess.wave_time += dt * wave_speed;
  sess.wave_pos = Math.sin(sess.wave_time * (2 * Math.PI / WAVE_PERIOD_SECONDS)) * WAVE_AMPLITUDE;

  // --- Is slider in vibe zone? ---
  const in_vibe = _isInVibeZone(sess.slider_pos, sess.wave_pos, state);

  // --- Crowd update (10 ticks/s simulation, accumulated via dt) ---
  const ticks = Math.floor(sess.elapsed_sec / (CROWD_TICK_MS / 1000));
  const prev_ticks = Math.floor((sess.elapsed_sec - dt) / (CROWD_TICK_MS / 1000));
  const tick_count = Math.max(0, ticks - prev_ticks);

  if (tick_count > 0) {
    for (let t = 0; t < tick_count; t++) {
      _tickCrowd(state, sess, mods, in_vibe);
    }
  }

  // --- Track vibe time ---
  if (in_vibe) {
    sess.seconds_in_vibe += dt;
  }

  // --- Track peak crowd for Marijin Dvor ---
  const ks = state.kvartovi[kvart];
  if (sess._crowd_frac > ks.max_crowd_this_session) {
    ks.max_crowd_this_session = sess._crowd_frac;
  }

  // Marijin Dvor: trigger once when crowd > 70
  if (kvart === 'marijin_dvor' && sess._crowd_frac > 70 && !sess.crowd_peak_over_70_triggered) {
    sess.crowd_peak_over_70_triggered = true;
  }

  // --- Idle LP trickle during session (small) ---
  // Only from kvarti NOT playing (background idle still runs)
  // Session LP is tracked via _tickCrowd

  // --- Reaction text timer ---
  if (sess.reaction_timer > 0) {
    sess.reaction_timer -= dt;
    if (sess.reaction_timer <= 0) {
      sess.reaction_text = null;
    }
  }

  // --- Update particles ---
  _updateParticles(sess, dt);
}

// ----------------------------------------------------------------
//  Private — slider update
// ----------------------------------------------------------------
function _updateSlider(state, sess, input, dt) {
  const canvas = document.getElementById('session-canvas');
  if (!canvas) return;

  const w = canvas.clientWidth || window.innerWidth;

  if (input.pointer.down) {
    // Map pointer X to -100..+100
    const norm = (input.pointer.x / w) * 2 - 1; // -1..+1
    sess.slider_pos = Math.max(-100, Math.min(100, norm * 100));
  }

  // Keyboard nudge actions
  for (const act of input.actions) {
    if (act.action === 'slider_nudge') {
      sess.slider_pos = Math.max(-100, Math.min(100, sess.slider_pos + act.payload));
    }
    if (act.action === 'slider_center') {
      sess.slider_pos = 0;
    }
  }
}

// ----------------------------------------------------------------
//  Private — crowd tick (100ms)
// ----------------------------------------------------------------
function _tickCrowd(state, sess, mods, in_vibe) {
  const crowd_cap = getCrowdCap(state);
  const crowd_floor = getCrowdFloor(state);
  const dist = Math.abs(sess.slider_pos - sess.wave_pos);

  let delta = CROWD_DECAY_PER_TICK;

  if (in_vibe) {
    // Match bonus: closer = better, max at dist=0
    const match_bonus = 2.0 * (1 - dist / 60);
    delta += Math.max(0, match_bonus);
  } else {
    // Mismatch penalty
    delta -= dist * 0.03;
  }

  // B3: +1 crowd/tick when crowd > 70
  if (state.upgrades.B >= 3 && sess._crowd_frac > 70) {
    delta += 1.0;
  }

  sess._crowd_frac += delta;
  sess._crowd_frac = Math.max(crowd_floor, Math.min(crowd_cap, sess._crowd_frac));
  sess.crowd_level = Math.floor(sess._crowd_frac);

  // --- Crowd reaction trigger (every 10s when threshold crossed) ---
  if (sess.reaction_timer <= 0 && sess.elapsed_sec > 5) {
    let mood = null;
    if (sess.crowd_level > 70) mood = 'good';
    else if (sess.crowd_level < 30) mood = 'bad';
    if (mood === 'good' && sess.crowd_level >= 90) mood = 'legend';

    if (mood) {
      const arr = CROWD_REACTIONS[sess.kvart]?.[mood];
      if (arr?.length) {
        sess.reaction_text = arr[Math.floor(Math.random() * arr.length)];
        sess.reaction_timer = 8.0; // new reaction max every 8s
      }
    }
  }

  // --- Grbavica instant fail check ---
  if (sess.kvart === 'grbavica' && sess._crowd_frac < CROWD_FAIL_THRESHOLD) {
    const fail_chance = getGrbavicaFailChance(state);
    if (fail_chance > 0 && Math.random() < fail_chance) {
      endSession(state, true); // instant fail
      return;
    }
  }

  // LP trickle every tick while in-session (tiny, meaningful over 120s)
  if (in_vibe && sess._crowd_frac > CROWD_FAIL_THRESHOLD) {
    const lp_tick = (BASE_LP / 100) * (sess._crowd_frac / 100) * (mods.lp_modifier ?? 1.0);
    sess.lp_earned += lp_tick;

    // Spawn LP particle occasionally
    if (Math.random() < 0.12) {
      _spawnLPParticle(sess);
    }
  }
}

// ----------------------------------------------------------------
//  isInVibeZone — public for render
// ----------------------------------------------------------------
export function isInVibeZone(slider_pos, wave_pos, state) {
  return _isInVibeZone(slider_pos, wave_pos, state);
}

function _isInVibeZone(slider_pos, wave_pos, state) {
  const base_half = (VIBE_ZONE_MAX - VIBE_ZONE_MIN) / 2; // 30
  // A2+ widens zone by 8 points each side
  const extra = state.upgrades.A >= 2 ? 8 : 0;
  const half = base_half + extra;

  const diff = Math.abs(slider_pos - wave_pos);
  return diff <= half;
}

// ----------------------------------------------------------------
//  endSession
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {boolean} forced_fail — true if kicked out
 */
export function endSession(state, forced_fail = false) {
  const sess = state.active_session;
  if (!sess) return;
  if (sess.done || sess.failed) return;  // double-call guard (frame spike na mobilnom)

  sess.failed = forced_fail;

  let final_lp = sess.lp_earned;

  if (!forced_fail) {
    // --- Final scoring ---
    const vibe_factor = (sess.seconds_in_vibe / SESSION_DURATION_SEC) * 2.0;
    const crowd_factor = sess._crowd_frac / 100;
    const prestige_multi = PRESTIGE_MULTIPLIER[Math.min(state.prestige_level, 2)] ?? 1.0;
    const genre_bonus = 1.0 + getBGenreBonus(state);

    // Kvart mods
    const mods = KVART_MODS[sess.kvart]?.(state) ?? {};

    let session_lp = Math.floor(
      BASE_LP * vibe_factor * crowd_factor * prestige_multi * genre_bonus * (mods.lp_modifier ?? 1.0)
    );

    // Legenda Moment: crowd > 90 (or B4: threshold 85)
    const legend_threshold = state.upgrades.B >= 4 ? 85 : 90;
    if (sess._crowd_frac > legend_threshold) {
      session_lp = Math.floor(session_lp * 1.5);
      if (!state.achievements.first_legend_moment) {
        state.achievements.first_legend_moment = true;
      }
      // Spawn burst
      _spawnLegendBurst(sess);
    }

    // Perfect set: > 95% in vibe
    if (sess.seconds_in_vibe / SESSION_DURATION_SEC > 0.95) {
      const perfect_bonus = state.upgrades.A >= 4 ? 1.35 : 1.25;
      session_lp = Math.floor(session_lp * perfect_bonus);
    }

    // Marijin Dvor: crowd ever > 70 bonus
    if (sess.kvart === 'marijin_dvor' && sess.crowd_peak_over_70_triggered) {
      session_lp = Math.floor(session_lp * 1.20);
    }

    // Grbavica: max crowd >= 90 bonus
    if (sess.kvart === 'grbavica' && state.kvartovi.grbavica.max_crowd_this_session >= 90) {
      session_lp = Math.floor(session_lp * 1.50);
      if (!state.achievements.grbavica_legend) {
        state.achievements.grbavica_legend = true;
      }
    }

    // Daily challenge multiplier
    session_lp = Math.floor(session_lp * (sess.daily_lp_multiplier ?? 1.0));

    // Booking fee multiplier
    // (getBookingFeeMulti — applied at end)
    // No, booking fee is already in idle — don't double-count. Session LP is separate.
    // Note: booking fee modifier IS applied to the session base in GDD, so:
    // session_lp already includes mods. We multiply by next_night_income_modifier.
    const kvart_mod = state.kvartovi[sess.kvart].next_night_income_modifier ?? 1.0;
    session_lp = Math.floor(session_lp * kvart_mod);

    final_lp = Math.max(0, session_lp);
    sess.lp_earned = final_lp;
  }

  // Apply LP to state
  if (final_lp > 0) {
    state.lp += final_lp;
    state.total_lp_earned_this_run += final_lp;
  }

  // Update kvart
  const ks = state.kvartovi[sess.kvart];
  ks.sessions_played = (ks.sessions_played || 0) + 1;

  // Post-session: leave active_session populated for results screen,
  // but mark it as done so updateSession stops ticking.
  sess.done = true;

  // Reset next_night_income_modifier
  ks.next_night_income_modifier = 1.0;
}

// ----------------------------------------------------------------
//  clearSession — call after player dismisses results
// ----------------------------------------------------------------
export function clearSession(state) {
  state.active_session = null;
}

// ----------------------------------------------------------------
//  Particles
// ----------------------------------------------------------------
function _spawnLPParticle(sess) {
  sess.particles.push({
    type: 'lp',
    x: 0.5 + (Math.random() - 0.5) * 0.4,  // 0-1 normalised canvas coords
    y: 0.5 + (Math.random() - 0.5) * 0.3,
    vy: -0.15 - Math.random() * 0.1,
    life: 1.0,
    decay: 0.6 + Math.random() * 0.4
  });
}

function _spawnLegendBurst(sess) {
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    sess.particles.push({
      type: 'legend',
      x: 0.5,
      y: 0.4,
      vx: Math.cos(angle) * (0.05 + Math.random() * 0.1),
      vy: Math.sin(angle) * (0.05 + Math.random() * 0.1),
      life: 1.0,
      decay: 0.3 + Math.random() * 0.3
    });
  }
}

function _updateParticles(sess, dt) {
  const alive = [];
  for (const p of sess.particles) {
    p.life -= p.decay * dt;
    p.y += (p.vy ?? 0) * dt;
    p.x += (p.vx ?? 0) * dt;
    if (p.life > 0) alive.push(p);
  }
  sess.particles = alive;
}

// ----------------------------------------------------------------
//  Getters for render/ui
// ----------------------------------------------------------------
/** @returns {number} 0.0-1.0 progress through session */
export function getSessionProgress(sess) {
  return Math.min(1.0, (sess?.elapsed_sec ?? 0) / SESSION_DURATION_SEC);
}

/** @returns {number} seconds remaining */
export function getSessionTimeLeft(sess) {
  return Math.max(0, SESSION_DURATION_SEC - (sess?.elapsed_sec ?? 0));
}
