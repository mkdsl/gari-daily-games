/**
 * Web Audio API — Folk-inspired ambient + SFX
 * Srpska/Balkanska lestvica: A B C# D E F G (dorska sa povećanom 2.)
 * Tempo: ~70 BPM
 */

export class AudioEngine {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._ambientNodes = [];
    this._muted = false;
    this._started = false;
    this._currentSeason = 0; // 0=zima, 1=prolece, 2=leto, 3=jesen
  }

  /** Must be called on first user gesture (iOS AudioContext requirement) */
  resume() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = 0.3;
      this._masterGain.connect(this._ctx.destination);
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    if (!this._started) {
      this._started = true;
      this._startAmbient();
    }
  }

  toggle() {
    this._muted = !this._muted;
    if (this._masterGain) {
      this._masterGain.gain.setTargetAtTime(this._muted ? 0 : 0.3, this._ctx.currentTime, 0.3);
    }
    return !this._muted;
  }

  get muted() { return this._muted; }

  /** Update ambient based on season (0=zima, 1=proleće, 2=leto, 3=jesen) */
  setSeasonAmbient(season) {
    this._currentSeason = season % 4;
    if (this._started && this._ctx) {
      this._updateAmbientForSeason();
    }
  }

  /** ─── Ambient ─── */
  _startAmbient() {
    if (!this._ctx) return;
    this._createPadLayer();
    this._createBreathLayer();
    this._schedulePizzicato();
  }

  _createPadLayer() {
    const ctx = this._ctx;
    const t = ctx.currentTime;

    // Srpska lestvica degrees (A=220Hz base): A(220) B(247) C#(277) D(293) E(329) F(349) G(392)
    const scaleFreqs = [220, 247, 277, 293.7, 329.6, 349.2, 392];
    const padFreqs = [scaleFreqs[0], scaleFreqs[2], scaleFreqs[4]]; // A, C#, E — drone chord

    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq * (1 + (i * 0.001)); // Slight detune for warmth
      osc.detune.value = Math.random() * 4 - 2;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.gain.setTargetAtTime(0.08 / padFreqs.length, t + 0.1, 2.0); // Slow attack

      // Slight LFO wobble
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      lfo.type = 'sine';
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 2.0;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);

      osc.connect(gainNode);
      gainNode.connect(this._masterGain);
      osc.start(t);

      this._ambientNodes.push({ osc, gainNode, lfo });
    });
  }

  _createBreathLayer() {
    const ctx = this._ctx;
    const t = ctx.currentTime;

    // White noise filtered for "frula breath"
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 8;

    // Slow LFO on filter freq (breath rhythm)
    const breathLFO = ctx.createOscillator();
    breathLFO.frequency.value = 0.15; // Very slow
    breathLFO.type = 'sine';
    const breathLFOGain = ctx.createGain();
    breathLFOGain.gain.value = 300;
    breathLFO.connect(breathLFOGain);
    breathLFOGain.connect(filter.frequency);
    breathLFO.start(t);

    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.04;

    noise.connect(filter);
    filter.connect(breathGain);
    breathGain.connect(this._masterGain);
    noise.start(t);

    this._ambientNodes.push({ noise, filter, breathGain, breathLFO });
  }

  _schedulePizzicato() {
    // Schedule recurring pizzicato notes on scale degrees
    const scaleFreqs = [220, 247, 277, 293.7, 329.6, 349.2, 392, 440, 493.9];
    const patterns = [
      [0, 2, 4, 2, 0],     // A C# E C# A
      [4, 3, 2, 0, 4],     // E D C# A E
      [0, 4, 7, 4, 2],     // A E A E C#
    ];

    const bpmInterval = 60 / 70; // 0.857s per beat
    let beat = 0;
    const patternIdx = Math.floor(Math.random() * patterns.length);
    const pattern = patterns[patternIdx];

    const playBeat = () => {
      if (!this._ctx || !this._started) return;
      const noteIdx = pattern[beat % pattern.length];
      const freq = scaleFreqs[noteIdx];
      this._playPizzNote(freq, 0.06, 0.3);
      beat++;

      // Next beat: vary timing slightly for human feel
      const jitter = (Math.random() - 0.5) * 0.05;
      setTimeout(playBeat, (bpmInterval + jitter) * 1000);
    };

    // Start after ambient establishes
    setTimeout(playBeat, 3000);
  }

  _playPizzNote(freq, gain, duration) {
    if (!this._ctx || this._muted) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain, t);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gainNode);
    gainNode.connect(this._masterGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  _updateAmbientForSeason() {
    if (!this._masterGain) return;
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Zima: quieter (0.2), Leto: fuller (0.35)
    const seasonGains = [0.2, 0.28, 0.35, 0.3];
    const targetGain = this._muted ? 0 : seasonGains[this._currentSeason];
    this._masterGain.gain.setTargetAtTime(targetGain, t, 2.0);
  }

  /** ─── SFX ─── */
  playSfx(type) {
    if (!this._ctx || this._muted) return;
    switch (type) {
      case 'harvest': this._sfxHarvest(); break;
      case 'inokulacija': this._sfxInokulacija(); break;
      case 'achievement': this._sfxAchievement(); break;
      case 'season_end': this._sfxSeasonEnd(); break;
      case 'prestige': this._sfxPrestige(); break;
      case 'event_alert': this._sfxEventAlert(); break;
      case 'purchase': this._sfxPurchase(); break;
      case 'phase_unlock': this._sfxPhaseUnlock(); break;
      default: break;
    }
  }

  _sfxHarvest() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Satisfying "thud" + brightness burst
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g); g.connect(this._masterGain);
    osc.start(t); osc.stop(t + 0.3);

    // Brightness burst
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 880;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc2.connect(g2); g2.connect(this._masterGain);
    osc2.start(t); osc2.stop(t + 0.2);
  }

  _sfxInokulacija() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // High-pitched ding + soft rumble
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1760;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g); g.connect(this._masterGain);
    osc.start(t); osc.stop(t + 0.5);
  }

  _sfxAchievement() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Fanfare arpeggio 4 notes ascending: A C# E A
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      const delay = i * 0.12;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.25, t + delay + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.35);
      osc.connect(g); g.connect(this._masterGain);
      osc.start(t + delay); osc.stop(t + delay + 0.4);
    });
  }

  _sfxSeasonEnd() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Gentle bell + fade
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 523.25; // C5
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc.connect(g); g.connect(this._masterGain);
    osc.start(t); osc.stop(t + 1.5);
    // Overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 1046.5;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.1, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    osc2.connect(g2); g2.connect(this._masterGain);
    osc2.start(t); osc2.stop(t + 2.0);
  }

  _sfxPrestige() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Layered fanfare 2s: ascending + held chord
    const fanfare = [220, 277, 329.6, 440, 554, 659];
    fanfare.forEach((freq, i) => {
      const delay = i * 0.1;
      const osc = ctx.createOscillator();
      osc.type = i < 3 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.2, t + delay + 0.08);
      g.gain.setValueAtTime(0.2, t + 1.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
      osc.connect(g); g.connect(this._masterGain);
      osc.start(t + delay); osc.stop(t + 2.1);
    });
  }

  _sfxEventAlert() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Delicate "ping" with reverb-like echo
    [0, 0.18, 0.36].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 880 / (1 + i * 0.2);
      const g = ctx.createGain();
      const amp = 0.2 / (i + 1);
      g.gain.setValueAtTime(amp, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);
      osc.connect(g); g.connect(this._masterGain);
      osc.start(t + delay); osc.stop(t + delay + 0.5);
    });
  }

  _sfxPurchase() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Soft click + coin ring
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g); g.connect(this._masterGain);
    osc.start(t); osc.stop(t + 0.15);
  }

  _sfxPhaseUnlock() {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    // Major chord swell 1s
    [261.6, 329.6, 392, 523.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.2);
      g.gain.setValueAtTime(0.15, t + 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(g); g.connect(this._masterGain);
      osc.start(t); osc.stop(t + 1.3);
    });
  }
}
