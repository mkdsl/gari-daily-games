# Fix Log — Na Vezi (polish, krug 1)

Izvor: `docs/beta_report.md` (ocena 1.2/10, 3 CRITICAL + 2 MEDIUM + 2 LOW).

## Rešeno

**Bug #1 (CRITICAL — boot failure)** — commit `1839082` (prethodna sesija)
- `src/audio.js:44` — `startAmbientPad` nije bila exportovana iako je `main.js` importuje kao named export → SyntaxError ruši ceo module graf, `init()` se nikad ne pozove.
- Fix: dodat `export` ispred `function startAmbientPad()`.

**Bug #2 (CRITICAL — macro planning ekran crash)**
- `src/main.js` je pozivao `renderMacroPlanningScreen(container, {options})` sa 2 argumenta, dok `src/ui.js:226` zahteva 5 pozicionih parametara (`screen, draftPlan, currentStep, totalSteps, callbacks`).
- Fix: `_renderMacroStep()` u `main.js` sada čita `getDraftPlan()`, `getCurrentStep()`, `getTotalSteps()` iz `planning-session.js` i sastavlja `callbacks` objekat (`onFormat`, `onAlloc`, `onEquip`, `onGuest`, `onNext`, `onPrev`, `onLockIn`) koji odgovara onome što `ui.js` očekuje. `onFormat`/`onAlloc`/`onEquip`/`onGuest` su ožičeni na `updateDraftPlan`, `setAllocation`, `buyEquipment`, `bookGuest` (novi import-i u `main.js`).

**Bug #3 (CRITICAL — macro→micro handoff)**
- `src/macro/planning-session.js:lockInPlan()` je vraćao samo `{ ok: true }`, bez stvarnog plana; `main.js` je čuvao taj prazan objekat kao `_currentPlan`.
- `src/main.js:_startMicro()` je pozivao `initDashboardState()` bez argumenata, dok `dashboard-state.js` zahteva `(plan, equipment, gostInfo, weeklyCapacity)` i odmah čita `gostInfo.arrived` → TypeError, cela mikro-inicijalizacija se nikad ne završi.
- Fix: `lockInPlan()` sada vraća `{ ok: true, plan }` gde `plan` sadrži i camelCase alias-e (`platformAlloc`, `guest`, `offgridCapacity`) koje micro sloj očekuje. `_startMicro(plan)` sada gradi `gostInfo` i `weeklyCapacity` i prosleđuje sva 4 argumenta u `initDashboardState()`.

**MEDIUM — signal recovery 8x presporo**
- `main.js` je pozivao `passiveSignalRecover(dt)` / `tickSignal(dt)` sa `dt` (≈1) umesto sa stopom oporavka.
- Fix: pozivi sada koriste `GAME_CONFIG.SIGNAL_RECOVER_RATE` (8).

**MEDIUM — tajmer pogrešna dužina emisije**
- `main.js` je referencirao nepostojeći `GAME_CONFIG.EMISIJA_DURATION_SECONDS` (fallback 2700 = 45:00) dok je stvarni kraj emisije `GAME_CONFIG.EMISIJA_DURATION` (480s = 8min) — tajmer bi pokazivao pogrešno preostalo vreme.
- Fix: `renderTimer` sada koristi `GAME_CONFIG.EMISIJA_DURATION` direktno.

## Ostavljeno za next pass (LOW, ne blokira first-impression)

- `resolveSignalAction(action)` prima 1 parametar ali se poziva sa 2 na više mesta u `main.js` — drugi argument se tiho ignoriše, nije štetno.
- Nema top-level `try/catch` oko `init()` / import lanca — jedan budući typo bi mogao ponovo da izazove tihi "crn ekran" bez traga u konzoli.

## Verifikacija

Sve funkcije/signature na koje se novi pozivi oslanjaju su ručno unakrsno provereni u izvoru pre commit-a: `renderMainScreen(onStart)`, `renderWeeklyBriefing(screen, capacityResult, onContinue)`, `getTotalSteps/updateDraftPlan/nextStep/prevStep` (`planning-session.js`), `setAllocation` (`platform-allocation.js`), `buyEquipment` (`equipment-shop.js`), `bookGuest` (`guest-booking.js`), `GAME_CONFIG.EMISIJA_DURATION`/`SIGNAL_RECOVER_RATE` (`config.js`) — sve postoje i signature se poklapaju sa novim pozivima.

Sledeći korak: Beta Trio iter 2 na `play_url` (živi test, ne code review).
