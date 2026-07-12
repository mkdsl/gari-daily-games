import { showAchievementToast } from '../ui/modals.js';

export const ACHIEVEMENTS = [
  { id: 'A1', name: 'Prva berba', trigger: 'mushroom_revenue', value: 1000,
    reward: { capital: 500 },
    edu: 'Bukovača raste na piljevini jer joj celuloza daje ugljenik koji pretvara u proteine.' },
  { id: 'A2', name: 'Talas majstor', trigger: 'inokulacija_streak', value: 10,
    reward: { waveCycleBonus: -0.05 },
    edu: 'Pečurke inokulisane u pravo vreme razvijaju čvršći micelij.' },
  { id: 'A3', name: 'Oyster pioneer', trigger: 'oyster_revenue', value: 5000,
    reward: { spawnRatio: 0.05 },
    edu: 'Oyster pečurke čiste zaraženu piljevinu razgrađujući teške molekule.' },
  { id: 'A4', name: 'Zeleni krov', trigger: 'greenhouse_unlocked', value: true,
    reward: { channelBonus: 0.05 },
    edu: 'Plastenik produži sezonu 2-3 meseca i štiti od mraza bez grejanja.' },
  { id: 'A5', name: 'Kap po kap', trigger: 'upgrade_purchased', value: 'T2',
    reward: { droughtSeverity: -0.30 },
    edu: 'Kapljično navodnjavanje troši 30-50% manje vode od zalivanja po krošnji.' },
  { id: 'A6', name: 'Mikrobiljka manija', trigger: 'micro_harvested', value: 100,
    reward: { microPrice: 100 },
    edu: 'Mikrobiljke imaju 4-40× više vitamina od odraslih biljaka.' },
  { id: 'A7', name: 'Paradajz kralj', trigger: 'tomato_harvested', value: 1000,
    reward: { greenhouseYield: 0.05 },
    edu: 'Paradajz u plastenicima na jugu Srbije znači 3 meseca duže sezone.' },
  { id: 'A8', name: 'Jezero aktivno', trigger: 'fishpond_unlocked', value: true,
    reward: { aerationCostDiscount: 0.20 },
    edu: 'Biološka filtracija u ribnjaku počinje od prvog dana.' },
  { id: 'A9', name: 'Smuđ gastro', trigger: 'smudj_harvested', value: 500,
    reward: { restaurantCapacity: 100 },
    edu: 'Smuđ dostiže prodajnu masu od ~500g za 18-24 meseca.' },
  { id: 'A10', name: 'Pačje prisustvo', trigger: 'upgrade_purchased', value: 'J3',
    reward: { komposterBonus: 0.05 },
    edu: 'Patke konzumiraju 200-300g invertebrata dnevno — organska kontrola insekata.' },
  { id: 'A11', name: 'Komposter korak', trigger: 'synergy_active', value: 'komposter',
    reward: { spawnRatio: 0.05 },
    edu: 'Komposter od organskog otpada daje supstrat bogat azotom.' },
  { id: 'A12', name: 'Mulj čarolija', trigger: 'synergy_active', value: 'mulj',
    reward: { greenhouseYield: 0.03 },
    edu: 'Ribnjački mulj sadrži fosfor, kalijum i mikroorganizme.' },
  { id: 'A13', name: 'Tri stuba', trigger: 'all_branches_active', value: true,
    reward: { monthlyRevenueCap: 50000 },
    edu: 'Permakultura traži diversifikaciju: 3+ sistema u sinergiji = otpornost.' },
  { id: 'A14', name: 'Sezonski igrač', trigger: 'seasons_completed', value: 4,
    reward: { alumniUnlock: true },
    edu: 'Godišnji ciklus imanja ide od pripreme tla u zimu do prerade u jesen.' },
  { id: 'A15', name: 'Reputacija raste', trigger: 'reputation', value: 1.20,
    reward: { onlineCapacity: 50 },
    edu: 'Lokalna reputacija raste eksponencijalno — 5 zadovoljnih kupaca donosi 25-50 novih.' },
  { id: 'A16', name: 'Masterclass domaćin', trigger: 'masterclass_count', value: 1,
    reward: { masterclassBonus: 500 },
    edu: 'Edukativni eventi na imanjima grade community — "farma kao škola".' },
  { id: 'A17', name: 'Pijaca regularac', trigger: 'pijaca_seasons', value: 3,
    reward: { pijacaMultiplier: 0.05 },
    edu: 'Redovno prisustvo na pijaci gradi lojalnost kupaca.' },
  { id: 'A18', name: 'Online prisutnost', trigger: 'upgrade_purchased', value: 'online_channel',
    reward: { reputation: 0.05 },
    edu: 'Online direktna prodaja eliminiše posrednike koji uzimaju 30-50%.' },
  { id: 'A19', name: 'Prestiž pionir', trigger: 'prestige_count', value: 1,
    reward: { alumniBonus: 0.08 },
    edu: 'Rotacija useva i prestiž ciklus imitiraju prirodni "reset" — tlo odmara.' },
  { id: 'A20', name: 'Veterani tima', trigger: 'workers', value: 3,
    reward: { dailyActions: 3 },
    edu: 'Diversifikovano imanje traži specijalizovane radnike.' },
  { id: 'A21', name: 'Sinergijaš', trigger: 'all_synergies', value: true,
    reward: { allRevenue: 0.05 },
    edu: 'Permakultura: output jednog sistema postaje input drugog — zatvorena petlja.' },
  { id: 'A22', name: 'Ekosistem arhitekta', trigger: 'synergy_active', value: 'ekosistem',
    reward: { reputationCap: 1.75 },
    edu: 'Imanje koje je i škola i proizvođač i community hub je najotpornije.' },
  { id: 'A23', name: 'Guncati duh', trigger: 'prestige_scenario', value: 'avala',
    reward: { touristCapacity: 2.0 },
    edu: 'Guncati model "povratka na selo" je strateška repozicija ka autentičnom iskustvu.' },
  { id: 'A24', name: 'Šaran i smuđ zajedno', trigger: 'fish_polyculture', value: true,
    reward: { stockingDensity: 0.10 },
    edu: 'Polikultura ribe koristi različite zone jezera — bez kompeticije za hranu.' },
  { id: 'A25', name: 'Imanje Tycoon', trigger: 'monthly_revenue', value: 300000,
    reward: { guncatiFrame: true },
    edu: 'Pravo imanje pravi surplus koji se investira u zajednicu — MKDSLend filozofija.' },
];

// ─── Check all achievements ───────────────────────────────────────────────────

/**
 * Check all achievements and unlock newly triggered ones.
 * @param {object} state
 * @param {object|null} audio
 * @param {Function|null} onAchievement
 */
export function checkAchievements(state, audio, onAchievement) {
  for (const ach of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(ach.id)) continue;
    if (checkTrigger(state, ach)) {
      unlockAchievement(state, ach, audio, onAchievement);
    }
  }
}

function checkTrigger(state, ach) {
  switch (ach.trigger) {
    case 'mushroom_revenue':
      return state.mushrooms.revenueEarned >= ach.value;
    case 'inokulacija_streak':
      return (state.mushrooms.inokulacijaStreak || 0) >= ach.value;
    case 'oyster_revenue':
      return (state._oysterRevenue || 0) >= ach.value;
    case 'greenhouse_unlocked':
      return state.greenhouse.unlocked === ach.value;
    case 'upgrade_purchased':
      return state.purchasedUpgrades.includes(ach.value)
        || (ach.value === 'online_channel' && state.unlockedChannels.includes('online'));
    case 'micro_harvested':
      return (state._microHarvestedKg || 0) >= ach.value;
    case 'tomato_harvested':
      return (state.greenhouse.tomato_harvested_kg || 0) >= ach.value;
    case 'fishpond_unlocked':
      return state.fishpond.unlocked === ach.value;
    case 'smudj_harvested':
      return (state.fishpond.smudj_harvested_kg || 0) >= ach.value;
    case 'synergy_active':
      return state.synergies[ach.value] === true;
    case 'all_branches_active':
      return state.mushrooms.unlocked && state.greenhouse.unlocked && state.fishpond.unlocked;
    case 'seasons_completed':
      return state.season >= ach.value;
    case 'reputation':
      return state.reputation >= ach.value;
    case 'masterclass_count':
      return state.masterclassCount >= ach.value;
    case 'pijaca_seasons':
      return (state.greenhouse.pijacaSeasons || 0) >= ach.value;
    case 'prestige_count':
      return state.prestige.count >= ach.value;
    case 'workers':
      return state.workers.hired >= ach.value;
    case 'all_synergies':
      return state.synergies.komposter && state.synergies.mulj && state.synergies.ekosistem;
    case 'prestige_scenario':
      return state.prestige.scenario === ach.value && state.prestige.count >= 1;
    case 'fish_polyculture':
      return state.fishpond.polyculture === true;
    case 'monthly_revenue': {
      const recent = state.monthlyRevenue || [];
      return recent.some(r => r >= ach.value);
    }
    default:
      return false;
  }
}

function unlockAchievement(state, ach, audio, onAchievement) {
  state.unlockedAchievements.push(ach.id);
  applyReward(state, ach.reward);
  if (audio) audio.playSfx('achievement');
  showAchievementToast(ach);
  if (onAchievement) onAchievement(ach);
}

function applyReward(state, reward) {
  if (!reward) return;
  if (!state.achievementBonuses) state.achievementBonuses = {};

  if (reward.capital) state.capital += reward.capital;
  if (reward.spawnRatio) {
    state.achievementBonuses.spawnRatio = (state.achievementBonuses.spawnRatio || 0) + reward.spawnRatio;
    state.mushrooms.spawnRatioBonus = (state.mushrooms.spawnRatioBonus || 0) + reward.spawnRatio;
  }
  if (reward.greenhouseYield) {
    state.achievementBonuses.greenhouseYield = (state.achievementBonuses.greenhouseYield || 0) + reward.greenhouseYield;
  }
  if (reward.allRevenue) {
    state.achievementBonuses.allRevenue = (state.achievementBonuses.allRevenue || 0) + reward.allRevenue;
  }
  if (reward.microPrice) {
    state.achievementBonuses.microPrice = (state.achievementBonuses.microPrice || 0) + reward.microPrice;
  }
  if (reward.pijacaMultiplier) {
    state.achievementBonuses.pijacaMultiplier = (state.achievementBonuses.pijacaMultiplier || 0) + reward.pijacaMultiplier;
  }
  if (reward.reputation) {
    const cap = state.achievementBonuses?.reputationCap || 1.5;
    state.reputation = Math.min(state.reputation + reward.reputation, cap);
  }
  if (reward.alumniBonus) {
    state.prestige.alumniBonus = (state.prestige.alumniBonus || 0) + reward.alumniBonus;
  }
  if (reward.dailyActions) {
    state.workers.dailyActionsTotal += reward.dailyActions;
    state.achievementBonuses.dailyActions = (state.achievementBonuses.dailyActions || 0) + reward.dailyActions;
  }
  if (reward.reputationCap) {
    state.achievementBonuses.reputationCap = reward.reputationCap;
  }
  if (reward.masterclassBonus) {
    state.achievementBonuses.masterclassBonus = (state.achievementBonuses.masterclassBonus || 0) + reward.masterclassBonus;
  }
}

// ─── Progress and display helpers ─────────────────────────────────────────────

/**
 * Get progress toward a specific achievement (0-1).
 * @param {object} state
 * @param {object} ach - achievement definition
 * @returns {{ pct: number, current: number|string, target: number|string }}
 */
export function getAchievementProgress(state, ach) {
  if (state.unlockedAchievements.includes(ach.id)) {
    return { pct: 1, current: ach.value, target: ach.value };
  }

  let current = 0;
  const target = typeof ach.value === 'number' ? ach.value : 1;

  switch (ach.trigger) {
    case 'mushroom_revenue': current = state.mushrooms.revenueEarned; break;
    case 'inokulacija_streak': current = state.mushrooms.inokulacijaStreak || 0; break;
    case 'oyster_revenue': current = state._oysterRevenue || 0; break;
    case 'micro_harvested': current = state._microHarvestedKg || 0; break;
    case 'tomato_harvested': current = state.greenhouse.tomato_harvested_kg || 0; break;
    case 'smudj_harvested': current = state.fishpond.smudj_harvested_kg || 0; break;
    case 'seasons_completed': current = state.season; break;
    case 'reputation': current = state.reputation; break;
    case 'masterclass_count': current = state.masterclassCount; break;
    case 'pijaca_seasons': current = state.greenhouse.pijacaSeasons || 0; break;
    case 'prestige_count': current = state.prestige.count; break;
    case 'workers': current = state.workers.hired; break;
    case 'monthly_revenue': {
      const recent = state.monthlyRevenue || [];
      current = recent.length > 0 ? Math.max(...recent) : 0;
      break;
    }
    case 'greenhouse_unlocked':
    case 'fishpond_unlocked':
    case 'all_branches_active':
    case 'all_synergies':
    case 'fish_polyculture':
    case 'synergy_active':
    case 'upgrade_purchased':
    case 'prestige_scenario':
      current = checkTrigger(state, ach) ? 1 : 0;
      break;
    default: current = 0;
  }

  const pct = typeof ach.value === 'number'
    ? Math.min(1, current / ach.value)
    : (current ? 1 : 0);

  return { pct, current, target: ach.value };
}

/**
 * Get list of achievements pending unlock (close to trigger).
 * "Close" = progress >= 50%.
 * @param {object} state
 * @returns {Array<{ach, pct, current, target}>}
 */
export function getPendingAchievements(state) {
  const pending = [];
  for (const ach of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(ach.id)) continue;
    const { pct, current, target } = getAchievementProgress(state, ach);
    if (pct >= 0.5) {
      pending.push({ ach, pct, current, target });
    }
  }
  return pending.sort((a, b) => b.pct - a.pct);
}

/**
 * Get all achievements grouped by status.
 * @param {object} state
 * @returns {{ unlocked: Array, available: Array, locked: Array }}
 */
export function getAchievementsByStatus(state) {
  const unlocked = [];
  const available = [];
  const locked = [];

  for (const ach of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(ach.id)) {
      unlocked.push(ach);
    } else {
      const { pct } = getAchievementProgress(state, ach);
      if (pct > 0) {
        available.push({ ...ach, _pct: pct });
      } else {
        locked.push(ach);
      }
    }
  }

  return { unlocked, available: available.sort((a, b) => b._pct - a._pct), locked };
}

/**
 * Get reward description string for an achievement.
 * @param {object} reward
 * @returns {string}
 */
export function getRewardDescription(reward) {
  if (!reward) return '';
  const parts = [];
  if (reward.capital) parts.push(`+${reward.capital.toLocaleString()} din`);
  if (reward.spawnRatio) parts.push(`+${(reward.spawnRatio * 100).toFixed(0)}% spawn ratio`);
  if (reward.greenhouseYield) parts.push(`+${(reward.greenhouseYield * 100).toFixed(0)}% plastenik yield`);
  if (reward.allRevenue) parts.push(`+${(reward.allRevenue * 100).toFixed(0)}% svi prihodi`);
  if (reward.microPrice) parts.push(`+${reward.microPrice} din/kg mikrobiljke`);
  if (reward.pijacaMultiplier) parts.push(`+${(reward.pijacaMultiplier * 100).toFixed(0)}% pijaca mult`);
  if (reward.reputation) parts.push(`+${(reward.reputation * 100).toFixed(0)}% reputacija`);
  if (reward.alumniBonus) parts.push(`+${(reward.alumniBonus * 100).toFixed(0)}% alumni bonus`);
  if (reward.dailyActions) parts.push(`+${reward.dailyActions} dnevne akcije`);
  if (reward.reputationCap) parts.push(`Rep cap → ${reward.reputationCap}×`);
  if (reward.masterclassBonus) parts.push(`+${reward.masterclassBonus} din/participant MC`);
  return parts.join(', ') || 'Specijalni bonus';
}

/**
 * Get summary stats for achievement system.
 * @param {object} state
 * @returns {{ total, unlocked, pct, totalBonuses }}
 */
export function getAchievementSummary(state) {
  const total = ACHIEVEMENTS.length;
  const unlockedCount = state.unlockedAchievements.length;
  const bonuses = state.achievementBonuses || {};
  const totalRevBonus = (bonuses.allRevenue || 0) + (bonuses.greenhouseYield || 0);
  return {
    total,
    unlocked: unlockedCount,
    pct: Math.round((unlockedCount / total) * 100),
    revenueBonusPct: Math.round(totalRevBonus * 100),
  };
}
