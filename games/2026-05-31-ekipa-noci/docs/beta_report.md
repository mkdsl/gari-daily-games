# Beta Report — Ekipa Noći
**Datum:** 2026-05-31  
**Iteracija:** 1  
**Beta Trio ocena:** 6.8 / 10

---

## Kritični bugovi (CRITICAL) — blokuju igru

- [CRITICAL] **`waitForEvent('game:confirm')` može zagljaviti igru zauvek** — `src/main.js:runDraftPhase()`, `waitForEvent()`. Ako korisnik nikad ne klikne "Potvrdi odabir" (npr. zatvori tab, ili confirm event ne stigne zbog race condition), `Promise` nikad ne resolve-uje i async chain prestaje da se izvršava bez ikakvog timeout-a ili fallback mehanizma. Nema `Promise.race()` s nekim timeout-om, nema recovery. Jedini izlaz je refresh stranice. **Rešenje:** Dodati timeout fallback (`Promise.race([waitForEvent('game:confirm'), delay(120_000).then(() => { throw new Error('timeout'); })])`) ili UX safety: "Podseti me da potvrdim" link koji re-emituje event.

- [CRITICAL] **`input.js` i `phase_display.js` duplo upravljaju potvrdom** — `src/input.js:_applyCardSelection()` poziva `advanceDraftRole()` **odmah** pri klik/tap na kartu (bez čekanja na "Potvrdi odabir" button), dok `phase_display.js` i `main.js` očekuju eksplicitan klik na btn-confirm koji dispatchuje `game:confirm`. Ova dva flow-a su **međusobno nekompatibilni**: `input.js` odmah mutira `current_role_index` i zove `onDraftComplete`, dok `runDraftPhase` async loop čeka `waitForEvent('game:confirm')`. Rezultat: korisnik može advancovati rolu pre nego što je `waitForEvent` resolve-ovao — state se desinkronizuje. **Rešenje:** `input.js._applyCardSelection` ne sme pozivati `advanceDraftRole()` — to radi `main.js` posle `waitForEvent`. Input treba da samo selektuje kartu u state-u i updateuje vizualni prikaz.

- [CRITICAL] **Departed karte se nikad ne uklanjaju iz `retained` pre narednog draft-a** — `src/systems/crew.js:processCrewUpdate()` poziva `departCard(id)` koji uklanja id iz `retained` i dodaje u `departed`. Međutim, `runCrewUpdate()` u `main.js` prikazuje `state.crew.retained` (nakon ažuriranja) za "Ostaju" kolonu, ali prikazuje **poslednjih 5 iz `state.crew.departed`** za "Odlaze" — uključujući karte koje su otišle u prethodnim eventima, ne samo ovom. Igrač vidi stare odlaske ponovo, što je zbunjujuće. **Rešenje:** `resolveEvent()` treba da vrati eksplicitno `departed_this_event` iz `crew_update.departed_ids`, i `runCrewUpdate` da prikazuje samo te ID-eve.

- [CRITICAL] **`cards_data.js` koristi `role` vrednosti malim slovima (`'dj'`, `'host'`, `'sound'`, ...) ali `ROLES` konstanta u `config.js` i `ROLE_LABELS` mapa referencirana u `main.js` koristi velika slova (`'DJ'`, `'Host'`, ...)** — `src/content/cards_data.js` definiše `role: 'dj'`, `role: 'host'` itd. `config.js` definiše `ROLES = ['dj', 'host', 'sound', 'video', 'security']` (malo slovo — OK), ali `ROLE_LABELS` koji se referencira u `main.js` (`const roleName = ROLE_LABELS[role] || role`) se nigde ne eksportuje iz `config.js` — fajl nema `ROLE_LABELS` export. `main.js` importuje `ROLE_LABELS` ali ga `config.js` ne sadrži. **Ovo je runtime ReferenceError koji blokira igru odmah posle startGame().** **Rešenje:** Dodati `export const ROLE_LABELS = { dj: 'DJ', host: 'Host', sound: 'Sound', video: 'Video', security: 'Security' }` u `config.js`.

- [CRITICAL] **`progression.js` poziva `buildFinaleSeed(state)` lokalno ali `main.js` poziva `buildFinaleSeed('2026-05-31', state.cumulative_xp)`** — ove dve funkcije imaju **različite signature**. `grand_finale.js` mora eksportovati `buildFinaleSeed` koji `main.js` importuje sa dva argumenta, ali `progression.js` definuje svoju lokalnu `buildFinaleSeed(state)` sa jednim argumentom. Ako `grand_finale.js` export-uje funkciju sa 2 argumenta, `progression.js` poziva lokalni override sa 1 argumentom — ova disproporcija garantuje bug ili jedan od poziva dobija pogrešan seed. **Rešenje:** Unificirati signature — jedan kanonski export iz `grand_finale.js`, `progression.js` da ne redefiniše lokalnu kopiju.

---

## Srednji problemi (MEDIUM) — oštećuju first-impression

- [MEDIUM] **`deductDraftCosts` može da ide u negativan budget za tier-3 karte** — `src/main.js:runDraftPhase()` oduzima `picked.cost` od `available_budget` koristeći `Math.max(0, ...)` — ovo je ispravno. Ali `deck.js:isCardAvailable()` filtrira karte sa `card.cost > budget`. Problem nastaje u **fallback grani**: ako ništa nije dostupno, fallback vraća najjeftinije karte ignorišući budget constraint (`sort().slice(0, HAND_SIZE)`). Igrač može biti prikazan kartu koja košta npr. 14 BP dok ima 0 BP, potvrdi je, i `Math.max(0, 0 - 14) = 0` — budget ostaje 0 bez odbitka, ali karta je odabrana. Igrač ne dobija vizuelni feedback da li može da priušti kartu. **Rešenje:** Na kartici prikazati disabled state ako `card.cost > state.available_budget`. Upozoriti igrača pre potvrde.

- [MEDIUM] **`runCrewUpdate` prikazuje card ID-eve kao tekst umesto pravih imena** — `src/main.js:runCrewUpdate()` kreira `div.textContent = id` (string poput `'dj_drazen'`), a ne ime karte. Igrač vidi `dj_drazen ostaje` umesto `Dražen Bura ostaje`. Ovo je vidljivo odmah posle prvog eventa. **Rešenje:** Mapirati ID na Card objekat iz `getAllCards()` pre renderovanja, prikazati `card.name`.

- [MEDIUM] **Preview panel u draft-u ne prikazuje ability (special) tekst** — `phase_display.js:showCardPreview()` prikazuje `base_score`, `cost`, `description` i `synergy_tags`, ali karta u `cards_data.js` nema `description` polje — samo `special`. Preview panel je uvek prazan za "description" deo jer property ne postoji. Igrač ne može pročitati šta karta radi. Ovo je centralna mehanika igre. **Rešenje:** Prikazati `card.special` umesto (ili pored) `card.description`.

- [MEDIUM] **Score breakdown prikazuje `conflict_total` kao pozitivan broj ali ga vizuelno ne oduzima** — `event_result.js` gradi row `{ label: 'Konflikt', value: eventResult.conflict_total, type: 'negative' }` i prefixuje sa `-` samo ako je `type === 'negative' && row.value > 0`. Ali `EVENT SCORE` je sekvencijalni red bez vizuelnog objašnjenja kako se dolazi do njega — igrač ne vidi da je npr. `65 - 12 = 53`. Nema matematičke linije koja bi to connected. First-time player neće razumeti zašto je score niži od baze. **Rešenje:** Dodati `=` separator liniju pre `EVENT SCORE` reda, i eksplicitno prikazati formulu.

- [MEDIUM] **`codex.js` koristi `card.unlock_xp` ali `cards_data.js` definiše `locked_until_xp`** — `codex.js:_renderCodexCards()` sortira po `a.unlock_xp` i prikazuje `card.unlock_xp` u lock overlay, ali sva polja u `CARDS_DATA` se zovu `locked_until_xp`. Rezultat: sve zaključane karte prikazuju "Treba 0 XP" i sort po unlock XP ne funkcioniše. **Rešenje:** Zameniti sve reference `card.unlock_xp` → `card.locked_until_xp` u `codex.js`.

- [MEDIUM] **`startGame()` poziva `loadMeta()` ali ignoriše njen return value za `meta-runs` prikaz** — `main.js:startGame()` ima `const meta = loadMeta()` ali `loadMeta()` se poziva i u DOMContentLoaded i u startGame — svaki poziv čita iz localStorage. Problem: `startGame()` odmah potom poziva `setState({...})` koji triggeriše `saveToStorage()`, a **clearStorage()** se poziva u `finalizeRun()` — posle `clearStorage()` sledeći `loadFromStorage()` u `startGame()` vraća prazan state, i meta display prikazuje `Prethodnih rundi: 0 | Rekord: —` čak i ako postoji rekord. **Rešenje:** `startGame()` treba da čita meta pre nego što resetuje state, i da ga sačuva za prikaz.

- [MEDIUM] **Mobile: karte u fan layout-u su 140px × 200px — prevelike za viewporte ispod 400px** — `ui.css` definiše `.card { width: 140px; height: 200px }`. Tri karte u fan layout-u sa `gap: 0` i `fan-translateX: ±20px` zauzimaju ~460px horizontalno što prekoračuje 360px-wide viewport. Karte će se prepuciti van ekrana bez horizontal scroll. Nema media query koji bi smanjio karte na mobilnom. **Rešenje:** Dodati `@media (max-width: 440px)` koji skalira `.card` na `width: 110px; height: 160px` i smanjuje `--fan-translateX` na `±10px`.

- [MEDIUM] **`showStinger` kreira novi `stinger-overlay` element ako `#stinger-overlay` ne postoji u DOM-u, ali `#stinger-overlay` već postoji u HTML-u sa klasom `hidden`** — `ui.js:showStinger()` proverava `getElementById('stinger-overlay')` koji će uvek naći element iz HTML-a, pa neće kreirati novi — to je ispravno. Ali pri animaciji: `overlay.className = stinger stinger--${variant}` briše klasu `hidden`, pa je `hidden` override `!important` iz `base.css` (`.hidden { display: none !important }`) zaobiđen. Međutim, stinger je `position: fixed` i nema `display` conflict — ovo je OK. **Pravi problem**: `animationend` event se ne emituje ako browser ima animacije isključene (prefers-reduced-motion). `onDone` callback nikad ne bude pozvan, `runEventResolve` se zaglavljuje. **Rešenje:** Dodati `@media (prefers-reduced-motion: reduce)` koji odmah poziva `onDone` bez animacije, ili dodati setTimeout fallback uz `animationend`.

---

## Manji problemi (LOW) — polish pass

- [LOW] **Intro screen nema objašnjenje scoring braket sistema** — Igrač ne zna šta znači `Flop / Solid / Zvezda / Legenda` pre prvog eventa. Nema ni tooltip ni info ikonu. Saznaje tek na result screenu posle prvog eventa.

- [LOW] **`hud-budget` inicijalno prikazuje `💰 60 BP`** (iz HTML-a) ali posle `updateHUD()` prikazuje `60/60 BP` bez emoji — format se menja posle prvog rendera. **Rešenje:** Uskladiti inicijalni HTML sa formatom koji `updateHUD()` generiše, ili uvek dodavati emoji u `updateHUD()`.

- [LOW] **Flavor tekstovi iz synergy log-a prikazani su u result screenu ali dolaze iz `entry.flavor` u `synergy_data.js`** koji ovde nije učitan — u `main.js:runEventResolve()` `synergy_log` se popunjava iz `scoreBreakdown.synergy_report?.active_effects?.map(e => e.description)`. `e.description` je tehničke prirode (npr. `"2+ Veteran traits present [Phantom rerolled → 0]"`). Ovo nije flavor tekst — ovo je debug output. Igrač vidi interne opise umesto dramatičnih/zabavnih linija. **Rešenje:** Koristiti `e.flavor` iz `active_effects` umesto `e.description` za `synergy_log`.

- [LOW] **`playUnlockCard()` audio funkcija definisana ali se nigde ne poziva** — `audio.js` eksportuje `playUnlockCard()` ali nijedan fajl je ne importuje ili poziva. Unlock događaj je kljucni engagement moment bez audio feedback-a.

- [LOW] **Tour end screen: `loyalty_bonuses` mapa sadrži `+2 XP per loyal card`** ali tooltip/opis na kartici kaže `🔥+2` bez objašnjenja šta to znači. Na prvom prelasku igrač ne razume connection između loyalty i score.

- [LOW] **`btn-confirm` se klonira (`.cloneNode(true)`) u svakom `renderDraftPhase` pozivu** da bi se uklonili stari event listeneri — ovo funkcioniše ali je nepouzdano ako se btn-confirm pomerio u DOM-u između render ciklusa. Sigurniji pattern: `AbortController` signal za event listenere.

- [LOW] **Codex modal backdrop dodaje se u `game-root` svaki put kada `openCodex` inicijalizuje `_backdropEl`** ali ga ne uklanja pri `closeCodex()` — samo dodaje/uklanja CSS klase. Ako se `openCodex` pozove dok modal već postoji (edge case: brzo duplo klikanje), backdrop se ne duplira zahvaljujući `if (!_backdropEl)` guard — ovo je OK. Ali backdrop `click` listener se dodaje samo jednom, što je ispravno.

- [LOW] **`screen--entering` animacija ne funkcioniše za `screen-draft`** — `base.css` definiše `.screen { display: none }` i `.screen--active { display: flex }`. `showPhase()` u `ui.js` dodaje `screen--entering` klasu **posle** `screen--active`, ali `game.css` definiše `#screen-draft { display: none }` sa većim specificity koji overriduje `.screen--active` na draft ekranu. Ekran se prikazuje ali enter animacija ne radi za draft. **Rešenje:** Ukloniti `#screen-draft { display: none }` iz `game.css` jer `base.css` `.screen--hidden` već to pokriva.

- [LOW] **`shareTourCard` u `tour_end.js` poziva i `onShare()` callback I `_handleShare()` interno** — oba flow-a pokušavaju da share-uju, što znači da se na mobilnom Web Share API može pozvati dva puta. **Rešenje:** Jedan ili drugi — callback ili internal handler, ne oba.

- [LOW] **`input.js` definiše `onCardSelected` callback u `InputCallbacks` typedef** ali `main.js:initInputCallbacks()` prosleđuje `onCardSelect` (bez `-ed` suffiksa). TypeScript bi uhvatio ovo, ali u plain JS-u oba postoje pa jedan nikad ne bude pozvan.

---

## Pozitivno

- **Scoring arhitektura je solidan dual-pass system** (first ability pass → synergy opts → synergy eval → second ability pass) koji ispravno rešava circular dependency između ability-a i synergy-a. Ovo je netrivijalno i urađeno čisto.
- **Audio engine je izuzetan za projekt ove skale** — proceduralni Web Audio sa pravilnim lazy init (tek na prvom kliku), master compressor, lobby beat sa re-schedulingom, distorzija za fail stinger, reverb simulacija za Legenda tier — sve bez jednog `.mp3` fajla. Dokumentacija unutar `audio.js` je odlična.
- **Tema i vizuelni identitet su konzistentni** — tamna navy/neon paleta u `theme.css`, fan layout karata, silhouette CSS clip-path portreti, tier boje — sve funkcioniše zajedno i ostavlja jak first-impression na intro screenu.
- **`deck.js` edge case handling je solidan** — retained guarantee u hand-u, budget fallback kada ništa nije dostupno, seeded PRNG za reproduktivnost, tier-3 gate — sve dokumentovano i implementirano.
- **`state.js` je pravi singleton sa shallow-merge pattern-om** — nema direktnih mutacija, `saveToStorage()` se poziva pri svakom `setState()`, `finalizeRun()` čisti state i čuva meta odvojeno. Ovo je ispravno urađeno.
- **Canvas Tour Card u `share.js` je funkcionalan i vizuelno detaljan** — gradient background, grid overlay, neon glow tekstovi, event arc bar chart, per-card mini layout, bilet.rs URL u footer-u.Shareable artifact koji zapravo izgleda dobro.
- **`bilet.rs` CTA je vidljiv na tour end screenu** — `btn--bilet` je prominentan, sa `btn--accent` (teal) bojom koja ga vizuelno razlikuje od ostalih akcija, target `_blank` sa `rel="noopener"`, i hardcoded link ka konkretnom eventu.
- **Pristupačnost (a11y) je bolja od proseka** — `role="main"` na screenovima, `aria-live` na preview i toast regionima, `aria-label` na svim akcionim dugmadima, `role="list"` na card-hand-u, `role="dialog" aria-modal="true"` na Codex modalu, `focus-visible` outline.

---

## Zaključak

Igra ima **jak strukturalni temelj** i vizuelno ubedljiv identitet, ali je blokirana sa **dva runtime-kritična buga**: `ROLE_LABELS` koji ne postoji u `config.js` eksportima će srušiti `startGame()` sa `ReferenceError`, a dupla kontrola draft flow-a između `input.js` i `main.js` guaranteed desinkronizuje state u prvom draft-u. Ova dva buga moraju biti fiksirana pre nego što se igra može igrati end-to-end. Posle toga, `codex.js`/`card.unlock_xp` typo, preview panel koji ne prikazuje ability tekst, i `runCrewUpdate` koji prikazuje raw ID-eve su blokatori za **normalnu igrivost** prvog dana. Sa tim fix-ovima (procene: 3-4 sata rada), igra ulazi u objavljivo stanje na **7.5/10** nivou.
