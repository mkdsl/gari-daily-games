/**
 * hydraulics.js - Akva-Sklop
 * Simulation loop: flow -> biofilter -> species -> score -> events
 */

import {
  EVAPORATION_RATE,
  PH_MIN,
  PH_MAX,
  PH_RAIN_EFFECT,
  PH_BIOFILTER_CAP,
  FLOW_PATH_LOSS,
  TILE_CONFIG,
  TILE_TYPES,
  FISH_DEATH_CONSECUTIVE,
} from './config.js';

import { calcFishHealth, calcDuckHealth, calcDuckWaste } from './species.js';
import { getDrainageFlow, getBiofilters, getWetlandBonus } from './grid.js';
import { applyEvent, getActiveEvent } from './events.js';

// ---------------------------------------------------------------------------
// Flow calculation
// ---------------------------------------------------------------------------

function calcFlow(state, grid) {
  const lakes = state.lakes;
  const lakeOrder = ['A', 'B', 'C']; // high to low elevation

  // Total drainage bonus across the whole system
  const drainageTotalA = getDrainageFlow(grid, 'A');
  const drainageTotalB = getDrainageFlow(grid, 'B');
  const drainageTotalC = getDrainageFlow(grid, 'C');

  // Source delivers to lake A first (highest elevation)
  const sourceRate = state.source.rate || 0;

  // Each lake receives inflow proportional to drainage tiles connected to it
  // Lake A: fed by source directly + any drainage toward it
  // Lake B: receives overflow/drainage from A
  // Lake C: receives overflow/drainage from B

  // We model cascade: A gets source, B gets overflow from A, C gets overflow from B
  // Inflow = sourceRate * (1 - FLOW_PATH_LOSS) per step, spread via drainage

  // Lake A inflow from source
  const inflowA = Math.min(sourceRate, sourceRate + drainageTotalA);

  // Transfer from A to B (gravity, limited by drainage tiles)
  const transferAtoB = drainageTotalB * (1 - FLOW_PATH_LOSS);

  // Transfer from B to C
  const transferBtoC = drainageTotalC * (1 - FLOW_PATH_LOSS);

  // Update levels
  function updateLake(lakeId, inflow) {
    const lake = lakes[lakeId];
    if (lake.capacity <= 0) return;
    const evap = EVAPORATION_RATE;
    const newLevel = lake.level + inflow - evap;
    lake.level = Math.min(lake.capacity, Math.max(0, newLevel));
  }

  updateLake('A', inflowA);
  updateLake('B', transferAtoB);
  updateLake('C', transferBtoC);

  return state;
}

// ---------------------------------------------------------------------------
// Biofilter + pH step
// ---------------------------------------------------------------------------

function calcBiofilters(state, grid) {
  const lakes = state.lakes;
  const lakeIds = ['A', 'B', 'C'];

  for (const id of lakeIds) {
    const lake = lakes[id];
    const bioCount = getBiofilters(grid, id);
    const wetBonus = getWetlandBonus(grid, id);

    // pH from rain (always negative)
    lake.pH += PH_RAIN_EFFECT;

    // pH from biofilters (positive, capped)
    if (bioCount > 0) {
      const bioGain = TILE_CONFIG[TILE_TYPES.BIOFILTER].pHBonus * bioCount;
      lake.pH = Math.min(PH_BIOFILTER_CAP, lake.pH + bioGain);
    }

    // pH from duck waste
    lake.pH += calcDuckWaste(lake.ducks || 0);

    // Clamp
    lake.pH = Math.min(PH_MAX, Math.max(PH_MIN, lake.pH));
  }

  return state;
}

// ---------------------------------------------------------------------------
// Species health
// ---------------------------------------------------------------------------

function calcSpeciesHealth(state, grid) {
  const lakes = state.lakes;
  const lakeIds = ['A', 'B', 'C'];

  for (const id of lakeIds) {
    const lake = lakes[id];
    lake.fishHealth = calcFishHealth(lake.fishHealth, lake.pH);
    lake.duckHealth = calcDuckHealth(lake.duckHealth, lake.level);
  }

  // Game over check: fishHealth <= 0 in any lake that has fish
  let consecutiveDead = state._fishDeadWeeks || 0;
  const anyFishDead = lakeIds.some(id =>
    lakes[id].fish > 0 && lakes[id].fishHealth <= 0
  );

  if (anyFishDead) {
    consecutiveDead++;
  } else {
    consecutiveDead = 0;
  }
  state._fishDeadWeeks = consecutiveDead;

  if (consecutiveDead >= FISH_DEATH_CONSECUTIVE) {
    state.phase = 'gameover';
    state._gameoverReason = 'Ribe su uginule — pH van opsega predugo.';
  }

  return state;
}

// ---------------------------------------------------------------------------
// Public simulation entry
// ---------------------------------------------------------------------------

/**
 * Run one full simulation week.
 * Mutates and returns updated state.
 * @param {object} state
 * @param {Array}  grid
 * @returns {object}
 */
export function runSimulationWeek(state, grid) {
  // Apply any event for this week before flow calc
  const event = getActiveEvent(state.events, state.week);
  if (event) {
    applyEvent(state, event);
    state.activeEvent = { type: event.type, weeksLeft: 1 };
  }

  // 1. Flow
  calcFlow(state, grid);

  // 2. Biofilter + pH
  calcBiofilters(state, grid);

  // 3. Species health
  calcSpeciesHealth(state, grid);

  return state;
}
