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

/** Check all achievements and unlock new ones */
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
    state.reputation = Math.min(state.reputation + reward.reputation, 1.5);
  }
  if (reward.alumniBonus) {
    state.prestige.alumniBonus = (state.prestige.alumniBonus || 0) + reward.alumniBonus;
  }
  if (reward.dailyActions) {
    state.workers.dailyActionsTotal += reward.dailyActions;
  }
  if (reward.reputationCap) {
    state.achievementBonuses.reputationCap = reward.reputationCap;
  }
}
