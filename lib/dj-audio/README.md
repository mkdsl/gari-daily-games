# dj-audio — DJ Audio Engine MVP

**Autor:** Ceca Čujka
**Datum:** 2026-05-11
**Status:** MVP — radi 2-deck playback, EQ, reverb, syncTo, desync, beatsync monitor, auto-mix

## Format dogovor (šef potvrdio)

- **OGG Opus 192 kbps** (master može i WAV)
- **Naming:** `BPM-KEY-name-BARS.opus`
  - `BPM` — integer 60–200
  - `KEY` — Camelot (1A–12A za minor, 1B–12B za major)
  - `name` — `[a-zA-Z0-9_]+`
  - `BARS` — 8 ili 16
- **Primer:** `128-8A-acid_run-16.opus`
- **BPM/key NE auto-detect** — parse iz filename-a. Šef priprema klipove sa tačnim naming-om.

## Import

```js
import {
  AudioEngine,
  Deck,
  CamelotWheel,
  parseTrackName,
} from './lib/dj-audio/index.js';
```

Bez build, bez npm, vanilla ES6 modules. Radi sa local server-om (`python3 -m http.server 8000`); `file://` zna da puca na ES module CORS-u u nekim browser-ima.

## Brzi primer

```js
const engine = new AudioEngine({ masterVolume: 0.8 });
await engine.resume(); // mora iz click handler-a (iOS Safari)

const a = engine.createDeck('A');
const b = engine.createDeck('B');

await a.load('/tracks/128-8A-acid_run-16.opus');
await b.load('/tracks/124-9A-warm_pad-16.opus');

a.play();
b.play();

b.syncTo(a);             // match BPM
a.setEQ({ low: -6 });     // -6 dB na bass deck A
a.setReverb(0.3);         // 30% wet

// gameplay alarm
a.desync(0.5);            // raspad sync-a na pola
```

## Mobile lite mode

```js
engine.setMobileLiteMode(true);  // disable reverb, single-deck
const deck = engine.createDeck();
```

iOS 14+ minimum. AudioContext mora da krene iz user gesture (click/touch listener).

## Modul layout

```
lib/dj-audio/
├── index.js              public API
├── engine.js             AudioEngine
├── deck.js               Deck class
├── parser.js             naming parser
├── camelot.js            Camelot wheel utility
├── effects/
│   ├── eq.js             3-band EQ
│   └── feedback-delay.js algoritamski reverb (NIJE ConvolverNode)
└── transition/
    ├── beatsync.js       drift monitor
    ├── auto-mix.js       auto-DJ track selection
    └── desync.js         progressive desync animator
```

## Šta MVP RADI

- Load + play OGG/WAV (sa validnim naming-om)
- 2-deck simultano
- 3-band EQ per deck (low-shelf 250Hz, peak 1.5kHz, high-shelf 5kHz)
- Algoritamski reverb (feedback delay, ne ConvolverNode → mobile-friendly)
- `Deck.syncTo(other)` — match BPM kroz playbackRate
- `Deck.desync(intensity)` — 4-sloj raspad (phase + BPM + pitch + distortion)
- `BeatsyncMonitor` — pozadinski drift correction
- `AutoMix` — Camelot + BPM compatible next track + crossfade
- `CamelotWheel` — kompatibilnost + distanca utility
- Events: `beat`, `barEnd`, `trackEnd`

## Šta MVP NE RADI (out of scope, čeka v2)

- BPM/key auto-detection (eliminisano per format dogovor)
- ConvolverNode reverb (mobile CPU)
- Phase vocoder za >6% tempo shift
- HighPass transition sweep (može lako preko BiquadFilter, dodato v2)
- Music library management UI
- IndexedDB persistent cache (nije potrebno — meta iz filename-a)
- Beat-tap recovery UI (game posao, ne lib)

## Testiranje

`index.html` u parent dir-u radi smoke test sa procedural sine-wave tracks. Otvori kroz local server, klikni Init → Gen → Load A/B → Play. Desync slider radi progressive raspad.

## Iza ćoška

Jova jQuery integriše ovo u DJ za Pultom v1. Game pruža: track library manifest sa naming-om, click handler za init, UI za EQ knobs + desync slider. Lib je framework-agnostic.
