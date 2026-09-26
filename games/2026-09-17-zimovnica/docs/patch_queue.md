# Patch Queue — Zimovnica

## Otvoreni patčevi

_(prazno)_

## Završeni patčevi

- [x] P2 `src/render.js` — ending stats grid: `gridTemplateColumns` promenjen sa `repeat(3, 1fr)` na `repeat(2, 1fr)` u `buildEndingStats`. (done 2026-09-26, commit 05a6080)
- [x] P2 `src/systems/time_system.js` — bačva minimum check: dodat early return guard u `actionBacvaInit` za kg < 20, sinhronizuje backend sa UI disabled condition. (done 2026-09-26, commit 05a6080)
- [x] P2 `src/render.js` + `src/systems/time_system.js` — džem šljive fix: `buildActionGrid` sada zbira jabuke+šljive; `actionPraviDzem` troši jabuke first, šljive za ostatak. Igrač sa samo šljivama može praviti džem. (done 2026-09-26, commit 05a6080)
