// =============================================================================
// systems/cinematic-audio.js — Procedural dub bass za Cinematic A hook
// =============================================================================
// Koristi Web Audio API (sopstveni AudioContext, ne lib/dj-audio koji je za setove).
// 4-bar loop: sub-bass sine (~55-65 Hz) + sidechain ducking + dub delay tail.
// Anti-stylish per Nega — arrhythmic stagger, ne uniformno.
// =============================================================================

let ctx = null;
let masterGain = null;
let bassOsc = null;
let lfo = null;
let lfoGain = null;
let delayNode = null;
let delayGain = null;
let delayFb = null;
let started = false;
let stopTimer = null;

const BASE_FREQ = 58;     // dub sub-bass center
const BPM = 70;           // half-time dub feel
const BEAT_SEC = 60 / BPM;

export function startCinematicBass() {
  if (started) return;
  started = true;

  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      console.warn('[cinematic-audio] no AudioContext support');
      return;
    }
    ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();

    // Master gain — soft ease-in
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);

    // Dub delay (tail)
    delayNode = ctx.createDelay(2.0);
    delayNode.delayTime.value = (BEAT_SEC * 0.75);  // dotted 8th feel
    delayFb = ctx.createGain();
    delayFb.gain.value = 0.42;
    delayGain = ctx.createGain();
    delayGain.gain.value = 0.55;

    delayNode.connect(delayFb);
    delayFb.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(masterGain);

    // Sub bass oscillator
    bassOsc = ctx.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = BASE_FREQ;

    // Slight detune wobble (anti-stylish — arrhythmic per Nega)
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.13;  // ~7.7s period — non-uniform
    lfoGain = ctx.createGain();
    lfoGain.gain.value = 2.5;    // ±2.5 Hz wobble
    lfo.connect(lfoGain);
    lfoGain.connect(bassOsc.frequency);
    lfo.start();

    // Bass envelope (pulse on each "hit" with stagger)
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0;
    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    bassGain.connect(delayNode);  // dub tail send
    bassOsc.start();

    // Schedule pulses with arrhythmic stagger (anti-uniform per Nega)
    schedulePulses(bassGain, ctx.currentTime);

  } catch (e) {
    console.warn('[cinematic-audio] start failed', e);
  }
}

function schedulePulses(gainNode, startTime) {
  // 4-bar pattern, slight micro-timing stagger
  const pattern = [
    0.00, 1.50, 3.10, 4.40,   // bar 1-2 (loose dub timing, not on grid)
    5.85, 7.20, 8.70, 10.10   // bar 3-4
  ];

  for (let cycle = 0; cycle < 20; cycle++) {  // 20 cycles ≈ 200s (will be stopped sooner)
    const cycleOffset = cycle * 12;  // each cycle ~12s
    for (const beat of pattern) {
      const t = startTime + cycleOffset + beat;
      // Each pulse: ramp up to 1.0 quickly, decay over 0.8s
      gainNode.gain.setValueAtTime(0.0, t);
      gainNode.gain.linearRampToValueAtTime(1.0, t + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    }
  }
}

export function stopCinematicBass(fadeSeconds = 1.0) {
  if (!ctx || !started) return;
  try {
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + fadeSeconds);

    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      try {
        if (bassOsc) bassOsc.stop();
        if (lfo) lfo.stop();
        ctx.close();
      } catch (e) { /* ignore */ }
      ctx = null;
      bassOsc = null;
      lfo = null;
      masterGain = null;
      delayNode = null;
      started = false;
    }, (fadeSeconds + 0.3) * 1000);
  } catch (e) {
    console.warn('[cinematic-audio] stop failed', e);
  }
}

// =============================================================================
// DE-SYNC AUDIO CUES — per substance state (Mile S2 GDD anti-stylish)
// =============================================================================
// Igrač NE vidi audio kontrolu. Substance state mapira na audio engine de-sync:
//   alcohol = drift +10% (BPM creep up/down)
//   stimulansi = hyper-tempo creep (BPM up)
//   psihodelici na žurci = full chaos (random phase shifts)
//   compound C8 = cardio panic cue (high-pass + accelerate)
// =============================================================================

const DESYNC_AUDIO_PROFILE = {
  alcohol:      { drift_pct: 0.10, hp_freq: 80,   chaos: 0.0,  panic: 0.0 },
  stim:         { drift_pct: 0.15, hp_freq: 120,  chaos: 0.0,  panic: 0.2 },
  psychedelic:  { drift_pct: 0.05, hp_freq: 80,   chaos: 0.4,  panic: 0.0 },
  compound:     { drift_pct: 0.20, hp_freq: 250,  chaos: 0.3,  panic: 0.6 }  // C8 cardio
};

export function getDesyncProfile(activeSubstances) {
  const profile = { drift_pct: 0, hp_freq: 60, chaos: 0, panic: 0 };
  for (const sub of activeSubstances) {
    const p = DESYNC_AUDIO_PROFILE[sub];
    if (!p) continue;
    profile.drift_pct = Math.max(profile.drift_pct, p.drift_pct);
    profile.hp_freq = Math.max(profile.hp_freq, p.hp_freq);
    profile.chaos = Math.max(profile.chaos, p.chaos);
    profile.panic = Math.max(profile.panic, p.panic);
  }
  return profile;
}
