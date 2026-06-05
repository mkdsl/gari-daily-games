/** @module audio — Web Audio API implementation (Ceca Čujka) */

/** @type {AudioContext|null} */
let _ctx = null;
/** @type {Map<string, OscillatorNode>} */
const _activeOscillators = new Map();
let _ambientGain = null;
let _ambientNode = null;
let _currentCityId = null;
let _overflowCooldowns = {};
const MAX_OSCILLATORS = 8;

/**
 * Lazy-init AudioContext on user interaction
 * @returns {AudioContext}
 */
function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

/**
 * Create a gain node
 * @param {number} gain
 * @returns {GainNode}
 */
function makeGain(gain) {
  const g = getCtx().createGain();
  g.gain.value = gain;
  g.connect(getCtx().destination);
  return g;
}

/**
 * Play a simple tone
 * @param {number} freq Hz
 * @param {number} duration seconds
 * @param {string} type OscillatorType
 * @param {number} gainValue
 * @param {number} [delay] seconds before starting
 */
function playTone(freq, duration, type = 'sine', gainValue = 0.15, delay = 0) {
  if (_activeOscillators.size >= MAX_OSCILLATORS) {
    // Remove oldest oscillator
    const firstKey = _activeOscillators.keys().next().value;
    try { _activeOscillators.get(firstKey).stop(); } catch (_) {}
    _activeOscillators.delete(firstKey);
  }

  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + delay + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  const key = `tone_${Date.now()}_${Math.random()}`;
  _activeOscillators.set(key, osc);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
  osc.onended = () => _activeOscillators.delete(key);
}

/**
 * Stop ambient sound
 */
function stopAmbient() {
  if (_ambientNode) {
    try {
      _ambientGain.gain.exponentialRampToValueAtTime(0.001, getCtx().currentTime + 0.5);
      _ambientNode.stop(getCtx().currentTime + 0.6);
    } catch (_) {}
    _ambientNode = null;
    _ambientGain = null;
  }
}

/**
 * Create city ambient sound
 * @param {string} cityId
 */
function createCityAmbient(cityId) {
  stopAmbient();
  const ctx = getCtx();

  const CITY_AMBIENTS = {
    nis:      { freq: 55,  bpmPulse: 60,  type: 'sawtooth', gainVal: 0.04, filterFreq: 200 },
    sarajevo: { freq: 174, bpmPulse: 80,  type: 'triangle', gainVal: 0.05, filterFreq: 800 },
    strand:   { freq: 220, bpmPulse: 75,  type: 'sine',     gainVal: 0.06, filterFreq: 2000 },
    guncati:  { freq: 146, bpmPulse: 65,  type: 'triangle', gainVal: 0.05, filterFreq: 600 },
    avala:    { freq: 87,  bpmPulse: 85,  type: 'sine',     gainVal: 0.07, filterFreq: 1200 },
  };

  const cfg = CITY_AMBIENTS[cityId] || CITY_AMBIENTS.nis;

  // Base drone
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = cfg.type;
  osc.frequency.value = cfg.freq;
  filter.type = 'lowpass';
  filter.frequency.value = cfg.filterFreq;
  filter.Q.value = 2;
  gain.gain.value = cfg.gainVal;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();

  _ambientNode = osc;
  _ambientGain = gain;

  // Add subtle LFO pulse (BPM pulse)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = cfg.bpmPulse / 60;
  lfoGain.gain.value = cfg.gainVal * 0.3;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start();
}

export const AudioAPI = {
  /**
   * Called when event starts
   * @param {string} cityId
   */
  onEventStart(cityId) {
    _currentCityId = cityId;
    try {
      createCityAmbient(cityId);
    } catch (e) {
      console.warn('Audio onEventStart:', e);
    }
  },

  /**
   * Called when BPM changes (debounced 300ms)
   * @param {number} value
   */
  onBPMChange(value) {
    try {
      const ctx = getCtx();
      if (!_ambientNode) return;
      // Adapt ambient LFO to BPM
      const bpmPct = (value - 90) / 48;

      // BPM range sounds: add a layer based on range
      if (value >= 123) {
        // Hot: full drop layer
        playTone(value * 0.5, 0.3, 'square', 0.03);
      } else if (value >= 105) {
        // Warm: kick feel
        playTone(value * 0.8, 0.15, 'triangle', 0.04);
      } else {
        // Cool: minimal
        playTone(value * 0.4, 0.1, 'sine', 0.02);
      }
    } catch (e) {}
  },

  /**
   * Called when peak phase triggers (2/3 of event elapsed)
   */
  onPeakPhase() {
    try {
      // 3rd harmonic layer + crowd cheer simulation
      playTone(440, 0.8, 'sine', 0.08);
      playTone(880, 0.6, 'triangle', 0.06, 0.1);
      playTone(1320, 0.4, 'sine', 0.04, 0.2);
      // Crowd cheer: filtered noise via oscillator
      playTone(200, 1.5, 'sawtooth', 0.03, 0.3);
    } catch (e) {}
  },

  /**
   * Called when incident triggers
   * @param {string} severity 'low'|'medium'|'high'|'critical'
   */
  onIncident(severity) {
    try {
      switch (severity) {
        case 'low':
          playTone(523, 0.2, 'sine', 0.1);      // C5 chime
          break;
        case 'medium':
          playTone(440, 0.15, 'sawtooth', 0.1); // Tritone dissonant stab
          playTone(622, 0.15, 'sawtooth', 0.08, 0.05);
          break;
        case 'high':
          playTone(880, 0.4, 'square', 0.08);   // Alarm riser
          // Duck ambient
          if (_ambientGain) {
            const ctx = getCtx();
            _ambientGain.gain.setValueAtTime(_ambientGain.gain.value, ctx.currentTime);
            _ambientGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            _ambientGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2.1);
          }
          break;
        case 'critical':
          // LFO sirena 400Hz, 3s + 80% ambient fade
          playTone(400, 3, 'sawtooth', 0.12);
          playTone(600, 3, 'square', 0.06, 0.1);
          if (_ambientGain) {
            const ctx = getCtx();
            _ambientGain.gain.linearRampToValueAtTime(0.004, ctx.currentTime + 0.3);
          }
          break;
      }
    } catch (e) {}
  },

  /**
   * Called when event ends
   * @param {number} satisfaction 0-100
   */
  onEventEnd(satisfaction) {
    try {
      if (satisfaction >= 90) {
        // Triumphant chord
        playTone(523, 2,   'sine', 0.12);
        playTone(659, 1.8, 'sine', 0.10, 0.1);
        playTone(784, 1.6, 'sine', 0.08, 0.2);
        // Crowd cheer fade
        playTone(300, 3, 'sawtooth', 0.04, 0.5);
      } else if (satisfaction >= 70) {
        // Smooth neutral
        playTone(440, 1.5, 'triangle', 0.08);
        playTone(554, 1.2, 'triangle', 0.06, 0.2);
      } else if (satisfaction >= 50) {
        // Minor resolve
        playTone(440, 1.5, 'triangle', 0.07);
        playTone(523, 1, 'sine', 0.04, 0.2);
      } else {
        // Abrupt cut + distant murmur — just fade ambient fast
      }
      stopAmbient();
    } catch (e) {}
  },

  /**
   * Called when carry-over guests arrive
   * @param {number} buzzValue
   */
  onCarryOverGuests(buzzValue) {
    try {
      // Travel SFX + fanfare
      playTone(392, 0.15, 'sine', 0.08);
      playTone(523, 0.15, 'sine', 0.10, 0.12);
      playTone(659, 0.2,  'sine', 0.12, 0.24);
    } catch (e) {}
  },

  /**
   * Called when a zone overflows (with cooldown)
   * @param {string} zoneId
   */
  onZoneOverflow(zoneId) {
    const now = Date.now();
    if (_overflowCooldowns[zoneId] && now - _overflowCooldowns[zoneId] < 8000) return;
    _overflowCooldowns[zoneId] = now;
    try {
      // Zone-specific alert
      const ZONE_FREQS = { dance_floor: 660, bar: 550, chill: 440, stage_front: 770, vip: 880 };
      const freq = ZONE_FREQS[zoneId] || 600;
      playTone(freq, 0.3, 'square', 0.07);
      playTone(freq * 1.5, 0.3, 'sawtooth', 0.04, 0.1);
    } catch (e) {}
  },

  /**
   * Called when macro menu opens
   */
  onMenuOpen() {
    try {
      // Vinyl scratch: fast frequency sweep
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  },

  /**
   * Called when upgrade is purchased
   */
  onUpgradePurchased() {
    try {
      // G4→C5 major third chime: G4 + B4 + E5
      playTone(392, 0.4, 'sine', 0.10);
      playTone(494, 0.4, 'sine', 0.08, 0.05);
      playTone(659, 0.5, 'sine', 0.12, 0.1);
    } catch (e) {}
  },

  /**
   * Called when coordinator is hired
   * @param {string} coordId
   */
  onCoordinatorHired(coordId) {
    try {
      // Warm two-tone
      playTone(440, 0.3, 'triangle', 0.10);
      playTone(554, 0.3, 'triangle', 0.08, 0.15);
    } catch (e) {}
  },
};
