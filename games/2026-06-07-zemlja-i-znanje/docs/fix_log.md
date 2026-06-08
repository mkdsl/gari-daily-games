# Fix Log — Zemlja i Znanje
## Datum: 2026-06-08

### B1 CRITICAL — tickClock return type fix
- Fajl: src/micro/session-state.js:49
- Fix: `return 0` zamenjeno sa `return { minutesElapsed: 0, slotChanged: false, newSlot: _micro ? _micro.currentSlot : 0 }`. Pozivajući kod u session-runner.js:64 destrukturira objekat — vraćanje broja uzrokovalo je da sve tri varijable budu `undefined`, što se propagiralo u `updateParticipants` i `updateModuleProgress` na prvoj pauzi/kraju sesije.

### B2 CRITICAL — SESSION_END race condition fix
- Fajl: src/micro/session-runner.js:162 (endSession) i :188 (click handler)
- Fix: Uklonjen `bus.emit(EVT.SESSION_END, ...)` iz `endSession()`. Emitovanje prebačeno u "Nastavi →" click handler unutar `showEvaluationOverlay()`. `EVT.SCREEN_CHANGE` uklonjen iz click handler-a jer `main.js:onSessionEnd()` već zove `navigateTo('season_summary', ...)` direktno — ostavljanje oba uzrokovalo bi dvostruku navigaciju, drugi put bez data-a.

### B5 MEDIUM — save/load version:1 fix
- Fajl: src/save.js:12, 44
- Fix: `saveMacro()` i `saveMicro()` sada serijalizuju `{ ...state, version: 1 }` umesto direktnog `state`. `loadMacro()` i `loadMicro()` proveravaju `data.version !== 1` — bez ovog fix-a uvek vraćali `null`, brisući meta progresiju na svakom page refresh-u.

### B4 MEDIUM — refreshTimeline off-by-one fix
- Fajl: src/macro/planning-ui.js:346
- Fix: Iteracija prebačena sa `.timeline-slot:not(.locked)` (koja preskače locked slot-ove iz NodeList-a ali ne iz `_state.plan`) na sve `.timeline-slot` uz ručni `planIdx` brojač. Sada DOM indeks i plan array indeks ostaju sinhronizovani čak i kad postoje locked slotovi u sredini plan array-a.

### B6 LOW — rain event debounce
- Fajl: src/micro/session-runner.js:135
- Fix: Dodat `_rainActive` boolean flag (inicijalizovan na `false`, resetuje se u `stopSessionRunner()`). `EVT.RAIN_START` se emituje samo pri prelasku iz `rain=false` u `rain=true`, `EVT.RAIN_STOP` pri prelasku nazad. Ranije se emitovalo svaki render frame (60× u sekundi) dok kiša traje.

---

### Nije rešeno (za sledeću iteraciju):
- B3 MEDIUM: Dvostruki rAF (kompleksni refactor, nizak prioritet)
- B7 LOW: getElementById scope u decision-cards.js
- B8 MEDIUM: Theme lock info visibility — .theme-lock div postoji, title attr je redundantan
- B9 LOW: Onboarding text
