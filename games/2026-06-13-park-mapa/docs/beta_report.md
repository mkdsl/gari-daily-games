# Beta Report — Park Mapa
**Datum:** 2026-06-16
**Iteracija:** 1
**Beta score:** 6.5/10

---

## Sažetak (Zora/Raša/Lela konsenzus)

Park Mapa je ambijentalno iskustvo sa dobrim temeljom — branded sadržaj za Avala 20.jun je prisutan u kodu, Easter Egg sistem je deterministički implementiran, Daily Light rotacija funkcioniše, a closure fanfare i "Park je za danas tvoj" poruka su tu. Međutim, igra **ne može pouzdano da se pokrene** zbog tri ozbiljna tehnička problem: `systems/index.js` stub postoji ali ga main.js **ne importuje** (ovaj put — tu smo imali sreće); kritičniji je mismatch `CONFIG.ZONE_CHECKIN` vs `CONFIG.PT_REWARDS.ZONE_CHECKIN` koji lomi bonus kalkulaciju u `daily-light.js`; i `CONFIG.EGG_HIT_RADIUS` / `CONFIG.STORIES_PER_ZONE` / `CONFIG.ZONE_MAX_LEVEL` ne postoje u config.js (fallback-i postoje ali su fragilni). Za branded Kluboslavija asset nivo kvaliteta potrebno je rešiti sve CRITICAL i ključne MEDIUM stavke.

---

## CRITICAL Bugovi

### C1 — `CONFIG.ZONE_CHECKIN` i `CONFIG.ZONE_CHECKIN_DAILY_LIGHT` ne postoje u config.js
**Lokacija:** `src/systems/daily-light.js`, linija 61
**Problem:** `completeDailyLight()` računa bonus kao:
```js
const bonus = (CONFIG.ZONE_CHECKIN_DAILY_LIGHT || 25) - (CONFIG.ZONE_CHECKIN || 15);
```
`CONFIG.ZONE_CHECKIN_DAILY_LIGHT` i `CONFIG.ZONE_CHECKIN` ne postoje na root nivou CONFIG objekta — vrednosti žive u `CONFIG.PT_REWARDS.ZONE_CHECKIN_DAILY_LIGHT` i `CONFIG.PT_REWARDS.ZONE_CHECKIN`. Pošto `undefined || 25` i `undefined || 15` vraćaju fallback vrednosti, **ovo ne baca grešku ali nije konzistentno** — ako se ikad menja PT_REWARDS, daily-light.js ostaje desinhronizovan. Kategorija CRITICAL jer je ovo jedini mesto u kodu koji ne prati PT_REWARDS šemu (svi ostali — zone-manager.js — koriste ispravno `CONFIG.PT_REWARDS.*`).

**Fix:** U `daily-light.js` linija 61 promeniti na:
```js
const bonus = CONFIG.PT_REWARDS.ZONE_CHECKIN_DAILY_LIGHT - CONFIG.PT_REWARDS.ZONE_CHECKIN;
```

### C2 — `CONFIG.EGG_HIT_RADIUS` ne postoji u config.js
**Lokacija:** `src/systems/easter-eggs.js`, linija 209
**Problem:** `checkEggClick(eggs, x, y, radius = CONFIG.EGG_HIT_RADIUS ?? 12)` — `CONFIG.EGG_HIT_RADIUS` nije definisan u config.js, pa je efektivni radius uvek 12px. Na mobilnom touchscreen-u ovo je premali target (preporučeno 24–30px za touch). Igra radi ali egg klikovi su frustrirajuće precizni na mobilnom — što je bloker za Avala event companion ulogu igre (većina publike je na mobitelu).

**Fix:** Dodati u `src/config.js`: `EGG_HIT_RADIUS: 24,` (ili 30 za touch-friendly).

### C3 — `systems/index.js` stub postoji i sadrži netačan template kod
**Lokacija:** `src/systems/index.js`
**Problem:** Fajl postoji i sadrži `updateSystems()` funkciju sa komentovanim pozivima za `physics`, `collision`, `AI` — ovo je template ostatak koji ne pripada Park Mapi. Main.js ga **ne importuje** (potvrđeno pretragom — nema `from './systems/index'` nigde), pa nema direktnog runtime efekta. Međutim, fajl može zbuniti buduće agente i postoji rizik da neka build pipeline alatka ili IDE auto-import ga povuče. Mora se ukloniti ili jasno označiti kao DEAD CODE.

**Fix:** Obrisati `src/systems/index.js` ili minimalno promeniti sadržaj u komentar: `// MRTAV STUB — ne koristiti. Park Mapa ne koristi physics/collision sisteme.`

### C4 — `CONFIG.STORIES_PER_ZONE` i `CONFIG.ZONE_MAX_LEVEL` ne postoje u config.js
**Lokacija:** `src/systems/zone-manager.js`, linije 137 i 175
**Problem:**
- Linija 137: `const storyCap = CONFIG.STORIES_PER_ZONE ?? 5;` — fallback 5 radi ali nije u config-u.
- Linija 175: `const maxLevel = (CONFIG.ZONE_MAX_LEVEL ?? 5);` — fallback 5 radi ali nije u config-u.

Ako se ikada doda `STORIES_PER_ZONE: 3` u config bez znanja da ovo fallback postoji, ponašanje se promeni bez upozorenja. Pošto `ZONE_LEVEL_COSTS` ima tačno 4 vrednosti (1→2, 2→3, 3→4, 4→5), max level 5 je ispravan — ali mora biti eksplicitno u config-u.

**Fix:** Dodati u config.js:
```js
STORIES_PER_ZONE: 5,
ZONE_MAX_LEVEL: 5,
```

---

## MEDIUM Problemi

### M1 — Splash screen nema `hideSplash` callback za automatsko zatvaranje pri kliku na HUD dugmad
**Lokacija:** `src/ui/splash.js`, `src/main.js`
**Problem:** Splash se prikazuje 400ms posle init-a i nudi "Klikni ili čekaj 2.5s". Click handler na splash elementu poziva `hideSplash(state)`. Međutim, ako korisnik klikne HUD dugme (Logbook, NPC, Audio) pre nego što splash nestane, splash ostaje vidljiv jer click event ne propagira do splash handlera (splash je `z-index: 1000`, pokriven). Korisnik vidi zamrznuti HUD za 2.5s.

**Fix:** U `showSplash()` dodati `document.addEventListener('click', () => hideSplash(state), { once: true })` na `document` (ne na element), pa ukloniti listener kad splash nestane.

### M2 — Cooldown feedback je samo toast, nema vizuelnog CD timera na tile-u
**Lokacija:** `src/main.js` linija 315, `src/systems/park-board.js`
**Problem:** Kad zona ima active cooldown, klik prikazuje toast "CD 4h 32m". Nema vizuelnog indikatora na samom tile-u (npr. clock overlay, zatamnjen tile, progress arc). First-impression igrač ne zna zašto ništa nije kliknuto i može da misli da igra ne radi.

**Fix:** U `renderActiveZone()` ili direktno u `renderPult/Bina/Suma`, proveriti `getZoneCooldownRemaining(state, zoneId)` i nacrtati poluprovidni overlay + tekst "CD X h" kada je cooldown aktivan.

### M3 — `showFlavorScreen` koristi dynamic `import()` za zone module unutar render function-a
**Lokacija:** `src/ui.js`, linija 141–143
**Problem:** `import('./zones/pult.js')` itd. se poziva svaki put kad se otvara flavor overlay. Ovo su async dynamic imports koji rade **ali** nude potencijalni race condition: ako korisnik brzo klikne dve zone u nizu, drugi import() može završiti pre prvog i prikazati pogrešni story. Praktičan rizik je nizak ali postoji.

**Fix:** Pre-load zone module-e pri inicijalizaciji u `main.js` i cache-ovati ih, ili koristiti statički import za sve tri zone (već su statički importovani u park-board.js, pa je double-import samo nepotreban overhead).

### M4 — HUD je sve inline style, ne koristi CSS varijable iz theme.css
**Lokacija:** `src/ui.js`, `src/ui/splash.js`, `src/ui/closure.js`
**Problem:** `theme.css` definiše `var(--gold)`, `var(--text)`, `var(--bg-panel)` itd. ali HUD i svi overlays koriste hardcoded hex vrednosti (`#FFD700`, `#E8DCC8`, `#0D1B2A`). Sezonski skin switching (`src/ui/season-skin.js`) menja CSS varijable — ali HUD neće pratiti sezonske promene jer ne koristi varijable.

**Fix:** Refaktorisati HUD innerHTML da koristi CSS klase sa varijablama, ili barem zameniti hardcoded boje sa `getComputedStyle(document.documentElement).getPropertyValue('--gold')` pattern-om.

### M5 — `fetchSetlist()` koristi relativnu putanju `./data/bina-setlist.json` koja može pucati na GitHub Pages
**Lokacija:** `src/content/bina-setlist-loader.js`, linija 8
**Problem:** `fetch('./data/bina-setlist.json')` — relativna putanja se resolve-uje u odnosu na HTML stranicu (`index.html`), a ne u odnosu na JS fajl. Na GitHub Pages, `index.html` je na root putanji igre, pa bi `./data/bina-setlist.json` trebalo da radi ispravno. **Međutim**, ovo treba potvrditi jer ES6 moduli resolve-uju relativne putanje u JS fetch-u u odnosu na dokument, ne modul. `data/bina-setlist.json` **postoji** u folderu, pa je ovo sivo područje — treba testirati live.

**Napomena:** Fetch ima `.catch()` handler i tiho vraća `null` ako fail. Bina tile će prikazati `setlistData = null` i neće pokazati Setlist Tablu. Za Avala 20.jun branded feature ovo bi bio tih failure koji oštećuje brand.

**Fix:** Koristiti apsolutnu putanju baziranu na `import.meta.url` ili testirati live pre release-a. Alternativno: ugraditi setlist direktno u kod kao JS modul (`export const SETLIST_DATA = {...}`) i ukloniti fetch.

### M6 — Bina zona: Setlist tabla prikazuje samo sledeći event, ne Avala ekskluziv posebno
**Lokacija:** `src/zones/bina.js`, linija 113
**Problem:** `getNextEvent()` vraća prvi nadolazeći event. Danas je 2026-06-16, a Avala je 2026-06-20 — dakle **trenutno radi ispravno** i Avala je sledeći event. Ipak, ako fetch setliste padne (`setlistData = null`), nema fallback prikaza Avala datuma. Za Avala 20.jun window (±3 dana, dakle 17–23 jun), ovo je kritično za brand prisustvo.

**Fix:** Hardcode-ovati Avala datum kao fallback u `renderBina()` kad je `setlistData = null`.

---

## LOW / Nice-to-have

### L1 — `updatePTDisplay` animacija koristi CSS `ptPulse` koji možda nije definisan u stylesheetovima
**Lokacija:** `src/ui.js`, linija 333 — `el.style.animation = 'ptPulse 0.4s ease-out'`. Pretragom `styles/game.css` i `styles/ui.css` treba proveriti da li `@keyframes ptPulse` postoji. Ako ne postoji, animacija se tiho ignoriše — vizuelni feedback PT promena je izguban.

### L2 — Splash screen `hideSplash` ne inkrementira `totalDaysVisited`
**Lokacija:** `src/ui/splash.js`, linija 93–96
**Problem:** `hideSplash()` samo setuje `state.lastSplashDate`. `totalDaysVisited` se ne inkrementira. Ovo znači da `isFirstVisit` u splash ostaje `true` sve dok `totalDaysVisited` ne poraste, a to se ne dešava automatski.

### L3 — NPC panel (M4 veza): Đorđe NPC ima `zone: null` u config.js
**Lokacija:** `src/config.js`, linija 92 — `zone: null`. NPC sistem treba da handle-uje `null` zone NPC bez pada. Treba proveriti `npc-board.js` da li `null` zone NPC dobija misije.

### L4 — `bioluminiscencija` u suma.js nije testirana u ovom beta testiranju
`src/zones/suma.js` nije pročitana — Lela primećuje da bioluminiscencija canvas efekat zahteva posebnu pažnju na low-end mobilnim uređajima. Preporučuje se test na mid-range Androidu pre release-a.

### L5 — Prestige sistem postoji (`src/systems/prestige.js`) ali je markiran kao "Sezona 2"
Toast u main.js: "Prestige dolazi u Sezoni 2!" — ispravno kommunicirano ali `prestige.js` modul zauzima memoriju i učitava se. Ne blokira ništa, ali ukoliko modul ima inicijalizacioni kod koji puca, to je silent bug.

### L6 — `isAvalaWeek()` je definisan u DVA fajla
**Lokacija:** `src/zones/bina.js` linija 38 i `src/content/bina-setlist-loader.js` linija 35 — dupla implementacija iste funkcije. Nema konflikta ali je DRY violation.

---

## Detaljan izveštaj po uglu

### Zora UX

- **First-impression (0–30s):** Splash screen se prikazuje sa dnevnim svetlo informacijom i "⭐ Bina" ili koja god zona je dnevno svetlo. Dobar onboarding. Slide-in animacija (`translateY(-100%)`) je prisutna.
- **Šta da radim?** nije odmah jasno za nove korisnike — HUD pokazuje "Svetlo: Bina ⭐" ali nema tooltip ni text koji govori "klikni na Binu". Cursor se menja na pointer iznad tile-a (dobro), ali tile nema "klikni me" animaciju pre prvog hover-a.
- **Flavor overlay** ima "Nastavi" dugme koje je implementirano i funkcioniše. Backdrop klik takođe zatvara. Dobro.
- **HUD čitljivost:** PT balans (zlatno, 16px), rang (plavo, 10px), Dnevno Svetlo sa bojom zone, Eggs: X/7. Razumljivo ali tesno na 375px wide (iPhone). `flex-wrap: wrap` postoji, ali na malim ekranima HUD se prelama nepredvidivo.
- **Cooldown feedback:** SAMO toast notifikacija. Nema stalnog vizuelnog CD indikatora na tile-u — ovo je M2 problem, ponavlja se ovde kao UX finding.
- **Locked zone interakcija:** Klik na locked zonu prikazuje toast "U izgradnji..." — razumljivo ali nije exciting. Nema ikakve "unlock preview" informacije.
- **Golden frame za Dnevno Svetlo:** Animovani zlatni dashed border postoji u `renderDailyLightFrame()` sa `"* DNEVNO SVETLO *"` tekstom iznad tile-a. Vizualno jasno.

### Raša Tech

- **systems/index.js stub:** POSTOJI na disku (`src/systems/index.js`) — sadrži template `updateSystems()` sa commented-out `updatePhysics`, `updateCollision`. Main.js ga **NE IMPORTUJE** (potvrđeno grep-om — nula referenci na `systems/index`). Nema direktnog runtime efekta ali mora biti uklonjen (vidi C3).
- **ES6 import paths (ui/ direktorijum):** Svi fajlovi u `src/ui/` importuju `'../config.js'` i `'../systems/*.js'` — putanje su ispravne (jedan nivo gore do `src/`, pa dalje). Nema grešaka u import tree-u za ui/ fajlove.
- **Canvas init redosled:** `canvas.getContext('2d')` se poziva (linija 69 u main.js) PRE `initRenderer(canvas)` (linija 70). To je ispravno — nema rizika od null ctx.
- **createInitialState vs createState:** main.js importuje `createInitialState` iz `./state.js` (linija 8). `state.js` eksportuje `createInitialState` (linija 10). MATCH — nema bug-a. Template rizik je mitigiran.
- **savegame.js — loadGame() vs loadState():** main.js importuje `loadGame` iz `./systems/savegame.js` (linija 15). `savegame.js` eksportuje `loadGame` (linija 34). MATCH. `state.js` ima `loadState()` ali to nije korišćeno od main.js — jedino mesto za persistence je savegame.js. Konzistentno.
- **bina-setlist-loader.js fetch URL:** `fetch('./data/bina-setlist.json')` — relativno prema dokumentu. `data/bina-setlist.json` fajl postoji (potvrđeno). Rizičan na fetch-u pre deploy-a (vidi M5).
- **CONFIG.ZONE_CHECKIN bug (daily-light.js):** `CONFIG.ZONE_CHECKIN_DAILY_LIGHT` i `CONFIG.ZONE_CHECKIN` ne postoje na root CONFIG — fallback su `|| 25` i `|| 15`. Konfiguracija ispravna po slučaju ali desinhronizovana (vidi C1).
- **CONFIG.EGG_HIT_RADIUS:** Ne postoji — fallback `?? 12` aktivan. Mobilni touch experience pati (vidi C2).
- **CONFIG.STORIES_PER_ZONE i CONFIG.ZONE_MAX_LEVEL:** Ne postoje — oba imaju `??` fallback. Funkcionalno ali fragilno (vidi C4).
- **zone-manager.js — canCheckIn bug potencijal:** `zone.lastCheckin` je `null` za novu igru → `canCheckIn` vraća `true` ispravno. `zone.lastCheckin = Date.now()` se čuva kao number — ispravno.
- **zones/bina.js eksporti:** `renderBina`, `updateBinaAnimation`, `setSetlistData`, `getSetlistData`, `getBinaStory`, `getBinaFlavorText` — svi su eksportovani. `park-board.js` importuje `renderBina` i `updateBinaAnimation` — MATCH.

### Lela Engagement

- **Park je živ?** Clouds parallax (6 oblaka, modularna brzina), twinkling stars (30 fixnih), lampion pulse animacije u svim zonama, NPC siluete (Ace na Bini) — park nije prazan. **Dobar vizuelni ritam.** Međutim, bez audio (pre prvog klika) i bez animiranih NPC-a koji se kreću, park je vizuelno statičniji nego što zvuči u konceptu.
- **Easter Eggs glow efekat:** Implementiran u `renderEgg()` — radijalni gradijent `rgba(255,215,0,0.3*pulse)` + pulse animacija bazirana na `time * 3`. Jaja su **vidljiva i privlačna** na dark background-u. Thumbs up.
- **Dnevno Svetlo vizualna jasnoća:** Zlatni animated dashed border oko tile-a je markiran. `"* DNEVNO SVETLO *"` tekst iznad tile-a. HUD indikator. Tri sloja komunikacije — dobro za novo-onboarded korisnike.
- **"Park je za danas tvoj" poruka:** Implementirana u `closure.js` — zlatni tekst, PT summary, "Nastavi" dugme. Closure se triggeruje kad su sva 7 jaja i sve zone checked-in. `closureFanfare` se poziva. Emotivno zadovoljavajuć zaključak dnevne sesije. **Odlično.**
- **Bina zona za Avala 20.jun:** `isAvalaWeek()` logika postoji, Setlist Tabla prikazuje `"06-20 — Avala"` i `"★ AVALA EXCLUSIVE"` kад je `avala_exclusive: true`. Danas (16. jun) je **4 dana pre Avale**, pa `isAvalaWeek()` (±3 dana) neće biti aktivan do 17. juna. Setlist tabla prikazuje datum bez exclusive badge-a — to je ispravno za danas. **Za Avala window, branded content je tu.**
- **Sesija je završena signalizacija:** Dobra (vidi closure). Ali nema preview "koliko jaja ostaje" na mapi, samo u HUD-u ("Eggs: 3/7"). Tile-ovi ne pokazuju collected/uncollected ratio per-zone.
- **NPC panel:** Implementiran u `src/ui/npc-panel.js`. 4 NPC-a (Vlado/Mara/Ace/Đorđe). Misija progress bars, submit reward interakcija — sve je tu po kodu. Đorđe `zone: null` (vidi L3) treba proveru.
- **Replay/retention hook:** Daily eggs reset svaki dan (seed-based), Daily Light rotira po zoni, stories se unlock-uju kumulativno (5 po zoni = 15 ukupno), rank sistem do "MKDSLend Original". Postoji dovoljno motivacija za višednevno vraćanje. **Retention fundament je solidan.**
- **Scope gap:** manifest pokazuje `total_js: 4826` linija — ispod floor-a od 8000 linija za single-layer igru po CLAUDE.md pravilima. Park Mapa je ambient/persistent tip koji ne treba isti LOC kao arkada, ali neke sistemi deluju tanko: `progression.js`, `park-legend.js`, `prestige.js` nisu analizirani i moguće da su stub-ovi.

---

## Beta Score Justification

**6.5/10** — igra ima solidan branded core (Avala branded content, Dnevno Svetlo, Easter Eggs, Closure fanfare, Logbook, NPC panel sve postoji), ali 4 CRITICAL tehničke rupe moraju biti fiksovane pre release-a. Tri od četiri CRITICAL stavke su "fragilne konfiguracije" koje su za sada mitigirane fallback-ima ali će biti ticking time bombs u budućim iteracijama. Četvrta (systems/index.js stub) je mrtav kod koji mora ići. Za 7.0+ (Kluboslavija branded asset standard) potrebno je rešiti C1–C4 + M2 (cooldown vizualizacija) + M5 (setlist fetch pouzdanost). Nakon fix-a, ponovna iteracija beta score-a bi trebalo da dostigne 7.5–8.0.

| Oblast | Ocena |
|--------|-------|
| Tehnicka ispravnost | 5/10 (4 critical konf. bug-a) |
| UX/First impression | 7/10 (splash dobar, CD feedback loš) |
| Brand engagement (Avala) | 7.5/10 (content postoji, fetch risk) |
| Game feel / animacije | 7/10 (eggs glow, closure, lampioni) |
| Retention mehanika | 7/10 (daily reset, stories, ranks) |
