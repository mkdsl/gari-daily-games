/** @module systems/micro_engine — micro event real-time loop */

import { CONFIG } from '../config.js';
import { CITIES } from '../content/cities_data.js';
import { computeUpgradeEffects } from './upgrade_manager.js';
import { getBPMRange, applyNisAutoArc, updateBPMLock } from './bpm_controller.js';
import { syncZones, updateZoneOverflow, calculateFloorTemp, checkOverflowIncident } from './zone_manager.js';
import { updateMigrations } from './routing_manager.js';
import { calculateSatisfactionDelta, updateSatisfaction, updateEnergyDebt, getMaxEnergyDebt, checkPeakPhase } from './satisfaction_tracker.js';
import { checkEquipmentFailure, queueIncident, getActiveIncident, updateIncidentTimers, shouldTriggerColdFloor } from './incident_manager.js';
import { spawnWave, spawnCarryOverGroup, scatterGroupPositions } from './crowd_spawner.js';
import { AudioAPI } from '../audio.js';
import { recordFrame, checkAndDowngrade } from './performance_monitor.js';

let _downgradeTimer = 0;
let _coldFloorCooldown = 0;
let _equipFailCooldown = 0;

/**
 * Initialize micro state for a new event
 * @param {import('../state.js').MicroState} micro
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {string} cityId
 * @param {object} zones
 * @param {number} venueCapacity
 * @param {number} carryOverBuzz
 */
export function initMicroEvent(micro, macro, meta, cityId, zones, venueCapacity, carryOverBuzz) {
  const city = CITIES[cityId];
  micro.crowd_groups = [];
  micro.zones = zones;
  micro.current_bpm = 104;   // start cool
  micro.floor_temperature = 0;
  micro.satisfaction_points = 0;
  micro.energy_debt = 0;
  micro.incident_queue = [];
  micro.event_time_elapsed = 0;
  micro.event_duration = city.duration;
  micro.wave_timer = 0;
  micro.peak_phase_triggered = false;
  micro.bpm_locked = false;
  micro.bpm_lock_value = null;
  micro.bpm_lock_timer = 0;
  micro._nisArcTimer = 0;
  micro._djAnnounceTimer = 0;
  micro._djAnnouncePending = null;
  micro._technicianTimer = 0;
  micro._eventPause = 0;
  micro._waveIndex = 0;
  micro._cityId = cityId;
  micro._venueCapacity = venueCapacity;

  // Inject carry-over guests
  if (carryOverBuzz > 0 && micro.guest_from_prev_city) {
    const coGroup = spawnCarryOverGroup(micro.guest_from_prev_city, zones, 0);
    micro.crowd_groups.push(coGroup);
    AudioAPI.onCarryOverGuests(carryOverBuzz);
  }

  AudioAPI.onEventStart(cityId);
  _coldFloorCooldown = 60;  // no cold floor incident in first minute
  _equipFailCooldown = 90;  // no equipment fail in first 1.5min
}

/**
 * Main micro update tick — call every animation frame
 * @param {import('../state.js').MicroState} micro
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {number} dt
 * @param {number} now performance.now()
 * @returns {{ eventEnded:boolean, finalSatisfaction?:number }}
 */
export function updateMicro(micro, macro, meta, dt, now) {
  recordFrame(now);

  // Pause during incident modal or event pause
  const activeIncident = getActiveIncident(micro);
  if (activeIncident) {
    // Timer paused — only update incident timers
    updateIncidentTimers(micro, micro.crowd_groups, micro.zones, dt);
    return { eventEnded: false };
  }

  if (micro._eventPause > 0) {
    updateIncidentTimers(micro, micro.crowd_groups, micro.zones, dt);
    return { eventEnded: false };
  }

  const upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);
  const cityId = micro._cityId;

  // Advance time
  micro.event_time_elapsed += dt;

  // BPM lock
  updateBPMLock(micro, dt);

  // Niš auto-arc tutorial
  applyNisAutoArc(micro, dt, cityId);

  // BPM range
  const bpmRange = getBPMRange(micro.current_bpm, upgradeEffects);

  // Update crowd group moods from BPM
  for (const group of micro.crowd_groups) {
    group.updateMoodFromBPM(bpmRange, dt);
    group.decayEnergy(dt, micro.floor_temperature);
  }

  // Update migrations
  updateMigrations(micro.crowd_groups, CONFIG.MIGRATION_SPEED, dt, upgradeEffects);

  // Sync zones from groups
  syncZones(micro.zones, micro.crowd_groups);

  // Floor temperature
  micro.floor_temperature = calculateFloorTemp(micro.current_bpm, micro.zones);

  // Zone overflow
  const overflowFactor = 1.1 + (upgradeEffects.overflow_threshold_bonus || 0);
  updateZoneOverflow(micro.zones, dt, overflowFactor);

  // Crowd wave spawn
  const city = CITIES[cityId];
  const waveInterval = CONFIG.WAVE_INTERVAL_BY_CITY[cityId] || 30;
  micro.wave_timer += dt;
  if (micro.wave_timer >= waveInterval && micro._waveIndex < city.waves) {
    const peakBonus = micro.peak_phase_triggered ? 0.2 : 0;
    const newGroups = spawnWave(micro, cityId, micro._venueCapacity, micro._waveIndex, micro.zones, peakBonus);
    scatterGroupPositions(newGroups, micro.zones);
    micro.crowd_groups.push(...newGroups);
    micro._waveIndex++;
    micro.wave_timer = 0;
  }

  // Satisfaction
  const activeIncidents = micro.incident_queue.filter(i => !i.resolved).length;
  const delta = calculateSatisfactionDelta(micro.crowd_groups, micro.zones, activeIncidents);
  updateSatisfaction(micro, delta, dt);

  // Energy debt
  const maxDebt = getMaxEnergyDebt(macro, meta);
  updateEnergyDebt(micro, dt, micro.floor_temperature, maxDebt);

  // Peak phase check
  checkPeakPhase(micro);

  // Incident checks
  _coldFloorCooldown = Math.max(0, _coldFloorCooldown - dt);
  _equipFailCooldown = Math.max(0, _equipFailCooldown - dt);

  const overflowCheck = checkOverflowIncident(micro.zones, meta.veteran_insights);
  if (overflowCheck) {
    queueIncident(micro, 'CROWD_OVERFLOW', overflowCheck.severity, { zoneId: overflowCheck.zoneId });
  }

  if (_coldFloorCooldown <= 0 && shouldTriggerColdFloor(micro, micro.crowd_groups)) {
    queueIncident(micro, 'FLOOR_TOO_COLD', 'MEDIUM');
    _coldFloorCooldown = 120;
  }

  if (_equipFailCooldown <= 0 && checkEquipmentFailure(cityId, dt, false)) {
    queueIncident(micro, 'EQUIPMENT_FAILURE', 'HIGH', { cityId });
    _equipFailCooldown = 300;
  }

  // Performance downgrade check (once per second)
  _downgradeTimer += dt;
  if (_downgradeTimer >= 1) {
    _downgradeTimer = 0;
    checkAndDowngrade();
  }

  // Event end
  if (micro.event_time_elapsed >= micro.event_duration) {
    return { eventEnded: true };
  }

  return { eventEnded: false };
}
