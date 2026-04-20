# Beta Report — Signal Lost

## Verdict: PASS WITH FIXES

---

## Kritični bugovi (blocker — mora biti fiksiran)

### 1. `pixelToGrid` crash na svakom kliku — `main.js:130` + `render.js:93`

`main.js` poziva `pixelToGrid(input.pointer.x, input.pointer.y, state.grid, null)` — četvrti argument je bukvalno `null`. Unutar `pixelToGrid` odmah se pristupa `layout.originX` (render.js:95), što baca `TypeError: Cannot read properties of null (reading 'originX')` i crashuje igru pri prvom kliku igrača.

**Efekat:** Igra je nefunkcionalna — klik na bilo koji čvor baca uncaught exception. Signal se kreće ali igrač ne može da otvori nijedno Gate.

**Fix:** U `main.js:130`, umesto `null` proslediti izračunati layout. Pošto `_calcLayout` nije exportovan iz `render.js`, najbrži fix je da se exportuje `calcLayout` (ili wrapper `getLayout(grid, w, h)`) i poziva pre `pixelToGrid`. Alternativno, `pixelToGrid` treba da sam izračuna layout kada dobije `null`.

```js
// main.js:129-134 — trenutno:
const gridCoords = pixelToGrid(input.pointer.x, input.pointer.y, state.grid, null);

// Fix — export calcLayout iz render.js i:
const w = canvas.width / devicePixelRatio;
const h = canvas.height / devicePixelRatio;
const layout = calcLayout(state.grid, w, h);
const gridCoords = pixelToGrid(input.pointer.x, input.pointer.y, state.grid, layout);
```

---

### 2. ECHO power-up se troši za 1 node step umesto da čeka na konzumaciju — `powerups.js:85` + `config.js:88`

`CONFIG.POWERUPS.ECHO` ima `durationNodes: 1`. U `activatePowerup` (powerups.js:75-86), kad igrač aktivira ECHO, kreira se `active` objekat sa `remainingNodes = 1 * durationMultiplier = 1`. `onSignalStep` (powerups.js:128-133) odmah dekrmentira to na 0, i filter u `applyPowerupTick` (powerups.js:113) ga uklanja posle prvog koraka signala.

ECHO bi trebalo da živi sve dok ga `activatePowerup` ne konzumira (linija 71). Jedini ispravni put je `remainingNodes === -1 && remainingSec === -1` (powerups.js:114), ali ECHO nikada ne dobija te vrednosti jer `def.durationNodes` postoji (=1).

**Efekat:** ECHO nestaje čim signal napravi jedan korak, a ne kad igrač aktivira sledeći power-up. Praktično beskoristan.

**Fix:** U `config.js`, ukloniti `durationNodes: 1` iz ECHO definicije (ili ga postaviti na `undefined`). U `activatePowerup`, ECHO ne treba ni da prolazi kroz `remainingNodes` granu — inicijalizovati sa `remainingSec: -1, remainingNodes: -1` direktno kada je `powerupId === 'ECHO'`.

---

### 3. Signal može zapeti na greedy dead-end čak i na "solvabilnom" gridu — `signal.js:216-268` + `grid.js:369-379`

BFS validacija u `isSolvable` (grid.js:192) tretira sve backbone gate-ove kao otvorene (grid.js:374-379 otvori ih za validaciju). Međutim, signal ne koristi BFS — koristi manhattan-greedy `_pickNext`. Greedy routing može da vodi signal u slepu ulicu zatvorenimi gate-ovima koji NISU na backbone-u ali jesu na greedy putu.

Konkretno: `_pickNext` bira sledeći čvor isključivo po manhattan distanci do cilja, bez backtrackinga. Ako greedy put vodi u ćorsokak (nema unvisited prolaznih suseda), `_fail` se odmah poziva — čak i ako bi BFS ruta postojala zaobilaznim putem.

**Efekat:** Igrač vidi "Signal Lost" bez greške — mreža izgleda rešiva, ali signal zapne. Najizraženije na nivoima 8-12 sa gustim gate rasporedom.

**Fix (pragmatičan):** U `_pickNext`, ako `candidates.length === 0` nakon filtera, pokušati backtracking jedan korak (uzeti pretposlednji čvor iz `state.signal.path`) umesto direktnog fail-a. Alternativno, pojačati `generateGrid` da validira solvabilnost greedy algoritmom (ne BFS), ili povećati `MAX_ATTEMPTS` sa 10 na 30.

---

## Ozbiljni problemi (važni ali ne blocker)

- **UX: Checkpoint screen dugme kaže "NASTAVI" (data-action="start")** ali okida `_onStart` callback koji resetuje igru (`main.js:47-54`). Igrač koji klikne "NASTAVI" sa checkpoint screena startuje novi run umesto da nastavi sa checkpoint nivoa. `ui.js:186` — data-action bi trebalo biti `"continue-checkpoint"` sa posebnim callback-om koji samo poziva `initLevel(state)` bez `createState()`. (Alternativno wiring: `_onCheckpointUse` ili novi callback.)

- **UX: Nema vizuelnog indikatora koji čvorovi su klikabilni.** Closed gate i open gate imaju isti krug — razlikuju se samo ikonom (X vs chevron). Na nivoima 11-15 gde su gate-ovi skriveni (`visible=false`), igrač ne zna šta može da klikne. Trebalo bi highlight on hover barem na desktopu (mousemove listener već postoji u input.js).

- **Touch: `touchend` ne šalje koordinate u `setPointer`** — `input.js:24`. `touchend` event ima prazan `touches[]` array, pa `e.touches?.[0] ?? e` pada na sam `TouchEvent` objekat bez `clientX/Y`. Koordinate ostaju na poslenoj touch poziciji, što je okej za tap, ali može biti pogrešno za brze swipe→lift. Za tap gameplay ovo nije blocker ali je tehnički bug.

---

## Kozmetika (nice-to-have, ne fiksirati danas)

- **Typo u `ui.js:184`**: "čak i ako sigal bude izgubljen" → "signal"
- **Win screen ne prikazuje finalni skor iz `calcScore` formule** — prikazuje samo `state.score` (SCORE_PER_LEVEL × nivoi) bez time bonusa i powerup bonusa. `calcScore` iz config.js nikad nije pozvan. Nizak prioritet.
- **`TIME_BUBBLE` ubrzava signal (speedMultiplier=2)** ali opis kaže "sve interakcije 2× brže" — igrač može razumeti da znači da MU daje više vremena, a zapravo signal ide brže (manje vremena). Rewrite opisa.
- **Node radius (22px) je fiksni logički piksel, ali na mobilnim ekranima** < 360px wide, 5×5 grid sa `cellSize = floor(min(w,h)*0.85/5)` daje ~54px po ćeliji — node od 22px pokriva 40% ćelije. Na 7×7 (nivo 11+) cellSize pada na ~38px, node od 22px je skoro cela ćelija — estetika se gubi. `NODE_RADIUS` bi trebalo biti `cellSize * 0.38` dinamički.

---

## Pozitivno

- **Arhitektura je čista i modularizovana.** Svaki fajl ima jednu odgovornost; nema kružnih importa (powerups.js → signal.js → grid.js → config.js je jednosmerno).
- **Fallback u `generateGrid`** (grid.js:41-42) osigurava da igra nikad ne ostane bez grida — relay-only fallback je uvek solvabilan.
- **Checkpoint save/load u `state.js`** je robusno implementiran: snapshot se čuva odvojeno, nema rekurzivnog ugnježdavanja, `try/catch` pokriva private mode.
- **Blueprint estetika** (tamna pozadina, cyan akcenti, orange signal) je konzistentna kroz ceo codebase.
- **Signal animacija** (progress 0→1 interpolacija, glow dot) izgleda fluido i daje jasnu vizuelnu povratnu informaciju.
- **Difficulty kriva je ispravna**: nivo 1 ima 6 gates na 5×5 (24% čvorova), nivo 15 ima 17 gates na 7×7 (35%) uz skrivene tipove — progresija je smislena.
