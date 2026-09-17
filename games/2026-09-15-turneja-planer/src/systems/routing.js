/** @module systems/routing — travel cost calc, permutation sorter (top 3 routes) */

import { TRAVEL_COSTS } from '../config.js';
import { getRoutableCities, getFinalCity } from '../entities/city.js';

/**
 * Generate all permutations of an array
 * @template T
 * @param {T[]} arr
 * @returns {T[][]}
 */
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

/**
 * Calculate travel cost for a route (array of city ids, start=beograd always)
 * @param {string[]} route - city IDs in order (does NOT include beograd start)
 * @returns {number} total EUR
 */
export function calcRouteCost(route) {
  const full = ['beograd', ...route];
  let total = 0;
  for (let i = 0; i < full.length - 1; i++) {
    const from = full[i];
    const to = full[i + 1];
    total += (TRAVEL_COSTS[from]?.[to] ?? 0);
  }
  return total;
}

/**
 * Generate top 3 cheapest routes for the given city selection
 * Route: beograd → [routable cities in some order] → guncati
 * @param {string[]} selectedCityIds - IDs excluding beograd and guncati
 * @returns {Array<{route: string[], cost: number, label: string}>}
 */
export function getTopRoutes(selectedCityIds) {
  const finalCity = getFinalCity();
  const perms = permutations(selectedCityIds);
  const routes = perms.map(perm => {
    const route = [...perm, finalCity.id];
    const cost = calcRouteCost(route);
    const label = ['Beograd', ...perm.map(id => getCityName(id)), 'Guncati'].join(' → ');
    return { route, cost, label };
  });
  routes.sort((a, b) => a.cost - b.cost);
  return routes.slice(0, 3);
}

/**
 * Get city name by ID
 * @param {string} id
 * @returns {string}
 */
function getCityName(id) {
  const names = {
    beograd: 'Beograd',
    novi_sad: 'Novi Sad',
    nis: 'Niš',
    sarajevo: 'Sarajevo',
    guncati: 'Guncati',
  };
  return names[id] || id;
}

/**
 * All 3 routable city IDs (Novi Sad, Niš, Sarajevo)
 * @returns {string[]}
 */
export function getAllRoutableCityIds() {
  return getRoutableCities().map(c => c.id);
}

/**
 * Get travel cost between two cities
 * @param {string} from
 * @param {string} to
 * @returns {number}
 */
export function getTravelCost(from, to) {
  return TRAVEL_COSTS[from]?.[to] ?? 0;
}
