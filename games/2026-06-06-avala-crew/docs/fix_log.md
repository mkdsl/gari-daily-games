# Fix Log — Avala Crew
**Datum:** 2026-06-06 | **Agent:** Jova jQuery | **Beta iter:** 1

## CRITICAL fix-ovi

### CRITICAL-01a: Bojanova ability `bojanAutoWin` — FIXED
- **Fajl:** src/main.js (resolveCurrentScenario, ~linija 280)
- **Fix:** Dodat consume blok koji postavlja `appliedAbilities['bojan'] = {forceOutcome: 'win'}` pre poziva resolveScenario; flag se konsumira i resetuje na `false` (ili tiho resetuje ako je tip scenarija pogrešan)

### CRITICAL-01b: Anina ability `anaOverridePending` — FIXED (isti pattern)
- **Fajl:** src/main.js (resolveCurrentScenario)
- **Fix:** Dodat consume blok koji postavlja `appliedAbilities['ana'] = {overrideOutcome: 'partial'}` pre poziva resolveScenario; flag se konsumira samo na S-tip scenariju, inače tiho resetuje

## MEDIUM fix-ovi

### MEDIUM-01: Onboarding za nove igrače — FIXED
- **Fajl:** src/rendering/roster_renderer.js, styles/ui.css
- **Fix:** Dodat `.how-to-play` panel u `renderRosterHeader()` koji se prikazuje samo kad je `state.completedNights === 0`; sadrži 4-stavni htp-grid (beri ekipu, dodeli uloge, sinergije, kreni u noć) i htp-stats traku sa E/S/P/L pojašnjenjem; CSS: tamna bordered box, 2×2 grid, neon-green badge-ovi za statove

### MEDIUM-02: Good Fit label vidljiv na mobilnom — FIXED
- **Fajl:** src/rendering/roster_renderer.js, styles/ui.css
- **Fix:** Dodat `<div class="good-fit-label">★ Prirodna uloga (+10%)</div>` ispod role `<select>` u `renderSelectedSlots()` — prikazuje se samo kad je `isPrimaryRole === true`; CSS: font-size 10px, neon-green, font-weight 600

## LOW (logged, not fixed)

- **LOW-01:** Unused `renderIntroScreen` import uklonjen iz main.js *(applied — trivijalna cleanup)*
- **LOW-02:** `getBondsForMember` pairKey — intentional pattern, nema underscore ID-jeva; nema izmene
- **LOW-03:** `_pendingChoiceKey` vestigijalni — logged za next session
- **LOW-04:** Prestige reset briše unlocked membere — dizajn intentional, treba UI upozorenje u sledećoj sesiji
- **LOW-05:** Phase timeline 100% — vizuelni polish za sledeću sesiju
