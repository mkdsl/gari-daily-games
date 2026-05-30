# Fix Log — Akva-Sklop
**Datum:** 2026-05-30
**Beta iteracija:** 1 → 2

---

## CRITICAL (3/3 fixovano)

- [C1] `triggerSimulation` exportovana iz `main.js` ✅
  - `async function triggerSimulation()` → `export async function triggerSimulation()`
  - Expose-ovana i na `window.triggerSimulation` za onclick fallback
  - Linija ~75 u `src/main.js`

- [C2] `btnSimulate` ID mismatch popravljeno ✅
  - `bindSimulateButton()` je koristila `getElementById('btn-simulate')` (kebab-case)
  - Promenjeno u `getElementById('btnSimulate')` (camelCase, identično HTML-u)
  - Linija ~108 u `src/main.js`

- [C3] `initInput` argumenti ispravno poređani ✅
  - Poziv bio `initInput(grid, state)` — canvas i grid zamenjeni
  - `input.js` prima `initInput(canvasEl, grid)` (canvas prvi)
  - Popravljeno u `initInput(canvas, grid)` u `startNewGame()`
  - Linija ~155 u `src/main.js`

---

## MEDIUM (3/5 fixovano)

- [M1] `setAnimLerp` / `setPrevLakes` pozivaju se u `triggerSimulation` ✅
  - `setPrevLakes(state.lakes)` pozvan pre simulacione animacije
  - `setInterval` na 16ms (~60fps) koji inkrement-uje `setAnimLerp` tokom 4s prozora
  - `clearInterval` + `setAnimLerp(0)` po završetku
  - Oba exporta uvezena iz `render.js` u `loadOptionalModules()`

- [M2] `addWeekLog` importovana i poziva se po nedelji ✅
  - Dodata u import u `loadOptionalModules()` iz `ui.js`
  - `addWeekLog(newState.week, weekScore, activeEvent?.type || null)` pozvan
    posle `calcWeekScore` u svakom ciklusu `triggerSimulation`
  - HUD week log sada prikazuje feedback po nedelji u toku igre

- [M3] `cards.js` import `saveToStorage` proveren i nije prisutan ✅
  - `cards.js` NE importuje `saveToStorage` iz `state.js`
  - Lokalna `saveCardsToStorage()` direktno piše u localStorage (self-contained)
  - `state.js` ionako exportuje `saveToStorage` (linija ~93) — nema rizika ni da je bio import

- [M4] `drawHeightTint` stub — ostaje za sledeći pass (nije game-breaking)
  - Funkcija postoji ali je prazna; visinski tint nije implementiran
  - Ne utiče na igrivost — planiran za iter 3

- [M5] `hydraulics.js` mutacija state — arhitekturalni, ostaje za sledeći pass
  - `runSimulationWeek` mutira isti state objekat koji prima
  - Rizik od pogrešnog `finalScore` u edge case-ovima
  - Preporučen fix: `return JSON.parse(JSON.stringify(state))` u `hydraulics.js`
  - Ne utiče na igrivost u uobičajenim scenarijima

---

## Fajlovi izmenjeni

- `src/main.js` — C1 (export), C2 (btnSimulate ID), C3 (initInput args), M1 (anim lerp), M2 (addWeekLog)
- `src/cards.js` — M3 provera: nije trebalo menjati (import nije ni bio prisutan)

---

## Verifikacija

| Bug  | Status     | Fajl          | Linija (approx) |
|------|-----------|---------------|-----------------|
| C1   | ✅ Fixed  | src/main.js   | ~75             |
| C2   | ✅ Fixed  | src/main.js   | ~108            |
| C3   | ✅ Fixed  | src/main.js   | ~155            |
| M1   | ✅ Fixed  | src/main.js   | ~88–99          |
| M2   | ✅ Fixed  | src/main.js   | ~83             |
| M3   | ✅ OK     | src/cards.js  | N/A             |
| M4   | ⏳ Ostaje | src/render.js | ~60–66          |
| M5   | ⏳ Ostaje | src/hydraulics.js | ~148–174    |
