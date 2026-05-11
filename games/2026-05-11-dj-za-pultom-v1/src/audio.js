// =============================================================================
// audio.js — Audio engine integration sa Ceca lib/dj-audio/
// =============================================================================
// INTERNI API. Igrač ne vidi slidere ni kontrole. Game scena zove:
//   - initAudioEngine()        — boot, lazy AudioContext (suspended dok ne resume)
//   - startSet(setlist, energyLevel)  — load deck A + deck B, start play
//   - applyTransition(fromDeck, toDeck, energyShift)  — auto cross-fade
//   - applyHalfBeatDelay(deck, intensity)  — DEFAULT transition effect
//     (šef brief 2026-05-11: "delay na pola beata, daje brzinu i urgentnost")
//
// EQ + reverb se interno modulišu energyLevel-om — igrač samo time management.
// =============================================================================
import { AudioEngine } from '../../../lib/dj-audio/index.js';

let engine = null;
let deckA = null;
let deckB = null;
let activeDeck = 'A';   // koji deck je trenutno na izlazu
let currentSetlist = null;
let currentTrackIdx = 0;
let currentEnergy = 0.5;
let isReady = false;

// =============================================================================
// Boot
// =============================================================================
export async function initAudioEngine() {
  if (engine) return engine;
  try {
    engine = new AudioEngine({ masterVolume: 0.8 });
    deckA = engine.createDeck('A');
    deckB = engine.createDeck('B');
    isReady = true;
    console.log('[audio] engine initialized — 2 decks ready, ctx state:', engine.ctx.state);
  } catch (e) {
    console.warn('[audio] init failed — fallback to silent stub:', e.message);
    engine = null;
    isReady = false;
  }
  return engine;
}

/**
 * iOS Safari guard — must be called from user click handler.
 */
export async function resumeOnUserGesture() {
  if (!engine) return false;
  try {
    const state = await engine.resume();
    return state === 'running';
  } catch (e) {
    console.warn('[audio] resume failed', e.message);
    return false;
  }
}

export function getEngine() {
  if (!engine) initAudioEngine();
  return engine;
}

export function isAudioReady() {
  return isReady;
}

// =============================================================================
// Set playback
// =============================================================================
/**
 * Pokrene set. Loaduje first track u Deck A.
 * @param {Array<{url,bpm,key,name,bars}>} setlist
 * @param {number} energyLevel 0..1 — interno modulira EQ/reverb/delay
 */
export async function startSet(setlist, energyLevel = 0.5) {
  if (!engine || !setlist || setlist.length === 0) return;
  currentSetlist = setlist;
  currentTrackIdx = 0;
  currentEnergy = clamp01(energyLevel);

  try {
    const track = setlist[0];
    await deckA.load(track.url);
    _applyEnergyToDeck(deckA, currentEnergy);
    deckA.play({ fadeIn: 0.2 });
    activeDeck = 'A';
    console.log('[audio] set started — deck A:', track.name, '@', track.bpm, 'BPM');
  } catch (e) {
    console.warn('[audio] startSet failed:', e.message);
  }
}

/**
 * Auto-transition iz active deck-a u next track u setlist-u.
 * Koristi half-beat delay kao DEFAULT transition effect (šef brief).
 *
 * @param {number} energyShift -1..+1 — pomerana energy posle prelaza
 */
export async function nextTransition(energyShift = 0) {
  if (!engine || !currentSetlist) return;
  const nextIdx = currentTrackIdx + 1;
  if (nextIdx >= currentSetlist.length) {
    console.log('[audio] setlist end — no more tracks');
    return;
  }

  const fromDeck = activeDeck === 'A' ? deckA : deckB;
  const toDeck = activeDeck === 'A' ? deckB : deckA;
  const nextTrack = currentSetlist[nextIdx];

  try {
    await toDeck.load(nextTrack.url);
    // sync BPM ka outgoing deck-u
    toDeck.syncTo(fromDeck);

    const newEnergy = clamp01(currentEnergy + energyShift);
    applyTransition(fromDeck, toDeck, newEnergy - currentEnergy);

    currentTrackIdx = nextIdx;
    currentEnergy = newEnergy;
    activeDeck = activeDeck === 'A' ? 'B' : 'A';
  } catch (e) {
    console.warn('[audio] nextTransition failed:', e.message);
  }
}

/**
 * Cross-fade prelaz. Interno koristi half-beat delay na poslednja 4 takta
 * fromDeck-a + linear gain cross-fade. EQ/reverb se modulisu energyShift-om.
 *
 * @param {Deck} fromDeck
 * @param {Deck} toDeck
 * @param {number} energyShift -1..+1
 */
export function applyTransition(fromDeck, toDeck, energyShift = 0) {
  if (!engine || !fromDeck || !toDeck) return;

  // 1. Half-beat delay na izlaznom decku tokom poslednja 4 takta.
  //    intensity skalira sa apsolutnim energy shift-om (veci shift = jaci urgency).
  const delayIntensity = Math.min(1, 0.4 + Math.abs(energyShift) * 0.6);
  applyHalfBeatDelay(fromDeck, delayIntensity);

  // 2. Posle 4 takta (kalkulisanog iz fromDeck.meta.bpm), prebaci na toDeck.
  //    4 takta = 16 beat-ova na 4/4. Sekundi = 16 * 60/bpm.
  const bpm = fromDeck.meta?.bpm || 128;
  const transitionSec = (16 * 60) / bpm;

  // start toDeck odmah sa fadeIn — sinhronizovan sa beat clock-om
  toDeck.play({ fadeIn: transitionSec * 0.5 });

  // 3. Interno EQ + reverb update na toDeck-u prema novom energy levelu
  const newEnergy = clamp01(currentEnergy + energyShift);
  _applyEnergyToDeck(toDeck, newEnergy);

  // 4. Linear gain cross-fade preko transition window-a
  const now = engine.ctx.currentTime;
  fromDeck.deckGain.gain.cancelScheduledValues(now);
  fromDeck.deckGain.gain.setValueAtTime(fromDeck.deckGain.gain.value, now);
  fromDeck.deckGain.gain.linearRampToValueAtTime(0, now + transitionSec);

  toDeck.deckGain.gain.cancelScheduledValues(now);
  toDeck.deckGain.gain.setValueAtTime(0, now);
  toDeck.deckGain.gain.linearRampToValueAtTime(1, now + transitionSec);

  // 5. Posle prelaza — clear delay sa from deck-a, stop ga
  setTimeout(() => {
    fromDeck.clearTransitionEffect();
    fromDeck.stop();
  }, (transitionSec + 0.5) * 1000);
}

/**
 * Half-beat delay na deck-u (interni API).
 * DEFAULT transition effect za micro-night scene (šef brief 2026-05-11).
 *
 * Delay = 30000/bpm ms (na 128 BPM ≈ 234ms). Lib computes automatski iz
 * deck.meta.bpm + playbackRate kad zovemo applyHalfBeatDelay(intensity).
 *
 * @param {Deck} deck
 * @param {number} intensity 0..1 (0 = bypass)
 */
export function applyHalfBeatDelay(deck, intensity) {
  if (!deck) return;
  try {
    deck.applyHalfBeatDelay(clamp01(intensity));
  } catch (e) {
    console.warn('[audio] applyHalfBeatDelay failed:', e.message);
  }
}

/**
 * Interno mapping: energyLevel (0..1) → EQ + reverb send.
 *   low energy  (0.0-0.3) : warm EQ (high cut), high reverb wet
 *   mid energy  (0.3-0.7) : neutral EQ, medium reverb
 *   high energy (0.7-1.0) : bright EQ (mid + high boost), dry
 */
function _applyEnergyToDeck(deck, energy) {
  if (!deck) return;
  const e = clamp01(energy);
  try {
    // EQ — three band {low, mid, high} dB approx -6..+6
    const eq = {
      low:  -2 + e * 4,            // bassy at low/mid, less at peak
      mid:  -3 + e * 6,            // mids absent at low, prominent at high
      high: -6 + e * 12            // dark warm at low, bright at high
    };
    if (deck.setEQ) deck.setEQ(eq);

    // Reverb wet: inverse — more wet at low energy
    const wet = (1 - e) * 0.35;
    if (deck.setReverb) deck.setReverb(wet);
  } catch (err) {
    // ignore — silent fallback
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// =============================================================================
// UI sound bank (placeholder — Ceca će dodati)
// =============================================================================
export function playUiSound(name) {
  // PLACEHOLDER — Ceca will provide UI sounds bank
  // For now: noop
}

// =============================================================================
// Cleanup
// =============================================================================
export async function destroyAudio() {
  if (!engine) return;
  try {
    await engine.destroy();
  } catch (e) { /* ignore */ }
  engine = null;
  deckA = null;
  deckB = null;
  isReady = false;
}
