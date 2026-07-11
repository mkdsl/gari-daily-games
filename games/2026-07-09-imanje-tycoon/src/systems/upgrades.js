import { GAME_CONFIG } from '../config.js';
import { addMushroomBlock } from '../economy/mushrooms.js';

export const UPGRADES = [
  // --- PEČURKE ---
  { id: 'P1', branch: 'mushrooms', name: 'Drugi blok', cost: 1600, phaseReq: '0',
    desc: '+1 blok bukovača (kapacitet ×2)',
    apply(state) {
      state.mushrooms.maxBlocks = 2;
      addMushroomBlock(state, 'bukovaca');
    }
  },
  { id: 'P2', branch: 'mushrooms', name: 'Kontrola vlažnosti', cost: 2400, phaseReq: '0',
    desc: 'Spawn ratio +20%',
    apply(state) { state.mushrooms.spawnRatioBonus += 0.20; }
  },
  { id: 'P3', branch: 'mushrooms', name: 'Oyster upgrade', cost: 3500, phaseReq: 'A',
    desc: 'Otključava oyster blokove (700 din/kg)',
    apply(state) { state.mushrooms.oysterUnlocked = true; }
  },
  { id: 'P4', branch: 'mushrooms', name: 'Blok ×3', cost: 5000, phaseReq: 'A',
    desc: 'Ukupan kapacitet 3 bloka',
    apply(state) {
      state.mushrooms.maxBlocks = 3;
      // Add block if space
      addMushroomBlock(state, state.mushrooms.oysterUnlocked ? 'oyster' : 'bukovaca');
    }
  },
  { id: 'P5', branch: 'mushrooms', name: 'Ubrzani talas', cost: 8000, phaseReq: 'A',
    desc: 'Ciklus −15% (brža inkubacija)',
    apply(_state) { /* wave speed handled in getWaveDuration() via purchasedUpgrades check */ }
  },
  { id: 'P6', branch: 'mushrooms', name: 'Komposter input', cost: 12000, phaseReq: 'B',
    desc: '+25% spawn ratio (Komposter sinergija uz J3)',
    apply(_state) { /* checked in synergies.js — aktivira Komposter */ }
  },
  { id: 'P7', branch: 'mushrooms', name: 'Blok ×5', cost: 20000, phaseReq: 'B',
    desc: 'Ukupan kapacitet 5 blokova',
    apply(state) {
      state.mushrooms.maxBlocks = 5;
      while (state.mushrooms.blocks.length < 5) {
        addMushroomBlock(state, state.mushrooms.oysterUnlocked ? 'oyster' : 'bukovaca');
      }
    }
  },
  { id: 'P8', branch: 'mushrooms', name: 'Masterclass inokulacija', cost: 45000, phaseReq: 'C',
    desc: 'Spawn ratio ×1.4 (±40% adicija)',
    apply(state) { state.mushrooms.spawnRatioBonus += 0.40; }
  },

  // --- PLASTENIK ---
  { id: 'T1', branch: 'greenhouse', name: 'Proširenje +20m²', cost: 8000, phaseReq: '0',
    reqBranch: 'greenhouse',
    desc: 'Area 20→40m²',
    apply(state) { state.greenhouse.maxAreaM2 = 40; state.greenhouse.areaM2 = 40; }
  },
  { id: 'T2', branch: 'greenhouse', name: 'Kapljično navodnjavanje', cost: 6000, phaseReq: '0',
    reqBranch: 'greenhouse',
    desc: 'Yield +15%, suša −30% penalizacija',
    apply(state) { state.greenhouse.yieldBonus += 0.15; }
  },
  { id: 'T3', branch: 'greenhouse', name: 'Mikrobiljke linija', cost: 4000, phaseReq: 'A',
    reqBranch: 'greenhouse',
    desc: 'Otključava mikrobiljke ciklus (1.000 din/kg, 14s ciklus)',
    apply(_state) { /* mikrobiljke opcija dostupna u UI kad T3 kupljeno */ }
  },
  { id: 'T4', branch: 'greenhouse', name: 'Proširenje +40m²', cost: 18000, phaseReq: 'A',
    reqBranch: 'greenhouse',
    desc: 'Area 40→80m²',
    apply(state) { state.greenhouse.maxAreaM2 = 80; state.greenhouse.areaM2 = 80; }
  },
  { id: 'T5', branch: 'greenhouse', name: 'Toplinska pumpa', cost: 22000, phaseReq: 'B',
    reqBranch: 'greenhouse',
    desc: 'Paradajz ciklus −20% (brže sazreva)',
    apply(_state) { /* PLASTENIK_PARADAJZ_SEC × 0.80 via purchasedUpgrades check in getCycleDuration */ }
  },
  { id: 'T6', branch: 'greenhouse', name: 'Mulj đubrivo link', cost: 0, phaseReq: 'B',
    reqBranch: 'greenhouse',
    desc: '+30% yield (aktivira se automatski uz J5 Mulj sistem)',
    apply(_state) { /* auto via synergies.js ako J5 kupljeno */ }
  },
  { id: 'T7', branch: 'greenhouse', name: 'Proširenje +80m²', cost: 45000, phaseReq: 'B',
    reqBranch: 'greenhouse',
    desc: 'Area 80→160m²',
    apply(state) { state.greenhouse.maxAreaM2 = 160; state.greenhouse.areaM2 = 160; }
  },
  { id: 'T8', branch: 'greenhouse', name: 'Pametni senzori', cost: 80000, phaseReq: 'C',
    reqBranch: 'greenhouse',
    desc: 'Auto-harvest + yield +10%',
    apply(state) { state.greenhouse.yieldBonus += 0.10; }
  },

  // --- JEZERO ---
  { id: 'J1', branch: 'fishpond', name: 'Aeracija pumpa', cost: 12000, phaseReq: 'B',
    reqBranch: 'fishpond',
    desc: 'Stocking density +20%, brži rast',
    apply(_state) { /* density bonus handled in getFishGrowthPerSec() */ }
  },
  { id: 'J2', branch: 'fishpond', name: 'Smuđ nasad', cost: 8000, phaseReq: 'B',
    reqBranch: 'fishpond',
    desc: 'Otključava smuđ (1.200 din/kg)',
    apply(_state) { /* smudj opcija u UI */ }
  },
  { id: 'J3', branch: 'fishpond', name: 'Patke (5 kom)', cost: 3500, phaseReq: 'B',
    reqBranch: 'fishpond',
    desc: '+33 jaja/mesec, deo Komposter sinergije',
    apply(state) { state.fishpond.ducks = 5; }
  },
  { id: 'J4', branch: 'fishpond', name: 'Proširenje +100m²', cost: 25000, phaseReq: 'B',
    reqBranch: 'fishpond',
    desc: 'Area 200→300m²',
    apply(state) { state.fishpond.maxAreaM2 = 300; state.fishpond.areaM2 = 300; }
  },
  { id: 'J5', branch: 'fishpond', name: 'Mulj sistem', cost: 18000, phaseReq: 'B',
    reqBranch: 'fishpond',
    desc: 'Otključava Mulj sinergiju za Plastenik +30% yield',
    apply(_state) { /* synergies.js checks J5 */ }
  },
  { id: 'J6', branch: 'fishpond', name: 'Patke ×3 (15 kom)', cost: 9000, phaseReq: 'C',
    reqBranch: 'fishpond',
    desc: '+100 jaja/mesec, Komposter ×2 efekat',
    apply(state) { state.fishpond.ducks = 15; }
  },
  { id: 'J7', branch: 'fishpond', name: 'Proširenje +200m²', cost: 55000, phaseReq: 'C',
    reqBranch: 'fishpond',
    desc: 'Area 300→500m²',
    apply(state) { state.fishpond.maxAreaM2 = 500; state.fishpond.areaM2 = 500; }
  },
  { id: 'J8', branch: 'fishpond', name: 'Premium kanal (restoran direktno)', cost: 35000, phaseReq: 'C',
    reqBranch: 'fishpond',
    desc: 'Smuđ automatski dobija restoran multiplijer (1.55×) na svim kanalima',
    apply(_state) { /* market.js checks J8 */ }
  },
];

/** Get upgrade by id */
export function getUpgrade(id) {
  return UPGRADES.find(u => u.id === id) || null;
}

/** Check if upgrade can be purchased */
export function canPurchaseUpgrade(state, upgradeId) {
  const up = getUpgrade(upgradeId);
  if (!up) return { ok: false, reason: 'Nepoznat upgrade.' };
  if (state.purchasedUpgrades.includes(upgradeId)) {
    return { ok: false, reason: 'Već kupljeno.' };
  }

  // Phase check
  const phaseOrder = ['0', 'A', 'B', 'C'];
  const currentPhaseIdx = phaseOrder.indexOf(state.phase);
  const reqPhaseIdx = phaseOrder.indexOf(up.phaseReq);
  if (currentPhaseIdx < reqPhaseIdx) {
    return { ok: false, reason: `Zahteva Fazu ${up.phaseReq}.` };
  }

  // Branch unlock check
  if (up.reqBranch) {
    if (up.reqBranch === 'greenhouse' && !state.greenhouse.unlocked) {
      return { ok: false, reason: 'Plastenik nije otključan.' };
    }
    if (up.reqBranch === 'fishpond' && !state.fishpond.unlocked) {
      return { ok: false, reason: 'Jezero nije otključano.' };
    }
  }

  // Capital check (T6 is free but requires J5)
  if (up.cost > 0 && state.capital < up.cost) {
    return { ok: false, reason: `Nedovoljno kapitala (${up.cost} din).` };
  }

  // T6 requires J5
  if (upgradeId === 'T6' && !state.purchasedUpgrades.includes('J5')) {
    return { ok: false, reason: 'Zahteva Mulj sistem (J5).' };
  }

  return { ok: true };
}

/** Purchase an upgrade */
export function purchaseUpgrade(state, upgradeId, audio) {
  const check = canPurchaseUpgrade(state, upgradeId);
  if (!check.ok) return { success: false, reason: check.reason };

  const up = getUpgrade(upgradeId);
  if (!up) return { success: false, reason: 'Nepoznat upgrade.' };

  if (up.cost > 0) state.capital -= up.cost;
  state.purchasedUpgrades.push(upgradeId);
  up.apply(state);

  if (audio) audio.playSfx('purchase');
  return { success: true };
}

/** Get upgrades available for a branch (not purchased, phase ok, branch ok) */
export function getAvailableUpgrades(state, branch) {
  return UPGRADES.filter(u => {
    if (u.branch !== branch) return false;
    if (state.purchasedUpgrades.includes(u.id)) return false;
    return true;
  });
}

/** Get all upgrades for a branch with purchase status */
export function getBranchUpgrades(state, branch) {
  return UPGRADES.filter(u => u.branch === branch).map(u => ({
    ...u,
    purchased: state.purchasedUpgrades.includes(u.id),
    canBuy: canPurchaseUpgrade(state, u.id),
  }));
}
