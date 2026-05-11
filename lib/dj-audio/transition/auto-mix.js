// transition/auto-mix.js — auto-DJ track selection + crossfade
//
// Kad current track approaches end-of-bar, find compatible next u library.
// Compatibility = Camelot wheel + BPM ±6%.

import { CamelotWheel } from '../camelot.js';

export class AutoMix {
  /**
   * @param {AudioEngine} engine
   * @param {Deck} deckA primary deck
   * @param {Deck} deckB secondary deck za incoming track
   * @param {Array<{url:string, bpm:number, key:string, name:string, bars:number}>} library
   */
  constructor(engine, deckA, deckB, library = []) {
    this.engine = engine;
    this.deckA = deckA;
    this.deckB = deckB;
    this.library = library;
    this.activeDeck = deckA;
    this.cuedDeck = deckB;
    this.crossfadeBeats = 16; // 4 bars
    this.lastPlayed = new Set();
    this._barListener = null;
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
    // ako smo blizu kraja loopa (poslednja 2 bara), zakazi crossfade
    if (bar >= meta.bars - 2) {
      this._scheduleCrossfade();
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
