/** Chat stream po platformi, momentum scoring */
import { GAME_CONFIG, clamp } from '../config.js';
import { getDashboardState, updateDashboardState, tickChatMomentum } from './dashboard-state.js';
import { generateChatMessage, pickTag } from '../content/chat-templates.js';
import { emit, EVENTS } from '../events.js';
import { playChatIg, playChatTiktok, playChatYoutube } from '../audio.js';

/** @type {Array} Poruke za prikazivanje po platformi */
const _messageQueues = { ig: [], tiktok: [], youtube: [] };

/** @type {Object} Poslednji timestamp generisanja po platformi */
const _lastGenerated = { ig: 0, tiktok: 0, youtube: 0 };

/** Brzina generisanja (sekunde između poruka, po platformi) */
const GEN_INTERVAL = { ig: 2.5, tiktok: 1.8, youtube: 4.0 };

/**
 * Tick: generiše nove poruke i ažurira momentum
 * @param {number} elapsed - sekunde od start-a
 * @param {Object} plan - weekly_plan
 * @param {boolean} tutorialMode
 * @returns {Object} { ig: newMsg[], tiktok: newMsg[], youtube: newMsg[] }
 */
export function tickChat(elapsed, plan, tutorialMode) {
  const ds = getDashboardState();
  if (!ds) return { ig: [], tiktok: [], youtube: [] };

  const newMsgs = { ig: [], tiktok: [], youtube: [] };
  const platforms = tutorialMode ? ['ig'] : Object.keys(plan.platform_alloc).filter(p => plan.platform_alloc[p] > 0);

  for (const platform of platforms) {
    const interval = _getInterval(platform, ds);
    if (elapsed - _lastGenerated[platform] >= interval) {
      const tag = pickTag(ds.chatMomentum[platform] || 0.3);
      const msg = generateChatMessage(platform, tag);
      newMsgs[platform].push(msg);
      _messageQueues[platform].push(msg);

      // Max 80 poruka po platformi
      if (_messageQueues[platform].length > 80) {
        _messageQueues[platform].shift();
      }

      _lastGenerated[platform] = elapsed;
      _playPlatformSound(platform);
    }
  }

  // Ažuriraj momentum
  const msgCounts = {
    ig: newMsgs.ig.length,
    tiktok: newMsgs.tiktok.length,
    youtube: newMsgs.youtube.length,
  };
  tickChatMomentum(msgCounts);

  if (Object.values(msgCounts).some(c => c > 0)) {
    emit(EVENTS.CHAT_MOMENTUM_CHANGE, { momentum: { ...ds.chatMomentum }, newMsgs });
  }

  return newMsgs;
}

/**
 * Interval između poruka — varira sa momentumom
 * @param {string} platform
 * @param {Object} ds
 * @returns {number} sekunde
 */
function _getInterval(platform, ds) {
  const base = GEN_INTERVAL[platform] || 3.0;
  const momentum = ds.chatMomentum[platform] || 0.3;
  // Visok momentum = brže poruke (min 1s)
  return Math.max(1.0, base * (1 - momentum * 0.6));
}

/**
 * Svira odgovarajući zvuk za platformu
 * @param {string} platform
 */
function _playPlatformSound(platform) {
  if (platform === 'ig') playChatIg();
  else if (platform === 'tiktok') playChatTiktok();
  else if (platform === 'youtube') playChatYoutube();
}

/**
 * Vraća poslednjih N poruka za platformu
 * @param {string} platform
 * @param {number} n
 * @returns {Array}
 */
export function getRecentMessages(platform, n = 20) {
  return _messageQueues[platform]?.slice(-n) || [];
}

/**
 * Resetuje chat queues (između emisija)
 */
export function resetChatQueues() {
  _messageQueues.ig = [];
  _messageQueues.tiktok = [];
  _messageQueues.youtube = [];
  _lastGenerated.ig = 0;
  _lastGenerated.tiktok = 0;
  _lastGenerated.youtube = 0;
}

/**
 * TikTok spike boost — povećava momentum drastično
 */
export function triggerTiktokSpike() {
  const ds = getDashboardState();
  if (!ds) return;
  // Generišemo nekoliko hype poruka odjednom
  for (let i = 0; i < 5; i++) {
    const msg = generateChatMessage('tiktok', 'hype');
    _messageQueues.tiktok.push(msg);
    playChatTiktok();
  }
  // Momentum skok
  ds.chatMomentum.tiktok = Math.min(1, ds.chatMomentum.tiktok + 0.4);
}

/**
 * Vraća momentun info za sve platforme
 * @returns {Object}
 */
export function getAllMomentum() {
  const ds = getDashboardState();
  return ds ? { ...ds.chatMomentum } : { ig: 0, tiktok: 0, youtube: 0 };
}
