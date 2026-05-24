// progression.js — Round logic, Boss rounds
import { ROUNDS } from '../config.js';
import { getProblemForRound, buildOptions } from '../content/eq_bank.js';

export function getRoundConfig(roundIndex) {
  return ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
}

export function buildRoundData(roundIndex) {
  const config = getRoundConfig(roundIndex);
  const problem = getProblemForRound(roundIndex);
  const isTrap = config.bossType === 'trap';
  // Bug 1 fix: isDouble is true when bossType is 'double' OR when the problem itself is a double-filter type
  const isDouble = config.bossType === 'double' || problem.filterType === 'double';
  const options = buildOptions(problem, config.options, isTrap);

  return {
    roundIndex,
    config,
    problem,
    options,
    isDouble,
    isTrap,
    isSubtle: config.bossType === 'subtle',
  };
}

export function isGameOver(consecutiveMisses) {
  return consecutiveMisses >= 3;
}

export function isWin(roundIndex, totalRounds) {
  return roundIndex >= totalRounds;
}

export function correctionIsCorrect(selectedCorrections, problem, tolerance) {
  // For double boss: need both axes
  const expected = Array.isArray(problem.correction)
    ? problem.correction
    : [problem.correction];

  return expected.every(exp => {
    const sel = selectedCorrections.find(s => s.axis === exp.axis);
    if (!sel) return false;
    if (tolerance === 0) {
      return sel.direction === exp.direction;
    }
    // tolerance 1 = allow adjacent (ok counts as 1 step wrong but OK dir is always wrong for smanjiti/pojacati)
    // steps: smanjiti=-1, ok=0, pojacati=+1
    const dirToNum = { smanjiti: -1, ok: 0, pojacati: 1 };
    const expectedNum = dirToNum[exp.direction] ?? 0;
    const selectedNum = dirToNum[sel.direction] ?? 0;
    return Math.abs(expectedNum - selectedNum) <= tolerance;
  });
}
