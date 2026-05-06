let audioCtx = null;
let beatTimer = 0;

export function initAudio() {
  // Ne kreiraj AudioContext ovde — Safari blokira ako nije user gesture
}

export function resumeAudio() {
  // Kreiraj AudioContext TEK na prvi user gesture (klik na KRETANJE)
  if (!audioCtx) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    } catch { return; }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function updateAudio(dt, isPlaying) {
  if (!audioCtx || !isPlaying) return;
  beatTimer -= dt;
  if (beatTimer <= 0) {
    playBeat();
    beatTimer = 0.5;
  }
}

function playBeat() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(28, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.3);
}

export function playCardSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.15);
}

export function playTrashSound() {
  if (!audioCtx) return;
  const bufSize = Math.floor(audioCtx.sampleRate * 0.06);
  const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const src = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  const gain = audioCtx.createGain();
  src.buffer = buffer;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
  src.start();
  src.stop(audioCtx.currentTime + 0.06);
}

// Placeholder for truck horn — Ceca will implement
export function playTruckHorn() {}

export function playGameOverSound() {
  if (!audioCtx) return;
  [440, 330, 220].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}
