import { CONFIG } from './config.js';

export function computeHash(score, trashCount, distance) {
  return (score * 7 + trashCount * 13 + Math.floor(distance) * 3) ^ 0xA5B7;
}

export function createState() {
  return {
    screen: 'menu',     // 'menu' | 'playing' | 'gameover'
    score: 0,
    trashCount: 0,
    distance: 0,
    _scoreHash: computeHash(0, 0, 0),
    speed: CONFIG.SPEED_BASE,
    antiAbuseTimer: 0,
    antiAbuseDelay: 0,
    // Player
    player: {
      x: CONFIG.PLAYER_X,
      y: 0,             // postavlja se na startRun
      vy: 0,
      isJumping: false,
      isDucking: false,
      duckTimer: 0,
      animFrame: 0,
      animTimer: 0,
      grabAnim: 'none',
      grabTimer: 0
    },
    // World
    world: {
      scrollX: 0,       // ukupni scroll od starta
      parallaxOffsets: [0, 0, 0, 0, 0],  // po slojevima
      stars: [],        // { x, y } generisano jednom
      clouds: [],       // { x, y, w, h, alpha }
      farPines: [],     // { x, h, baseY }
      midPines: []      // { x, h, baseY }
    },
    // Objekti na ekranu
    objects: [],        // [{ type, kind, x, y, w, h, hitW, hitH, collected }]
    nextSpawnX: 0,
    // Combo
    combo: 0,
    comboMultiplier: 1,
    comboBonus: 0,
    // Shield
    shield: 0,
    // Milestones
    lastMilestone: 0,
    // Drop moment
    dropTimer: 0,
    dropping: false,
    dropDuration: 0,
    // Flash messages
    flashMessages: [],
    // Daily highscore
    daily: loadDailyHighscore()
  };
}

export function loadDailyHighscore() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return emptyDaily();
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return emptyDaily();
    return data;
  } catch { return emptyDaily(); }
}

function emptyDaily() {
  return {
    date: new Date().toISOString().slice(0, 10),
    scores: []
  };
}

export function saveDailyHighscore(state) {
  try {
    const expected = computeHash(state.score, state.trashCount, state.distance);
    if (state._scoreHash !== expected) return;
    const d = state.daily;
    d.scores = [...d.scores, state.score].sort((a, b) => b - a).slice(0, 3);
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(d));
  } catch {}
}
