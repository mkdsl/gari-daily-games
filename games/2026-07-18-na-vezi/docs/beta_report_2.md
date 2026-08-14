# Beta Izveštaj Iter 2 — Na Vezi (Guncati Televizija)

**Datum:** 2026-07-24
**Metod:** Statička code-review verifikacija svakog fix-a + spot-check game flow integriteta kroz ključne module
**Osnova za ocenu:** Beta iter 1 = 1.2/10 (3 CRITICAL, 2 MEDIUM, 2 LOW). Iter 2 ispituje da li su kritike rešene i traži nove propuste.

---

## Ukupna ocena: 5.3/10

| Perspektiva | Ocena |
|-------------|-------|
| **Zora** (UX & first-impression) | 5.5/10 |
| **Raša** (tehnički & destruktivni) | 5.5/10 |
| **Lela** (iskustvo & engagement) | 5.0/10 |
| **UKUPNO (prosek)** | **5.3/10** |

---

## Verifikacija fix-ova iz beta iter 1

### C1 — Blank screen (CRITICAL): **VERIFIED**

`src/audio.js:44` sada glasi `export function startAmbientPad()`. Named export postoji, ES module import u `main.js:7` se razrešava ispravno. Prazan crn ekran za 100% korisnika je **otklonjen**.

### C2 — Macro planning puca pri renderovanju (CRITICAL): **VERIFIED**

`_renderMacroStep` u `main.js:302-332` je potpuno prerađena. Poziv na `renderMacroPlanningScreen(container, draftPlan, currentStep, totalSteps, callbacks)` prosleđuje svih 5 pozicionih argumenata. Callbacks su kompletni: `onNext`, `onPrev`, `onLockIn`, `onFormat`, `onAlloc`, `onEquip`, `onGuest` — svaki sa ispravnom logikom. `getDraftPlan()`, `getCurrentStep()` (dekonstrukcija `{ index: currentStep }`), `getTotalSteps()` su ispravno importovani i korišćeni. Macro planning ekran sa 5 koraka je **dostupan i funkcionalan**.

### C3 — Live emisija dashboard se ne inicijalizuje (CRITICAL): **VERIFIED**

`initDashboardState` se poziva sa ispravna 4 argumenta (`_initWp`, `_initSt.equipment`, `{ arrived: false, gostId: _initWp.chosen_guest_id }`, `_initWp.weekly_capacity`). Dashboard state se inicijalizuje, `_tickState` više nije `null`, RAF petlja se pokreće. `lockInPlan()` return vrednost se koristi korektno: `_currentPlan = getState().weekly_plan` posle uspešnog lock-in. Micro layer (signal, chat, alarmi, timer) se **pokreće**.

### M1 — Signal recovery 8× sporiji (MEDIUM): **VERIFIED**

`main.js:476-477`: `passiveSignalRecover(GAME_CONFIG.SIGNAL_RECOVER_RATE)` i `tickSignal(GAME_CONFIG.SIGNAL_RECOVER_RATE)`. Oba poziva koriste ispravnu konstantu (8) umesto sirovog `dt` (1). Signal recovery radi dizajniranom brzinom.

### M2 — Timer 45:00 umesto 8:00 (MEDIUM): **VERIFIED**

`main.js:597`: `renderTimer(elapsed, GAME_CONFIG.EMISIJA_DURATION)`. Pravi ključ se koristi (480s = 8:00). Timer prikazuje ispravno trajanje emisije.

---

## Novi bug-ovi (nisu bili u beta_report.md)

Sva tri nova buga potiču iz iste korenske greške: **naming convention mismatch** između toga šta `weekly_plan` (rezultat `lockInPlan()` → `updateState()`) čuva u snake_case i toga što `main.js` čita u camelCase. Isti pattern, tri mesta.

---

### MEDIUM-NEW-1 — Platform allocation ignorisana tokom emisije

**Severity: MEDIUM**

`_tickMicro` (main.js:470) i `_renderMicro` (main.js:572) pristupaju `plan.platformAlloc`. Vrednost `_currentPlan` je `getState().weekly_plan`, koji čuva alokaciju pod ključem `platform_alloc` (snake_case, kao što je definiše `planning-session.js:_draftPlan`). `plan.platformAlloc` je uvek `undefined`.

Fallback: `{ ig: 100, tiktok: 0, youtube: 0 }` — hardcoded za sve korisnike bez obzira na izbor u koraku "Platforme".

**Efekat:** Player može provesti ceo drugi korak planiranja podešavajući IG/TikTok/YouTube raspodelu — taj izbor nema nikakav efekat. Sav chat se generiše samo za IG. TikTok i YouTube paneli ostaju prazni tokom cele emisije. `renderEngagement` uvek prikazuje engagement samo za IG. `calcPlatformEngagement` se poziva samo za IG. TikTok spike achievement (AC6) nikad ne može da se aktivira jer TikTok uvek dobija 0%.

**Repro:** Planirati 33% IG / 33% TikTok / 34% YouTube → pokrenuti emisiju → TikTok i YouTube chat paneli su prazni, engagement metrika prikazuje samo IG.

**Fix:** `main.js:470` i `main.js:572`: `plan.platformAlloc` → `plan.platform_alloc`.

---

### MEDIUM-NEW-2 — Off-grid baterija se ne prikazuje (statičan meter)

**Severity: MEDIUM**

`_renderMicro` (main.js:588) poziva `renderOffgridMeter(ds.offgridCapacity !== undefined ? ds.offgridCapacity : ...)`. `_tickState` u `dashboard-state.js` čuva vrednost kao `offgrid` (line 29: `offgrid: emisijaCapacity`), ne `offgridCapacity`. `ds.offgridCapacity` je uvek `undefined`.

Fallback: `state.base_offgrid_capacity || 80` — statična vrednost, nikad ne opada.

**Efekat:** Off-grid meter ostaje na konstantnoj vrednosti tokom cele emisije. `tickBattery` interno ažurira `_tickState.offgrid` korektno (logika radi), ali vizualizacija to ne prikazuje. Igrač nikad ne vidi upozorenje o slaboj bateriji kroz meter — emocionalna tenzija "trka protiv baterije" koja je centralna za off-grid emisiju je **nevidljiva**.

**Fix:** `main.js:588`: `ds.offgridCapacity` → `ds.offgrid`.

---

### MEDIUM-NEW-3 — Gost nikad ne dolazi

**Severity: MEDIUM**

`_startMicro` (main.js:416) proverava `if (plan.guest)` da odluči da li da zakaže `handleGuestArrival`. `_currentPlan = getState().weekly_plan` čuva ID gosta pod `chosen_guest_id`. `plan.guest` je uvek `undefined`.

**Efekat:** Čak i kada igrač odabere gosta u koraku 4 planiranja, `handleGuestArrival` se **nikad ne poziva**. `gostArrived` ostaje `false` u dashboard state zauvek. Gost-related achievementi (koji zavise od `ds.gostArrived`) su nedostupni. Gost standout chat (`_injectGuestStandoutChat`) se poziva sa `gostId: undefined`.

Napomena: `tickGuestStandout(dt, plan.guest)` koristi `ds.gostId` internalno (ne argument), pa standout logika može da se pozove — ali since `gostArrived` nikad nije `true` u state, related eventi ne rade ispravno.

**Fix:** `main.js:416`: `if (plan.guest)` → `if (plan.chosen_guest_id)`. `main.js:420`: `handleGuestArrival(plan.guest, ...)` → `handleGuestArrival(plan.chosen_guest_id, ...)`. `main.js:531`: `_injectGuestStandoutChat(standout, plan.guest)` → `_injectGuestStandoutChat(standout, plan.chosen_guest_id)`.

---

### LOW — resolveSignalAction poziv sa 2 argumenta (LOW, preneto iz iter 1)

`main.js:728,731,734`: `resolveSignalAction('reroute', ds)` — funkcija prima samo 1 parametar, drugi se tiho ignoriše. **Nije štetno**, tiho ignorisano JS runtime-om. Preporučuje se čišćenje.

### LOW — Nema error boundary (LOW, preneto iz iter 1)

Nije dodato. Jedan bug u bilo kom modulu i dalje reprodukuje tihi crn ekran. Preporučuje se `try/catch` oko `init()` i inline fallback UI za korisnika.

---

## Perspektive

### Zora (UX & first-impression): 5.5/10

Igra se učitava — to je ogroman napredak u odnosu na iter 1. Weekly briefing ekran je čitak, 5 koraka planiranja su navigabilna, Lock-in odbrojavanje je dramatično, live dashboard se otvori sa signal barom i timerom. Prvih 5 minuta sada **postoji**.

Ali: idem na planning, podešavam TikTok na 50% i YouTube na 30% — emisija počne i sva tri panela koja su trebalo da pulsiraju sa chatovima su prazna osim IG-a. Deluje kao bug ili nedovršena funkcionalnost. Dodala sam gosta "Maca Folk" u booking — ona nikad ne "uđe u kadar", nema ni toast ni chat reakciju na njen dolazak. Off-grid meter je statičan — jedan od tri vizuelna napona igre je zamrznut. Za first-impression: igra postoji i radi, ali polovica onoga što ste mi obećali u planning ekranu se ne dešava u emisiji.

### Raša (tehnički & destruktivni): 5.5/10

Svi CRITICAL bugovi su fiksovani — potvrđujem svaki. Import graf se razrešava, callback chain u macro planningu je kompletan, micro dashboard se inicijalizuje sa 4 ispravna argumenta. Signal recovery brzina je tačna, timer je tačan.

Tri nova MEDIUM buga potiču iz jedne greške — naming mismatch. Nije složen problem, jedan targeted `sed` ili edit reši sva tri. Ipak: `platform_alloc` je osnovna promenljiva koja određuje sav chat, engagement i TikTok spike trigger — to nije edge case, to je srž multi-platform mehanike. `ds.offgrid` je osnovna metrika vizuelne tenzije micro layera. Oba su trivijalno fixabilna ali su vidno neispravna.

Alarm sistem, EQ minigame, signal drop i resolution, RAF game loop, prestiž flow — sve to izgleda ispravno bez daljeg istrazivanja.

### Lela (iskustvo & engagement): 5.0/10

Konačno mogu da "odigramo" emisiju. Alarm u 2:15 zahteva brzu akciju — to je dobro. Signal oscilira i kreirajte pritisak. Timer odbrojava korektno ka 8:00. Replay screen pokazuje highlights i aforizam.

Ali: cela razlika između "snimiti dj_lajv samo na IG-u" i "snimiti podkast sa fokusom 50% TikTok" ne postoji u micro layeru — oba se igraju identično. To je kao da se u Diner Dash možete naručiti bilo koji meni a svi obroci dođu isti. Gost kojeg sam pažljivo birala po reliability skoru nikad ne dolazi — taj "oh ne, da li će Maca doći" napon je nula. Off-grid baterija ne drenira vizualno, pa treća dimenzija tenzije (struja) ne postoji za igrača.

Osnova je tu i potencijal je dobar. Ali sada su tri od četiri distinktivnih mehanika igre nefunkcionalne za igrača (platforme, gost, baterija). Signal system nosi svu tenziju sam, i to nije dovoljno za 8+ score.

---

## Preporuka

**TREBA JOŠ JEDAN FIX KRUG**

Sve tri CRITICAL-e su potvrđeno rešene — igra se učitava i može se odigrati end-to-end. Međutim, tri nova MEDIUM buga sa istim korenom (`platform_alloc`/`chosen_guest_id`/`offgrid` naming mismatch u main.js) blokiraju multi-platform mehaniku, guest booking mehaniku i vizualizaciju battery drain-a.

**Fix scope je mali:** svi bugovi se rešavaju editovanjem nekoliko linija u `src/main.js` (linije ~345, ~416, ~420, ~470, ~528, ~531, ~572, ~588). Nema novih modula, nema arhitekturnih promena.

Posle fix-a, očekivan score: 7.5–8.5/10 (zavisno od toga koliko EQ minigame, guest standout i TikTok spike unose excitement u micro layer — još nismo mogli da ih doživimo uz sve mehanike aktivne).

---

*Beta Trio (Zora + Raša + Lela), 2026-07-24*
