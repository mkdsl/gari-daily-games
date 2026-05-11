// transition/auto-mix.js — auto-DJ track selection + crossfade
//
// Kad current track approaches end-of-bar, find compatible next u library.
// Compatibility = Camelot wheel + BPM ±6%.
//
// Transition build-up (šef brief 2026-05-11):
//   - Half-beat delay je default transition effect, jeftiniji od reverb send-a,
//     daje urgency feel.
//   - Engage-uje se 4 bara pre crossfade-a (urgency build-up), ramp-uje od 0
//     do peak intensity (~0.7) preko ta 4 bara.
//   - Posle crossfade-a, novi active deck dobija clearTransitionEffect().

import { CamelotWheel } from '../camelot.js';

export class AutoMix {
  /**
   * @param {AudioEngine} engine
   * @param {Deck} deckA primary deck
   * @param {Deck} deckB secondary deck za incoming track
   * @param {Array<{url:string, bpm:number, key:string, name:string, bars:number}>} library
   * @param {{useHalfBeatDelay?:boolean, halfBeatPeak?:number, buildUpBars?:number}} [opts]
   */
  constructor(engine, deckA, deckB, library = [], opts = {}) {
    this.engine = engine;
    this.deckA = deckA;
    this.deckB = deckB;
    this.library = library;
    this.activeDeck = deckA;
    this.cuedDeck = deckB;
    this.crossfadeBeats = 16; // 4 bars
    this.lastPlayed = new Set();
    this._barListener = null;

    // half-beat delay build-up (default ON — šef brief)
    this.useHalfBeatDelay = opts.useHalfBeatDelay !== false;
    this.halfBeatPeak = opts.halfBeatPeak ?? 0.7;
    this.buildUpBars = opts.buildUpBars ?? 4;
    this._buildUpStartedFor = null; // bar index gde je build-up startovao
  }

  setLibrary(library) {
    this.library = library;
  }

  /**
   * Pokreni auto-mix loop: na svaki barEnd, proveri da li je vreme za crossfade.
   */
  start() {
    if (this._barListener) return;
    this._barListener = (e) => this._onBar(e);
    this.activeDeck.on('barEnd', this._barListener);
  }

  stop() {
    if (this._barListener) {
      this.activeDeck.off('barEnd', this._barListener);
      this._barListener = null;
    }
  }

  _onBar({ bar }) {
    const meta = this.activeDeck.meta;
    if (!meta) return;

    // Build-up: 4 bara pre crossfade-a uključi half-beat delay i ramp-uj intensity.
    // Crossfade kreće na bars - 2 (kao i pre).
    const buildUpStart = meta.bars - 2 - this.buildUpBars;
    if (this.useHalfBeatDelay && bar >= buildUpStart && bar < meta.bars - 2) {
      this._tickBuildUp(bar, buildUpStart);
    }

    if (bar >= meta.bars - 2 && this._buildUpStartedFor !== meta.url) {
      // marker da ne re-trigger-uje crossfade na sledećem baru
      this._buildUpStartedFor = meta.url;
      this._scheduleCrossfade();
    }
  }

  /**
   * Ramp-uj half-beat delay od 0 do halfBeatPeak preko buildUpBars.
   * Pozivа se jednom po baru tokom build-up perioda.
   */
  _tickBuildUp(currentBar, buildUpStartBar) {
    const progress = (currentBar - buildUpStartBar + 1) / this.buildUpBars;
    const intensity = Math.min(1, progress) * this.halfBeatPeak;
    try {
      this.activeDeck.applyHalfBeatDelay(intensity);
    } catch (e) {
      // half-beat delay nije kritičan — log i nastavi
      console.warn('[auto-mix] half-beat delay failed:', e.message);
    }
  }

  /**
   * Izaberi next track, cue na cuedDeck, crossfade-uj.
   */
  async _scheduleCrossfade() {
    const next = this.pickNext();
    if (!next) return;

    try {
      await this.cuedDeck.load(next.url);
    } catch (e) {
      console.error('AutoMix: failed to load', next.url, e);
      return;
    }
    this.cuedDeck.syncTo(this.activeDeck);
    this.cuedDeck.setVolume(0);
    this.cuedDeck.play();

    // linear crossfade tokom crossfadeBeats
    const beatsSec = 60 / (this.activeDeck.meta.bpm * this.activeDeck.playbackRate);
    const fadeDur = beatsSec * this.crossfadeBeats;
    const now = this.engine.ctx.currentTime;

    this.activeDeck.deckGain.gain.cancelScheduledValues(now);
    this.activeDeck.deckGain.gain.setValueAtTime(this.activeDeck.deckGain.gain.value, now);
    this.activeDeck.deckGain.gain.linearRampToValueAtTime(0, now + fadeDur);

    this.cuedDeck.deckGain.gain.cancelScheduledValues(now);
    this.cuedDeck.deckGain.gain.setValueAtTime(0, now);
    this.cuedDeck.deckGain.gain.linearRampToValueAtTime(1, now + fadeDur);

    this.lastPlayed.add(this.activeDeck.meta.url);
    if (this.lastPlayed.size > 5) {
      const first = this.lastPlayed.values().next().value;
      this.lastPlayed.delete(first);
    }

    // swap decks posle fade-a
    setTimeout(() => {
      // očisti half-beat delay na izlaznom decku pre stop()-a (stop bi ga svakako resetovao,
      // ali eksplicitno radi parnjak sa applyHalfBeatDelay tokom build-up-a)
      try { this.activeDeck.clearTransitionEffect(); } catch (e) {}
      this.activeDeck.stop();
      // swap
      const tmp = this.activeDeck;
      this.activeDeck = this.cuedDeck;
      this.cuedDeck = tmp;
      // reattach bar listener na novi active
      if (this._barListener) {
        this.cuedDeck.off('barEnd', this._barListener);
        this.activeDeck.on('barEnd', this._barListener);
      }
      // reset build-up flag za sledeći ciklus
      this._buildUpStartedFor = null;
    }, fadeDur * 1000 + 200);
  }

  /**
   * Pick next compatible track iz library.
   * Filter: Camelot kompatibilan, BPM ±6%, ne lastPlayed.
   */
  pickNext() {
    const cur = this.activeDeck.meta;
    if (!cur) return null;
    const candidates = this.library.filter((t) => {
      if (t.url === cur.url) return false;
      if (this.lastPlayed.has(t.url)) return false;
      if (!CamelotWheel.isCompatible(cur.key, t.key)) return false;
      const bpmDelta = Math.abs(t.bpm - cur.bpm) / cur.bpm;
      if (bpmDelta > 0.06) return false;
      return true;
    });
    if (candidates.length === 0) {
      // fallback: just same BPM range, ignoriraj kompatibilnost
      const fb = this.library.filter((t) =>
        t.url !== cur.url && Math.abs(t.bpm - cur.bpm) / cur.bpm < 0.1
      );
      if (fb.length === 0) return null;
      return fb[Math.floor(Math.random() * fb.length)];
    }
    // random iz top 3 (po Camelot distanci)
    candidates.sort((a, b) =>
      CamelotWheel.distance(cur.key, a.key) - CamelotWheel.distance(cur.key, b.key)
    );
    const top = candidates.slice(0, Math.min(3, candidates.length));
    return top[Math.floor(Math.random() * top.length)];
  }
}
