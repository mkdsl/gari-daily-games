// input.js — slider events (touch+mouse), button handlers

import { playSliderTick, resumeAudio } from './audio.js';

// Wires up a single user interaction event to resume AudioContext
export function wireAudioResume() {
  const resume = () => {
    resumeAudio();
  };
  document.addEventListener('pointerdown', resume, { once: true });
  document.addEventListener('keydown', resume, { once: true });
}

// Called from ui.js when slider changes
export function onSliderInput() {
  playSliderTick();
}
