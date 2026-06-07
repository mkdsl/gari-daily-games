/**
 * achievements.js — 15+ achievements, check logika, unlock, localStorage flag
 */

import { bus, EVT } from '../events.js';
import { ACHIEVEMENT_IDS } from '../config.js';
import { saveMetaState, getMetaState } from './meta-state.js';

export const ACHIEVEMENTS_DEF = {
  [ACHIEVEMENT_IDS.FIRST_SESSION]: {
    id: ACHIEVEMENT_IDS.FIRST_SESSION,
    name: 'Prva Sesija',
    description: 'Završi svoju prvu masterclass sesiju.',
    icon: '🌱',
    rep: 25
  },
  [ACHIEVEMENT_IDS.HALFWAY]: {
    id: ACHIEVEMENT_IDS.HALFWAY,
    name: 'Polovina Puta',
    description: 'Dostigni 500 reputacije.',
    icon: '⭐',
    rep: 500
  },
  [ACHIEVEMENT_IDS.LIVING_SCHOOL]: {
    id: ACHIEVEMENT_IDS.LIVING_SCHOOL,
    name: 'Živo Učilište',
    description: 'Dostigni 1000 reputacije. Guncati živi.',
    icon: '🏫',
    rep: 1000
  },
  [ACHIEVEMENT_IDS.RAIN_LESSON]: {
    id: ACHIEVEMENT_IDS.RAIN_LESSON,
    name: 'Kiša ne zaustavlja',
    description: 'Odaberi opciju "Kiša je deo lekcije" u incident INC_02.',
    icon: '🌧️',
    rep: 0
  },
  five_seasons: {
    id: 'five_seasons',
    name: 'Pet Sezona',
    description: 'Završi 5 sezona u jednom ciklusu.',
    icon: '🍂',
    rep: 0
  },
  [ACHIEVEMENT_IDS.PRESTIGE_FIRST]: {
    id: ACHIEVEMENT_IDS.PRESTIGE_FIRST,
    name: 'Novi Počeci',
    description: 'Izvrši prvi prestiž reset.',
    icon: '🔄',
    rep: 0
  },
  [ACHIEVEMENT_IDS.JOURNALIST_BONUS]: {
    id: ACHIEVEMENT_IDS.JOURNALIST_BONUS,
    name: 'PR Zlato',
    description: 'Novinar na kraju sezone ima zadovoljstvo ≥80%.',
    icon: '📰',
    rep: 0
  },
  [ACHIEVEMENT_IDS.PERFECT_SESSION]: {
    id: ACHIEVEMENT_IDS.PERFECT_SESSION,
    name: 'Savršena Sesija',
    description: 'Završi sesiju sa prosečnim zadovoljstvom ≥95%.',
    icon: '✨',
    rep: 0
  },
  [ACHIEVEMENT_IDS.NO_INCIDENT]: {
    id: ACHIEVEMENT_IDS.NO_INCIDENT,
    name: 'Bez Incidenta',
    description: 'Završi sesiju bez ijednog incidenta.',
    icon: '🌿',
    rep: 0
  },
  [ACHIEVEMENT_IDS.FULL_HOUSE]: {
    id: ACHIEVEMENT_IDS.FULL_HOUSE,
    name: 'Pun Kurs',
    description: 'Povedi 8 polaznika na sesiji.',
    icon: '🎓',
    rep: 0
  },
  guncati_link: {
    id: 'guncati_link',
    name: 'Guncati Veza',
    description: 'Dostigni 800 reputacije i aktiraj Guncati link.',
    icon: '🔗',
    rep: 800
  },
  first_prestige_unlock: {
    id: 'first_prestige_unlock',
    name: 'Otključano Srce',
    description: 'Otključaj inokulaciju temu.',
    icon: '🍄',
    rep: 0
  },
  rain_master: {
    id: 'rain_master',
    name: 'Gospodar Kiše',
    description: 'Završi 3 sesije za kišnog vremena sa ≥75% zadovoljstva.',
    icon: '☔',
    rep: 0
  },
  team_player: {
    id: 'team_player',
    name: 'Tim Igrač',
    description: 'Angažuj sva 4 stručnjaka u istoj sezoni.',
    icon: '🤝',
    rep: 0
  },
  storyteller: {
    id: 'storyteller',
    name: 'Pripovedač',
    description: 'Imaj Novinara sa ≥90% satisfaction na kraju sesije.',
    icon: '📖',
    rep: 0
  }
};

/**
 * Check i unlock achievement
 */
export function checkAndUnlock(achievementId) {
  const meta = getMetaState();
  if (!meta) return false;

  if (!meta.achievements) meta.achievements = {};
  if (meta.achievements[achievementId]?.unlocked) return false;

  const def = ACHIEVEMENTS_DEF[achievementId];
  if (!def) return false;

  meta.achievements[achievementId] = {
    unlocked: true,
    unlockedAt: Date.now()
  };

  saveMetaState();
  bus.emit(EVT.ACHIEVEMENT, { achievement: def });
  bus.emit(EVT.TOAST, { msg: `🏆 ${def.name}: ${def.description}`, type: 'achievement', duration: 4000 });
  bus.emit(EVT.AUDIO_PLAY, { sound: 'decision_positive' });

  return true;
}

/**
 * Check svih achievement-a na osnovu rezultata sesije
 */
export function checkSessionAchievements(result, meta) {
  const unlocked = [];

  if (meta.totalSessions === 0) {
    if (checkAndUnlock(ACHIEVEMENT_IDS.FIRST_SESSION)) unlocked.push(ACHIEVEMENT_IDS.FIRST_SESSION);
  }

  if (result.avgSatisfaction >= 0.95) {
    if (checkAndUnlock(ACHIEVEMENT_IDS.PERFECT_SESSION)) unlocked.push(ACHIEVEMENT_IDS.PERFECT_SESSION);
  }

  if (result.incidentCount === 0) {
    if (checkAndUnlock(ACHIEVEMENT_IDS.NO_INCIDENT)) unlocked.push(ACHIEVEMENT_IDS.NO_INCIDENT);
  }

  if (result.participantsStarted >= 8) {
    if (checkAndUnlock(ACHIEVEMENT_IDS.FULL_HOUSE)) unlocked.push(ACHIEVEMENT_IDS.FULL_HOUSE);
  }

  if (result.journalistBonus > 0) {
    if (checkAndUnlock(ACHIEVEMENT_IDS.JOURNALIST_BONUS)) unlocked.push(ACHIEVEMENT_IDS.JOURNALIST_BONUS);
  }

  return unlocked;
}

/**
 * Check rep-based achievements
 */
export function checkRepAchievements(rep) {
  const unlocked = [];

  if (rep >= 25 && checkAndUnlock(ACHIEVEMENT_IDS.FIRST_SESSION)) unlocked.push(ACHIEVEMENT_IDS.FIRST_SESSION);
  if (rep >= 500 && checkAndUnlock(ACHIEVEMENT_IDS.HALFWAY)) unlocked.push(ACHIEVEMENT_IDS.HALFWAY);
  if (rep >= 800 && checkAndUnlock('guncati_link')) unlocked.push('guncati_link');
  if (rep >= 1000 && checkAndUnlock(ACHIEVEMENT_IDS.LIVING_SCHOOL)) unlocked.push(ACHIEVEMENT_IDS.LIVING_SCHOOL);

  return unlocked;
}

export function getUnlockedAchievements(meta) {
  if (!meta?.achievements) return [];
  return Object.entries(meta.achievements)
    .filter(([, v]) => v.unlocked)
    .map(([id]) => ACHIEVEMENTS_DEF[id])
    .filter(Boolean);
}

export function getTotalAchievements() {
  return Object.keys(ACHIEVEMENTS_DEF).length;
}
