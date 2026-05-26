// audio.js — AudioManager: Web Audio API, bez .mp3

let ctx = null;
let masterGain = null;
let ambientNodes = [];
let initialized = false;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

export const AudioManager = {
  init() {
    if (initialized) return;
    try {
      getCtx();
      initialized = true;
    } catch (e) {
      // Audio not available
    }
  },

  resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  },

  playAmbient() {
    if (!initialized || !ctx) return;
    this.stopAmbient();

    // Low-frequency oscillator ~60Hz (klima uredjaj)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 60;
    gain1.gain.value = 0.02;
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start();

    // White noise (subtle)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.012;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.8;
    noise.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();

    ambientNodes = [osc1, noise];
  },

  stopAmbient() {
    ambientNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    ambientNodes = [];
  },

  setScene(sceneIndex) {
    if (!initialized || !ctx) return;
    // Gari scene (scene 6): add sub-bass rumble
    if (sceneIndex === 6) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 40;
      gain.gain.value = 0.015;
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      ambientNodes.push(osc);
    }
  },

  playClick() {
    if (!initialized || !ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  },

  playDing() {
    if (!initialized || !ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  },

  fadeScene(callback) {
    if (!initialized || !ctx || !masterGain) {
      if (callback) callback();
      return;
    }
    const now = ctx.currentTime;
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    setTimeout(() => {
      if (masterGain) {
        masterGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.2);
      }
      if (callback) callback();
    }, 200);
  },
};
