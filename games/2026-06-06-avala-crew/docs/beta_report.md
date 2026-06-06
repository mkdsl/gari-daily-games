# Beta Report — Avala Crew
**Beta Trio (Zora Zona / Raša Raštura / Lela Loop)**
**Datum:** 2026-06-06 | **Iteracija:** 1

---

## Ukupna ocena: 7.8/10

Igra je funkcionalna, sadržajno bogata i autentično brendirana. Svih 27 modula je prisutno i logički integrisano. Nema crash bugova ni blank screena. Jedan CRITICAL flow bug, dva MEDIUM UX problema, više LOW napomena.

---

## Verifikacija po perspektivi

### Zora Zona — UX & First-Impression

**Intro ekran (first second):**
Igrač vidi `AVALA CREW / festival crew builder`, opis igre u 3 linije, badge `🎉 20. jun 2026 — Kluboslavija na Avali` i dugme `⚡ Sastavi ekipu!`. Ako postoji save, prikazuje se `Nastavi igru: X noći, Y XP`. Veoma čist first-impression. Jedini minus: nema kratke instrukcije šta je "Night Score" ili šta znači "Aftermath" — novi igrač ulazi u roster bez ikakvog onboarding-a.

**Roster — sinergija panel:**
- Aktivne sinergije se prikazuju sa `✨ Aktivne` sekcijom i opisom — OK.
- "Blizu sinergija" panel postoji (do 3, sa `Fali: [member]`) — OK.
- "Sve sinergije ▼" `<details>` element postoji — OK.
- "Good Fit" indikator: `crew-slot--good-fit` klasa + `good-fit-badge` sa `✓` + `title="Prirodna uloga +10%"` — postoji, ali je dosta tiho. Vizuelno razlikovanje dobrih od loših fita je samo border klasa — nema izražene poruke korisniku.
- "Coming soon" Tonović karta: postoji sa `coming-soon-badge` (SOON), `clubs-badge` (🎵 Kluboslavija) i opisom — OK.
- Disabled dugme za start noći: korektno prikazuje koliko članova fali (`Odaberi još X članova`) i ima `disabled` atribut — OK.

**Tutorial/onboarding za roster:**
Nema. Ne postoji nikakav tooltip koji objašnjava šta su uloge, šta znači E/S/P/L stat, niti šta je aftermath. Ovo je MEDIUM problem za first-time igrača.

**Loading screen:**
Postoji `#loading-screen` sa `AVALA CREW...` tekstom. Nestaje 200ms posle DOMContentLoaded (350ms fade). Solidno. Meta tagovi su kompletni (viewport, theme-color, OG, Apple PWA).

---

### Raša Raštura — Tech & Destruktivno

**`updateBonds()` — pairKey kreiranje:**
`makePairKey(id1, id2)` koristi `[id1, id2].sort().join('_')`. Svi member ID-jevi su jednočlane reči bez underscore (`maja`, `dragan`, `ana` itd.) — nema ID kolizije. Pair key je deterministički i sortiran — OK.

**Locked member protection u `updateBonds()`:**
Funkcija prima `crew` (aktivna ekipa) i gradi parove samo od stvarno prisutnih članova. Nema posebne provere za locked/unlocked status — ali to nije potrebno jer se locked member nikad ne može dodati u `activeCrew` (toggle funkcija proverava `unlockedMembers`). Logika je implicitno ispravna, ali nema eksplicitnog defensive check-a — LOW rizik.

**`selectNightScenarios()` — Mulberry32 seed:**
Implementacija je ispravna: `hashString(seedString)` → `createRng(seed)` → Fisher-Yates shuffle. Seed je deterministički baziran na `date + careerTier + nightNumber`. R04 guarantee je eksplicitno: `selected.push('R04')` pre nasumičnog odabira iz ostatka departure pool-a — OK.

**Unique validacija scenarija:**
`const unique = [...new Set(selected)]` — edge case: ako gathering pool nema dovoljno scenarija određenog tipa, selekcija pada na `shuffledGathering[0]` fallback. Nije crash, ali može dati manje od 10 unikatnih scenarija u degenerate slučaju — LOW rizik.

**`crewMember.js` — `getContribution()` i `applyPassive()`:**
`getContribution()` — ispravno tretira `X` tip (average svih statova) i primenjuje `ROLE_MODIFIERS` + `GOOD_FIT_BONUS`. Svi trigger-i (`'scenario_resolve'`, `'always'`) se korektno proveravaju u `main.js` tokom `resolveCurrentScenario`. `applyPassive()` delegira na `passiveTrait.apply()` — logika je u `crew_data.js`, ne u `crewMember.js`, što je ispravno.

**`state.js` — `createState()` i `loadState()`:**
State shape je kompletna — sve session i career varijable su prisutne. `loadState()` sanitizuje: proverava `version !== STATE_VERSION` → null; koristi `{ ...fresh, ...parsed }` merge koji dodaje nova polja ako ih save nema. Dobar defensive pattern. Jedna napomena: `loadState()` nema proveru za koruptovane `activeCrew` membere (koji nisu u `unlockedMembers`). Nije crash jer `getMemberById` vraća `null` i `crew-slot` preskače `null` member, ali UI može pokazati prazne slotove.

**CRITICAL — `bojanAutoWin` state flag nikada se ne čisti:**
U `useAbility('bojan')`, kada je scenario tipa `P`, postavlja se `state.bojanAutoWin = true`. Međutim, `bojanAutoWin` se ne proverava ni u `resolveScenario()` (u `resolution.js`) ni nigde drugde u `main.js` tokom resolution flow-a. Zastavica se postavlja ali nema efekta — Bojanova ability **ne radi**. Ovo je broken feature za branded member. Severity: **CRITICAL** (sposobnost je opisana kao "Dance scenario = auto WIN" ali se nišla ne dešava).

**Još jedan potencijalni CRITICAL — `selectChoice` ne resetuje `_pendingChoiceKey`:**
`_pendingChoiceKey` se postavlja na `choiceKey` ali se nigde ne konsumuje u `resolveCurrentScenario`. Temp deltas se odmah primenjuju (u `selectChoice`), ali `_pendingChoiceKey` ostaje zauvek. Nije crash, ali je vestigijalni state koji može imati neželjene efekte u edge case-ovima — LOW, ne CRITICAL (stat deltas rade, samo variable ostaje dirty).

---

### Lela Loop — Engagement & Retention

**Outro — "šta-bi-bilo-da" panel:**
`renderWhatIfPanel()` postoji i generiše predlog baziran na failed scenarijima. Specifično: traži starter member van ekipe sa najvišim relevantnim statom i kaže npr. `"Da je Dragan bio u ekipi, scenario 'Ko vozi?' mogao je da se završi drugačije — ima 🗺 L: 4."` Ako ima 3+ failova, daje generičku poruku o sinergijama. Autentičan rekrutacioni hook — OK.

**Share hook specifičnost:**
Share karta uključuje 5 crew pills (emoji + ime + uloga), Night Score u boji outcome-a, outcome label, `Noć X` broj, `#AvalaCrew` header, `Kluboslavija · 20. jun 2026`, i `bilet.rs/show/261` CTA na share kartici. Text share sadrži score i outcome. Specifično i share-ready — OK.

**Ticketing CTA:**
Vidljiv u outro sekciji: `🎟️ Avala 20. jun — Karte` dugme sa linkom na `TICKETING_URL` (config vrednost). I na share kartici (canvas) je `bilet.rs/show/261` direktno ucrtan. Double CTA coverage — dobro.

**"Sledeća noć" flow:**
Dugme `🌙 Sledeća noć` postoji u outro footer-u sa `data-action="next-night"`. `nextNight` handler poziva `resetNightSession(state)` i ide na roster sa aktivnom ekvipom. Replay loop je jasan i brz — OK.

**Prvih 5 scenarija — autentičnost:**
- S01 "Ko vozi?" — festivalski problem sa Uberom i organizacijom, autentičan dijalog.
- S02 "Kapija i lista" — VIP pristup, Ana kao connector, specifičan.
- S03 "Gde smo tačno?" — Avala bez signala, Lena kao home turf ekspert, autentičan.
- S04 "Prva runda" — gužva za barom, Maja kao hype osoba, autentičan.
- S05 "Stari drug koji kompliciuje" — socijalna dinamika grupe, Pedja/Ana interakcija, autentičan.

Svi imaju `winText`, `partialText` i `failText` — OK. Tekstovi su tečni na srpskom, festivalski i duhoviti.

**Aftermath bar (3 ikone, tooltipovi):**
Aftermath bar renderuje do 3 ikone sa `↑`/`↓`/`—` strelicama, stat ikonom, i brojem preostalih scenarija. Tooltip (css hover) postoji (`aftermath-tooltip`). Vizuelno zadovoljava outcome feedback loop — OK.

**Ability buttons:**
Prikazuju emoji + ime ability + status (`1× po noći` ili `(potrošeno)`) i `disabled` atribut kad su spent. Vizuelno jasno. Zadovoljavajući feel.

**Resolution overlay:**
`showResolutionResult()` kreira overlay sa outcome badge-om (`WIN! 🎉`, `PARTIAL 👍`, `FAIL 💀`), score dobijen, narativni tekst scenario-a, passive/ability/synergy bonuse, aftermath label, i `Nastavljamo →` dugme. Dobro strukturisan feedback moment.

---

## CRITICAL bugovi

### [CRITICAL-01] Bojanova ability `bojanAutoWin` nema efekta

**Lokacija:** `src/main.js:551` (useAbility 'bojan' case), `src/systems/resolution.js`

**Opis:** Kada igrač koristi Bojanovu ability na P-type scenariju, postavlja se `state.bojanAutoWin = true`. Međutim, `resolveScenario()` u `resolution.js` prima samo `(crew, scenario, aftermathStack, appliedAbilities, synergyObjects, opts)` i nigde ne proverava `state.bojanAutoWin`. Flag se ne konsumuje — ability ne radi. Igrač dobija poruku ali nema mehaničku promenu outcome-a.

**Reprodukcija:** Dodaj Bojana u ekipu, na P-type scenariju klikni ability, pa klikni "Rešavamo!" — outcome je normalan (nije auto WIN).

**Fix:** U `main.js` funkciji `resolveCurrentScenario()`, pre poziva `resolveScenario()`, proveriti `state.bojanAutoWin` i ako je true a `_currentScenario.type === 'P'`, direktno setovati `result.outcome = 'win'` i izračunati scoreGained kao `_currentScenario.baseScore`. Ili proslediti `bojanAutoWin` flag kroz `opts` parametar u `resolveScenario()`.

---

## MEDIUM problemi

### [MEDIUM-01] Nema onboarding/tutorial za nove igrače

**Perspektiva:** Zora

**Opis:** Igrač koji prvi put igra nema nikakvo objašnjenje za:
- Šta znači E/S/P/L stat (Energija/Socijalnost/Prisutnost/Logistika nisu objašnjeni nigde na ekranu)
- Šta je "Aftermath" i kako utiče na igru
- Šta su uloge i koje daju bonus
- Šta je Night Score i kako se računa

Cursor/hover title tagovi postoje na nekim elementima (`title="${member.flavorText}"`, `title="Prirodna uloga +10%"`), ali nisu dovoljni na mobilnom uređaju (bez hovered state).

**Fix:** Dodati kratke inline labels pored stat ikonika na crew karticama (makar u tooltip-u koji se vidi na tap). Dodati jedan-dva reda "Kako se igra?" na intro ekranu iznad Start dugmeta.

### [MEDIUM-02] `good-fit-badge` vizuelno nije dovoljno naglašen

**Perspektiva:** Zora

**Opis:** Kada je member u prirodnoj ulozi (`isPrimaryRole === true`), slot dobija `crew-slot--good-fit` CSS klasu i mali `✓` badge. Bonus (+10%) je samo u `title` atributu koji na mobilnom nije vidljiv. Igrač ne shvata zašto je bitan ovaj "zvezdica" simbol u dropdown-u (`★` pored primarne uloge u `<option>`).

**Fix:** Dodati kratak tekstualni label ispod role dropdown-a kad je primary role selektovan: npr. `"★ Prirodna uloga (+10%)"` u zelenom, ne samo u title-u. Alternativno, toast poruka pri selekciji primarne uloge već postoji (`changeRole` u main.js) — ali samo pri promeni, ne pri inicijalnom load-u.

---

## LOW napomene

### [LOW-01] Unused import `renderIntroScreen` iz `render.js`

`src/main.js` importuje `renderIntroScreen` iz `./render.js` ali koristi lokalnu `renderIntroHTML()` funkciju. Ne uzrokuje crash ali je zbunjujući mrtvi import. Ukloniti.

### [LOW-02] `getBondsForMember` split po `_` — implicitna pretpostavka

`getBondsForMember` u `progression.js` deli pairKey po `_` da izvuče `otherId`. Ovo funkcioniše jer su svi sadašnji ID-jevi jednostruke reči. Ali ako se ikad doda member sa underscore u ID-u (npr. `dance_captain` kao ID, ne kao role), split će biti pogrešan. Komentarisati ovu pretpostavku u kodu ili koristiti indexOf/slice pristup.

### [LOW-03] `_pendingChoiceKey` nikad se ne resetuje

`selectChoice()` postavlja `_pendingChoiceKey` ali se ova varijabla nikad ne konsumuje ni resetuje. Stat deltas su već primenjeni direktno, pa izbor "radi" mehanički, ali varijabla ostaje dirty između scenarija. Ukloniti ili implementirati konzumpciju.

### [LOW-04] `applyCareerPrestigeReset` u `state.js` ne resetuje `unlockedMembers` pravilno

Kada se pozove prestige reset, `unlockedMembers` se resetuje na `['maja', 'dragan', 'ana', 'bojan', 'lena', 'pedja']` (default vrednost iz `createState()`). Zatim se Guncati dodaje ako je `prestigeLevel >= 1`. Međutim, ako je igrač pre prestige-a već otključao npr. Mirka i Tanju, oni se gube bez objašnjenja. Ovo može biti dizajn-intentional (prestige = reset), ali bi trebalo ili eksplicitno dokumentovati u UI (prestige prompt koji kaže "gubi se napredak") ili preservovati unlock list.

### [LOW-05] Phase timeline end index — off-by-one u `renderPhaseTimeline`

`gathering` phase je definisan sa `start: 0, end: 2` (3 scenarija), ali `isDone` uslov je `scenarioIndex >= 3`. Za `peak`, `isDone` je `scenarioIndex >= 7`. Ovo je ispravno za 0-based index. Međutim, `scenariosInPhase = phase.end - phase.start + 1` (= 3 za gathering) i `relativeIndex = scenarioIndex - phase.start` — progress za scenario 2 (poslednji u gathering) biće `(2/3)*100 = 67%`, ne 100%. Gathering bar nikad ne doseže 100% dok je gathering aktivan — doseže 100% tek kad se phase promeni. Vizuelno nešto zbunjujuće (bar nikad nije pun pre kraja faze).

---

## Branded utility ocena

**Autentičnost Avala hype hook-a: 8.5/10**

Igra je direktno brendirana Kluboslavija eventom na Avali 20. juna. Svaki scenario je smešten u realistični festival kontekst (transport, kapija, bar, photo, social dinamika). Crew member-i imaju ime i likove koji odgovaraju festivalskoj kulturi. Share karta sadrži `#AvalaCrew`, datum, `bilet.rs/show/261` CTA i Kluboslavija branding — sve u jednom grafičkom elementu koji se lako deli na Instagramu/WhatsApp-u.

Jako: scenario narativ je specifičan za srpski festival kontekst (nije generički). Prestige member "Guncati Lokalni" direktno spaja oba brenda. Tonović "coming soon" je dobar hook za continuity.

Slabija tačka: share card-u nedostaje `play_url` u tekstu share-a (postoji u `PLAY_URL` config-u i koristi se u URL fallback share-u, ali nije vizuelno na canvas kartici). Malo feedback loop između igre i stvarnog purchase namere — CTA postoji ali je bez urgency-a (nema countdown do 20. juna).

**Zaključak:** Igra može da ide u polish. CRITICAL-01 (Bojan ability) mora biti fixed pre release-a. MEDIUM-01 (onboarding) preporučljivo fix. Ostatak je nice-to-have.
