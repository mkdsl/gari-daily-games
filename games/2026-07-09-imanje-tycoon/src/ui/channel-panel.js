import { GAME_CONFIG, } from '../config.js';
import { formatDin, unlockChannel } from '../economy/market.js';

let initialized = false;

/** Render/update channel panel inside container */
export function updateChannelPanel(container, state, gameRef) {
  if (!initialized || container.dataset.chInit !== '1') {
    container.innerHTML = buildChannelPanel(state);
    container.dataset.chInit = '1';
    initialized = true;
    bindChannelEvents(container, state, gameRef);
    return;
  }

  // Just update values
  const channels = ['direktna', 'pijaca', 'restoran', 'online'];
  for (const ch of channels) {
    const slider = container.querySelector(`[data-channel="${ch}"]`);
    const valueEl = container.querySelector(`[data-ch-val="${ch}"]`);
    if (slider && !slider.matches(':active')) {
      slider.value = state.channels[ch] || 0;
    }
    if (valueEl) valueEl.textContent = `${state.channels[ch] || 0}%`;
  }

  // Update unlock buttons
  const pijacaBtn = container.querySelector('[data-unlock="pijaca"]');
  if (pijacaBtn) {
    const unlocked = state.unlockedChannels.includes('pijaca');
    pijacaBtn.textContent = unlocked ? '✓ Pijaca' : `Otključaj Pijaca (${formatDin(GAME_CONFIG.CHANNEL_COSTS.pijaca)})`;
    pijacaBtn.disabled = unlocked || state.capital < GAME_CONFIG.CHANNEL_COSTS.pijaca;
  }
  const restoranBtn = container.querySelector('[data-unlock="restoran"]');
  if (restoranBtn) {
    const unlocked = state.unlockedChannels.includes('restoran');
    restoranBtn.textContent = unlocked ? '✓ Restoran' : `Otključaj Restoran (${formatDin(GAME_CONFIG.CHANNEL_COSTS.restoran)})`;
    restoranBtn.disabled = unlocked || state.capital < GAME_CONFIG.CHANNEL_COSTS.restoran;
  }
  const onlineBtn = container.querySelector('[data-unlock="online"]');
  if (onlineBtn) {
    const unlocked = state.unlockedChannels.includes('online');
    onlineBtn.textContent = unlocked ? '✓ Online' : `Otključaj Online (${formatDin(GAME_CONFIG.CHANNEL_COSTS.online)})`;
    onlineBtn.disabled = unlocked || state.capital < GAME_CONFIG.CHANNEL_COSTS.online;
  }

  // Channel row visibility
  ['pijaca', 'restoran', 'online'].forEach(ch => {
    const row = container.querySelector(`[data-ch-row="${ch}"]`);
    if (row) {
      row.style.display = state.unlockedChannels.includes(ch) ? '' : 'none';
    }
  });
}

function buildChannelPanel(state) {
  const chMulti = GAME_CONFIG.CHANNEL_MULTIPLIERS;
  return `
    <div class="channel-panel">
      <div class="channel-row" data-ch-row="direktna">
        <span class="ch-label">🏠 Direktna <small>(${chMulti.direktna}×)</small></span>
        <input type="range" class="ch-slider" data-channel="direktna"
          min="0" max="100" step="5" value="${state.channels.direktna || 0}">
        <span class="ch-val" data-ch-val="direktna">${state.channels.direktna || 0}%</span>
      </div>
      <div class="channel-row ${state.unlockedChannels.includes('pijaca') ? '' : 'hidden'}" data-ch-row="pijaca">
        <span class="ch-label">🛒 Pijaca <small>(${chMulti.pijaca}×)</small></span>
        <input type="range" class="ch-slider" data-channel="pijaca"
          min="0" max="100" step="5" value="${state.channels.pijaca || 0}">
        <span class="ch-val" data-ch-val="pijaca">${state.channels.pijaca || 0}%</span>
      </div>
      <div class="channel-row ${state.unlockedChannels.includes('restoran') ? '' : 'hidden'}" data-ch-row="restoran">
        <span class="ch-label">🍽️ Restoran <small>(${chMulti.restoran}×)</small></span>
        <input type="range" class="ch-slider" data-channel="restoran"
          min="0" max="100" step="5" value="${state.channels.restoran || 0}">
        <span class="ch-val" data-ch-val="restoran">${state.channels.restoran || 0}%</span>
      </div>
      <div class="channel-row ${state.unlockedChannels.includes('online') ? '' : 'hidden'}" data-ch-row="online">
        <span class="ch-label">💻 Online <small>(${chMulti.online}×)</small></span>
        <input type="range" class="ch-slider" data-channel="online"
          min="0" max="100" step="5" value="${state.channels.online || 0}">
        <span class="ch-val" data-ch-val="online">${state.channels.online || 0}%</span>
      </div>
      <div class="channel-unlocks">
        <button class="small-btn ch-unlock-btn" data-unlock="pijaca"
          ${state.unlockedChannels.includes('pijaca') ? 'disabled' : ''}>
          ${state.unlockedChannels.includes('pijaca') ? '✓ Pijaca' : `Otključaj Pijaca (${formatDin(GAME_CONFIG.CHANNEL_COSTS.pijaca)})`}
        </button>
        <button class="small-btn ch-unlock-btn" data-unlock="restoran"
          ${state.unlockedChannels.includes('restoran') ? 'disabled' : ''}>
          ${state.unlockedChannels.includes('restoran') ? '✓ Restoran' : `Otključaj Restoran (${formatDin(GAME_CONFIG.CHANNEL_COSTS.restoran)})`}
        </button>
        <button class="small-btn ch-unlock-btn" data-unlock="online"
          ${state.unlockedChannels.includes('online') ? 'disabled' : ''}>
          ${state.unlockedChannels.includes('online') ? '✓ Online' : `Otključaj Online (${formatDin(GAME_CONFIG.CHANNEL_COSTS.online)})`}
        </button>
      </div>
      <div id="channel-total" class="channel-total-warning"></div>
    </div>
  `;
}

function bindChannelEvents(container, state, gameRef) {
  // Sliders: adjust channel %
  container.addEventListener('input', (e) => {
    const slider = e.target.closest('.ch-slider');
    if (!slider) return;
    const ch = slider.getAttribute('data-channel');
    const newVal = parseInt(slider.value, 10);
    const oldVal = state.channels[ch] || 0;
    const diff = newVal - oldVal;

    // Try to absorb diff from direktna
    const direktnaNew = (state.channels.direktna || 0) - diff;
    if (direktnaNew < 0) {
      // Can't go negative
      slider.value = oldVal;
      return;
    }
    state.channels[ch] = newVal;
    state.channels.direktna = direktnaNew;

    // Update val display
    const valEl = container.querySelector(`[data-ch-val="${ch}"]`);
    if (valEl) valEl.textContent = `${newVal}%`;
    const dirVal = container.querySelector('[data-ch-val="direktna"]');
    if (dirVal) dirVal.textContent = `${direktnaNew}%`;
    const dirSlider = container.querySelector('[data-channel="direktna"]');
    if (dirSlider) dirSlider.value = direktnaNew;

    // Warn if total != 100
    const total = Object.values(state.channels).reduce((s, v) => s + v, 0);
    const warningEl = container.querySelector('#channel-total');
    if (warningEl) {
      if (Math.abs(total - 100) > 1) {
        warningEl.textContent = `⚠️ Ukupno: ${total}% (treba biti 100%)`;
      } else {
        warningEl.textContent = '';
      }
    }
  });

  // Unlock buttons
  container.addEventListener('click', (e) => {
    const unlockBtn = e.target.closest('.ch-unlock-btn');
    if (!unlockBtn) return;
    const ch = unlockBtn.getAttribute('data-unlock');
    const result = unlockChannel(state, ch);
    if (result) {
      initialized = false;
      updateChannelPanel(container, state, gameRef);
      import('./modals.js').then(({ showToast }) => {
        showToast(`✓ Kanal "${ch}" otključan!`);
      });
    } else {
      import('./modals.js').then(({ showToast }) => {
        showToast('⚠️ Nije moguće otključati kanal.');
      });
    }
  });
}
