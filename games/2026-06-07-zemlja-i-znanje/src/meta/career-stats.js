/**
 * career-stats.js — Ukupni polaznici, prihod, stopa povratka, statistike
 */

export function updateCareerStats(meta, sessionResult) {
  meta.totalSessions = (meta.totalSessions || 0) + 1;
  meta.totalParticipants = (meta.totalParticipants || 0) + (sessionResult.participantsFinished || 0);
  meta.totalRevenue = (meta.totalRevenue || 0) + (sessionResult.income || 0);

  if (sessionResult.incidentCount === 0) {
    meta.sessionsWithoutIncident = (meta.sessionsWithoutIncident || 0) + 1;
  }

  if (!meta.bestSeason || sessionResult.avgSatisfaction > (meta.bestSeason.avgSatisfaction || 0)) {
    meta.bestSeason = sessionResult;
  }

  return meta;
}

/**
 * Vraca summary za career screen
 */
export function getCareerSummary(meta) {
  return {
    totalSessions:         meta.totalSessions || 0,
    totalParticipants:     meta.totalParticipants || 0,
    totalRevenue:          meta.totalRevenue || 0,
    totalSeasons:          meta.totalSeasons || 0,
    sessionsWithoutIncident: meta.sessionsWithoutIncident || 0,
    bestSeason:            meta.bestSeason,
    reputation:            meta.reputation || 0,
    prestigeLevel:         meta.prestigeLevel || 0,
    achievementCount:      Object.values(meta.achievements || {}).filter(a => a.unlocked).length
  };
}
