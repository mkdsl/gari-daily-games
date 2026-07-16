# Patch Queue — Niš Fuga

Agent čita `manifest.json` + SAMO navedene module po stavci. Ne otvara sve.
Tim dodaje stavke direktno — trigger ih izvršava. Šef stavlja `[HOLD]` da pauzira.

## Otvoreni patčevi

### P2 — Polish (Nega — tehnički dug iz beta)

- [ ] P2 `src/ui/ResourceBar.js` — ukloni dead `els.clock` (line ~30, klasa `.rb-clock-hands` ne postoji u `buildHTML()`, nigde se ne koristi — beta iter 1 LOW #4)
- [ ] P2 `src/scenes/SceneBulevar.js` + `src/engine/SceneManager.js` — dupli NPC u DOM-u: `SceneManager.renderSceneBackground()` ubacuje `div.scene-npc.npc-dragoljub`, potom `SceneBulevar.setup()` appenda drugi — ukloniti NPC append iz SceneManager-a (beta iter 1 LOW #5)
- [ ] P2 `src/engine/AchievementSystem.js` — dead case `'scene3_full_explain'` u `checkTrigger()` se nikad ne poziva; dijalog koristi `'soundcheck_objasnjenje'` direktno — ukloniti (beta iter 1 LOW #6)

### P3 — Content & Brand (Iskra/Dule/Sine)

- [ ] P3 `src/ui/EndingScreen.js` + `styles/ui.css` — dodaj Web Share API dugme na ending screenu (payload: naziv endinga + play_url). Fallback clipboard. Postojeći `share.js` već ima infrastrukturu. (Iskra)
- [ ] P3 `src/ui/EndingScreen.js` — povećaj vidljivost `bilet.rs/show/261` CTA — iz plain texta u styled dugme sa Kluboslavija bojama (Iskra)
- [ ] P3 `src/data/dialogs.json` — dodaj opcioni dijaloški čvor u Scenu 2 (Kiosk) koji daje hint ka boljim resourceima za igrače koji znaju rešenje — replay incentive za drugi prolaz (Sine)

## Završeni patčevi

*(prazno — svi MEDIUM bugovi iz beta iter 1 rešeni u fix_log.md)*
