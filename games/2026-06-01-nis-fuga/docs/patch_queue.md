# Patch Queue — Niš Fuga

Agent čita `manifest.json` + SAMO navedene module po stavci. Ne otvara sve.

## Otvoreni patčevi

### P2 — Polish

- [ ] P2 `src/ui/ResourceBar.js` — ukloni dead `els.clock` (line ~30, klasa `.rb-clock-hands` ne postoji u `buildHTML()`, `els.clock` se nigde ne koristi — ostalo iz beta iter 1 LOW #4)
- [ ] P2 `src/scenes/SceneBulevar.js` + `src/engine/SceneManager.js` — dupli NPC u DOM-u: `SceneManager.renderSceneBackground()` ubacuje `div.scene-npc.npc-dragoljub`, potom `SceneBulevar.setup()` appenda drugi — ukloniti NPC append iz SceneManager-a (beta iter 1 LOW #5)
- [ ] P2 `src/engine/AchievementSystem.js` — dead case `'scene3_full_explain'` u `checkTrigger()` se nikad ne poziva; dijalog koristi `'soundcheck_objasnjenje'` direktno — ukloniti ili normalizovati (beta iter 1 LOW #6)

### P3 — Content & Brand Expansion

- [ ] P3 `src/ui/EndingScreen.js` + `styles/ui.css` — dodaj Web Share API dugme na ending screenu (payload: "Završio sam Niš Fugu! Moj ending: [naziv] — igraj: [play_url]"). Fallback: clipboard copy. Postojeći `share.js` već ima infrastrukturu.
- [ ] P3 `src/data/dialogs.json` — dodaj opcioni dijaloški čvor u Scenu 2 (Kiosk) koji daje hint ka boljim resourceima za igrače koji već znaju rešenje — replay incentive za drugi prolaz
- [ ] P3 `src/ui/EndingScreen.js` — povećaj vidljivost `bilet.rs/show/261` CTA linka (trenutno plain text, treba styled dugme sa Kluboslavija bojama)

## Završeni patčevi

*(prazno — ovo je inicijalni patch_queue, svi MEDIUM bugovi iz beta iter 1 su rešeni u fix_log.md)*
