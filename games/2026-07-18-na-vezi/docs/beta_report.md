## BETA TEST REPORT — Na Vezi (Guncati Televizija)

**Metod:** Live browser test (Claude Browser tool) na `play_url` +
ciljana code-review analiza kad je live test udario u zid. Igra se **NE učitava uopšte** —
`#app` ostaje prazan zauvek, ekran je crn od prvog piksela. Pošto live play nije bio moguć
dalje od "otvori stranicu", Beta Trio je pratio import graf (`index.html` → `src/main.js` →
svi moduli koje main.js poziva u redosledu izvršavanja: `state.js`, `config.js`, `render.js`,
`ui.js`, `src/micro/dashboard-state.js`, `src/micro/signal-system.js`,
`src/micro/offgrid-runtime.js`, `src/macro/planning-session.js`) da nađe **zašto**, i našao
lanac od **četiri nezavisne, 100%-reproducibilne fatalne greške** koje redom blokiraju svaku
sledeću fazu igre — čak i kad bi se prethodna popravila.

### Ukupna ocena: 1.2/10 (prosek sve tri)

---

### Zora (UX): 1/10

**Šta radi:** Naslov taba je ispravan ("Na Vezi — Guncati Televizija"), sve mrežne
requeste (`index.html`, 5 CSS fajlova, 45 JS modula) vraćaju HTTP 200 — dakle deploy i
GitHub Pages su tehnički OK, fajlovi postoje i dostupni su.

**Šta ne radi:** Otvorila sam link i dočekala me potpuno prazna tamnoplava pozadina.
Nema logotipa, nema dugmeta, nema teksta, nema loading spinner-a — ništa. Sačekala sam,
osvežila stranicu, sačekala opet — isto. Kao "mama test" ovo je apsolutni fail: prosečan
korisnik zaključi da je link mrtav ili da mu je internet spor, zatvori tab za 5 sekundi i
nikad se ne vrati. Nema ni najmanjeg signala (poruke, ikonice, fallback teksta) da nešto
nije u redu — igra samo ćuti. Kad sam (uz Rašinu tehničku pomoć) ušla u kod da vidim šta bi
korisnik VIDEO da prva greška nije tu — otkrili smo da bi i sledeći ekran (planiranje
nedelje, "5 koraka") pukao isto tako tiho, bez ijedne poruke igraču. Cela premisa igre
("first 5 minuta moraju raditi glatko") je nula — ne postoji ni prvih 5 *sekundi*.

**Bug list:**
- **CRITICAL** — Prazan ekran od otvaranja linka, bez ikakve povratne informacije (vidi
  Raša #1 za tehnički koren)
- **CRITICAL** — Čak i hipotetički kad bi se ekran pojavio, dugme "Kreni na planiranje"
  bi survalo aplikaciju bez poruke igraču (vidi Raša #2)
- **MEDIUM** — Nema error-state ekrana ni za jedan scenario otkazivanja (nema "Ups, nešto
  je pošlo naopako, osveži stranicu" fallback UI)

---

### Raša (Tehničko): 0.5/10

**Šta radi:** Deploy infrastruktura je čista — svih 45 `import` request-a za module (main,
config, state, events, audio, render, ui, sve iz `macro/`, `micro/`, `meta/`, `ui/`,
`content/`) vraćaju 200 sa ispravnim MIME tipom. `index.html` je minimalan i tačan:
`<div id="app"></div>` + `<script type="module" src="src/main.js">`. Problem nije network,
problem je čist JS bug u kodu.

**Šta puca — repro koraci:**

**Bug #1 (CRITICAL — boot failure, blokira 100% korisnika):**
1. Otvori `https://mkdsl.github.io/gari-daily-games/games/2026-07-18-na-vezi/`
2. `document.body.innerHTML` ostaje `78` karaktera zauvek — samo prazan `#app` div, ništa
   se ne renderuje
3. Chrome/browser console **ne prijavljuje** grešku standardnim `read_console_messages`
   pozivom (ES module resolution greške ponekad ne stižu do console API-ja koji čitamo) —
   ali ručnim `import('./src/main.js')` u konzoli dobijamo tačan uzrok:
   ```
   SyntaxError: The requested module './audio.js' does not provide an export named
   'startAmbientPad'
   ```
4. **Koren:** `src/audio.js:44` definiše `function startAmbientPad() {...}` BEZ `export`
   ključne reči (koristi se samo interno unutar `initAudio()` na liniji 35). Ali
   `src/main.js:7` je importuje kao named export:
   ```js
   import {
     initAudio, startAmbientPad, playOnAirJingle, playOffAirFade, ...
   } from './audio.js';
   ```
   i ponovo je poziva direktno na liniji 389 (`_startMicro`). Static ES module import sa
   nepostojećim named export-om je **SyntaxError na nivou modula** — ceo import graf
   main.js-a se ruši, `DOMContentLoaded` handler se nikad ne registruje, `init()` se
   nikad ne pozove. Otud prazan `#app` zauvek, bez ijedne linije u vidljivom console
   logu za prosečnog korisnika.
   **Fix:** dodati `export` ispred `function startAmbientPad()` na liniji 44.

**Bug #2 (CRITICAL — makro planning ekran, blokira odmah posle Bug #1 fix-a):**
1. `src/ui.js:226` definiše `renderMacroPlanningScreen(screen, draftPlan, currentStep, totalSteps, callbacks)` — **5 pozicionih parametara**.
2. `src/main.js:303` poziva je sa **2 argumenta**:
   ```js
   renderMacroPlanningScreen(container, {
     tutorialMode: tutMode, tutorialBannerHtml: ..., onNext: ..., onPrev: ..., onLockIn: ...
   });
   ```
3. Rezultat: `draftPlan` = ceo taj options-objekat (pogrešan oblik), `currentStep` =
   `undefined`, `totalSteps` = `undefined`, `callbacks` = `undefined`.
4. `switch(currentStep)` u `_renderPlanningStep` (ui.js:283) ne pogađa nijedan case
   (0-4 su brojevi, `undefined` nije nijedan) → `#planning-step-content` ostaje prazan.
5. `currentStep < totalSteps - 1` → `undefined < NaN` → `false` → uvek se renderuje
   "🎬 ON AIR!" dugme umesto "Dalje →", bez obzira na "korak".
6. `lockInBtn.addEventListener('click', callbacks.onLockIn)` (ui.js:276) →
   **`TypeError: Cannot read properties of undefined (reading 'onLockIn')`** — baca se
   ODMAH pri renderovanju ekrana, ne na klik. Cela funkcija `_showMacro()` puca sinhrono.
   **Efekat:** igrač koji uspe da prođe kroz boot (posle Bug #1 fix-a) i klikne "Kreni" na
   weekly briefing ekranu — udara u crash odmah, pre nego što vidi ijedan od 5 koraka
   planiranja (format/platforme/oprema/gost/off-grid budžet). Ovo je jezgro cele igre po
   konceptu i nije dostupno.
   **Fix:** uskladiti poziv u main.js sa signaturom u ui.js (proslediti draftPlan,
   currentStep, totalSteps, callbacks kao zasebne argumente — svi postoje u
   `planning-session.js` preko `getDraftPlan()`/`getCurrentStep()`/`getTotalSteps()`).

**Bug #3 (CRITICAL — macro→micro handoff, dvostruki bug u istom lancu):**
1. `src/macro/planning-session.js:96` — `lockInPlan()` vraća **samo**
   `{ ok: true }` (ili `{ ok: false, reason }`), nikad ne vraća stvarni plan
   (`format`/`platform_alloc`/`chosen_guest_id`/`weekly_capacity`).
2. `src/main.js:309` — `const plan = lockInPlan(); if (plan) { _currentPlan = plan; ... }`
   — dakle `_currentPlan` postaje `{ ok: true }`, ne stvarni plan. Sav izbor korisnika iz
   5 koraka planiranja (koji se ISPRAVNO čuva u `state.weekly_plan` preko
   `updateState()` unutar `lockInPlan()`) se **gubi** za lokalnu sesionu promenljivu koju
   `_startMicro`/`_tickMicro`/`_renderMicro` koriste (`plan.platformAlloc`, `plan.format`,
   `plan.guest`, `plan.offgridCapacity` — sve `undefined` na ovom objektu).
3. Paralelno, `src/main.js:377` poziva `initDashboardState()` sa **nula argumenata**, dok
   `src/micro/dashboard-state.js:15` zahteva
   `initDashboardState(plan, equipment, gostInfo, weeklyCapacity)` i **odmah** na liniji 47
   radi `gostArrived: gostInfo.arrived` →
   **`TypeError: Cannot read properties of undefined (reading 'arrived')`**.
4. Ovo se baca unutar `_startMicro()`, posle 3-2-1 odbrojavanja "Odlazite NA VEZU za...".
   Sve što dolazi posle u `_startMicro` (postavljanje off-grid metra, gost dolazak, wiring
   dugmadi, pokretanje RAF petlje) se **nikad ne izvrši**. `_tickState` ostaje `null`,
   pa `getDashboardState()` uvek vraća `null`, pa `_tickMicro` na svakom tick-u odmah
   `return`-uje (main.js:444, `if (!ds || _emisijaEnded) return;`). Live emisija dashboard
   (signal bar, chat, timer, alarmi — sve mikro-mehanike) ostaje zamrznut na statičnom
   HTML-u zauvek — nijedan sistem se ne tick-uje.
   **Fix:** (a) `lockInPlan()` treba da vrati `{ ok: true, plan: { ...draftPlan } }` i
   main.js treba da čuva `result.plan` kao `_currentPlan`; (b) poziv
   `initDashboardState()` u main.js mora proslediti sva 4 očekivana argumenta
   (plan, equipment, gostInfo, weeklyCapacity) u ispravnom obliku.

**Šta dosadi/smeta (posle hipotetičkog fix-a sva tri, ne treba ni doći dovde da bi se
video značaj):**
- **MEDIUM** — `main.js:453-454` poziva `passiveSignalRecover(dt)` i `tickSignal(dt)` sa
  `dt` (uvek `1`) kao "recovery rate" argumentom, umesto
  `GAME_CONFIG.SIGNAL_RECOVER_RATE` (8). Dve odvojene funkcije (`signal-system.js` i
  `dashboard-state.js` imaju SVAKA svoju `tickSignal`/recovery logiku) rade redundantno i
  obe koriste pogrešnu vrednost — signal bi se oporavljao ~8x sporije nego što je
  dizajnirano.
- **MEDIUM** — `main.js:574` referencira `GAME_CONFIG.EMISIJA_DURATION_SECONDS` koji **ne
  postoji** u `config.js` (pravi ključ je `EMISIJA_DURATION = 480`, tj. 8 minuta) — pada
  na fallback `2700` (45:00). Ali `dashboard-state.js:20` koristi tačan
  `GAME_CONFIG.EMISIJA_DURATION` (480s) kao stvarni kraj emisije. Rezultat: tajmer na
  ekranu bi brojao unazad od 45:00 dok bi emisija stvarno završila za 8 minuta — igrač bi
  video "37:xx" na tajmeru u trenutku kad se emisija naglo završi.
- **LOW** — `resolveSignalAction(action)` u `signal-system.js:29` prima samo 1 parametar,
  ali `main.js` je poziva svuda sa 2 argumenta (`resolveSignalAction('reroute', ds)`) —
  drugi argument se tiho ignoriše (nije štetno, ali je mrtav/zbunjujuć kod).
- **LOW** — Nema top-level `try/catch` ni oko `init()` ni oko ES module import lanca —
  jedan typo bilo gde u ~50 modula reprodukuje identičan "prazan crn ekran zauvek" bez
  traga, kao što se ovde i desilo. Nema safety net za buduće izmene.

**Console:** `read_console_messages` alat nije uhvatio nijednu poruku (ni pre ni posle
reload-a) — ES module SyntaxError greške pri boot-u očigledno ne prolaze kroz taj kanal u
ovom okruženju, što je samo po sebi opasno: developer koji se osloni na standardni
console-log monitoring možda neće ni primetiti da je build mrtav.

---

### Lela (Engagement): 1/10

**Šta radi:** Ništa — ovo je najkraći "playtest" koji sam ikad radila. Prvih 0 sekundi =
crn ekran. Prvih 30 sekundi = i dalje crn ekran, sumnjam da mi je uređaj pukao. Nema
zvuka, nema animacije, nema loading indikatora koji bi mi bar dao nadu da nešto radi u
pozadini.

**Šta dosadi:** Sve. Kad sam (kroz kod, ne kroz igru) videla šta je *trebalo* da se desi —
weekly briefing → 5 koraka planiranja → odbrojavanje "3-2-1 NA VEZU" → live dashboard sa
signal barom, tri chat panela, alarmima, EQ minigame-om, gostom koji "upada u kadar" — sve
to zvuči kao potencijalno jako dobar "još jedan" loop (macro-planning napetost + micro
real-time pritisak je tačno onaj manager/sim sendvič koji ova serija igara cilja). Ali
ništa od toga trenutno ne postoji za igrača jer se puca tri puta pre nego što bilo šta od
toga postane vidljivo. Ne mogu da ocenim pacing, "aha" momenat, reward loop ni juice — jer
ih fizički nisam mogla doživeti. Emocionalna mapa je: **0:00 zbunjenost → 0:05 sumnja da je
link mrtav → 0:30 frustracija → napuštanje.**

**Predlog:** Kad se boot lanac popravi (3 CRITICAL bug-a), obavezno vratiti Beta Trio na
punu iteraciju 2 — trenutno nemamo NIJEDAN podatak o stvarnom game feel-u signal
bara/chat momentuma/EQ minigame-a jer se do njih nikad nije stiglo. To je nepoznanica, ne
"radi ali je dosadno".

---

### TOP 3 kritična problema (blocker za release)

1. **Cela igra se ne učitava — trajan crn ekran za 100% korisnika.** `src/audio.js:44`
   definiše `startAmbientPad()` bez `export`, ali `src/main.js:7` je importuje kao named
   export → ES module `SyntaxError` ruši ceo import graf pre nego što `init()` ikad
   pozovemo. Fix: dodati `export` na liniji 44 u `audio.js`.
2. **Macro planning ekran (5 koraka: format/platforme/oprema/gost/off-grid) puca odmah pri
   renderovanju**, čak i posle fix-a #1. `src/ui.js:226`
   `renderMacroPlanningScreen(screen, draftPlan, currentStep, totalSteps, callbacks)` se u
   `src/main.js:303` poziva sa samo 2 argumenta (container + options objekat pogrešnog
   oblika) → `callbacks` je `undefined` → `TypeError` na `callbacks.onLockIn`. Cela
   centralna mehanika igre nikad nije vidljiva igraču.
3. **Live emisija dashboard (mikro layer) se nikad ne inicijalizuje.** Dve nezavisne greške
   u istom lancu: (a) `lockInPlan()` u `planning-session.js:96` vraća samo `{ok:true}`,
   gubi stvarni plan koji `main.js` očekuje kao `_currentPlan`; (b) `main.js:377` poziva
   `initDashboardState()` bez argumenata dok `dashboard-state.js:15` očekuje 4 argumenta i
   odmah radi `gostInfo.arrived` → `TypeError`. Rezultat: `_tickState` ostaje `null`
   zauvek, signal/chat/alarm/timer sistemi se nikad ne pokreću čak i ako igrač stigne do
   "NA VEZU" ekrana.

### TOP 3 "nice to have" (ako ima vremena)

1. Popraviti signal recovery da koristi `GAME_CONFIG.SIGNAL_RECOVER_RATE` (8) umesto
   sirovog `dt` (main.js:453-454) — trenutno bi oporavak signala bio ~8x sporiji od
   dizajniranog, i dupliran kroz dve odvojene funkcije koje rade istu stvar.
2. Popraviti `GAME_CONFIG.EMISIJA_DURATION_SECONDS` → `GAME_CONFIG.EMISIJA_DURATION`
   referencu u `main.js:574` da tajmer na ekranu (trenutno fallback 45:00) odgovara
   stvarnom trajanju emisije (8:00 iz config-a).
3. Dodati minimalan error-boundary/fallback UI za slučaj da `init()` ili module import
   pukne (npr. try/catch oko boot-a koji ispiše "Nešto nije u redu, osveži stranicu"
   umesto tihog crnog ekrana) — ovaj tačan scenario se upravo desio i bio je nevidljiv i
   igraču i standardnom console monitoring-u.
