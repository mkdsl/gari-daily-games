// ui/synergy-display.js — Synergy pairs display during resolve

/**
 * Show active synergy pairs one by one in #synergy-display-area.
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

  let idx = 0;

  function showNext() {
    if (idx >= pairs.length) {
      setTimeout(onDone, 400);
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
