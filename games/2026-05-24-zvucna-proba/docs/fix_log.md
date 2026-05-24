# Fix Log — Zvučna Proba: Beta Iteration 2

Date: 2026-05-24  
Author: Jova jQuery (GDG implementator)  
Report source: Beta Trio report

---

## CRITICAL

### Bug 1 — `progression.js`: `isDouble` flag neispravno postavljen

**Problem:** `isDouble = config.bossType === 'double'` → za rundu 9 (`bossType: 'trap'`) je `false`, iako problem ima `filterType: 'double'`. Correction faza prikazuje samo jednu osu, ignorišući drugu.

**Fix:** Promenjena logika u:
```js
const isDouble = config.bossType === 'double' || problem.filterType === 'double';
```
Sada `isDouble` postaje `true` i kad sam problem ima `filterType: 'double'`, bez obzira na `bossType`.

---

### Bug 2 — `input.js`: Ghost tap / dvostruki handler na mobilnom

**Problem:** `touchend` poziva `handler()` i `e.preventDefault()`, ali browser i dalje generiše sintetički `click` ~300ms posle. Stari guard (`if (!touchStarted)`) nije funkcionisao jer je `touchStarted` već `false` u tom momentu.

**Fix:** Dodat `touchFired` boolean flag koji se postavlja u `touchend` i briše posle 400ms (ili odmah u `click` handleru). `click` handler sada proverava `touchFired` i swallows sintetički click:
```js
if (touchFired) { touchFired = false; clearTimeout(...); return; }
```

---

## MEDIUM

### Bug 3 — `main.js`: `timeBonus` mrtav feature

**Problem:** `state.timerStart` nije resetovan pri ulasku u correction fazu. `elapsed` u `confirmCorrection()` uključivao je i vreme slušanja snippeta i vreme dijagnoze — time bonus je uvek bio minimalan.

**Fix:** Dodano na početku `showCorrectionPhase()`:
```js
state.timerStart = performance.now();
```
Sada `elapsed` meri samo vreme correction odgovora.

---

### Bug 4 — `ui.js`: `showRoundResult` timeout bez ID-a

**Problem:** `setTimeout(startRound, 1800)` bez čuvanja ID-a. Restart tokom overlay-a pozivao `startRound` dva puta — jednom iz starog timeouta, jednom iz novog.

**Fix:** Timeout ID se čuva na `state_ref.roundResultTimeout`. U `restartGame()` (main.js) dodan `clearTimeout(state.roundResultTimeout)` pre `startGame()` poziva.

---

### Bug 5 — `config.js`: Tolerancija uvek prolazi OK opciju

**Problem:** `tolerance: 1` dozvoljava `ok` (numerička vrednost 0) da prođe za bilo koji target. Pošto su svi targeti `-1` (smanjiti) ili `+1` (pojacati), razlika od `ok` je uvek 1 — što je unutar tolerancije. Igra je bila prelagana.

**Fix:** `tolerance` promenjeno na `0` za runde 1-5 (i boss runde 3 i 9 koje su već imale 0). Runde 7-8 zadržavaju `tolerance: 1` kao blaga proba za prelaz. Runde 6, 9, 10 ostaju `tolerance: 0`.

---

### Bug 6 — `eq_bank.js`: Sve tri boss runde isti EQ problem

**Problem:** Stari mapping `[0, 1, 7, 2, 3, 7, 4, 5, 7, 6]` slao sve tri boss runde (indeksi 2, 5, 8) na isti `double_boost` problem (index 7).

**Fix:** Dodata su 3 distinktna boss problema (indeksi 7, 8, 9):
- **Index 7** (Boss 3, runda index 2): `boss3_boom_sharp` — lowshelf 120Hz +9dB + highshelf 8kHz +10dB
- **Index 8** (Boss 6, runda index 5): `boss6_sub_presence` — lowshelf 60Hz +12dB + peaking 3kHz -10dB
- **Index 9** (Boss 9, runda index 8): `boss9_smiley` — originalni double_boost (lowshelf 100Hz + highshelf 10kHz)

Nov mapping: `[0, 1, 7, 2, 3, 8, 4, 5, 9, 6]`

---

## LOW

### Typo fix — `eq_bank.js`: "preooostre" → "preooštre"

Svi distractor stringovi i diagnosis stringovi koji su sadržali `preooostre` ispravljeni u `preooštre`.

### GLOSSARY — dodat ključ 'Mid-bas'

```js
'Mid-bas': 'Mid-bas = 150-300 Hz — punoća zvuka, ali i mulj ako je preglasan.',
```

---

## Fajlovi promenjeni

| Fajl | Bugovi |
|------|--------|
| `src/systems/progression.js` | Bug 1 |
| `src/input.js` | Bug 2 |
| `src/main.js` | Bug 3, Bug 4 (clearTimeout) |
| `src/ui.js` | Bug 4 (save timeout ID) |
| `src/config.js` | Bug 5 |
| `src/content/eq_bank.js` | Bug 6, typo, GLOSSARY |
| `docs/fix_log.md` | (ovaj fajl) |
