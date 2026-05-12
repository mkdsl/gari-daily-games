// neighbours.js — neighbour house entity helpers

import { SPL_FAIL_THRESHOLD, SPL_WARN_THRESHOLD } from '../config.js';

export function getNeighbourColor(kdb) {
  if (kdb >= SPL_FAIL_THRESHOLD) return '#e03030';
  if (kdb >= SPL_WARN_THRESHOLD) return '#f0a020';
  return '#30c030';
}

export function getWindowLightColor(kdb) {
  if (kdb >= SPL_FAIL_THRESHOLD) return '#ff4040';
  if (kdb >= SPL_WARN_THRESHOLD) return '#ffa000';
  return '#40ff40';
}
