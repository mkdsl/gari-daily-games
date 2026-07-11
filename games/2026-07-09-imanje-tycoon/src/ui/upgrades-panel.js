import { getBranchUpgrades, purchaseUpgrade } from '../systems/upgrades.js';
import { formatDin, projectUpgradeRevenue } from '../economy/market.js';
import { showProjectionModal } from './modals.js';

/** Render/update upgrades panel for a branch */
export function updateUpgradesPanel(container, state, branch, gameRef) {
  const upgrades = getBranchUpgrades(state, branch);

  // Build HTML
  let html = '';
  for (const up of upgrades) {
    const { ok, reason } = up.canBuy;
    const isAffordable = state.capital >= up.cost || up.cost === 0;
    const statusClass = up.purchased ? 'up-purchased' : (ok ? 'up-available' : 'up-locked');

    html += `
      <div class="upgrade-item ${statusClass}" data-upgrade-id="${up.id}">
        <div class="up-name">${up.name}</div>
        <div class="up-desc">${up.desc}</div>
        <div class="up-footer">
          ${up.purchased
            ? '<span class="up-done">✓ Kupljeno</span>'
            : `<span class="up-cost ${isAffordable && ok ? '' : 'up-cost-low'}">${up.cost === 0 ? 'Besplatno' : formatDin(up.cost)}</span>
               ${ok
                 ? `<button class="up-buy-btn action-btn" data-upgrade="${up.id}">Kupi</button>`
                 : `<span class="up-reason">${reason}</span>`
               }`
          }
        </div>
      </div>
    `;
  }

  if (html === '') {
    html = '<div class="up-empty">Svi upgradi za ovu granu su kupljeni! 🏆</div>';
  }

  container.innerHTML = html;

  // Bind buy buttons
  container.querySelectorAll('.up-buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const upgradeId = btn.getAttribute('data-upgrade');
      const up = upgrades.find(u => u.id === upgradeId);
      if (!up) return;

      // Show projection modal for upgrades > 5000 din
      if (up.cost > 5000) {
        const proj = projectUpgradeRevenue(state, up);
        showProjectionModal(proj, up.name,
          () => executePurchase(state, upgradeId, gameRef, container, branch),
          () => {}
        );
      } else {
        executePurchase(state, upgradeId, gameRef, container, branch);
      }
    });
  });
}

function executePurchase(state, upgradeId, gameRef, container, branch) {
  const result = purchaseUpgrade(state, upgradeId, gameRef?.audio);
  if (result.success) {
    import('./modals.js').then(({ showToast }) => {
      const up = getBranchUpgrades(state, branch).find(u => u.id === upgradeId);
      showToast(`✓ Kupljeno: ${up?.name || upgradeId}`);
    });
    // Re-render upgrades
    updateUpgradesPanel(container, state, branch, gameRef);
  } else {
    import('./modals.js').then(({ showToast }) => {
      showToast(`⚠️ ${result.reason}`);
    });
  }
}
