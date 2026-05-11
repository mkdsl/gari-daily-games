// =============================================================================
// systems/vector-music.js — V2 Music research
// =============================================================================
import { MUSIC_RESEARCH } from '../config.js';
import { clamp } from '../util.js';

export function computeMusicResearch(slot, state) {
  const source = slot.source || 'digital';
  const moneyInvested = slot.money_invested ?? 0;
  const sourceInfo = MUSIC_RESEARCH.sources[source];
  if (!sourceInfo) return { tracksGained: 0, knowledgeBaselineGain: 0, moneyCost: 0, timeCost: 0 };

  const costPerTrack = sourceInfo.cost_per_track;
  const speed = sourceInfo.speed;
  const depth = sourceInfo.depth;

  // friend = 0 cost — speed-limited
  const tracksGained = costPerTrack === 0
    ? Math.floor(speed * 8)  // friend baseline = 8 tracks * speed
    : Math.floor((speed * moneyInvested) / Math.max(costPerTrack, 1));

  const knowledgeBaselineGain = MUSIC_RESEARCH.knowledge_baseline_factor * tracksGained * depth;
  const moneyCost = moneyInvested;
  const timeCost = 5 + Math.min(10, Math.floor(moneyInvested / 30));

  return { tracksGained, knowledgeBaselineGain, moneyCost, timeCost };
}

export function applyMusicResearch(state, slot) {
  const out = computeMusicResearch(slot, state);
  state.music_catalog.total_tracks += out.tracksGained;
  state.knowledge_baseline += out.knowledgeBaselineGain;
  state.money -= out.moneyCost;
  return out;
}

export function decayCatalogFreshness(state) {
  if (state.music_catalog.total_tracks === 0) return;
  state.music_catalog.avg_freshness = clamp(
    state.music_catalog.avg_freshness - MUSIC_RESEARCH.freshness_decay_per_week,
    0,
    1
  );
}

export function refreshCatalogOnNew(state, newTracks) {
  // weighted avg — new tracks reset freshness toward 1.0
  if (state.music_catalog.total_tracks === 0) return;
  const oldT = Math.max(0, state.music_catalog.total_tracks - newTracks);
  state.music_catalog.avg_freshness =
    (state.music_catalog.avg_freshness * oldT + 1.0 * newTracks) / state.music_catalog.total_tracks;
}
