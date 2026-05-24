# Beta Report — Zvučna Proba
**Datum:** 2026-05-24 | **Tester:** Beta Trio (Zora + Raša + Lela)

## Overall beta_score: 6.2 / 10

---

## Pronađeni problemi

### CRITICAL

**[CRITICAL] Boss 9 — isDouble flag netačan, correction prikazuje samo jedan axis**  
Runda 9 (indeks 8, `bossType: 'trap'`) dobija `EQ_PROBLEMS[7]` (`double_boost`, `filterType: 'double'`, dva correction axisa), ali u `buildRoundData()` flag `isDouble` se postavlja kao `config.bossType === 'double'` — što je `false` za trap. Kao rezultat, `showCorrectionPhase()` u `main.js` ulazi u `else` granu i prikazuje samo **jedan axis** umjesto oba. Igrač ne može ispraviti drugi axis → korekcija je strukturalno neispravna za finalni boss.  
_Lokacija: `src/systems/progression.js` L8–9, `src/main.js` L111–118, `src/content/eq_bank.js` L108 (mapping index 8 → EQ_PROBLEMS[7])_

**[CRITICAL] Dvostruki poziv handlera na mobilnom uređaju (ghost tap)**  
`input.js` `onTap()`: `touchend` poziva `e.preventDefault()` i handler. Međutim, `touchstart` ne poziva `stopPropagation()` niti `preventDefault()`, pa browser i dalje generiše sintetički `click` event ~300ms nakon `touchend`. `click` listener puca jer je `touchStarted` već `false` (resetovan u `touchend`), tako da handler biva pozvan **dva puta**. Na diagnosis fazi ovo znači da se `diagnosisLocked` može zaobići ako se dogodi race između dva poziva — drugi poziv prolazi ako lock nije postavljen u prvom microtask-u.  
_Lokacija: `src/input.js` L13–30_

---

### MEDIUM

**[MEDIUM] consecutiveMisses se ne resetuje pri netačnoj korekciji (streak ostaje broken)**  
U `confirmCorrection()` (`main.js` L158): kad je korekcija netačna, kod radi `state.consecutiveMisses++` i `state.streak = newStreak` (koji je 0 jer `updateStreak(streak, false)` vraća 0). **Ali streak se ne resetuje eksplicitno** — `newStreak` dolazi iz `updateStreak` koji je ispravan. Problem je drugačiji: `handleMiss` (timeout/pogrešna dijagnoza) isto radi `consecutiveMisses++` i `state.streak = 0`, ali **ne resetuje** `state.consecutiveMisses` na 0 ni na jednom mestu između rundi za slučaj "tačna dijagnoza + pogrešna korekcija". Konkretno: 3 uzastopna miss-a triggera game over čak i ako su sva tri bila "tačna dijagnoza, netačna korekcija" — što bi možda trebalo biti drugačije od "netačna dijagnoza ili timeout". Ovo je dizajn pitanje, ali treba odluka.  
_Lokacija: `src/main.js` L155–170 (`confirmCorrection`), L185–210 (`handleMiss`)_

**[MEDIUM] timeBonus uvijek blizu 0 za correction fazu — timer nije restart-ovan**  
`calcRoundScore()` prima `elapsed = performance.now() - state.timerStart`, ali `state.timerStart` je postavljen na početku **diagnosis** faze i nikada se ne resetuje. Dakle, `elapsed` uključuje i vreme slušanja snippeta u verify fazi (3.5s) + celo vreme korekcije. Svaka korekcija koja traje > 2–3s dobija timeBonus od 0, čak i ako je igrač bio brz. Efektivno, timeBonus = 0 za sve korekcije osim instant-tapa.  
_Lokacija: `src/main.js` L136 (`state.timerStart` se ne resetuje pri prelasku na correction), `src/systems/scoring.js` L18–22_

**[MEDIUM] showRoundResult timeout nije cancelovan pri restartu**  
`showRoundResult()` u `ui.js` koristi `setTimeout(callback, 1800)` bez čuvanja ID-a. Ako igrač klikne "Ponovo" tokom round result overlay-a, `restartGame()` poziva `stopTimer()` ali ne canceluje ovaj timeout. Callback iz prethodne sesije poziva `state.round++` i `startRound()` na novom state-u — može pokvariti round count ili triggerat dvojni `startRound`.  
_Lokacija: `src/ui.js` `showRoundResult()` L165–174, `src/main.js` `restartGame()` L62–67_

**[MEDIUM] Boss runde 6 i 9 koriste identičan EQ problem (double_boost)**  
`getProblemForRound()` mapping: `[0, 1, 7, 2, 3, 7, 4, 5, 7, 6]` — indeksi 2, 5, 8 svi pokazuju na `EQ_PROBLEMS[7]`. Boss 6 (`bossType: 'subtle'`, `noTimeBonus`) i Boss 9 (`bossType: 'trap'`) dobijaju isti zvučni problem. Igrač koji pamti rešenje Boss 3 odmah prepoznaje Boss 6 i Boss 9 — nema progresivne težine.  
_Lokacija: `src/content/eq_bank.js` L108_

---

### LOW

**[LOW] iOS Safari AudioContext bez korisničke geste može biti suspended**  
`initAudio()` se poziva u `startGame()` koji je vezan za klik/tap na dugme — to je ispravno. Ali `ensureCtx()` interno poziva `initAudio()` i potom `ctx.resume()`. Ako `ctx.state` ostane `'suspended'` (Safari ponekad zahteva drugu gestu), nema fallback poruke korisniku. Silent fail.  
_Lokacija: `src/audio.js` L14–20, L23–26_

**[LOW] state_ref u updateTimerBar može biti null pri prvom tick-u**  
`updateTimerBar()` u `ui.js` koristi `state_ref?.timerDuration ?? 8000` — optional chaining je tu, fallback na 8000ms postoji. Nije crash, ali label prikazuje pogrešnu vrednost (uvek 8s) tokom rundi 5–10 gde je `timeWindow` 5–6s.  
_Lokacija: `src/ui.js` L76_

**[LOW] GLOSSARY nedostaje unos za 'Mid-bas'**  
`EQ_PROBLEMS[6]` (`muddy_midbass`) ima `glossaryTerms: ['Mid']` — prikazuje generičku Mid definiciju umesto 'Mid-bas'. GLOSSARY objekat nema ključ `'Mid-bas'` (ima `'Sub-bas'`). Korisnik ne dobija relevantno objašnjenje.  
_Lokacija: `src/content/eq_bank.js` L76 i L87_

**[LOW] Typo u EQ diagnosis tekstu**  
`harsh_highs` problem ima `diagnosis: 'Visoke frekvencije su preooštre'` — duplo 'o' u "preooštre". Isto se pojavljuje u `distractors` arraju u `boom_bass`. Vidljivo igraču na ekranu.  
_Lokacija: `src/content/eq_bank.js` L15, L8_

**[LOW] Correction confirm timeout (400ms) može se upaliti tokom restar**  
`correctionConfirmTimeout` se briše u `startRound()` (`clearTimeout`), ali samo ako je promenljiva postavljana. Ako restart dođe između `allSelected` checkova, 400ms setTimeout može pozvati `confirmCorrection` na stari state.  
_Lokacija: `src/main.js` L80–84, L127–132_

---

## First impression (Zora UX)

Start ekran je čist i brzo komunicira šta se radi — "Dijagnostikuj EQ probleme" + "10 rundi · 3 Boss probe · max 3000 bodova" je tačno toliko informacija koliko treba. Dugme "🎚️ Tapni da počneš" odgovara iOS audio policy-u (inicijalizuje AudioContext na gestu).

Međutim, **nema vizuelnog feedbacka o tome šta je 'tačan odgovor'** tokom diagnosis faze — kad klikneš opciju, `selected` klasa se doda, ali nema animacije ni haptike. Na mobilnom, 300ms kašnjenje između tapa i vizuelnog odziva može navesti korisnike da tapnu ponovo — što u kombinaciji sa ghost tap bugom (CRITICAL) može zakljucati igru u pogrešnom stanju.

Timer bar vizualizacija (warn/urgent states) je dobra ideja ali label prikazuje pogrešno vreme za runde kraće od 8s — `state_ref?.timerDuration ?? 8000` fallback uvek pokazuje 8s.

End screen ima sve što treba: stats, rank, highscore preview, share i karte link. Kopija "Sava je zaustavio probu" je odlična.

---

## Tech review (Raša)

Arhitektura je solidna: jasna separacija modula, state kao plain objekat, GameTimer sa RAF loop-om. Web Audio API je korišćen ispravno — filter chain, fade in/out, carrier oscilatori. Nema dependency-ja, pure vanilla JS ES modules.

Glavni problem je **state management pri boss rundi 9** — neusklađenost između `filterType: 'double'` u content-u i `isDouble` flaga koji zavisi od config-a. Ova vrsta implicit coupling između `eq_bank.js` i `config.js` je ticking time bomb za buduće runde.

Timer elapsed logika je broken za scoring — `timerStart` se nikada ne resetuje između diagnosis i correction faze. Svaka korekcija nosi "puni elapsed" što znači time bonus je praktično dead feature za korikciju.

Highscore sistem sa dnevnim reset-om radi ispravno — date key u localStorage je clean approach. `saveHighscore()` pravilno sortira i slice-uje top 3.

`correctionIsCorrect()` sa `tolerance` parametrom je elegantno rešenje, ali `tolerance: 1` znači da je `ok` (0) prihvatljivo za `smanjiti` (-1) i `pojacati` (+1) — igrač uvek može odabrati 'OK' i proći runde 1–5. Verovatno nije intencija.

---

## Engagement (Lela)

Konceptualno sjajno — EQ puzzle kao igra za muzičke fanove je originalno i dobro targetovano za Kluboslavija publiku. Progresija od jednostavnih (Bass/Highs) do boss rundi se oseća kao eskalacija.

Streakovi su prisutni ali gotovo nevidljivi — streak se prikazuje tek od ×2, a SFX bonus (`sfxStreakBonus`) puca od ×3. Igrač može biti u ×5 streaku bez da to primeti vizuelno.

Boss runde imaju potential ali bez varijacije u EQ problemu (sve tri boss runde = isti zvuk), memorabilnost je ograničena. Igrač koji prođe Boss 3 ima besplatan pass za Boss 6 i Boss 9.

Dnevni highscore koji se resetuje u ponoć je dobra retention mehanika — ali nema push notifikacije ili share prompt posle svakog novog rekorda (samo na end ekranu).

Kopija je vrhunska — "Sava je zaustavio probu", "Tonket kaže: dobar zvuk", Avala countdown. Brand serve je jak.

---

## Za šefa

**Ne, igra trenutno nije Kluboslavija-worthy za publish.** Ocena 6.2/10.

Dva CRITICAL buga blokiraju pravo iskustvo: ghost tap na mobilnom može slučajno zaključati igru u pogrešnoj fazi, a Boss 9 (finalna proba!) prikazuje samo jedan correction axis za dvostruki problem — igrač ne može pobediti fair. Pored toga, time bonus je dead feature zbog pogrešnog elapsed merenja, i sve tri boss runde zvuče identično.

**Preporuka: fix first.** Potrebno je: (1) zakrpiti `isDouble` flag za trap boss, (2) dodati `stopPropagation` u `onTap` touchend, (3) resetovati `timerStart` pri prelasku na correction fazu, (4) cancelovati round result timeout u `restartGame`. Ove četiri izmene podigli bi igru na 8.0+ i otvorili put za publish.
