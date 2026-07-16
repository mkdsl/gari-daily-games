# Patch Queue — Imanje Tycoon

Agent čita `manifest.json` + SAMO navedene module po stavci. Ne otvara sve.

## Otvoreni patčevi

### P2 — Polish

- [ ] P2 `src/systems/phases.js` — typo na line ~128: `'dostiuguta'` → `'dostiguta'` (beta iter 1 LOW #3, nije ušlo u fix jer trivijalno)
- [ ] P2 `src/engine/tick.js` — zaštiti `applyOfflineProgress` od `seasonTimer = 0`: na početku while petlje dodaj `if (state.seasonTimer <= 0) state.seasonTimer = SEASON_DURATION;` pre ulaska u loop (beta iter 1 LOW #1)
- [ ] P2 `src/systems/seasons.js` — inspekcija `clearEvent` via `setTimeout` → premesti logiku u `handleSeasonEnd` (već postoji `seasonsLeft <= 0` check na line ~131-138), ukloni async `setTimeout` (beta iter 1 LOW #2)
- [ ] P2 `src/config.js` + `src/economy/mushrooms.js` — povećaj `INOKULACIJA_WINDOW_SEC` sa 10 na 18 sekundi; dodaj audio alert (`audio.playSfx('inokulacija_alert')`) 3s pre isteka prozora da upozori igrača (beta iter 1 MEDIUM #6 — ostalo jer je granični slučaj, ali mobile UX pati)

### P3 — Balance & Expansion

- [ ] P3 `src/config.js` + `src/systems/phases.js` — Phase A pacing: 30+ minuta je predugo za first-session. Smanji inicijalne cene Plastenik unlock-a za 30% ili dodaj starter bonus kapital (+5.000 din) koji se troši samo u prvih 5 min igre (Lela nalaz iz beta iter 1)
- [ ] P3 `src/systems/prestige.js` + `src/ui/modals.js` — prestige scenario 3 ("Štrand") trenutno je placeholder — popuni sa konkretnim Guncati Štrand narativom i drugačijim permanentnim bonusom od scenarija 1 i 2
- [ ] P3 `src/content/brand_hooks.js` — dodaj 3 nova masterclass hook-a vezana za Guncati Avala event (20.jun): trigger kad `masterclass_count >= 3`, prikaže in-game notifikaciju "Pravi masterclass čeka te na Guncatiju"

## Završeni patčevi

*(prazno — ovo je inicijalni patch_queue, svi MEDIUM bugovi iz beta iter 1/2 su rešeni u fix_log.md)*
