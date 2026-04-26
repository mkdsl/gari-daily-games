# Beta Izveštaj — Rovovi i Ruševine

## Ocena: 6/10

## TOP 3 Kritični Bugovi

### Bug 1: Ammo leak pri prepisivanju akcija
- **Simptom:** Igrač klikne PUCAJ na neprijatelja (oduzima 2 metka), pa klikne POMERI za istog vojnika (akcija se zameni). Meci su trajno izgubljeni iako pucanje nije izvršeno.
- **Uzrok:** `main.js:117-121` — `state.ammo -= CONFIG.AMMO_SHOOT` se izvršava pri queuing-u, a `queueAction` tiho briše prethodnu akciju bez refunda.
- **Fix:** U `queueAction` pre overwrite-a, refundovati ammo cost prethodne akcije istog vojnika.

### Bug 2: Artillery spawn na x=10 — nevidljiv na mobilnom
- **Simptom:** Na mobilnom ekranu (<600px širina), MOBILE_COLS=9 prikazuje kolone 0-8. Artillery se spawna na x=10 (linija 3) i nikad nije vidljiv igraču — ne može biti target i ne može biti poražen.
- **Uzrok:** `entities/enemy.js:37` — `makeEnemy(id++, 'ARTILLERY', 10, lineY, grid)`
- **Fix:** Promeniti x na 8 za artillery; oficir na 5 ostaje.

### Bug 3: Negativan offsetY na kratkim desktop ekranima
- **Simptom:** Na ekranima sa visinom <520px, grid (8×60=480px) izlazi van ekrana odozgo.
- **Uzrok:** `render.js:28` — `offsetY = Math.floor((h - gridH) / 2 - 20)` daje negativnu vrednost.
- **Fix:** Clamp na minimum 40px (ispod HUD-a): `Math.max(40, Math.floor((h - gridH) / 2 - 20))`

## UX Nalazi (Zora)
- Toolbar dugmad su jasna ali nema vizuelnog feedback-a kada akcija nije moguća (osim `disabled` class). Pucanje na celu van range-a ne daje nikakvu povratnu informaciju — igrač misli da je kliknuo pogrešno.
- "Potez!" dugme je dobro pozicionirano. WWI estetika je konzistentna i čitljiva.
- Nedostaje opis pravila na MENU ekranu — dve rečenice postoje ali nisu dovoljne za nove igrače.

## Tech Nalazi (Raša)
- Bug 1-3 (vidi gore)
- `getLayout` je importovan u `main.js` ali se ne koristi — dead import, ne utiče na runtime
- `systems/index.js` (template ostatak) je u folderu ali nije importovan nigde — neće napraviti problem
- Simultano rešavanje poteza je korektno implementovano kao sekvencijalno sa vizualnom iluzijom simultanosti ✓
- Win condition koristi `lineEnemiesSpawned` check — ispravno, neće dati false-win ✓
- Officer buff metod `applyOfficerBuffs` je prazna implementacija (komentar kaže "simple implementation: skip") — officer je prisutan ali nema efekat

## Engagement Nalazi (Lela)
- Taktički feel je dobar: izbor između pucanja i kretanja je pravi tradeoff
- Tri linije sa eskalacijom (mitraljezac → oficir+artiljerija) daje dobar pacing
- Replayability je ograničen jer je raspored isti svaki put — ali za jednog-dana igru je prihvatljivo
- Artillery koji je nevidljiv na mobilnom (Bug 2) ruši engagement za mobilne igrače

## Šta Radi Dobro
- Estetika (sepija, military-map stil) je čista i koherentna
- Turn engine je solidan — faze rešavanja su logične
- Simultane animacije daju "wow" momenat
- Scoring sistem S/A/B/C daje replayability motivaciju

## Preporuka
**SHIP SA FIXOVIMA** — Bugovi 1-3 su fixabilni u < 30 minuta. Officer bez efekta je prihvatljiv za v1.
