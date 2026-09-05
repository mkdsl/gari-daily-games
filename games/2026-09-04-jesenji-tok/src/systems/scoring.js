/**
 * @module scoring
 * Score calculation, ecosystem bonus, rank determination, and detailed analytics.
 * This is the heart of the game's feedback system.
 *
 * Scoring formula:
 *   base_score = task.base_score (see tasks.js for values)
 *   in-window:   base_score × 1.0
 *   out-window:  base_score × 0.6
 *   skipped:     0
 *
 * Ecosystem bonus:
 *   If Micelij + Jezero + Kompost ALL placed in-window:
 *   Those 3 tasks get ×1.5 (on top of their in-window score)
 *
 * Weather modifier:
 *   vatreno_lisce: Kompost in hot weeks → ×0.9 (before ecosystem check)
 */

import { TASKS } from '../content/tasks.js';
import {
  RANKS,
  RANK_THRESHOLDS,
  OUT_WINDOW_MULTIPLIER,
  ECOSYSTEM_BONUS_MULTIPLIER,
} from '../config.js';
import { isInWindow, isHotWeek, getEffectiveWindow } from './weather.js';
import { getAssignment } from '../state.js';

/**
 * @typedef {Object} TaskScore
 * @property {string} task_id
 * @property {string} task_name
 * @property {string} task_emoji
 * @property {number|null} week - null if not assigned
 * @property {boolean} in_window
 * @property {boolean} ecosystem_bonus_applied
 * @property {boolean} hot_penalty_applied
 * @property {number} base - base score value
 * @property {number} modifier - effective multiplier (before ecosystem)
 * @property {number} raw_score - base × modifier (before ecosystem)
 * @property {number} ecosystem_bonus_amount - extra from ecosystem bonus
 * @property {number} final - total final score for this task
 * @property {string} note - human-readable explanation
 * @property {string} color - task color for UI
 */

/**
 * @typedef {Object} ScoreAnalytics
 * @property {number} tasks_in_window
 * @property {number} tasks_assigned
 * @property {number} tasks_skipped
 * @property {number} tasks_out_window
 * @property {number} efficiency - tasks_in_window / tasks_assigned (0-1)
 * @property {number} max_possible - theoretical max without ecosystem
 * @property {number} max_with_ecosystem - theoretical max with ecosystem
 * @property {number} pct_of_max - score as percentage of theoretical max
 * @property {boolean} perfect_season - all 6 tasks in window
 */

/**
 * @typedef {Object} ScoreResult
 * @property {number} total - Total score
 * @property {string} rank_id - Rank identifier
 * @property {string} rank_label - Rank display label
 * @property {string} rank_emoji - Rank emoji
 * @property {string} rank_color - Rank color hex
 * @property {boolean} ecosystem_bonus - Whether ecosystem bonus was applied
 * @property {number} ecosystem_bonus_total - Total pts from ecosystem bonus
 * @property {boolean} is_new_best - Whether this is a new best score
 * @property {TaskScore[]} breakdown - Per-task score breakdown
 * @property {ScoreAnalytics} analytics - Additional analytics
 * @property {string} summary - One-line human-readable summary
 */

/**
 * Calculate the final score for the current season.
 * Mutates nothing — pure function on state.
 * @param {import('../state.js').GameState} state
 * @returns {ScoreResult}
 */
export function calculateScore(state) {
  const breakdown = [];
  let rawTotal = 0;

  // ── Step 1: Per-task base scoring ──────────────────────────────────────────
  for (const task of TASKS) {
    const assignment = getAssignment(state, task.id);

    if (!assignment) {
      // Task not assigned — zero points
      breakdown.push({
        task_id: task.id,
        task_name: task.name,
        task_emoji: task.emoji,
        week: null,
        in_window: false,
        ecosystem_bonus_applied: false,
        hot_penalty_applied: false,
        base: task.base_score,
        modifier: 0,
        raw_score: 0,
        ecosystem_bonus_amount: 0,
        final: 0,
        note: 'Nije dodeljeno — 0 poena.',
        color: task.color,
      });
      continue;
    }

    const inWindow = isInWindow(task, assignment.week, state.weather);
    let modifier = inWindow ? 1.0 : OUT_WINDOW_MULTIPLIER;

    // vatreno_lisce weather: Kompost placed in hot weeks (N1-N2) loses 10%
    let hotPenalty = false;
    if (
      state.weather?.preset_id === 'vatreno_lisce' &&
      task.id === 'kompost' &&
      isHotWeek(state.weather, assignment.week)
    ) {
      modifier = Math.round(modifier * 0.9 * 100) / 100;
      hotPenalty = true;
    }

    const rawScore = Math.round(task.base_score * modifier);
    rawTotal += rawScore;

    breakdown.push({
      task_id: task.id,
      task_name: task.name,
      task_emoji: task.emoji,
      week: assignment.week,
      in_window: inWindow,
      ecosystem_bonus_applied: false,
      hot_penalty_applied: hotPenalty,
      base: task.base_score,
      modifier,
      raw_score: rawScore,
      ecosystem_bonus_amount: 0,
      final: rawScore,
      note: buildNote(task, inWindow, assignment.week, hotPenalty, modifier, state),
      color: task.color,
    });
  }

  // ── Step 2: Ecosystem bonus ────────────────────────────────────────────────
  // Micelij + Jezero + Kompost ALL in-window → those 3 tasks × 1.5
  const ecosystemTasks = ['micelij', 'jezero', 'kompost'];
  const ecosystemScores = ecosystemTasks.map((id) => breakdown.find((b) => b.task_id === id));
  const allEcoInWindow = ecosystemScores.every(
    (b) => b && b.week !== null && b.in_window
  );

  let ecosystemBonusTotal = 0;
  if (allEcoInWindow) {
    for (const b of breakdown) {
      if (ecosystemTasks.includes(b.task_id) && b.week !== null) {
        const bonusAmount = Math.round(b.raw_score * (ECOSYSTEM_BONUS_MULTIPLIER - 1));
        ecosystemBonusTotal += bonusAmount;
        b.final = b.raw_score + bonusAmount;
        b.ecosystem_bonus_amount = bonusAmount;
        b.ecosystem_bonus_applied = true;
        b.note += ` 🌿 Ekosistem bonus (+${bonusAmount}p, ×${ECOSYSTEM_BONUS_MULTIPLIER}).`;
      }
    }
  }

  const total = rawTotal + ecosystemBonusTotal;

  // ── Step 3: Rank determination ─────────────────────────────────────────────
  const rank = getRank(total);

  // ── Step 4: Analytics ─────────────────────────────────────────────────────
  const analytics = buildAnalytics(breakdown, total, state);

  // ── Step 5: Summary ───────────────────────────────────────────────────────
  const summary = buildSummary(total, rank, analytics, allEcoInWindow, state);

  return {
    total,
    rank_id: rank.id,
    rank_label: rank.label,
    rank_emoji: rank.emoji,
    rank_color: rank.color,
    ecosystem_bonus: allEcoInWindow,
    ecosystem_bonus_total: ecosystemBonusTotal,
    is_new_best: false, // set by caller after saveBestScore()
    breakdown,
    analytics,
    summary,
  };
}

/**
 * Get rank object for a given score
 * @param {number} score
 * @returns {{ id: string, label: string, emoji: string, color: string, min: number }}
 */
export function getRank(score) {
  for (const rank of RANKS) {
    if (score >= rank.min) {
      return rank;
    }
  }
  return RANKS[RANKS.length - 1];
}

/**
 * Build analytics object for a completed season
 * @param {TaskScore[]} breakdown
 * @param {number} total
 * @param {import('../state.js').GameState} state
 * @returns {ScoreAnalytics}
 */
function buildAnalytics(breakdown, total, state) {
  const tasks_assigned = breakdown.filter((b) => b.week !== null).length;
  const tasks_in_window = breakdown.filter((b) => b.in_window).length;
  const tasks_skipped = breakdown.filter((b) => b.week === null).length;
  const tasks_out_window = tasks_assigned - tasks_in_window;
  const efficiency = tasks_assigned > 0 ? tasks_in_window / tasks_assigned : 0;

  // Theoretical max without ecosystem (all 6 in-window)
  const max_possible = TASKS.reduce((s, t) => s + t.base_score, 0);

  // Theoretical max with ecosystem bonus
  const ecoTaskScores = TASKS.filter((t) =>
    ['micelij', 'jezero', 'kompost'].includes(t.id)
  ).reduce((s, t) => s + t.base_score, 0);
  const ecoNonTaskScores = TASKS.filter((t) =>
    !['micelij', 'jezero', 'kompost'].includes(t.id)
  ).reduce((s, t) => s + t.base_score, 0);
  const max_with_ecosystem =
    Math.round(ecoTaskScores * ECOSYSTEM_BONUS_MULTIPLIER) + ecoNonTaskScores;

  const pct_of_max = max_with_ecosystem > 0
    ? Math.round((total / max_with_ecosystem) * 100)
    : 0;

  const perfect_season = tasks_in_window === TASKS.length;

  return {
    tasks_in_window,
    tasks_assigned,
    tasks_skipped,
    tasks_out_window,
    efficiency: Math.round(efficiency * 100) / 100,
    max_possible,
    max_with_ecosystem,
    pct_of_max,
    perfect_season,
  };
}

/**
 * Build a one-line summary string for the season result
 * @param {number} total
 * @param {{ id: string, label: string }} rank
 * @param {ScoreAnalytics} analytics
 * @param {boolean} ecosystemBonus
 * @param {import('../state.js').GameState} state
 * @returns {string}
 */
function buildSummary(total, rank, analytics, ecosystemBonus, state) {
  const parts = [];

  if (analytics.perfect_season) {
    parts.push('Svi zadaci u prozoru!');
  } else if (analytics.tasks_in_window > 0) {
    parts.push(`${analytics.tasks_in_window}/6 zadataka u prozoru`);
  }

  if (ecosystemBonus) {
    parts.push('Ekosistem bonus aktiviran');
  }

  if (analytics.tasks_skipped > 0) {
    parts.push(`${analytics.tasks_skipped} preskočeno`);
  }

  if (state.weather?.preset_id === 'rani_mraz' && analytics.tasks_in_window < analytics.tasks_assigned) {
    parts.push('Mraz skratio prozore');
  }

  return `${rank.label} — ${parts.join(', ')}. ${total} poena (${analytics.pct_of_max}% od maksimuma).`;
}

/**
 * Build a human-readable note for a task score entry
 * @param {import('../content/tasks.js').Task} task
 * @param {boolean} inWindow
 * @param {number} week
 * @param {boolean} hotPenalty
 * @param {number} modifier
 * @param {import('../state.js').GameState} state
 * @returns {string}
 */
function buildNote(task, inWindow, week, hotPenalty, modifier, state) {
  const { start, end } = state.weather
    ? getEffectiveWindow(task, state.weather)
    : { start: task.window_start, end: task.window_end };

  if (inWindow && !hotPenalty) {
    return `N${week} — u prozoru (N${start}–N${end}). ×1.0`;
  }

  if (!inWindow) {
    const pct = Math.round(modifier * 100);
    if (week < start) {
      return `N${week} — prerano (prozor od N${start}). ×${modifier} (${pct}% poena)`;
    }
    return `N${week} — prekasno (prozor do N${end}). ×${modifier} (${pct}% poena)`;
  }

  if (hotPenalty) {
    return `N${week} — u prozoru ali toplo vreme. ×0.9 (90% poena)`;
  }

  return `N${week} — ×${modifier}`;
}

/**
 * Determine if ecosystem bonus is achievable/in-progress (for UI hints)
 * @param {import('../state.js').GameState} state
 * @returns {{ achievable: boolean, missing: string[], all_assigned: boolean }}
 */
export function checkEcosystemBonusStatus(state) {
  const ecosystemTasks = ['micelij', 'jezero', 'kompost'];
  const missing = [];
  let allAssigned = true;

  for (const id of ecosystemTasks) {
    const assignment = getAssignment(state, id);
    if (!assignment) {
      allAssigned = false;
      const task = TASKS.find((t) => t.id === id);
      missing.push(task?.name ?? id);
    } else {
      const task = TASKS.find((t) => t.id === id);
      if (task && state.weather && !isInWindow(task, assignment.week, state.weather)) {
        missing.push(`${task.name} (van prozora)`);
      }
    }
  }

  return { achievable: missing.length === 0, missing, all_assigned: allAssigned };
}

/**
 * Calculate the score for a single task in isolation (for preview tooltip)
 * @param {string} taskId
 * @param {number} week
 * @param {import('../state.js').GameState} state
 * @returns {{ score: number, in_window: boolean, modifier: number, note: string }}
 */
export function previewTaskScore(taskId, week, state) {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task || !state.weather) {
    return { score: 0, in_window: false, modifier: 0, note: 'Nepoznato' };
  }

  const inWindow = isInWindow(task, week, state.weather);
  let modifier = inWindow ? 1.0 : OUT_WINDOW_MULTIPLIER;

  const hotPenalty =
    state.weather?.preset_id === 'vatreno_lisce' &&
    taskId === 'kompost' &&
    isHotWeek(state.weather, week);
  if (hotPenalty) modifier = Math.round(modifier * 0.9 * 100) / 100;

  const score = Math.round(task.base_score * modifier);
  const { start, end } = getEffectiveWindow(task, state.weather);

  let note;
  if (inWindow && !hotPenalty) {
    note = `${score}p (×1.0) — u prozoru ✓`;
  } else if (!inWindow) {
    note = `${score}p (×${modifier}) — van prozora (N${start}–N${end}) ⚠️`;
  } else {
    note = `${score}p (×0.9) — toplo vreme -10%`;
  }

  return { score, in_window: inWindow, modifier, note };
}

/**
 * Get theoretical max score for current weather conditions
 * (all 6 tasks in-window + ecosystem bonus if possible)
 * @param {import('../state.js').GameState} state
 * @returns {{ without_eco: number, with_eco: number }}
 */
export function getTheoreticalMax(state) {
  const without_eco = TASKS.reduce((s, t) => s + t.base_score, 0);

  const ecoTaskScores = TASKS.filter((t) =>
    ['micelij', 'jezero', 'kompost'].includes(t.id)
  ).reduce((s, t) => s + t.base_score, 0);
  const nonEcoScores = TASKS.filter((t) =>
    !['micelij', 'jezero', 'kompost'].includes(t.id)
  ).reduce((s, t) => s + t.base_score, 0);
  const with_eco = Math.round(ecoTaskScores * ECOSYSTEM_BONUS_MULTIPLIER) + nonEcoScores;

  return { without_eco, with_eco };
}

/**
 * Compare two score results and return delta analysis
 * @param {ScoreResult} current
 * @param {ScoreResult} previous
 * @returns {{ delta: number, improved: boolean, newAchievements: boolean }}
 */
export function compareScores(current, previous) {
  const delta = current.total - previous.total;
  const improved = delta > 0;
  const newAchievements =
    current.ecosystem_bonus && !previous.ecosystem_bonus;

  return { delta, improved, newAchievements };
}

/**
 * Determine if a score qualifies for prestige
 * @param {number} score
 * @param {number} threshold
 * @returns {boolean}
 */
export function qualifiesForPrestige(score, threshold) {
  return score >= threshold;
}

/**
 * Get hint text for improving score next run
 * @param {ScoreResult} result
 * @param {import('../state.js').GameState} state
 * @returns {string[]} array of tip strings
 */
export function getImprovementHints(result, state) {
  const hints = [];

  if (!result.ecosystem_bonus) {
    const { missing } = checkEcosystemBonusStatus(state);
    if (missing.length > 0) {
      hints.push(`Ekosistem bonus: stavi ${missing.join(', ')} u prozor → +50% za ta 3 zadatka.`);
    }
  }

  const outWindowTasks = result.breakdown.filter(
    (b) => b.week !== null && !b.in_window
  );
  if (outWindowTasks.length > 0) {
    const names = outWindowTasks.map((b) => b.task_name).join(', ');
    hints.push(`Van prozora: ${names} — pomeri u optimalni period.`);
  }

  const skippedTasks = result.breakdown.filter((b) => b.week === null);
  if (skippedTasks.length > 0) {
    const names = skippedTasks.map((b) => b.task_name).join(', ');
    hints.push(`Nisi rasporedio: ${names} — dodaj ih sledećeg puta.`);
  }

  if (result.analytics.pct_of_max < 60) {
    hints.push('Prestiž bonus "Čitljivo nebo" pomaže da vidiš svu prognozu od starta.');
  }

  return hints;
}
