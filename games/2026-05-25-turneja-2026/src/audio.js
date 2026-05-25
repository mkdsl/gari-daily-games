// audio.js — Web Audio API sound engine (no external files)

export class AudioManager {
  constructor() {
    this._ctx = null;
    this._ambientNodes = null;
    this._beatNodes = null;
    this._beatInterval = null;
    this._currentBpm = 90;
    this._enabled = true;
    this._initialized = false;
  }

  _getCtx() {
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this._enabled = false;
        return null;
      }
    }
    // Resume if suspended (browser autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
    return this._ctx;
  }

  _ensureInit() {
    const ctx = this._getCtx();
    if (!ctx) return false;
    this._initialized = true;
    return true;
  }

  // ===================== AMBIENT (MACRO SCREEN) =====================
  playAmbient() {
    if (!this._ensureInit()) return;
    this.stopAmbient();
    const ctx = this._ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Dark drone: two detuned oscillators
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(55, ctx.currentTime);  // A1
    osc2.frequency.setValueAtTime(57.5, ctx.currentTime); // slight detune

    // LFO for slow wobble
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    lfoGain.gain.setValueAtTime(3, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfo.start();

    const osc1Gain = ctx.createGain();
    const osc2Gain = ctx.createGain();
    osc1Gain.gain.setValueAtTime(0.5, ctx.currentTime);
    osc2Gain.gain.setValueAtTime(0.3, ctx.currentTime);

    osc1.connect(osc1Gain).connect(masterGain);
    osc2.connect(osc2Gain).connect(masterGain);

    // Filter sweep
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);

    osc1.connect(filter).connect(masterGain);

    osc1.start();
    osc2.start();

    this._ambientNodes = { osc1, osc2, lfo, masterGain };
  }

  stopAmbient() {
    if (!this._ambientNodes) return;
    const ctx = this._ctx;
    if (!ctx) return;
    const { osc1, osc2, lfo, masterGain } = this._ambientNodes;
    const t = ctx.currentTime;
    masterGain.gain.linearRampToValueAtTime(0, t + 0.5);
    try { osc1.stop(t + 0.5); osc2.stop(t + 0.5); lfo.stop(t + 0.5); } catch(e) {}
    this._ambientNodes = null;
  }

  // ===================== EVENT BEAT (MICRO SCREEN) =====================
  startEventBeat(bpm) {
    if (!this._ensureInit()) return;
    this.stopBeat();
    this._currentBpm = bpm || 90;
    this._scheduleBeat();
  }

  _scheduleBeat() {
    if (!this._ctx || !this._enabled) return;
    if (this._beatInterval) clearInterval(this._beatInterval);
    const intervalMs = Math.round(60000 / this._currentBpm);

    this._beatInterval = setInterval(() => {
      this._playBeatTick();
    }, intervalMs);
    this._playBeatTick(); // immediate first beat
  }

  _playBeatTick() {
    const ctx = this._ctx;
    if (!ctx) return;
    const t = ctx.currentTime;

    // Kick drum: sine burst
    const kick = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kick.type = 'sine';
    kick.frequency.setValueAtTime(150, t);
    kick.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    kickGain.gain.setValueAtTime(0.6, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    kick.connect(kickGain).connect(ctx.destination);
    kick.start(t);
    kick.stop(t + 0.3);

    // Hi-hat: noise burst
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const hat = ctx.createBufferSource();
    hat.buffer = buffer;
    const hatFilter = ctx.createBiquadFilter();
    hatFilter.type = 'highpass';
    hatFilter.frequency.setValueAtTime(8000, t);
    const hatGain = ctx.createGain();
    hatGain.gain.setValueAtTime(0.15, t);
    hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    hat.connect(hatFilter).connect(hatGain).connect(ctx.destination);
    hat.start(t + 0.01);

    // Bass note
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(55, t);
    bassGain.gain.setValueAtTime(0.2, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(200, t);
    bass.connect(bassFilter).connect(bassGain).connect(ctx.destination);
    bass.start(t);
    bass.stop(t + 0.25);
  }

  scaleBeat(bpm) {
    if (!this._enabled) return;
    this._currentBpm = Math.min(Math.max(bpm, 60), 180);
    this._scheduleBeat();
  }

  stopBeat() {
    if (this._beatInterval) {
      clearInterval(this._beatInterval);
      this._beatInterval = null;
    }
  }

  // ===================== SFX =====================
  playSynergy() {
    if (!this._ensureInit()) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;

    // Two-note ding: ascending
    [523.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);
      gain.gain.setValueAtTime(0.4, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.35);
    });
  }

  playMissed() {
    if (!this._ensureInit()) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;

    // Descending buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.3);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  playDJ_booking() {
    if (!this._ensureInit()) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;

    // Satisfying vinyl scratch sound
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.Q.setValueAtTime(5, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);

    // Follow-up note
    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t + 0.1);
    oGain.gain.setValueAtTime(0.2, t + 0.1);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(oGain).connect(ctx.destination);
    osc.start(t + 0.1);
    osc.stop(t + 0.45);
  }

  playWin() {
    if (!this._ensureInit()) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.15);
      gain.gain.setValueAtTime(0.35, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.5);
    });
  }

  playGameOver() {
    if (!this._ensureInit()) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.2);
      gain.gain.setValueAtTime(0.25, t + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.4);
    });
  }

  toggle() {
    this._enabled = !this._enabled;
    if (!this._enabled) {
      this.stopAmbient();
      this.stopBeat();
    }
    return this._enabled;
  }
}
