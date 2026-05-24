// state.js — Game state shape + save/load highscore
import { GAME_CONFIG } from './config.js';

export function createInitialState() {
  return {
    phase: 'start',          // start | listening | diagnosis | correction | verify | roundResult | gameover | win
    round: 0,                // 0-based index
    score: 0,
    lives: GAME_CONFIG.MAX_LIVES,
    streak: 0,
    maxStreak: 0,
    consecutiveMisses: 0,
    roundsData: [],          // per-round results
    currentProblem: null,
    currentOptions: [],
    selectedDiagnosis: null,
    diagnosisCorrect: false,
    selectedCorrections: [],  // [{axis, direction}]
    correctionsCorrect: false,
    timerStart: 0,
    timerDuration: 0,
    timerExpired: false,
    sessionStarted: false,
    glossaryShown: new Set(), // terms shown this session
    audioReady: false,
  };
}

export function getRank(score) {
  if (score >= 2600) return 'Legenda Probe';
  if (score >= 2000) return 'Majstor Zvuka';
  if (score >= 1000) return 'Solidan Tonac';
  return 'Početnik Tonac';
}
