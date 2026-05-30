# Beta Report — Akva-Sklop (Iteracija 2)
**Datum:** 2026-05-30
**Beta score iter 2:** 7.4/10

---

## Verifikacija fixeva iz iter 1

- **[C1] triggerSimulation export:** ✅
  `export async function triggerSimulation()` prisutna na liniji ~75 u `main.js`.
  Dodatno: `window.triggerSimulation = triggerSimulation` na dnu fajla — onclick fallback radi.

- **[C2] btnSimulate ID:** ✅
  `getElementById('btnSimulate')` (camelCase) — identično HTML atributu. Dugme se bind-uje ispravno.

- **[C3] initInput args:** ✅
  `initInput(canvas, grid)` — canvas je prvi argument, u skladu sa potpisom u `input.js`.

- **[M1] setAnimLerp / setPrevLakes wired:** ✅
  `setPrevLakes(state.lakes)` pozivan pre animacije, `setInterval` na 16ms inkrement-uje `animLerp` tokom 4s,
  `clearInterval` + `setAnimLerp(0)` po završetku. `render.js` eksportuje obe funkcije i koristi `animLerp`/`prevLakes`
  u `drawWaterLevels` za interpolaciju. Implementacija korektna.

- **[M2] addWeekLog wired:** ✅
  Importovana u `loadOptionalModules()` iz `ui.js`.
  `addWeekLog(newState.week, weekScore, activeEvent?.type || null)` poziva se posle `calcWeekScore`
  u svakom ciklusu `triggerSimulation`.

---

## Nova CRITICAL pitanja

Nema novih CRITICAL bugova. Sva tri kritična puta (simulate trigger, button bind, input init)
su funkcionalna prema kodu.

---

## Preostali MEDIUM (M4, M5 i novi)

**[M4] drawHeightTint stub — ostaje** (naslijeđeno)
Funkcija u `render.js` sadrži komentar `const import_height_map_later = true` i ne radi ništa.
Vizualni hint za visinski gradijent nije implementiran. Ne utiče na igrivost u Fazi 0/A,
ali u Fazi B (Komercijalno) igrač nema vizualnu indikaciju za gravitaciono oticanje —
može zbuniti napredne igrače. Prioritet: MEDIUM, preporučeno za iter 3.

**[M5] hydraulics.js mutacija state — ostaje** (naslijeđeno)
`runSimulationWeek` mutira isti state objekat koji prima. Nema deep clone prije simulacije.
U edge caseu gdje se triggerSimulation poziva dva puta brzo (npr. timer expire + klik istovremeno),
`_simLock` štiti od double-trigger-a, ali lock se postavlja *posle* guard-a za `state.phase`.
Rizik je nizak u standardnom igranju, ali arhitekturalno krhko. Preporučeni fix ostaje:
`const simState = JSON.parse(JSON.stringify(state))` pre poziva `runSimulationWeek`.

**[M6] Dupli import render.js — NOVO, MEDIUM**
U `loadOptionalModules()` postoje dva odvojena `try/catch` bloka koji importuju `render.js`:
```js
try { ({ initRender, renderFrame } = await import('./render.js')); } catch (_) {}
// ... (ostali importi) ...
try { ({ setAnimLerp, setPrevLakes } = await import('./render.js')); } catch (_) {}
```
ES moduli su singletoni po spec-u, pa nema runtime greške ni duplog izvršavanja.
Međutim, kod je konfuzan i povećava surface area za buduće greške ako se fajl preimenuje
ili refaktoriše. Preporučeno: spojiti u jedan `try/catch` blok koji destrukturiše sve 4 funkcije
iz `render.js`. Nije bloker za lansiranje.

**[M7] gameLoop nastavlja odmah po triggerSimulation — NOVO, LOW-MEDIUM**
U `triggerSimulation`, odmah posle `setPrevLakes` poziva se `requestAnimationFrame(gameLoop)`,
a zatim `await new Promise(r => setTimeout(r, 4000))`. Znači gameLoop tece tokom 4s animacije
i renderuje staro stanje — što je i namjera (animacija). Ali `updateHUD(state)` u gameLoop-u
prikazuje staro `state` (pre `advanceWeek`), dok se `renderFrame` animira ka novom stanju.
Ovo nije bug u strogom smislu (HUD refresh dolazi posle), ali može izgledati kao da HUD kasni.
Vizualni efekat: tokom 4s animacije, HUD pokazuje prethodnu nedelju. Prihvatljivo za iter 2,
ali warto istaći za polish.

---

## Zora — UX re-check

**Planning → Simulate → Week Log flow:**
Sa fiksiranim dugmetom flow je logičan i konzistentan. `bindSimulateButton()` poziva se na kraju
`startNewGame()`, što znači button je bind-ovan *posle* inicijalizacije svih modula — ispravno.
`triggerSimulation` pravi jasnu sekvencu: zaključa dugme, pokrene sim, prikaže log, odblokira.
Nema dead state-a gdje igrač može kliknuti u prazno.

**Difficulty picker (Faza 0/A/B):**
Tekst u picker-u je jasan:
- "Faza 0 - Tutorial" — odmah komunicira onboarding namjenu
- "Faza A - Standard" — jasno
- "Faza B - Komercijalno" — jasno

Slabost: picker nema opise šta se menja između fazova (AP limit? Broj nedelja? Početni uslovi?).
Novi igrač ne zna da li Faza 0 znači manje tjedana, viši limit, ili nešto sasvim drugo.
Preporuka: dodati po jednu rečenicu opisa ispod svake opcije (npr. "4 nedelje, bez kazne za pH").

**HUD informacije:**
`updateHUD(state)` se poziva i u gameLoop-u i eksplicitno posle sim-a. Na osnovu koda,
HUD prikazuje: week, phase, AP, timer. `addWeekLog` dodaje pH/flow/eco score feedback po nedelji.
Ocjena: HUD je solidan za basic info. Međutim, nema uvijek-vidljivi eco score indikator.
Igrač mora čekati end-of-week log da vidi kako mu jezero stoji — lakše bi bilo mali pH/level
indikatoru negdje permanentno na ekranu pored jezera (što `drawWaterLevels` djelimično rješava
sa pH color bar-om na vrhu jezera — to je dobro rješenje, ali nije dočarano u HUD tekstu).

**Tutorial hint za Fazu 0:**
Nema eksplicitnog tutorial hint sistema u kodu koji je pregledan. `showEventBanner` možda pokriva
first-week hint, ali to zavisi od `events.js` (nije pregledan). Rizik: novi igrač u Fazi 0
ne zna da treba da postavi tile-ove *pre* nego što klikne Simulate. Preporuka: dodati jedan
banner/tooltip u Fazi 0 koji kaže "Postavi tile, pa klikni Simuliraj" pre prvog simulate.

**Hover highlight:**
`drawHoverHighlight` ispravno pokazuje validne (zelenkaste) i invalidne (crvene) pozicije,
uključujući preview ikonu. Ovo je solidan UX detail koji smanjuje broj grešaka pri postavljanju.

---

## Raša — Tech re-check

**Circular import rizik:**
`main.js` importuje iz: `state.js`, `grid.js`, `hydraulics.js`, `events.js`, `scoring.js`, `progression.js`, `config.js`.
Opcionalni (dynamic import): `input.js`, `render.js`, `ui.js`, `audio.js`, `cards.js`, `share.js`.
Nema kružnih zavisnosti u vidljivom dijelu — statički importi su svi jednosmjerni (main → leaf moduli).
Dynamic importi su izolovani u `loadOptionalModules()` što je ispravno.

**render.js dupli import** (vidi M6 gore) — nije circular, ali je suvišno.

**Defensive import pattern:**
Svi opcionalni moduli su omotani u `try/catch` sa fallback `() => {}`. Ovo je ispravno —
igra neće pucati ako, recimo, `audio.js` ne postoji. Jedini rizik: tihe greške (ako `ui.js`
zapravo ima sintaksu grešku, ona se guta). Za produkciju preporučujem da se u `catch` blok
doda `console.warn` sa imenom modula i error-om.

**initGridWithLakes korektnost:**
`fillLake` ispravno postavljа `LAKE_1` tile-ove po zonama, računa `capacity` sumiranjem
`TILE_CONFIG[TILE_TYPES.LAKE_1].capacity` po ćeliji, i inicijalizuje `level` na 30% kapaciteta.
State se mutira direktno (state.lakes[lakeId]) — konzistentno sa ostatkom arhitekture.
`DIFFICULTY[difficulty] || DIFFICULTY['fazaA']` fallback je prisutan — sigurno.

**triggerSimulation race condition:**
`_simLock` guard je na prvoj liniji funkcije. Timer expiry (`timerDone && !_simLock`) i click handler
(`state.phase === 'planning' && !_simLock`) oba provjeravaju lock. Nema async gap-a između provjere
i postavljanja lock-a jer je JS single-threaded — ovo je ispravno. Nema race condition-a.

**Preostali rizici:**
- `calcFinalScore` prima `DIFFICULTY[newState.difficulty]` — ako `newState.difficulty` nije validan
  ključ, fallback nije prisutan ovdje (samo u `initGridWithLakes`). Rizik nizak jer se difficulty
  postavlja jednom na početku.
- `unlockNextCard(newState)` i `showVictoryScreen(newState, finalResult)` su opcionalni (fallback `() => {}`),
  što znači da ako `cards.js` ili `ui.js` ne učitaju, igra neće pokazati victory screen ali neće ni pući.

---

## Lela — Engagement

**Guncati brand vidljivost:**
U `showDifficultyPicker()` u `main.js` se prikazuje tekst "Guncati Imanje — upravljaj vodom pre investitora".
Branding je prisutan u tekstu picker-a. Međutim, nema eksplicitnog linka na `guncati.rs`
u kodu koji je pregledan (može biti u HTML-u ili `ui.js` koji nije pregledan).
Rizik: ako se igra dijeli samo kao izolovani link bez konteksta, Guncati brand može biti nevidljiv
na mid-game i end-game ekranima. Preporuka: osigurati da `showVictoryScreen` prikazuje
"Guncati Imanje" u header-u victory ekrana.

**"Guncati Knows" kartice:**
`initCards(state)` i `unlockNextCard(newState)` pozivaju se. `cards.js` je self-contained
(lokalni localStorage). Sistem postoji. Dostupnost kartica posle prvog run-a zavisi od
`cards.js` logike (nije pregledan u detalje), ali arhitekturalno je ispravno wired.

**Replay value:**
3 difficulty nivoa (Faza 0/A/B) su implementirana i prikazana u picker-u.
Meta unlock via kartice je wired. Ovo je solidan replay loop za daily game format.
Slabost: nema vidljivog "best score" prikaza u picker-u — igrač ne vidi rekord iz prethodnih
run-ova direktno pri odabiru teškoće, što smanjuje motivaciju za ponovnu igru.

**Share flow:**
`initShare()` se poziva u `startNewGame()`. `share.js` je dynamic import. Victory screen
vjerovatno aktivira share UI. Web Share API + clipboard fallback se pretpostavljaju na osnovu
arhitekture. Bez uvida u `share.js` ne možemo potvrditi da je clipboard fallback implementiran,
ali modul postoji i poziva se ispravno.

**First run experience:**
Igrač koji prvi put otvori igru vidi picker odmah (DOMContentLoaded → showDifficultyPicker).
Nema loading splash koji blokira. Dobro. Međutim, onboarding u Fazi 0 nije potvrđen u kodu
(vidi Zora komentar o tutorial hint-u).

---

## Finalni verdict

**Preporuka: pusti na GDG feed (tiha publikacija OK)**

Sva 3 CRITICAL buga su potvrđeno fiksovana direktno iz koda. Game loop je stabilan,
simulate flow radi od početka do kraja (planning → sim → week log → advance), anim lerp
je ispravno implementiran, HUD se ažurira. Nema novih CRITICAL-a.

Preostale slabosti (M4, M5, M6, M7) su sve MEDIUM ili LOW — nijedna ne blokira igrivost
u tipičnom scenariju. Najveći UX rizik je odsustvo tutorial hint-a u Fazi 0 i nedostatak
opisa teškoće u picker-u, ali to ne sprečava igrača da završi partiju.

Score je ispod 7.5 pošto dva neistražena modula (`share.js`, `ui.js` victory screen)
ne mogu biti verifikovana iz dostupnog koda — postoji mogućnost da branded share ili
Guncati link nisu implementirani, što bi direktno uticalo na Guncati brand izloženost.
Preporučujemo tihu publikaciju uz verifikaciju `share.js` i `ui.js` u iter 3.

---

## Beta score iter 2

**7.4/10**

| Dimenzija         | Score | Obrazloženje                                                            |
|-------------------|-------|-------------------------------------------------------------------------|
| Stabilnost (tech) | 8.5   | Svi CRITICAL bugovi fiksovani, lock mehanizam ispravan, nema novih crasheva |
| UX / Flow         | 7.0   | Simulate flow radi, ali nema tutorial hint za Fazu 0 i picker je siromašan opisima |
| Render / Animacija| 7.5   | Water lerp implementiran i ispravno wired; height tint stub jedina praznina |
| Engagement / Brand| 6.5   | Kartice i 3 diffikulteta wired; share.js i victory screen branding neprovjeren |
| Kod kvalitet      | 7.5   | Defensive imports dobri, dupli render.js import i M5 mutacija su jedine slabosti |

**Verdict:** Pusti na GDG feed (tiha publikacija). Branded Guncati share čeka potvrdu
`share.js` i `showVictoryScreen` u iter 3 pregledu.
