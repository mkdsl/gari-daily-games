// main.js — Park Ranger: Daily Quest RPG
// Jova jQuery | 2026-05-06

import { LEVEL_THRESHOLDS, XP_PER_QUEST, KATEGORIJA_ICONS, TEZINA_LABELS, CUVAR_PORUKE, COLORS, LEVEL_UP_MESSAGES, AUDIO_NOTES } from './config.js';
import { loadState, saveState, getTodayStr } from './state.js';
import { loadQuests, resolveDailyQuest, selectTodayQuest } from './quest.js';
import { analyzeDayStatus, DAY_STATUS, prepareDayState, completeQuest, applyPropusnica, getLevelData, getNextLevelData, getLevelProgress } from './streak.js';

let state;
let quests;
let currentQuest;
let audioCtx;

// ─── Audio ───────────────────────────────────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBleep() {
  if (state.audioMuted) return;
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = AUDIO_NOTES.E5;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.12);
}

function playDone() {
  if (state.audioMuted) return;
  const ctx = getAudioCtx();
  [AUDIO_NOTES.C5, AUDIO_NOTES.E5, AUDIO_NOTES.G5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
  });
}

function playLevelUp() {
  if (state.audioMuted) return;
  const ctx = getAudioCtx();
  [AUDIO_NOTES.C5, AUDIO_NOTES.E5, AUDIO_NOTES.G5, AUDIO_NOTES.C6].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.35);
  });
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('screen--active'));
  const target = $(`[data-screen="${id}"]`);
  if (target) target.classList.add('screen--active');
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSpriteClass(level) {
  // Find highest matching level sprite
  const levels = [0, 1, 2, 3, 5, 7];
  let best = 0;
  for (const l of levels) {
    if (level >= l) best = l;
  }
  return `sprite-level-${best}`;
}

// ─── Render: Home screen ─────────────────────────────────────────────────────

function renderHome() {
  const app = $('#app');
  const dayStatus = analyzeDayStatus(state);
  const levelData = getLevelData(state.playerLevel);
  const nextLevel = getNextLevelData(state.playerLevel);
  const progress = getLevelProgress(state.currentStreak, state.playerLevel);

  let questSection = '';

  if (dayStatus === DAY_STATUS.TODAY_DONE) {
    questSection = `
      <div class="done-status">Danas si odradio/la nalog.</div>
      <div class="cuvar-message">${randomFrom(CUVAR_PORUKE.done)}</div>
      <button class="btn btn-ghost" data-action="stats">Statistika</button>
    `;
  } else if (dayStatus === DAY_STATUS.MISSED_RESET) {
    questSection = `
      <div class="reset-notice">Streak resetovan. ${randomFrom(CUVAR_PORUKE.streak_reset)}</div>
      <button class="btn btn-primary" data-action="reveal">Novi nalog</button>
    `;
  } else if (dayStatus === DAY_STATUS.MISSED_PROPUSNICA) {
    questSection = `
      <div class="propusnica-box">Propustio/la si dan. Imas Park Propusnicu — sacuvaj streak?</div>
      <button class="btn btn-amber" data-action="propusnica">Koristi Propusnicu</button>
      <button class="btn btn-ghost" data-action="skip-propusnica">Preskoci (reset streak)</button>
    `;
  } else if (dayStatus === DAY_STATUS.TODAY_PENDING) {
    // Quest already revealed, show it
    questSection = renderQuestBox(currentQuest) + `
      <button class="btn btn-primary" data-action="done">Uradjeno</button>
    `;
  } else {
    // FIRST_TIME or YESTERDAY — new quest available
    questSection = `
      <button class="btn btn-primary" data-action="reveal">Otvori nalog</button>
    `;
  }

  const xpPercent = Math.round(progress * 100);
  const nextInfo = nextLevel ? `${nextLevel.streakRequired - state.currentStreak} dana do ${nextLevel.name}` : 'Park Legenda';

  app.innerHTML = `
    <div class="screen screen--active" data-screen="home">
      <div class="container">
        <div class="top-bar">
          <div>
            <div class="streak-display">${state.currentStreak} dana</div>
            <div class="streak-label">streak</div>
          </div>
          <div class="level-badge">${levelData.badge} ${levelData.name}</div>
          <button class="mute-btn" data-action="mute">${state.audioMuted ? '🔇' : '🔊'}</button>
        </div>

        <div class="sprite-wrap">
          <div class="sprite ${getSpriteClass(state.playerLevel)} sprite-idle"></div>
        </div>

        <div class="xp-bar-wrap">
          <div class="xp-bar"><div class="xp-fill" style="width:${xpPercent}%"></div></div>
          <div class="xp-label">${nextInfo}</div>
        </div>

        ${questSection}
      </div>
    </div>
  `;

  bindHomeEvents();
}

function renderQuestBox(quest) {
  if (!quest) return '<div class="quest-box"><div class="quest-text">Nema dostupnih naloga.</div></div>';
  const icon = KATEGORIJA_ICONS[quest.kategorija] || '';
  const diff = TEZINA_LABELS[quest.tezina] || quest.tezina;
  return `
    <div class="quest-box">
      <div class="quest-header">
        <span class="quest-category">${icon} ${quest.kategorija}</span>
        <span class="quest-difficulty">${diff}</span>
      </div>
      <div class="quest-text">${quest.text}</div>
      <div class="quest-date">${getTodayStr()}</div>
    </div>
  `;
}

function bindHomeEvents() {
  const app = $('#app');

  app.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;

      if (action === 'reveal') {
        playBleep();
        state = prepareDayState(state);
        currentQuest = selectTodayQuest(state, quests);
        state.currentQuestId = currentQuest.id;
        state.lastQuestDate = getTodayStr();
        state.completedToday = false;
        saveState(state);
        renderHome();
      }

      else if (action === 'done') {
        playDone();
        showReward();
      }

      else if (action === 'propusnica') {
        playBleep();
        state = applyPropusnica(state);
        saveState(state);
        currentQuest = selectTodayQuest(state, quests);
        state.currentQuestId = currentQuest.id;
        state.lastQuestDate = getTodayStr();
        saveState(state);
        renderHome();
      }

      else if (action === 'skip-propusnica') {
        state.currentStreak = 0;
        state = prepareDayState(state);
        saveState(state);
        currentQuest = selectTodayQuest(state, quests);
        state.currentQuestId = currentQuest.id;
        state.lastQuestDate = getTodayStr();
        saveState(state);
        renderHome();
      }

      else if (action === 'mute') {
        state.audioMuted = !state.audioMuted;
        saveState(state);
        e.currentTarget.textContent = state.audioMuted ? '🔇' : '🔊';
      }

      else if (action === 'stats') {
        renderStats();
      }
    });
  });
}

// ─── Reward screen ───────────────────────────────────────────────────────────

function showReward() {
  const result = completeQuest(state, currentQuest.id, currentQuest.kategorija);
  state = result.newState;
  saveState(state);

  const app = $('#app');
  app.innerHTML = `
    <div class="screen screen--active" data-screen="reward">
      <div class="container reward-wrap">
        <div class="sprite-wrap">
          <div class="sprite ${getSpriteClass(state.playerLevel)} ${result.leveledUp ? 'sprite-levelup' : 'sprite-idle'}"></div>
        </div>
        <div class="xp-gained">+${result.xpGained} XP</div>
        <div>
          <div class="streak-big">${state.currentStreak}</div>
          <div class="streak-big-label">dana zaredom</div>
        </div>
        <div class="cuvar-message">${randomFrom(CUVAR_PORUKE.done)}</div>
        <div class="mood-row">
          <button class="mood-btn" data-mood="happy">😊</button>
          <button class="mood-btn" data-mood="neutral">😐</button>
          <button class="mood-btn" data-mood="low">😔</button>
        </div>
        <button class="btn btn-primary" data-action="close-reward">Zatvori</button>
      </div>
    </div>
  `;

  // Level-up overlay
  if (result.leveledUp) {
    setTimeout(() => showLevelUp(result.newLevel), 800);
  }

  // Bind
  app.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      app.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('mood-btn--selected'));
      e.currentTarget.classList.add('mood-btn--selected');
      const mood = e.currentTarget.dataset.mood;
      const { setLastMood } = { setLastMood: (s, m) => {
        if (!s.questHistory.length) return s;
        const h = [...s.questHistory]; h[0] = { ...h[0], mood: m };
        return { ...s, questHistory: h };
      }};
      state = setLastMood(state, mood);
      saveState(state);
      // Show mood-specific message
      const msgs = CUVAR_PORUKE[`mood_${mood}`] || CUVAR_PORUKE.done;
      const msgEl = app.querySelector('.cuvar-message');
      if (msgEl) msgEl.textContent = randomFrom(msgs);
    });
  });

  app.querySelector('[data-action="close-reward"]')?.addEventListener('click', () => {
    renderHome();
  });
}

function showLevelUp(newLevel) {
  playLevelUp();
  const levelData = getLevelData(newLevel);
  const msg = LEVEL_UP_MESSAGES[newLevel] || `Level ${newLevel} dostignut!`;

  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';
  overlay.innerHTML = `
    <div class="levelup-title">LEVEL UP!</div>
    <div class="sprite-wrap">
      <div class="sprite ${getSpriteClass(newLevel)} sprite-levelup"></div>
    </div>
    <div class="levelup-name">${levelData.badge} ${levelData.name}</div>
    <div class="levelup-message">${msg}</div>
    <button class="btn btn-primary" style="max-width:200px">Nastavi</button>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.btn').addEventListener('click', () => {
    overlay.remove();
  });
}

// ─── Stats screen ────────────────────────────────────────────────────────────

function renderStats() {
  const levelData = getLevelData(state.playerLevel);
  const app = $('#app');
  app.innerHTML = `
    <div class="screen screen--active" data-screen="stats">
      <div class="container">
        <div class="sprite-wrap">
          <div class="sprite ${getSpriteClass(state.playerLevel)} sprite-idle"></div>
        </div>
        <div class="level-badge" style="font-size:1rem;padding:0.5rem 1rem;">
          ${levelData.badge} ${levelData.name}
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${state.currentStreak}</div>
            <div class="stat-label">Trenutni streak</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${state.recordStreak}</div>
            <div class="stat-label">Rekord</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${state.totalXP}</div>
            <div class="stat-label">Ukupni XP</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${state.questHistory.length}</div>
            <div class="stat-label">Zavrseni nalozi</div>
          </div>
        </div>
        <button class="btn btn-ghost" data-action="back-home">Nazad</button>
        <button class="btn btn-ghost" style="color:var(--danger);border-color:var(--danger);font-size:0.75rem;margin-top:1rem;" data-action="reset">Resetuj sve</button>
      </div>
    </div>
  `;

  app.querySelector('[data-action="back-home"]')?.addEventListener('click', () => renderHome());
  app.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    if (confirm('Sigurno? Sav progres ce biti obrisan.')) {
      localStorage.removeItem('parkRanger_v1');
      state = {
        currentStreak: 0, recordStreak: 0, lastQuestDate: null, completedToday: false,
        playerLevel: 0, totalXP: 0, questHistory: [], parkPropusnicaUsedMonth: null,
        currentQuestId: null, installPromptShown: false, appInstalled: false,
        pushPermission: 'unknown', isLegend: false, audioMuted: false,
      };
      renderHome();
    }
  });
}

// ─── Init ────────────────────────────────────────────────────────────────────

async function init() {
  state = loadState();
  quests = await loadQuests();

  if (!quests || quests.length === 0) {
    $('#app').innerHTML = '<div class="screen screen--active"><div class="container"><p style="color:var(--danger)">Greska: ne mogu da ucitam naloge.</p></div></div>';
    return;
  }

  // Prepare state for today
  const dayStatus = analyzeDayStatus(state);
  if (dayStatus === DAY_STATUS.MISSED_RESET) {
    state = prepareDayState(state);
    saveState(state);
  }

  // Resolve current quest if one exists
  if (state.currentQuestId) {
    currentQuest = resolveDailyQuest(state, quests);
  }

  renderHome();
}

init();
