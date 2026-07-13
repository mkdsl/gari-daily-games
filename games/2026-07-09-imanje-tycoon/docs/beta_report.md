# Beta Report — Imanje Tycoon (iter 1)
*Beta Trio: Zora UX + Raša tech + Lela engagement*
*Datum: 2026-07-13*

---

## Executive Summary

Igra se učitava bez crash-eva i core loop (pečurke → inokulacija → berba → kapital) funkcioniše mehanički. Međutim, **najvažnija aktivna mehanika (inokulacija) nema vizuelni feedback** — igrač klikne, prozor nestane, nema nikakve potvrde da je išta uradio. Uz to, `getBlockRevenueProjection` je import koji nikad nije eksportovan iz `mushrooms.js`, pa blok-kartice nikad ne prikazuju prihod projekciju. Oba problema direktno oštećuju first-impression utiskom "igra ne reaguje na moje klikove."

---

## Bugovi i nalazi

### [MEDIUM] doInokulacija return-value mismatch — nema feedback-a na klik

**Moduli:** `src/economy/mushrooms.js:100`, `src/ui/mushroom-tab.js:273`

**Opis:** `doInokulacija()` vraća boolean `true`/`false`, ali `mushroom-tab.js` proverava `result.success` (property na booleanu → uvek `undefined` → uvek `false`). Uslov `if (result && result.success)` NIKAD nije tačan. Posledica: ni particle, ni bonus tekst se ne pojavljuju posle klika na inokulacija dugme. Inokulacija jeste obrađena u state-u (bonus se setuje, prozor se zatvara), ali igrač ne dobija nikakav vizuelni sign da se ista dogodila.

**Repro (iz koda):**
```js
// mushrooms.js:100
return true; // vraća boolean

// mushroom-tab.js:273
const result = doInokulacija(state, blockId, audio);
if (result && result.success) { // true && undefined → false, nikad
  spawnRevenueParticle(...)
}
```

**Ugao:** Zora UX — igrač klikne, prozor nestane za 1s (tick rebuild), nema "potvrde." Na prvih 5 min ovo je jedina aktivna akcija — bez feedbacka deluje kao broken button.

---

### [MEDIUM] getBlockRevenueProjection ne postoji u mushrooms.js — dead import

**Moduli:** `src/ui/mushroom-tab.js:2`, `src/economy/mushrooms.js`

**Opis:** `mushroom-tab.js` importuje `getBlockRevenueProjection` iz `mushrooms.js`, ali ta funkcija nigde nije definisana niti eksportovana u `mushrooms.js`. ES6 import tihо rešava na `undefined`. Linija 170 proverava `typeof getBlockRevenueProjection === 'function'` (false uvek), pa proj. prihod (`~X din/sez`) na blok karticama NIKAD ne prikazuje.

**Repro (iz koda):**
```js
// mushroom-tab.js:2 — importuje funkciju koja ne postoji
import { ..., getBlockRevenueProjection } from '../economy/mushrooms.js';
// mushrooms.js — nema eksporta tog imena

// mushroom-tab.js:170
if (typeof getBlockRevenueProjection === 'function') { // uvek false
  revProjection = `~${formatDin(proj)}/sez`;
}
```

**Ugao:** Raša tech — bez konzolne greške, tiho fali. Zora UX — prihod projekcija obećana GDD-om, nije prikazana.

---

### [MEDIUM] Stale event listener akumulacija na mushroom-tab panelu

**Moduli:** `src/ui/mushroom-tab.js:262-303`

**Opis:** `bindMushroomEvents(panel, ...)` poziva `panel.addEventListener('click', ...)`. Na kraju svakog event handler-a setuje se `initialized = false` (linija 302). Na sledećem `updateMushroomTab` pozivu (za 1 sekundu), layout se rebuil-uje i `bindMushroomEvents` se poziva PONOVO, dodajući NOVI listener na isti `panel` DOM element. Stariji listener nije uklonjen jer `panel.innerHTML = ...` briše children, ali ne i listenere na samom `panel`-u.

Posle N klikova postoji N+1 aktivnih event listener-a. Svaki klik na dugme aktivira handler N+1 puta. Drugi+ poziv `harvestBlock`/`doInokulacija` je nop (pendingHarvest = 0 ili prozor zatvoren), ali `showToast` se poziva višestruko — stacked toast-ovi počinju da se pojavljuju posle nekoliko klikova.

**Repro (iz koda):**
```js
// mushroom-tab.js:262
function bindMushroomEvents(panel, state) {
  panel.addEventListener('click', (e) => { ... }); // novi listener svaki put
}
// mushroom-tab.js:302
initialized = false; // sledeći tick = još jedan bind
```

**Ugao:** Raša tech — memory leak + duplikat toast-ovi nakon 5+ klikova u sesiji.

---

### [MEDIUM] Sva tri taba vidljiva bez obzira na lock status granа

**Moduli:** `index.html:119-122`

**Opis:** Tabs nav uvek prikazuje sve tri kartice (Pečurke / Plastenik / Jezero). Novi igrač vidi "🌱 Plastenik" i "🐟 Jezero" tabove od sekunde nula, klikne na jedan, vidi prazan panel bez ikakvog objašnjenja. Nema "Otključaj za 15.000 din" poruke na samom tab sadržaju — to je samo u macro panel-u.

**Repro:** Novi igrač → klik na "🌱 Plastenik" tab → prazan div (tab-greenhouse nema sadržaj dok JS ne inicijalizuje). Zbunjujuće, ne jasno.

**Ugao:** Zora UX — tabs koji ne mogu biti aktivirani bi trebalo da su dimmed/disabled sa tooltip-om o uslovu otključavanja.

---

### [MEDIUM] Makro-panel toggle dugme bez klick-listenera

**Moduli:** `src/main.js:108-113`, `index.html:48`

**Opis:** `#macro-toggle` dugme postoji u HTML-u (`▾`). `main.js` (108-113) samo setuje inicijalno stanje kad je panel bio zatvoren pre save-a — NE dodaje event listener na klik. Dinamički import `input.js` (main.js:129) verovatno dodaje handler, ali samo ako `input.js` eksplicitno to radi (nismo čitali taj fajl). Ako `input.js` to ne obradi, toggle dugme je nefunkcionalno — macro panel se ne može kolapsirati.

Na mobilnom uređaju, macro panel zauzima ~40% visine ekrana i blokira tab sadržaj. Nekolapsibilni macro panel je ozbiljan mobile UX problem.

**Ugao:** Zora UX mobile — kritičan prostor ekrana blokiran. Raša tech — nedovršeno bindovanje u main.js.

---

### [MEDIUM] Inokulacija prozor (10s) prekratak za first-impression na mobilnom

**Moduli:** `src/config.js:93 (INOKULACIJA_WINDOW_SEC: 10)`

**Opis:** 10 sekundi je malo za igrača koji ne zna šta očekuje — posebno na mobilnom sa tap latencijom. Vizuelni cue (pulsna animacija + "⏱ Inokulacija!" badge) je koristan, ali igrač koji nije gledao ekran u tom momentu propušta prozor bez zvuka (SFX `inokulacija` se emituje iz `completeWave()` u `mushrooms.js:85`, ali ne i iz tick auto-expire puta). Uz gore pobrojane feedback probleme, prvih 5 min može deleti kao "nisam siguran šta radim."

**Ugao:** Lela engagement — aktivna mehanika koja se osjeća nereagujuće + tight window = frustracija umjesto napetosti.

---

### [LOW] Phantom sezona pri offline progress sa seasonTimer = 0

**Moduli:** `src/state.js:162-181`

**Opis:** Ako se game save-uje tačno kad je `seasonTimer = 0` (unlikely ali moguće uz 10s auto-save), `applyOfflineProgress` while-petlja prvi prolaz ima `thisSeason = Math.min(timeLeft, 0) = 0`, `timeLeft` ostaje nepromenjen, ali `state.seasonTimer <= 0` je true → sezona se završava s `seasonRev = 0`, upisuje se u `monthlyRevenue`. Ovo stvara lažnu sezonu sa 0 prihoda koja može uticati na Phase C consecutive proveru (potrebno 3 sezone ≥ 150k).

**Ugao:** Raša tech — edge case, realno rijedak ali postoji.

---

### [LOW] inspekcija clearEvent via setTimeout — async state mutation

**Moduli:** `src/systems/seasons.js:266`

**Opis:**
```js
setTimeout(() => clearEvent(state), 200);
```
`inspekcija` event se briše 200ms posle aplikacije kroz async callback. U teoriji, ako se save desi u tom 200ms prozoru, event se upiše kao aktivan (sa `seasonsLeft: 0`) ali se nikad ne briše pri sledećem load-u. Na sledećem load-u, event ostaje u state-u zauvek (niko ga ne čisti jer `applyOfflineProgress` ne zna za `seasonsLeft: 0` logiku).

**Ugao:** Raša tech — teorijski edge case u prod, ali `clearEvent` ne bi trebalo da ide kroz setTimeout za state mutation.

---

### [LOW] Tipografska greška u phases.js

**Moduli:** `src/systems/phases.js:128`

**Opis:** String `'Maksimalna faza dostiuguta!'` sadrži "dostiuguta" umjesto "dostiguta". Prikazuje se u macro panelu kad igrač dostigne fazu C.

---

### [LOW] Phase A pacing: 30+ minuta na default postavkama

**Moduli:** `src/config.js:76 (PHASE_A_TOTAL_REVENUE: 25000)`

**Opis (dedukovano iz koda):**
- 1 blok × 5kg × 1.0 ratio × 400 din/kg = 2.000 din po ciklusu
- Ciklus trajanje: 3 × 42s + 2 × 10s prozora = ~146s (~2.4 min)
- Prihod po sezoni (120s): ~1.640 din
- Vreme do Phase A (25.000 din totalRevenue): ~16 sezona ≈ 32 minuta

Za igru sa 15+ min target sesijom ovo je granično. Igrač u prvim 5 minuta uradi ~2 berbe, zaradi ~4.000 din, vidi sebe na ~16% prema fazi A. Napredak nije vidno brz. Upgrade P1 "Drugi blok" (1.600 din) je dostupan od startera i duplikuje output — treba ga prominentno naglasiti kao first-buy.

**Ugao:** Lela engagement — "gde je loop?" nakon 5 min bez Phase A unlock.

---

## Ugao po uglu

### Zora UX — First-impression & Pristupačnost

Prva sekunda je čista: HUD je pregledан, macro panel je jasan, mushroom tab se lepo renderuje. Međutim:

- **Inokulacija bez feedbacka** je najgori first-impression fail: igrač klikne "🌱 Inokulacija!" i **ništa vidno ne govori da je to uspelo.** Prozor nestaje (jer tick rebuil-uje panel), ali nema toast-a, nema particle-a. Svaki put sam sebi potvrdim — "da li je to prošlo?"
- **Locked tabovi bez objašnjenja**: Plastenik i Jezero tabovi su vidni ali vode na prazan ekran. Trebalo bi: dimmed tab + "Otključaj za X din" placeholder unutar tab panela.
- **Makro panel zauzima previše prostora na malim ekranima** ako toggle ne radi. Na 375px širini, macro panel + HUD ostavljaju možda 300px za tab sadržaj.
- Pozitivno: Sezonski summary modal (showSeasonEndModal) je implementiran i wiran (main.js:60), season-end flow je čist.

### Raša tech — Tehničke provere

- **Game se učitava bez JS greški** (dedukovano — nema undefined reference crash-eva, svi moduli postoje).
- **rAF vs setInterval**: Tick koristi `setInterval(1000ms)` sa dt merenjem kroz `performance.now()`. Background tab throttling na 1000ms je OK (isti interval). `dt` cap na 3.0s sprečava runaway. Solidno.
- **Save/load**: `deepMerge` u state.js:255 je dobar pattern za forward compat — novi state fields se dodaju bez greške na starim save-ima.
- **Offline progress** (applyOfflineProgress): mushroom wave-ovi i fish growth se računaju korektno. Edge case sa seasonTimer=0 postoji ali je rijedak.
- **Critical flaw**: `getBlockRevenueProjection` je dead import, `doInokulacija` return mismatch. Oba su tiha greška (nema throw), ali oba remete UX.
- Worrhy: `inspekcija` clearEvent kroz setTimeout (200ms async) — krhko.

### Lela engagement — Pacing & Retention

Petlja je strukturno dobra (Idle grow → Active click → Revenue → Upgrade → Nova grana), ali pace problema:

- **Prvih 2.5 minuta**: samo progress bar raste. Nema vidne nagrade dok talasi ne završe. Idle loop OK za kasniju igru, ali first-impression je prazan bez feedbacka.
- **Inokulacija stres loop** je super mehanika (10s prozor, bonus stack), ali bez vizuelnog potvrđenja clicka, čini se broken.
- **Season end modal** se pojavljuje na ~2:00, pre prvog harveста (~2:26) — ovo je dobro jer daje igraču prvu strukturnu nagradu (progleda prihod 0 za sezonu 1, ali vidi UI feedback da je sezona prošla).
- **Upgrade P1 (Drugi blok, 1.600 din)** bi trebalo biti prominentno istaknut odmah na startu — jedinom pravom first-buy odluka. Bez njega pacing je dvostruko sporiji.
- **Phase C** zahtjev (3 × 150k/sezona, Jezero, Masterclass) je ambiciozan i opravdan za prestige loop. Nije first-impression problem.

---

## Ocena

**Beta score iter 1: 6.4/10**

Igra je mehanički solidna i nema crash-eva. Arhitektura (multi-module, offline progress, prestige system, season events, achievement system) je impresivna za obim. Bodovi se gube na broken feedback loop-u (MEDIUM × 2 na core active mechanic), stale listener bug-u koji se akumulira, i locked tab UX-u. Fix-ovi su relativno lokalizovani.

---

## Fix prioriteti za Jovu

**Hitno (MEDIUM — first-impression):**

1. **[MEDIUM #1] Popravi doInokulacija return** — ili promeni `mushrooms.js` da vraća `{ success: true, bonus: X }` ili promeni `mushroom-tab.js:273` da proverava `if (result === true)`. Dodaj `showToast` kao fallback ako particle nije dostupan.

2. **[MEDIUM #2] Implementiraj getBlockRevenueProjection u mushrooms.js** — funkcija koja računa `wavesPerSeason × yieldKg × price`. Eksportuj je. Blok kartice tada prikazuju `~X din/sez`.

3. **[MEDIUM #3] Fix stale listener leak** — u `bindMushroomEvents`, ili:
   - Dodaj `panel.removeEventListener` pre novog `addEventListener` (problem: closure), ili
   - Koristi AbortController: `const ctrl = new AbortController(); panel.addEventListener('click', ..., { signal: ctrl.signal })` i `ctrl.abort()` pre rebuild-a, ili
   - Promeni pattern: `initialized = false` samo za layout rebuild, listener ostaje (ukloni `bindMushroomEvents` iz rebuild patha — bind jednom, update samo DOM).

4. **[MEDIUM #4] Sakrij/disable locked tabove** — u `tabs.js` dodaj logiku koja proveri `state.greenhouse.unlocked` / `state.fishpond.unlocked` i postavi `tab-btn[disabled]` + dim CSS class. Alternativno, tab sadržaj za locked granu prikaži placeholder: "🔒 Otključaj Plastenik (15.000 din) — dostupno iz Macro panela."

5. **[MEDIUM #5] Wiri macro-toggle click listener** — ako `input.js` ne obrađuje toggle: u `main.js` dodaj:
   ```js
   macroToggle?.addEventListener('click', () => {
     const isOpen = !macroContent.classList.contains('hidden');
     macroContent.classList.toggle('hidden', isOpen);
     macroToggle.textContent = isOpen ? '▸' : '▾';
     if (state.ui) state.ui.macroPanelOpen = !isOpen;
   });
   ```

6. **[MEDIUM #6] Povećaj INOKULACIJA_WINDOW_SEC na 15-20s** — ili dodaj zvučni alert kad prozor otpora (audio.playSfx('inokulacija_alert')). Trenutnih 10s je previše kratko za first-session igrača na mobu.

**Ako stigne (LOW):**

7. **[LOW #3] Popravi typo** u `phases.js:128`: `'dostiuguta'` → `'dostiguta'`.

8. **[LOW #1] Zaštiti applyOfflineProgress od seasonTimer=0** — na početku while petlje: `if (state.seasonTimer <= 0) state.seasonTimer = dur;` pre ulaska u loop.

9. **[LOW #2] Promeni inspekcija clearEvent** — umesto `setTimeout`, postavi `seasonsLeft: 0` i pusti `handleSeasonEnd` clearEvent logiku da radi na kraju iste sezone (već postoji taj kod za `seasonsLeft--` i `<= 0` check u `seasons.js:131-138`). `setTimeout` samo briše provereno-neaktivan event iz UI-a.
