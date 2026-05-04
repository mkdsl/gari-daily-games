## BETA TEST REPORT — Sudnik: Tribunal of Cards

### Ukupna ocena: 7.5/10

---

### Zora (UX): 7/10

**Šta radi:**
- Prva igra je tutorijalni slučaj (krađa / srednji / sredovečni / bez recidiva / sa svedokom) — dobar onboarding podaci, ali nema eksplicitnog teksta koji kaže igraču "ovo je tutorijal, nauči mehaniku".
- Case tagovi (bogatstvo, starost, recidivist, svedok) su jasni i korisni. Vizuelno čitljivi.
- Masa (crvena) i Vlast (plava) su konzistentno razlikovani kroz ceo UI — trake, delta tekst, labele. HUD je čitak.
- Reputation faza jasno pokazuje delta promene i naziv novog presedanta. `renderReputation()` radi dobro.
- Discard flow (selection mode sa toggle + "Potvrdi") je inteligentan ali neobjašnjen — igrač ne zna da klikne kartu za selekciju. Nema tooltip ni hint tekst.
- Balance vaga je semantički zbunjujuća: `+` vrednost = KRIV (desno, crveno), `-` vrednost = SLOBODAN (levo, plavo). Ovo je kontraintuitivno — igrači očekuju da "plus" znači nešto pozitivno za optuženog.

**Šta ne radi:**
- Nema onboarding poruke na prvom slučaju. Igrač ne zna šta znači "odigrati kartu u KRIV vs SLOBODAN zonu" bez čitanja dugmića na kartama.
- Discard mehanika nema UX hint — dugme "Odbaci i Povuci" se klikne i karte postanu selection-mode bez ikakvog feedback teksta koji objašnjava šta da radi sledeće.
- Na draw fazi (caseIndex 0) prikazuje se precedents panel sa "Nema aktivnih presedanata." — nepotreban ekran koji se odmah menja (draw faza traje 50ms), ali igrač može videti trepćući screen-swap. Vizuelni šum.
- `renderDiscardButton` upisuje `btn.textContent = 'Odbaci i Povuci ✓'` sa emoji znakvom — može da se ne prikaže na svim fontovima.

**Bug list:**
- [UX-01] `src/ui.js:403` — discard dugme posle upotrebe ne postavlja `btn.dataset.selecting = 'false'`, pa ako se teorijski pozove ponovo, state može biti pogrešan (branch protection u `onDiscard` to sprečava, ali vizuelna konzistencija nedostaje).
- [UX-02] Nema nikakve poruke kad igrač pritisne PRESUDI bez ijedne odigrane karte (balanceScore = 0). Igra prolazi normalno, što je možda OK mehanički, ali UX je prazan — nema feedback-a da su sve karte "ostavljene".
- [UX-03] Touch target za `btn-free` i `btn-guilty` na kartici je 4px × 2px padding + font-size 0.6rem. Daleko ispod 48px — na mobilnom veoma teško kliknuti tačno. `src/ui.css:335-339`.

---

### Raša (Tehničko): 8/10

**Šta radi:**
- ID konzistencija: svi ID-jevi u `index.html` (`hud`, `hud-masa-bar`, `hud-vlast-bar`, `balance-track`, `zone-free`, `zone-guilty`, `hand-container`, `btn-discard`, `btn-verdict-free`, `btn-verdict-guilty`, `btn-next-case`, `verdict-flash`, `verdict-text`, `reputation-title`, `reputation-deltas`, `precedent-gained`, `gameover-cause`, `gameover-cases`, `gameover-masa`, `gameover-vlast`, `gameover-lamp`, `summary-profile-text`, `summary-cases-total`, `summary-verdicts`, `summary-masa`, `summary-vlast`, `summary-top-crime`, `summary-precedents`, `btn-share`) — svi postoje u `ui.js` i tačno se poklapaju.
- `phaseDrawHandler → phasePlayHandler` tranzicija: postoji `setTimeout(() => transitionTo('play'), 50)` u `main.js:105`. Funkcioniše, ali 50ms je tako kratko da draw faza nema stvarnu svrhu sem render-a stanja. Nije bug, ali je arhitekturalno čudno.
- `phaseReputationHandler` pravilno čeka klik — `btn-next-case` listener se dodaje tek u fazi reputation, i koristi `cloneNode(true)` pattern da ukloni stare listenere (`main.js:261-282`). Solidno.
- `discardAndDraw` (`deck.js:95-107`) i `reshuffleDiscard` (`deck.js:72-85`) pravilno isključuju `playedCards` iz reshufflovanja koristeći `Set` od `playedIds`. Logika je ispravna.
- `checkGameOver` vraća `'none'|'masa'|'vlast'|'both'` — `main.js:271-275` pravilno proverava `!== 'none'`. Ispravno.
- Import lanci su konzistentni. Svi moduli imaju `import { CONFIG } from './config.js'` i nema kružnih zavisnosti.

**Šta puca:**

**[BUG-01] CRITICAL: `discardHand` duplira playedCards u discardPile**
`deck.js:113-125`: `discardHand` dodaje `state.currentCase.playedCards` u `discardPile`. Ali karte koje su odigrane su već uklonjene iz `state.hand` pri odigravanju (`main.js:132`). Međutim, `state.currentCase.playedCards` su kopije originala napravljene operatorom spread (`{ ...card, direction }` na liniji `main.js:135`), pa ID-jevi su isti ali objekti su različiti. Ovo znači da originalna karta sa istim `id` može biti i u `discardPile` od prethodne `reshuffleDiscard` i ponovo dodata iz `playedCards`. Konkretno: ako je `reshuffleDiscard` pozvan tokom draw (deck je prazan), toReshuffle filtrira `playedIds` ispravno, ali posle presude `discardHand` ponovo dodaje te iste id-jeve u `discardPile`. Na sledećem `reshuffleDiscard` isti card.id može ući u deck dvaput — deck se inflatuje, karte se dupliraju. Ovo postaje vidljivo oko slučaja 5-6 kada je deck prošao kroz više ciklusa.

**[BUG-02] MEDIUM: `renderPhase('draw')` skriva HUD na draw fazi**
`ui.js:24`: `hiddenDuringGame = ['gameover', 'summary']`. Draw faza NIJE u ovoj listi, dakle HUD je vidljiv tokom draw faze. Ali draw faza traje 50ms i odmah prelazi u play — ovo je sitnica. Međutim, ako se zbog nekog razloga draw faza produ`ži (spor računar), korisnik vidi delimičan render bez case opisa u HUD-u. Nije blocker, ali treba proveriti da li je to namerno.

**[BUG-03] MEDIUM: `getEffectiveCardValue` ne multiplicira vrednost u `renderPlayedZones`**
`ui.js:313`: `renderPlayedZones` prikazuje `card.value` (originalnu vrednost) za mini prikaz u zonama, ne efektivnu vrednost sa presedant multiplikatorima. Kad je p05 (svedok ×1.5), p06 (zakon ×0.5) ili p10 (karakter ×2) aktivan, vaga traka i `balanceScore` su ispravni (jer `onCardPlay` koristi `getEffectiveCardValue`), ali mini karta u zoni pokazuje pogrešnu vrednost. Igrač vidi netačan broj.

**[BUG-04] LOW: `_precedentCardCounter` je module-level varijabla bez resetovanja**
`precedents.js:115`: `let _precedentCardCounter = 0` se ne resetuje pri restart-u. `onRestart()` poziva `resetState()` i `createState()`, ali ne reimportuje modul. Brojač nastavlja od poslednjeg broja. U praksi ne uzrokuje funkcionalni bug (ID-jevi su i dalje jedinstveni jer uključuju `caseIndex`), ali je konceptualno prljavo.

**[BUG-05] LOW: `calcStrogostCategory` deli sa 10 hardcoded umesto `CONFIG.TOTAL_CASES`**
`profile.js:14`: `const pct = (stats.totalGuilty / 10) * 100` — 10 je hardcoded. Ako se `CONFIG.TOTAL_CASES` ikad promeni, profil kategorije su pogrešne.

**Bug list:**
- [TECH-01] `deck.js:119-124` — `discardHand` duplira played card ID-jeve u discardPile (vidi BUG-01 iznad)
- [TECH-02] `ui.js:313` — `renderPlayedZones` koristi `card.value` ne `getEffectiveCardValue`
- [TECH-03] `profile.js:14` — hardcoded `/ 10` umesto `/ CONFIG.TOTAL_CASES`
- [TECH-04] `precedents.js:115` — `_precedentCardCounter` ne resetuje se pri restart

---

### Lela (Engagement): 8/10

**Šta radi:**
- Card play animacija (`cardPlay` keyframe + `card-played` klasa, 200ms) je brza i jasna. Karta "izleti" iz ruke i nestaje.
- `cardEnter` animacija sa staggered delay (0.05s po karti) daje lepo vizuelno čitanje ruke na početku slučaja.
- Balance vaga pulsira (`balancePulse`/`balancePulseBlue`) na ekstremnim vrednostima — dobro vizuelno upozorenje.
- Verdict flash animacija (scale-in + boja) je klimatična i jasna. 600ms je dobro trajanje.
- Reputation faza pokazuje delta promene sa `deltaPopIn` animacijom. Feedbek je prisutan.
- Typewriter efekat na profilu sudnika (50ms/char) sa trepćućim kursorom je emotivan i prikladan za završni ekran.
- Lampa se gasi na game-over (`lampOff` animacija 1.5s) — detalj koji radi.
- Pacing: 10 slučajeva, svaki sa 3 karte za igru, reputation ekran, → realno 6-9 minuta. Odgovara ciljanom 5-8 minuta.
- Precedent sistem (15 efekata, randomly selected) dodaje replay vrednost — svaka igra se oseća drugačije.

**Šta dosadi:**
- Slučajevi su vizuelno identični — isti template layout bez ikakvog vizuelnog razlikovanja po žanru ili ozbiljnosti zločina. "Ubistvo" i "sitna krađa" izgledaju potpuno isto. Jedina razlika je boja tags-a.
- Nema sound/haptic feedback (razumljivo, audio je opciono). Ali čak ni vizuelna promena pozadine po tipu zločina.
- Finale (caseIndex 9, "pobuna") nije posebno obilježen osim što je uvek "pobuna". Igrač ne dobija signal da je ovo poslednji slučaj pre nego što ga presudi. Nema countdown-a, nema specijalnog naslova.
- Delta animacija u reputation fazi (`deltaPopIn`) se primenjuje na `.delta-item` u `game.css:135`, ali `renderReputation` u `ui.js:562-565` generiše `.delta-row` elemente, NE `.delta-item`. Animacija se ne aktivira.

**Predlog:**
- Dodati vizuelni indikator "POSLEDNJI SLUČAJ" na caseIndex 9 u draw fazi.
- Popraviti class mismatch `.delta-item` vs `.delta-row` da animacija u reputation fazi radi.
- Razlikovati ozbiljnost zločina bojom case headera (npr. "ubistvo" = tamnocrvena pozadina case-header-a).

---

### TOP 3 kritična problema (blocker za release)

1. **[CRITICAL]: Duplikacija karata u deck-u pri reshufflovanju** — `deck.js:119-124`: `discardHand` ubacuje `playedCards` (koji su `{...card, direction}` kopije) u `discardPile` posle svake presude. Ako je ista karta prethodno ušla u `discardPile` kroz `reshuffleDiscard` tokom draw faze, sledećem reshuffle-u ući će dva puta. Deck se inflatuje oko slučaja 5-6, dovodeći do ponavljanja isti karata i pogrešnih krvica. **Fix:** U `discardHand`, filtriraj `playedCards` — dodaj samo one čiji `id` nije već prisutan u `discardPile`.

2. **[MEDIUM]: Touch target za akcione button-e na kartama su premali za mobilni** — `ui.css:335-339`: `.card-actions .btn-guilty, .btn-free` ima `padding: 4px 2px; font-size: 0.6rem`. Efektivna click/tap area je oko 24-28px visine, daleko ispod minimalnih 48px. Na mobilnom, korisnik mora precizno kliknuti, a prsti ometaju prikaz. **Fix:** Povećati padding na minimum `10px 6px` i font-size na `0.72rem`, ili razdvojiti u dva reda.

3. **[MEDIUM]: `renderPlayedZones` prikazuje originalnu vrednost karte, ignoriše presedant multiplikatore** — `ui.js:313` koristi `card.value` umesto efektivne vrednosti. Igrač vidi "+2" u zoni ali je vaga napravila +3 zbog p05 presedanta. Direktna konfuzija. **Fix:** Prosleđivati `state.precedents` u `renderPlayedZones` i koristiti `getEffectiveCardValue(card, precedents)` za `valSpan.textContent`.

### TOP 3 "nice to have" (ako ima vremena)

1. **Animacija `.delta-item` ne radi** — `game.css:135` animira `.delta-item` ali `renderReputation` generiše `.delta-row`. Preimenovati CSS selektor u `.delta-row` da animacija radi.

2. **"POSLEDNJI SLUČAJ" indikator** — Na caseIndex 9 (pobuna), dodati vizuelni signal u draw/play fazi: specijalni naslov, drugačija boja headera, ili kratka poruka "Ovo je vaš poslednji slučaj."

3. **Onboarding tooltip za Discard mehaniku** — Kad `btn-discard` uđe u selection mode, prikazati kratku poruku ispod ruke (ili promeniti label dugmeta u "Kliknite karte za odbacivanje (1-2), pa Potvrdi").
