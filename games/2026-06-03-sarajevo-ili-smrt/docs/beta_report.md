# Beta Report — Sarajevo ili Smrt — Iter 1

**Datum:** 2026-06-03
**Beta Trio:** Zora (UX) + Raša (Tech) + Lela (Engagement)
**Metod:** Source code review + simulirani first-impression (static analysis)

---

## Raša Tech Review

### CRITICAL bugovi

- **[CRITICAL] Session end result screen NIKAD nije vidljiv.**
  `src/systems/session.js` `endSession()` (linija 336) postavlja `state.current_screen = 'macro'` direktno — u istom frame-u. `_renderFrame()` u `main.js` provjerava `state.current_screen === 'session'` prije pozivanja `render()`, pa `_drawSessionEnd()` (koji crta "NOĆ ZAVRŠENA"/"IZBAČEN" overlay) nikad ne dobija šansu da se nacrta. `updateHUD()` odmah nakon toga detektuje promenu screena i zove `showScreen('macro')` koji skriva canvas. Igrač ne vidi rezultat — nema LP prikaza, nema "Klikni za nastavak", samo instant transition nazad na macro mapu.

- **[CRITICAL] `_postSessionProcessing()` se nikad ne poziva.**
  Ona se pokreće *isključivo* kroz `dismiss_session` action koji zahtijeva klik na canvas. Ali canvas je `display:none` čim session završi (vidi prethodni bug). Kaskadna posljedica: reputation gain/loss se ne primjenjuje, achievement checks se ne rade, daily challenge completion se ne logguje, night counter se ne inkrementira, unlock notifikacije se ne prikazuju, win condition (Avala Headliner) se nikad ne triggeruje. LP jeste dodat u `endSession` (line 324-327), ali sve ostalo od napretka je mrtvo.

- **[CRITICAL] `modal-box` CSS klasa ne postoji ni u jednom `.css` fajlu.**
  `src/ui.js` `_buildDOM()` koristi `class="modal-box upgrade-modal"` i `class="modal-box"` za upgrade modal i prestige confirm modal. `styles/ui.css` definuje samo `.modal-content`, ne `.modal-box`. Upgrade shop i prestige confirm modal renderuju se bez `background-color`, bez `border`, bez `max-height` ograničenja — transparentni kontejner na tamnoj pozadini, ugrid i tekst lebde u vazduhu bez vizuelnog okvira. Funkcionalno je teško koristiti.

### MEDIUM bugovi

- **[MEDIUM] Mnoštvo CSS klasa korišćenih u `ui.js` ne postoje u nijednom `.css` fajlu.**
  Kompletna lista: `.macro-top-bar`, `.macro-bottom-bar`, `.btn-icon`, `.dj-name-input`, `.tutorial-box`, `.screen-content`, `.notification-strip`, `.lp-display`, `.idle-display`, `.dk-display`, `.sep`, `.season-info`, `.win-content`, `.win-body`, `.btn-avala`, `.btn-close`, `.btn-danger`, `.btn-buy`, `.upg-header`, `.upg-name`, `.upg-desc`, `.upg-footer`, `.upg-icon`, `.upg-level`, `.modal-actions`, `.prestige-preview`, `.prestige-preview-box`, `.prestige-columns`, `.dk-earn`, `.dk-shop-grid`.
  Elementi postoje i funkcionišu, ali nemaju stilove — layout će biti neuređen (nema flexbox rasporeda za top bar, nema padding/margin/border za upgrade kartice, nema boja za HUD LP/DK displeje). Vizuelno neprihvatljivo za release.

- **[MEDIUM] `endSession()` može biti pozvan dvaput za Grbavica instant fail.**
  `_tickCrowd()` (koji poziva `endSession(state, true)`) se može izvršiti `tick_count` puta u jednom frameu ako je dt velik (npr. tab recovery). Ako crowd ostane ispod 20 pri tome, petlja može pozvati `endSession` više puta. Drugi poziv prima `sess.failed = true` ali `sess` je već `done`, što `updateSession` sprečava — međutim `state.current_screen` se može resetovati od 'macro' → u naredni `endSession` poziv opet. Nije crash, ali je potencijal za duple LP oduzimanja ili state korupciju.

- **[MEDIUM] `dismiss_session` canvas click handler nepotpun.**
  `ui.js` linija 204: `e.target.id === 'session-canvas' && _state?.active_session?.done` — ovo ne hvata `failed` slučaj, samo `done`. A `_processInputFrame` linija 250 hvata i `done` i `failed`. Nekonzistentnost — ali ionako nevažno dok god je CRITICAL 1 neispravljen.

- **[MEDIUM] `initInput(canvas)` prima null canvas kad se poziva pre `_setupCanvas()`.**
  `main.js` redosled: `initUI(state)` → `let canvas = document.getElementById('session-canvas')` → `_setupCanvas()` → `initInput(canvas)`. Canvas element u DOM-u *postoji* (kreiran u `_buildDOM`), ali nema postavljene dimenzije pre `_setupCanvas()`. `initInput` prima validan canvas element pa touchstart/mousemove handleri su prikačeni ispravno. Nije crash, ali ako `_setupCanvas()` padne (npr. canvas nije u DOM-u), `initInput(null)` ne baca grešku jer sve `canvas.addEventListener` pozive preskačemo tišo. LOW severity u praksi.

### LOW

- **[LOW] Duplikat `#session-canvas` u `index.html` je bespotrebna konfuzija.**
  `index.html` ima `<canvas id="session-canvas">` *van* `#game-root`, ali `_buildDOM()` radi `document.body.innerHTML = ...` koji taj canvas uništava i kreira novi unutar `#game-root`. Ne prave runtime problem, ali zbunjuju pri čitanju koda.

- **[LOW] `CROWD_TICK_MS` importovan u `session.js` ali nikad direktno korišten kao `setTimeout` ili `setInterval`.**
  Ticking se radi kroz dt akumulaciju, što je ispravno. Konstanta je tu za dokumentaciju. Nema buga, ali zbunjuje.

- **[LOW] `isInVibeZone` exportovana i kao re-export i kao privatna funkcija `_isInVibeZone`.**
  Malo redundantno, ali ne prave bug.

---

## Zora UX Review

### CRITICAL

- **[CRITICAL] (vidi Raša CRITICAL 1+2)** — Igrač završi sesiju i NEMA povratne informacije. Nema LP brojke, nema reakcije publike, nema "kako si prošao". Ide direktno na mapu. Ovo je destroyer prvog dojma — igrač ne razumije šta se desilo, da li je prošao ili pao, koliko LP je zaradio.

### MEDIUM

- **[MEDIUM] Start screen: `.dj-name-input` nema stilova — nema border, nema boje, nema padding.**
  Input polje vjerovatno izgleda kao white/native browser default na tamnoj pozadini, ili potpuno nevidljivo. Naziv DJ-a je identity hook — ako vizualno ne radi, engagement se gubi odmah.

- **[MEDIUM] `.tutorial-box` nema stilova.**
  "Kako igrati" upute su plaintext blok bez vizuelnog odvajanja od ostalog sadržaja. Na tamnoj pozadini bez stila lako se previdi.

- **[MEDIUM] Macro mapa: `.macro-top-bar` nema stilova.**
  LP, idle LP/h, DK, dugmad za upgrade i prestige — sve to leži bez layout containera. Elementi će biti prikazani u document flow bez flex/grid poravnanja.

- **[MEDIUM] Touch targets: `.btn-icon` (upgrade ⬆ i prestige ★) nema stilova.**
  Bez CSS ovi su inline-flex elementi bez dimenzija — vjerovatno manji od 44px. GDD zahtijeva 44px min touch target za mobile.

- **[MEDIUM] Grbavica `.kvart-lock-overlay` u `_buildDOM` koristi razlik klasu od CSS.**
  `ui.js` koristi klasu `kvart-lock-overlay`, ali `ui.css` definuje `.kvart-locked-overlay` (sa strelicom u sredini). Klasa se ne poklapa — overlay nema stilove, lokot ikona 🔒 tekst prikazan je bez blur/backdrop efekta.

### LOW

- **[LOW] Win screen: `.win-body` klasa nedostaje u CSS-u.**
  Tekst postoji u `WIN_SCREEN.body` iz `brand_hooks.js`, ali nema `max-width` ni `color` styling — može biti presiroko na desktop-u.

- **[LOW] Offline popup dugme `btn-dismiss-offline` dodaje se addEventListener direktno — nije kroz input.js bus.**
  Ovo znači da se event listener kumulira na svaki `showOfflinePopup()` poziv ako se ikad pozove više puta. Jednom je OK, ali nije konzistentno sa arhitekturom.

---

## Lela Engagement Review

### MEDIUM

- **[MEDIUM] Crowd reactions iz `aforizmi.js` su kvalitetne i specifične, ali NIKAD nisu prikazane.**
  `session.js` ima `sess.reaction_text` i `sess.reaction_timer` u state-u, ali nema koda koji ih POSTAVLJA tokom sesije. `getCrowdReaction()` iz `entities/crowd.js` postoji, ali nije nigdje pozvan u `updateSession()` ili `_tickCrowd()`. Reakcije su napisane od Pera Perioda, vizualno implementirane u `render.js` (`_drawReactionText`), ali se nikad ne triggeruju — `reaction_text` ostaje `null` cijelu sesiju. Potpuna dead feature.

- **[MEDIUM] Slider fizika radi samo na pointer X poziciji — nema inertije ni spring-back.**
  Slider se teleportuje na poziciju prsta, nema momentum. Za wave-chasing mehaniku ovo može biti preoštar osjećaj, ali nije hard blocker.

- **[MEDIUM] Vibe Zone vizualna zona je premala na mobilnom pri prvoj sesiji (A nivo 0).**
  Base half zone = 30 na osi [-100, +100] = 30% ukupne širine. Wave se kreće od -80 do +80. Bez A2 upgrade, zona je tijesna. Za first-time igrača bez konteksta, šansa da slučajno pogodi zone je mala — može frustirati pre nego što razumije mehaniku.

- **[MEDIUM] `SESSION_INTROS` iz `aforizmi.js` definisani ali nigdje korišćeni.**
  Motivacijski tekst pri ulasku u sesiju (npr. "Kafana čeka. Talas nije tvoj prijatelj — tek.") bi dao tonalni kontekst i engagement. Dead feature.

### LOW

- **[LOW] Prestige flavor tekstovi se biraju `Math.random()` svaki render poziv `showPrestigeScreen()`.**
  Svaki put kad igrač otvori prestige screen, tekst se može promijeniti. Nije bug, ali može biti zbunjujuće ako se primijeti.

- **[LOW] Unlock sekvenca (Marijin Dvor → Grbavica) logički korektna, ali vizuelna notifikacija (`.notification-strip`) nema CSS stilova.**
  Notifikacija se prikazuje kao unstyled `div` — potencijal za gotcha "zašto ništa ne piše".

- **[LOW] LP ekonomija je realistična za first session: base 10 LP × vibe/crowd faktori = ~2-6 LP po prvoj sesiji.**
  Ovo je malo i može djelovati sporo u poređenju sa upgrade cijenama (cheapest = 50 LP). 8-10 sesija za prvu nadogradnju je u redu za idle, ali treba biti communicated igraču.

- **[LOW] Daily Challenge: `isDailyCompleted` provjera koristi `localStorage` key koji nije vidljiv u `daily_challenge.js` iz analize.**
  Nije bio u scope analize, ali konzistentnost save key sa `SAVE_KEY` treba verifikovati.

---

## Ukupna Ocena

**beta_score: 4.5 / 10**

### Objašnjenje

Igra ima izuzetno solidan konceptualni temelj — slider vibe mechanic je originalna i jasna, kvartovi imaju autentičan karakterni glas (Pera Periodovi tekstovi su odlični), upgrade tree je balansiran i čitljiv, prestige loop je dobro dizajniran. Arhitektura koda je modularni i organizovana.

Ali **igra nije igriva u trenutnom stanju**. Dva CRITICAL buga zajedno znače:
1. Sesija završi → igrač vidi mapu bez ikakvog feedbacka
2. Reputation/progression/achievements se ne primjenjuju

Ovo znači da igrač ne može napredovati (rep ne raste, unlock sekvenca se ne aktivira), a nema ni vizualnog dopamina (nema rezultat screen, nema LP popup). Igra je funkcionalno zarobljena u prvom screenu.

Dodatno, mali CSS gap (modal-box + ~25 nestilovanih klasa) znači da i kad se main CRITICAL bugovi isprave, macro/upgrade/prestige interfejs će izgledati neuređeno.

### Kritički blokeri (moraju biti fixed pre release)

1. **`endSession()` ne smije mijenjati `current_screen` na 'macro'** — treba ostaviti 'session' i pustiti da canvas prikaže result overlay dok igrač ne klikne. Tek `clearSession()` + `dismiss_session` treba da prebaci na 'macro'.
2. **`_postSessionProcessing()` mora biti pozvan** — ili automatski posle kratkog timeouta (bez dismiss), ili kao dio session render fade-out faze.
3. **`modal-box` CSS klasa** mora biti definisana (ili klasa u `_buildDOM` promijenjena u `modal-content`).

### Šta je dobro

- Slider mechanic je izuzetno čista i razumljiva mehanika
- Per-kvart crowd reactions su specifične i smješne (Baščaršija "Ovako se ne svira. Ovo se živi." je odlično)
- Timer arc vizualizacija na Canvasu je elegantan UX prikaz
- Upgrade tree ima logičnu progression (6 grana, 26 nivoa ukupno, prerequisiti su jasni)
- Prestige preview (što ostaje / što se gubi) odlično communicated reset
- Audio init (one-time pointerdown) je ispravno implementiran za iOS Safari
- Modular architecture (18 fajlova u `/src/`) je čista i proširiva
- Kvart color theming je konzistentan kroz Canvas i CSS

---

**Prioritet fikseva (za Jova):**
1. [CRITICAL] `endSession` + session result screen flow
2. [CRITICAL] `_postSessionProcessing` pozivanje
3. [CRITICAL] `modal-box` CSS
4. [MEDIUM] Missing CSS klase za macro HUD i screen-content wrappere
5. [MEDIUM] Crowd reactions trigger u `_tickCrowd`
6. [MEDIUM] `kvart-lock-overlay` vs `kvart-locked-overlay` class mismatch
