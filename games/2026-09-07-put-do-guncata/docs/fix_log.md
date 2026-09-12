# Fix Log — Put do Guncata

## Iter 1 (2026-09-09)

- **CRITICAL-1** `src/main.js` — `registerScene(5, ...)` sada prosleđuje `{ ...cbs, onPlayAgain: cbs.onEnd || cbs.next }` u `etapa5-dolazak.js`, čime restart dugme u finalnoj sceni funkcioniše umesto no-op poziva.

- **MEDIUM-1** `src/main.js` — dodat import `{ initHUD }` iz `./ui.js` i poziv `initHUD(gameContainer, ...)` odmah posle `routerInit(gameStage)`; globalni HUD se sada montira jednom pri pokretanju igre.

- **MEDIUM-2** `index.html` — uklonjen `<meta property="og:image">` koji je pokazivao na nepostojeći `og.png`; blank preview bio lošiji od potpunog izostanka og:image.

- **MEDIUM-3** `src/entities/scenes/etapa2-autoput.js` — u `onEventResult` dodat vizuelni color hint na `scoreEl` (zelena/crvena 800ms) umesto netačnog ažuriranja broja pre nego što `_floatDelta` animacija okonča; igrač sada odmah vidi smer promene.

- **MEDIUM-4** `src/config.js` — `PRESTIGE.RUNS_REQUIRED` povećan sa 1 na 3; prestige se više ne otključava posle prve vožnje.

- **LOW-1** `src/main.js` — dodat import `{ resetBranching }` iz `./systems/branching.js`; `resetBranching()` se poziva odmah posle `initState()` u `startBtn` click handleru da se branching state čisti između runova.

- **LOW-2** `src/main.js` — `import { attachTo } from './input.js'` zamenjen sa `import './input.js'`; dead named import `attachTo` uklonjen.

- **LOW-3** `src/entities/scenes/etapa3-skretanje.js` — dodat `_showToast` helper i CSS klasa `.e3-toast`; rute "Brže" i "Sigurnije" sada prikazuju kratki toast (1500ms) pre prelaska na etapu 4 umesto nevidljivog 650ms timeout-a bez feedback-a.
