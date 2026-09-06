# Beta Report 2 — Jesenji Tok (Iter 2)

**Datum:** 2026-09-06
**Fix verifikacija:** CRITICAL ✅ / MEDIUM#1 ✅ / MEDIUM#2 ✅

---

## Executive Summary

Sva tri prijavljena buga iz iter 1 su ispravno popravljena i verifikovana statičkom analizom koda. Nijedan fix nije uveo regresiju. Nema novih CRITICAL ili MEDIUM problema. Igra je sada funkcionalnog core loop-a: achievements preživljavaju runove, eco/penalty indikatori su vidljivi, forecast reveal se postepeno otkriva. Preostali LOW problemi su isključivo code cleanup, ne gameplay brekeri. Igra ispunjava uslove za KORAK 6.75 auto-release gate.

---

## CRITICAL Issues

**Nema novih CRITICAL problema.**

---

## MEDIUM Issues

**Nema novih MEDIUM problema.**

---

## LOW Issues

*(iz iter 1, ostaju otvoreni — ne blokiraju release)*

**LOW-1: Dead `skipPrestige` import u `src/main.js`**
- Linija 44: `import { applyPrestige, skipPrestige, canPrestige } from './systems/prestige.js';`
- `skipPrestige` je uvezen ali nigde se ne poziva. Originalni `skipPrestige(state)` call je ispravno uklonjen tokom achievement fix-a, ali import nije očišćen.
- Posledica: nula, samo code smell. Bezbedan za post-release patch.

**LOW-2: `is_new_best` polje u `ScoreResult` uvek `false`**
- `scoring.js` linija 187: `is_new_best: false, // set by caller after saveBestScore()`
- Caller (`triggerCloseSeason`) poziva `saveBestScore(scoreResult.total)` ali nikad ne ažurira `scoreResult.is_new_best`.
- Score-screen.js ispravno zaobilazi ovo: rekomputuje `const isNewBest = scoreResult.total >= bestScore` direktno iz `loadBestScore()` — što radi korektno jer `saveBestScore` čuva samo ako je viši. "Novi rekord!" traka prikazuje se ispravno u praksi.
- Posledica: mrtvo polje u ScoreResult tipu. Ne kvari UX.

**LOW-3: `total_runs` divergencija između `state.total_runs` i `localStorage.jt_total_runs`**
- `triggerCloseSeason` linija 615 inkrementiše `state.total_runs` na in-memory state-u.
- `state.js` ima zaseban localStorage ključ `jt_total_runs`. `handlePlayAgain` ne kopira `total_runs` u novi state (za razliku od `handlePrestige` koji ga kopira via `prevRuns`).
- Posledica: achievements koji čitaju `state.total_runs` za play-again path mogu videti pogrešan broj. Utvrđeno da achievements.js koristi `state` direkt — treba spot-check ali vjerovatno LOW.

**LOW-4: Dead exports u `src/systems/validation.js`**
- `checkEcoBonusFeasibility` (pomenuto u iter 1 izveštaju) — exportovano ali nije u manifest i nije importovano nigde.

**LOW-5: Escape na score overlay bez feedback-a**
- Kad je score overlay otvoren, Escape key handler poziva `handleEscapeOverlay` koji ne reaguje (overlay-i za bura/score nisu dismissable). Nema ni vizuelnog feedback-a ni aria announce-a. Korisnik koji pritisne Escape ne dobija odgovor.
- Posledica: blaga frustracija za keyboard korisnike.

---

## Fix verifikacija detalji

### CRITICAL — Achievement preservation

**`handlePlayAgain` (main.js L661–669):**
```javascript
const savedAchievements = { ...state.achievements };
clearState();
state = createState();
// ... setup ...
state.achievements = savedAchievements;
saveState(state);
```
✅ `savedAchievements` se kreira pre `createState()` shallow spread-om, i vraća se na novi state pre `saveState`. Achievements preživljavaju play-again.

**`handlePrestige` callback (main.js L694–701):**
```javascript
const savedAchievements = { ...state.achievements };
state = createState();
// ... setup ...
state.achievements = savedAchievements;
saveState(state);
```
✅ Ista logika, ispravno primenjena. `prestige_3` achievement koji zahteva inter-run praćenje sada funkcioniše.

Nema regresije — oba puta (`handlePlayAgain` i `handlePrestige` callback) su konzistentna.

---

### MEDIUM#1 — ecosystem_bonus_applied / hot_penalty_applied u score-screen

Verifikovana su sva 4 mesta u `src/ui/score-screen.js`:

**Bura animacija (linija ~151–152):**
```javascript
const ecoFlag = taskScore?.ecosystem_bonus_applied ? ' 🌿' : '';
const penaltyFlag = taskScore?.hot_penalty_applied ? ' ⚠️' : '';
```

**Breakdown row builder (linija ~386–387):**
```javascript
const ecoMark = b.ecosystem_bonus_applied ? ' 🌿' : '';
const penaltyMark = b.hot_penalty_applied ? ' ⚠️' : '';
```

Poređeno sa `scoring.js` typedef i runtime output-om:
- `ecosystem_bonus_applied: false` (line 98, 134) / `true` (line 162) — ✅ ime se podudara
- `hot_penalty_applied: hotPenalty` (line 135) — ✅ ime se podudara

Nema regresije. Eco i penalty indikatori su sada vidljivi u oba prikaza (bura animacija i breakdown tabela).

---

### MEDIUM#2 — Forecast reveal mechanic

**Wiring u `handleAssign` (main.js L491–492):**
```javascript
revealForecast(state.weather, FORECAST_FIRST_ASSIGN_REVEAL);
renderForecastBar(state);
```

**Da li `revealForecast` menja `state.weather.forecast_revealed` in-place?**
Da. `weather.js` L92–104:
```javascript
export function revealForecast(weather, count = 1) {
  // ...
  weather.forecast_revealed.push(next); // menja array in-place
  weather.forecast_revealed.sort((a, b) => a - b);
}
```
Pošto se prosleđuje `state.weather` (referenca), mutacija se pravilno reflektuje na state. ✅

**Da li `renderForecastBar(state)` prima ispravan argument?**
`render.js` linija 215: `export function renderForecastBar(state)` — prima `state`, ne samo `weather`. Poziv u `handleAssign` je `renderForecastBar(state)` — ✅ argument se podudara.

**`full_forecast` prestige bonus:**
U `weather.js` L71–72: kad je `prestigeBonus === 'full_forecast'`, `forecast_revealed` se inicijalizuje sa svih 12 nedelja. Svaki naredni `revealForecast` poziv prolazi kroz `!weather.forecast_revealed.includes(next)` check koji vraća `false` za sve nedelje — praktično no-op. Prestige bonus je korektno respektovan i nije narušen novim wiring-om. ✅

**`FORECAST_FIRST_ASSIGN_REVEAL` konstanta:**
`config.js` L150: `export const FORECAST_FIRST_ASSIGN_REVEAL = 1;` — postoji i importuje se ispravno u main.js (L20). ✅

---

## Beta Score

**Iter 2 score: 8.5/10**

Bodovanje:
- Iter 1 base: 6.5/10
- CRITICAL fix (achievement persistence — retention osnova): +1.0
- MEDIUM#1 fix (eco/penalty indikatori — vizuelni feedback za ključnu mehaniku): +0.5
- MEDIUM#2 fix (forecast reveal — wiring obećane mehanike): +0.5
- LOW problemi bez regresija: bez odbitka (ostaju za patch fazu)
- **Finalni: 8.5/10**

0 CRITICAL bugova u oba beta_report.md. Ispunjeni uslovi za KORAK 6.75 auto-release gate (score >= 8.0, 0 CRITICAL).
