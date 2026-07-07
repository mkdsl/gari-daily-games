# Fix Log — Niš Fuga (KORAK 6, 2026-07-07)

## Fiksirani bugovi

| # | Severity | Fajl | Bug | Fix |
|---|----------|------|-----|-----|
| 1 | MEDIUM | src/ui/DialogRenderer.js | `skipTyping()` emitovao nepostojeći event `'dialog:node:skip'`, nije popunjavao `textEl` sa punim tekstom, `onComplete` nikad nije pucao — hint ostajao na opacity 0 zauvek | Dodati module-level `currentFullText` i `currentOnComplete`; `showNode()` ih popunjava pre `typeText()`; `skipTyping()` direktno setuje `textEl.textContent = currentFullText` i poziva `currentOnComplete?.()` |
| 2 | MEDIUM | src/engine/ResourceManager.js | `applyScene3Complication()` emitovao `RESOURCE_CHANGED` bez `to`/`from` polja — `ResourceBar` dobijao undefined, prikazivao "undefined min" i NaN CSS rotaciju | Dodate `before`/`after` varijable (`GameState.getResource('time')` pre i posle delta-e), oba polja prosleđena u event |
| 3 | MEDIUM | src/audio/SfxPlayer.js | Listener na `EVENTS.DIALOG_START` pozivao `play('dialog_open')`, ali `DialogRenderer.showNode()` već direktno poziva `SfxPlayer.play('dialog_open')` — zvuk se čuo duplo na prvom dijalogu svake scene | Uklonjen `EventBus.on(EVENTS.DIALOG_START, ...)` listener iz SfxPlayer.js |
| 4 | LOW | src/ui/ResourceBar.js | `els.clock = container.querySelector('.rb-clock-hands')` — klasa `.rb-clock-hands` ne postoji u `buildHTML()`, vraćala null; `els.clock` nigde nije korišten | Uklonjena ta jedina linija |
| 5 | LOW | src/engine/SceneManager.js | `renderSceneBackground()` ubacivao `div.scene-npc.npc-{sceneDef.npc}` u DOM, a scene moduli (SceneBulevar itd.) dodavali DRUGI NPC element — dupli NPC u DOM-u | Uklonjen NPC `createElement`/`appendChild` blok iz `renderSceneBackground()`; scene moduli ostaju jedini kreatori NPC sprite-a |
| 6 | LOW | src/engine/AchievementSystem.js | `case 'scene3_full_explain':` u `checkTrigger()` nikad nije pozivano jer dijalog koristi trigger `'soundcheck_objasnjenje'` direktno — dead code | Uklonjen `case 'scene3_full_explain':` blok |

## Nijedno CRITICAL nije nađeno u beta iter 1.
