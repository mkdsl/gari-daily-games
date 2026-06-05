# Beta Report — Festival Mreža (iter 1)
**Datum:** 2026-06-05
**Agenti:** Zora Zona + Raša Raštura + Lela Loop

---

## Ukupna ocena: 7.4/10

---

## CRITICAL (blokiraju gameplay)

- **[CRITICAL-01]** `saveMacroState` serijalizuje `active_coordinators` sa samo `{id, loyalty, usedThisCity}` (state.js:136-141), ali `macro_engine.js`, `coordinator_manager.js` i `ui.js` na restored stanju čitaju `.loyaltyTier`, `.activeAbility`, `.baseCostMultiplier` itd. — polja koja **ne postoje** u deserializovanom objektu posle `loadMacroState`. Svaki reload stranice ostavlja koordinatore bez loyalty tiera i bez active ability, a `renderCoordinatorPanel` pristupa `c.loyaltyTier` direktno. **Efekat:** posle prvog page refresh, `c.loyaltyTier` je `undefined`, što kreira NaN u tier display-u i pokvari satisfaction kalkulacije vezane za koordinatore. **Lokacija:** `src/state.js:134-146`, `src/ui.js:148`, `src/rendering/hud_renderer.js:45`. **Fix:** Proširiti saveMacroState da sačuva kompletne coordinator objekte ili dodati restoreCoordinatorInstances logiku koja repopuluje iz COORDINATORS mape po id-u.

- **[CRITICAL-02]** `renderMacroScreen(macro, meta)` se poziva svaki animation frame (main.js:109) dok je layer `macro`. To znači **~60 poziva/sekundi** koji rebuildu ceo innerHTML `city-panel`, `coordinator-panel`, `action-panel` i `upgrades-panel`. Svaki rebuild re-kreira DOM event listenere koji nikad nisu skinuti (leakaju). Za 60 sekundi na macro screenu → 3600 handler leak-ova. **Efekat:** igra postaje progresivno sporija na macro screenu; na mobilnom uređaju vidljivo posle ~30s. **Lokacija:** `src/main.js:109`, `src/ui.js:37-43`. **Fix:** Dodati dirty-flag ili throttle `renderMacroScreen` na max 2fps (500ms interval), jer se macro state menja samo na user akcijama, ne svaki frame.

- **[CRITICAL-03]** `input.js:146` poziva `buyPromo(macro, param, macro.city_order[macro.current_city_index], _upgradeEffects)`. Međutim posle učitavanja sačuvane igre, `macro.city_order` je prost JSON array (stringa), što je ispravno — ali `macro.current_city_index` može biti `undefined` ako je saveMacroState/loadMacroState migration propuštena (linija 117-119 filtrira promo_investments ali ne proverava `current_city_index`). Pored toga, `buyPromo` u `promo_engine.js:14` prima `cityId` kao string, ali nema validaciju — ako je `undefined`, promo se pravi bez cityId i nikad ne doprinosi buzz-u. **Lokacija:** `src/input.js:146`, `src/systems/promo_engine.js:14-55`. **Fix:** Dodati null-check: `const cityId = macro.city_order?.[macro.current_city_index]; if (!cityId) return;`

---

## MEDIUM (oštećuju first-impression)

- **[MEDIUM-01]** BPM slider nema labelu koja objašnjava šta radi novom igraču. U index.html, iznad slider trake je samo `<span style="font-size:9px">BPM</span>` — troneksa labela bez konteksta. Igrač koji ne zna šta je BPM neće intuitivno razumeti da pomeraj slidera utiče na crowd mood. Na mobilnom uređaju, cifre (90, 104, 122, 138) su jedina referenca. **Lokacija:** `index.html:118-131`. **Fix:** Dodati kratki tooltip ili subtitle `"Ritam muzike — utiče na mood publike"` vidljiv pri prvom otvaranju micro screena.

- **[MEDIUM-02]** Redirect buttons su statički disabled kada je `fromZone.current_crowd === 0` ali ne postoji vizuelni tooltip koji objašnjava zašto su disabled. Igrač u prvim minutama (pre nego što se popune zone) vidi 4 siva dugmeta i ne zna da treba čekati. `state.reason` je popunjen u `getRedirectButtonStates`, ali se samo setuje kao `btn.title` (ui.js:253) — a `title` tooltip ne radi na mobilnom. **Lokacija:** `src/ui.js:248-255`. **Fix:** Dodati vidljivi disabled-reason tekst ispod dugmadi ili inline span koji se pokazuje/skriva.

- **[MEDIUM-03]** Loading screen aforizam se prikazuje ali vizuelno nema jasnog indikacija koliko loading traje. Jedini indikator je CSS `.loading-spinner` — no nigde u kodu nema progress tracking, spinner se vrti beskonačno tokom 600ms `setTimeout`. Ako igra radi na sporom uređaju i ES6 modul import traje duže (mada je malo verovatno), spinner neće preći u macro screen sve dok `DOMContentLoaded` i `init()` nisu završeni. **Lokacija:** `src/main.js:74`, `index.html:22`. **Fix:** Loading message poput "Učitavanje..." ispod spinnera i explicitni `hide` tranzicija bi poboljšali first-impression.

- **[MEDIUM-04]** `renderVictoryScreen` u `ui.js:359` dodaje event listener `el.addEventListener('click', onMacroClick)` ali `onMacroClick` u ui.js (linija 452-456) je stub koji ne radi ništa — `// Action handled by input.js (event bubbles up)`. Na victory screenu, Share i Prestige dugmad su unutar `victory-screen` diva koji **nije** pokriven `macro-screen` input.js event delegacijom (jer je to `#macro-screen`, ne `#victory-screen`). Rezultat: **Share i Prestige dugmad na victory screenu ne rade**. **Lokacija:** `src/ui.js:359`, `src/input.js:35-37`. **Fix:** Proširiti input.js event delegaciju da include-uje `#victory-screen`, ili dodati direktne event listenere u `renderVictoryScreen`.

- **[MEDIUM-05]** `macro.promo_investments` se serijalizuje kao plain array objekata (saveMacroState:133), ali `getCityBuzzSimple` u `macro_renderer.js:160-166` poziva `p.currentBuzz(now)` — kao **metodu** na promo objektu. Posle page reload-a, `promo_investments` su deserializovani JSON objekti bez `.currentBuzz()` metode → **TypeError: p.currentBuzz is not a function**. Ovo krasuje macro Canvas rendering odmah po page reload-u. **Lokacija:** `src/rendering/macro_renderer.js:163`, `src/state.js:117-119`. **Fix:** `getCityBuzzSimple` mora koristiti pure kalkulaciju (bez poziva metode), ili `loadMacroState` mora restoreovati PromoRecord class instance iz plain objekata.

---

## LOW (polish, next pass)

- **[LOW-01]** `hud-text-cue` element postoji unutar `#micro-canvas-wrapper` (index.html:106) ali `showTextCue` u `hud_renderer.js:133` ga traži globalno sa `getElementById` — to funkcioniše, ali cue tekst se pojavljuje vizuelno over macro screen-a (ostaje vidljiv) ako se showTextCue pozove tokom macro layera. Specifično, `onEventEnd` poziva `showTextCue` a tek posle `showScreen('macro')` (main.js:243) — znači tekst ostaje na screenu koji je sada macro. Vizuelno OK ali može zbuniti.

- **[LOW-02]** `updateMacroHUD` u `hud_renderer.js:123` koristi hardcoded array `['Niš', 'Sarajevo', 'Štrand', 'Guncati', 'Avala']` umesto `CITIES` data — duplikacija podataka, potencijalni mismatch ako se gradovi promene. **Lokacija:** `src/rendering/hud_renderer.js:123`.

- **[LOW-03]** Prestige screen (renderPrestigeScreen) omogućava potvrdu sa 3 izabrana insighta, ali ako igrač ima `meta.veteran_insights` iz prethodnog prestige-a (npr. 2 pre-populated), može pokušati da ih de-selektuje i doda nove — ovo radi ispravno, ali nema vizuelnu indikaciju koji su "prethodno aktivni" nasuprot "novo birani". UI bug: `let selected = [...meta.veteran_insights]` inicijalizuje listu, ali `insight-card.selected` CSS klasa se ne dodaje za already-selected insightove pri renderu. **Lokacija:** `src/ui.js:371-380`.

- **[LOW-04]** `Guncati locked` je prikazano kroz disabled `btn-start-event` sa tekstom `🔒 Guncati Locked` u city-panel, ali canvas macro renderer i dalje prikazuje Guncati node kao locked vizuelno sa lock emoji-jem — ovo je dobro. Međutim, canvas lock je prikazan samo kada `meta.guncati_unlocked === false` AND `cityId === 'guncati'`. Problem: Guncati je u city_order na poziciji 3 (`CITY_ORDER[3]`), a `renderCityPanel` uvek prikazuje **current city** (`CITY_ORDER[macro.current_city_index]`). Dakle igrač ne može da vidi Guncati locked stanje dok ne stigne na index 3. Pre toga, nema vizuelnog upozorenja "ovo je locked" na canvas. Samo canvas node ima lock prikaz.

- **[LOW-05]** `onStartEvent` u main.js poziva `AudioAPI.onEventStart(cityId)` unutar `initMicroEvent` (micro_engine.js:61) ali `initMicroEvent` je pozvana **pre** nego `showScreen('micro')` (main.js:188). Web Audio context može biti suspended i resume() je async — u teoriji, audio počinje pre nego što je micro screen vidljiv. Praktično beznačajno, ali ordering je logički obrnut.

- **[LOW-06]** Redirect buttons u index.html imaju engleski tekst: `Dance→Chill`, `Bar→Dance`, `Chill→Stage`, `Stage→Bar`. Ostatak UI je na srpskom. Inconsistency u jeziku — konzistentnost sa "Ples→Opuštanje" ili sličnim bila bi lepše, ali nije bloker.

- **[LOW-07]** `btn-start-event` u `input.js:42-47` dodaje event listener jednom pri init — ali button se **rebuildi** svaki put kad `renderCityPanel` gradi novi innerHTML (što je na svakom frame-u, videti CRITICAL-02). Tako se `btn-start-event` listener nikad ne aktivira jer `getElementById` pri init hvata stari element koji je odmah zamenjen novim innerHTML-om. **Ovo je zapravo CRITICAL** — "Počni Event" dugme ne radi! — ali ga stavljamo ovde jer je posledica CRITICAL-02 i rešava se istim fixom.

---

## Zora — UX & Pristupačnost

**Macro screen (first-impression):**
Loading screen je čist — aforizam se učitava, spinner se vrti, prelaz je gladak (~600ms). Dobar first-impression. Macro screen prikazuje mrežu gradova odmah — canvas network je vizuelno upadljiv i jasan. Budget/Tier/City HUD bar na vrhu je razumljiv.

**Problem sa onboardingom:** Novi igrač ne dobija nikakvu instrukciju šta su "Promo Investicija" dugmad ili šta znači "Buzz" metrika. City panel ima sekcije ali bez tooltip-a ili tutorial teksta. Guncati locked je jasno samo vizuelno na canvas node-u — u panelu vidljivo tek kad se dođe do te runde.

**BPM slider:** Labela "BPM" je premala (9px) i bez objašnjenja. Na mobilnom touchscreenu, slider je uzak i može biti teško precizno pomerati.

**Incident modal:** Blokirа gameplay — odlično. Opcije su jasno prikazane sa cenom u boji (zelena = može, crvena = nema budžeta). Intuitivno.

**Coordinator panel:** Portret inicijali sa bojom su lep detalj. Hire cena jasna.

**Guncati locked:** Vizuelno razumljivo kroz lock emoji na canvas node-u i disabled dugme sa tekstom `🔒 Guncati Locked`.

---

## Raša — Tehničko & Destruktivno

**Import/Export verifikacija — sve kritične putanje:**

| Import | Postoji u target fajlu? | Status |
|--------|------------------------|--------|
| `showScreen`, `renderMacroScreen`, `renderMicroScreen`, `renderVictoryScreen`, `renderPrestigeScreen`, `showLoadingScreen`, `showCoordinatorDialog`, `updateBPMCueText` iz `ui.js` | SVE eksportovane na linijama 23, 37, 235, 321, 367, 421, 462, 472 | OK |
| `AudioAPI` iz `audio.js` | Eksportovan kao named export na liniji 134 | OK |
| `CONFIG.SAVE_INTERVAL_SEC` iz `config.js` | Prisutan na liniji 75 | OK |
| `CONFIG.CAREER_TIERS` iz `config.js` | Prisutan na liniji 104 | OK |
| `calculateCarryOverBuzz`, `getBuzzSatisfactionBonus`, `injectCarryOverGuests` iz `systems/carry_over.js` | Sve eksportovane na linijama 13, 27, 55 | OK |
| `getCurrentCityInfo`, `advanceToNextCity`, `initCityMacro`, `checkTourVictory` iz `systems/macro_engine.js` | Sve eksportovane na linijama 16, 33, 105, 131 | OK |
| `calculateFinalSatisfaction` iz `systems/satisfaction_tracker.js` | Eksportovan na liniji 97 | OK |
| `COORDINATORS[id].portraitColor` | Prisutno za sve 5 koordinatora (mileva:#c44dff, igor:#ffb830, marina:#4df5ff, brana:#4a7c59, deki:#ff8c42) | OK |
| `REDIRECT_PAIRS` iz `systems/routing_manager.js` | Eksportovan na liniji 6 | OK |
| `getUpgradeList` iz `systems/upgrade_manager.js` | Eksportovan na liniji 81 | OK |
| `shareResult` iz `share.js` | Eksportovan na liniji 142 | OK |
| `randomAforizam` iz `content/aforizmi.js` | Eksportovan na liniji 27 | OK |
| `getBPMRange` iz `systems/bpm_controller.js` | Eksportovan na liniji 14 | OK |
| `initSeed`, `spawnWave`, `spawnCarryOverGroup`, `scatterGroupPositions` iz `systems/crowd_spawner.js` | Sve eksportovane | OK |
| `recordFrame`, `checkAndDowngrade` iz `systems/performance_monitor.js` | Eksportovane na linijama 31 i 54 | OK |
| CSS fajlovi u index.html (`theme.css`, `base.css`, `ui.css`, `game.css`) | Svi linkovani | OK |
| Canvas IDs `macro-canvas`, `micro-canvas` | Oba prisutna u DOM | OK |

**Kritični runtime problemi:**

1. **CRITICAL-01** (Coordinator deserialization): `saveMacroState` čuva samo `{id, loyalty, usedThisCity}` ali UI i sistemi očekuju `.loyaltyTier`, `.activeAbility`, `.baseCostMultiplier`, `.portraitColor`. Posle reload-a: RuntimeError.

2. **CRITICAL-02** (renderMacroScreen svaki frame): `innerHTML` rebuild na ~60fps — memory leak od event listenera. U Chrome DevTools vidljivo kao heap rast.

3. **CRITICAL-05 / MEDIUM-05** (PromoRecord.currentBuzz metoda): `getCityBuzzSimple` (macro_renderer.js:163) zove `p.currentBuzz(now)` na plain JSON objektu nakon reload-a → TypeError crash. Ovo se dešava odmah po učitavanju sačuvane igre — canvas macro renderer ne može se prikazati.

4. **MEDIUM-04** (Victory screen dugmad ne rade): Input delegacija ide samo na `#macro-screen`, ali victory/prestige dugmad su u `#victory-screen`/`#prestige-screen`.

5. **[LOW-07 → skoro CRITICAL]** `btn-start-event` listener se dodaje na stari DOM element koji se odmah rebuildi → "Počni Event" ne radi sem ako se popravi CRITICAL-02 (throttle renderMacroScreen).

---

## Lela — Iskustvo & Engagement

**Makro layer:**
Mrežni graf je vizuelno bogat — pulse rings na current city, buzz glow na nodovima, dashed linije za buduće rute. Odmah "sočno". Budget display i tour progress traka u action panelu daju dobar osećaj napretka.

**Carry-over mehanika:**
Narativna poruka "Carry-over gosti! +X% satisfaction bonus" sa zlatnom bojom je lepa — igrač odmah razume da prethodni uspeh ima vrednost. Audio SFX (fanfara pri carry-over) dodaje micro-momentom radost.

**Mikro layer:**
Crowd particles sa pulse efektom za warm/hot grupe su vizuelno pulsiranje koje daje osećaj "live" eventa. Floor temperature color overlay (subtilni crveni tint pri overheating) je odličan environmental feedback.

**"Uh-oh" momenat:**
Incident modal je vizuelno dramatičan — severity badge u boji, naslov problema, jasne opcije. EQUIPMENT_FAILURE audio (alarm + ambient duck) bi trebalo biti pravi "srce zastalo" trenutak.

**Addiction hook:**
Satisfaction % bar koji raste tokom eventa je kontinuirani reward signal. Finale event recap (satisfaction% cue text + boja) je dobar, ali **moglo bi biti bolje** — nema animirani score reveal ili "drum roll" efekat. Ovo je LOW ali utiče na engagement.

**Prestige loop:**
Veteran Insights selekcija je dobra mechanika — izbor od 6, max 3 daje taktički osećaj. Ali insight opisi su kratki i tehničke prirode ("Promo half-life +1 dan") — igrač koji ne razume Promo sistem neće znati šta to znači. Narrative flavor bi pomogao.

**Opšti engagement:**
Igra ima sve elemente za addictive loop: tour progress, city unlock (Guncati), prestige reset, satisfaction score per city. Ako se fixuju kritični bugovi — Lela procenjuje da loop može da drži 15-30 minuta po sesiji, što je cilj.

---

## Zaključak

**Drži uz korekcije.** Arhitektura je solidna — import/export grafovi su ispravni, sistem mehanika (BPM, zones, carry-over, incidents) je kompletno implementiran i logički koherentan. Audio je detaljno implementiran sa city-specific ambijentima i SFX feedback-om za svaki sistem event.

Međutim, postoje **2 CRITICAL buga koja onemogućavaju igranje posle prvog page refresh-a**: PromoRecord metoda poziv na deserialized plain object (crash u macro rendereru), i Coordinator save/load koji gubi vitalne field-ove. Treći CRITICAL (renderMacroScreen svaki frame) je performance i memory leak koji postaje vidljiv nakon 30-60 sekundi na macro screenu. MEDIUM-04 (victory/prestige dugmad mrtva) blokira end-game flow.

Sa 4 CRITICAL/MEDIUM fixova, igra je ready za iter 2 i šef sign-off.

**CRITICAL count: 3** (CRITICAL-01, CRITICAL-02, CRITICAL-03)
**MEDIUM count: 5** (MEDIUM-01 kroz MEDIUM-05)
**LOW count: 7** (LOW-01 kroz LOW-07)
