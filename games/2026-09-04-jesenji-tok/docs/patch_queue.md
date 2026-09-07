# Patch Queue — Jesenji Tok

## Otvoreni patčevi

<!-- Nega P1/P2 — tehnički dug, LOW bugovi iz beta, potencijalne regresije -->

<!-- Iskra P3 — brand hooks, Guncati/Kluboslavija sprega u narednih 6 meseci -->
- [x] P3 `src/content/brand_hooks.js` — Dinamičan masterclass CTA per rang (done 2026-09-07, commit f3381ab)
- [x] P3 `src/content/brand_hooks.js` + `src/share.js` — Stories 9:16 share card (done 2026-09-07, commit 0af27e1)
- [x] P3 `src/content/brana_dialogs.js` — Weather agroekološki saveti po presetima (done 2026-09-07, commit aa96633)
- [x] P3 `src/content/tasks.js` — edu_deep_link po zadatku za Guncati content hub (done 2026-09-07, commit f1e96a2)
- [x] P3 `src/content/brand_hooks.js` — Kluboslavija grand finale cross-promo (done 2026-09-07, commit 6eb0710)

<!-- Sine P3 — narativna ekspanzija, dijaloški lukovi, content koji produžuje igru -->
- [x] P3 `src/content/brana_dialogs.js` — priča po zadatku: BRANA_TASK_STORY (done 2026-09-07, commit ba75f14)
- [x] P3 `src/content/brana_dialogs.js` — weather arc opening monolozi: BRANA_WEATHER_OPENING (done 2026-09-07, commit 252ef55)
- [x] P3 `src/content/brana_dialogs.js` + `src/ui/score-screen.js` — ekosistem glas: BRANA_ECOSYSTEM_VOICE + eco-badge ikona (done 2026-09-07, commit 8d28e93)
- [x] P3 `src/content/brana_dialogs.js` + `src/ui/prestige-screen.js` — prestige-arc narativ: getPrestigeNarrative (done 2026-09-07, commit f977607)
- [x] P3 `src/content/brana_dialogs.js` — inter-task easter egg komentari: BRANA_COMBO_DIALOGS + checkInterTaskEasterEggs (done 2026-09-07, commit 3ab8dd6)

<!-- Dule P2/P3 — retention, emocionalna kriva, "još jedan run" faktor -->
- [x] P2 `src/ui/score-screen.js` — Emotivno diferenciran bura reveal po rangu (done 2026-09-07, commit de00691)
- [x] P2 `src/content/brana_dialogs.js` + `src/ui/prestige-screen.js` — Branin glas na prestige opcijama (done 2026-09-07, commit 3b7b7a5)
- [x] P2 `src/ui/score-screen.js` + `src/content/brana_dialogs.js` — Pedagoški "Šta je puklo" sloj (done 2026-09-07, commit 7f11dbb)
- [x] P3 `src/systems/achievements.js` + `src/content/brana_dialogs.js` — Brana Mode trostepeni unlock: BRANA_MEMORY_IMAGES, BRANA_MODE_UNLOCKS, TAJNA_PARCELA stub, checkBranaModeLayer (done 2026-09-07, commit fdd8806)
- [x] P3 `src/ui/prestige-screen.js` — Emocionalni ritam pre bonus izbora: na lošem runu (score < 300) prestige screen trenutno otvara sa neutralnim tonom identičnim dobrom runu. Dodati 3-sekundnu "Brana pauzu" pre nego što se opcije pojave — ambient zvuk ostaje, UI zvukovi ne sviraju, header prikazuje "Zemlja trpi. Brana uči." umesto "Drugi sezon." Na runu ≥ 600 header ostaje "Drugi sezon." Ovaj mali ritualni prelaz pravi razliku između refleksivnog restart-a i mehaničkog klik-reset-a — sezona zaista počinje iznova. (done 2026-09-07, commit 32fc777)

## Završeni patčevi

- [x] P2 `src/input.js` + `src/ui.js` + `styles/game.css` — Escape feedback na score/bura overlay: shake animacija + aria-live poruka (done 2026-09-07, commit f49c944)
- [x] P1 `src/main.js` — `total_runs` divergencija: `handlePlayAgain` sada kopira `state.total_runs` u novi state (analogno prestige putu) (done 2026-09-06, commit 502bb0e)
- [x] P2 `src/main.js` — uklonjen dead import `skipPrestige` (done 2026-09-06, commit 9c0223a)
- [x] P2 `src/main.js` — `scoreResult.is_new_best` sada popunjen povratnom vrednošću `saveBestScore()` (done 2026-09-06, commit bc398ae)
- [x] P2 `src/systems/validation.js` — uklonjen dead export `checkEcoBonusFeasibility` (done 2026-09-06, commit 3618979)
