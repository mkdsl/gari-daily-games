import { SYNERGY_DESCRIPTIONS } from '../economy/synergies.js';

/** Render synergy tree into container */
export function updateSynergyTree(container, state) {
  const nodes = ['komposter', 'mulj', 'ekosistem'];

  let html = '<div class="synergy-tree">';
  html += '<div class="synergy-title">🌿 Sinergije</div>';
  html += '<div class="synergy-nodes">';

  for (const key of nodes) {
    const info = SYNERGY_DESCRIPTIONS[key];
    const active = state.synergies[key];
    html += `
      <div class="synergy-node ${active ? 'synergy-active' : 'synergy-locked'}"
           title="${info.desc}\nPotrebno: ${info.req.join(', ')}">
        <div class="syn-icon">${info.icon}</div>
        <div class="syn-name">${info.name}</div>
        <div class="syn-status">${active ? '✓ Aktivno' : '🔒 Neaktivno'}</div>
        <div class="syn-tooltip">
          <p>${info.desc}</p>
          <ul>${info.req.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
      </div>
    `;
  }

  html += '</div></div>';
  container.innerHTML = html;
}
