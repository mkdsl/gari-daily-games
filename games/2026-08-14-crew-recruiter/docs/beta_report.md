# Beta Report — Crew Recruiter: Izgradi Ekipu
**Datum:** 2026-08-17
**Iteracija:** 1
**Beta Score:** 7.0/10

---

## Zora — UX & Pristupačnost

### [CRITICAL] `pointer-events: none` na `#resolve-overlay` — backdrop ne blokira klikove

`ui.css` linija `pointer-events: none` na `#resolve-overlay` znači da tamna polu-transparentna pozadina (75% opacity) NE hvata klikove korisnika. Tokom resolve breakdown prikaza (koji se pokazuje između rundi), svi elementi ispod overlay-a ostaju klikabilni: akcijsko dugme, slotovi, karte u ruci. Ako `afterResolve()` u main.js čeka timeout pre nego što promeni `gamePhase`, korisnik može da klikne "Vuci karte" ili "Reši rundu" pre nego što resolve sekvenca završi — potencijalni double-resolve ili draw u pogrešnoj fazi. `.resolve-box` ne definiše `pointer-events: auto`, pa nasleđuje `none` od roditelja — i sam resolve prikaz ne prima klikove. Fix: dodati `pointer-events: auto` na `.resolve-box` i ukloniti `pointer-events: none` sa `#resolve-overlay` (ili ga premestiti samo na backdrop sloj koji je odvojen od sadržaja).

### [CRITICAL] `aria-live="polite"` na animiranom score brojaču — screen reader spam

`ending-screen.js` linija 80: `aria-live="polite"` je direktno na `<div class="ending-score-wrap">` koji sadrži `<span id="score-counter">`. Funkcija `animateCounter` update-uje `el.textContent` svaki `requestAnimationFrame` korak tokom 1500ms — to znači 90+ announcement-a u sekundi za korisnike screen reader-a. Korisnik čuje numerički stream umesto finalnog broja. Fix: ukloniti `aria-live` sa wrappera i dodati ga na skriveni `<span class="sr-only">` koji se puni jednom po završetku animacije sa finalnim vrednostima.

### [MEDIUM] Ending card sa `aspect-ratio: 1/1` i `overflow: hidden` klipa sadržaj

`.ending-card` je kvadratna (1:1), `max-width: 380px`, `overflow: hidden`. Na telefonu 390px viewport sa 1rem padding-om na `#ending-screen`, karta je ~358×358px. Unutrašnji sadržaj (label, score, emoji, tagline, CTA, best score, dva dugmeta, play URL) pri `gap: 0.65rem` i `padding: 1.5rem 1.2rem` marginalno staje. Korisnici koji imaju uvećan sistemski font (accessibility large text, 125%+) vidеće isečen play URL i potencijalno dugmad. Fix: zameniti `aspect-ratio: 1/1` sa `min-height: 320px` i dozvoliti da karta raste; ukloniti `overflow: hidden` ili preći na `overflow-y: auto`.

### [MEDIUM] Tutorial korak 2 pominje i klik i prevlačenje — ali keyboard korisnici su slepi

Tutorial tekst: "Klikni kartu pa klikni slot, ili prevuci kartom na slot." Oba puta su u redu ako rade. Međutim, u `ui/cards.js` keyboard handler (Enter/Space) dispatchuje sintetički `PointerEvent` sa `clientX: 0, clientY: 0` — ne postoji `pointermove` u sintetičkim eventima, pa drag sistem (koji verovatno koristi `pointermove` u `input.js`) neće aktivirati fizičko prevlačenje. Korisnici koji navigiraju tastaturom moraju koristiti click-based tok (klik karte → klik slota). Ako taj tok postoji i radi, problem je samo u documentation — ali ako ne postoji, keyboard korisnici ne mogu da assignuju karte. Visok rizik bez čitanja `input.js`. Fix: verifikovati da click-assign tok radi nezavisno od drag-a; dodati eksplicitan keyboard hint u tutorial.

### [LOW] Slot labele 0.58rem su na ivici čitljivosti na low-DPI ekranima

`.slot-label { font-size: 0.58rem }` — na 96dpi ekranu to je ~9px. Na Android mid-range uređajima bez subpixel renderinga (npr. 720p na 5.5") ovo je teško čitljivo. Pet slotova u grimu na 320px ekranu daje svakom slotu ~60px širine. Fix: povećati na minimum 0.65rem ili koristiti samo emoji oznake u slot labeli na uskim ekranima.

### [LOW] Zaključani event type kartice koriste `aria-disabled` bez `disabled` atributa

`buildTypeCard` stavlja `aria-disabled="true"` ali ne `disabled` atribut na `<button>` elemente zaključanih tipova. To znači da su dugmad fokusabilna (Tab navigacija), ali click listener otvara tooltip umesto da selektuje. Screen readeri izgovaraju "Dugme, nedostupno" što je korektno za aria-disabled, ali korisnik može da fetchuje fokus na zaključano dugme i pita se zašto ništa ne radi. Alternativa: koristiti pravi `disabled` atribut i vizuelno stilovati sa `opacity: 0.45` što već postoji.

---

## Raša — Tehnički & Destruktivni

### [CRITICAL] `pointer-events: none` na overlay otvara race condition u resolve sekvenci

Dopuna Zorinog nalaza iz tehničkog ugla: Ako `afterResolve()` koristi `setTimeout` pre menjanja `gamePhase` (uobičajen pattern za "pauza radi čitanja breakdown-a"), korisnik može da klikne akcijsko dugme VIŠE PUTA tokom te pauze. Svaki klik na "Reši rundu" (ako button area nije redrasovana u međuvremenu) bi pozvao `performResolve()` ponovo — što bi uzrokovalo drugu kalkulaciju `resolveRound()` sa istim slotovima, drugu promenu `vibe_score`, i drugi `state.phase_index++`. Ovo nije teoretski — na mobilnom uređaju korisnik koji tapne brzo pre nego što overlay nestane može da preskoči fazu. Jedino što sprečava ovo je brzi redraw action area-e u `afterResolve()` — što je krhka zaštita. Fix: setovati `state.gamePhase = 'resolve'` pre nego što `showResolveBreakdown()` prikaze overlay, i u `renderActionArea` ne prikazivati dugme za `gamePhase === 'resolve'`.

### [CONFIRMED — NOT A BUG] `renderActionArea` callback raspored je korektan

Gari je flagovao potencijalni bug. Potvrđujemo da `renderActionArea(gamePhase, onDraw, onResolve, ...)` ispravno žicuje:
- `'draw'` faza → kreira dugme sa `onDraw` callbackom (prvi argument)
- `'assign'` faza → kreira dugme sa `onResolve` callbackom (drugi argument)

`main.js` line 84: `renderActionArea('draw', performDraw, () => {})` — ispravno, `() => {}` je placeholder za nekorišćeni onResolve u draw fazi.
`main.js` line 98: `renderActionArea('assign', () => {}, performResolve)` — ispravno, `() => {}` je placeholder za nekorišćeni onDraw u assign fazi.
Oba callbacka aktiviraju ispravan handler. Nema buga.

### [CONFIRMED — NOT A BUG] `maybShowTutorial` typo je konzistentan

`tutorial.js` export i `main.js` poziv koriste isti typo (`maybShowTutorial` umesto `maybeShowTutorial`) — runtime greška ne postoji jer su oba strane identična. Označeno kao LOW code quality issue.

### [CONFIRMED — CORRECT] Graveyard recycling u `deck.js` je ispravan

`drawCards()` proverava `state.deck.length === 0`, zatim `state.graveyard.length === 0` (break — ne ulazi u beskonačnu petlju), pa shuffle-uje graveyard natrag u deck. Fisher-Yates u `shuffle()` je ispravan (ide od kraja do početka, random u opsegu [0, i]). `state.deck.pop()` uzima sa kraja — pošto je deck shufflovan, ovo je ekvivalentno random draw-u. Nema buga.

### [CONFIRMED — CORRECT] `detectActivePairs` u `synergy.js` proverava sve roleove, ne susedne slotove

Sinergija je role-based, ne position-based: `detectActivePairs` gradi `filledRoles` mapu i proverava sve `SYNERGY_PAIRS` ključeve u formi `"roleA-roleB"`. Ovo je intencijalno i konzistentno sa GDD opisom "Neke kombinacije uloga aktiviraju sinergiju". `MAX_SYNERGY_PER_ROUND` cap korektno ograničava ukupni bonus.

### [MEDIUM] `drawCards` ne garantuje da se hand briše pre novog draw-a

`deck.js` `drawCards(n, state)` push-uje karte direktno na `state.hand` — ne briše prethodne. Ako `enterDrawPhase()` u main.js poziva `drawCards(3, state)` bez prethodnog `state.hand = []`, karte iz prethodne runde (neassignovane) ostaju u ruci uz 3 nove. Graveyard se puni od strane negde u `afterResolve()` (verovatno), ali ako hand clearance nije eksplicitan, korisnik može da akumulira 6+ karata u ruci kroz runde. Nije proverljivo bez čitanja main.js, ali je strukturni rizik. Fix: verifikovati da `enterDrawPhase()` eksplicitno radi `state.hand = []` (ili pomeriti neassignovane u graveyard) pre poziva `drawCards`.

### [MEDIUM] `isFirstRun` se NE resetuje u `resetForNewRun()`

`state.js` `resetForNewRun()` ne dira `state.isFirstRun`. Ovo je ispravno za tutorial (treba da se prikaže samo jednom). Ali `isFirstRun` se čita iz `localStorage` via `TUTORIAL_DONE_KEY` u `createInitialState` — ako korisnik ne dovrši tutorial (klikne "Preskoči"), `_finishTutorial()` svakako setuje `localStorage.setItem(TUTORIAL_DONE_KEY, 'true')`. Dakle jednom preskočen, tutorial se više ne vidi — ovo je korektno ponašanje, samo konfirmujem.

### [LOW] `buildBestScoreLine` logika sa `hof.length === 1` je funkcionalno ispravna ali zbunjujuća

```js
const isNewBest = currentScore > maxScore || hof.length === 1;
if (isNewBest && currentScore >= maxScore) { ... }
```
`|| hof.length === 1` otvara `isNewBest` za bilo koji drugi run, ali `&& currentScore >= maxScore` zatvara ga korektno. Rezultat je tačan, ali logika je netransparentna. Preporučiti refactor za čitljivost.

### [LOW] `maybShowTutorial` typo — oba kraja jednaka, nema crash-a, ali loša praksa

Zameniti sa `maybeShowTutorial` u oba fajla (`tutorial.js` export + main.js import/poziv) u jednom atomičnom commit-u.

---

## Lela — Iskustvo & Engagement

### [MEDIUM] Vibe Start od 20 čini prvu rundu previše "safe" — nema tension

`VIBE_START = 20`, `VIBE_MIN = 0`. Sa `CHURN_PENALTY = 3`, `EMPTY_SLOT_PENALTY = 2`, `IMPATIENCE_PENALTY = 5`, i phase weight multiplierima — korisnik koji igra Setup fazu sa 0 karata assignovanih gubi `5 × 2 (empty) + 5 (impatience)` = ~15, a ima PHASE_WEIGHT za Setup koji je verovatno niži. Matematički, crash na 0 u prvoj rundi je skoro nemoguć sa normalnim igrama. Dobro. Ali korisnik ne oseća napetost dok Vibe bar ne padne ispod 40-50. Preporuka: povećati `VIBE_START` na 30-35 i `CHURN_PENALTY` na 4 — tada pad u kasnim fazama (Climax, Breakdown) gde su weight multiplieri visoki bode više.

### [MEDIUM] Ending screen Guncati CTA — sadržaj unverifiable iz dostupnih fajlova

`showEndingScreen()` poziva `getCTA(type, eventType)` iz `systems/ending.js` (nije u listi za čitanje). `BRAND.PLAY_URL` iz `content/brand_hooks.js` (nije čitan) prikazuje link. Per brief, Guncati tie-in treba da bude na ending screenu. Strukturno mesto postoji (`.ending-cta`), ali nije moguće potvrditi da CTA sadrži Guncati kopiju bez čitanja tih fajlova. Flag za Jovu: verifikovati da `getCTA` vraća Guncati-specific tekst za bar jedan `type`/`eventType` kombinaciju, i da `BRAND.PLAY_URL` ukazuje na MKDSLend URL.

### [MEDIUM] 3 tutorial koraka ne objašnjavaju Vibe metar — prvi korisnik ne zna šta gubi

Tutorial ima 3 koraka: vući karte, popuniti slotove, sinergija. Nigde ne pominje da postoji `Vibe Score` koji pada sa praznim slotovima i impatienceom, niti da cilj nije samo igrati karte nego igrati ih brzo i pametno. Novi korisnik koji odigra prvu rundu sa 1 slotom popunjenim vidi negativni delta ali ne razume zašto. Fix: dodati korak 4 "Vibe Score" koji objašnjava penalties i cilj.

### [LOW] Aforizam overlay se prikazuje nad resolve breakdown — redosled je nejasan

`showAforizam()` u `ui.js` koristi isti `#resolve-overlay` element kao `showResolveBreakdown()`. Ako `showSynergyPairs()` → `showAforizam()` sekvenca u main.js sledi odmah za breakdown-om (koristeći isti element sa `overlay.innerHTML = ''`), korisnik vidi breakdown → aforizam → nova runda. Ovo je potencijalno lepo iskustvo, ali timing mora biti pažljiv — breakdown treba minimalno 2s, aforizam auto-hide je 2.5s, ukupno ~4.5s između rundi. Na mobilnom ovo može da deluje sporo. Preporuka: razmisliti o skraćivanju na 1.5s + 2.0s ili kombinovati u jedan overlay prikaz.

### [LOW] Hall of Fame se prikazuje tek posle 3 igre (`isHOFUnlocked`) — novi korisnik ne zna da postoji

Novi korisnik vidi menu bez HOF sekcije. Nema preview ni "Popuni 3 igre da otključaš HOF" indikator. Progress tracker za event type unlocks postoji i radi dobro — ali HOF nema ekvivalent. Lako rešivo: prikazati placeholder "🏆 Hall of Fame — osvoji 3 nastupa da se upišeš" od prvog puta.

### [LOW] Replay vrednost se oslanja na event type unlocks (5/10 runs) ali razlika Outdoor vs Klub nije opisana

Menu opisuje Outdoor kao "Festival pod otvorenim nebom" i Intimate kao "Intimni showcase" — ali ne govori koje su MEHANIČKE razlike (drugačiji deck? drugačiji synergy bonusi?). Korisnik koji ne zna da outdoor ima `OUTDOOR_CARDS` u decku i potencijalne `synergyOverrides` nema razloga da želi da otključa. Fix: dodati 1-2 reči opisa mehaničke razlike u `EVENT_DESCRIPTIONS` u menu.js.

---

## Sumarni scorecard

| Dimenzija | Score |
|-----------|-------|
| Playability | 6.5/10 |
| UX/Onboarding | 7.5/10 |
| Engagement | 7.0/10 |
| Brand fit | 7.0/10 |
| **Beta Score** | **7.0/10** |

**Verdict: Ide sa korekcijama** — CRITICALi blokiraju release. Konceptualno čvrsta igra, deck sistema je čista, synergy logika korektna, FTUE flow razumljiv. Dva CRITICAL-a su oba u istom fajlu (`ui.css` / `ui.js`) i rešiva u jednoj sesiji.

---

## Prioritizovani bugovi za fix

1. **[CRITICAL] `pointer-events: none` na `#resolve-overlay`** — `ui.css`: dodati `pointer-events: auto` na `.resolve-box`; ukloniti `pointer-events: none` sa `#resolve-overlay`. Paralelno u main.js: setovati `state.gamePhase = 'resolve'` u `performResolve()` pre prikazivanja overlay-a, i ne renderovati akcijsko dugme u 'resolve' fazi.

2. **[CRITICAL] `aria-live="polite"` na score counter animaciji** — `ending-screen.js` line 80: ukloniti `aria-live` i `aria-label` sa `.ending-score-wrap`; dodati `<span class="sr-only" id="score-sr-announce">` koji se puni jednom sa `Vibe Score: ${clampedScore} od 100` na kraju animacije.

3. **[MEDIUM] Verifikovati hand clearance u `enterDrawPhase()`** — main.js: potvrditi da `state.hand = []` (ili prenos u graveyard) prethodi `drawCards(3, state)` u svakoj rundi, da se karte ne akumuliraju.

4. **[MEDIUM] Verifikovati Guncati CTA u `getCTA()`** — `systems/ending.js` + `content/brand_hooks.js`: barem jedan ending type ili outdoor eventType treba da vrati Guncati-specific kopiju.

5. **[MEDIUM] Ending card `overflow: hidden` + `aspect-ratio: 1/1` sa large system font** — `ui.css`: zameniti aspect-ratio sa `min-height: 320px`, ukloniti `overflow: hidden`.

6. **[MEDIUM] Tutorial korak 4 za Vibe metar** — `ui/tutorial.js`: dodati STEPS entry "Vibe Score" koji objašnjava šta ga spušta i koji je cilj.

7. **[MEDIUM] Keyboard drag via sintetički PointerEvent** — `ui/cards.js` + `input.js`: verifikovati da click-based assignment (klik karte → klik slota) radi bez drag-a; dokumentovati ili popraviti keyboard path.

8. **[LOW] `maybShowTutorial` typo** — `tutorial.js` + `main.js`: rename u `maybeShowTutorial` u oba fajla.
