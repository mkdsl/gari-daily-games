// progression.js — XP, career titles, level unlock
import { CAREER_TITLES, XP_PER_WIN, XP_PER_COMPLAINT, XP_PER_HAPPINESS_POINT } from '../config.js';
import { VENUES } from '../content/venues.js';

export function getCareerTitle(xp) {
  let title = CAREER_TITLES[0].title;
  for (const tier of CAREER_TITLES) {
    if (xp >= tier.minXp) title = tier.title;
    else break;
  }
  return title;
}

export function addXP(amount, state) {
  state.xp = Math.max(0, state.xp + amount);
  // Update career level
  let level = 0;
  for (let i = 0; i < CAREER_TITLES.length; i++) {
    if (state.xp >= CAREER_TITLES[i].minXp) level = i;
    else break;
  }
  state.careerLevel = level;
}

export function calculateSessionXP(state) {
  const happinessXP = Math.round(state.sessionStats.maxHappiness * XP_PER_HAPPINESS_POINT);
  const complaintPenalty = state.sessionStats.complaints * Math.abs(XP_PER_COMPLAINT);
  const winBonus = state.pendingWin ? XP_PER_WIN : 0;
  return Math.max(0, happinessXP - complaintPenalty + winBonus);
}

export function isLevelUnlocked(venueIndex, state) {
  if (venueIndex === 0) return true;
  // Unlock next venue when completing current level
  return venueIndex <= state.currentLevel;
}

export function unlockNextVenue(state) {
  if (state.currentLevel < VENUES.length - 1) {
    state.currentLevel = Math.min(VENUES.length - 1, state.currentLevel + 1);
  }
}
