# Beta Report — Akva-Sklop (Iteracija 2)
**Datum:** 2026-05-30
**Beta tim:** Zora (UX) · Raša (tech) · Lela (engagement)
**Beta score iter 2:** 7.4/10

---

## Verifikacija fixeva iz iter 1

- [C1] triggerSimulation export: ✅ — `export async function triggerSimulation()` potvrđena na ~liniji 75 u `src/main.js`; `window.triggerSimulation` expose-ovan na dnu fajla za onclick fallback
- [C2] btnSimulate ID: ✅ — `getElementById('btnSimulate')` camelCase, identično HTML-u; kebab mismatch uklonjen
- [C3] initInput args: ✅ — `initInput(canvas, grid)` redosled potvrđen u `startNewGame()`; canvas dolazi prvi, u skladu sa potpisom u `input.js`
- [M1] setAnimLerp / setPrevLakes wired: ✅ — `setPrevLakes(state.lakes)` pozvan pre animacije; `setInterval` na 16ms (~60fps) inkrementuje `setAnimLerp` tokom 4s; `clearInterval` + `setAnimLerp(0)` cleanup potvrđen; `render.js` koristi `animLerp`/`prevLakes` u `drawWaterLevels` za interpolaciju — implementacija korektna
- [M2] addWeekLog wired: ✅ — importovana iz `ui.js` u `loadOptionalModules()`; `addWeekLog(newState.week, weekScore, activeEvent?.type || null)` pozvan posle `calcWeekScore` u svakom ciklusu `triggerSimulation`

---

## Nova CRITICAL pitanja

Nema novih CRITICAL bugova. Sva tri kritična puta (simulate trigger, button bind, input init) su funkcionalna prema kodu.

---

## Preostali MEDIUM (M4, M5 i novi)

**[M4] drawHeightTint stub — ostaje**
Funkcija u `render.js` sadrži samo `const import_height_map_later = true` i ne radi ništa. Vizualni hint za visinski gradijent nije implementiran. Ne blokira igrivost u Fazi 0/A, ali u Fazi B igrač nema vizualnu indikaciju za gravitaciono oticanje. Prioritet: iter 3.

**[M5] hydraulics.js mutacija state — ostaje**
`runSimulationWeek` mutira primljeni state objekat in-place. `_simLock` štiti od double-triggera u normalnom igranju, ali arhitekturalno je krhko. Preporučeni fix ostaje: `const simState = JSON.parse(JSON.stringify(state))` pre poziva `runSimulationWeek` u `hydraulics.js`.

**[M6] Dupli import render.js — NOVO, LOW-MEDIUM**
`loadOptionalModules()` importuje `render.js` u dva odvojena `try/catch` bloka — jednom za `initRender`/`renderFrame`, drugi put za `setAnimLerp`/`setPrevLakes`. ES moduli su singletoni, pa nema runtime greške ni duplog izvršavanja. Ali kod je konfuzan i maintenance-fragilan. Preporučeno: spojiti u jedan `try/catch` koji destrukturiše svih 5 eksporta odjednom.

**[M7] HUD kasni tokom anim prozora — NOVO, LOW**
U `triggerSimulation`, `requestAnimationFrame(gameLoop)` se pokreće odmah posle `setPrevLakes`, a zatim `await setTimeout(4000)` drži funkciju suspendovanom. Tokom tih 4s `gameLoop` radi i poziva `updateHUD(state)` sa starim state-om (pre `advanceWeek`). HUD prikazuje prethodnu nedelju dok se voda animira ka novom stanju. Nije bug, ali je vizualni nekonzistentnost. Prihvatljivo za iter 2.

---

## Zora — UX re-check

**Flow planning → simulate → week log:**
Sa fiksiranim dugmetom flow je logičan i bez dead state-a. `bindSimulateButton()` poziva se na kraju `startNewGame()` — posle svih init poziva, što je ispravno. `triggerSimulation` pravi jasnu sekvencu: zaključa dugme → pokrene sim → prikaže log → odblokira. Igrač ne može kliknuti u prazno.

**Difficulty picker (Faza 0/A/B):**
Labeli su razumljivi: "Tutorial", "Standard", "Komercijalno". Problem: nema opisa šta se konkretno razlikuje između fazova. Igrač ne zna da li Faza 0 znači manje nedelja, viši AP limit, ili blaže kazne za pH. Jedna rečenica opisa po opciji bi eliminisala tu neizvjesnost.

**HUD info:**
`drawWaterLevels` u `render.js` prikazuje: nivo u litrama, pH color bar (zelena/narandžasta/crvena), i jezero ID (A/B/C) — direktno na canvasu iznad svakog jezera. Dobar in-context pristup. `addWeekLog` daje per-week score feedback. Slabost: nema permanentnog eco score indikatora koji bi bio vidljiv *tokom* planiranja, pre nego igrač klikne Simulate.

**Tutorial hint za Fazu 0:**
Ne postoji u kodu koji je pregledan. Picker prikazuje "Faza 0 - Tutorial" ali ne daje nikakvo uputstvo. Novi igrač na GDG feedu ne zna da treba postaviti tile-ove pre nego što klikne Simulate, niti šta su AP, niti zašto postoje tri jezera. Onboarding praznina koja direktno utiče na first session retention.

**Hover highlight:**
`drawHoverHighlight` ispravno razlikuje validne (zelenkaste) i invalidne (crvene) pozicije sa preview ikonom. Solidan UX detail koji smanjuje greške pri postavljanju tile-ova.

---

## Raša — Tech re-check

**Circular import rizik:** Statički importi u `main.js` su jednosmjerni (main → leaf moduli: `state`, `grid`, `hydraulics`, `events`, `scoring`, `progression`, `config`). Dinamički importi su izolovani u `loadOptionalModules()`. Nema kružnih zavisnosti u vidljivom dijelu arhitekture.

**Defensive import pattern:** Svi opcionalni moduli su omotani u `try/catch` sa fallback `() => {}`. Igra neće crashati ako modul nedostaje. Jedini rizik: tihe greške (sintaksna greška u `ui.js` se guta). Preporuka za produkciju: dodati `console.warn(moduleName, err)` u svaki catch blok.

**initGridWithLakes korektnost:** `fillLake` ispravno postavlja `LAKE_1` tile-ove, računa `capacity` sumiranjem po ćeliji, inicijalizuje `level` na 30%. `DIFFICULTY[difficulty] || DIFFICULTY['fazaA']` fallback je prisutan — sigurno.

**triggerSimulation race condition:** `_simLock` guard je na prvoj liniji. JS je single-threaded — nema async gap-a između provjere i postavljanja locka. Timer expiry i click handler oba provjeravaju lock pre poziva. Race condition nije moguć.

**Preostali rizici:**
- `calcFinalScore` prima `DIFFICULTY[newState.difficulty]` bez fallback-a (za razliku od `initGridWithLakes`). Nizak rizik jer se difficulty postavlja jednom na početku.
- `unlockNextCard` i `showVictoryScreen` su opcionalni — ako `cards.js` ili `ui.js` ne učitaju, igra neće prikazati victory screen ali neće ni pući. Prihvatljivo.

---

## Lela — Engagement

**Guncati brand vidljivost:**
Picker prikazuje tekst "Guncati Imanje — upravljaj vodom pre investitora" — branding je prisutan u entry point-u. Nema linka na `guncati.rs` u kodu koji je pregledan. Victory screen sadržaj nije verifikovan (`ui.js` nije pročitan). Ovo je nepoznanica koja sprečava preporuku branded share-a. Preporuka: osigurati da `showVictoryScreen` u `ui.js` prikazuje Guncati logo + link.

**"Guncati Knows" kartice:**
`initCards(state)` i `unlockNextCard(newState)` su wired. `cards.js` koristi self-contained localStorage (potvrđeno iz fix_log-a za M3). Sistem postoji i poziva se ispravno. Dostupnost posle prvog runa zavisi od `cards.js` UI logike (nije pregledan u detalje).

**Replay value:**
3 difficulty nivoa u picker-u — strukturalan incentiv postoji. Meta unlock via kartice je wired. Slabost: picker ne prikazuje prethodni best score ni run count, iako se `loadFromStorage()` poziva u `startNewGame()` i vraća `runCount` i `unlockedCards`. Jedan red teksta ("Tvoj rekord: X.X/10") bi povećao motivaciju za ponovni run bez dodatnog koda.

**Share flow:**
`initShare()` se poziva u `startNewGame()`. Web Share API + clipboard fallback se pretpostavljaju. Bez uvida u `share.js` ne može se potvrditi implementacija fallback-a. Preporuka: ručno testirati share flow na Chrome mobile i Safari pre javne objave.

---

## Finalni verdict

**Pusti na GDG feed (tiha publikacija OK)**

Sva 3 CRITICAL buga su potvrđeno zatvorena direktno iz koda. Game loop je stabilan, simulate flow radi end-to-end, water anim lerp je ispravno implementiran, HUD se ažurira. Nema novih CRITICAL bugova.

Preostale slabosti su MEDIUM ili LOW — nijedna ne blokira tipičan run. Najveći rizici su odsustvo tutorial hinta (UX-1) i neprovjeren Guncati branding u victory screenu (ENG-1), ali nijedan od ovih ne sprečava igrača da završi partiju.

Score je ispod 7.5 zato što `share.js` i `ui.js` (victory screen) nisu verifikovani — postoji realna mogućnost da Guncati link i branded share nisu implementirani, što bi direktno ugrozilo brand izloženost na GDG feedu.

**Za branded share (Mici objavljuje na Guncati profilu): potrebna potvrda `showVictoryScreen` i `share.js` u iter 3.**

---

## Beta score iter 2

**7.4/10**

| Dimenzija          | Score | Obrazloženje |
|--------------------|-------|--------------|
| Stabilnost (tech)  | 8.5   | Svi CRITICAL fiksovani, lock mehanizam ispravan, nema novih crasheva |
| UX / Flow          | 7.0   | Simulate flow radi, nema tutorial hint za Fazu 0, picker siromašan opisima |
| Render / Animacija | 7.5   | Water lerp implementiran i wired; height tint stub jedina praznina |
| Engagement / Brand | 6.5   | Kartice i 3 teškoće wired; share.js i victory screen branding neprovjeren |
| Kod kvalitet       | 7.5   | Defensive imports dobri; dupli render.js import i M5 mutacija jedine slabosti |

**Verdict:** 7.4 — pusti na GDG feed (tiha publikacija). Branded Guncati share čeka verifikaciju `share.js` i `showVictoryScreen` u iter 3.
