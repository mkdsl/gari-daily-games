# Patch Queue — Niš Fuga

Agent čita `manifest.json` + SAMO navedene module po stavci. Ne otvara sve.
Tim dodaje stavke direktno — trigger ih izvršava. Šef stavlja `[HOLD]` da pauzira.

## Otvoreni patčevi

*(prazno)*

## Završeni patčevi

*(P2 stavke su bile dead-code cleanup — sve tri pronađene kao pre-fiksirane u commit-ima iz polish stage-a. Verifikovano 2026-08-01: `els.clock` nema u ResourceBar.js, SceneManager.js line 224 ima komentar "NPC element is created by each scene module — not duplicated here", `scene3_full_explain` case ne postoji u AchievementSystem.js)*

- [x] P2 `src/ui/ResourceBar.js` — dead `els.clock` — **pre-fiksirano u polish** (verifikovano 2026-08-01)
- [x] P2 `src/scenes/SceneBulevar.js` + `src/engine/SceneManager.js` — dupli NPC u DOM-u — **pre-fiksirano u polish** (verifikovano 2026-08-01, SceneManager.js:224)
- [x] P2 `src/engine/AchievementSystem.js` — dead case `'scene3_full_explain'` — **pre-fiksirano u polish** (verifikovano 2026-08-01)
- [x] P3 `src/ui/EndingScreen.js` + `styles/ui.css` — Web Share API dugme — **pre-implementovano** (EndingScreen.js lines 83-84, 150-173)
- [x] P3 `src/ui/EndingScreen.js` — styled bilet.rs CTA — **pre-implementovano** (EndingScreen.js line 126-129, `ending-btn-cta` class)
- [x] P3 `src/data/dialogs.json` — opcioni dijaloški čvor `s2_rep_poznanstvo` za replay: igrač sa reputacija ≥ 3 iz Scene 1 (diplomatski prolaz) unlockuje Baca Mileta koji propušta bez reda ("Dragoljub me zvao"). Sine Scenario. (done 2026-08-01)
