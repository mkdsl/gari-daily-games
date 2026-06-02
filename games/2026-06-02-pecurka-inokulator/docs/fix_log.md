# Fix Log — Pečurka Inokulator

**Datum:** 2026-06-02
**Beta iter:** 1 → iter 2

## CRITICAL Fixes

### C1: Blink window klikabilan dok nevidljiv
**Fajl:** `src/systems/collision.js`
**Fix:** Dodana provera `timingState.blinkState === false` — kad je zeleni prozor nevidljiv, klik uvek vraća `miss`. Igrač sada mora pogoditi dok je prozor VIDLJIV.

### C2: `playBlink()` i `playPerfect()` nisu pozivani
**Fajlovi:** `src/main.js`, `src/timing.js`
**Fix:**
- `timing.js: update()` sada vraća `{ tick, blinkToggled }` — prati promenu `blinkState` frame-by-frame
- `main.js`: importuje `playBlink`, `playPerfect`, `resumeAudio`
- `playBlink()` se zove na svakom `blinkToggled` eventu u game loopu
- `playPerfect()` se zove u `levelClear()` kad je `missCount === 0`
- `resumeAudio()` se zove na `visibilitychange` (iOS AudioContext recovery)

### C3: Nivo 10 `all_combined` bez multi-bag layouta
**Fajlovi:** `src/config.js`, `src/entities/bag.js`
**Fix:**
- `config.js`: Nivo 10 dobio `multiCount: 2`
- `bag.js`: `createBagsForLevel` sada handluje `all_combined` isti kao `multi_bag_2` (2 simultane vreće)
- Nivo 10 je sada pravi climax: blink + fake + golden + 2 simultane vreće

## MEDIUM Fixes

### M1: Direction change nivo 3 nije radio
**Fajl:** `src/entities/window.js`
**Fix:** Uklonjen `'direction_change'` iz `usesSinusoid` uslova. Nivo 3 sada koristi linearni mod gde `dirChangeTimer` menja `this.direction` — nasumični smjer promjene se sada stvarno primenjuje.

### M2: Level clear auto-advance bez vizuelnog indikatora
**Fajlovi:** `src/ui.js`, `styles/ui.css`
**Fix:** Dodat `<div class="lc-countdown-bar">` sa CSS animacijom `lc-drain` (3s linear scaleX 1→0). Igrač vidi zelenu liniju koja se prazni — jasno komunicira da se ekran zatvara sam.

### M3: Perfect bonus bez audio FX — **rešeno u C2 fix-u** (`playPerfect()`)

## LOW Fixes

### L1: iOS AudioContext recovery
**Fajl:** `src/main.js`
**Fix:** `document.addEventListener('visibilitychange', resumeAudio)` — rešeno u C2 fix-u.

## Nije fiksirano (LOW, slednji pass)

- `renderLivesCanvas()` dead code u `render.js` — ne utiče na gameplay
- `isPerfectLevel()` dead export u `progression.js` — ne utiče na gameplay
- Daily highscore reset objašnjenje na UI — UX poboljšanje, nije bloker
- Game over progress vizualizacija — engagement poboljšanje
