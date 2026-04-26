import { CONFIG } from '../config.js';

export function computeScore(state, victory) {
  if (!victory) {
    return { victory: false, grade: 'PORAZ', turns: state.turn, ammoLeft: state.ammo, losses: countLosses(state) };
  }
  const turns = state.turn;
  const ammoLeft = state.ammo;
  const losses = countLosses(state);
  const s = CONFIG.SCORE;
  let grade;
  if (turns <= s.S.maxTurns && ammoLeft >= s.S.minAmmo && losses === 0) grade = 'S';
  else if (turns <= s.A.maxTurns && ammoLeft >= s.A.minAmmo) grade = 'A';
  else if (turns <= s.B.maxTurns) grade = 'B';
  else grade = 'C';
  return { victory: true, grade, turns, ammoLeft, losses };
}

function countLosses(state) {
  const alive = Object.values(state.units).filter(u => u.side === 'player').length;
  const started = state.statsAtStart?.soldiers || 3;
  return started - alive;
}
