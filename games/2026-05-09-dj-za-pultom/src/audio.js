/**
 * audio.js — DJ za pultom
 * Web Audio API engine. Sve generirano proceduralnim putem.
 * Bez .mp3/.wav fajlova, bez fetch().
 *
 * Ceca Čujka / Gari Daily Games — KORAK 4e
 */

// ---------------------------------------------------------------------------
// Interni state
// ---------------------------------------------------------------------------

let _ctx = null;          // AudioContext (lazy)
let _masterGain = null;   // GainNode — sve ide kroz ovaj
let _muteGain = null;     // GainNode — mute sloj (ispred masterGain)
let _muted = false;
let _masterVolume = 0.7;

// Ambient state
let _ambientNodes = [];   // aktivni oscillatori ambient loopa
let _ambientGain = null;  // GainNode ambijenta

// ---------------------------------------------------------------------------
// Interni helpers
// ---------------------------------------------------------------------------

/**
 * Vraća AudioContext ili null ako nije dostupan / nije inicijaliziran.
 */
const _getCtx = () => _ctx;

/**
 * Gradi signal chain: source → masterGain → destination
 * Poziva se jednom u initAudio().
 */
const _buildChain = () => {
  _masterGain = _ctx.createGain();
  _masterGain.gain.setValueAtTime(_masterVolume, _ctx.currentTime);

  _muteGain = _ctx.createGain();
  _muteGain.gain.setValueAtTime(1, _ctx.currentTime);

  _masterGain.connect(_muteGain);
  _muteGain.connect(_ctx.destination);
};

/**
 * Kreira OscillatorNode + GainNode par, spaja na _masterGain.
 * Vraća { osc, gain }.
 */
const _makeOsc = (type, frequency, gainValue, destination) => {
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, _ctx.currentTime);
  gain.gain.setValueAtTime(gainValue, _ctx.currentTime);
  osc.connect(gain);
  gain.connect(destination || _masterGain);
  return { osc, gain };
};

/**
 * Sekvencijalno svira niz tonova.
 * notes: [{ freq, duration, type? }]
 * onEnd: callback kad sve završi
 */
const _playSequence = (notes, onEnd) => {
  const dest = _masterGain;
  let t = _ctx.currentTime;

  notes.forEach(({ freq, duration, type = 'sine', gainVal = 0.25 }) => {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainVal, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration - 0.01);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + duration);
    osc.onended = () => { gain.disconnect(); };
    t += duration;
  });

  if (onEnd) {
    setTimeout(onEnd, (t - _ctx.currentTime) * 1000 + 50);
  }
};

// ---------------------------------------------------------------------------
// Reverb (convolution approximation — sintetički IR)
// ---------------------------------------------------------------------------

const _createReverb = (duration = 1.5, decay = 2.0) => {
  const sampleRate = _ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = _ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const channelData = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      channelData[i] =
        (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  const convolver = _ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
};

// ---------------------------------------------------------------------------
// Eksportovane funkcije
// ---------------------------------------------------------------------------

/**
 * initAudio()
 * Kreira AudioContext lazy — tek na user interaction.
 * Bezbjedno je zvati više puta (idempotentno).
 */
export function initAudio() {
  try {
    if (_ctx) return _ctx;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    _ctx = new AudioContext();
    _buildChain();
    return _ctx;
  } catch (e) {
    return null;
  }
}

// ---------------------------------------------------------------------------

/**
 * startAmbient(zoneName)
 * Zona: 'zagrevanje' | 'vrhunac' | 'after_hours'
 * Smooth crossfade 0.3s ako ambient već svira.
 */
export function startAmbient(zoneName) {
  try {
    if (!_ctx) return;

    // Crossfade — fajd-out trenutni ambient
    if (_ambientGain) {
      const old = _ambientGain;
      old.gain.setValueAtTime(old.gain.value, _ctx.currentTime);
      old.gain.linearRampToValueAtTime(0, _ctx.currentTime + 0.3);
      setTimeout(() => {
        _ambientNodes.forEach(n => {
          try { n.stop(); } catch (_) {}
          try { n.disconnect(); } catch (_) {}
        });
        try { old.disconnect(); } catch (_) {}
      }, 400);
    }

    _ambientNodes = [];
    const ambGain = _ctx.createGain();
    ambGain.gain.setValueAtTime(0, _ctx.currentTime);
    ambGain.connect(_masterGain);
    _ambientGain = ambGain;

    const now = _ctx.currentTime;

    if (zoneName === 'zagrevanje') {
      // Nisko-frekvencioni hum, ~60 BPM feel
      // Oscillator 1: sub sine 55Hz
      const o1 = _ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(55, now);
      const g1 = _ctx.createGain();
      g1.gain.setValueAtTime(0.5, now);
      o1.connect(g1); g1.connect(ambGain);
      o1.start();
      _ambientNodes.push(o1);

      // Oscillator 2: triangle 110Hz — topli harmonik
      const o2 = _ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(110, now);
      const g2 = _ctx.createGain();
      g2.gain.setValueAtTime(0.25, now);
      o2.connect(g2); g2.connect(ambGain);
      o2.start();
      _ambientNodes.push(o2);

      // Oscillator 3: sine 82.5Hz (blagi detuning za "breath" efekat)
      const o3 = _ctx.createOscillator();
      o3.type = 'sine';
      o3.frequency.setValueAtTime(82.5, now);
      const g3 = _ctx.createGain();
      g3.gain.setValueAtTime(0.2, now);
      // LFO za sporni puls ~1Hz (60 BPM)
      const lfo = _ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1, now);
      const lfoGain = _ctx.createGain();
      lfoGain.gain.setValueAtTime(0.1, now);
      lfo.connect(lfoGain);
      lfoGain.connect(g3.gain);
      lfo.start();
      o3.connect(g3); g3.connect(ambGain);
      o3.start();
      _ambientNodes.push(o3, lfo);

      // Fade in
      ambGain.gain.linearRampToValueAtTime(0.4, now + 0.3);

    } else if (zoneName === 'vrhunac') {
      // Isti base + brži pulse, viši gain
      const o1 = _ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(55, now);
      const g1 = _ctx.createGain();
      g1.gain.setValueAtTime(0.6, now);
      o1.connect(g1); g1.connect(ambGain);
      o1.start();
      _ambientNodes.push(o1);

      const o2 = _ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(110, now);
      const g2 = _ctx.createGain();
      g2.gain.setValueAtTime(0.35, now);
      o2.connect(g2); g2.connect(ambGain);
      o2.start();
      _ambientNodes.push(o2);

      // Brži LFO ~2Hz (120 BPM feel)
      const o3 = _ctx.createOscillator();
      o3.type = 'sine';
      o3.frequency.setValueAtTime(82.5, now);
      const g3 = _ctx.createGain();
      g3.gain.setValueAtTime(0.3, now);
      const lfo = _ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2, now);
      const lfoGain = _ctx.createGain();
      lfoGain.gain.setValueAtTime(0.15, now);
      lfo.connect(lfoGain);
      lfoGain.connect(g3.gain);
      lfo.start();
      o3.connect(g3); g3.connect(ambGain);
      o3.start();
      _ambientNodes.push(o3, lfo);

      // Dodatni viši harmonik za "energiju"
      const o4 = _ctx.createOscillator();
      o4.type = 'triangle';
      o4.frequency.setValueAtTime(220, now);
      const g4 = _ctx.createGain();
      g4.gain.setValueAtTime(0.12, now);
      o4.connect(g4); g4.connect(ambGain);
      o4.start();
      _ambientNodes.push(o4);

      ambGain.gain.linearRampToValueAtTime(0.55, now + 0.3);

    } else if (zoneName === 'after_hours') {
      // Duboka sub-bas nota, spora, meditativna — "posljednji set"
      const o1 = _ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(40, now); // sub-bass
      const g1 = _ctx.createGain();
      g1.gain.setValueAtTime(0.65, now);
      o1.connect(g1); g1.connect(ambGain);
      o1.start();
      _ambientNodes.push(o1);

      // Veoma spori LFO ~0.4Hz za meditativni dah
      const lfo = _ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.4, now);
      const lfoGain = _ctx.createGain();
      lfoGain.gain.setValueAtTime(0.12, now);
      lfo.connect(lfoGain);
      lfoGain.connect(g1.gain);
      lfo.start();
      _ambientNodes.push(lfo);

      // Tihi triangle harmonik — "sala se prazni"
      const o2 = _ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(80, now);
      const g2 = _ctx.createGain();
      g2.gain.setValueAtTime(0.15, now);
      o2.connect(g2); g2.connect(ambGain);
      o2.start();
      _ambientNodes.push(o2);

      ambGain.gain.linearRampToValueAtTime(0.35, now + 0.3);
    }
  } catch (e) {
    // tiho degredira
  }
}

// ---------------------------------------------------------------------------

/**
 * stopAmbient()
 * Graceful fadeout 0.5s pa disconnect.
 */
export function stopAmbient() {
  try {
    if (!_ctx || !_ambientGain) return;
    const gain = _ambientGain;
    const nodes = _ambientNodes.slice();
    gain.gain.setValueAtTime(gain.gain.value, _ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, _ctx.currentTime + 0.5);
    _ambientGain = null;
    _ambientNodes = [];
    setTimeout(() => {
      nodes.forEach(n => {
        try { n.stop(); } catch (_) {}
        try { n.disconnect(); } catch (_) {}
      });
      try { gain.disconnect(); } catch (_) {}
    }, 600);
  } catch (e) {}
}

// ---------------------------------------------------------------------------

/**
 * playClick()
 * "Tick" — kratki transient 10ms, ~800Hz, brzi decay.
 */
export function playClick() {
  try {
    if (!_ctx) return;
    const now = _ctx.currentTime;
    const { osc, gain } = _makeOsc('sine', 800, 0);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.05);
    osc.onended = () => { gain.disconnect(); };
  } catch (e) {}
}

// ---------------------------------------------------------------------------

/**
 * playUpgradeBuy()
 * Kratki "chime" — C5→E5, 150ms svaka, sine.
 */
export function playUpgradeBuy() {
  try {
    if (!_ctx) return;
    _playSequence([
      { freq: 523.25, duration: 0.15, type: 'sine', gainVal: 0.28 }, // C5
      { freq: 659.25, duration: 0.15, type: 'sine', gainVal: 0.28 }, // E5
    ]);
  } catch (e) {}
}

// ---------------------------------------------------------------------------

/**
 * playZoneTransition(zoneName)
 * 'vrhunac': filter sweep 200→2000Hz (300ms)
 * 'after_hours': reverse sweep + sub boom
 */
export function playZoneTransition(zoneName) {
  try {
    if (!_ctx) return;
    const now = _ctx.currentTime;

    if (zoneName === 'vrhunac') {
      // Filter sweep up 200→2000Hz
      const osc = _ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);

      const filter = _ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
      filter.Q.setValueAtTime(3, now);

      const gain = _ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(_masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
      osc.onended = () => {
        filter.disconnect();
        gain.disconnect();
      };

    } else if (zoneName === 'after_hours') {
      // Reverse sweep (visoko→nisko) + sub boom
      const osc = _ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);

      const filter = _ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      const gain = _ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(_masterGain);
      osc.start(now);
      osc.stop(now + 0.4);
      osc.onended = () => {
        filter.disconnect();
        gain.disconnect();
      };

      // Sub boom — kratki udar
      const boom = _ctx.createOscillator();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(60, now);
      boom.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      const boomGain = _ctx.createGain();
      boomGain.gain.setValueAtTime(0.5, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      boom.connect(boomGain);
      boomGain.connect(_masterGain);
      boom.start(now);
      boom.stop(now + 0.45);
      boom.onended = () => { boomGain.disconnect(); };

    } else {
      // 'zagrevanje' — blagi low sweep
      const osc = _ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.3);
      const gain = _ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.connect(gain);
      gain.connect(_masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
      osc.onended = () => { gain.disconnect(); };
    }
  } catch (e) {}
}

// ---------------------------------------------------------------------------

/**
 * playFail()
 * "Crowd leaving" — descending low whoosh (0.8s), low gain.
 */
export function playFail() {
  try {
    if (!_ctx) return;
    const now = _ctx.currentTime;

    const osc = _ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);

    const filter = _ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.8);

    const gain = _ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(_masterGain);
    osc.start(now);
    osc.stop(now + 0.85);
    osc.onended = () => {
      filter.disconnect();
      gain.disconnect();
    };
  } catch (e) {}
}

// ---------------------------------------------------------------------------

/**
 * playWin()
 * Kratki fanfara — C5, E5, G5, 100ms razmak, sa reverb.
 */
export function playWin() {
  try {
    if (!_ctx) return;

    const reverb = _createReverb(1.2, 2.5);
    reverb.connect(_masterGain);

    const now = _ctx.currentTime;
    const notes = [
      { freq: 523.25, t: now },        // C5
      { freq: 659.25, t: now + 0.12 }, // E5
      { freq: 784.00, t: now + 0.24 }, // G5
    ];

    notes.forEach(({ freq, t }) => {
      const osc = _ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = _ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(reverb);
      gain.connect(_masterGain); // dry signal
      osc.start(t);
      osc.stop(t + 0.4);
      osc.onended = () => { gain.disconnect(); };
    });

    // Disconnect reverb nakon što sve završi
    setTimeout(() => {
      try { reverb.disconnect(); } catch (_) {}
    }, 2000);
  } catch (e) {}
}

// ---------------------------------------------------------------------------

/**
 * setMasterVolume(v)
 * v: 0.0–1.0, smooth ramp 100ms.
 */
export function setMasterVolume(v) {
  try {
    const vol = Math.max(0, Math.min(1, v));
    _masterVolume = vol;
    if (!_ctx || !_masterGain) return;
    _masterGain.gain.setValueAtTime(_masterGain.gain.value, _ctx.currentTime);
    _masterGain.gain.linearRampToValueAtTime(vol, _ctx.currentTime + 0.1);
  } catch (e) {}
}

// ---------------------------------------------------------------------------

/**
 * isMuted()
 * Vraća boolean — trenutno stanje mute.
 */
export function isMuted() {
  return _muted;
}

/**
 * toggleMute()
 * Uključuje/isključuje mute. Smooth 50ms ramp.
 */
export function toggleMute() {
  try {
    _muted = !_muted;
    if (!_ctx || !_muteGain) return;
    const now = _ctx.currentTime;
    _muteGain.gain.setValueAtTime(_muteGain.gain.value, now);
    _muteGain.gain.linearRampToValueAtTime(_muted ? 0 : 1, now + 0.05);
  } catch (e) {}
}
