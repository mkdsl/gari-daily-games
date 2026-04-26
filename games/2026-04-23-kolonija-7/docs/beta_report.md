# Beta Report — Kolonija 7

## Ukupna ocena: 5/10

---

## Kritični Bugovi (MUST FIX)

- **[Grid ne staje na ekran — kristal nedostupan]:** Grid visina = 20 redova × 40px = 800px + 30px HUD offset = 830px ukupno. Na tipičnom laptopu (768px visine), donja ~4 reda su izvan ekrana. Kristal se postavlja na row 14–19 — potpuno van vidokruga i nedostupan kliku. Nema scroll mehanizma. `render.js:17-18`, `config.js:9-10`. **Fix:** Smanji `CELL_SIZE` na 28–32px ili `GRID_ROWS` na 14–16, ili dodaj vertikalni scroll kamere vezan za kursor.

- **[`BRZE_KOPANJE` prestige bonus je mrtav kod]:** `getPrestigeBonuses()` u `prestige.js:111` vraća `digSpeedMult: 1.5` kada je bonus aktivan, ali `handleGridInput` u `grid.js:246` poziva `digCell()` bez ikakvog multiplikatora. Igrač bira bonus koji nema nikakav efekat. `grid.js:246`, `prestige.js:108`. **Fix:** U `handleGridInput`, pročitaj `getPrestigeBonuses(state).digSpeedMult` i primeni ga na `found.food` i `found.minerals` pre dodavanja na state.

- **[`doPrestige(state, null)` truje bonuses niz]:** Kada su svi 4 bonusa uzeta, `ui.js:111` poziva `doPrestige(state, null)`. Linija 47 u `prestige.js` bezuslovno radi `state.prestige.bonuses.push(chosenBonus)` — dakle `null` ulazi u niz. Svaki naredni `getPrestigeBonuses()` poziv proverava `.includes('BRZE_RADNICE')` itd. — null ne matchuje validnu vrednost, ali niz raste neispravno i akumulira null-ove tokom meta ciklusa. `prestige.js:47`, `ui.js:111`. **Fix:** Dodaj guard: `if (chosenBonus !== null) state.prestige.bonuses.push(chosenBonus);`

---

## Ozbiljni Problemi (SHOULD FIX)

- **[Touchend koristi `e.touches[0]` umesto `e.changedTouches[0]`]:** U `input.js:47`, `touchend` handler poziva `setPointer(e, false)`. Unutar `setPointer`, `e.touches?.[0]` je `undefined` tokom touchend jer je prst već podignut — `e.touches` je prazan. Fallback `e.touches?.[0] ?? e` vraća ceo TouchEvent čiji `clientX/Y` su undefined, pa `pointer.x/y` postaju NaN. Kopanje funkcioniše jer se trigger dešava na `touchstart` (ispravni koordinati), ali released koordinate su NaN što može da probije buduće released-based logike. `input.js:47`. **Fix:** `const t = e.changedTouches?.[0] ?? e;`

- **[Nema vizuelnog indikatora kopabilih ćelija bez hover state-a]:** Na desktopu ne postoji hover highlight koji bi pokazao koje ćelije se mogu kopati. Igrač mora slepo da klikće i otkriva pravilo "mora biti pored tunela" kroz trial-and-error. Na mobilnom touch ekranu hover ne postoji po definiciji. Preporuka: nacrtaj tanak outline oko `canDig()`-eligibilnih ćelija u `renderGrid`.

- **[`state.resourceCap` nije osiguran pri učitavanju stare verzije save-a]:** `loadState()` u `state.js:83-90` vraća sirovi parsed objekat. `main.js:40-43` osigurava `particles`, `screenShake` i `camera` ali ne i `resourceCap`. Ako korisnik ima stari save bez tog polja, `applyRoomEffects` (koji čita `state.workers.capacity` i `state.resourceCap`) radi korektno, ali `handleGridInput:253` koristi `state.resourceCap ?? CONFIG.RESOURCE_CAP_BASE` — fallback postoji, ali nije konzistentno. **Fix:** Dodaj `if (state.resourceCap == null) state.resourceCap = CONFIG.RESOURCE_CAP_BASE;` u `main.js` load blok.

---

## Manja Zapažanja (NICE TO HAVE)

- `audio.js` eksportuje `initAudio` ispravno — main.js:9 importuje i poziva ga bez grešaka. Audio je tech-solidno.
- `screenToGrid` matematika je ispravna: `camera.x = -offsetX`, pa `canvasX + camera.x = canvasX - offsetX` daje tačnu kolonu. Ovo je OK.
- `getPrestigeBonuses` u `workers.js` je lokalna implementacija (čita samo `count`, ne bonuses niz) dok `prestige.js` ima pravu implementaciju. Ove dve su namerno razdvojene da izbegnu cirkularni import, ali razlika u logici (`workerSpeedMult = 1 + count*0.1` vs `1.5 ako bonus aktiviran`) znači da `BRZE_RADNICE` bonus ne funkcioniše u `tickWorkers`. `workers.js:76-81`, `prestige.js:108`. Ovo je potencijalni 4. kritični bug — depends on intent.
- Room meni nema "long press to open" na mobilnom — samo click. Preporučljivo za touch UX.
- Kristal se prikazuje samo ako je `cell.revealed` — ali reveal radius je samo 1. Igrač može nikada ne naići na glow efekat. Povećaj reveal radius kristala na 2-3 ili dodaj "pulse" iz dna ekrana.

---

## Engagement Analiza (Lela)

**Hook "samo još jedan tunel" postoji u teoriji, ali puca na ekranskom ograničenju.** Progression loop je čist: kopi → skupljaj hranu → gradi Leglo → više radnica → kopi dublje → kristal. Tajming prve bure je fer (~75 sekundi calm, 15s telegraph, damage 15% od 3 radnica = 1 radnica), dakle ne game-over iz prve. Međutim, s obzirom da kristal živi na dubini 14–19 a grid ne staje na ekran, igrač nikada ne dolazi do prestige — cela meta progresija (5 prestige za meta win) je blokirana. Pacing prvih 90 sekundi je odličan; sve posle je nedostupno. Leglo košta 40h/10m, sa 3 radnice × 0.5h/s = 1.5h/s, to je ~27 sekundi sakupljanja — razuman milestone.

## UX Zapažanja (Zora)

**Onboarding je sirov ali funkcionalan.** Igrač vidi grid odmah (nema crnog ekrana), entry point je otvoren, i prva ćelija za kopanje je jasno susedna. HUD ikonice (emoji) su čitljive. Međutim, nema teksta koji objašnjava šta je bura, nema tutorijal tooltip-a, i prestige ekran se otvara naglo bez animacije. Room meni se pozicionira dobro (clamp na ivice ekrana). Najveći UX problem je isti kao tehnički — grid koji ne staje na ekran čini igru vizuelno odsečenom, bez ikakvog signala da postoji sadržaj ispod vidokruga.

## Tehničke Napomene (Raša)

**Solidno:** Modularna arhitektura je čista, nema cirkularnih importa (workers.js svesno ne importuje prestige.js). `createState()` pravilno inicijalizuje `resourceCap`. `handleGridInput` ispravno cap-uje resurse. `tickStorm` fazni automat je korektan. `doPrestige` resetuje sve potrebne state delove. `saveState` isključuje particles da ne bloatuje localStorage.

**Fragile:** `touchend` koordinate (NaN). `doPrestige(null)` push bez guarda. `BRZE_KOPANJE` dead code koji stvara lažno očekivanje. `applyScreenShake` direktno muta `state.screenShake.timer` unutar render faze — nije katastrofa ali meša update i render logiku. `updateSystems` guard na `showPrestigeScreen` je dobar, ali efektivno duplikiran (main.js outer guard ne pokriva prestige, ali index.js guard ga hvata).

**Import check — sve zeleno:** `audio.js` eksportuje `initAudio` ✓. `ui.js` eksportuje `showRoomMenu` i `closeRoomMenu` ✓. `grid.js` eksportuje sve što `main.js` i `index.js` importuju ✓. Nema nedostajućih exporta.
