// lib/dj-audio/index.js — public API
// DJ Audio Engine MVP — Ceca Čujka, 2026-05-11
//
// Format dogovor:
//   - OGG Opus 192 kbps (master moze i WAV)
//   - Naming: BPM-KEY-name-BARS.opus  npr. "128-8A-acid_run-16.opus"
//   - Bar duzine: 8 ili 16
//   - BPM/key se PARSE iz naming-a, NE auto-detect
//
// Usage:
//   import { AudioEngine, Deck, CamelotWheel, parseTrackName } from './lib/dj-audio/index.js';

export { AudioEngine } from './engine.js';
export { Deck } from './deck.js';
export { CamelotWheel } from './camelot.js';
export { parseTrackName } from './parser.js';
