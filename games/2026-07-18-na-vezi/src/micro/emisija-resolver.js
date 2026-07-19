/** Kraj emisije: uptime, engagement, no-show flag, highlight trigger */
import { getDashboardState } from './dashboard-state.js';
import { calcOverallEngagement } from './dashboard-state.js';
import { calcWeightedEngagement } from './platform-curves.js';
import { GAME_CONFIG, clamp } from '../config.js';
import { getState, recordEmisijaStats, updateGuestReliability } from '../state.js';
import { emit, EVENTS } from '../events.js';
import { calcWeeklyRevenue, resolveWeeklyOutcome } from '../macro/weekly-outcome.js';

/**
 * Razrešava emisiju na kraju — finalni scorer
 * @returns {Object} emisijaResult
 */
export function resolveEmisija() {
  const ds = getDashboardState();
  const state = getState();
  if (!ds) return null;

  const { elapsed, duration, signal, uptimeSeconds, offgrid, offgridMax,
          alarmsResolved, alarmsMissed, gostArrived, gostId, gostStandout,
          tiktokSpike, tiktokSpikeEarly, alarmChainCount, hasCriticalAlarm,
          plan, chatMomentum, alarmHistory } = ds;

  // Signal uptime (% vremena sa signalom > 50)
  const signalUptime = clamp(uptimeSeconds / Math.max(elapsed, 1), 0, 1);

  // Battery uptime (% kapaciteta koji je preostao)
  const batteryUsagePct = offgridMax > 0 ? (offgridMax - offgrid) / offgridMax : 1;
  const batteryLeftPct = offgridMax > 0 ? offgrid / offgridMax : 0;

  // Engagement po platformi
  const alloc = plan.platform_alloc;
  const engagementPerPlatform = {
    ig: clamp(chatMomentum.ig * 0.6 + signalUptime * 0.4, 0, 1),
    tiktok: clamp(chatMomentum.tiktok * 0.7 + (tiktokSpike ? 0.3 : 0), 0, 1),
    youtube: clamp(chatMomentum.youtube * 0.5 + signalUptime * 0.5, 0, 1),
  };

  // Gost bonus na engagement
  if (gostArrived && gostId !== 'g8') {
    const gostBonus = gostStandout ? 0.15 : 0.08;
    for (const p of ['ig', 'tiktok', 'youtube']) {
      engagementPerPlatform[p] = Math.min(1, engagementPerPlatform[p] + gostBonus);
    }
  }

  const overallEngagement = calcWeightedEngagement(engagementPerPlatform, alloc);

  // Revenue
  const revenue = calcWeeklyRevenue(
    state.audience,
    engagementPerPlatform,
    alloc,
    state.season_multiplier
  );

  // Capital delta
  const capitalDelta = revenue - GAME_CONFIG.UPKEEP_COST_PER_WEEK;

  // No-show
  const noShow = !gostArrived && gostId !== 'g8';

  // Highlights
  const highlights = _buildHighlights(ds, signalUptime, tiktokSpike, tiktokSpikeEarly, alarmHistory);

  // Completion bonus (emotionally — puna emisija)
  const emisijaComplete = elapsed >= duration * 0.9;

  const result = {
    week: state.week,
    format: plan.format,
    weather: plan.weather_band,
    elapsed,
    duration,
    emisijaComplete,

    // Signal
    signalUptime,
    hasCriticalAlarm,

    // Battery
    batteryUsagePct,
    batteryLeftPct,
    offgridFinal: offgrid,
    offgridMax,

    // Engagement
    engagement: engagementPerPlatform,
    overallEngagement,

    // Revenue
    revenue,
    capitalDelta,

    // Gost
    noShow,
    gostId,
    gostStandout,

    // TikTok
    tiktokSpike,
    tiktokSpikeEarly,

    // Alarmi
    alarmsResolved,
    alarmsMissed,
    alarmChainCount,

    // Highlights
    highlights,
  };

  // Ažuriraj guest reliability
  if (gostId && gostId !== 'g8') {
    updateGuestReliability(gostId, noShow, gostStandout);
  }

  // Zapiši u state stats
  recordEmisijaStats({
    engagement: overallEngagement,
    capitalDelta,
    alarmsResolved,
    alarmsMissed,
  });

  // Resolve weekly outcome (ažurira state)
  const weeklyOutcome = resolveWeeklyOutcome({
    engagement: engagementPerPlatform,
    signalUptime,
    capitalDelta,
    noShow,
    tiktokSpike,
  });

  emit(EVENTS.EMISIJA_END, { result, weeklyOutcome });

  return { ...result, weeklyOutcome };
}

/**
 * Gradi highlight listu
 * @param {Object} ds
 * @param {number} signalUptime
 * @param {boolean} tiktokSpike
 * @param {boolean} tiktokSpikeEarly
 * @param {Array} alarmHistory
 * @returns {Array}
 */
function _buildHighlights(ds, signalUptime, tiktokSpike, tiktokSpikeEarly, alarmHistory) {
  const candidates = [];

  // Rešeni alarmi (posebno lanci)
  const resolvedOnTime = alarmHistory.filter(a => !a.missed && a.resolvedAt !== null);
  if (resolvedOnTime.length >= 2) {
    candidates.push({
      type: 'alarm_chain_broken',
      moment_type: 'alarm_chain_broken',
      score: 25,
      desc: `${resolvedOnTime.length} alarma rešena u nizu`,
    });
  } else if (resolvedOnTime.length >= 1) {
    candidates.push({
      type: 'alarm_resolved',
      moment_type: 'alarm_resolved_ontime',
      score: 15,
      desc: 'Alarm rešen na vreme',
    });
  }

  // TikTok spike
  if (tiktokSpike) {
    candidates.push({
      type: 'tiktok_spike',
      moment_type: tiktokSpikeEarly ? 'tiktok_spike_caught' : 'tiktok_spike',
      score: tiktokSpikeEarly ? 20 : 12,
      desc: tiktokSpikeEarly ? 'TikTok spike uhvaćen u prvih 2 minuta!' : 'TikTok spike tokom emisije',
    });
  }

  // Gost standout
  if (ds.gostStandout) {
    candidates.push({
      type: 'guest_standout',
      moment_type: 'guest_standout',
      score: 18,
      desc: 'Gost oduševio publiku',
    });
  }

  // Baterija preživela
  if (ds.offgrid < 10 && ds.offgridMax > 0) {
    candidates.push({
      type: 'battery_critical_survived',
      moment_type: 'battery_critical_survived',
      score: 22,
      desc: 'Emisija završena sa skoro praznom baterijom',
    });
  }

  // Signal stabilan celu emisiju
  if (signalUptime >= 0.9) {
    candidates.push({
      type: 'signal_stable',
      moment_type: 'signal_stable_full',
      score: 10,
      desc: 'Signal stabilan čitave emisije',
    });
  }

  // Sortiraj po score, uzmi top 3
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 3);
}
