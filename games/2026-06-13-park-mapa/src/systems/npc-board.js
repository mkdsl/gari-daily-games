/**
 * npc-board.js — NPC misije, nedeljni reset, progress tracking, reward dispatching
 * Park Mapa | Jova jQuery
 */

import { CONFIG } from '../config.js';
import { earnPT } from './economy.js';

// Weekly mission definitions per NPC
const MISSION_TEMPLATES = {
  vlado: {
    npcId: 'vlado',
    name: 'Vlado (Kurator)',
    description: 'Poseti Pult 3 puta ove nedelje',
    type: 'checkin_count',    // track zone check-ins
    zoneId: 'pult',
    target: 3,
    rewardMin: 30,
    rewardMax: 50
  },
  mara: {
    npcId: 'mara',
    name: 'Mara (Park Ranger)',
    description: 'Skupi 25 easter egg-ova ove nedelje',
    type: 'egg_count',
    target: 25,
    rewardMin: 30,
    rewardMax: 50
  },
  ace: {
    npcId: 'ace',
    name: 'Ace (DJ)',
    description: 'Check-in na Binu kad je Dnevno Svetlo',
    type: 'daily_light_checkin',
    zoneId: 'bina',
    target: 1,
    rewardMin: 40,
    rewardMax: 60
  },
  djordje: {
    npcId: 'djordje',
    name: 'Đorđe (Biljkar)',
    description: 'Investiraj 100 PT u Park projekte',
    type: 'pt_spent',
    target: 100,
    rewardMin: 30,
    rewardMax: 50
  }
};

export function getISOWeekKey() {
  // Return 'YYYY-Www' string for current week
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

export function initNpcMissions(state) {
  // Initialize or reset missions for current week
  const weekKey = getISOWeekKey();
  if (state.npcWeekStart === weekKey) return; // already initialized

  state.npcWeekStart = weekKey;
  state.npcMissions = {};

  for (const [npcId, template] of Object.entries(MISSION_TEMPLATES)) {
    state.npcMissions[npcId] = {
      npcId,
      weekKey,
      progress: 0,
      target: template.target,
      completed: false,
      claimed: false,
      reward: template.rewardMin + Math.floor(Math.random() * (template.rewardMax - template.rewardMin + 1))
    };
  }
}

export function getNpcMissions(state) {
  // Returns array of mission objects with template merged in
  initNpcMissions(state);
  return Object.entries(state.npcMissions).map(([npcId, mission]) => ({
    ...MISSION_TEMPLATES[npcId],
    ...mission
  }));
}

export function updateNpcMissionProgress(state, eventType, data) {
  // Called when game events happen
  // eventType: 'zoneCheckin', 'eggCollected', 'dailyLightCheckin', 'ptSpent'
  initNpcMissions(state);

  if (eventType === 'zoneCheckin' && data.zoneId === 'pult') {
    if (state.npcMissions.vlado && !state.npcMissions.vlado.completed) {
      state.npcMissions.vlado.progress = Math.min(
        state.npcMissions.vlado.target,
        state.npcMissions.vlado.progress + 1
      );
      if (state.npcMissions.vlado.progress >= state.npcMissions.vlado.target) {
        state.npcMissions.vlado.completed = true;
      }
    }
  }

  if (eventType === 'eggCollected') {
    if (state.npcMissions.mara && !state.npcMissions.mara.completed) {
      state.npcMissions.mara.progress = Math.min(
        state.npcMissions.mara.target,
        state.npcMissions.mara.progress + 1
      );
      if (state.npcMissions.mara.progress >= state.npcMissions.mara.target) {
        state.npcMissions.mara.completed = true;
      }
    }
  }

  if (eventType === 'dailyLightCheckin' && data.zoneId === 'bina') {
    if (state.npcMissions.ace && !state.npcMissions.ace.completed) {
      state.npcMissions.ace.progress = 1;
      state.npcMissions.ace.completed = true;
    }
  }

  if (eventType === 'ptSpent') {
    if (state.npcMissions.djordje && !state.npcMissions.djordje.completed) {
      state.npcMissions.djordje.progress = Math.min(
        state.npcMissions.djordje.target,
        state.npcMissions.djordje.progress + (data.amount || 0)
      );
      if (state.npcMissions.djordje.progress >= state.npcMissions.djordje.target) {
        state.npcMissions.djordje.completed = true;
      }
    }
  }
}

export function claimNpcReward(state, npcId, emit) {
  const mission = state.npcMissions[npcId];
  if (!mission || !mission.completed || mission.claimed) return 0;
  mission.claimed = true;
  earnPT(state, mission.reward, `npc_reward_${npcId}`);
  if (emit) emit('npcRewardClaimed', { npcId, reward: mission.reward });
  return mission.reward;
}

export function getMissionTemplate(npcId) {
  return MISSION_TEMPLATES[npcId] || null;
}

export function getNpcDefinition(npcId) {
  return CONFIG.NPC_DEFINITIONS?.find(n => n.id === npcId) || null;
}
