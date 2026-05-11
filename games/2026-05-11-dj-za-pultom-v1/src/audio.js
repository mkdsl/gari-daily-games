// =============================================================================
// audio.js — Audio engine integration placeholder
// =============================================================================
// Ceca implementira `lib/dj-audio/` paralelno; ti integrišeš preko ES6 import.
// Kad Ceca lib bude gotov:
//   import { DjEngine } from '../lib/dj-audio/index.js';
//   const engine = new DjEngine({ ... });
// Za sad — sve operacije su no-op stub.
// =============================================================================

let engine = null;

export function initAudioEngine() {
  console.log('[audio] audio engine pending — Ceca lib/dj-audio not yet integrated');
  engine = {
    isReady: false,
    play: () => {},
    crossfade: () => {},
    beatTap: () => {},
    setDesyncTimer: () => {},
    onDesync: cb => {}
  };
  return engine;
}

export function getEngine() {
  if (!engine) initAudioEngine();
  return engine;
}

export function playUiSound(name) {
  // PLACEHOLDER — Ceca will provide UI sounds bank
  // For now: noop
}

export function isAudioReady() {
  return engine !== null && engine.isReady === true;
}
