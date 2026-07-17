# Patch Queue — Imanje Tycoon

Agent čita `manifest.json` + SAMO navedene module po stavci. Ne otvara sve.
Tim dodaje stavke direktno — trigger ih izvršava. Šef stavlja `[HOLD]` da pauzira.

## Otvoreni patčevi

### P2 — Polish (Nega — tehnički dug iz beta)

- [x] P2 `src/systems/phases.js` — typo line ~128: `'dostiuguta'` → `'dostiguta'` (done 2026-07-13, commit 23a2217 — fix_log L1)
- [x] P2 `src/engine/tick.js` — zaštiti `applyOfflineProgress` od `seasonTimer = 0` (done 2026-07-13, commit 23a2217 — fix_log L2)
- [x] P2 `src/systems/seasons.js` — inspekcija `clearEvent` async → sync (done 2026-07-13, commit 23a2217 — fix_log L3)
- [x] P2 `src/config.js` + `src/economy/mushrooms.js` — `INOKULACIJA_WINDOW_SEC` 10 → 18s (done 2026-07-13, commit 23a2217 — fix_log M6)

### P3 — Balance & Expansion (Dule/Iskra)

- [ ] P3 `src/config.js` + `src/systems/phases.js` — Phase A pacing: smanji inicijalne cene Plastenik unlock-a za 30% ili dodaj starter bonus +5.000 din (troši se samo u prvih 5 min). Cilj: first-session igrač dođe do prve Faze A transition za ~15 min, ne 30+ (Dule)
- [ ] P3 `src/systems/prestige.js` + `src/ui/modals.js` — prestige scenario 3 ("Štrand") je placeholder — popuni Guncati Štrand narativ i drugačiji permanent bonus od scenarija 1/2 (Iskra)
- [ ] P3 `src/content/brand_hooks.js` — dodaj 3 Guncati Avala hook-a: trigger kad `masterclass_count >= 3`, in-game notifikacija "Pravi masterclass čeka te na Guncatiju — 20. jun" (Iskra)

## Završeni patčevi

- [x] P2 `src/systems/phases.js` — typo `dostiuguta` → `dostiguta` (done 2026-07-13, commit 23a2217)
- [x] P2 `src/engine/tick.js` — phantom sezona guard (done 2026-07-13, commit 23a2217)
- [x] P2 `src/systems/seasons.js` — clearEvent async → sync (done 2026-07-13, commit 23a2217)
- [x] P2 `src/config.js` + `src/economy/mushrooms.js` — INOKULACIJA_WINDOW_SEC 10→18s (done 2026-07-13, commit 23a2217)
