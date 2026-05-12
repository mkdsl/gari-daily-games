// acoustics.js — akustičke formule

import { TERRAIN_MOD } from '../config.js';

export function compute_angle_atten(speaker_angle, direction_to_neighbour) {
  const diff = Math.abs(speaker_angle - direction_to_neighbour);
  if (diff > 60) return -12;
  if (diff > 30) return -5;
  return 0;
}

export function compute_Kdb(spl, angle, neighbour, wind_delta, bass_ratio, bass_asphalt_effect) {
  const path_mod = neighbour.terrain_path.reduce((sum, t) => sum + (TERRAIN_MOD[t] || 0), 0);
  const angle_atten = compute_angle_atten(angle, neighbour.direction_from_stage);
  let kdb = spl - 20 * Math.log10(neighbour.distance) + path_mod + angle_atten + wind_delta;
  // Nivo 4: bass asphalt effect
  if (bass_asphalt_effect && bass_ratio !== undefined && bass_ratio > 0.5) {
    kdb += (bass_ratio - 0.5) * 8;
  }
  return kdb;
}

export function compute_Hs(spl, angle, bass_ratio, level) {
  const raw_coverage = Math.max(0, (60 - Math.abs(angle)) / 60);
  const bass_mod = (bass_ratio < 0.30 ? -0.2 : 0) + (bass_ratio > 0.85 ? -0.15 : 0);
  return Math.max(0, Math.min(1,
    (spl - level.min_spl) / level.spl_range * raw_coverage + bass_mod + level.dance_boost
  ));
}
