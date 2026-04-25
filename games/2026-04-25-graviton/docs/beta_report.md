## BETA TEST REPORT — Graviton

### Ukupna ocena: 6.5/10

*(Code review — igra još nije deployovana; Gari lično prošao kroz kod pošto su subagenti timeout-ovali)*

---

### Zora (UX): 7/10

**Šta radi dobro:**
- Start screen jasno komunicira "TAP / SPACE to start" sa blinking CTA animacijom
- End screen prikazuje CRASHED AT, BEST TIME, NEW RECORD, milestone oznake (★ GOLD / ✦ PLATINUM)
- HUD: vreme gore-levo, SPD X gore-desno — minimalistički i čitljiv
- G-overload progress bar na dnu ekrana (samo od zone 4) — suptilan, ne ometa
- Mobile: canvas scale u CSS-u, `touch-action: none` na body, `touchstart` sa `preventDefault` na canvas-u

**Problemi:**
- Tutorial zone 1 je potpuno prazna — novom igraču nije jasno šta se dešava (nema poruke "PRESS SPACE TO FLIP")
- Na end screenu, CRASHED AT i BEST su skupa bez dovoljno razmaka pri `current_score = 0` (edge case: umreti odmah u tutorialu)

**Bug list:**
- `renderEndScreen` poziva `formatTime(state.current_score)` — ako igrač odmah umre, `current_score = 0` pa piše "CRASHED AT 0:00" što izgleda apsurdno ali je tehnički ispravno

---

### Raša (Tehničko): 6/10

**Šta radi:**
- Collision detection: `circleIntersectsRect` closest-point metoda — korektna. `circleIntersectsCircle` — korektna
- Gravity/scroll physics: formula jasna, deltaTime clamped na 50ms, lepo
- Generator constraint logika: no-repeat, no-buzzsaw prvih 3 gameplay zona, CALM_OPEN injekcija — sve implementirano
- State reset: `resetState` pravilno čuva `best_score` između restarta

**Šta puca (3 buga):**

**BUG 1 (CRITICAL): `audio.js:134` — missing `clearTimeout` u `playBeepWarning`**

`playBeepWarning(ratio)` se poziva iz `main.js` svakog frame-a (60fps) dok je `g_overload_ratio >= 0.5`.
Unutar funkcije: `_beepTimer = setTimeout(() => playBeepWarning(...), interval)` — ali stari `_beepTimer`
se NIKAD ne clea pre pisanja novog. Nakon 1 sekunde beep-ovanja = 60 paralelnih setTimeout lanci,
svaki pokušava da pušta zvuk. Rezultat: audio haos.

Fajl: `src/audio.js:134`, `src/main.js:222-224`

```js
// FIX u audio.js — dodati pre line 135:
if (_beepTimer !== null) {
  clearTimeout(_beepTimer);
  _beepTimer = null;
}
```

**BUG 2 (CRITICAL): `generator.js` — zone pool iscrpljuje se posle ~100 zona**

`initGenerator` generiše tačno 100 zona. `spawnZones` prestaje da spawna kad je `next_zone_pool_idx >= zone_pool.length`.
Pri max scroll brzini (360 px/s), 100 zona × 800px = 80,000px / 360 = ~222 sekunde (~3.7 min).
Platinum milestone zahteva 600 sekundi — igrač bi posle ~222s igrao kroz prazan koridor.

Fajl: `src/systems/generator.js:143-173`

Fix: povećati pool na 500 zona, ili generisati novo kad se pool iscrpi.

**BUG 3 (MEDIUM): `render.js:220-221` — vizualni/collision 8px offset**

`physics.js` i `collision.js` tretiraju `brod.x, brod.y` kao **centar** hitbox-a.
`render.js:220-221` dodaje +8 na oba: `cx = brod.x + 8; cy = brod.y + 8` — tretira ih kao gornji levi ugao.

Rezultat: vizuelni trokut brod je 8px desno i 8px dole od collision hitbox-a. Igrač vidi da prođe
pored prepreke ali igra kaže "hit". Ili suprotno — vizuelno udari a igra ne registruje.

Fajl: `src/render.js:220-221`

```js
// FIX: brod.x i brod.y su centar — ne dodavati +8
const cx = brod.x;
const cy = brod.y;
```

**Bug list:**
- `audio.js:134` — timer leak, višestruki beep lanci (CRITICAL)
- `generator.js:143` — pool exhaust ~222s pri max speed (CRITICAL)
- `render.js:220-221` — 8px visual/collision offset (MEDIUM)
- `main.js:208` — floor/ceil death check uvek fires i za tutorial zone (pošto physics ih klampuje na boundary) — ali `zone_index < CONFIG.G_OVERLOAD_ACTIVE_FROM_ZONE` guard to rešava, OK

---

### Lela (Engagement): 6.5/10

**Šta radi dobro:**
- "Još jedan pokušaj" loop je solidan — short death, instant restart
- G-overload color progression (bela → žuta → crvena) je vizuelno elegantna
- Proceduralni generator sa 8 šablona + CALM_OPEN injekcijom daje percepciju raznolikosti
- Speed level raste svakih 60s — igrač oseća da igra postaje teža

**Problemi:**
- Tutorial zone 1 (potpuno prazna) ne daje igraču nikakav osećaj svrhe — samo leti kroz prazan koridor
- Bez vizuelnog feedback-a pri prolasku kroz zonu (particles, flash) — igra je vizuelno suva
- Nema zvučnog feedback-a za speed level-up osim arpeggia koji se možda ni ne čuje u haosu

**Predlozi (nice-to-have):**
- Kratka poruka "FLIP!" u tutorial zoni 1 (canvas tekst, nestaje posle 2s)
- Particle efekt pri prolasku pored prepreke (close call feedback)
- Screen flash (kratki zeleni bljesak) pri speed level-up

---

### TOP 3 kritična problema (blocker za release)

1. **`src/audio.js:134` — Timer leak u `playBeepWarning`**: Poziva se 60x/s iz main.js, svaki poziv kreira novi `setTimeout` bez clearing starog. Posle par sekundi G-overload beep-ovanja: deseci paralelnih audio lanaca = audio haos koji kvari iskustvo. **Fix: dodati `clearTimeout(_beepTimer)` pre novog `setTimeout`.**

2. **`src/systems/generator.js:143` — Zone pool exhaust**: Pool od 100 zona se iscrpljuje za ~222s pri max speed. Platinum milestone (600s) fizički nije dostižan sa preprekama. **Fix: povećati `initGenerator` da generiše 500 zona, ili dodati refill logiku u `spawnZones`.**

3. **`src/render.js:220-221` — Visual/collision 8px mismatch**: `brod.x/y` su centar u physics/collision, ali render.js ih tretira kao top-left (+8 offset). Brod se vizuelno ne poklapa sa kolizijom. **Fix: ukloniti `+8` iz `cx` i `cy` u `renderPlayer`.**

---

### TOP 3 "nice to have" (ako ima vremena)

1. Poruka "↑↓ FLIP!" u tutorial zoni 1 — 2s fade-out, canvas tekst — drastično poboljšava onboarding
2. Particle efekt pri close call (brod prođe unutar 20px od prepreke) — juice
3. Screen shake intenzitet skaliran sa death_reason: G-OVERLOAD = duži shake od obstacle — čitljivije
