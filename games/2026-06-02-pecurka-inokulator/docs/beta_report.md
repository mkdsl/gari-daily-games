## BETA TEST REPORT — Pečurka Inokulator

**Datum:** 2026-06-02
**Testers:** Zora (UX), Raša (Tehničko), Lela (Engagement)
**Izvor:** Static analysis nad `src/`, `index.html`, `manifest.json`

### Ukupna ocena: 6.3/10 (prosek sve tri)

---

### Zora (UX): 6/10

**Šta radi dobro:**
- Start screen je čist i razumljiv — taster "POČNI INOKULACIJU" je jasan CTA.
- Tutorial overlay postoji i pokreće se automatski na nivou 1 — dobro za new users.
- HUD je minimalisti čki (score / životi / nivo) i ne zatrpava ekran.
- Score popups (+NNN iznad vreće) daju trenutni feedback na pogodak — odlično.
- Screen shake na failu je kratka, jasna penalizacija bez pretjerivanja.
- Level clear ekran sadrži Guncati Fact — brending je prirodan, ne nataren.
- Canvas skaliranje je ispravno implementirano (letterbox, responsive).

**Šta ne radi / Šta fali:**
- **Nema vizuelnog feedbacka koji TIP udarca je igrač napravio tokom gameplay-a na samom baru.** `state.lastHitType` se pamti ali se nigdje ne renderuje u toku igre — igrač ne zna je li bio u fake, green ili golden zoni. Postoji samo zvuk.
- **Tutorial overlay lebdi iznad bežičnog prozora ali ne pokazuje gdje je taj bar u tom trenutku.** Strelica (↓) je statična, a bar se kreće — zbunjujuće.
- **`hideMenu()` briše sadržaj menija — klik na "Počni" na start screenu je drukčiji flow od kretanja iz level-clear-a.** Na Start screenu `btn-start` poziva `hideMenu()` ali ne poziva `startLevel()` direktno — to radi `handleAction()`. Međutim `handleAction` radi `ui.hideMenu(); startLevel()` samo ako `state.screen === 'start'`. Ovo je ispravno, ali je zbunjujuće jer klik na dugme AND klik na canvas pokretaju igru — dupli entry point koji može zbuniti testera.
- **Level clear auto-advance (3s) nije indikovan nikakvim progress barom ili odbrojavanjem.** Igrač ne zna da će ekran nestati sam od sebe.
- **Highscore se resetuje svaki dan** (daily reset u `state.js:19`). Ovo je design odluka, ali ne komunicira se na UI-ju — novi igrač u večernjim satima ne zna zašto vidi prazan highscore.
- **Nema pause mehanike** — tab-blur cap (50ms) štiti od crash-a ali igrač ne može svjesno pauzirati.
- **Font je `monospace` kroz ceo kod** — funkcioniše ali nije brand-aligned; Guncati vizual identitet zaslužuje nešto toplije.

**Bug list:**
- `[MEDIUM]` Tutorial strelica je statična (↓) dok se timing bar kreće — ne upućuje na bar. Igrač prvog puta može misliti da treba kliknuti na pečurku.
- `[MEDIUM]` Level clear auto-advance od 3s nije indikovan — igrač ne zna da se ekran zatvara automatski, može izgubiti orientaciju.
- `[LOW]` Dupli entry point za start igre (klik na dugme + klik bilo gdje na canvas) — nije bug ali zbunjuje ako testirate redosled eventa.
- `[LOW]` Daily highscore reset nije objašnjen na UI-ju ("Danas" label je tanak hint).

---

### Raša (Tehničko): 6/10

**Šta radi dobro:**
- Modularna struktura je solidna — svi moduli postoje (7 koje treba proveriti su prisutni: `timing.js`, `bag.js`, `progression.js`, `audio.js`, `facts.js`, `share.js`, `input.js`).
- `import` chain u `index.html` je čist — jedini `<script type="module">` je `src/main.js`; ostalo je auto-resolved.
- `requestAnimationFrame` game loop sa `dt` cap-om (50ms) — ispravan zaštitnik od tab-blur lag-spike.
- LocalStorage highscore je otporan na parse greške (try/catch svugdje).
- Web Audio je lazy-init iza user gesture — ispravno za browser policy.
- `_roundRect` polyfill je prisutan za starije browsere koji nemaju `ctx.roundRect`.
- Collision check redosled (fake → golden → green → miss) je logički ispravan i dobro dokumentovan.
- `LCG PRNG` za deterministički seed fake zone na first-run je pametan izbup.

**Šta puca:**

1. **`[CRITICAL]` Blink mehanika lomi collision logiku.** U `window.js:218-221`, `isClickInWindow()` ignoriše `blinkState` — komentirano je "igrač pogađa na slepo". Ali u `collision.js`, zeleni prozor se uvek proverava bez obzira na blink. U `render.js:461`, kad je `blinkState = false`, `globalAlpha = 0.0` — prozor je nevidljiv. Dakle: na nivou 6, prozor treperi i postaje nevidljiv, ali igrač može da ga POGODI dok je nevidljiv. Ovo je ili bug (neplanirano) ili nedokumentovana feature koja zbunjuje — ali UX percepcija je: "kliknuo sam u prazninu i dobio pogodak", što kvari poverenje u mehaniku.

2. **`[CRITICAL]` `playCountdown()` i `playPerfect()` i `playBlink()` su implementirani u `audio.js` ali se nikad ne pozivaju iz `main.js`.** `main.js` importuje samo `{ initAudio, playTick, playHit, playFail, playGoldenHit, playStreakActivation, playLevelClear, playGameOver }`. `playCountdown`, `playPerfect`, `playBlink` su dead code — blink nivo 6 nema audio feedback za treperenje, a nema countdown zvuka na nivo startu. Posebno `playBlink` je kritičan jer na blink mehanici zvučni signal pomaže igraču da pogodi nevidljivi prozor — bez njega nivo 6 postaje slepa igra.

3. **`[CRITICAL]` Multi-bag render logika u `render.js:346-371` ima pogrešnu detekciju.** `isMultiBag` se proverava sa `bags.some(b => b.groupIndex !== undefined)`. Međutim u `bag.js:135-136`, `groupIndex` se postavlja SAMO u multi-bag granama. Na sekvencijalnim nivoima (1-6, 8, 10), `groupIndex` nije definisan — `bag.groupIndex` je `undefined`. `undefined !== undefined` je `false`, dakle `bags.some(b => b.groupIndex !== undefined)` je ispravno `false` za sekvencijalne. Ali na nivou 10 (`all_combined`), `speciality` nije `multi_bag_2` ili `multi_bag_3`, pa `simultaneous = 1` i `groupIndex` se ne setuje — ali nivo 10 bi trebalo da ima i multi-bag po opisu "all_combined". **Nivo 10 neće pokazati multi-bag layout čak i ako je GDD-om predviđen**, jer `createBagsForLevel` ne aktivira `simultaneous > 1` za `all_combined`. Ovo je logički propust.

4. **`[MEDIUM]` `state.missCount` se ne resetuje pri ponovnom pokretanju nivoa** kad igrač umre i restartuje (vraća se na `initialState()` koji ga setuje na 0 — OK) ali u `startLevel()` se `missCount = 0` resetuje — ispravno. Međutim, `isPerfectLevel()` iz `progression.js` se exportuje ali se nigde ne poziva — `missCount === 0` check za perfect bonus je redundantno implementiran direktno u `levelClear()` u `main.js:233`. `isPerfectLevel` iz `progression.js` je dead export.

5. **`[MEDIUM]` Golden window može spawn-ovati na poziciji koja se preklapa sa zelenim prozorom** (`goldenX = 0.05 + Math.random() * 0.85`). Komentar kaže "Random pozicija koja ne koincidira sa zelenom zonom" ali nema provere. Ako `goldenX` padne unutar `[barX, barX + windowWidthNorm]`, golden se preklapa sa green — collision check proverava golden PRVI, pa bi green bio skriven golden-om što je OK, ali vizualno preklapanje dva prozora je zbunjujuće.

6. **`[MEDIUM]` Direction change (nivo 3) je aktiviran kao `usesSinusoid = true` u `window.js:64`** (`sp === 'direction_change'`), ali sinusoida ne pravi "slučajne promene smjera" — ona uvek osciluje glatko levo-desno. `dirChangeTimer` u `update()` linija 124 doda nasumičnu promenu smjera na LINEAR modu, ali nivo 3 koristi SINUSOIDAL mod gde `direction` varijabla nije relevantna za kretanje. Dakle nasumični smjer promjene na nivou 3 se računa ali se nikada ne primenjuje. Nivo 3 je identičan sinusoidnom oscilovanom kretanju, bez iznenađenja.

7. **`[LOW]` `renderLivesCanvas()` u `render.js:517-541` je "backup" canvas renderer za živote ali se nikada ne poziva iz `render()` funkcije.** Životi su u DOM HUD-u (ui.js). Ova funkcija je dead code koji povećava fajl.

8. **`[LOW]` `resumeAudio()` je exportovan iz `audio.js` ali se nikad ne importuje u `main.js`** — Safari koji suspenduje AudioContext na blur/focus neće biti oporavljen. Na mobilnom iOS-u ovo znači da audio može "umreti" tokom sesije.

9. **`[LOW]` Fakezone može da se reposicionira (svake 4s, `window.js:167`) na poziciju koja se preklapa sa zelenim prozorom** — isti problem kao kod golden pozicije, bez overlap-check.

**Bug list:**
- `[CRITICAL]` Blink prozor je klikabilan dok je nevidljiv — polomljena UX konvencija, zbunjuje igrača.
- `[CRITICAL]` `playBlink()`, `playCountdown()`, `playPerfect()` nikad se ne pozivaju — audio dead code, blink nivo bez audio signala.
- `[CRITICAL]` Nivo 10 `all_combined` ne aktivira multi-bag layout — `createBagsForLevel` ne handluje `all_combined` speciality za `simultaneous > 1`.
- `[MEDIUM]` Golden window nema overlap-check sa zelenim prozorom pri spawnu.
- `[MEDIUM]` Direction change na nivou 3 radi sinusoidu umjesto random smjer promjena — mehanika ne radi kako je naznačeno.
- `[MEDIUM]` `isPerfectLevel()` i `renderLivesCanvas()` su dead exports/functions.
- `[LOW]` `resumeAudio()` nikad se ne poziva — iOS AudioContext recovery nije implementovan.

---

### Lela (Engagement): 7/10

**Šta radi dobro:**
- Progresija od 10 nivoa sa jasnom eskalacijom (`windowMs` pada od 800 do 220ms) je solidna krivulja — igrač oseća kako se igra ubrzava.
- Streak sistem (×1.5 na 3, ×2.0 na 6) je vidljiv u HUD-u i na canvasu — motiviše konzistentnost.
- Guncati fakti na level-clear i game-over su autentični i edukativni — brending funkcioniše prirodno, nije nataren.
- Score popups (+NNN floating) daju trenutni "juice" na svaki pogodak.
- Golden window (2× bonus) daje micro-decision moment — čekam ga ili pucam sad?
- Pixel-art Pleurotus pečurka je prepoznatljiva i thematic.
- Share dugme je dostupno odmah na game over — friction-less share flow.
- Daily highscore (top 3) daje razlog za povratak — minimalan ali prisutan retention hook.
- Web Audio je tasteful — ne preteruje, ambient hum daje laboratorijsku atmosferu.

**Šta dosadi:**
- **Sekvencijalni bag layout (1 vreća u centru, menja se)** znači da igrač gleda u isti centar ekrana svaki put. Nema kretanja, nema prostorne varijacije — postaje monotono već od 3. nivoa.
- **Nema vizuelnog signala koji nivo je "teži"** osim loga `NV X/10` u uglu. Igrač ne oseća dramatičan "prelaz" između nivoa — level clear ekran prikazuje samo score i fakt, ali nema ni animacije ni FX koji signalizuju eskalaciju.
- **Perfect bonus** (`missCount === 0`) daje samo flat 2× scorePerHit bonus — za igrača koji je savršeno odigrao nivo, ovo je premalo nagrade. Nema posebne animacije ni zvuka za perfect run.
- **Game over instant-restart** vraća igrača na start screen — nema "best moment replay" ni vizualizacije dostignuća. Igrač koji je stigao do nivoa 8 ne dobija nikakvu satisfakciju pre restarta.
- **Nivo 10 (`all_combined`)** se ne razlikuje vizualno od nivoa 9 jer multi-bag nije aktiviran (Rašin bug #3) — finalni nivo nije climax.
- **Blink mehanika (nivo 6)** bez audio signala (`playBlink` se ne zove) čini nivo frustrirajuće slepim, ne zabavno izazovnim.

**Predlog:**
- Dodaj brief animaciju/flash pri prelasku na novi nivo (npr. `screen: 'level_intro'` sa brojem nivoa i speedom) — 1.5s, pa auto-skip.
- Perfect run treba da ima poseban zvuk i vizualni FX (zlatni rain particle-i po cijelom ekranu).
- Pozovi `playBlink()` na svaki blink toggle u `main.js` game loopu — odmah pravi nivo 6 smislenijim.
- Na game over, prikaži vizualizaciju "dokle si stigao" (npr. progress bar od 10 nivoa) — retention hook.
- Razmotri da svaka vreća ima blagi "ulazak" (slide-in animacija) kad postane aktivna — prostorni feedback koji sada fali.

**Bug list:**
- `[MEDIUM]` Perfect run nema posebnu nagradu (zvuk/FX) — 2× flat bonus nije satisfying za savršenu igru.
- `[LOW]` Nema level transition animacije — prelaz je abrupt.
- `[LOW]` Game over ne daje vizualizaciju progresije (koliko nivoa dostignut).

---

### TOP kritični problemi (CRITICAL — blocker za release)

1. **[CRITICAL] Blink prozor je klikabilan dok je nevidljiv (`render.js` + `window.js`).** Na nivou 6, `globalAlpha = 0.0` ali collision check ne proverava `blinkState`. Igrač pogađa nevidljiv prozor — kvari poverenje u mehaniku. Fix: u `collision.js`, provjeri `timingState.blinkState`; ako je `false`, tretirati zeleni prozor kao miss (ili skipovati zelenu provjeru).

2. **[CRITICAL] `playBlink()`, `playCountdown()`, `playPerfect()` nikad se ne pozivaju iz `main.js`.** Blink nivo (6) nema audio feedback, što ga čini blind guessing umjesto skill-based. Fix: u game loop, kada `timing.window.blinkState` toggluje, pozovi `playBlink()`. Import proširiti u `main.js`.

3. **[CRITICAL] Nivo 10 (`all_combined`) ne aktivira multi-bag layout.** `createBagsForLevel` u `bag.js` proverava samo `multi_bag_2` i `multi_bag_3` za `simultaneous > 1`. `all_combined` speciality nije obrađen. Fix: dodaj `|| sp === 'all_combined'` u uslov za `simultaneous`, i definiši `multiCount` u `CONFIG.LEVELS[9]` za nivo 10.

---

### MEDIUM problemi (oštećuju first impression)

1. **[MEDIUM] Tutorial strelica (↓) ne prati timing bar.** Statična pozicija misleads igrača. Fix: ili strelicu renderovati na canvasu i pratiti `timingState.windowBounds`, ili dodati tekst "gledaj bar ispod" sa indikatorom koji treperi.

2. **[MEDIUM] Level clear auto-advance (3s) nije indikovan.** Fix: dodaj progress bar ispod "Nivo X Završen!" koji se puni 3s, ili countdown tekst "Nastavlja se za 3…".

3. **[MEDIUM] Golden window spawn nema overlap-check sa zelenim prozorom.** Može kreirati vizuelno zbunjujuće preklapanje. Fix: u `window.js` pri postavljanju `this.goldenX`, provjeri da `|goldenX - barX| > windowWidthNorm + 0.07` i resamplovati ako ne valja.

4. **[MEDIUM] Direction change na nivou 3 ne radi.** Nivo 3 koristi sinusoidu, a random direction change logika mijenja `this.direction` koji je irelevantan za sinusoidu. Fix: za `direction_change` speciality, koristiti linearni mod (brisati `usesSinusoid = true` za `direction_change`) ili implementirati sinusoidu sa nasumičnim phase-jump.

5. **[MEDIUM] Perfect bonus nema poseban vizualni/audio signal.** Flat `+scorePerHit*2` bez FX. Fix: pozovi `playPerfect()` u `levelClear()` kad je `missCount === 0`, i dodaj kratki particle efekt (golden rain) na canvasu.

---

### LOW problemi (nice to have)

1. **[LOW] `resumeAudio()` nikad se ne poziva** — iOS AudioContext recovery propušten. Fix: `document.addEventListener('visibilitychange', () => resumeAudio())` u `main.js`.

2. **[LOW] `renderLivesCanvas()` u `render.js` je dead code** (nikad se ne poziva, DOM HUD radi posao). Treba obrisati ili jasno označiti kao fallback.

3. **[LOW] `isPerfectLevel()` u `progression.js` je dead export** — `main.js` direktno provjerava `state.missCount === 0`. Fix: koristiti `isPerfectLevel(state)` u `levelClear()` umjesto direktne provere.

4. **[LOW] Daily highscore reset nije objašnjen na UI-ju.** Fix: dodaj `"Highscore se resetuje svaki dan"` subtitle ispod "Danas" labela.

5. **[LOW] Nema level transition animacije.** Abruptan prelaz iz level-clear menija u igru. Fix: kratki 1.5s "Nivo X počinje!" overlay pre `startLevel()`.

6. **[LOW] Game over ne daje vizualizaciju progresije** (koje nivoe je igrač prošao). Fix: progress bar 1–10 sa označenim dostignutim nivoom na game over ekranu.

7. **[LOW] Fakezone reposition (svake 4s) nema overlap-check** sa zelenim prozorom. Fix: isti pattern kao za golden window — resamplovati ako se preklapa.

---

### Napomena o scope-u

Igra je complexity-2/5 i prvih 5 minuta (nivoi 1-4) rade bez frustracije. Problemi eskaliraju od nivoa 6 nadalje. Tri CRITICAL buga su koncentrisana na naprednim nivoima i na audio dead code. Ako se poprave, igra je puštiva za casual audience koji igra samo prve 3-4 nivoa. Za full-game experience (do nivoa 10), sva tri CRITICAL su blokeri.
