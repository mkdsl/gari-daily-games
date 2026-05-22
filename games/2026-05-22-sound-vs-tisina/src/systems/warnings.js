// warnings.js — complaint tracking and shutdown check
import { MAX_COMPLAINTS } from '../config.js';
import { complaintSound } from '../audio.js';

export function triggerComplaint(state) {
  state.complaints++;
  state.sessionStats.complaints++;
  complaintSound();

  // Visual screen shake
  const wrapper = document.getElementById('canvas-wrapper');
  if (wrapper) {
    wrapper.classList.add('screen-shake');
    setTimeout(() => wrapper.classList.remove('screen-shake'), 500);
  }

  // Update complaint dots
  for (let i = 0; i < 3; i++) {
    const dot = document.getElementById(`cdot-${i}`);
    if (dot) {
      dot.classList.toggle('active', i < state.complaints);
    }
  }

  if (state.complaints >= MAX_COMPLAINTS) {
    return true; // trigger shutdown
  }
  return false;
}

export function isShutdown(state) {
  return state.complaints >= MAX_COMPLAINTS;
}
