# Fix Log — Na Vezi

**Beta iter 1 score:** 1.2/10 (3 CRITICAL, 2 MEDIUM, 2 LOW)
**Fix sesija:** 2026-07-24

---

## CRITICAL Bugovi (svi rešeni)

### C1 — Blank screen za 100% korisnika (REŠEN)
**Uzrok:** `src/audio.js:44` — `startAmbientPad()` definisana bez `export` ključne reči, ali `src/main.js:7` je importuje kao named export → ES module SyntaxError ruši ceo import graf pre nego što `init()` ikad pozovemo. Prethodni patch (DOMContentLoaded) nije rešio koren problema.
**Fix:** Dodato `export` ispred `function startAmbientPad()` na liniji 44 u `audio.js`.

### C2 — Macro planning ekran puca odmah pri renderovanju (REŠEN)
**Uzrok:** `_renderMacroStep` u `src/main.js` pozivao `renderMacroPlanningScreen(container, optionsObject)` sa 2 argumenta umesto očekivanih 5 pozicionih. `callbacks = undefined` → `TypeError: Cannot read properties of undefined (reading 'onLockIn')`.
**Fix:** Dodat import za `getDraftPlan, getTotalSteps, nextStep, prevStep, updateDraftPlan` iz `./macro/planning-session.js` i `buyEquipment` iz `./macro/equipment-shop.js`. `_renderMacroStep` prepisan da prosleđuje sve 5 pozicionih argumenata + komplet callbacks (onNext, onPrev, onLockIn, onFormat, onAlloc, onEquip, onGuest) sa ispravnom logikom za svaki korak planiranja.

### C3 — Live emisija dashboard se nikad ne inicijalizuje (REŠEN)
**Uzrok:** `src/main.js:377` pozivao `initDashboardState()` bez argumenata. `dashboard-state.js:47` odmah pristupa `gostInfo.arrived` → `TypeError: Cannot read properties of undefined`. Sve mikro-mehanike (signal, chat, alarmi, timer, EQ) ostajale zamrznute zauvek.
**Fix:** `initDashboardState()` poziv zamenjen sa 4 argumenta iz `getState()`:
```js
const _initSt = getState();
const _initWp = _initSt.weekly_plan;
initDashboardState(_initWp, _initSt.equipment, { arrived: false, gostId: _initWp.chosen_guest_id }, _initWp.weekly_capacity);
```
Bonus fix iz KORAK 6 briga: `lockInPlan()` return vrednost (`{ ok: true }`) ne koristi se više direktno kao `_currentPlan` — plan se čita iz `getState().weekly_plan` posle uspešnog lock-in.

---

## MEDIUM Bugovi (svi rešeni)

### M1 — Signal recovery 8× sporiji od dizajniranog (REŠEN)
**Uzrok:** `passiveSignalRecover(dt)` i `tickSignal(dt)` pozivani sa `dt=1` umesto `GAME_CONFIG.SIGNAL_RECOVER_RATE=8`.
**Fix:** Oba poziva u `_tickMicro` promenjeni na `GAME_CONFIG.SIGNAL_RECOVER_RATE`.

### M2 — Timer pokazuje 45:00 umesto 8:00 (REŠEN)
**Uzrok:** `GAME_CONFIG.EMISIJA_DURATION_SECONDS` ne postoji → fallback `2700` (45 min). Pravi ključ je `GAME_CONFIG.EMISIJA_DURATION = 480` (8 min).
**Fix:** `renderTimer(elapsed, GAME_CONFIG.EMISIJA_DURATION_SECONDS || 2700)` → `renderTimer(elapsed, GAME_CONFIG.EMISIJA_DURATION)`.

---

## LOW Bugovi (logguju se za next pass)

### L1 — `resolveSignalAction` pozvan sa 2 argumenta, ali prima samo 1
Drugi argument se tiho ignoriše — nije štetno, ali mrtav/zbunjujuć kod.

### L2 — Nema top-level error boundary
Jedan typo u ~50 modula reprodukuje prazan crn ekran bez traga. Nema `try/catch` ni fallback UI.

---

## Fajlovi promenjeni
- `src/audio.js` — dodato `export` na `startAmbientPad`
- `src/main.js` — prošireni importi, prepisan `_renderMacroStep`, fiksovano `initDashboardState`, signal recovery rate, timer duration
