// transition/auto-mix.js — auto-DJ track selection + classic DJ crossfade
//
// Šef brief (2026-05-11, revision 2): klasičan DJ pattern, drop precision.
// "Može nekad da se pre prvog kika nove trake delay prestane" —
// delay decay MORA da završi NA drop tačci (pre prvog kick-a incoming),
// bass otvara NA prvom kick-u (1-beat ramp, ne 2).
//
// Pattern (default 4-bar crossfade; konfigurabilan na 8):
//
//   [crossfade start = meta.bars - crossfadeBars]
//     ├─ Deck A (outgoing): EQ low ramp 0 dB → -24 dB kroz ceo crossfade
//     │                     (bass se postepeno gasi kroz 4 bara)
//     ├─ Deck B (incoming): EQ low već prethodno set na -24 dB (prepare),
//     │                     volume ramp 0 → 1 paralelno sa A 1 → 0
//     │
//     ├─ ... bar 1, 2, 3 ... pred poslednji `delayBars` bar ...
//     │
//     ├─ [delay tačka = crossfadeEnd - delayBars]
//     │    Deck A: applyHalfBeatDelayForBars(halfBeatPeak, delayBars)
//     │    Trajanje: delayBars (default 1 bar) — wet gain 0 NA drop tačci,
//     │    feedback gasi 100-300ms pre drop-a (vidi half-beat-delay.js).
//     │
//     └─ [drop tačka = crossfadeEnd / prvi kick incoming trake]
//          ├─ Deck A: delay je VEĆ 0 (clearTransitionEffect = belt+suspender)
//          ├─ Deck B: EQ low ramp -24 dB → 0 dB     — bass OTVARA (1 beat)
//          └─ Deck A: stop()
//
// Sve event-i logovani kroz onEvent(type, data) callback ako je prosleđen.

import { CamelotWheel } from '../camelot.js';

// EQ low-cut nivo za "bass kill" tokom prelaza.
// -24 dB low-shelf @ 250 Hz = sub i bass praktično tihi, mid/high netaknuti.
const BASS_KILL_DB = -24;
const BASS_OPEN_DB = 0;

export class AutoMix {
  /**
   * @param {AudioEngine} engine
   * @param {Deck} deckA primary deck
   * @param {Deck} deckB secondary deck za incoming track
   * @param {Array<{url:string, bpm:number, key:string, name:string, bars:number}>} library
   * @param {object} [opts]
   * @param {number} [opts.crossfadeBars=4]   ukupna dužina crossfade-a (4 ili 8)
   * @param {number} [opts.delayBars=1]       koliko bara pred drop kreće half-beat delay (1 ili 0.5)
   * @param {number} [opts.halfBeatPeak=0.7]  intensity half-beat delay-a na drop pripremi
   * @param {number} [opts.bassOpenBeats=1]   za koliko beat-a se otvara bass na incoming na drop-u
   *                                          (default 1 = brzi ramp NA prvom kick-u; 0 = instant pop-risk;
   *                                          2 = stari "ramp preko prvog kick-a" feel)
   * @param {boolean}[opts.useHalfBeatDelay=true]
   * @param {(type:string, data?:object)=>void} [opts.onEvent] debug log callback
   */
  constructor(engine, deckA, deckB, library = [], opts = {}) {
    this.engine = engine;
    this.deckA = deckA;
    this.deckB = deckB;
    this.library = library;
    this.activeDeck = deckA;
    this.cuedDeck = deckB;
    this.lastPlayed = new Set();
    this._barListener = null;

    // crossfade timing — šef brief: "od 4 ili 8 barova tranzicije"
    this.crossfadeBars = opts.crossfadeBars ?? 4;
    this.crossfadeBeats = this.crossfadeBars * 4;

    // delay timing — šef brief: "jedan bar ili pola bara" pred drop
    this.delayBars = opts.delayBars ?? 1;
    this.useHalfBeatDelay = opts.useHalfBeatDelay !== false;
    this.halfBeatPeak = opts.halfBeatPeak ?? 0.7;

    // bass otvaranje na incoming na drop tački — default 1 beat (brz ramp NA
    // prvom kick-u, ne preko prvog kick-a). Šef 2026-05-11: bass treba da bude
    // "na samom prvom kick-u" nove trake.
    this.bassOpenBeats = opts.bassOpenBeats ?? 1;

    // event hook za log/UI
    this.onEvent = typeof opts.onEvent === 'function' ? opts.onEvent : null;

    this._scheduled = null; // marker da ne re-trigger-uje na sledećem baru
  }

  setLibrary(library) {
    this.library = library;
  }

  _log(type, data = {}) {
    if (this.onEvent) {
      try { this.onEvent(type, data); } catch (e) {}
    }
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

    // crossfade start = meta.bars - crossfadeBars
    // (npr. bars=8, crossfadeBars=4 → kreće na bar 4)
    const crossfadeStartBar = meta.bars - this.crossfadeBars;

    if (bar >= crossfadeStartBar && this._scheduled !== meta.url) {
      this._scheduled = meta.url;
      this._scheduleCrossfade();
    }
  }

  /**
   * Izaberi next track, cue na cuedDeck, izvedi klasičnu DJ tranziciju:
   *   bass-cut na outgoing → half-beat delay pred kraj → drop sa bass-on na incoming.
   */
  async _scheduleCrossfade() {
    const next = this.pickNext();
    if (!next) {
      this._scheduled = null;
      return;
    }

    try {
      await this.cuedDeck.load(next.url);
    } catch (e) {
      console.error('AutoMix: failed to load', next.url, e);
      this._scheduled = null;
      return;
    }
    this.cuedDeck.syncTo(this.activeDeck);

    // INCOMING PREPARE: bass je već u cut-u pre nego što počne crossfade.
    // Pojaviće se na drop tački kad otvorimo low EQ.
    this.cuedDeck.setEQ({ low: BASS_KILL_DB });
    this.cuedDeck.setVolume(0);
    this.cuedDeck.play();

    const outDeck = this.activeDeck;
    const inDeck = this.cuedDeck;

    const beatsSec = 60 / (outDeck.meta.bpm * outDeck.playbackRate);
    const barSec = beatsSec * 4;
    const fadeDur = barSec * this.crossfadeBars;
    const delayDur = barSec * this.delayBars;
    const bassOpenDur = beatsSec * this.bassOpenBeats;

    const now = this.engine.ctx.currentTime;
    const crossfadeEnd = now + fadeDur;
    const delayStart = crossfadeEnd - delayDur; // pred poslednji 1 bar / pola bara

    this._log('crossfade:start', {
      crossfadeBars: this.crossfadeBars,
      crossfadeDur: fadeDur.toFixed(3),
      delayStartIn: (delayStart - now).toFixed(3),
      dropAt: crossfadeEnd.toFixed(3),
      delayShouldEndAt: crossfadeEnd.toFixed(3), // wet gain 0 baš na drop tačci
      bassOpenBeats: this.bassOpenBeats,
      bassOpenDur: bassOpenDur.toFixed(3),
      from: outDeck.meta?.name,
      to: next.name,
    });

    // ============================================================
    // 1) VOLUME CROSSFADE — outgoing 1→0, incoming 0→1, linearno
    // ============================================================
    outDeck.deckGain.gain.cancelScheduledValues(now);
    outDeck.deckGain.gain.setValueAtTime(outDeck.deckGain.gain.value, now);
    outDeck.deckGain.gain.linearRampToValueAtTime(0, crossfadeEnd);

    inDeck.deckGain.gain.cancelScheduledValues(now);
    inDeck.deckGain.gain.setValueAtTime(0, now);
    inDeck.deckGain.gain.linearRampToValueAtTime(1, crossfadeEnd);

    // ============================================================
    // 2) EQ BASS RAMP NA OUTGOING — 0 dB → -24 dB kroz ceo crossfade
    //    Šef: "tokom crosfade smanjivati bas trake koja odlazi"
    // ============================================================
    try {
      const outLow = outDeck.eq?.low;
      if (outLow) {
        outLow.gain.cancelScheduledValues(now);
        outLow.gain.setValueAtTime(outLow.gain.value, now);
        outLow.gain.linearRampToValueAtTime(BASS_KILL_DB, crossfadeEnd);
        this._log('eq:bass-out:ramp', { from: 0, to: BASS_KILL_DB, dur: fadeDur.toFixed(3) });
      }
    } catch (e) {
      console.warn('[auto-mix] EQ bass cut na outgoing nije uspeo:', e.message);
    }

    // ============================================================
    // 3) HALF-BEAT DELAY — pred poslednji bar/pola crossfade-a
    //    Šef: "pred 'pucanje', iliti drop basa", "1 bar ili pola bara"
    // ============================================================
    if (this.useHalfBeatDelay) {
      const delayStartMs = Math.max(0, (delayStart - now) * 1000);
      setTimeout(() => {
        try {
          // Auto-decay verzija: aktivira delay za delayBars, ramp-uje sebe na 0
          // pre kraja (right before drop), tako da se eho završi pre nego što
          // krene novi bas. Ako applyForBars ne postoji (older deck), pada na
          // applyHalfBeatDelay + manual setTimeout clear.
          if (typeof outDeck.applyHalfBeatDelayForBars === 'function') {
            outDeck.applyHalfBeatDelayForBars(this.halfBeatPeak, this.delayBars);
          } else {
            outDeck.applyHalfBeatDelay(this.halfBeatPeak);
            // manual clear malo pre drop-a (90% delay duration-a)
            setTimeout(() => {
              try { outDeck.applyHalfBeatDelay(0); } catch (e) {}
            }, delayDur * 0.9 * 1000);
          }
          this._log('delay:on', {
            intensity: this.halfBeatPeak,
            bars: this.delayBars,
            durSec: delayDur.toFixed(3),
          });
        } catch (e) {
          console.warn('[auto-mix] half-beat delay aktivacija pukla:', e.message);
        }
      }, delayStartMs);
    }

    // ============================================================
    // 4) DROP TAČKA — kraj crossfade-a:
    //    a) delay GASI na outgoing
    //    b) BASS OTVARA na incoming (low EQ -24 → 0 za bassOpenBeats)
    //    c) outgoing stop()
    // ============================================================
    const dropDelayMs = fadeDur * 1000;
    setTimeout(() => {
      const tDrop = this.engine.ctx.currentTime;
      this._log('drop:tMinus0', { t: tDrop.toFixed(3) });
      try {
        // a) gasi half-beat delay eksplicitno (i ako applyForBars već radi
        //    auto-decay sa wet=0 NA drop tačci, ovo je belt+suspender —
        //    clearTransitionEffect ramp-uje preostalo na 0 odmah)
        outDeck.clearTransitionEffect();
      } catch (e) {}

      // b) bass open na incoming — low EQ -24 dB → 0 dB
      try {
        const inLow = inDeck.eq?.low;
        if (inLow) {
          const tNow = this.engine.ctx.currentTime;
          inLow.gain.cancelScheduledValues(tNow);
          inLow.gain.setValueAtTime(inLow.gain.value, tNow);
          inLow.gain.linearRampToValueAtTime(BASS_OPEN_DB, tNow + bassOpenDur);
          this._log('eq:bass-in:open', {
            from: BASS_KILL_DB,
            to: BASS_OPEN_DB,
            beats: this.bassOpenBeats,
            durSec: bassOpenDur.toFixed(3),
          });
        }
      } catch (e) {
        console.warn('[auto-mix] bass open na incoming pukao:', e.message);
      }

      // c) outgoing stop + swap
      try { outDeck.stop(); } catch (e) {}

      // reset outgoing low EQ na 0 dB (za sledeću rundu kad ovaj deck postane incoming)
      try { outDeck.setEQ({ low: 0 }); } catch (e) {}

      this._log('drop', { newActive: inDeck.label });

      this.lastPlayed.add(outDeck.meta?.url);
      if (this.lastPlayed.size > 5) {
        const first = this.lastPlayed.values().next().value;
        this.lastPlayed.delete(first);
      }

      // swap decks
      this.activeDeck = inDeck;
      this.cuedDeck = outDeck;
      // reattach bar listener na novi active
      if (this._barListener) {
        this.cuedDeck.off('barEnd', this._barListener);
        this.activeDeck.on('barEnd', this._barListener);
      }
      // reset scheduled flag
      this._scheduled = null;
    }, dropDelayMs + 50); // +50ms buffer da volume ramp završi pre stop()
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
