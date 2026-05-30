# Beta Report — Akva-Sklop
**Datum:** 2026-05-30
**Beta score (iter 1):** 6.2/10

---

## CRITICAL (blokiraju igru)

### BUG-C1: `triggerSimulation` nije exportovana — simulate dugme ne radi
**Fajl:** `src/main.js` (nije export-ovana), `src/ui.js:42`
**Opis:** `ui.js` dinamički importuje `triggerSimulation` iz `main.js` i poziva je:
```js
import('./main.js').then(m => {
  if (typeof m.triggerSimulation === 'function') m.triggerSimulation();
});
```
Međutim, `triggerSimulation` u `main.js` je deklarisana kao obična `async function` — **nije navedena u `export`**. ES6 moduli ne eksportuju nešto što nije eksplicitno navedeno. Rezultat: `m.triggerSimulation` je uvek `undefined`, `typeof` check pada, i simulate dugme u UI-u **nikad ne aktivira simulaciju**. Igra se ne može završiti klikom na dugme (jedino tajmer može da je pokrene).
**Reprodukcija:** Klikni "SIMULIRAJ NEDELJU →" — ništa se ne dešava.
**Fix:** Dodaj `export` ispred deklaracije: `export async function triggerSimulation() {`

---

### BUG-C2: `bindSimulateButton` veže pogrešan DOM ID — dupli event listener, pravi uvek promašuje
**Fajl:** `src/main.js:108`
**Opis:** `bindSimulateButton()` traži element `'btn-simulate'` (kebab-case):
```js
const btn = document.getElementById('btn-simulate');
```
Ali `index.html` definiše dugme sa ID-jem `'btnSimulate'` (camelCase). Znači `bindSimulateButton` uvek dobija `null` i ne registruje nikakav listener. Paralelno, `ui.js` veže **sopstveni** click listener na `'btnSimulate'` — ali kao što je pokazano u BUG-C1, taj listener ne može pozvati `triggerSimulation`. Krajnji rezultat: **nijedno od dva binding-a ne funkcioniše ispravno**.
**Reprodukcija:** Klikni dugme — simulacija se ne pokreće ni kroz main.js put.
**Fix:** U `main.js:108` promeni u `document.getElementById('btnSimulate')`. Paralelno reši BUG-C1.

---

### BUG-C3: `initInput` prima pogrešne argumente — canvas vs grid zamenjeni
**Fajl:** `src/main.js:155`, `src/input.js:19`
**Opis:** U `main.js`, `startNewGame` poziva:
```js
initInput(grid, state);
```
Ali `input.js` deklaracija je:
```js
export function initInput(canvasEl, grid) {
```
Dakle `canvas` parametar dobija `grid` (niz objekata), a `grid` parametar dobija `state`. Input modul zatim radi `canvas.addEventListener(...)` na nizu — što baca `TypeError: canvas.addEventListener is not a function`. Igra se ruši pri pokretanju.
**Reprodukcija:** Pokreni igru i odaberi difficulty — konzola baca TypeError, igra se zamrzava.
**Fix:** U `main.js:155` promeni u `initInput(canvas, grid)`. Canvas referenca je već dostupna kao `const canvas = document.getElementById('gameCanvas')` dva reda iznad.

---

### BUG-C4: `hydraulics.js` mutira state bez da vraća novi objekat — race condition sa `calcFinalScore`
**Fajl:** `src/hydraulics.js:148–174`, `src/main.js:74`
**Opis:** `runSimulationWeek` vraća isti `state` objekat koji je primio (mutira ga). U `main.js`:
```js
const newState = runSimulationWeek(state, grid);
newState.weeklyScores.push(...)
```
`newState` i `state` su ista referenca. To samo po sebi nije uvek bug, ali odmah posle `runSimulationWeek`, `advanceWeek(newState)` menja `newState.phase` na `'victory'` ili `'gameover'`. Tada sledeći poziv `calcFinalScore` dobija već izmenjeni state umesto state-a na kraju simulacije. Više je semantički problem nego crash bug — ali može dovesti do pogrešnog `finalScore` ako `advanceWeek` menja i `weeklyScores`. Dokumentovano kao arhitekturalni rizik koji treba rešiti pre skaliranja.
**Reprodukcija:** Teško reprodukovati direktno — manifestuje se kao pogrešan finalni score u edge case-ovima.
**Fix:** U `runSimulationWeek` vrati deep-copy state-a: `return JSON.parse(JSON.stringify(state))` (ili koristiti strukturirani klon).

---

## MEDIUM (oštećuju first impression)

### BUG-M1: `drawHeightTint()` je prazna funkcija — vizualni hint za visinu ne postoji
**Fajl:** `src/render.js:60–66`
**Opis:** Funkcija sadrži samo komentar i mrtvu varijablu:
```js
const import_height_map_later = true; // height map se čita iz config
```
Nikakav tint se ne crta. Igrač nema vizuelni indikator visinskog gradijenta koji je ključan za razumevanje toka vode. Ovo je direktno navedeno kao feature u GDD (visina 3→1, kaskadni tok).
**Fix:** Implementirati gradijentni fill po HEIGHT_MAP vrednostima (npr. rgba overlay po redu).

---

### BUG-M2: `cards.js` poziva `saveToStorage` koji možda nije exportovan iz `state.js`
**Fajl:** `src/cards.js` (nije čitan), `src/main.js:7`
**Opis:** `main.js` importuje `saveToStorage` iz `state.js` — to postoji. Međutim, `cards.js` modul (prema manifest-u) takođe koristi card unlock state koji treba da se sačuva. Ako `cards.js` direktno importuje `saveToStorage` iz `state.js` bez da je ta funkcija exportovana, dobiće `undefined`. Ovo nije moguće 100% potvrditi bez čitanja `cards.js`, ali agent je napomenuo ovaj rizik u brief-u, i arhitektura je konzistentna sa tim rizikom.
**Preporuka:** Verifikovati da `state.js` eksplicitno exportuje `saveToStorage` i da `cards.js` to importuje ispravno.

---

### BUG-M3: `setAnimLerp` i `setPrevLakes` nikad se ne pozivaju iz `main.js`
**Fajl:** `src/render.js:235–241`, `src/main.js` (ceo fajl)
**Opis:** `render.js` exportuje `setAnimLerp` i `setPrevLakes` koje su ključne za animaciju water levela tokom 4s simulacionog prozora. `main.js` nigde ne poziva te funkcije — ni pre `await new Promise(r => setTimeout(r, 4000))` ni tokom loop-a. `animLerp` ostaje `0` tokom cele simulacije i `prevLakes` ostaje `null`, pa se nivo vode teleportuje umesto da se animira.
**Fix:** Pre simulacije pozvati `setPrevLakes(state.lakes)` i u gameLoop tokom simulacione faze inkrementovati `animLerp` proporcionalno proteklom vremenu.

---

### BUG-M4: Victory screen se ne prikazuje za game-over — samo za victory
**Fajl:** `src/main.js:83–93`
**Opis:**
```js
if (newState.phase === 'victory' || newState.phase === 'gameover') {
    ...
    showVictoryScreen(newState, finalResult);
```
`showVictoryScreen` u `ui.js` prikazuje "Guncati Eco Report" overlay koji je dizajniran za pobedni scenario (emoji, rank, score). Za game-over (ribe uginule) isti overlay se prikazuje, ali sadržaj (`result.emoji`, `result.label`) dolazi iz `calcFinalScore` koji možda ne handluje gameover state posebno. Igrač koji izgubi dobija isti "report" ekran bez jasne poruke zašto je izgubio.
**Fix:** Dodati poseban game-over message u `showVictoryScreen` na osnovu `state._gameoverReason` ili dodati odvojenu `showGameOverScreen` funkciju.

---

### BUG-M5: `addWeekLog` se nikad ne poziva iz `main.js`
**Fajl:** `src/ui.js:155–173`, `src/main.js` (ceo fajl)
**Opis:** `ui.js` exportuje `addWeekLog(week, score, event)` koja popunjava `#weekLog` div i daje igraču feedback napretka po nedelji. `main.js` importuje samo `{ initUI, updateHUD, showEventBanner, showVictoryScreen }` iz `ui.js` — `addWeekLog` nije importovana ni pozvana. HUD week log ostaje prazan tokom cele igre.
**Fix:** Dodati `addWeekLog` u import u `main.js`, pozvati je posle `weeklyScores.push(...)` u `triggerSimulation`.

---

## LOW (nice-to-have)

### BUG-L1: `debugPanel` ID mismatch između `main.js` i `index.html`
**Fajl:** `src/main.js:128`, `index.html:57`
**Opis:** `main.js:toggleDebugPanel()` traži `'debug-panel'` (kebab), `index.html` ima `id="debugPanel"` (camelCase). D-key toggle ne prikazuje debug panel. Paralelno, `ui.js` ima svoju `toggleDebugPanel(debugData)` funkciju koja ispravno koristi `'debugPanel'`.
**Fix:** U `main.js:128` promeni u `getElementById('debugPanel')` ili ukloni duplikaciju i delegiraj na `ui.js`.

---

### BUG-L2: `closeModal` u `main.js` traži nepostojeće ID-jeve
**Fajl:** `src/main.js:140`
**Opis:**
```js
document.querySelectorAll('.modal, #victory-screen, #event-banner')
```
`#victory-screen` i `#event-banner` ne postoje u `index.html`. Queryselector ih preskače bez greške, ali Escape key ne zatvara modale efikasno jer `.modal` klasa pokriva `cardModal` i `shareOverlay` — to funkcioniše. Niska prioriteta ali ukazuje na zaostale reference iz starijeg HTML drafta.

---

### BUG-L3: `inflowA` formula je trivijalno redundantna
**Fajl:** `src/hydraulics.js:47`
**Opis:**
```js
const inflowA = Math.min(sourceRate, sourceRate + drainageTotalA);
```
`Math.min(X, X + positiveNumber)` uvek vraća `X` (tj. `sourceRate`). `drainageTotalA` uvek se ignoruje za jezero A — samo B i C koriste drainage bonuse. Ovo je najverovatnije logička greška u flow modelu: jezero A ne dobija nikakav benefit od drainage tile-ova postavljenih u njegovu zonu.
**Fix:** `const inflowA = sourceRate + drainageTotalA * (1 - FLOW_PATH_LOSS);`

---

### BUG-L4: `TILE_TYPES.REMOVE` koristi se u `canPlace` ali verovatno nije definisan u `config.js`
**Fajl:** `src/grid.js:113`, `src/input.js:115`
**Opis:** `canPlace` koristi `TILE_TYPES.REMOVE` i `TILE_CONFIG[TILE_TYPES.REMOVE]`. `input.js` mapira string `'remove'` na `TILE_TYPES.REMOVE`. Ako `config.js` ne definiše `REMOVE` u `TILE_TYPES` i nema `TILE_CONFIG` entry za njega, `cfg` će biti `undefined` i `canPlace` vraća grešku. U `input.js`, `getApCost` fallback-uje na `1 AP` što radi — ali `canPlace` u `grid.js` neće.
**Preporuka:** Verifikovati da `config.js` ima `TILE_TYPES.REMOVE` i odgovarajući `TILE_CONFIG` entry.

---

## Zora — UX

**Simulirani first-impression na mobilnom (360px wide):**

Pozitivno:
- `index.html` ima svu potrebnu strukturu: loading screen, HUD (oba reda), canvas, palette, actionBar, oba modala, share overlay. Arhitektura HTML-a je solidna.
- OG tagovi su postavljeni ispravno — share preview na WhatsApp/Telegram će izgledati profesionalno.
- Guncati CTA link (`guncati.rs`) postoji i u share overlay-u i u score ekranu — brand vrednost je vidljiva.
- Difficulty picker se prikazuje unutar loading screen-a bez novog DOM elementa — elegantan pattern, ali...

Problemi:
- **Difficulty picker blokira loading screen ali ne skriva spinner** — `innerHTML` loading div-a se zamenjuje pickerom, ali CSS `.loading-spinner` je u starom markupu. Ako CSS targetira `.loading-spinner` klasu i ona nestane, fine — ali `loading-text` klasa se briše bez postepene tranzicije. First impression = abrupt.
- **Palette nema vidljive AP costs dok se ne učita `config.js`** — `buildPalette` je async (dynamic import), paleta se crta sa kratkim kašnjenjem. Na sporom modemnom (3G), igrač vidi prazan `#palette` div.
- **Simulate dugme je inicijalno `disabled`** (pravilno) ali nema vizuelnog tutoriala — novi igrač ne zna šta da klikne prvo.
- **HUD Timer `45s`** je hard-coded u HTML kao placeholder. Ako se state inicijalizuje sa drugačijim vrednostima, timer će pokazivati pogrešno do prvog `updateHUD` poziva.
- **Game-over screen** ne daje jasnu poruku šta se desilo (videti BUG-M4).
- **Share opcija postoji** (`btnShare` sa Web Share API + fallback clipboard) — ovo je dobro implementirano.
- **Mobilni scroll problem** — `touchstart` i `touchmove` pozivaju `e.preventDefault()`, što sprečava scroll, ali samo na canvas-u. Ako je content viši od viewporta (npr. na malim ekranima), ostatak stranice može da bude nedostupan.

---

## Raša — Tech

**Pregled bugova po fajlovima:**

`main.js`:
- `triggerSimulation` nije exportovana → BUG-C1 (kritično)
- `getElementById('btn-simulate')` vs `'btnSimulate'` → BUG-C2 (kritično)
- `initInput(grid, state)` pogrešan redosled → BUG-C3 (kritično)
- `setAnimLerp`/`setPrevLakes` nikad pozvani → BUG-M3
- `addWeekLog` nije importovana ni pozvana → BUG-M5
- `getElementById('debug-panel')` vs `'debugPanel'` → BUG-L1

`hydraulics.js`:
- Mutira state, ne vraća novi objekat → BUG-C4
- `inflowA` formula ignoriše drainage za jezero A → BUG-L3
- Direktna mutacija `lake.pH` u petlji bez mogućnosti rollback-a

`render.js`:
- `drawHeightTint()` je stub bez implementacije → BUG-M1
- `LAKE_A_ORIGIN`, `LAKE_B_ORIGIN`, `LAKE_C_ORIGIN` se importuju direktno iz `config.js` — ako config ne definiše ove vrednosti, render modul pada pri importu. Nema fallback. Međutim, `grid.js` importuje iste konstante, pa ako grid radi, render verovatno radi.

`input.js`:
- Koordinatna konverzija sa `getBoundingClientRect` scaling je **ispravna** — `scaleX/scaleY` se računaju korektno.
- Touch handler poziva `handleClick` odmah na `touchstart` — nema `touchend`. Ovo može dovesti do duple registracije na nekim uređajima.
- `TILE_TYPES.REMOVE` može biti undefined → BUG-L4

`ui.js`:
- Cirkularna zavisnost: `ui.js` dynamic-importuje `main.js` za `triggerSimulation`. `main.js` dynamic-importuje `ui.js`. Ovo **ne uzrokuje runtime grešku** jer su oba dynamic import-a (lazy), ali `triggerSimulation` nikad neće biti dostupna jer nije exportovana (BUG-C1). Ako se BUG-C1 fiksira, circular dependency postaje funkcionalna.
- `showVictoryScreen` je self-contained i ne zavisi od `main.js` — dobar pattern.
- `addWeekLog` je implementirana ispravno ali nije pozvana → BUG-M5.

`grid.js`:
- Logika je solidna. `canPlace`, `getDrainageFlow`, `getBiofilters`, `getWetlandBonus` su dobro implementirani sa `Set` deduplication.
- `initGridWithLakes` pravilno puni kapacitet i level u state — ok.

**Circular dependency status:** Postoji `ui.js → main.js → ui.js` via dynamic import, ali ne pravi deadlock. Rizik je nizak, ali arhitekturalno prljavo.

**`cards.js` / `saveToStorage`:** Nismo čitali `cards.js` ali rizik postoji (videti BUG-M2).

---

## Lela — Engagement

**Da li igra drži igrača?**

Pozitivno:
- **Faza 0 postoji kao difficulty opcija** (Tutorial) — picker ima `window.startNewGame('faza0')`. Pretpostavlja se da `config.js` definiše `DIFFICULTY['faza0']` sa blažim parametrima. Ako jeste, novi igrači imaju onboarding putanju. Ako nije, igra pada pri pokretanju tutorijala.
- **12 nedelja je bounded** — 45s timer po nedelji, plus opcioni rani simulate. Sesija može biti ~10 minuta što je okej za dnevnu igru.
- **`weeklyScores` tracking postoji** u state-u i prikazuje se u victory screen-u kao `rank-dot` vizualizacija — lepo. Problem: `addWeekLog` nije pozvana (BUG-M5), pa igrač ne dobija feedback tokom igre, samo na kraju.
- **"Guncati Knows" kartice** su arhitekturalno postavljene (modal, `initCards`, `unlockNextCard`). Prikazane su kao nagrada po runu. Vizualno naznačeno u HTML-u sa `id="cardModal"` i `aria-labelledby="cardModalTitle"`.
- **`runCount` se čita iz storage i inkrement-uje** — replay incentive postoji. Različite difficulty opcije (3 nivoa) daju razlog za ponovnu igru.
- **Guncati brand vrednost:** Link `guncati.rs` postoji u dva mesta (share overlay + score ekran). `og:title` pominje "Guncati Imanje". `manifest.json` ima `brand_serves: ["guncati"]`. Konzistentno.

Problemi:
- **Nema in-game tutorial teksta** — Faza 0 je samo difficulty level, ne postoji guided walkthrough (tooltip sekvenca, first-run hint, itd.). Igrač koji otvori igru bez poznavanja GDD-a ne zna šta drainage radi, šta pH znači, niti zašto jezera treba punjiti do 0.4 l/s.
- **HUD week log ostaje prazan** tokom cele igre zbog BUG-M5 — igrač nema feedback napretka do samog kraja.
- **Simulaciona animacija ne postoji** (BUG-M3) — 4 sekunde čekanja bez vizuelnih promena deluje kao bug, ne kao feature.
- **Event banner** (`showEventBanner`) je implementiran i prikazuje se, ali samo 5 sekundi. Na mobilnom, igrač može propustiti event ako nije gledao u ekran.
- **Game over bez objašnjenja** — ako ribe uginu, igrač dobija isti generički report screen bez jasne edukativne poruke zašto je izgubio.

---

## Beta Score

**6.2/10**

Igra ima solidnu arhitekturalnu osnovu: HTML struktura je kompletna, grid logika radi, hydraulika je semantički smislena, UX elementi (modali, share, palette) su na mestu. Guncati brand je vidljiv i konzistentno primenjen.

Međutim, **3 kritična buga** (C1, C2, C3) zajedno znače da igra nije playable u trenutnom stanju — simulate dugme ne radi, input se ruši pri pokretanju, a simulacioni trigger ima jednu jedinu putanju (tajmer) koja slučajno radi. Igrač koji ne čeka 45s ne može igrati.

Posle fikseva C1, C2, C3 (procena: ~2h posla), score bi skočio na ~7.5 i igra bi bila playable za GDG feed. Za branded Guncati/Mici share (9+), dodatno treba: implementiran `drawHeightTint`, animacija water levela (M3), week log u toku igre (M5), i jasna game-over poruka (M4).

**Preporučena akcija:** Vrati na Jovu za C1–C3 fix, zatim iter2 beta pre release-a.
