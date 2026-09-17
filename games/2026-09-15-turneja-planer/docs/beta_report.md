# Beta Report — Turneja Planer
**Datum:** 2026-09-16
**Iteracija:** 1
**Beta Trio:** Zora (UX) · Raša (tech) · Lela (engagement)

---

## Beta Score: 5.0/10

Igra se učitava, navigacija radi, audio je prisutan, kartice se okreću, prestige loop postoji. Ali ekonomija je strukturno slomljena na dva nezavisna mesta — budžet se samo smanjuje i nikad ne raste, a putni troškovi su prikazani ali nikad oduzeti. Oba su CRITICAL. Bez fixa, igra je neigriva kao dizajniran izazov (pobedni ending TURNEJA_LEGENDA je praktično nedostižan u normalnom playu).

---

## CRITICAL bugovi

### C1 — Prihod od ulaznica nikad nije dodat u budžet
**Fajl:linija:** `src/main.js:238–308` (`computeCityResults`)
**Opis:** Funkcija računa `attendance` (linija 246), `cq`, `rep_gain`, `new_reach` — ali nikad ne dodaje prihod od ulaznica u `state.resources.budget`. GDD specificira `revenue = attendance × 8 EUR × promo_multiplier`. Grep po celom `src/` za `revenue`, `ticket`, i `attendance.*budget` — nula rezultata. `finalState` (linija 296–308) ažurira samo `reputation` i `reach`; `budget` samo opada. Sa startnim budžetom €3500 i 5 gradova, svaki grad oduzima crew_cost (npr. €300–600) + split (0–€3000), a ništa se ne vraća. TURNEJA_LEGENDA zahteva `budget > 2000` na kraju — nedostižno u normalnom playu.
**Fix:** U `computeCityResults`, pre `finalState`, izračunaj `revenue = Math.round(attendance * TICKET_PRICE_EUR * promoMult(split.promo))` i dodaj u `newState.resources.budget`. Dodaj `TICKET_PRICE_EUR = 8` u `config.js`.

---

### C2 — Putni troškovi prikazani ali nikad oduzeti
**Fajl:linija:** `src/render.js:90` (routing screen), `src/main.js:62–64` (`on('route_selected')`)
**Opis:** Routing screen prikazuje "Putni troškovi: €X" (npr. €1150 za najskuplju rutu) i header "Budžet za put: €3500". Igrač bira rutu delom na osnovu ovog troška. Ali `on('route_selected')` handler (main.js:62) samo postavlja `route` i prelazi na `crew_select` — nula oduzimanja. `doTransit()` (main.js:312–330) ne oduzima ništa. `TRAVEL_COSTS` u `config.js` i `calcRouteCost`/`getTravelCost` u `routing.js` koriste se samo za display u `getTopRoutes`, nikad za mutaciju `state.resources.budget`. Direktna posledica: `logistics` skill efekat `travel_cost_mult: -0.10` (config.js:123) je mrtav kod — nema troška koji bi smanjio. Routing optimizer je čisto kozmetički.
**Fix:** U `on('route_selected')`, odmah oduzmi `calcRouteCost(route)` od `state.resources.budget` pre prelaska na `crew_select`.

---

## MEDIUM bugovi

### M1 — Budget UI pokazuje pun budžet, ne uzima u obzir crew_cost
**Fajl:linija:** `src/render.js:170` (`renderCityBudget`), `src/main.js:160–164` (`startCityEvent`)
**Opis:** `renderCityBudget` postavlja `available = state.resources.budget` (pun budžet). Slajderi su cappovani na `Math.min(500/1000/1500, available)` i "Dostupno" prikazuje pun budžet. Ali `startCityEvent` oduzima I `crew_cost` I `splitTotal` (linija 161–164). Igrač može popuniti sve slajdere do limita, biti uveren da ima para, a onda ući u negativan budžet jer je crew_cost oduzet povrh svega. Postoji napomena "Crew: €X/dan (automatski oduzeto)" (render.js:211) ali "Dostupno" i logika slajdera je i dalje misleading. Primer: budget €600, crew €350, igrač stavi promo €600 → budget = 600 − 350 − 600 = −350.
**Fix:** `const available = state.resources.budget - totalDailyRate(crew)` i prikazati tu vrednost u "Dostupno" i kao max za slider budget logic.

---

### M2 — Guncati gate provjera se dešava NAKON što igrač odigra ceo Guncati event
**Fajl:linija:** `src/main.js:123–127` (`on('go_ending')`), `src/content/endings.js:91`, `src/systems/progression.js:87–95` (`checkGuncatiGate`)
**Opis:** `checkGuncatiGate` je importovan u main.js (linija 14) ali se nikad ne poziva u game flowu. Gate check se dešava jedino u `evaluateEnding(state.resources)` — POSLE igrač odigra ceo Guncati event (budget alloc, 4 kartice, results screen). Ending narativ kaže "Stigli ste pred Guncati. Ali organizatori su proverili tvoje reference. Reputacija ispod 6 — ulaz odbijen." — što implicira da su odbijeni PRE ulaska. U realnosti, igrač potroši €300–1000 na Guncati (crew + slajderi + kartice), vidi results screen s atendansom i CQ, pa tek onda pri kliku "Pogledaj završetak" dobije GUNCATI_ZATVOREN. Budžet je već potrošen.
**Fix:** U `doTransit()` ili u `on('city_arrived')`, kad je `next_city_index === route.length - 1` (tj. sledeći grad je Guncati), pozovi `checkGuncatiGate(state.resources.reputation)` — ako gate ne prolazi, preskoci `city_budget` screen i idi direktno na `ending` sa `GUNCATI_ZATVOREN`.

---

## LOW bugovi / poboljšanja

### L1 — Dead code u `evaluateEnding`, linija 95
**Fajl:linija:** `src/content/endings.js:95`
**Opis:** Linija `if (state.budget > 500 && state.reach >= 40) return 'ZAVRSENO_I_PLACENO'` je nedostižna. Do linije 95 stigneš samo ako: rep >= 6 (linija 91 prošla), NOT legenda (linija 92 prošla), NOT (budget > 500 AND rep >= 6) (linija 93 prošla). Treći uslov znači `budget <= 500` (jer rep >= 6 je već tačno). Na liniji 95 uslov traži `budget > 500` — kontradikcija, nikad true.
**Fix:** Izbriši liniju 95.

---

### L2 — `logistics` skill `travel_cost_mult` efekat je mrtav kod
**Fajl:linija:** `src/config.js:123`, `src/entities/crew_member.js` (skills), `src/systems/routing.js`
**Opis:** `SKILL_EFFECTS.logistics.travel_cost_mult: -0.10` postoji u config, ali nigde u kodu se ne primenjuje na putne troškove (koji ionako nisu oduzeti — vidi C2). Čak i posle fixa C2, `travel_cost_mult` treba primeniti u `calcRouteCost` ili `doTransit`.
**Fix:** Posle fixa C2 (putni troškovi se oduzimaju), u `on('route_selected')` handler, primeni `travel_cost_mult` iz crew skill-ova pre oduzimanja.

---

### L3 — `city_result.budget_delta` ne reflektuje ukupni trošak
**Fajl:linija:** `src/main.js:293`
**Opis:** `budget_delta: -(totalDailyRate(crew) + splitTotal(split))` — ne uključuje putni trošak (C2 fix) niti eventualni revenue (C1 fix). Results screen prikazuje ovo pod "Budžet promene" što je nepotpuno.
**Fix:** Posle fixa C1 i C2, rekalkuliši `budget_delta` da uključi sve komponente (travel, crew, split, revenue).

---

## Zora — First Impression (prvih 5 min)

Menu screen je čist, estetika radi. "Nova turneja" → Routing screen: lepo prikazuje 3 rute sa troškovima i emoji mapom gradova — vizuelno jasno, igrač odmah razume šta bira.

Crew select: grid sa skills i daily rate je čitljiv. "Dnevni trošak: €X · Ukupno (5 gradova): €Y" je koristan summary — ali Y je crew_cost × 5, ne uzima u obzir slajder spend ni travel. Nije bug, ali nije kompletna slika.

Budget screen: "Dostupno: €3500" i tri slajdera — OK na prvu, ali nije jasno da će crew biti DODATNO oduzet. Napomena "Crew: €X/dan (automatski oduzeto)" postoji ali vizuelno slaba — small text ispod slajdera, lako se previdi. Igrač koji ne čita napomenu može nesvesno ući u negativan budžet.

Card flip mehanizam: dobar, flip animacija radi, opcije A/B/C su jasne. Prvih 5 minuta su funkcionalne — igra se ne crashi, flow je logičan.

Negativno: nema vizuelnog feedback-a kad budžet padne ispod nule (HUD ne menja boju, nema upozorenja). Igrač može nastaviti igru u negativnom budžetu bez ikakve alarme.

---

## Raša — Tehnički nalaz

**Nema JS crash-ova** vidljivih u statičkoj analizi. Import graph je konzistentan, ES6 moduli su ispravno linkovi. `CARD_MAP`, `CITY_MAP`, `CREW_MAP` su svi Map objekti, null checks postoje (`?.`). `applyResourceDelta` na više mesta — treba proveriti da li cap-uje budget na 0 ili dozvoljava negativne vrednosti.

**C1 verifikacija:** Grep po `src/` za `revenue|ticket|attendance.*budget` → 0 rezultata. `computeCityResults` (main.js:238–308) završava sa `finalState` koji menja samo `reputation` i `reach` u resources. `budget` nije dodirnuta pozitivno nigde u celom fajlu osim card efektima (neki `budget: +200` na kartici L02).

**C2 verifikacija:** `calcRouteCost` pozivana jedino u `routing.js:51` (`getTopRoutes`). `getTravelCost` definisana u routing.js:89 ali nigde se ne import-uje niti koristi van routing.js. `on('route_selected')` handler: `setState({ ...state, route, city_index: 0, screen: 'crew_select' })` — nema budget mutacije.

**M2 verifikacija:** `checkGuncatiGate` importovan u main.js:14, ali `grep -n "checkGuncatiGate"` u main.js vraca samo import — nikad poziv. Funkcija postoji u progression.js:87–95 i radi ispravno, samo nije ukačena u flow.

**M1 verifikacija:** `budget_slider` handler (main.js:87–96) clamp-uje na `state.resources.budget`, ne na `state.resources.budget - crew_cost`. Slider max values u renderSlider (render.js:197–199) koriste `available` = pun budžet.

**Potencijalni crash edge case:** Ako `state.route` je prazno i `renderCityBudget` se pozove, `CITY_MAP.get(undefined)` → `undefined`, pa `city.color` → TypeError. Malo verovatno u normalnom flowu, ali `route_selected` bi trebalo validirati non-empty route pre setState.

**Prestige flow:** `performPrestige` + `resetForPrestige` izgleda ispravno. `createPrestigeState` inicijalizuje `fan_db` i `level`. `PRESTIGE_RESET` vrednosti (config.js:98–103) su razumne.

---

## Lela — Engagement

**Prvih 15 minuta:** Ako igrač ne primeti ekonomski bug, igra je pleasant — routing decision, crew building, card drama su dobri loop-ovi. 40 kartica kroz 5 gradova × 4 karte = 20 kartica po runu, znači 50% raznolikosti po run-u. OK za replay.

**Ekonomska tragedija:** Bez revenue, praktično svaka igra završava u POREZ_I_DUG (budget ≤ 0) ili ZAVRSENO (500 < budget ≤ 2000). TURNEJA_LEGENDA zahteva budget > 2000 na kraju — sa startnim €3500 i 5 gradova troška bez ikakve zarade, to je matematički nemoguće osim ako igrač ne potroši NIŠTA na slajdere (ni transport, ni promo, ni tech) i uzme minimum crew. Čak i tada: minimum crew 2 osobe × €150/dan × 5 gradova = €1500, budget ide na €2000. Ali tada CQ pati, reach ne raste, Guncati gate je na granici. LEGENDA ending je locked bez fixa C1.

**Guncati gate frustration:** Igrač koji je proveo 20 min na turneji i skupio rep ≥ 6.0 ali ne zna da gate se proverava tek na kraju — proba Guncati event, potroši još para, vidi results, klikne "Pogledaj završetak" i dobije "Guncati zatvoren". Kod igrača koji JESU prošli gate, ovo nije problem. Ali za igrača koji nije — iskustvo je zbunjujuće: nastup se desio, publika je bila tu, a sad kažu da nisi smeo ući.

**Replay motivacija:** Prestige sistem postoji i funkcionalno (fan_db, prestige_label, promo_eff_bonus). Dobro. Međutim, ako prva dva runa završe kao POREZ_I_DUG zbog C1, motivacija za prestige je niska. Fix C1 direktno popravlja retention.

**Pozitivno:** Karte su dobro napisane, ima narativne tenzije (DJ traži raise, Ana burnout, granični incident). 4 ending-a daju raznovrsnost. Audio feedback radi (card flip, crowd cheer, city transition SFX). Vizuelni identitet Kluboslavija/Guncati je prisutan i coherent.

---

## Zaključak

Turneja Planer ima solidne temelje: clean UX flow, 40 kartica sa karakterom, 4 endings sa narrativom, prestige loop, audio. Tehnički ne crash-uje. Ali ekonomija ima dve rupe na dnu — budžet se nikad ne puni (C1) i putni troškovi su obećani ali ne naplaćeni (C2). Oba fixa su lokalni, ne zahtevaju redesign: C1 je jedan `revenue` blok u `computeCityResults`, C2 je jedno oduzimanje u `route_selected` handleru. Posle tih dvaju fixa, game economy postaje funkcionalna. M1 i M2 su UX polish drugog reda. Preporučujem fix C1+C2+M1+M2 pre release-a.

**Fix prioritet za KORAK 6:**
1. C1 — revenue u `computeCityResults` (`src/main.js`)
2. C2 — oduzmi `calcRouteCost` u `on('route_selected')` (`src/main.js`)
3. M1 — `available = budget - crew_cost` u `renderCityBudget` (`src/render.js`)
4. M2 — pozovi `checkGuncatiGate` u `doTransit` kad je sledeći grad Guncati (`src/main.js`)
5. L1 — briši dead code endings.js:95
