# Beta Report: Frekventni Grad

## Zora — UX Ugao

**Pozitivno:** Menu ekran prikazuje naslov i "Pritisni bilo koji taster" — dovoljno jasno za početak. Lane key labele (A/S/D) su u HUD-u iznad timing linije što je dobar onboarding hint. Night Summary ekran prikazuje PERFECT/GOOD/MISS count što daje jasnu povratnu informaciju.

**Problemi:**
- Nema vizuelnog tutoriala — prvi beat dolazi na 110 BPM bez uvoda. Igrač nema vremena da shvati mehaniku pre nego što ga energija počne kažnjavati.
- Energy bar je na dnu ekrana (8px visine) — premalo je vizuelno za stresnu situaciju. Igrač ne primećuje da mu pada energija dok nije prekasno.
- Mobile: touch zone su horizontalne trećine celog ekrana što je OK, ali nema vizuelnog indikatora gde su zone (nema labels na touch ekranu).

## Raša — Tehnički Ugao

**Arhitektura je čista:** AudioContext.currentTime se koristi konzistentno u scheduling-u i scoring-u. BeatScheduler lookahead pattern je ispravan. Prune logika za dead beats je solidna.

**Pronađeni bugovi:**

**BUG 1 (KRITIČAN): `applyEnergyDelta('MISS')` se poziva za svaki pogrešan taster**
`systems/index.js` linija 63 — `applyEnergyDelta(state, result)` se poziva i kada `result === 'MISS'` iz `processHit`. `processHit` vraća 'MISS' ne samo kada beat postoji ali je propušten, nego i kada igrač tapuje na praznoj lani ili pre prvog beata. Rezultat: -8 energy na svako pogrešno tapanje, nezavisno od toga da li postoji beat ili ne. Igrač koji tapuje entuzijastično gubi igru brzo.

**BUG 2 (KRITIČAN): AudioContext može ostati suspended**
`main.js` — `new AudioContext()` je suspendovan u Chrome/Firefox/Safari dok ne dođe user gesture. `startGame()` kreira AudioContext ali ne poziva `await audioCtx.resume()`. Ako AudioContext ostane suspended, `audioCtx.currentTime` ne napreduje — svi beatovi se schedluju na t=0, igra je neigriva.

**BUG 3 (SREDNJI): Prestige check se izvršava pre inkrementiranja `totalNightsPlayed`**
`main.js` — `transitionToNextSong()` proverava `if (state.totalNightsPlayed >= CONFIG.PRESTIGE_AFTER_NIGHTS)` pre poziva `endNight()`. Ali `endNight()` je ta koja inkrementiše `totalNightsPlayed++`. Dakle, prestige se nikad ne okida jer check je uvek 1 ispod praga. (Manje urgentno jer prestige ionako dolazi posle 20 noći — igrač ga retko doživi.)

**Radi dobro:**
- `scheduleBeatLookahead` ispravno koristi `state.schedulerHead` — nema duplikata
- `checkMissed` vraća `true`/`false` što `index.js` pravilno koristi za `newMisses`
- `getSong` vraća `undefined` za TODO klubove, a `startSong` hvata to sa `if (!song) { endNight(); return; }` — nema crash

## Lela — Fun/Engagement Ugao

**Core feel:** Neon vizuelni identitet je jak. Sonar ring eksplozija za PERFECT će biti zadovoljavajuća. Combo × multiplier sistem daje reason to continue.

**Engagement rizici:**
- Prva pesma na 110 BPM sa samo centar lane-om je solidna gradacija ali nema "practice beat" bez penalizacije — energija pada i na prvom beatu ako igrač krene da tapuje pre vremena (zbog Bug 1).
- Noć traje 3 pesme × ~90 sekundi = ~4-5 minuta što je natural break point — dobro.
- Night Summary ekran daje closure po noći. Nema reason-to-continue-next-session osim highscore (nema unlock notification za novi klub).

## TOP 3 Kritična Buga (za Jovu)

### Bug 1: Igrač gubi energiju na svaki pogrešan taster
**Fajl:** `src/systems/index.js`
**Problem:** Linija 63 — `applyEnergyDelta(state, result)` se poziva čak i kada `result === 'MISS'` iz `processHit`. `processHit` vraća 'MISS' i kada nema nikakvog beata u toj lani, ne samo kada je beat propušten. Igrač gubi -8 energy za svaki tap u prazno.
**Fix:** Promeni logiku u `index.js`. Umesto `applyEnergyDelta(state, result)` za svaki processHit, samo pozovi za PERFECT/GOOD:
```js
if (result !== 'MISS') {
  applyEnergyDelta(state, result);
}
```
Energy penalizacija za propuštene beatove dolazi isključivo iz `newMisses` loop-a (automatski misses).

### Bug 2: AudioContext suspend blokira start igre
**Fajl:** `src/main.js` — funkcija `startGame()`
**Problem:** `new AudioContext()` je inicijalno suspended. `audioCtx.currentTime` ne napreduje. Beat scheduler puni sve beatove na t=0 i igra se ne može igrati.
**Fix:** Posle `audioCtx = new AudioContext()`, dodaj:
```js
if (audioCtx.state === 'suspended') {
  await audioCtx.resume();
}
```

### Bug 3: Prestige check pre inkrementa totalNightsPlayed
**Fajl:** `src/main.js` — funkcija `transitionToNextSong()`
**Problem:** Prestige check je pre `endNight()` koji inkrementiuje `totalNightsPlayed`. Prestige se nikad ne okida.
**Fix:** Premesti prestige logiku u `endNight()`, posle `state.totalNightsPlayed++`:
```js
function endNight() {
  stopBassLoop();
  stopArpeggio();
  playNightEnd(audioCtx);
  state.totalNightsPlayed++;
  if (state.totalNightsPlayed >= CONFIG.PRESTIGE_AFTER_NIGHTS) {
    handlePrestige();
  }
  state.gamePhase = 'night_summary';
  saveState(state);
}
```
I ukloni prestige check iz `transitionToNextSong`.

## Nice-to-have (ignoriši za sada)
- Beat patterns za Krov, Metro, Orbita (trenutno TODO stubs — igra završava posle Podruma)
- `hitRingAge += 0.016` bi trebao koristiti pravi `dt` iz game loop-a
- Vizuelni indikator touch zona na mobilnom
- "Unlock" animacija pri prelasku na novi klub
- Energy bar vizuelno veći na malim ekranima

## Beta Score
**6/10** — Vizuelni identitet i arhitektura su jaki. Bug 1 i Bug 2 su showstopperi koji blokiraju igranje za većinu korisnika. Sa 3 fixa, igra je sprema za release.
