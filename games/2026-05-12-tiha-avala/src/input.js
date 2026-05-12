// input.js — slider events (touch+mouse), button handlers

import { playSliderTick, unlockAudioOnGesture } from './audio.js';

// Wires up a single user interaction event to create and unlock AudioContext on iOS
export function wireAudioResume() {
  const unlock = () => {
    unlockAudioOnGesture();
  };
  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
}

// Called from ui.js when slider changes
export function onSliderInput() {
  playSliderTick();
}
