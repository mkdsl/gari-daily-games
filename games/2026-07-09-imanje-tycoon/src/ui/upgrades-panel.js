import { getBranchUpgrades, purchaseUpgrade } from '../systems/upgrades.js';
import { formatDin, projectUpgradeRevenue } from '../economy/market.js';
import { showProjectionModal } from './modals.js';

// ─── Synergy hints ────────────────────────────────────────────────────────────

const SYNERGY_HINTS = {
  // Mushroom upgrades
  M1: null,
  M2: null,
  M3: '🌿 J3+P6+Patke → Komposter sinergija (+25% spawn)',
  M4: null,
  M5: null,
  M6: null,
  M7: null,
  M8: null,
  // Greenhouse upgrades
  P1: null,
  P2: null,
  P3: null,
  P4: null,
  P5: null,
  P6: '🌿 J3+P6+Patke → Komposter sinergija (+25% spawn)',
  P7: null,
  P8: null,
  // Fishpond / Jezero upgrades
  J1: null,
  J2: '🐡 Otključava Smuđ (1200 din/kg) + Polikultura yield',
  J3: '🌿 J3+P6+Patke → Komposter sinergija (+25% spawn)',
  J4: null,
  J5: '💧 J5 → Mulj sinergija (+30% plastenik yield)',
  J6: null,
  J7: null,
  J8: '🍽️ Restoran minimum narudžba za Smuđa',
};

// Upgrade category descriptions per branch
const BRANCH_INTRO = {
  mushrooms: 'Povećaj prinos blokova, spawn ratio i inokulacija bonuse.',
  greenhouse: 'Proširi površinu, ubrzo cikluse i dodaj mikrobiljke.',
  fishpond:   'Otključaj Smuđa, patke, proširuj jezero i aktiviraj sinergije.',
};

// ─── Main update ──────────────────────────────────────────────────────────────

/** Render/update upgrades panel for a branch */
export function updateUpgradesPanel(container, state, branch, gameRef) {
  const upgrades = getBranchUpgrades(state, branch);
  if (!upgrades || upgrades.length === 0) {
    container.innerHTML = '<div class="up-empty">Nema upgradova za ovu granu.</div>';
    return;
  }

  const purchased = upgrades.filter(u => u.purchased);
  const available = upgrades.filter(u => !u.purchased && u.canBuy?.ok);
  const locked = upgrades.filter(u => !u.purchased && !u.canBuy?.ok);

  let html = '';

  // Branch intro
  if (BRANCH_INTRO[branch]) {
    html += `<div class="up-branch-intro">${BRANCH_INTRO[branch]}</div>`;
  }

  // Available upgrades
  if (available.length > 0) {
    html += `<div class="up-category-header">Dostupno (${available.length})</div>`;
    for (const up of available) {
      html += buildUpgradeItem(up, state, branch, 'up-available');
    }
  }

  // Locked upgrades (show next 3 only, collapsed rest)
  if (locked.length > 0) {
    html += `<div class="up-category-header up-cat-locked">Zaključano (${locked.length})</div>`;
    const shown = locked.slice(0, 3);
    const hidden = locked.slice(3);
    for (const up of shown) {
      html += buildUpgradeItem(up, state, branch, 'up-locked');
    }
    if (hidden.length > 0) {
      html += `<div class="up-more-locked" data-hidden-count="${hidden.length}">
        <button class="small-btn up-show-more-btn">+ prikaži još ${hidden.length}</button>
      </div>`;
      for (const up of hidden) {
        html += buildUpgradeItem(up, state, branch, 'up-locked up-hidden-item', true);
      }
    }
  }

  // Purchased upgrades (collapsed summary)
  if (purchased.length > 0) {
    html += `
      <div class="up-purchased-section">
        <div class="up-category-header up-cat-purchased">
          <button class="up-toggle-purchased small-btn" data-open="false">
            ✓ Kupljeno (${purchased.length}) ▼
          </button>
        </div>
        <div class="up-purchased-list" style="display:none">
          ${purchased.map(up => buildPurchasedSummary(up)).join('')}
        </div>
      </div>`;
  }

  if (available.length === 0 && locked.length === 0 && purchased.length > 0) {
    html += '<div class="up-all-done">🏆 Svi upgradi kupljeni!</div>';
  }

  container.innerHTML = html;
  bindUpgradeEvents(container, state, branch, gameRef, upgrades);
}

// ─── Item builders ────────────────────────────────────────────────────────────

function buildUpgradeItem(up, state, branch, statusClass, hidden = false) {
  const isAffordable = state.capital >= up.cost || up.cost === 0;
  const breakeven = estimateBreakeven(up, state, branch);
  const synergyHint = SYNERGY_HINTS[up.id];
  const depHint = getDependencyHint(up);

  return `
    <div class="upgrade-item ${statusClass}" data-upgrade-id="${up.id}" ${hidden ? 'style="display:none"' : ''}>
      <div class="up-header">
        <span class="up-name">${up.name}</span>
        ${up.cost > 0 ? `<span class="up-cost-badge ${isAffordable && up.canBuy?.ok ? 'cost-ok' : 'cost-low'}">${formatDin(up.cost)}</span>` : ''}
      </div>
      <div class="up-desc">${up.desc}</div>
      ${synergyHint ? `<div class="up-synergy-hint">${synergyHint}</div>` : ''}
      ${depHint ? `<div class="up-dep-hint muted">${depHint}</div>` : ''}
      ${breakeven ? `<div class="up-breakeven">Povrat: ~${breakeven}</div>` : ''}
      <div class="up-footer">
        ${up.canBuy?.ok
          ? `<button class="up-buy-btn action-btn ${isAffordable ? 'btn-ready' : ''}"
               data-upgrade="${up.id}"
               ${!isAffordable ? 'disabled title="Nedovoljno kapitala"' : ''}>
               ${isAffordable ? 'Kupi' : `Treba još ${formatDin(up.cost - state.capital)}`}
             </button>`
          : `<span class="up-reason">🔒 ${up.canBuy?.reason || 'Zaključano'}</span>`
        }
      </div>
    </div>
  `;
}

function buildPurchasedSummary(up) {
  return `
    <div class="up-purchased-item">
      <span class="up-purchased-check">✓</span>
      <span class="up-purchased-name">${up.name}</span>
      <span class="up-purchased-cost muted">${up.cost > 0 ? formatDin(up.cost) : 'besplatno'}</span>
    </div>`;
}

// ─── Breakeven estimator ──────────────────────────────────────────────────────

/**
 * Estimate breakeven period for an upgrade.
 * Returns a human-readable string like "2 sezone" or "~6 sez" or null.
 */
function estimateBreakeven(up, state, branch) {
  if (!up.cost || up.cost === 0) return null;
  if (up.purchased) return null;

  // Try projectUpgradeRevenue if available
  try {
    const proj = projectUpgradeRevenue(state, up);
    if (proj && proj.additionalRevenuePerSeason > 0) {
      const seasons = Math.ceil(up.cost / proj.additionalRevenuePerSeason);
      if (seasons <= 1) return '< 1 sezona';
      if (seasons <= 20) return `~${seasons} sez`;
      return '> 20 sez';
    }
  } catch (_) {}

  // Fallback heuristics based on upgrade ID prefixes
  const id = up.id;
  let addRevEstimate = 0;

  if (branch === 'mushrooms') {
    // Mushroom upgrades typically add ~200-800 din/season
    if (id === 'M1') addRevEstimate = 300;
    else if (id === 'M2') addRevEstimate = 600;
    else if (id === 'M3') addRevEstimate = 800; // Komposter path
    else if (id === 'M4') addRevEstimate = 1200;
    else if (id === 'M5') addRevEstimate = 1000;
    else if (id === 'M6') addRevEstimate = 2000;
    else if (id === 'M7') addRevEstimate = 1500;
    else if (id === 'M8') addRevEstimate = 3000;
    else addRevEstimate = 500;
  } else if (branch === 'greenhouse') {
    if (id === 'P1') addRevEstimate = 500;
    else if (id === 'P2') addRevEstimate = 1200;
    else if (id === 'P3') addRevEstimate = 800;
    else if (id === 'P4') addRevEstimate = 2000;
    else if (id === 'P5') addRevEstimate = 3000;
    else if (id === 'P6') addRevEstimate = 1500; // Komposter path
    else if (id === 'P7') addRevEstimate = 4000;
    else if (id === 'P8') addRevEstimate = 5000;
    else addRevEstimate = 1000;
  } else if (branch === 'fishpond') {
    if (id === 'J1') addRevEstimate = 800;
    else if (id === 'J2') addRevEstimate = 5000; // Smuđ unlock
    else if (id === 'J3') addRevEstimate = 1500; // Komposter path
    else if (id === 'J4') addRevEstimate = 2000;
    else if (id === 'J5') addRevEstimate = 4000; // Mulj synergy
    else if (id === 'J6') addRevEstimate = 3000;
    else if (id === 'J7') addRevEstimate = 4500;
    else if (id === 'J8') addRevEstimate = 6000;
    else addRevEstimate = 2000;
  }

  if (addRevEstimate <= 0) return null;
  const seasons = Math.ceil(up.cost / addRevEstimate);
  if (seasons <= 1) return '< 1 sezona';
  if (seasons <= 20) return `~${seasons} sez`;
  return null;
}

/** Get dependency chain hint */
function getDependencyHint(up) {
  if (!up.canBuy?.reason) return null;
  const reason = up.canBuy.reason;
  // If the reason mentions a previous upgrade, show it as a dep hint
  if (reason.includes('Treba') || reason.includes('najpre') || reason.includes('before') || reason.includes('zahteva')) {
    return `⬆ ${reason}`;
  }
  return null;
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindUpgradeEvents(container, state, branch, gameRef, upgrades) {
  // Buy buttons
  container.querySelectorAll('.up-buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const upgradeId = btn.getAttribute('data-upgrade');
      const up = upgrades.find(u => u.id === upgradeId);
      if (!up) return;

      if (btn.disabled) return;

      // Show projection modal for upgrades > 5000 din
      if (up.cost > 5000) {
        try {
          const proj = projectUpgradeRevenue(state, up);
          showProjectionModal(proj, up.name,
            () => executePurchase(state, upgradeId, gameRef, container, branch, upgrades),
            () => {}
          );
        } catch (_) {
          executePurchase(state, upgradeId, gameRef, container, branch, upgrades);
        }
      } else {
        executePurchase(state, upgradeId, gameRef, container, branch, upgrades);
      }
    });
  });

  // Toggle purchased section
  const toggleBtn = container.querySelector('.up-toggle-purchased');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.getAttribute('data-open') === 'true';
      const list = container.querySelector('.up-purchased-list');
      if (list) list.style.display = isOpen ? 'none' : 'block';
      toggleBtn.setAttribute('data-open', String(!isOpen));
      const purchased = upgrades.filter(u => u.purchased);
      toggleBtn.textContent = `✓ Kupljeno (${purchased.length}) ${isOpen ? '▼' : '▲'}`;
    });
  }

  // Show more locked upgrades
  const showMoreBtn = container.querySelector('.up-show-more-btn');
  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
      const hiddenItems = container.querySelectorAll('.up-hidden-item');
      hiddenItems.forEach(item => { item.style.display = ''; });
      showMoreBtn.closest('.up-more-locked').style.display = 'none';
    });
  }
}

function executePurchase(state, upgradeId, gameRef, container, branch, upgrades) {
  const result = purchaseUpgrade(state, upgradeId, gameRef?.audio);
  if (result.success) {
    import('./modals.js').then(({ showToast }) => {
      const up = upgrades.find(u => u.id === upgradeId);
      const synergyHint = SYNERGY_HINTS[upgradeId];
      const msg = synergyHint
        ? `✅ Kupljeno: ${up?.name || upgradeId}\n${synergyHint}`
        : `✅ Kupljeno: ${up?.name || upgradeId}`;
      showToast(msg);
    });
    // Re-render upgrades panel
    updateUpgradesPanel(container, state, branch, gameRef);
  } else {
    import('./modals.js').then(({ showToast }) => {
      showToast(`⚠️ ${result.reason || 'Ne može se kupiti.'}`);
    });
  }
}

// ─── Summary helpers (exported for macro panel use) ───────────────────────────

/**
 * Get total invested capital across all branches.
 * @param {object} state
 * @param {string[]} [branches] defaults to all
 */
export function getTotalUpgradeInvestment(state, branches = ['mushrooms', 'greenhouse', 'fishpond']) {
  let total = 0;
  for (const branch of branches) {
    try {
      const upgrades = getBranchUpgrades(state, branch);
      for (const up of upgrades) {
        if (up.purchased && up.cost > 0) total += up.cost;
      }
    } catch (_) {}
  }
  return total;
}

/**
 * Get next recommended upgrade for a branch (cheapest available).
 * @param {object} state
 * @param {string} branch
 */
export function getNextRecommendedUpgrade(state, branch) {
  try {
    const upgrades = getBranchUpgrades(state, branch);
    const available = upgrades.filter(u => !u.purchased && u.canBuy?.ok);
    if (available.length === 0) return null;
    // Sort by cost ascending (cheapest first)
    available.sort((a, b) => a.cost - b.cost);
    return available[0];
  } catch (_) {
    return null;
  }
}

/**
 * Check if a specific upgrade has been purchased.
 * @param {object} state
 * @param {string} upgradeId
 */
export function isUpgradePurchased(state, upgradeId) {
  return (state.purchasedUpgrades || []).includes(upgradeId);
}

/**
 * Count total purchased upgrades across all branches.
 * @param {object} state
 */
export function countPurchasedUpgrades(state) {
  return (state.purchasedUpgrades || []).length;
}
