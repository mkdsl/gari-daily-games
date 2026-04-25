/**
 * systems/generator.js — Proceduralni generator zona za Graviton.
 *
 * Odgovornosti:
 *   - initGenerator(state): generiše pool od 100 zona i puni state.zone_pool
 *   - spawnZones(state):    puni state.active_zones iz pool-a dok ih ima < ZONE_LOOKAHEAD + 1
 *   - buildZone(template_id, startX, speedLevel): kreira Zone objekat sa prepreakama
 *
 * Šabloni (template_id):
 *   -3 = TUTORIAL_1 (prazan — samo za učenje flipa)
 *   -2 = TUTORIAL_2 (jedan blok na podu X=400)
 *   -1 = TUTORIAL_3 (šiljci naizmenično)
 *    0 = T0 CORRIDOR_LOW
 *    1 = T1 CORRIDOR_HIGH
 *    2 = T2 SPIKE_FLOOR
 *    3 = T3 SPIKE_CEIL
 *    4 = T4 SPIKE_BOTH
 *    5 = T5 BUZZSAW_STATIC
 *    6 = T6 BUZZSAW_OSCILLATE
 *    7 = T7 DOUBLE_BLOCK
 *    8 = T8 GAUNTLET
 *    9 = T9 CALM_OPEN
 *
 * Constraint pravila (iz GDD 4.1):
 *   - Nikad isti template_id dva puta uzastopno
 *   - T5/T6 (buzzsaw) ne sme biti u prvih 3 pozicije pool-a (zone 4–6)
 *   - Posle T0/T1 (NARROW_PASS) ne sme slediti T8 (GAUNTLET)
 *   - T9 (CALM_OPEN) se insertuje automatski svakih 7–10 zona
 *
 * Koordinate prepreka su apsolutne — startX + lokalni offset.
 * Obstacle.x se inicijalno postavi na startX + lokalni_x; pomera se scroll-om.
 */

import { CONFIG } from '../config.js';

/**
 * Inicijalizuje generator: generiše 100 zona i smešta ih u state.zone_pool.
 * Prve 3 zone su tutorial (TUTORIAL_1, TUTORIAL_2, TUTORIAL_3).
 * Zone 4–100 su gameplay šabloni sa constraint-ima.
 * @param {Object} state
 */
export function initGenerator(state) {
  state.zone_pool = [];
  let currentX = 0;

  // Tutorijalske zone
  const tutorialTemplates = [-3, -2, -1];
  for (const tid of tutorialTemplates) {
    state.zone_pool.push(buildZone(tid, currentX, 0));
    currentX += CONFIG.ZONE_WIDTH;
  }

  // Gameplay zone (497 kom — pokriva ~18 min pri max speed, dovoljno za platinum)
  const sequence = _buildGameplaySequence(497);
  for (let i = 0; i < sequence.length; i++) {
    const tid = sequence[i];
    // Approximate speed level na osnovu rednog broja zone (zone 3+ = gameplay)
    const approxZone = 3 + i;
    const approxLevel = Math.min(10, Math.floor(approxZone * CONFIG.ZONE_WIDTH / CONFIG.SCROLL_BASE / CONFIG.SPEED_LEVEL_INTERVAL));
    state.zone_pool.push(buildZone(tid, currentX, approxLevel));
    currentX += CONFIG.ZONE_WIDTH;
  }

  state.next_zone_pool_idx = 0;
  state.active_zones = [];
  state.zone_index = 0;
  spawnZones(state);
}

/**
 * Generiše sekvencu gameplay šablona za n zona sa constraint pravilima.
 * @param {number} count
 * @returns {number[]} niz template_id-ova (0–9)
 */
function _buildGameplaySequence(count) {
  const sequence = [];
  let lastId = -99;
  let calmCountdown = _randInt(CONFIG.ZONE_CALM_MIN_INTERVAL, CONFIG.ZONE_CALM_MAX_INTERVAL);
  let noBuzzsawRemaining = 3; // Zabranjujemo buzzsaw u prvih 3 gameplay zona (zone 4-6)

  for (let i = 0; i < count; i++) {
    calmCountdown--;

    if (calmCountdown <= 0) {
      sequence.push(9); // T9 CALM_OPEN
      lastId = 9;
      calmCountdown = _randInt(CONFIG.ZONE_CALM_MIN_INTERVAL, CONFIG.ZONE_CALM_MAX_INTERVAL);
      continue;
    }

    const noBuzzsaw = noBuzzsawRemaining > 0;
    const tid = _pickTemplate(lastId, noBuzzsaw);
    sequence.push(tid);
    lastId = tid;
    if (noBuzzsawRemaining > 0) noBuzzsawRemaining--;
  }

  return sequence;
}

/**
 * Bira sledeći template_id uz constraint pravila.
 * T9 (CALM_OPEN) se ne bira ovde — injektuje se posebno u _buildGameplaySequence.
 *
 * @param {number} lastId - Prethodni template_id
 * @param {boolean} noBuzzsaw - Zabrana buzzsaw (T5/T6)
 * @returns {number}
 */
function _pickTemplate(lastId, noBuzzsaw) {
  let candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // bez T9 (special inject)

  // Nikad isti dva puta zaredom
  candidates = candidates.filter(t => t !== lastId);

  // Zabrana buzzsaw u ranim zonama
  if (noBuzzsaw) {
    candidates = candidates.filter(t => t !== 5 && t !== 6);
  }

  // Posle NARROW_PASS (T0, T1) ne sledi GAUNTLET (T8)
  if (lastId === 0 || lastId === 1) {
    candidates = candidates.filter(t => t !== 8);
  }

  // Ako su svi kandidati eliminisani (edge case), fallback na T9
  if (candidates.length === 0) return 9;

  return candidates[_randInt(0, candidates.length - 1)];
}

/**
 * Puni state.active_zones iz pool-a dok ih ima < ZONE_LOOKAHEAD + 1.
 * Poziva se svaki frame iz main.js game loop-a.
 *
 * Kada zona postaje aktivna, njen X se kalkuliše relativno na poslednju aktivnu zonu
 * (jer pool zone imaju "stale" apsolutne X vrednosti iz momenta generacije).
 *
 * @param {Object} state
 */
export function spawnZones(state) {
  const maxActive = CONFIG.ZONE_LOOKAHEAD + 1; // = 3

  while (
    state.active_zones.length < maxActive &&
    state.next_zone_pool_idx < state.zone_pool.length
  ) {
    const poolZone = state.zone_pool[state.next_zone_pool_idx];

    // X zone se rekalibrira na tekuću poziciju — pool X je "stale" od generacije
    let newZoneX;
    if (state.active_zones.length === 0) {
      // Prva zona: počinje tamo gde je originalno planirana (leva ivica ekrana)
      newZoneX = poolZone.x;
    } else {
      const lastZone = state.active_zones[state.active_zones.length - 1];
      newZoneX = lastZone.x + CONFIG.ZONE_WIDTH;
    }

    // Pomeri obstacle-e za razliku između originalnog i novog X zone
    const deltaX = newZoneX - poolZone.x;
    if (deltaX !== 0) {
      for (const obs of poolZone.obstacles) {
        obs.x += deltaX;
        if (obs.osc_y_center !== undefined) {
          // osc_y_center ne menja se (vertikalna osa)
        }
      }
      poolZone.x = newZoneX;
    }

    state.active_zones.push(poolZone);
    state.next_zone_pool_idx++;
  }
}

/**
 * Gradi Zone objekat za dati template_id.
 * Obstacle koordinate su apsolutne (startX + lokalni offset).
 * @param {number} templateId
 * @param {number} startX - Apsolutna X leve ivice zone
 * @param {number} speedLevel - Za difficulty scaling (gap_width, spike_count)
 * @returns {import('../state.js').Zone}
 */
export function buildZone(templateId, startX, speedLevel) {
  switch (templateId) {
    case -3: return _buildTutorial1(startX);
    case -2: return _buildTutorial2(startX);
    case -1: return _buildTutorial3(startX);
    case 0:  return _buildT0(startX, speedLevel);
    case 1:  return _buildT1(startX, speedLevel);
    case 2:  return _buildT2(startX, speedLevel);
    case 3:  return _buildT3(startX, speedLevel);
    case 4:  return _buildT4(startX, speedLevel);
    case 5:  return _buildT5(startX, speedLevel);
    case 6:  return _buildT6(startX, speedLevel);
    case 7:  return _buildT7(startX, speedLevel);
    case 8:  return _buildT8(startX, speedLevel);
    case 9:  return _buildT9(startX);
    default: return _buildT9(startX);
  }
}

// ─── Difficulty helpers ───────────────────────────────────────────────────────

/**
 * Izračunava scaled gap_width za tekući speed level.
 * @param {number} speedLevel
 * @returns {number} px
 */
function _scaledGap(speedLevel) {
  return Math.max(
    CONFIG.GAP_WIDTH_MIN,
    CONFIG.GAP_WIDTH_BASE - speedLevel * CONFIG.GAP_WIDTH_REDUCTION_PER_LEVEL
  );
}

/**
 * Izračunava max spike count za tekući speed level.
 * @param {number} speedLevel
 * @returns {number} 2–5
 */
function _maxSpikes(speedLevel) {
  return Math.min(5, 2 + Math.floor(speedLevel / 2));
}

// ─── Tutorial builders ────────────────────────────────────────────────────────

/**
 * TUTORIAL_1: Prazan prolaz, gap 200px centriran. Igrač uči flip.
 * @param {number} startX
 * @returns {import('../state.js').Zone}
 */
function _buildTutorial1(startX) {
  return { template_id: -3, x: startX, obstacles: [], gap_width: 200 };
}

/**
 * TUTORIAL_2: Jedan blok 80×60 na podu centriran u zoni.
 * @param {number} startX
 * @returns {import('../state.js').Zone}
 */
function _buildTutorial2(startX) {
  return {
    template_id: -2,
    x: startX,
    obstacles: [
      {
        type: 'block',
        x: startX + 360,
        y: CONFIG.FLOOR_Y - 60,
        w: 80,
        h: 60,
      }
    ],
    gap_width: 180,
  };
}

/**
 * TUTORIAL_3: 3 šiljka na podu i 3 na plafonu, naizmenično, razmak 120px.
 * @param {number} startX
 * @returns {import('../state.js').Zone}
 */
function _buildTutorial3(startX) {
  const obstacles = [];
  for (let i = 0; i < 3; i++) {
    const baseX = startX + 120 + i * 180;
    // Pod (floor spike)
    obstacles.push({
      type: 'spike',
      x: baseX - CONFIG.SPIKE_HITBOX_W / 2,
      y: CONFIG.FLOOR_Y - CONFIG.SPIKE_HEIGHT,
      w: CONFIG.SPIKE_HITBOX_W,
      h: CONFIG.SPIKE_HITBOX_H,
      fromCeil: false,
    });
    // Plafon (ceil spike), pomeren za 60px
    obstacles.push({
      type: 'spike',
      x: baseX + 60 - CONFIG.SPIKE_HITBOX_W / 2,
      y: CONFIG.CEIL_Y,
      w: CONFIG.SPIKE_HITBOX_W,
      h: CONFIG.SPIKE_HITBOX_H,
      fromCeil: true,
    });
  }
  return { template_id: -1, x: startX, obstacles, gap_width: 160 };
}

// ─── Gameplay builders ────────────────────────────────────────────────────────

/**
 * T0 CORRIDOR_LOW: Blok od poda, slobodan prolaz iznad.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT0(startX, speedLevel) {
  const gap = Math.max(80, Math.min(130, _scaledGap(speedLevel)));
  const blockX = startX + 200 + _randInt(0, 400);
  const channelH = CONFIG.FLOOR_Y - CONFIG.CEIL_Y;
  const blockH = Math.floor(channelH * _randFloat(0.3, 0.45));
  return {
    template_id: 0,
    x: startX,
    obstacles: [{ type: 'block', x: blockX, y: CONFIG.FLOOR_Y - blockH, w: 80, h: blockH }],
    gap_width: gap,
  };
}

/**
 * T1 CORRIDOR_HIGH: Blok od plafona, slobodan prolaz ispod.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT1(startX, speedLevel) {
  const gap = Math.max(80, Math.min(130, _scaledGap(speedLevel)));
  const blockX = startX + 200 + _randInt(0, 400);
  const channelH = CONFIG.FLOOR_Y - CONFIG.CEIL_Y;
  const blockH = Math.floor(channelH * _randFloat(0.3, 0.45));
  return {
    template_id: 1,
    x: startX,
    obstacles: [{ type: 'block', x: blockX, y: CONFIG.CEIL_Y, w: 80, h: blockH }],
    gap_width: gap,
  };
}

/**
 * T2 SPIKE_FLOOR: 2–5 šiljaka na podu.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT2(startX, speedLevel) {
  const count = _randInt(2, _maxSpikes(speedLevel));
  const spacing = _randInt(60, 100);
  const startLocalX = _randInt(100, 200);
  const obstacles = [];
  for (let i = 0; i < count; i++) {
    const x = startX + startLocalX + i * spacing - CONFIG.SPIKE_HITBOX_W / 2;
    obstacles.push({
      type: 'spike',
      x,
      y: CONFIG.FLOOR_Y - CONFIG.SPIKE_HEIGHT,
      w: CONFIG.SPIKE_HITBOX_W,
      h: CONFIG.SPIKE_HITBOX_H,
      fromCeil: false,
    });
  }
  return { template_id: 2, x: startX, obstacles, gap_width: _scaledGap(speedLevel) };
}

/**
 * T3 SPIKE_CEIL: 2–5 šiljaka na plafonu.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT3(startX, speedLevel) {
  const count = _randInt(2, _maxSpikes(speedLevel));
  const spacing = _randInt(60, 100);
  const startLocalX = _randInt(100, 200);
  const obstacles = [];
  for (let i = 0; i < count; i++) {
    const x = startX + startLocalX + i * spacing - CONFIG.SPIKE_HITBOX_W / 2;
    obstacles.push({
      type: 'spike',
      x,
      y: CONFIG.CEIL_Y,
      w: CONFIG.SPIKE_HITBOX_W,
      h: CONFIG.SPIKE_HITBOX_H,
      fromCeil: true,
    });
  }
  return { template_id: 3, x: startX, obstacles, gap_width: _scaledGap(speedLevel) };
}

/**
 * T4 SPIKE_BOTH: 2 para šiljaka, gore-dole alterniraju.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT4(startX, speedLevel) {
  const obstacles = [];
  const positions = [startX + 150, startX + 320, startX + 490, startX + 650];
  positions.forEach((px, i) => {
    const fromCeil = i % 2 === 0;
    const y = fromCeil ? CONFIG.CEIL_Y : CONFIG.FLOOR_Y - CONFIG.SPIKE_HEIGHT;
    obstacles.push({
      type: 'spike',
      x: px - CONFIG.SPIKE_HITBOX_W / 2,
      y,
      w: CONFIG.SPIKE_HITBOX_W,
      h: CONFIG.SPIKE_HITBOX_H,
      fromCeil,
    });
  });
  return { template_id: 4, x: startX, obstacles, gap_width: _scaledGap(speedLevel) };
}

/**
 * T5 BUZZSAW_STATIC: 1 buzzsaw na fiksnoj poziciji u sredini kanala.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT5(startX, speedLevel) {
  const channelMid = (CONFIG.FLOOR_Y + CONFIG.CEIL_Y) / 2;
  const obsX = startX + 350 + _randInt(0, 100);
  const obsY = channelMid + _randInt(-30, 30);
  return {
    template_id: 5,
    x: startX,
    obstacles: [{
      type: 'buzzsaw',
      x: obsX,
      y: obsY,
      w: 32,
      h: 32,
      oscillates: false,
      osc_phase: 0,
      osc_y_center: obsY,
      rotation: 0,
    }],
    gap_width: _scaledGap(speedLevel),
  };
}

/**
 * T6 BUZZSAW_OSCILLATE: 1 buzzsaw koji osciluje vertikalno ±40px.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT6(startX, speedLevel) {
  const channelMid = (CONFIG.FLOOR_Y + CONFIG.CEIL_Y) / 2;
  const obsX = startX + 300 + _randInt(0, 200);
  const obsY = channelMid;
  const phase = Math.random() * 2 * Math.PI;
  return {
    template_id: 6,
    x: startX,
    obstacles: [{
      type: 'buzzsaw',
      x: obsX,
      y: obsY,
      w: 32,
      h: 32,
      oscillates: true,
      osc_phase: phase,
      osc_y_center: obsY,
      rotation: 0,
    }],
    gap_width: _scaledGap(speedLevel),
  };
}

/**
 * T7 DOUBLE_BLOCK: Blok od poda X=200, blok od plafona X=500.
 * Igrač mora dva puta promeniti pol.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT7(startX, speedLevel) {
  const gap = Math.max(90, Math.min(150, _scaledGap(speedLevel)));
  const blockH = 80;
  return {
    template_id: 7,
    x: startX,
    obstacles: [
      { type: 'block', x: startX + 200, y: CONFIG.FLOOR_Y - blockH, w: 60, h: blockH },
      { type: 'block', x: startX + 500, y: CONFIG.CEIL_Y, w: 60, h: blockH },
    ],
    gap_width: gap,
  };
}

/**
 * T8 GAUNTLET: Blok od poda X=150 + šiljci na plafonu X=350–550.
 * Najteži čist šablon.
 * @param {number} startX @param {number} speedLevel
 * @returns {import('../state.js').Zone}
 */
function _buildT8(startX, speedLevel) {
  const gap = Math.max(90, Math.min(120, _scaledGap(speedLevel)));
  const blockH = 100;
  const obstacles = [
    { type: 'block', x: startX + 150, y: CONFIG.FLOOR_Y - blockH, w: 80, h: blockH },
  ];
  const spikeCount = _randInt(2, Math.min(4, _maxSpikes(speedLevel)));
  for (let i = 0; i < spikeCount; i++) {
    const sx = startX + 350 + i * 70 - CONFIG.SPIKE_HITBOX_W / 2;
    obstacles.push({
      type: 'spike',
      x: sx,
      y: CONFIG.CEIL_Y,
      w: CONFIG.SPIKE_HITBOX_W,
      h: CONFIG.SPIKE_HITBOX_H,
      fromCeil: true,
    });
  }
  return { template_id: 8, x: startX, obstacles, gap_width: gap };
}

/**
 * T9 CALM_OPEN: Prazan prolaz 250px — breathing room.
 * @param {number} startX
 * @returns {import('../state.js').Zone}
 */
function _buildT9(startX) {
  return { template_id: 9, x: startX, obstacles: [], gap_width: 250 };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Vraća random integer u opsegu [min, max] (inclusive).
 * @param {number} min @param {number} max
 * @returns {number}
 */
function _randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Vraća random float u opsegu [min, max].
 * @param {number} min @param {number} max
 * @returns {number}
 */
function _randFloat(min, max) {
  return Math.random() * (max - min) + min;
}
