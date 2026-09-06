# Fix Log — Jesenji Tok (posle Beta Iter 1)

**Datum:** 2026-09-06
**Beta score iter 1:** 6.5/10
**Fixer:** Gari (direktno — 3 ciljane izmene u 2 fajla)

---

## CRITICAL fix — Achievements se brišu na svakom novom runu

**Bug:** `handlePlayAgain` i `handlePrestige` u `src/main.js` oba pozivaju `state = createState()` čime se `state.achievements` resetuje na `{}`, zatim `saveState()` overwrite-uje localStorage. Nijedan achievement nije preživljavao prelaz između runova — uključujući `prestige_3` koji zahteva inter-run praćenje.

**Fix:** Pre `createState()` sačuvaj `savedAchievements = { ...state.achievements }`, pa ih vrati na novi state. Obe putanje (play-again i prestige-confirm) su popravljene.

**Fajlovi:** `src/main.js` (handlePlayAgain L656–669, handlePrestige callback L684–700)

---

## MEDIUM fix — Eco bonus i hot penalty indikatori uvek prazni u breakdown tabeli

**Bug:** `src/ui/score-screen.js` koristio `b.eco_bonus` i `b.penalty` ali `scoring.js` eksportuje `b.ecosystem_bonus_applied` i `b.hot_penalty_applied`. Mismatch → uvek `undefined` → 🌿 i ⚠️ nikad se ne prikazuju u bura animaciji ni u breakdown tabeli.

**Fix:** Preименовano na 4 mesta u `src/ui/score-screen.js`:
- L151: `eco_bonus` → `ecosystem_bonus_applied`
- L152: `penalty` → `hot_penalty_applied`
- L386: `eco_bonus` → `ecosystem_bonus_applied`
- L387: `penalty` → `hot_penalty_applied`

**Fajlovi:** `src/ui/score-screen.js`

---

## MEDIUM fix — Forecast reveal mechanic nije bio wiran

**Bug:** `FORECAST_FIRST_ASSIGN_REVEAL = 1` definisano u config.js, `revealForecast()` postoji u `systems/weather.js`, tutorijal obećava "Ostalo se otkriva postepeno" — ali `handleAssign` nikad nije pozivao `revealForecast()`. Igrač bez `full_forecast` prestige-a je uvek video samo 3 nedelje prognoze.

**Fix:** U `handleAssign` posle `assignTask()` dodati:
```javascript
revealForecast(state.weather, FORECAST_FIRST_ASSIGN_REVEAL);
renderForecastBar(state);
```
Plus dodate odgovarajući importi (`FORECAST_FIRST_ASSIGN_REVEAL` iz config.js, `revealForecast` iz systems/weather.js).

**Fajlovi:** `src/main.js` (handleAssign, importovi)

---

## LOW (logovano za next pass, nije ušlo u ovaj fix)

- `skipPrestige(state)` call u `handlePlayAgain` je dead code (L657 originalno — uklonjeno zajedno sa fix-om achievements)
- `is_new_best` uvek false — zaobilazna logika u score-screen radi, cleanup odložen
- `checkEcoBonusFeasibility` dead export u validation.js
- `total_runs` praćen na dva mesta koja divergiraju
- Escape na score overlay bez feedback-a za igrača
