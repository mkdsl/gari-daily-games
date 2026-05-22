// CECA ČUJKA — Web Audio API, no external files

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

let ambientNodes = null;
let ambientGain = null;

export function ambientBeat(bpm = 128) {
  const ac = getCtx();
  stopAmbient();

  const masterGain = ac.createGain();
  masterGain.gain.setValueAtTime(0.18, ac.currentTime);
  masterGain.connect(ac.destination);
  ambientGain = masterGain;

  const beatInterval = 60 / bpm;
  const nodes = [];

  // Sub-bass kick oscillator
  function scheduleKick(time) {
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    env.gain.setValueAtTime(0.9, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(env);
    env.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Hi-hat
  function scheduleHat(time) {
    const bufferSize = ac.sampleRate * 0.05;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    const env = ac.createGain();
    env.gain.setValueAtTime(0.2, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    source.connect(filter);
    filter.connect(env);
    env.connect(masterGain);
    source.start(time);
  }

  let nextBeat = ac.currentTime;
  const schedulerInterval = setInterval(() => {
    if (!ctx) { clearInterval(schedulerInterval); return; }
    while (nextBeat < ac.currentTime + 0.2) {
      scheduleKick(nextBeat);
      scheduleHat(nextBeat + beatInterval * 0.5);
      nextBeat += beatInterval;
    }
  }, 50);

  nodes.push({ stop: () => clearInterval(schedulerInterval) });
  ambientNodes = nodes;
}

export function stopAmbient() {
  if (ambientNodes) {
    ambientNodes.forEach(n => { try { n.stop(); } catch (e) {} });
    ambientNodes = null;
  }
  if (ambientGain) {
    try {
      ambientGain.gain.setValueAtTime(0, getCtx().currentTime);
    } catch (e) {}
    ambientGain = null;
  }
}

export function complaintSound() {
  const ac = getCtx();
  const frequencies = [220, 233, 246]; // dissonant cluster
  frequencies.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + i * 0.05);
    osc.stop(ac.currentTime + 0.85);
  });
}

export function happinessChord(level) {
  const ac = getCtx();
  // Major chord arpeggio — C major: C4, E4, G4, C5
  const baseFreqs = [261.63, 329.63, 392.00, 523.25];
  const semitoneUp = level * 2;
  const mult = Math.pow(2, semitoneUp / 12);

  baseFreqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    const startTime = ac.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.45);
  });
}

export function warningBleep() {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ac.currentTime);
  osc.frequency.setValueAtTime(660, ac.currentTime + 0.1);
  osc.frequency.setValueAtTime(880, ac.currentTime + 0.2);
  gain.gain.setValueAtTime(0.25, ac.currentTime);
  gain.gain.setValueAtTime(0, ac.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.32);
}

export function gameOverDrone() {
  const ac = getCtx();
  stopAmbient();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = 55;
  gain.gain.setValueAtTime(0.4, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + 3.0);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 3.1);
}

export function resumeAudioContext() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
