// ui.js — HUD orchestrator
import { updateHUD } from './ui/hud.js';
import { updateEventFeed, clearFeed } from './ui/event-feed.js';
import { renderVenueSelect } from './ui/venue-select.js';

export function updateRunningUI(state) {
  updateHUD(state);
  updateEventFeed(state);
}

export function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${screenId}`);
  if (target) target.classList.add('active');
}

export { updateEventFeed, clearFeed, renderVenueSelect };
