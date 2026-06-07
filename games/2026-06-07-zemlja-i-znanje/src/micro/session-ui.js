/**
 * session-ui.js — DOM overlay na Canvas
 * HUD trake (energija, zadovoljstvo, sat), incident cards, info panel
 * Pravilo: session-ui.js NIKAD ne crta na Canvas. Sve ide kroz DOM overlay.
 */

import { bus, EVT } from '../events.js';
import { el, clearEl, formatPct, createEl } from '../utils.js';
import { getEnergyColor, getEnergyLabel } from './energy-system.js';
import { calcGroupSatisfaction, classifySatisfaction } from './satisfaction-calc.js';
import { mountTimeline, updateTimeline } from './timeline.js';
import { showDecisionCard, hideDecisionCard } from './decision-cards.js';
import { pauseSession, resumeSession } from './pause-manager.js';
import { formatGameClock } from './timing-engine.js';
import { ACTIVITY_TYPES, SPEED_MULTIPLIERS } from '../config.js';
import { nextAforizem } from '../content/aforizmi.js';

let _overlay = null;
let _microStateRef = null;
let _metaStateRef = null;
let _macroStateRef = null;
let _lastAforizem = '';
let _aforizem_timer = 0;
const AFORIZEM_INTERVAL = 120; // game minutes

/**
 * Mount session overlay
 */
export function mountSessionUI(overlay, microState, macroState, metaState) {
  _overlay = overlay;
  _microStateRef = microState;
  _macroStateRef = macroState;
  _metaStateRef = metaState;

  clearEl(_overlay);

  // Build DOM structure
  _overlay.innerHTML = `
    <!-- Timeline strip top -->
    <div id="session-timeline-strip" class="session-timeline-strip"></div>

    <!-- Energy bars right panel -->
    <div id="energy-bars-panel" class="energy-bars-panel"></div>

    <!-- HUD left panel -->
    <div id="hud-left" class="hud-left">
      <div class="hud-time" id="hud-time">08:00</div>
      <div class="hud-activity" id="hud-activity"></div>
      <div class="hud-sat" id="hud-sat">Zadovoljstvo: —</div>
      <div class="hud-slot-info" id="hud-slot-info"></div>
    </div>

    <!-- Speed controls top-right -->
    <div class="speed-controls" id="speed-controls">
      <button class="speed-btn active" data-speed="1">1×</button>
      <button class="speed-btn" data-speed="2">2×</button>
      <button class="btn-pause-session" id="btn-pause-session">⏸</button>
    </div>

    <!-- Aforizem bottom -->
    <div class="aforizem-strip" id="aforizem-strip"></div>

    <!-- Guided mode border (via CSS class) -->
  `;

  // Apply guided border
  if (microState.guidedActive) {
    _overlay.classList.add('guided-mode');
  }

  // Mount timeline
  const timelineEl = el('#session-timeline-strip', _overlay);
  if (timelineEl && microState.plan) {
    mountTimeline(timelineEl, microState.plan);
  }

  // Build energy bars
  rebuildEnergyBars(microState.participantStates);

  // Bind events
  bindSessionEvents();
  bindBusEvents();

  // Show first aforizem
  showAforizem(nextAforizem());
}

function rebuildEnergyBars(participantStates) {
  const panel = el('#energy-bars-panel', _overlay);
  if (!panel) return;

  clearEl(panel);
  (participantStates || []).filter(p => p.isPresent).forEach(p => {
    const bar = createEl('div', 'energy-bar-row');
    bar.id = `ebar-${p.id}`;
    bar.innerHTML = `
      <span class="ebar-portrait">${p.portrait}</span>
      <div class="ebar-bars">
        <div class="ebar-track ebar-energy-track" title="Energija">
          <div class="ebar-fill ebar-energy-fill" id="efill-${p.id}" style="width:${p.energy}%; background:${getEnergyColor(p.energy)}"></div>
        </div>
        <div class="ebar-track ebar-sat-track" title="Zadovoljstvo">
          <div class="ebar-fill ebar-sat-fill" id="sfill-${p.id}" style="width:${p.satisfaction}%; background:#4A6741"></div>
        </div>
      </div>
      <span class="ebar-mood" id="emood-${p.id}">${getMoodEmoji(p.mood)}</span>
    `;
    panel.appendChild(bar);
  });
}

/**
 * Update called each render frame
 */
export function updateSessionUI(microState, deltaMs) {
  if (!_overlay || !microState) return;

  // Update clock
  const timeEl = el('#hud-time', _overlay);
  if (timeEl) timeEl.textContent = formatGameClock(microState.gameMinute, 8);

  // Update current activity
  const actEl = el('#hud-activity', _overlay);
  if (actEl) {
    const slot = microState.plan[microState.currentSlot];
    const act = slot ? ACTIVITY_TYPES[slot.activity] : null;
    if (act) actEl.innerHTML = `${act.icon} ${act.name}`;
  }

  // Update satisfaction
  const satEl = el('#hud-sat', _overlay);
  if (satEl && microState.participantStates) {
    const groupSat = calcGroupSatisfaction(microState.participantStates);
    const cls = classifySatisfaction(groupSat);
    satEl.innerHTML = `<span style="color:${cls.color}">☺ ${formatPct(groupSat)}</span>`;
  }

  // Update slot info
  const slotInfoEl = el('#hud-slot-info', _overlay);
  if (slotInfoEl) {
    const slotNum = microState.currentSlot + 1;
    const pct = Math.round(microState.slotProgress * 100);
    slotInfoEl.textContent = `Blok ${slotNum}/8 (${pct}%)`;
  }

  // Update energy bars
  if (microState.participantStates) {
    microState.participantStates.forEach(p => {
      const efill = el(`#efill-${p.id}`, _overlay);
      const sfill = el(`#sfill-${p.id}`, _overlay);
      const emood = el(`#emood-${p.id}`, _overlay);
      if (efill) {
        efill.style.width = `${Math.round(p.energy)}%`;
        efill.style.background = getEnergyColor(p.energy);
      }
      if (sfill) sfill.style.width = `${Math.round(p.satisfaction)}%`;
      if (emood) emood.textContent = getMoodEmoji(p.mood);
    });
  }

  // Timeline
  updateTimeline(microState);

  // Aforizem rotation
  _aforizem_timer += deltaMs / 1000;
  if (_aforizem_timer > AFORIZEM_INTERVAL) {
    _aforizem_timer = 0;
    showAforizem(nextAforizem());
  }
}

function showAforizem(text) {
  const strip = el('#aforizem-strip', _overlay);
  if (!strip) return;
  strip.innerHTML = `"${text}"`;
  strip.classList.remove('fade-in');
  void strip.offsetWidth; // reflow
  strip.classList.add('fade-in');
}

function bindSessionEvents() {
  // Speed buttons
  const speedControls = el('#speed-controls', _overlay);
  if (speedControls) {
    speedControls.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseInt(btn.dataset.speed);
        speedControls.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bus.emit(EVT.SESSION_SPEED_CHANGE, { speed });
      });
    });
  }

  // Pause button
  const btnPause = el('#btn-pause-session', _overlay);
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (_microStateRef?.isPaused) {
        resumeSession();
        btnPause.textContent = '⏸';
      } else {
        pauseSession('user');
        btnPause.textContent = '▶';
      }
    });
  }
}

function bindBusEvents() {
  bus.on(EVT.INCIDENT_TRIGGER, ({ incident }) => {
    if (!_microStateRef) return;
    showDecisionCard(
      incident,
      _microStateRef,
      _macroStateRef?.hiredStaff || [],
      _metaStateRef?.reputation || 0,
      _microStateRef.guidedActive
    );
  });

  bus.on(EVT.SESSION_RESUME, () => {
    const btnPause = el('#btn-pause-session', _overlay);
    if (btnPause) btnPause.textContent = '⏸';
  });

  bus.on(EVT.SESSION_PAUSE, () => {
    const btnPause = el('#btn-pause-session', _overlay);
    if (btnPause) btnPause.textContent = '▶';
  });
}

function getMoodEmoji(mood) {
  const m = { happy: '😊', neutral: '😐', tired: '😓', unhappy: '😞' };
  return m[mood] || '😐';
}

export function unmountSessionUI() {
  clearEl(_overlay);
  _microStateRef = null;
  _overlay = null;
}
