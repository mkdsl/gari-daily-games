// audio.js — Web Audio: carrier, filters, SFX, verification

let ctx = null;
let analyser = null;
let masterGain = null;
let filterChain = {};
let currentSnippetStop = null;

export function getAnalyser() { return analyser; }

export function initAudio() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  // Analyser
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.7;

  // Master gain
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.55;
  masterGain.connect(analyser);
  analyser.connect(ctx.destination);

  return ctx;
}

function ensureCtx() {
  if (!ctx) initAudio();
  if (ctx.state === 'suspended') ctx.resume();
}

// Build the filter chain for a problem
function buildFilterChain(problem) {
  ensureCtx();
  // Create filters: lowshelf, highshelf, peaking1, peaking2
  const filters = {
    lowshelf: ctx.createBiquadFilter(),
    highshelf: ctx.createBiquadFilter(),
    peaking1: ctx.createBiquadFilter(),
    peaking2: ctx.createBiquadFilter(),
  };

  filters.lowshelf.type = 'lowshelf';
  filters.lowshelf.frequency.value = 120;
  filters.lowshelf.gain.value = 0;

  filters.highshelf.type = 'highshelf';
  filters.highshelf.frequency.value = 8000;
  filters.highshelf.gain.value = 0;

  filters.peaking1.type = 'peaking';
  filters.peaking1.frequency.value = 1000;
  filters.peaking1.Q.value = 1.4;
  filters.peaking1.gain.value = 0;

  filters.peaking2.type = 'peaking';
  filters.peaking2.frequency.value = 3000;
  filters.peaking2.Q.value = 2.0;
  filters.peaking2.gain.value = 0;

  // Apply problem
  applyProblemToFilters(filters, problem);

  // Chain: lowshelf → highshelf → peaking1 → peaking2
  filters.lowshelf.connect(filters.highshelf);
  filters.highshelf.connect(filters.peaking1);
  filters.peaking1.connect(filters.peaking2);
  filters.peaking2.connect(masterGain);

  filterChain = filters;
  return filters;
}

function applyProblemToFilters(filters, problem, corrected = false, correctionDirs = []) {
  // Reset all
  filters.lowshelf.gain.value = 0;
  filters.highshelf.gain.value = 0;
  filters.peaking1.gain.value = 0;
  filters.peaking2.gain.value = 0;

  if (!problem) return;

  const gainMod = corrected ? -1 : 1; // flip gain to 0 would fully correct; instead apply correction

  if (problem.filterType === 'double') {
    problem.filters.forEach((f, i) => {
      applySubFilter(filters, f, i === 0 ? 'lowshelf' : 'highshelf', corrected, correctionDirs, f.filterType === 'lowshelf' ? 'bas' : 'visoke');
    });
    return;
  }

  const slot = getFilterSlot(problem.filterType, problem.frequency);
  const targetFilter = filters[slot];
  if (!targetFilter) return;

  targetFilter.frequency.value = problem.frequency;
  if (problem.Q) targetFilter.Q.value = problem.Q;

  let gain = problem.gain;
  if (corrected) {
    const axis = Array.isArray(problem.correction) ? problem.correction[0].axis : problem.correction.axis;
    const dir = correctionDirs.find(c => c.axis === axis)?.direction;
    gain = applyCorrectionToGain(gain, dir);
  }
  targetFilter.gain.value = gain;
}

function applySubFilter(filters, f, slot, corrected, correctionDirs, axis) {
  const target = filters[slot];
  if (!target) return;
  target.type = f.filterType;
  target.frequency.value = f.frequency;
  let gain = f.gain;
  if (corrected) {
    const dir = correctionDirs.find(c => c.axis === axis)?.direction;
    gain = applyCorrectionToGain(gain, dir);
  }
  target.gain.value = gain;
}

function applyCorrectionToGain(originalGain, direction) {
  // direction: 'smanjiti' | 'ok' | 'pojacati'
  if (direction === 'smanjiti') return originalGain > 0 ? 0 : originalGain * 1.5;
  if (direction === 'pojacati') return originalGain < 0 ? 0 : originalGain * 1.5;
  return originalGain; // ok = no change (for display)
}

function getFilterSlot(type, freq) {
  if (type === 'lowshelf') return 'lowshelf';
  if (type === 'highshelf') return 'highshelf';
  if (type === 'peaking') {
    // Use peaking1 for mid frequencies, peaking2 for presence+
    return freq < 2000 ? 'peaking1' : 'peaking2';
  }
  return 'peaking1';
}

// Create the 3-oscillator carrier
function createCarrier(destination) {
  const merge = ctx.createGain();
  merge.gain.value = 1.0;
  merge.connect(destination);

  const oscs = [
    { type: 'sine',     freq: 80   },
    { type: 'sawtooth', freq: 440  },
    { type: 'square',   freq: 2000 },
  ];

  const nodes = oscs.map(({ type, freq }) => {
    const g = ctx.createGain();
    g.gain.value = 0.33;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(merge);
    o.start();
    return { osc: o, gain: g };
  });

  return { nodes, merge };
}

export function playSnippet(problem, onEnd, corrected = false, correctionDirs = []) {
  ensureCtx();

  // Stop any running snippet
  if (currentSnippetStop) {
    try { currentSnippetStop(); } catch {}
    currentSnippetStop = null;
  }

  const filters = buildFilterChain(problem);
  if (corrected) {
    applyProblemToFilters(filters, problem, true, correctionDirs);
  }

  const snippetGain = ctx.createGain();
  snippetGain.gain.value = 0;
  snippetGain.connect(filters.lowshelf);

  const { nodes } = createCarrier(snippetGain);

  const now = ctx.currentTime;
  const FADE_IN = 0.05;  // 50ms
  const FADE_OUT = 0.15; // 150ms
  const DURATION = 3.5;  // 3500ms

  snippetGain.gain.setValueAtTime(0, now);
  snippetGain.gain.linearRampToValueAtTime(1.0, now + FADE_IN);
  snippetGain.gain.setValueAtTime(1.0, now + DURATION - FADE_OUT);
  snippetGain.gain.linearRampToValueAtTime(0, now + DURATION);

  const stopTime = now + DURATION;

  nodes.forEach(({ osc }) => osc.stop(stopTime));

  let stopped = false;
  const timeout = setTimeout(() => {
    if (!stopped) {
      stopped = true;
      onEnd && onEnd();
    }
  }, DURATION * 1000 + 100);

  currentSnippetStop = () => {
    stopped = true;
    clearTimeout(timeout);
    nodes.forEach(({ osc }) => { try { osc.stop(); } catch {} });
    snippetGain.disconnect();
  };

  return currentSnippetStop;
}

export function stopSnippet() {
  if (currentSnippetStop) {
    currentSnippetStop();
    currentSnippetStop = null;
  }
}

// SFX
export function sfxOK() {
  ensureCtx();
  const g = ctx.createGain();
  g.gain.value = 0.3;
  g.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2);
  osc.connect(g);
  g.gain.setValueAtTime(0.3, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

export function sfxError() {
  ensureCtx();
  const g = ctx.createGain();
  g.gain.value = 0.25;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 800;
  g.connect(lp);
  lp.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 220;
  osc.connect(g);
  g.gain.setValueAtTime(0.25, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export function sfxStreakBonus() {
  ensureCtx();
  const now = ctx.currentTime;
  [0, 0.12].forEach(delay => {
    const g = ctx.createGain();
    g.gain.value = 0.2;
    g.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    osc.connect(g);
    g.gain.setValueAtTime(0.2, now + delay);
    g.gain.linearRampToValueAtTime(0, now + delay + 0.1);
    osc.start(now + delay);
    osc.stop(now + delay + 0.1);
  });
}

export function sfxTimerUrgency() {
  ensureCtx();
  const g = ctx.createGain();
  g.gain.value = 0.15;
  g.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 60;
  osc.connect(g);
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}
