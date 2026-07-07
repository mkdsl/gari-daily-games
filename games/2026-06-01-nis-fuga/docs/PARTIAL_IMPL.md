# Niš Fuga — Partial Impl (2026-07-07)

Impl stage prekinuta pre kraja. Engine+utils završeni, scene/audio/ui/art/styles nedostaju.

## Završeno (1862 LOC)

- `src/data/dialogs.json` — svih 58 dijalog čvorova
- `src/data/scenes.json` — 5 scena metadata + hotspot definicije
- `src/data/achievements.json` — 9 achievements
- `src/engine/EventBus.js` — pub/sub
- `src/engine/ResourceManager.js` — resurs tracker + endings formula
- `src/engine/DialogEngine.js` — JSON parser + traversal
- `src/engine/HotspotEngine.js` — click/touch detekcija
- `src/engine/AchievementSystem.js` — trophy tracker
- `src/utils/GameState.js` — state shape
- `src/utils/FlagManager.js` — flag get/set
- `src/utils/SaveSystem.js` — localStorage
- `src/utils/Analytics.js` — event logger

## Nedostaje

- `src/engine/SceneManager.js` — scene lifecycle + tranzicije
- `src/scenes/` — sve 5 scena + endings (SceneBulevar, SceneKiosk, SceneKafana, SceneTvrdjava, SceneKapija, SceneEnding)
- `src/audio/` — AudioEngine, AmbientPlayer, SfxPlayer
- `src/ui/` — DialogRenderer, ResourceBar, ChoiceMenu, EndingScreen
- `src/art/` — BackgroundRenderer, NpcRenderer, UiComponents
- `styles/` — base.css, ui.css, game.css, theme.css
- `index.html` — kompletni module loader (postoji stub)

## Za sledeću impl sesiju

Sledeći 09:00 trigger nastavlja od SceneManager.js → SceneBulevar.js → ostatak scena → audio → UI → art → styles → index.html wire-up.

GDD je u `docs/gdd.md` — kompletna specifikacija.
