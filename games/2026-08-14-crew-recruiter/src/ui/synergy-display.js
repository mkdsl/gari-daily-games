// ui/synergy-display.js — Synergy pairs display during resolve

import { recordDiscoveredSynergies, getDiscoveredCount } from '../systems/synergy.js';

const SYNERGY_TOTAL = 10;

/**
 * Show active synergy pairs one by one in #synergy-display-area.
 * Records discoveries and appends "{N}/10 otkriveno" codex tracker on finish.
 * @param {import('../systems/synergy.js').ActivePair[]} pairs
 * @param {() => void} onDone - called when all pairs have been shown
 */
export function showSynergyPairs(pairs, onDone) {
  const area = document.getElementById('synergy-display-area');
  if (!area) { onDone(); return; }
  area.innerHTML = '';
  area.classList.remove('hidden');

  if (pairs.length === 0) {
    onDone();
    return;
  }

  // Record this round's discoveries
  const discoveredCount = recordDiscoveredSynergies(pairs.map(p => p.key));

  let idx = 0;

  function showNext() {
    if (idx >= pairs.length) {
      // Append codex tracker after all pairs shown
      const tracker = document.createElement('div');
      tracker.className = 'synergy-codex-tracker';
      tracker.textContent = `${discoveredCount}/${SYNERGY_TOTAL} kombinacija otkriveno`;
      area.appendChild(tracker);
      setTimeout(onDone, 600);
      return;
    }
    const pair = pairs[idx++];
    const el   = document.createElement('div');
    el.className   = 'synergy-pair fade-in';
    el.innerHTML   = `<span class="synergy-name">${pair.name}</span><span class="synergy-bonus">+${pair.bonus}</span>`;
    area.appendChild(el);

    // Pulse on entry
    el.addEventListener('animationend', () => {
      el.classList.remove('fade-in');
      el.classList.add('synergy-pulse');
    }, { once: true });

    setTimeout(showNext, 350);
  }

  showNext();
}

/** Clear synergy display area. */
export function clearSynergyDisplay() {
  const area = document.getElementById('synergy-display-area');
  if (area) {
    area.innerHTML = '';
    area.classList.add('hidden');
  }
}
