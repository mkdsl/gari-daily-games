# Patch Queue — Imanje Tycoon

Agent čita `manifest.json` + SAMO navedene module po stavci. Ne otvara sve.
Tim dodaje stavke direktno — trigger ih izvršava. Šef stavlja `[HOLD]` da pauzira.

## Otvoreni patčevi

### P2 — Polish (Nega — tehnički dug iz beta)

- [ ] P2 `src/systems/phases.js` — typo line ~128: `'dostiuguta'` → `'dostiguta'` (beta iter 1 LOW #3)
- [ ] P2 `src/engine/tick.js` — zaštiti `applyOfflineProgress` od `seasonTimer = 0`: dodaj `if (state.seasonTimer <= 0) state.seasonTimer = SEASON_DURATION;` na početku while petlje (beta iter 1 LOW #1)
- [ ] P2 `src/systems/seasons.js` — inspekcija `clearEvent` via `setTimeout` → premesti u `handleSeasonEnd` (već postoji `seasonsLeft <= 0` check ~line 131-138), ukloni async setTimeout (beta iter 1 LOW #2)
- [ ] P2 `src/config.js` + `src/economy/mushrooms.js` — povećaj `INOKULACIJA_WINDOW_SEC` sa 10 na 18s; dodaj audio alert 3s pre isteka (`audio.playSfx('inokulacija_alert')`) — mobile UX pati (beta iter 1 MEDIUM #6, granični slučaj)

### P3 — Balance & Expansion (Dule/Iskra)

- [ ] P3 `src/config.js` + `src/systems/phases.js` — Phase A pacing: smanji inicijalne cene Plastenik unlock-a za 30% ili dodaj starter bonus +5.000 din (troši se samo u prvih 5 min). Cilj: first-session igrač dođe do prve Faze A transition za ~15 min, ne 30+ (Dule)
- [ ] P3 `src/systems/prestige.js` + `src/ui/modals.js` — prestige scenario 3 ("Štrand") je placeholder — popuni Guncati Štrand narativ i drugačiji permanent bonus od scenarija 1/2 (Iskra)
- [ ] P3 `src/content/brand_hooks.js` — dodaj 3 Guncati Avala hook-a: trigger kad `masterclass_count >= 3`, in-game notifikacija "Pravi masterclass čeka te na Guncatiju — 20. jun" (Iskra)

## Završeni patčevi

*(prazno — svi MEDIUM bugovi iz beta iter 1/2 rešeni u fix_log.md)*
